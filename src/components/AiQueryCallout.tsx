import { useState } from 'react';
import { Bot, Check, Copy, CornerDownLeft, Sparkles } from 'lucide-react';

interface Props {
  title?: string;
  queryText: string;
  note?: string;
  onAskMentor?: (query: string) => void;
  onApplyToEditor?: (query: string) => void;
  applyLabel?: string;
}

export function AiQueryCallout({
  title = 'Сноска · По какому запросу к ИИ получить нужный ответ',
  queryText,
  note,
  onAskMentor,
  onApplyToEditor,
  applyLabel = 'Вставить запрос',
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(queryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard may be unavailable in restricted contexts
    }
  };

  return (
    <div className="rounded-xl bg-[#0B0F19] border border-[#06B6D4]/45 p-3.5 space-y-2.5 text-xs">
      <div className="flex items-center gap-1.5 font-semibold text-[#4CD7F6]">
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span>{title}</span>
      </div>

      {note && <p className="text-[#94A3B8] leading-snug">{note}</p>}

      <div className="rounded-lg bg-[#171B26] border border-[#334155]/80 p-3 font-mono text-[11px] sm:text-xs text-[#E2E8F0] whitespace-pre-wrap leading-relaxed select-all">
        {queryText}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <button
          type="button"
          onClick={handleCopy}
          className="min-h-[38px] px-3 py-1.5 rounded-lg bg-[#171B26] border border-[#334155] text-[#E2E8F0] hover:border-[#06B6D4] font-semibold flex items-center gap-1.5 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="text-[#10B981]">Скопировано</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>Скопировать запрос</span>
            </>
          )}
        </button>

        {onAskMentor && (
          <button
            type="button"
            onClick={() => onAskMentor(queryText)}
            className="min-h-[38px] px-3 py-1.5 rounded-lg bg-[#06B6D4]/15 border border-[#06B6D4]/60 text-[#4CD7F6] hover:bg-[#06B6D4]/25 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Проверить у AI-ментора</span>
          </button>
        )}

        {onApplyToEditor && (
          <button
            type="button"
            onClick={() => onApplyToEditor(queryText)}
            className="min-h-[38px] px-3 py-1.5 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/60 text-[#D0BCFF] hover:bg-[#8B5CF6]/25 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
            <span>{applyLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}
