import { useState } from 'react';
import { CheckCircle2, Diamond, Sparkles, X, XCircle, Zap } from 'lucide-react';
import { SkillNode } from '../types/app';
import { AiQueryCallout } from './AiQueryCallout';
import { InteractiveWidget } from './InteractiveWidget';

interface Props {
  node: SkillNode;
  energy: number;
  crystals: number;
  alreadyCompleted: boolean;
  onClose: () => void;
  onMistake: () => void;
  onRefillEnergy: () => boolean;
  onComplete: (
    nodeId: string,
    xp: number,
    crystals: number,
    scoreInfo?: { scorePct: number; mistakes: number; totalQuestions: number }
  ) => void;
  onAskMentor: (topic: string, prefillQuery?: string) => void;
}

export function LessonModal({
  node,
  energy,
  crystals,
  alreadyCompleted,
  onClose,
  onMistake,
  onRefillEnergy,
  onComplete,
  onAskMentor,
}: Props) {
  // step 0 = interactive concept, 1..quiz.length = questions, quiz.length + 1 = celebration
  const [step, setStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [checkedState, setCheckedState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [mistakesCount, setMistakesCount] = useState(0);

  const totalSteps = 1 + node.quiz.length;
  const isConcept = step === 0;
  const isFinished = step > node.quiz.length;
  const currentQuestion = !isConcept && !isFinished ? node.quiz[step - 1] : null;
  const progressPct = Math.min(100, Math.round((step / totalSteps) * 100));

  const earnedXp = alreadyCompleted ? 15 : node.xpReward;
  const earnedCrystals = alreadyCompleted ? 5 : node.crystalReward;
  const finalScorePct = Math.max(60, 100 - mistakesCount * 15);

  const handleCheck = () => {
    if (!currentQuestion || selectedOption === null) return;
    if (selectedOption === currentQuestion.correctIndex) {
      setCheckedState('correct');
    } else {
      setCheckedState('wrong');
      setMistakesCount((m) => m + 1);
      onMistake();
    }
  };

  const handleNext = () => {
    if (isConcept) {
      setStep(1);
      return;
    }
    if (step < node.quiz.length) {
      setStep((s) => s + 1);
      setSelectedOption(null);
      setCheckedState('idle');
    } else {
      onComplete(node.id, node.xpReward, node.crystalReward, {
        scorePct: finalScorePct,
        mistakes: mistakesCount,
        totalQuestions: node.quiz.length,
      });
      setStep(node.quiz.length + 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#070A12]/85 backdrop-blur-md p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={node.title}
    >
      <div className="w-full max-w-lg bg-[#111827] border border-[#334155]/80 rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1E293B]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть урок"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <div className="h-3 rounded-full bg-[#1E293B] overflow-hidden">
              <div
                className="h-full rounded-full neon-progress-fill transition-all duration-300"
                style={{ width: `${isFinished ? 100 : Math.max(12, progressPct)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs font-bold tabular-nums text-[#D0BCFF] shrink-0">
            <Zap className="w-4 h-4 text-[#8B5CF6]" />
            <span>{energy}/5</span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {energy === 0 && !isFinished && !isConcept ? (
            <div className="rounded-xl bg-[#171B26] border border-[#EF4444]/40 p-5 text-center space-y-4">
              <Zap className="w-10 h-10 text-[#EF4444] mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#F8FAFC]">Энергия закончилась</h3>
                <p className="text-sm text-[#94A3B8]">
                  Восстанови 5 зарядов энергии за 20 кристаллов, чтобы продолжить практику без паузы.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                <button
                  type="button"
                  disabled={crystals < 20}
                  onClick={onRefillEnergy}
                  className="btn-arcade-violet min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Diamond className="w-4 h-4" />
                  <span>Восстановить за 20 кристаллов</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-arcade-surface min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-semibold"
                >
                  Вернуться на карту
                </button>
              </div>
            </div>
          ) : isConcept ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-[#4CD7F6]">
                  Теория и песочница · {node.durationMin} мин
                </div>
                <h2 className="text-xl font-bold text-[#F8FAFC]">{node.conceptTitle}</h2>
                <p className="text-sm leading-relaxed text-[#CBD5E1]">{node.conceptSummary}</p>
              </div>

              <InteractiveWidget type={node.widgetType} />

              <button
                type="button"
                onClick={() => onAskMentor(node.title)}
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#334155] text-xs font-semibold text-[#4CD7F6] hover:border-[#06B6D4] transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Задать актуальный вопрос AI-ментору по этой теме</span>
              </button>
            </div>
          ) : isFinished ? (
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#10B981]/15 border border-[#10B981] flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-[#10B981]" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-2xl font-extrabold text-[#F8FAFC]">Уровень пройден!</h2>
                <p className="text-sm text-[#94A3B8]">
                  Навык «{node.title}» закреплен в твоей нейросхеме.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2.5 max-w-sm mx-auto">
                <div className="rounded-xl bg-[#171B26] border border-[#334155] p-3">
                  <div className="text-xs text-[#94A3B8]">Оценка</div>
                  <div className="font-mono text-xl font-bold tabular-nums text-[#4CD7F6]">
                    {finalScorePct}%
                  </div>
                </div>
                <div className="rounded-xl bg-[#171B26] border border-[#334155] p-3">
                  <div className="text-xs text-[#94A3B8]">Получено XP</div>
                  <div className="font-mono text-xl font-bold tabular-nums text-[#10B981]">
                    +{earnedXp}
                  </div>
                </div>
                <div className="rounded-xl bg-[#171B26] border border-[#334155] p-3">
                  <div className="text-xs text-[#94A3B8]">Кристаллы</div>
                  <div className="font-mono text-xl font-bold tabular-nums text-[#F59E0B]">
                    +{earnedCrystals}
                  </div>
                </div>
              </div>
            </div>
          ) : currentQuestion ? (
            <div className="space-y-4">
              <div className="text-xs font-medium text-[#D0BCFF]">
                Вопрос {step} из {node.quiz.length}
              </div>
              <h3 className="text-lg font-bold leading-snug text-[#F8FAFC]">
                {currentQuestion.prompt}
              </h3>

              <div className="space-y-2.5">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrectOpt =
                    checkedState !== 'idle' && idx === currentQuestion.correctIndex;
                  const isWrongSelected = checkedState === 'wrong' && isSelected;

                  let cardClass =
                    'bg-[#171B26] border-[#334155]/80 text-[#E2E8F0] hover:border-[#475569]';
                  if (isCorrectOpt) {
                    cardClass = 'bg-[#10B981]/15 border-[#10B981] text-[#F8FAFC]';
                  } else if (isWrongSelected) {
                    cardClass =
                      'bg-[#EF4444]/15 border-[#EF4444] text-[#F8FAFC] animate-arcade-shake';
                  } else if (isSelected) {
                    cardClass = 'bg-[#06B6D4]/15 border-[#06B6D4] text-[#F8FAFC]';
                  }

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={checkedState === 'correct'}
                      onClick={() => {
                        setSelectedOption(idx);
                        if (checkedState === 'wrong') setCheckedState('idle');
                      }}
                      className={`w-full min-h-[52px] p-3.5 rounded-xl border text-left text-sm font-medium transition-colors flex items-start gap-3 ${cardClass}`}
                    >
                      <span className="font-mono text-xs font-bold w-6 h-6 rounded-md bg-[#0B0F19] border border-[#334155] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="flex-1 leading-snug">{option}</span>
                    </button>
                  );
                })}
              </div>

              {checkedState === 'correct' && (
                <div className="rounded-xl bg-[#10B981]/10 border border-[#10B981]/50 p-3.5 flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed text-[#D1FAE5]">
                    <span className="font-bold block mb-0.5">Верно!</span>
                    {currentQuestion.explanation}
                  </div>
                </div>
              )}

              {checkedState === 'wrong' && (
                <div className="space-y-2.5">
                  <div className="rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/50 p-3.5 flex items-start gap-2.5">
                    <XCircle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed text-[#FECACA]">
                      <span className="font-bold block mb-0.5">Не совсем так (-1 энергия)</span>
                      Попробуй другой вариант ответа или проверь разбор с помощью AI-запроса ниже.
                    </div>
                  </div>

                  <AiQueryCallout
                    title="Сноска · По какому запросу к ИИ получить нужный ответ"
                    queryText={
                      currentQuestion.aiQueryHint ??
                      `Ты — AI-инженер и преподаватель. Объясни по теме «${node.title}» на реальном примере: ${currentQuestion.prompt.replace(/\?+$/, '')}. Дай точный инженерный ответ и поясни, почему другие подходы неверны.`
                    }
                    onAskMentor={(query) => onAskMentor(node.title, query)}
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Sticky Bottom Footer Action */}
        <div className="p-4 border-t border-[#1E293B] bg-[#0F131D]">
          {isConcept ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-arcade-cyan w-full min-h-[48px] rounded-xl font-bold text-sm"
            >
              Перейти к проверке
            </button>
          ) : isFinished ? (
            <button
              type="button"
              onClick={onClose}
              className="btn-arcade-emerald w-full min-h-[48px] rounded-xl font-bold text-sm"
            >
              Вернуться на карту
            </button>
          ) : checkedState === 'correct' ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-arcade-emerald w-full min-h-[48px] rounded-xl font-bold text-sm"
            >
              {step < node.quiz.length ? 'Следующий вопрос' : 'Забрать награду'}
            </button>
          ) : (
            <button
              type="button"
              disabled={selectedOption === null || energy === 0}
              onClick={handleCheck}
              className="btn-arcade-cyan w-full min-h-[48px] rounded-xl font-bold text-sm"
            >
              Проверить ответ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
