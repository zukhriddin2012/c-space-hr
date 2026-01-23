import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';
import jsPDF from 'jspdf';

interface DocumentData {
  id: string;
  candidate_id: string;
  document_type: string;
  candidate_name: string;
  position: string;
  branch_name: string;
  branch_address: string;
  reporting_to: string;
  screening_passed: boolean;
  interview1_passed: boolean;
  interview2_passed: boolean;
  contract_type: string;
  contract_duration: string;
  start_date: string;
  salary: string;
  salary_review: string;
  probation_duration: string;
  probation_start_date: string;
  probation_end_date: string;
  working_hours: string;
  probation_salary: string;
  probation_metrics: { metric: string; expected_result: string }[];
  final_interview_date: string;
  final_interview_time: string;
  final_interview_interviewer: string;
  final_interview_purpose: string;
  onboarding_weeks: { week: number; title: string; date_range: string; items: string[] }[];
  contacts: { name: string; position: string; responsibility: string }[];
  escalation_contact: string;
  escalation_contact_position: string;
  representative_name: string;
  representative_position: string;
  signed_at: string;
  signature_data: string;
  signature_type: string;
  created_at: string;
}

function formatDate(dateString: string): string {
  if (!dateString) return 'Не указано';
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// GET - Generate PDF for signed document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    // Fetch document with all fields
    const { data: doc, error } = await supabaseAdmin!
      .from('candidate_documents')
      .select('*')
      .eq('signing_token', token)
      .single();

    if (error || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if document is signed
    if (!doc.signed_at) {
      return NextResponse.json({ error: 'Document has not been signed yet' }, { status: 400 });
    }

    const document: DocumentData = {
      id: doc.id,
      candidate_id: doc.candidate_id,
      document_type: doc.document_type || 'Условия трудоустройства',
      candidate_name: doc.candidate_name || 'Unknown',
      position: doc.position || '',
      branch_name: doc.branch_name || '',
      branch_address: doc.branch_address || '',
      reporting_to: doc.reporting_to || '',
      screening_passed: doc.screening_passed ?? true,
      interview1_passed: doc.interview1_passed ?? true,
      interview2_passed: doc.interview2_passed ?? false,
      contract_type: doc.contract_type || '',
      contract_duration: doc.contract_duration || '',
      start_date: doc.start_date || '',
      salary: doc.salary || '',
      salary_review: doc.salary_review || '',
      probation_duration: doc.probation_duration || '',
      probation_start_date: doc.probation_start_date || '',
      probation_end_date: doc.probation_end_date || '',
      working_hours: doc.working_hours || '',
      probation_salary: doc.probation_salary || '',
      probation_metrics: doc.probation_metrics || [],
      final_interview_date: doc.final_interview_date || '',
      final_interview_time: doc.final_interview_time || '',
      final_interview_interviewer: doc.final_interview_interviewer || '',
      final_interview_purpose: doc.final_interview_purpose || '',
      onboarding_weeks: doc.onboarding_weeks || [],
      contacts: doc.contacts || [],
      escalation_contact: doc.escalation_contact || '',
      escalation_contact_position: doc.escalation_contact_position || '',
      representative_name: doc.representative_name || '',
      representative_position: doc.representative_position || '',
      signed_at: doc.signed_at,
      signature_data: doc.signature_data || '',
      signature_type: doc.signature_type || 'typed',
      created_at: doc.created_at,
    };

    // Generate PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Brand color
    const brandColor = { r: 100, g: 23, b: 124 }; // #64177C

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
      const lines = pdf.splitTextToSize(text, maxWidth);
      lines.forEach((line: string, index: number) => {
        if (y + lineHeight > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(line, x, y + index * lineHeight);
      });
      return y + lines.length * lineHeight;
    };

    // Helper to check and add new page if needed
    const checkPageBreak = (requiredHeight: number): void => {
      if (y + requiredHeight > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }
    };

    // === HEADER ===
    pdf.setFillColor(brandColor.r, brandColor.g, brandColor.b);
    pdf.rect(0, 0, pageWidth, 45, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text('Условия трудоустройства', margin, 15);

    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('УСЛОВИЯ ТРУДОУСТРОЙСТВА', margin, 25);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Должность: ${document.position}`, margin, 35);

    if (document.branch_name) {
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255, 0.7);
      pdf.text(`Филиал ${document.branch_name}`, margin, 42);
    }

    y = 55;
    pdf.setTextColor(0, 0, 0);

    // === SECTION 1: Candidate Info ===
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(brandColor.r, brandColor.g, brandColor.b);
    pdf.text('1. Информация о кандидате', margin, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);

    const candidateInfo = [
      ['ФИО', document.candidate_name],
      ['Должность', document.position],
      ['Филиал', document.branch_name],
      ['Подчинение', document.reporting_to],
    ];

    candidateInfo.forEach(([label, value]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${label}:`, margin, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(value || '-', margin + 35, y);
      y += 6;
    });
    y += 5;

    // === SECTION 2: Selection Results ===
    checkPageBreak(30);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(brandColor.r, brandColor.g, brandColor.b);
    pdf.text('2. Результаты отбора', margin, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);

    const selectionResults = [
      ['Скрининг', document.screening_passed ? 'ПРОЙДЕН' : 'НЕ ПРОЙДЕН'],
      ['Интервью 1', document.interview1_passed ? 'ПРОЙДЕН' : 'НЕ ПРОЙДЕН'],
    ];

    if (document.interview2_passed) {
      selectionResults.push(['Интервью 2', 'ПРОЙДЕН']);
    }

    selectionResults.forEach(([stage, result]) => {
      pdf.setFont('helvetica', 'normal');
      pdf.text(stage, margin, y);
      if (result === 'ПРОЙДЕН') {
        pdf.setTextColor(34, 197, 94); // green
      } else {
        pdf.setTextColor(239, 68, 68); // red
      }
      pdf.setFont('helvetica', 'bold');
      pdf.text(result, margin + 50, y);
      pdf.setTextColor(0, 0, 0);
      y += 6;
    });
    y += 5;

    // === SECTION 3: Employment Terms ===
    checkPageBreak(40);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(brandColor.r, brandColor.g, brandColor.b);
    pdf.text('3. Условия трудоустройства', margin, y);
    y += 5;

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);

    const isProbation = document.document_type === 'probation_term_sheet';
    pdf.text(isProbation ? 'Испытательный срок' : 'Полная занятость (при успешном прохождении)', margin, y);
    y += 8;

    pdf.setTextColor(0, 0, 0);

    let employmentTerms;
    if (isProbation) {
      employmentTerms = [
        ['Продолжительность', document.probation_duration],
        ['Дата начала', formatDate(document.probation_start_date)],
        ['Дата окончания', formatDate(document.probation_end_date)],
        ['Рабочие часы', document.working_hours],
        ['Зарплата (испыт. срок)', document.probation_salary],
      ];
    } else {
      employmentTerms = [
        ['Тип договора', document.contract_type],
        ['Дата вступления в силу', formatDate(document.start_date)],
        ['Ежемесячная зарплата', `${document.salary} сум (на руки)`],
        ['Пересмотр зарплаты', document.salary_review],
      ];
    }

    employmentTerms.forEach(([label, value]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${label}:`, margin, y);
      pdf.setFont('helvetica', 'normal');
      const valueX = margin + 55;
      if (label.includes('Зарплата') || label.includes('зарплата')) {
        pdf.setTextColor(brandColor.r, brandColor.g, brandColor.b);
        pdf.setFont('helvetica', 'bold');
      }
      pdf.text(value || '-', valueX, y);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      y += 6;
    });
    y += 5;

    // === SECTION 4: Probation Metrics ===
    if (document.probation_metrics && document.probation_metrics.length > 0) {
      checkPageBreak(30 + document.probation_metrics.length * 12);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(brandColor.r, brandColor.g, brandColor.b);
      pdf.text('4. Критерии оценки испытательного срока', margin, y);
      y += 8;

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);

      // Table header
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, y - 3, contentWidth, 8, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.text('Метрика', margin + 2, y + 2);
      pdf.text('Ожидаемый результат', margin + 80, y + 2);
      y += 10;

      pdf.setFont('helvetica', 'normal');
      document.probation_metrics.forEach((metric) => {
        checkPageBreak(12);
        const metricLines = pdf.splitTextToSize(metric.metric, 75);
        const resultLines = pdf.splitTextToSize(metric.expected_result, 75);
        const maxLines = Math.max(metricLines.length, resultLines.length);

        metricLines.forEach((line: string, i: number) => {
          pdf.text(line, margin + 2, y + i * 5);
        });
        resultLines.forEach((line: string, i: number) => {
          pdf.text(line, margin + 80, y + i * 5);
        });

        y += maxLines * 5 + 3;
      });
      y += 5;
    }

    // === SECTION 5: Final Interview ===
    if (document.final_interview_date) {
      checkPageBreak(35);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(brandColor.r, brandColor.g, brandColor.b);
      pdf.text('5. Финальное интервью и утверждение', margin, y);
      y += 8;

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);

      pdf.setFillColor(245, 240, 250);
      pdf.rect(margin, y - 2, contentWidth, 28, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.text('ДЕТАЛИ ФИНАЛЬНОГО ИНТЕРВЬЮ', margin + 2, y + 3);
      y += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.text(`Дата: ${formatDate(document.final_interview_date)}`, margin + 2, y);
      y += 5;
      pdf.text(`Время: ${document.final_interview_time}`, margin + 2, y);
      y += 5;
      pdf.text(`Интервьюер: ${document.final_interview_interviewer}`, margin + 2, y);
      y += 5;
      pdf.text(`Цель: ${document.final_interview_purpose}`, margin + 2, y);
      y += 12;
    }

    // === SECTION 6: Onboarding ===
    if (document.onboarding_weeks && document.onboarding_weeks.length > 0) {
      checkPageBreak(20);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(brandColor.r, brandColor.g, brandColor.b);
      pdf.text(`6. Обзор адаптации (филиал ${document.branch_name})`, margin, y);
      y += 8;

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);

      document.onboarding_weeks.forEach((week) => {
        checkPageBreak(15 + week.items.length * 6);

        pdf.setFont('helvetica', 'bold');
        pdf.text(`${week.title} (${week.date_range})`, margin, y);
        y += 6;

        pdf.setFont('helvetica', 'normal');
        week.items.forEach((item, idx) => {
          const itemText = `${idx + 1}. ${item}`;
          y = addWrappedText(itemText, margin + 5, y, contentWidth - 5, 5);
        });
        y += 3;
      });
      y += 5;
    }

    // === SECTION 7: Contacts ===
    if (document.contacts && document.contacts.length > 0) {
      checkPageBreak(25 + document.contacts.length * 8);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(brandColor.r, brandColor.g, brandColor.b);
      pdf.text('7. Контактные лица', margin, y);
      y += 8;

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);

      // Table header
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, y - 3, contentWidth, 8, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.text('Имя', margin + 2, y + 2);
      pdf.text('Должность', margin + 50, y + 2);
      pdf.text('Зона ответственности', margin + 100, y + 2);
      y += 10;

      pdf.setFont('helvetica', 'normal');
      document.contacts.forEach((contact) => {
        checkPageBreak(8);
        pdf.text(contact.name, margin + 2, y);
        pdf.setTextColor(brandColor.r, brandColor.g, brandColor.b);
        pdf.text(contact.position, margin + 50, y);
        pdf.setTextColor(0, 0, 0);
        pdf.text(contact.responsibility, margin + 100, y);
        y += 6;
      });

      // Escalation contact
      if (document.escalation_contact) {
        y += 3;
        pdf.setFillColor(254, 249, 195); // yellow background
        pdf.rect(margin, y - 2, contentWidth, 12, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.text('ЭСКАЛАЦИЯ ВОПРОСОВ', margin + 2, y + 3);
        y += 7;
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${document.escalation_contact} (${document.escalation_contact_position})`, margin + 2, y);
        y += 10;
      }
      y += 5;
    }

    // === SECTION 8: Signatures ===
    checkPageBreak(60);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(brandColor.r, brandColor.g, brandColor.b);
    pdf.text('8. Подтверждение и подписи', margin, y);
    y += 8;

    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Подписывая ниже, обе стороны подтверждают и соглашаются с условиями, изложенными в данном документе.', margin, y);
    y += 10;

    // Signature boxes
    const boxWidth = (contentWidth - 10) / 2;
    const signatureBoxHeight = 45;

    // Candidate signature box
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(250, 250, 250);
    pdf.rect(margin, y, boxWidth, signatureBoxHeight, 'FD');

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(brandColor.r, brandColor.g, brandColor.b);
    pdf.text('КАНДИДАТ', margin + 5, y + 8);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`ФИО: ${document.candidate_name}`, margin + 5, y + 16);

    // Add signature
    pdf.text('Подпись:', margin + 5, y + 24);

    if (document.signature_type === 'draw' && document.signature_data) {
      // Draw signature image
      try {
        pdf.addImage(document.signature_data, 'PNG', margin + 25, y + 18, 40, 15);
      } catch (e) {
        console.error('Error adding signature image:', e);
        pdf.text('[Подпись]', margin + 25, y + 28);
      }
    } else if (document.signature_type === 'typed' && document.signature_data) {
      try {
        const sigData = JSON.parse(document.signature_data);
        const fontStyle = sigData.style === 1 ? 'italic' : sigData.style === 2 ? 'normal' : 'bold';
        pdf.setFont('helvetica', fontStyle);
        pdf.setFontSize(14);
        pdf.text(sigData.name, margin + 25, y + 28);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
      } catch (e) {
        pdf.text('[Подпись]', margin + 25, y + 28);
      }
    }

    pdf.text(`Дата: ${formatDate(document.signed_at)}`, margin + 5, y + 40);

    // Representative signature box
    const repBoxX = margin + boxWidth + 10;
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(250, 250, 250);
    pdf.rect(repBoxX, y, boxWidth, signatureBoxHeight, 'FD');

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(brandColor.r, brandColor.g, brandColor.b);
    pdf.text('ПРЕДСТАВИТЕЛЬ C-SPACE', repBoxX + 5, y + 8);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`ФИО: ${document.representative_name || '_________________'}`, repBoxX + 5, y + 16);
    pdf.text('Подпись: _________________', repBoxX + 5, y + 24);
    pdf.text('Дата: _________________', repBoxX + 5, y + 40);

    y += signatureBoxHeight + 15;

    // === FOOTER ===
    checkPageBreak(25);
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Right People. Right Place.', pageWidth / 2, y, { align: 'center' });
    y += 5;

    if (document.branch_address) {
      pdf.setFontSize(8);
      pdf.text(`${document.branch_name} | ${document.branch_address}`, pageWidth / 2, y, { align: 'center' });
      y += 4;
    }

    pdf.setFontSize(8);
    pdf.text('Конфиденциально | C-Space Coworking', pageWidth / 2, y, { align: 'center' });

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    // Return PDF response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="term-sheet-${document.candidate_name.replace(/\s+/g, '-')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
