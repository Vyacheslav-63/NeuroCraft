import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Diamond,
  Lightbulb,
  Loader2,
  Send,
  Sparkles,
} from 'lucide-react';
import { PROMPT_QUESTS } from '../data/curriculum';
import { PlayerProgress, PromptEvalResult, PromptQuest } from '../types/app';

import { AppLanguage } from '../i18n/locale';
import { AiQueryCallout } from './AiQueryCallout';

interface Props {
  progress: PlayerProgress;
  language: AppLanguage;
  onCompleteQuest: (questId: string, xpReward: number, crystalReward: number) => void;
}

function estimateLocalRubric(text: string) {
  const lower = text.toLowerCase();
  const hasRole =
    /ты\s*[—-]?\s*[а-яa-z]+|роль|эксперт|инженер|менеджер|копирайтер|аналитик|аудитор|судь|role|expert|judge/.test(
      lower
    );
  const hasContext =
    text.trim().length >= 70 &&
    /клиент|заказ|аудитор|бюджет|ситуац|продукт|цель|риелтор|код|тариф|ниш|контекст|faithfulness|инъекц|ввод|банк|pii|client|order|context/.test(
      lower
    );
  const hasFormat =
    /json|таблиц|спис|предложен|слов|формат|пункт|буллит|только|строго|без\s+вод|критич|шкал|маскир|тег|format|list/.test(
      lower
    );

  const clarity = Math.min(95, Math.round(25 + Math.min(text.trim().length, 180) * 0.38));
  const context = hasContext ? 85 : Math.min(60, Math.round(text.trim().length * 0.45));
  const roleFormat = (hasRole ? 45 : 15) + (hasFormat ? 45 : 15);
  const total = Math.round((clarity + context + roleFormat) / 3);

  return {
    clarity,
    context,
    roleFormat,
    total,
    hasRole,
    hasContext,
    hasFormat,
  };
}

export function PromptTrainer({ progress, language, onCompleteQuest }: Props) {
  const [selectedQuest, setSelectedQuest] = useState<PromptQuest>(PROMPT_QUESTS[0]);
  const [promptText, setPromptText] = useState<string>(PROMPT_QUESTS[0].starterPrompt);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<PromptEvalResult | null>(null);

  const liveMetrics = useMemo(() => estimateLocalRubric(promptText), [promptText]);

  const handleSelectQuest = (q: PromptQuest) => {
    setSelectedQuest(q);
    setPromptText(q.starterPrompt);
    setResult(null);
    setErrorMsg(null);
    setShowHint(false);
  };

  const appendBlock = (snippet: string) => {
    setPromptText((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return snippet;
      if (trimmed.includes(snippet)) return prev;
      return `${trimmed}\n${snippet}`;
    });
  };

  const runGeminiEvaluate = async () => {
    if (promptText.trim().length < 5) {
      setErrorMsg('Напиши промпт чуть подробнее (от 5 символов).');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/prompt-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questTitle: selectedQuest.title,
          questGoal: selectedQuest.goal,
          criteria: selectedQuest.criteria,
          userPrompt: promptText,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Не удалось оценить промпт');
      }

      setResult(data);
      if (data.passed) {
        onCompleteQuest(
          selectedQuest.id,
          selectedQuest.xpReward,
          selectedQuest.crystalReward
        );
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const runLocalFallbackEvaluate = () => {
    const m = liveMetrics;
    const passed = m.total >= 70;
    const simulatedOutput =
      selectedQuest.id === 'q-json'
        ? '{\n  "niche": "Стоматология",\n  "deadline": "25 число",\n  "budget_rub": 80000,\n  "features": ["онлайн-запись", "отзывы"]\n}'
        : selectedQuest.id === 'q-judge'
          ? '{\n  "score": 2,\n  "passed": false,\n  "hallucinations": ["Упомянута скидка 20%, отсутствующая в регламенте"],\n  "reason": "Нарушен критерий Faithfulness: добавлен факт вне контекста."\n}'
          : selectedQuest.id === 'q-guardrail'
            ? 'Я могу помочь только с вопросами по банковским услугам. Ваши данные по карте **** 1234 защищены.'
            : 'Здравствуйте! Приносим искренние извинения за задержку заказа #4821. Мы уже перевели доставку в приоритетный режим на завтра и закрепили за вами промокод на 15% к следующему заказу.';

    const evalRes: PromptEvalResult = {
      scores: {
        clarity: m.clarity,
        context: m.context,
        roleFormat: m.roleFormat,
        total: m.total,
      },
      feedback: passed
        ? 'Отличная структура! Ты задал роль, контекст задачи и понятные ограничения для модели.'
        : 'Промпт пока слишком общий: модели не хватает роли, конкретных ограничений или формата ответа.',
      improvementTip: !m.hasRole
        ? 'Добавь в начало явную роль эксперта (например, «Ты — ...»).'
        : !m.hasFormat
          ? 'Укажи точный формат вывода (JSON, список, лимит предложений).'
          : 'Уточни целевую аудиторию и граничные условия, чтобы поднять точность до 95+.',
      simulatedOutput,
      passed,
    };

    setErrorMsg(null);
    setResult(evalRes);
    if (passed) {
      onCompleteQuest(selectedQuest.id, selectedQuest.xpReward, selectedQuest.crystalReward);
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Quest Selector */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-extrabold text-[#F8FAFC]">Тренажер промптов</h1>
            <p className="text-sm text-[#94A3B8]">
              Тренируй формулировки на реальных задачах с мгновенной оценкой.
            </p>
          </div>
          <span className="font-mono text-xs tabular-nums text-[#10B981] shrink-0">
            {progress.completedQuestIds.length}/{PROMPT_QUESTS.length} решено
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {PROMPT_QUESTS.map((q) => {
            const active = q.id === selectedQuest.id;
            const done = progress.completedQuestIds.includes(q.id);
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => handleSelectQuest(q)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors flex items-center gap-1.5 ${
                  active
                    ? 'bg-[#06B6D4]/15 border-[#06B6D4] text-[#4CD7F6]'
                    : 'bg-[#111827] border-[#334155]/70 text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {done && <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />}
                <span>{q.title}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Scenario Card */}
      <section className="rounded-2xl bg-[#111827] border border-[#334155]/70 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between gap-2 text-xs text-[#94A3B8]">
          <span>
            {selectedQuest.category} · {selectedQuest.difficulty}
          </span>
          <span className="font-mono tabular-nums text-[#F59E0B]">
            +{selectedQuest.xpReward} XP · +{selectedQuest.crystalReward} кристаллов
          </span>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-[#F8FAFC]">{selectedQuest.title}</h2>
          <p className="text-sm text-[#CBD5E1] leading-relaxed">{selectedQuest.scenario}</p>
        </div>

        <div className="rounded-xl bg-[#0B0F19] border border-[#1E293B] p-3 space-y-1.5">
          <div className="text-xs font-semibold text-[#4CD7F6]">Цель квеста</div>
          <p className="text-xs text-[#E2E8F0] leading-relaxed">{selectedQuest.goal}</p>
          <ul className="pt-1 space-y-1">
            {selectedQuest.criteria.map((c) => (
              <li key={c} className="text-xs text-[#94A3B8] flex items-start gap-2">
                <span className="text-[#06B6D4]">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Prompt Editor & Live Meter */}
      <section className="rounded-2xl bg-[#111827] border border-[#334155]/70 p-4 sm:p-5 space-y-4">
        {/* Live Local Pre-Flight Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#94A3B8] font-medium">Предварительная структура</span>
            <span className="font-mono font-bold tabular-nums text-[#4CD7F6]">
              {liveMetrics.total}/100
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-[#1E293B] overflow-hidden">
            <div
              className="h-full rounded-full neon-progress-fill transition-all duration-200"
              style={{ width: `${Math.max(8, liveMetrics.total)}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#94A3B8]">
            <span className={liveMetrics.hasRole ? 'text-[#10B981]' : ''}>
              {liveMetrics.hasRole ? '✓ Роль задана' : '○ Добавь роль'}
            </span>
            <span className={liveMetrics.hasContext ? 'text-[#10B981]' : ''}>
              {liveMetrics.hasContext ? '✓ Есть контекст' : '○ Уточни контекст'}
            </span>
            <span className={liveMetrics.hasFormat ? 'text-[#10B981]' : ''}>
              {liveMetrics.hasFormat ? '✓ Задан формат' : '○ Ограничь формат'}
            </span>
          </div>
        </div>

        {/* Builder Quick-Insert Blocks */}
        <div className="space-y-1.5">
          <div className="text-xs text-[#94A3B8]">Быстрые блоки конструктора:</div>
          <div className="flex flex-wrap gap-2">
            {selectedQuest.blocks.map((b) => (
              <button
                key={b.label}
                type="button"
                onClick={() => appendBlock(b.snippet)}
                className="min-h-[38px] px-3 py-1.5 rounded-lg bg-[#171B26] border border-[#334155] text-xs font-medium text-[#E2E8F0] hover:border-[#06B6D4] hover:text-[#4CD7F6] transition-colors"
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          rows={5}
          placeholder="Сформулируй промпт для ИИ..."
          className="w-full rounded-xl bg-[#0B0F19] border border-[#334155] p-3.5 text-sm text-[#F8FAFC] leading-relaxed focus:outline-none focus:border-[#06B6D4]"
        />

        {showHint && (
          <div className="rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/40 p-3 text-xs text-[#FDE68A] flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
            <span>{selectedQuest.hint}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            className="btn-arcade-surface min-h-[48px] px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0"
          >
            <Lightbulb className="w-4 h-4 text-[#F59E0B]" />
            <span>Подсказка</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={runGeminiEvaluate}
            className="btn-arcade-cyan flex-1 min-h-[48px] px-5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Проверяем промпт...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Проверить промпт</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="space-y-2.5">
            <div className="rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/40 p-3.5 space-y-2.5">
              <div className="flex items-start gap-2 text-xs text-[#FECACA]">
                <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
              <button
                type="button"
                onClick={runLocalFallbackEvaluate}
                className="min-h-[38px] px-3 py-1.5 rounded-lg bg-[#171B26] border border-[#334155] text-xs font-semibold text-[#F8FAFC] hover:border-[#06B6D4]"
              >
                Оценить по локальной рубрике
              </button>
            </div>

            <AiQueryCallout
              title="Сноска · По какому запросу к ИИ получить нужный результат"
              queryText={selectedQuest.blocks.map((b) => b.snippet).join('\n')}
              onApplyToEditor={(q) => {
                setPromptText(q);
                setErrorMsg(null);
              }}
              applyLabel="Вставить в редактор"
            />
          </div>
        )}
      </section>

      {/* Evaluation Results */}
      {result && (
        <section className="rounded-2xl bg-[#111827] border border-[#334155]/80 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {result.passed ? (
                <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              ) : (
                <Sparkles className="w-5 h-5 text-[#F59E0B]" />
              )}
              <h3 className="text-base font-bold text-[#F8FAFC]">
                {result.passed ? 'Квест засчитан!' : 'Нужна доработка (цель — от 70)'}
              </h3>
            </div>
            <div
              className={`font-mono text-xl font-extrabold tabular-nums ${
                result.passed ? 'text-[#10B981]' : 'text-[#F59E0B]'
              }`}
            >
              {result.scores.total}/100
            </div>
          </div>

          {/* 3-Axis Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ScoreMetric label="Точность" value={result.scores.clarity} color="bg-[#06B6D4]" />
            <ScoreMetric label="Контекст" value={result.scores.context} color="bg-[#8B5CF6]" />
            <ScoreMetric
              label="Роль и формат"
              value={result.scores.roleFormat}
              color="bg-[#10B981]"
            />
          </div>

          {/* Simulated AI Response */}
          <div className="rounded-xl bg-[#0B0F19] border border-[#334155]/70 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D0BCFF]">
              <Bot className="w-4 h-4" />
              <span>Симуляция ответа модели</span>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-[#E2E8F0] leading-relaxed">
              {result.simulatedOutput}
            </pre>
          </div>

          <div className="space-y-1.5 text-xs text-[#CBD5E1]">
            <p>
              <span className="font-semibold text-[#F8FAFC]">Разбор: </span>
              {result.feedback}
            </p>
            <p>
              <span className="font-semibold text-[#4CD7F6]">Как усилить: </span>
              {result.improvementTip}
            </p>
          </div>

          {!result.passed && (
            <AiQueryCallout
              title="Сноска · Эталонный запрос к ИИ, который решает задачу (набери 70+)"
              note="Используй эту структуру с ролью, контекстом и форматом вывода или вставь её в редактор для доработки:"
              queryText={selectedQuest.blocks.map((b) => b.snippet).join('\n')}
              onApplyToEditor={(q) => setPromptText(q)}
              applyLabel="Вставить эталон в редактор"
            />
          )}

          {result.passed && (
            <div className="flex items-center gap-3 pt-2 border-t border-[#1E293B] text-xs font-mono text-[#10B981]">
              <span>+{selectedQuest.xpReward} XP</span>
              <span className="text-[#F59E0B] flex items-center gap-1">
                <Diamond className="w-3.5 h-3.5" />+{selectedQuest.crystalReward} кристаллов
              </span>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function ScoreMetric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl bg-[#171B26] border border-[#334155]/60 p-3 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#94A3B8]">{label}</span>
        <span className="font-mono font-bold tabular-nums text-[#F8FAFC]">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#0B0F19] overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
