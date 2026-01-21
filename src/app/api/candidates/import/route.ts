import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';
import type { User } from '@/types';
import type { CandidateStage } from '@/lib/db';

// Map CSV stage values to database stage values
function mapStageToDb(csvStage: string): CandidateStage {
  const stageMap: Record<string, CandidateStage> = {
    'new application': 'screening',
    'screening': 'screening',
    'interview 1': 'interview_1',
    'interview_1': 'interview_1',
    'interview 2': 'interview_2',
    'interview_2': 'interview_2',
    'under review': 'under_review',
    'under_review': 'under_review',
    'probation': 'probation',
    'hired': 'hired',
    'rejected': 'rejected',
  };

  const normalized = csvStage.toLowerCase().trim();
  return stageMap[normalized] || 'screening';
}

// Parse CSV content - handles quoted fields with commas
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // Parse header - handle the weird format with nested quotes
  const headerLine = lines[0];
  let headers: string[] = [];

  // Check if it's the weird format with all columns in one quoted string
  if (headerLine.startsWith('"') && headerLine.includes('","')) {
    // Format: "Candidate name,""IQ"",""MBTi"",..."
    const cleanHeader = headerLine.replace(/^"|"$/g, '').replace(/""/g, '"');
    headers = cleanHeader.split(',').map(h => h.replace(/^"|"$/g, '').trim());
  } else {
    headers = headerLine.split(',').map(h => h.replace(/^"|"$/g, '').trim());
  }

  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    let values: string[] = [];

    // Check if it's the weird format
    if (line.startsWith('"') && line.includes('","')) {
      // Format: "Value1,""Value2"",""Value3"",..."
      const cleanLine = line.replace(/^"|"$/g, '').replace(/""/g, '"');
      values = cleanLine.split(',').map(v => v.replace(/^"|"$/g, '').trim());
    } else {
      values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim());
    }

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    results.push(row);
  }

  return results;
}

// POST /api/candidates/import - Bulk import candidates from CSV
export const POST = withAuth(async (request: NextRequest, context: { user: User }) => {
  try {
    if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const content = await file.text();
    const rows = parseCSV(content);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No data found in CSV' }, { status: 400 });
    }

    // Map CSV rows to candidate records
    const candidates = rows.map(row => {
      // Try different possible column names
      const name = row['Candidate name'] || row['Name'] || row['Full Name'] || row['full_name'] || '';
      const email = row['Candidate Email'] || row['Email'] || row['email'] || '';
      const iqStr = row['IQ'] || row['iq_score'] || row['IQ Score'] || '';
      const mbti = row['MBTi'] || row['MBTI'] || row['mbti_type'] || '';
      const role = row['Role'] || row['Applied Role'] || row['applied_role'] || row['Position'] || '';
      const stage = row['Stage'] || row['stage'] || 'screening';
      const about = row['About'] || row['about'] || row['Notes'] || '';

      // Parse IQ score
      let iqScore: number | null = null;
      if (iqStr) {
        const parsed = parseInt(iqStr);
        if (!isNaN(parsed)) iqScore = parsed;
      }

      // Clean MBTI type - extract just the 4-letter code
      let mbtiType: string | null = null;
      if (mbti) {
        const match = mbti.match(/[IE][NS][TF][JP]/i);
        if (match) mbtiType = match[0].toUpperCase();
      }

      // Generate placeholder email if empty
      const finalEmail = email || `${name.toLowerCase().replace(/\s+/g, '.')}@placeholder.local`;

      return {
        full_name: name.trim(),
        email: finalEmail.trim(),
        iq_score: iqScore,
        mbti_type: mbtiType,
        applied_role: role.trim() || 'Unknown',
        stage: mapStageToDb(stage),
        about: about.trim() || null,
        checklist: [],
        source: 'CSV Import',
      };
    }).filter(c => c.full_name); // Filter out empty rows

    if (candidates.length === 0) {
      return NextResponse.json({ error: 'No valid candidates found in CSV' }, { status: 400 });
    }

    // Insert candidates in batches
    const batchSize = 50;
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < candidates.length; i += batchSize) {
      const batch = candidates.slice(i, i + batchSize);

      const { data, error } = await supabaseAdmin
        .from('candidates')
        .insert(batch)
        .select();

      if (error) {
        // Check for duplicate errors and try inserting one by one
        for (const candidate of batch) {
          const { error: singleError } = await supabaseAdmin
            .from('candidates')
            .insert(candidate)
            .select();

          if (singleError) {
            if (singleError.message.includes('duplicate') || singleError.message.includes('unique')) {
              skipped++;
            } else {
              errors.push(`${candidate.full_name}: ${singleError.message}`);
            }
          } else {
            imported++;
          }
        }
      } else {
        imported += data?.length || batch.length;
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: candidates.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // Limit errors shown
    });
  } catch (error) {
    console.error('Error importing candidates:', error);
    return NextResponse.json({ error: 'Failed to import candidates' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECRUITMENT_MANAGE });
