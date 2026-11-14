import { CHAPTERS } from '../data/curriculum';
import {
  Chapter,
  PlayerProgress,
  SkillNode,
  StageCertificateMeta,
  StudentRegistration,
} from '../types/app';

export interface CertificateDisciplineItem {
  chapterNumber: number;
  chapterTitle: string;
  nodeId: string;
  nodeTitle: string;
  scorePct: number;
  questions: string[];
}

export interface CertificateReport {
  meta: StageCertificateMeta;
  isUnlocked: boolean;
  bonusClaimed: boolean;
  completedNodesCount: number;
  totalNodesCount: number;
  averageScorePct: number;
  gradeLabel: string;
  totalQuestionsCount: number;
  serialNumber: string;
  issuedDate: string;
  disciplines: CertificateDisciplineItem[];
}

export function getGradeLabel(scorePct: number): string {
  if (scorePct >= 90) return '5 (Отлично)';
  if (scorePct >= 75) return '4 (Хорошо)';
  return 'Зачтено';
}

function getNodesForCertificate(meta: StageCertificateMeta): { chapter: Chapter; node: SkillNode }[] {
  if (meta.chapterId === 'all') {
    return CHAPTERS.flatMap((ch) => ch.nodes.map((node) => ({ chapter: ch, node })));
  }
  const ch = CHAPTERS.find((c) => c.id === meta.chapterId);
  if (!ch) return [];
  return ch.nodes.map((node) => ({ chapter: ch, node }));
}

function makeSerialNumber(certId: string, fullName: string): string {
  const cleanId = certId.replace('cert-', '').toUpperCase();
  let hash = 0;
  const seed = `${certId}:${fullName || 'STUDENT'}`;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const suffix = (hash % 9000 + 1000).toString(16).toUpperCase().padStart(4, '0');
  return `NC-2026-${cleanId}-${suffix}`;
}

export function buildCertificateReport(
  meta: StageCertificateMeta,
  progress: PlayerProgress
): CertificateReport {
  const pairs = getNodesForCertificate(meta);
  const completedPairs = pairs.filter(({ node }) =>
    progress.completedNodeIds.includes(node.id)
  );
  const isUnlocked = pairs.length > 0 && completedPairs.length === pairs.length;
  const bonusClaimed = progress.claimedStageIds.includes(meta.chapterId);

  const disciplines: CertificateDisciplineItem[] = pairs.map(({ chapter, node }) => {
    const scoreRecord = progress.nodeScores[node.id];
    const done = progress.completedNodeIds.includes(node.id);
    const scorePct = scoreRecord?.scorePct ?? (done ? 90 : 0);
    return {
      chapterNumber: chapter.number,
      chapterTitle: chapter.title,
      nodeId: node.id,
      nodeTitle: node.title,
      scorePct,
      questions: node.quiz.map((q) => q.prompt),
    };
  });

  const scored = disciplines.filter((d) => progress.completedNodeIds.includes(d.nodeId));
  const averageScorePct =
    scored.length > 0
      ? Math.round(scored.reduce((acc, d) => acc + d.scorePct, 0) / scored.length)
      : 0;

  const totalQuestionsCount = pairs.reduce((acc, p) => acc + p.node.quiz.length, 0);
  const fullName = progress.registration?.fullName ?? 'Student';

  return {
    meta,
    isUnlocked,
    bonusClaimed,
    completedNodesCount: completedPairs.length,
    totalNodesCount: pairs.length,
    averageScorePct,
    gradeLabel: getGradeLabel(averageScorePct),
    totalQuestionsCount,
    serialNumber: makeSerialNumber(meta.id, fullName),
    issuedDate: new Date().toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    disciplines,
  };
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function downloadCertificatePng(
  report: CertificateReport,
  registration: StudentRegistration
) {
  const allQuestions = report.disciplines.flatMap((d) =>
    d.questions.map((q) => `[${d.nodeTitle}] ${q}`)
  );
  // Show up to 14 questions cleanly on the certificate image (or grouped summary for full 63-question diploma)
  const isFullDiploma = report.meta.chapterId === 'all';

  const width = 1600;
  const height = isFullDiploma ? 1320 : 1240;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#0B0F19';
  ctx.fillRect(0, 0, width, height);

  // Accent top gradient bar
  const grad = ctx.createLinearGradient(0, 0, width, 0);
  grad.addColorStop(0, '#06B6D4');
  grad.addColorStop(0.5, '#8B5CF6');
  grad.addColorStop(1, '#10B981');
  ctx.fillStyle = grad;
  ctx.fillRect(40, 40, width - 80, 8);

  // Outer Frame
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(56, 56, width - 112, height - 112);

  // Header
  ctx.fillStyle = '#4CD7F6';
  ctx.font = 'bold 26px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('NEUROCRAFT ACADEMY · СЕРТИФИКАТ ПОДТВЕРЖДЕНИЯ НАВЫКОВ', 96, 118);

  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`№ ${report.serialNumber}`, width - 96, 118);
  ctx.textAlign = 'left';

  // Main Qualification & Student Name
  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Настоящим подтверждается, что', 96, 184);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = '800 54px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(registration.fullName, 96, 246);

  const subMeta = [
    registration.email,
    registration.location ? registration.location : null,
    registration.specialty ? registration.specialty : null,
  ]
    .filter(Boolean)
    .join('  ·  ');

  ctx.fillStyle = '#94A3B8';
  ctx.font = '500 20px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(subMeta, 96, 286);

  // Stage Title
  ctx.fillStyle = '#D0BCFF';
  ctx.font = '700 24px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(report.meta.qualification.toUpperCase(), 96, 350);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = '800 36px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
  const titleLines = wrapCanvasText(ctx, report.meta.title, width - 480);
  let cursorY = 398;
  for (const l of titleLines) {
    ctx.fillText(l, 96, cursorY);
    cursorY += 44;
  }

  // Score Seal Box on right
  ctx.fillStyle = '#111827';
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 2.5;
  ctx.fillRect(width - 420, 326, 324, 150);
  ctx.strokeRect(width - 420, 326, 324, 150);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('ИТОГОВАЯ ОЦЕНКА', width - 392, 366);

  ctx.fillStyle = '#10B981';
  ctx.font = '800 48px "JetBrains Mono", monospace';
  ctx.fillText(`${report.averageScorePct}%`, width - 392, 422);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = '700 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(report.gradeLabel, width - 392, 456);

  // Disciplines Section
  let sectionY = Math.max(cursorY + 34, 515);
  ctx.fillStyle = '#4CD7F6';
  ctx.font = '700 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    `Изученные дисциплины и оценки (${report.disciplines.length} модулей):`,
    96,
    sectionY
  );
  sectionY += 20;

  if (isFullDiploma) {
    // Group by 7 chapters for full diploma
    const chaptersMap = new Map<number, { title: string; avg: number; count: number }>();
    for (const d of report.disciplines) {
      const prev = chaptersMap.get(d.chapterNumber);
      if (!prev) {
        chaptersMap.set(d.chapterNumber, { title: d.chapterTitle, avg: d.scorePct, count: 1 });
      } else {
        prev.avg += d.scorePct;
        prev.count += 1;
      }
    }
    let col = 0;
    let rowY = sectionY + 26;
    for (const [chNum, info] of chaptersMap.entries()) {
      const avg = Math.round(info.avg / info.count);
      const x = col === 0 ? 96 : 820;
      ctx.fillStyle = '#111827';
      ctx.fillRect(x, rowY - 24, 680, 42);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, rowY - 24, 680, 42);

      ctx.fillStyle = '#E2E8F0';
      ctx.font = '600 18px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(`Глава ${chNum}. ${info.title}`, x + 16, rowY + 3);

      ctx.fillStyle = '#10B981';
      ctx.font = '700 18px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${avg}%`, x + 664, rowY + 3);
      ctx.textAlign = 'left';

      if (col === 1) {
        col = 0;
        rowY += 54;
      } else {
        col = 1;
      }
    }
    sectionY = rowY + (col === 1 ? 64 : 20);
  } else {
    let rowY = sectionY + 26;
    for (const d of report.disciplines) {
      ctx.fillStyle = '#111827';
      ctx.fillRect(96, rowY - 26, width - 192, 46);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(96, rowY - 26, width - 192, 46);

      ctx.fillStyle = '#F8FAFC';
      ctx.font = '600 20px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(`• ${d.nodeTitle}`, 114, rowY + 3);

      ctx.fillStyle = '#10B981';
      ctx.font = '700 20px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${d.scorePct}% · ${getGradeLabel(d.scorePct)}`, width - 114, rowY + 3);
      ctx.textAlign = 'left';

      rowY += 58;
    }
    sectionY = rowY + 14;
  }

  // Studied Questions Section
  ctx.fillStyle = '#F59E0B';
  ctx.font = '700 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    `Перечень освоенных проверочных вопросов (${allQuestions.length} вопросов):`,
    96,
    sectionY
  );
  sectionY += 34;

  const maxLinesY = height - 140;
  ctx.font = '500 17px "Plus Jakarta Sans", system-ui, sans-serif';
  const listToRender = isFullDiploma
    ? report.disciplines.map(
        (d, idx) => `${idx + 1}. ${d.nodeTitle} (${d.questions.length} вопр.): ${d.questions[0]}`
      )
    : allQuestions.map((q, idx) => `${idx + 1}. ${q}`);

  for (const item of listToRender) {
    if (sectionY > maxLinesY) break;
    const wrapped = wrapCanvasText(ctx, item, width - 200);
    for (const wl of wrapped) {
      if (sectionY > maxLinesY) break;
      ctx.fillStyle = '#CBD5E1';
      ctx.fillText(wl, 96, sectionY);
      sectionY += 24;
    }
    sectionY += 4;
  }

  // Footer
  ctx.strokeStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(96, height - 108);
  ctx.lineTo(width - 96, height - 108);
  ctx.stroke();

  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(`Дата выдачи: ${report.issuedDate}`, 96, height - 74);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#4CD7F6';
  ctx.fillText('NeuroCraft · Создатель: Поставной Вячеслав Алексеевич', width - 96, height - 74);
  ctx.textAlign = 'left';

  const link = document.createElement('a');
  link.download = `NeuroCraft-Certificate-${report.meta.chapterId}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadCertificateHtml(
  report: CertificateReport,
  registration: StudentRegistration
) {
  const disciplinesHtml = report.disciplines
    .map(
      (d) => `
      <div class="module-card">
        <div class="module-head">
          <div>
            <div class="chapter-tag">Глава ${d.chapterNumber} · ${d.chapterTitle}</div>
            <h3>${d.nodeTitle}</h3>
          </div>
          <div class="grade-pill">${d.scorePct}% · ${getGradeLabel(d.scorePct)}</div>
        </div>
        <ol class="questions-list">
          ${d.questions.map((q) => `<li>${q}</li>`).join('')}
        </ol>
      </div>`
    )
    .join('');

  const html = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Сертификат NeuroCraft — ${registration.fullName}</title>
  <style>
    body { margin: 0; padding: 32px; background: #0B0F19; color: #F8FAFC; font-family: system-ui, -apple-system, sans-serif; }
    .sheet { max-width: 960px; margin: 0 auto; background: #111827; border: 2px solid #334155; border-radius: 20px; padding: 40px; }
    .top-bar { height: 6px; border-radius: 999px; background: linear-gradient(90deg, #06B6D4, #8B5CF6, #10B981); margin-bottom: 28px; }
    .header { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
    .brand { color: #4CD7F6; font-weight: 800; letter-spacing: 0.04em; font-size: 14px; text-transform: uppercase; }
    .serial { font-family: monospace; color: #94A3B8; font-size: 14px; }
    h1 { font-size: 36px; margin: 16px 0 6px; }
    .meta { color: #94A3B8; font-size: 14px; margin-bottom: 24px; }
    .hero-box { display: flex; justify-content: space-between; align-items: center; gap: 20px; background: #0B0F19; border: 1px solid #334155; border-radius: 14px; padding: 24px; margin-bottom: 28px; flex-wrap: wrap; }
    .qual { color: #D0BCFF; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .course-title { font-size: 22px; font-weight: 800; margin-top: 6px; }
    .score-box { text-align: right; }
    .score-val { font-family: monospace; font-size: 36px; font-weight: 800; color: #10B981; }
    .score-label { font-size: 14px; font-weight: 700; color: #E2E8F0; }
    .section-title { font-size: 16px; font-weight: 700; color: #4CD7F6; margin: 0 0 14px; }
    .module-card { background: #0B0F19; border: 1px solid #1E293B; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; }
    .module-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 10px; }
    .chapter-tag { font-size: 12px; color: #94A3B8; }
    .module-head h3 { margin: 2px 0 0; font-size: 16px; }
    .grade-pill { font-family: monospace; font-size: 13px; font-weight: 700; color: #10B981; background: rgba(16,185,129,0.12); padding: 6px 10px; border-radius: 8px; white-space: nowrap; }
    .questions-list { margin: 0; padding-left: 20px; color: #CBD5E1; font-size: 13px; line-height: 1.55; }
    .footer { display: flex; justify-content: space-between; border-top: 1px solid #1E293B; padding-top: 20px; margin-top: 24px; font-size: 13px; color: #94A3B8; }
    @media print {
      body { background: #FFFFFF; color: #0F172A; padding: 0; }
      .sheet { background: #FFFFFF; border-color: #CBD5E1; }
      .hero-box, .module-card { background: #F8FAFC; border-color: #CBD5E1; }
      .questions-list, .chapter-tag, .meta, .footer, .serial { color: #334155; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="top-bar"></div>
    <div class="header">
      <div class="brand">NeuroCraft AI Engineering Academy · Официальный сертификат</div>
      <div class="serial">№ ${report.serialNumber}</div>
    </div>
    <h1>${registration.fullName}</h1>
    <div class="meta">${registration.email}${registration.location ? ` · ${registration.location}` : ''}${registration.specialty ? ` · ${registration.specialty}` : ''}</div>

    <div class="hero-box">
      <div>
        <div class="qual">${report.meta.qualification}</div>
        <div class="course-title">${report.meta.title}</div>
      </div>
      <div class="score-box">
        <div class="score-val">${report.averageScorePct}%</div>
        <div class="score-label">Оценка: ${report.gradeLabel}</div>
      </div>
    </div>

    <h2 class="section-title">Изученные дисциплины, оценки и перечень пройденных вопросов (${report.totalQuestionsCount} вопросов)</h2>
    ${disciplinesHtml}

    <div class="footer">
      <span>Дата выдачи: ${report.issuedDate}</span>
      <span>NeuroCraft · Создатель программы: Поставной Вячеслав Алексеевич</span>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `NeuroCraft-Certificate-${report.meta.chapterId}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
