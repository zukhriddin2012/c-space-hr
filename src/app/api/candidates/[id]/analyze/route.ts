import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';
import type { User } from '@/types';

const STORAGE_BUCKET = 'employee-documents';

interface AIAnalysisResult {
  summary: string;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  experience: {
    total_years: number;
    companies: {
      name: string;
      role: string;
      duration: string;
      highlights: string[];
    }[];
  };
  education: {
    degree: string;
    institution: string;
    year: string;
    field: string;
  }[];
  role_fit: {
    score: number;
    strengths: string[];
    gaps: string[];
    recommendation: string;
  };
  values_fit: {
    overall_score: number;
    do_the_right_thing: { score: number; evidence: string };
    all_in: { score: number; evidence: string };
    innovate: { score: number; evidence: string };
    radical_transparency: { score: number; evidence: string };
    architects_not_firefighters: { score: number; evidence: string };
    culture_recommendation: string;
  };
  red_flags: string[];
  interview_questions: {
    question: string;
    purpose: string;
  }[];
  company_research: {
    company: string;
    industry: string;
    insights: string;
  }[];
  analyzed_at: string;
}

// Analyze resume with Claude API - send PDF directly
async function analyzeWithClaude(
  pdfBase64: string,
  candidateInfo: {
    full_name: string;
    applied_role: string;
    email: string;
    about?: string;
  }
): Promise<AIAnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === 'your-anthropic-api-key-here') {
    throw new Error('Anthropic API key not configured');
  }

  const systemPrompt = `You are an expert HR analyst and recruiter for C-Space, a premium coworking and serviced office company based in Tashkent, Uzbekistan.

=== ABOUT C-SPACE ===
PURPOSE: "We create the right environment so that the right people feel empowered"
WHAT WE SELL: Productivity, Success, and Belonging through a hassle-free workspace ecosystem
TARGET CUSTOMERS: Growing SMEs and local corporations in Uzbekistan/Central Asia
BRAND PROMISES: Hotel Quality Hospitality, Right Community, Location Roaming
ONE-PHRASE STRATEGY: Vertical Integration
X-FACTOR: 6-Day Decision (10x faster than industry standard)
BHAG (Big Hairy Audacious Goal): 1,200 Partnerships by December 2040

=== C-SPACE CORE VALUES ===
Evaluate candidates against these 5 core values:

1. DO THE RIGHT THING
- Acting with integrity even when no one is watching
- Taking responsibility for mistakes and fixing them
- Making decisions that benefit long-term success over short-term gains
- Being honest in all communications
- Interview indicators: History of ethical decision-making, owning mistakes, prioritizing quality

2. ALL IN
- Full commitment and dedication to work
- Going above and beyond basic requirements
- Showing passion and energy in everything they do
- Being reliable and following through on commitments
- Interview indicators: Evidence of extra effort, passion projects, reliability track record

3. INNOVATE
- Continuously seeking better ways to do things
- Embracing change and new technologies
- Solving problems creatively
- Learning from failures and iterating
- Interview indicators: Examples of process improvements, creative solutions, adaptability

4. RADICAL TRANSPARENCY
- Open and honest communication at all times
- Sharing information freely with team members
- Giving and receiving constructive feedback
- Admitting when they don't know something
- Interview indicators: Direct communication style, comfort with feedback, honesty about weaknesses

5. ARCHITECTS NOT FIREFIGHTERS
- Proactively preventing problems rather than just reacting
- Building systems and processes for long-term success
- Thinking strategically about consequences
- Planning ahead and anticipating challenges
- Interview indicators: Strategic thinking, process creation, preventive approaches

=== DIFFERENTIATING ACTIVITIES ===
C-Space's unique approaches that candidates should align with:
- Curated Resident Selection: Quality community over quantity
- Resident Financial Partnership: Long-term relationship focus
- Design Standards: Premium, productivity-first environments
- Productivity-First Environment: Everything optimized for focus and output
- Strategic Partnership Expansion: Growth through partnerships

=== YOUR TASK ===
Analyze resumes and provide comprehensive insights for C-Space's HR team:
1. Extract key information (skills, experience, education)
2. Research the companies mentioned to understand the candidate's background
3. Evaluate fit for the applied role at C-Space
4. Assess alignment with C-Space's 5 core values based on resume evidence
5. Identify any red flags or concerns
6. Generate targeted interview questions (including values-based questions)

For values assessment, look for:
- Past behaviors and achievements that demonstrate each value
- Work history patterns (stability, growth, impact)
- Language used to describe accomplishments
- Types of roles and responsibilities held

Always be objective, thorough, and provide actionable insights specific to C-Space's culture.
Respond ONLY with valid JSON matching the required structure. Do not include any markdown code blocks or extra text.`;

  const userPrompt = `Analyze this resume PDF for a candidate applying for the "${candidateInfo.applied_role}" position at C-Space.

CANDIDATE INFO:
- Name: ${candidateInfo.full_name}
- Email: ${candidateInfo.email}
- Applied Role: ${candidateInfo.applied_role}
${candidateInfo.about ? `- About: ${candidateInfo.about}` : ''}

Provide a comprehensive analysis in the following JSON structure (respond with ONLY the JSON, no markdown):
{
  "summary": "2-3 sentence overview of the candidate and their potential fit at C-Space",
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "languages": ["language1 (proficiency)"]
  },
  "experience": {
    "total_years": 5,
    "companies": [
      {
        "name": "Company Name",
        "role": "Job Title",
        "duration": "2 years 3 months",
        "highlights": ["achievement1", "achievement2"]
      }
    ]
  },
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University/School",
      "year": "2020",
      "field": "Field of study"
    }
  ],
  "role_fit": {
    "score": 75,
    "strengths": ["strength1", "strength2"],
    "gaps": ["gap1", "gap2"],
    "recommendation": "Your hiring recommendation for this role at C-Space"
  },
  "values_fit": {
    "overall_score": 75,
    "do_the_right_thing": {
      "score": 80,
      "evidence": "Specific evidence from resume showing integrity, ethics, responsibility"
    },
    "all_in": {
      "score": 70,
      "evidence": "Evidence of commitment, going above and beyond, passion"
    },
    "innovate": {
      "score": 85,
      "evidence": "Examples of creativity, problem-solving, embracing change"
    },
    "radical_transparency": {
      "score": 65,
      "evidence": "Indicators of open communication, feedback orientation"
    },
    "architects_not_firefighters": {
      "score": 75,
      "evidence": "Evidence of proactive planning, system building, strategic thinking"
    },
    "culture_recommendation": "Overall assessment of cultural fit at C-Space based on values alignment"
  },
  "red_flags": ["Any concerns or inconsistencies"],
  "interview_questions": [
    {
      "question": "Interview question (include C-Space values-based questions)",
      "purpose": "What this question helps assess (reference specific C-Space value if applicable)"
    }
  ],
  "company_research": [
    {
      "company": "Company name from resume",
      "industry": "Industry sector",
      "insights": "Brief insight about this company and how experience there relates to C-Space"
    }
  ]
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64,
              },
            },
            {
              type: 'text',
              text: userPrompt,
            },
          ],
        },
      ],
      system: systemPrompt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Claude API error:', response.status, errorText);
    throw new Error(`Claude API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const content = result.content[0]?.text;

  if (!content) {
    throw new Error('No response from Claude API');
  }

  // Parse the JSON response
  try {
    // Extract JSON from the response (in case there's extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const analysis = JSON.parse(jsonMatch[0]) as Omit<AIAnalysisResult, 'analyzed_at'>;
    return {
      ...analysis,
      analyzed_at: new Date().toISOString(),
    };
  } catch (parseError) {
    console.error('Failed to parse Claude response:', content);
    throw new Error('Failed to parse AI analysis response');
  }
}

// POST /api/candidates/[id]/analyze - Analyze resume with AI
export const POST = withAuth(async (
  request: NextRequest,
  context: { user: User; params?: Record<string, string> }
) => {
  try {
    if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const id = context.params?.id;
    if (!id) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    // Get candidate details
    const { data: candidate, error: fetchError } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    if (!candidate.resume_file_path) {
      return NextResponse.json({ error: 'No resume file uploaded for this candidate' }, { status: 400 });
    }

    // Download the resume file
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .download(candidate.resume_file_path);

    if (downloadError || !fileData) {
      console.error('Error downloading resume:', downloadError);
      return NextResponse.json({ error: 'Failed to download resume file' }, { status: 500 });
    }

    // Check file type
    const fileName = candidate.resume_file_name?.toLowerCase() || '';
    if (!fileName.endsWith('.pdf')) {
      return NextResponse.json({
        error: 'Only PDF files are supported for AI analysis. Please upload a PDF resume.'
      }, { status: 400 });
    }

    // Convert to base64
    const buffer = Buffer.from(await fileData.arrayBuffer());
    const pdfBase64 = buffer.toString('base64');

    // Analyze with Claude - send PDF directly
    const analysis = await analyzeWithClaude(pdfBase64, {
      full_name: candidate.full_name,
      applied_role: candidate.applied_role,
      email: candidate.email,
      about: candidate.about || undefined,
    });

    // Store the analysis in the database
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('candidates')
      .update({
        ai_analysis: analysis,
        ai_analyzed_at: analysis.analyzed_at,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('ai_analysis, ai_analyzed_at')
      .single();

    if (updateError) {
      console.error('Error storing analysis:', updateError);
      return NextResponse.json({
        success: true,
        analysis,
        warning: `Analysis completed but failed to save: ${updateError.message}`,
        saveError: updateError.message,
      });
    }

    console.log('Analysis saved successfully:', updateData?.ai_analyzed_at);

    return NextResponse.json({
      success: true,
      analysis,
      saved: true,
    });

  } catch (error) {
    console.error('Error analyzing resume:', error);
    const message = error instanceof Error ? error.message : 'Failed to analyze resume';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECRUITMENT_MANAGE });

// GET /api/candidates/[id]/analyze - Get existing analysis
export const GET = withAuth(async (
  request: NextRequest,
  context: { user: User; params?: Record<string, string> }
) => {
  try {
    if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const id = context.params?.id;
    if (!id) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    const { data: candidate, error: fetchError } = await supabaseAdmin
      .from('candidates')
      .select('ai_analysis, ai_analyzed_at')
      .eq('id', id)
      .single();

    if (fetchError || !candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    if (!candidate.ai_analysis) {
      return NextResponse.json({
        analyzed: false,
        message: 'No AI analysis available for this candidate'
      });
    }

    return NextResponse.json({
      analyzed: true,
      analysis: candidate.ai_analysis,
      analyzed_at: candidate.ai_analyzed_at,
    });

  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json({ error: 'Failed to fetch analysis' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECRUITMENT_VIEW });
