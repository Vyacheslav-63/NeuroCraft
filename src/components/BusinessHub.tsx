import { useMemo, useRef, useState } from 'react';
import {
  Award,
  Briefcase,
  Calculator,
  CheckCircle2,
  Diamond,
  Flame,
  GraduationCap,
  Lock,
  RotateCcw,
  TrendingUp,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { ACHIEVEMENTS, BUSINESS_CASES, STAGE_CERTIFICATES } from '../data/curriculum';
import { ALL_WEEKLY_BADGES } from '../data/weeklyMissions';
import { BusinessCase, PlayerProgress } from '../types/app';
import { buildCertificateReport } from '../utils/certificateGenerator';
import { AiQueryCallout } from './AiQueryCallout';

import { AppCurrency, CURRENCY_CONFIG, formatMoneyFromRub } from '../i18n/locale';

interface Props {
  progress: PlayerProgress;
  currency: AppCurrency;
  rankInfo: {
    level: number;
    title: string;
    nextMinXp: number | null;
    progressPct: number;
  };
  onCompleteCase: (caseId: string) => void;
  onClaimStageBonus: (chapterId: string | 'all') => void;
  onOpenCertificate: (chapterId: string | 'all') => void;
  onOpenRegistration: () => void;
  onAskMentor?: (topic: string, prefillQuery?: string) => void;
  onResetProgress: () => void;
}

const MODELS = [
  {
    id: 'freelance',
    label: 'Фриланс-внедрение',
    defaultCheck: 45000,
    minCheck: 15000,
    maxCheck: 150000,
    stepCheck: 5000,
    maxClients: 8,
    apiCostRatio: 0.05,
    hoursPerClientManual: 28,
  },
  {
    id: 'b2b',
    label: 'Автоматизация B2B',
    defaultCheck: 65000,
    minCheck: 30000,
    maxCheck: 250000,
    stepCheck: 10000,
    maxClients: 6,
    apiCostRatio: 0.08,
    hoursPerClientManual: 40,
  },
  {
    id: 'saas',
    label: 'Микро-SaaS подписка',
    defaultCheck: 1490,
    minCheck: 490,
    maxCheck: 4990,
    stepCheck: 250,
    maxClients: 250,
    apiCostRatio: 0.14,
    hoursPerClientManual: 1.5,
  },
  {
    id: 'studio',
    label: 'AI-контент студия',
    defaultCheck: 55000,
    minCheck: 20000,
    maxCheck: 140000,
    stepCheck: 5000,
    maxClients: 10,
    apiCostRatio: 0.1,
    hoursPerClientManual: 22,
  },
];

const CASE_CATEGORIES = [
  'Все',
  'Автоматизация B2B',
  'Микро-SaaS',
  'Фриланс-спринты',
  'Контент-студия',
  'Корпоративное обучение',
];

export function BusinessHub({
  progress,
  currency,
  rankInfo,
  onCompleteCase,
  onClaimStageBonus,
  onOpenCertificate,
  onOpenRegistration,
  onAskMentor,
  onResetProgress,
}: Props) {
  const [activeSubTab, setActiveSubTab] = useState<
    'cases' | 'calculator' | 'certificates' | 'profile'
  >('cases');

  // Revenue Calculator State
  const [selectedModelId, setSelectedModelId] = useState(MODELS[1].id);
  const currentModel = MODELS.find((m) => m.id === selectedModelId) ?? MODELS[0];
  const [clients, setClients] = useState(3);
  const [avgCheck, setAvgCheck] = useState(currentModel.defaultCheck);
  const [aiLeverage, setAiLeverage] = useState(70);

  // Case Filter & Decision Simulation State
  const [categoryFilter, setCategoryFilter] = useState<string>('Все');
  const [selectedCase, setSelectedCase] = useState<BusinessCase>(BUSINESS_CASES[0]);
  const [chosenOptIdx, setChosenOptIdx] = useState<number | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);

  const filteredCases = useMemo(() => {
    if (categoryFilter === 'Все') return BUSINESS_CASES;
    return BUSINESS_CASES.filter((c) => c.modelName === categoryFilter);
  }, [categoryFilter]);

  const handleSelectCase = (c: BusinessCase) => {
    setSelectedCase(c);
    setChosenOptIdx(null);
    detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleModelSwitch = (m: (typeof MODELS)[number]) => {
    setSelectedModelId(m.id);
    setAvgCheck(m.defaultCheck);
    setClients(m.id === 'saas' ? 60 : 3);
  };

  const grossRevenue = clients * avgCheck;
  const apiCosts = Math.round(grossRevenue * currentModel.apiCostRatio);
  const netProfit = grossRevenue - apiCosts;
  const savedHoursPerMonth = Math.round(
    clients * currentModel.hoursPerClientManual * (aiLeverage / 100)
  );

  const handleDecision = (idx: number) => {
    setChosenOptIdx(idx);
    const opt = selectedCase.decisionScenario.options[idx];
    if (opt?.isOptimal) {
      onCompleteCase(selectedCase.id);
    }
  };

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-[#F8FAFC]">Бизнес-Хаб</h1>
          <p className="text-sm text-[#94A3B8]">
            Кейсы монетизации, калькулятор дохода и профиль твоих достижений.
          </p>
        </div>
        <span className="font-mono text-xs tabular-nums text-[#10B981] shrink-0 pt-1">
          {progress.completedCaseIds.length}/{BUSINESS_CASES.length} кейсов
        </span>
      </div>

      {/* Sub-Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#111827] border border-[#334155]/70">
        <button
          type="button"
          onClick={() => setActiveSubTab('cases')}
          className={`min-h-[44px] rounded-lg text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 ${
            activeSubTab === 'cases'
              ? 'bg-[#06B6D4] text-[#082F49]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 shrink-0" />
          <span>Кейсы</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('calculator')}
          className={`min-h-[44px] rounded-lg text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 ${
            activeSubTab === 'calculator'
              ? 'bg-[#06B6D4] text-[#082F49]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 shrink-0" />
          <span>Доход</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('certificates')}
          className={`min-h-[44px] rounded-lg text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 ${
            activeSubTab === 'certificates'
              ? 'bg-[#06B6D4] text-[#082F49]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 shrink-0" />
          <span>Дипломы</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('profile')}
          className={`min-h-[44px] rounded-lg text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 ${
            activeSubTab === 'profile'
              ? 'bg-[#06B6D4] text-[#082F49]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          <Award className="w-3.5 h-3.5 shrink-0" />
          <span>Профиль</span>
        </button>
      </div>

      {activeSubTab === 'cases' && (
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CASE_CATEGORIES.map((cat) => {
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategoryFilter(cat);
                    const nextList =
                      cat === 'Все'
                        ? BUSINESS_CASES
                        : BUSINESS_CASES.filter((c) => c.modelName === cat);
                    if (nextList.length > 0 && !nextList.some((c) => c.id === selectedCase.id)) {
                      setSelectedCase(nextList[0]);
                      setChosenOptIdx(null);
                    }
                  }}
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors ${
                    active
                      ? 'bg-[#06B6D4]/15 border-[#06B6D4] text-[#4CD7F6]'
                      : 'bg-[#111827] border-[#334155]/70 text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Catalog Grid of Cases */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredCases.map((c) => {
              const active = c.id === selectedCase.id;
              const solved = progress.completedCaseIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCase(c)}
                  className={`p-3.5 rounded-xl border text-left transition-colors flex flex-col justify-between gap-2 ${
                    active
                      ? 'bg-[#06B6D4]/10 border-[#06B6D4]'
                      : 'bg-[#111827] border-[#334155]/70 hover:border-[#475569]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-[#F59E0B] font-medium truncate">{c.modelName}</span>
                      {solved && (
                        <span className="flex items-center gap-1 text-[#10B981] font-semibold shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Решен
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-[#F8FAFC] leading-snug">{c.title}</div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#1E293B]">
                    <span className="font-mono font-bold tabular-nums text-[#F8FAFC]">
                      {formatMoneyFromRub(c.avgCheckRub, currency)}
                    </span>
                    <span className="text-[#94A3B8]">
                      Маржа <span className="font-mono text-[#10B981]">{c.marginPercent}%</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Case Details */}
          <section
            ref={detailRef}
            className="rounded-2xl bg-[#111827] border border-[#334155]/70 p-4 sm:p-5 space-y-4"
          >
            <div className="space-y-1">
              <div className="text-xs font-medium text-[#F59E0B]">
                {selectedCase.modelName} · Запуск за {selectedCase.timeToLaunch}
              </div>
              <h2 className="text-lg font-bold text-[#F8FAFC]">{selectedCase.title}</h2>
              <p className="text-sm text-[#CBD5E1] leading-relaxed">{selectedCase.summary}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#0B0F19] border border-[#1E293B] p-3">
                <div className="text-xs text-[#94A3B8]">Средний чек</div>
                <div className="font-mono text-lg font-bold tabular-nums text-[#F8FAFC]">
                  {formatMoneyFromRub(selectedCase.avgCheckRub, currency)}
                </div>
              </div>
              <div className="rounded-xl bg-[#0B0F19] border border-[#1E293B] p-3">
                <div className="text-xs text-[#94A3B8]">Валовая маржа</div>
                <div className="font-mono text-lg font-bold tabular-nums text-[#10B981]">
                  {selectedCase.marginPercent}%
                </div>
              </div>
            </div>

            <div className="text-xs text-[#94A3B8]">
              Стек: {selectedCase.stack.join(' · ')}
            </div>
          </section>

          {/* Decision Simulation */}
          <section className="rounded-2xl bg-[#111827] border border-[#8B5CF6]/40 p-4 sm:p-5 space-y-3.5">
            <div className="text-xs font-bold text-[#D0BCFF]">Симуляция бизнес-решения</div>
            <p className="text-sm font-medium text-[#F8FAFC] leading-relaxed">
              {selectedCase.decisionScenario.situation}
            </p>

            <div className="space-y-2.5">
              {selectedCase.decisionScenario.options.map((opt, idx) => {
                const isChosen = chosenOptIdx === idx;
                const stateStyle = !isChosen
                  ? 'bg-[#171B26] border-[#334155] text-[#E2E8F0] hover:border-[#475569]'
                  : opt.isOptimal
                    ? 'bg-[#10B981]/15 border-[#10B981] text-[#F8FAFC]'
                    : 'bg-[#EF4444]/15 border-[#EF4444] text-[#F8FAFC]';

                return (
                  <button
                    key={opt.text}
                    type="button"
                    onClick={() => handleDecision(idx)}
                    className={`w-full min-h-[52px] p-3.5 rounded-xl border text-left text-xs sm:text-sm leading-snug transition-colors ${stateStyle}`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>

            {chosenOptIdx !== null && (
              <div className="space-y-2.5">
                <div
                  className={`rounded-xl p-3.5 border flex items-start gap-2.5 text-xs leading-relaxed ${
                    selectedCase.decisionScenario.options[chosenOptIdx].isOptimal
                      ? 'bg-[#10B981]/10 border-[#10B981]/50 text-[#D1FAE5]'
                      : 'bg-[#EF4444]/10 border-[#EF4444]/50 text-[#FECACA]'
                  }`}
                >
                  {selectedCase.decisionScenario.options[chosenOptIdx].isOptimal ? (
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                  )}
                  <div>
                    {selectedCase.decisionScenario.options[chosenOptIdx].outcome}
                    {selectedCase.decisionScenario.options[chosenOptIdx].isOptimal && (
                      <span className="block font-mono font-bold text-[#10B981] mt-1">
                        +45 XP · +20 кристаллов
                      </span>
                    )}
                  </div>
                </div>

                {!selectedCase.decisionScenario.options[chosenOptIdx].isOptimal && (
                  <AiQueryCallout
                    title="Сноска · По какому запросу к ИИ получить оптимальное решение"
                    queryText={`Ты — AI-продакт и архитектор B2B-решений. Разбери кейс «${selectedCase.title}» (${selectedCase.modelName}). Ситуация: ${selectedCase.decisionScenario.situation} Какие технические ограничения, метрики и условия пилота нужно предложить, чтобы защитить сделку и маржу?`}
                    onAskMentor={
                      onAskMentor
                        ? (query) => onAskMentor(selectedCase.title, query)
                        : undefined
                    }
                  />
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {activeSubTab === 'calculator' && (
        <section className="rounded-2xl bg-[#111827] border border-[#334155]/70 p-4 sm:p-5 space-y-5">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#94A3B8]">Бизнес-модель</div>
            <div className="grid grid-cols-2 gap-2">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleModelSwitch(m)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    selectedModelId === m.id
                      ? 'bg-[#06B6D4]/15 border-[#06B6D4] text-[#4CD7F6]'
                      : 'bg-[#0B0F19] border-[#334155] text-[#94A3B8]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8]">
                  {currentModel.id === 'saas' ? 'Активных подписчиков' : 'Клиентов в месяц'}
                </span>
                <span className="font-mono font-bold tabular-nums text-[#F8FAFC]">{clients}</span>
              </div>
              <input
                type="range"
                min={1}
                max={currentModel.maxClients}
                step={currentModel.id === 'saas' ? 5 : 1}
                value={clients}
                onChange={(e) => setClients(Number(e.target.value))}
                className="w-full neuro-slider"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8]">Средний чек / тариф ({CURRENCY_CONFIG[currency].code})</span>
                <span className="font-mono font-bold tabular-nums text-[#F8FAFC]">
                  {formatMoneyFromRub(avgCheck, currency)}
                </span>
              </div>
              <input
                type="range"
                min={currentModel.minCheck}
                max={currentModel.maxCheck}
                step={currentModel.stepCheck}
                value={avgCheck}
                onChange={(e) => setAvgCheck(Number(e.target.value))}
                className="w-full neuro-slider"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8]">Доля задач на AI-агентах</span>
                <span className="font-mono font-bold tabular-nums text-[#D0BCFF]">
                  {aiLeverage}%
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={90}
                step={5}
                value={aiLeverage}
                onChange={(e) => setAiLeverage(Number(e.target.value))}
                className="w-full neuro-slider"
              />
            </div>
          </div>

          {/* Output Summary */}
          <div className="rounded-xl bg-[#0B0F19] border border-[#334155]/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94A3B8]">Чистая прибыль в месяц</span>
              <span className="font-mono text-2xl font-extrabold tabular-nums text-[#10B981]">
                {formatMoneyFromRub(netProfit, currency)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#1E293B] text-xs">
              <div>
                <div className="text-[#64748B]">Выручка</div>
                <div className="font-mono font-bold tabular-nums text-[#F8FAFC]">
                  {formatMoneyFromRub(grossRevenue, currency)}
                </div>
              </div>
              <div>
                <div className="text-[#64748B]">API и сервер</div>
                <div className="font-mono font-bold tabular-nums text-[#F59E0B]">
                  -{formatMoneyFromRub(apiCosts, currency)}
                </div>
              </div>
              <div>
                <div className="text-[#64748B]">Сэкономлено</div>
                <div className="font-mono font-bold tabular-nums text-[#4CD7F6]">
                  {savedHoursPerMonth} ч/мес
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSubTab === 'certificates' && (
        <div className="space-y-4">
          {/* Optional Student Registration Card */}
          <section className="rounded-2xl bg-[#111827] border border-[#06B6D4]/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/15 border border-[#06B6D4]/40 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5 text-[#4CD7F6]" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="text-sm font-bold text-[#F8FAFC]">
                  {progress.registration
                    ? `Студент: ${progress.registration.fullName}`
                    : 'Регистрация для получения сертификатов'}
                </div>
                <div className="text-xs text-[#94A3B8]">
                  {progress.registration
                    ? `${progress.registration.email}${progress.registration.location ? ` · ${progress.registration.location}` : ''}`
                    : 'Обучение свободно без регистрации. Для скачивания именного диплома укажи имя и email.'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenRegistration}
              className="btn-arcade-cyan min-h-[44px] px-4 rounded-xl text-xs font-bold shrink-0"
            >
              {progress.registration ? 'Изменить данные' : 'Зарегистрироваться'}
            </button>
          </section>

          {/* Certificates List */}
          <div className="space-y-3">
            {STAGE_CERTIFICATES.map((meta) => {
              const report = buildCertificateReport(meta, progress);
              const pct = Math.round(
                (report.completedNodesCount / Math.max(1, report.totalNodesCount)) * 100
              );

              return (
                <section
                  key={meta.id}
                  className={`rounded-2xl bg-[#111827] border p-4 sm:p-5 space-y-3.5 ${
                    report.isUnlocked ? 'border-[#10B981]/50' : 'border-[#334155]/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="text-xs font-semibold text-[#D0BCFF]">
                        {meta.qualification}
                      </div>
                      <h3 className="text-base font-bold text-[#F8FAFC] leading-snug">
                        {meta.title}
                      </h3>
                      <div className="text-xs text-[#94A3B8]">
                        Дисциплин: {report.completedNodesCount}/{report.totalNodesCount} · Вопросов
                        в программе: {report.totalQuestionsCount}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {report.isUnlocked ? (
                        <div>
                          <div className="font-mono text-lg font-extrabold tabular-nums text-[#10B981]">
                            {report.averageScorePct}%
                          </div>
                          <div className="text-[11px] font-semibold text-[#E2E8F0]">
                            {report.gradeLabel}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs font-mono text-[#64748B]">
                          <Lock className="w-3.5 h-3.5" />
                          <span>{pct}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="h-2 rounded-full bg-[#1E293B] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        report.isUnlocked ? 'bg-[#10B981]' : 'bg-[#06B6D4]'
                      }`}
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>

                  <div className="text-xs text-[#94A3B8]">
                    Темы:{' '}
                    {meta.chapterId === 'all'
                      ? 'Все 7 глав программы (от основ LLM до Evals и Guardrails)'
                      : report.disciplines.map((d) => d.nodeTitle).join(' · ')}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1E293B]">
                    <span className="font-mono text-xs text-[#F59E0B]">
                      Бонус этапа: +{meta.bonusXp} XP · +{meta.bonusCrystals} кристаллов
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      {report.isUnlocked && !report.bonusClaimed && (
                        <button
                          type="button"
                          onClick={() => onClaimStageBonus(meta.chapterId)}
                          className="btn-arcade-emerald min-h-[40px] px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                        >
                          <Diamond className="w-3.5 h-3.5" />
                          <span>Забрать бонус (+{meta.bonusCrystals})</span>
                        </button>
                      )}

                      {report.isUnlocked ? (
                        <button
                          type="button"
                          onClick={() => onOpenCertificate(meta.chapterId)}
                          className="btn-arcade-cyan min-h-[40px] px-4 rounded-xl text-xs font-bold flex items-center gap-1.5"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Открыть и скачать</span>
                        </button>
                      ) : (
                        <span className="text-xs text-[#64748B]">
                          Осталось уроков: {report.totalNodesCount - report.completedNodesCount}
                        </span>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === 'profile' && (
        <div className="space-y-4">
          {/* Optional Student Registration Status */}
          <section className="rounded-2xl bg-[#111827] border border-[#06B6D4]/40 p-4 flex items-center justify-between gap-3">
            <div className="min-w-0 space-y-0.5">
              <div className="text-xs font-semibold text-[#4CD7F6]">Именной профиль</div>
              <div className="text-sm font-bold text-[#F8FAFC] truncate">
                {progress.registration ? progress.registration.fullName : 'Не зарегистрирован'}
              </div>
              <div className="text-xs text-[#94A3B8] truncate">
                {progress.registration
                  ? progress.registration.email
                  : 'Нужен только для выпуска и скачивания сертификатов'}
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenRegistration}
              className="btn-arcade-surface min-h-[40px] px-3.5 rounded-xl text-xs font-semibold shrink-0"
            >
              {progress.registration ? 'Изменить' : 'Регистрация'}
            </button>
          </section>

          {/* Student Rank Card */}
          <section className="rounded-2xl bg-[#111827] border border-[#334155]/70 p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-[#4CD7F6]">
                  Уровень {rankInfo.level}
                </div>
                <h2 className="text-xl font-extrabold text-[#F8FAFC]">{rankInfo.title}</h2>
              </div>
              <div className="font-mono text-lg font-bold tabular-nums text-[#10B981]">
                {progress.xp} XP
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="h-3 rounded-full bg-[#1E293B] overflow-hidden">
                <div
                  className="h-full rounded-full neon-progress-fill"
                  style={{ width: `${Math.max(8, rankInfo.progressPct)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[#94A3B8]">
                <span>Прогресс ранга</span>
                <span className="font-mono tabular-nums">
                  {rankInfo.nextMinXp
                    ? `До след. уровня: ${rankInfo.nextMinXp - progress.xp} XP`
                    : 'Макс. уровень'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="rounded-xl bg-[#0B0F19] border border-[#1E293B] p-3">
                <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                  <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Серия</span>
                </div>
                <div className="font-mono text-lg font-bold tabular-nums text-[#F8FAFC] mt-1">
                  {progress.streakDays} дн.
                </div>
              </div>
              <div className="rounded-xl bg-[#0B0F19] border border-[#1E293B] p-3">
                <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                  <Diamond className="w-3.5 h-3.5 text-[#4CD7F6]" />
                  <span>Кристаллы</span>
                </div>
                <div className="font-mono text-lg font-bold tabular-nums text-[#F8FAFC] mt-1">
                  {progress.crystals}
                </div>
              </div>
              <div className="rounded-xl bg-[#0B0F19] border border-[#1E293B] p-3">
                <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                  <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Квесты</span>
                </div>
                <div className="font-mono text-lg font-bold tabular-nums text-[#F8FAFC] mt-1">
                  {progress.completedQuestIds.length}
                </div>
              </div>
            </div>
          </section>

          {/* Exclusive Weekly Mission Badges */}
          <section className="rounded-2xl bg-[#111827] border border-[#8B5CF6]/40 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-bold text-[#F8FAFC]">
                Эксклюзивные значки миссий
              </h3>
              <span className="font-mono text-xs tabular-nums text-[#D0BCFF]">
                {progress.earnedWeeklyBadges.length}/{ALL_WEEKLY_BADGES.length}
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Выдаются за выполнение еженедельных миссий и сохраняются в профиле навсегда.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ALL_WEEKLY_BADGES.map((badge) => {
                const earned = progress.earnedWeeklyBadges.some((b) => b.id === badge.id);
                const borderColor =
                  badge.accent === 'cyan'
                    ? 'border-[#06B6D4]/60 bg-[#06B6D4]/10'
                    : badge.accent === 'violet'
                      ? 'border-[#8B5CF6]/60 bg-[#8B5CF6]/10'
                      : badge.accent === 'emerald'
                        ? 'border-[#10B981]/60 bg-[#10B981]/10'
                        : 'border-[#F59E0B]/60 bg-[#F59E0B]/10';
                const titleColor =
                  badge.accent === 'cyan'
                    ? 'text-[#4CD7F6]'
                    : badge.accent === 'violet'
                      ? 'text-[#D0BCFF]'
                      : badge.accent === 'emerald'
                        ? 'text-[#10B981]'
                        : 'text-[#F59E0B]';

                return (
                  <div
                    key={badge.id}
                    className={`rounded-xl p-3 border flex items-start gap-3 ${
                      earned ? borderColor : 'bg-[#0B0F19] border-[#1E293B] opacity-55'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#0B0F19] border border-[#334155] flex items-center justify-center shrink-0">
                      <Award className={`w-4 h-4 ${earned ? titleColor : 'text-[#64748B]'}`} />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className={`text-xs font-bold ${earned ? titleColor : 'text-[#94A3B8]'}`}>
                        {badge.title}
                      </div>
                      <div className="text-[11px] text-[#94A3B8] leading-snug">
                        {badge.subtitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Achievements */}
          <section className="rounded-2xl bg-[#111827] border border-[#334155]/70 p-4 sm:p-5 space-y-3">
            <h3 className="text-base font-bold text-[#F8FAFC]">
              Достижения ({progress.unlockedAchievementIds.length}/{ACHIEVEMENTS.length})
            </h3>
            <div className="space-y-2.5">
              {ACHIEVEMENTS.map((ach) => {
                const unlocked = progress.unlockedAchievementIds.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`rounded-xl p-3.5 border flex items-center justify-between gap-3 ${
                      unlocked
                        ? 'bg-[#10B981]/10 border-[#10B981]/40'
                        : 'bg-[#0B0F19] border-[#1E293B] opacity-70'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-sm font-bold text-[#F8FAFC]">{ach.title}</div>
                      <div className="text-xs text-[#94A3B8]">{ach.description}</div>
                    </div>
                    <span
                      className={`font-mono text-xs font-bold shrink-0 ${
                        unlocked ? 'text-[#10B981]' : 'text-[#64748B]'
                      }`}
                    >
                      {unlocked ? 'Получено' : `+${ach.xpBonus} XP`}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#1E293B]/80">
              <button
                type="button"
                onClick={onResetProgress}
                className="min-h-[40px] px-3 py-1.5 rounded-lg text-xs text-[#94A3B8] hover:text-[#F8FAFC] flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Сбросить прогресс</span>
              </button>
              <span className="text-[11px] text-[#64748B]">
                Создатель проекта: Поставной Вячеслав Алексеевич
              </span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
