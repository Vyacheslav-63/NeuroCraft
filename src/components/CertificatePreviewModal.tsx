import { useState } from 'react';
import {
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Edit3,
  FileText,
  X,
} from 'lucide-react';
import { StudentRegistration } from '../types/app';
import {
  CertificateReport,
  downloadCertificateHtml,
  downloadCertificatePng,
  getGradeLabel,
} from '../utils/certificateGenerator';

interface Props {
  report: CertificateReport;
  registration: StudentRegistration;
  onEditRegistration: () => void;
  onClose: () => void;
}

export function CertificatePreviewModal({
  report,
  registration,
  onEditRegistration,
  onClose,
}: Props) {
  const [showAllQuestions, setShowAllQuestions] = useState(true);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleDownloadPng = () => {
    downloadCertificatePng(report, registration);
    setSavedNotice('Сертификат сохранён как изображение PNG.');
  };

  const handleDownloadHtml = () => {
    downloadCertificateHtml(report, registration);
    setSavedNotice('Полный документ с вопросами сохранён (HTML для печати/PDF).');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#070A12]/85 backdrop-blur-md p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={report.meta.title}
    >
      <div className="w-full max-w-2xl bg-[#111827] border border-[#334155]/80 rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5 min-w-0">
            <Award className="w-5 h-5 text-[#F59E0B] shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-[#F8FAFC] truncate">
                Предпросмотр сертификата
              </h2>
              <div className="font-mono text-[11px] text-[#94A3B8]">{report.serialNumber}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть сертификат"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Certificate Sheet */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Certificate Card */}
          <div className="rounded-2xl bg-[#0B0F19] border-2 border-[#334155] p-5 space-y-5 relative overflow-hidden">
            <div
              className="h-1.5 w-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #06B6D4 0%, #8B5CF6 50%, #10B981 100%)',
              }}
            />

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#4CD7F6]">
                  NeuroCraft Academy · {report.meta.qualification}
                </div>
                <h3 className="text-2xl font-extrabold text-[#F8FAFC]">{registration.fullName}</h3>
                <div className="text-xs text-[#94A3B8]">
                  {[registration.email, registration.location, registration.specialty]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
              </div>

              <div className="rounded-xl bg-[#111827] border border-[#10B981]/60 px-4 py-2.5 text-left sm:text-right shrink-0">
                <div className="text-[11px] text-[#94A3B8]">Итоговая оценка</div>
                <div className="font-mono text-2xl font-extrabold tabular-nums text-[#10B981]">
                  {report.averageScorePct}%
                </div>
                <div className="text-xs font-bold text-[#F8FAFC]">{report.gradeLabel}</div>
              </div>
            </div>

            <div className="rounded-xl bg-[#111827] border border-[#1E293B] p-3.5 space-y-1">
              <div className="text-xs text-[#94A3B8]">Пройденная программа</div>
              <div className="text-base font-bold text-[#F8FAFC]">{report.meta.title}</div>
              <div className="text-xs text-[#94A3B8]">
                Дата выдачи: {report.issuedDate} · Вопросов освоено: {report.totalQuestionsCount}
              </div>
            </div>

            {/* Disciplines & Grades */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#4CD7F6]">
                Изученные дисциплины и оценки ({report.disciplines.length})
              </div>
              <div className="space-y-2">
                {report.disciplines.map((d) => (
                  <div
                    key={d.nodeId}
                    className="rounded-xl bg-[#111827] border border-[#1E293B] p-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-[11px] text-[#94A3B8]">
                        Глава {d.chapterNumber} · {d.chapterTitle}
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-[#F8FAFC] truncate">
                        {d.nodeTitle}
                      </div>
                    </div>
                    <div className="font-mono text-xs font-bold tabular-nums text-[#10B981] shrink-0">
                      {d.scorePct}% · {getGradeLabel(d.scorePct)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expandable List of Studied Questions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAllQuestions((v) => !v)}
                className="w-full min-h-[40px] px-3 rounded-xl bg-[#111827] border border-[#334155] text-xs font-semibold text-[#E2E8F0] flex items-center justify-between"
              >
                <span>
                  Перечень изученных вопросов ({report.totalQuestionsCount})
                </span>
                {showAllQuestions ? (
                  <ChevronUp className="w-4 h-4 text-[#94A3B8]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
                )}
              </button>

              {showAllQuestions && (
                <div className="rounded-xl bg-[#111827] border border-[#1E293B] p-3.5 space-y-3 max-h-60 overflow-y-auto">
                  {report.disciplines.map((d) => (
                    <div key={d.nodeId} className="space-y-1">
                      <div className="text-xs font-bold text-[#D0BCFF]">{d.nodeTitle}</div>
                      <ul className="space-y-1 text-xs text-[#CBD5E1] pl-3">
                        {d.questions.map((q) => (
                          <li key={q} className="leading-snug">
                            • {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {savedNotice && (
            <div className="rounded-xl bg-[#10B981]/10 border border-[#10B981]/50 p-3 flex items-center gap-2 text-xs text-[#D1FAE5]">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>{savedNotice}</span>
            </div>
          )}
        </div>

        {/* Sticky Bottom Download Bar */}
        <div className="p-4 border-t border-[#1E293B] bg-[#0F131D] flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleDownloadPng}
            className="btn-arcade-cyan flex-1 min-h-[48px] px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Скачать PNG</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadHtml}
            className="btn-arcade-violet flex-1 min-h-[48px] px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Документ с вопросами (HTML)</span>
          </button>
          <button
            type="button"
            onClick={onEditRegistration}
            aria-label="Изменить имя или email"
            className="btn-arcade-surface min-h-[48px] px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <Edit3 className="w-4 h-4 text-[#94A3B8]" />
            <span className="sm:hidden">Изменить данные</span>
          </button>
        </div>
      </div>
    </div>
  );
}
