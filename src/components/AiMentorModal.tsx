import { useState } from 'react';
import {
  AlertCircle,
  Bot,
  ExternalLink,
  Globe,
  Loader2,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { AppLanguage, UI_TEXT } from '../i18n/locale';
import { AiQueryCallout } from './AiQueryCallout';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: { title: string; uri: string }[];
  fallbackNotice?: string;
}

interface Props {
  language: AppLanguage;
  topicContext?: string;
  initialQuestion?: string;
  onClose: () => void;
  onQuestionAnswered?: () => void;
}

export function AiMentorModal({
  language,
  topicContext,
  initialQuestion,
  onClose,
  onQuestionAnswered,
}: Props) {
  const t = UI_TEXT[language].mentor;
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: t.welcome,
    },
  ]);
  const [input, setInput] = useState(initialQuestion ?? '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [badQueryHint, setBadQueryHint] = useState<string | null>(null);

  const sendQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (loading) return;
    if (trimmed.length < 5) {
      const topicPart = topicContext ? `по теме «${topicContext}»` : 'по архитектуре AI-агентов и RAG';
      setBadQueryHint(
        `Ты — AI-инженер. Объясни простыми словами и на практическом примере ${topicPart}: как устроена система, какие шаги выполняются под капотом и какие ошибки бывают у новичков.`
      );
      return;
    }
    setBadQueryHint(null);

    const userMsg: ChatMessage = { role: 'user', text: trimmed };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai-ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          topicContext,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Не удалось получить ответ от AI-ментора');
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: data.answer || 'Ответ получен.',
          sources: Array.isArray(data.sources) ? data.sources : [],
          fallbackNotice: data.fallbackMode
            ? 'Дневная квота Gemini API (429) временно исчерпана — ответ сформирован из встроенной базы знаний NeuroCraft.'
            : undefined,
        },
      ]);
      onQuestionAnswered?.();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Ошибка соединения с AI-сервисом';
      const friendly = raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')
        ? 'Лимит запросов Gemini API временно исчерпан (429). Попробуйте чуть позже или проверьте квоту в Google AI Studio.'
        : raw;
      setErrorMsg(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#070A12]/85 backdrop-blur-md p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
    >
      <div className="w-full max-w-xl bg-[#111827] border border-[#334155]/80 rounded-t-3xl sm:rounded-2xl h-[88vh] sm:h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#06B6D4]/15 border border-[#06B6D4]/50 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-[#4CD7F6]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-bold text-[#F8FAFC] truncate">
                  {t.title}
                </h2>
                <Globe className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              </div>
              <p className="text-xs text-[#94A3B8] truncate">
                {topicContext ? `${t.contextPrefix}: ${topicContext}` : t.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((msg, idx) => (
            <div
              key={`${msg.role}-${idx}`}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#06B6D4] text-[#082F49] font-medium'
                    : 'bg-[#171B26] border border-[#334155]/70 text-[#E2E8F0]'
                }`}
              >
                {msg.fallbackNotice && (
                  <div className="mb-2 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/40 px-2.5 py-1.5 text-[11px] font-semibold text-[#FCD34D]">
                    {msg.fallbackNotice}
                  </div>
                )}
                {msg.text}
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 max-w-[90%] space-y-1">
                  <div className="text-[11px] font-semibold text-[#94A3B8]">{t.sources}:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src) => (
                      <a
                        key={src.uri}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0B0F19] border border-[#334155] text-[11px] text-[#4CD7F6] hover:border-[#06B6D4] max-w-[240px]"
                      >
                        <span className="truncate">{src.title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#4CD7F6] px-1">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Ищем актуальную информацию и готовим ответ...</span>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/40 p-3 flex items-start gap-2 text-xs text-[#FECACA]">
              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {badQueryHint && (
            <AiQueryCallout
              title="Сноска · Вопрос слишком короткий. По какому запросу к ИИ получить точный ответ:"
              queryText={badQueryHint}
              onApplyToEditor={(q) => {
                setInput(q);
                setBadQueryHint(null);
              }}
              applyLabel="Подставить в строку ввода"
            />
          )}

          {/* Quick Topic Chips on initial state */}
          {messages.length <= 1 && (
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8]">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Актуальные вопросы</span>
              </div>
              <div className="flex flex-col gap-2">
                {t.quickQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendQuestion(q)}
                    className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#334155] text-left text-xs text-[#CBD5E1] hover:border-[#06B6D4] hover:text-[#F8FAFC] transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendQuestion(input);
          }}
          className="p-3.5 border-t border-[#1E293B] bg-[#0F131D] flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            className="flex-1 min-h-[46px] rounded-xl bg-[#171B26] border border-[#334155] px-3.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#06B6D4]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label={t.send}
            className="btn-arcade-cyan min-h-[46px] px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{t.send}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
