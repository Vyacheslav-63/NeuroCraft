/**
 * NeuroCraft — Игровая академия ИИ, агентов и монетизации
 * @author Поставной Вячеслав Алексеевич
 * @license MIT
 */
import { useEffect, useState } from 'react';
import {
  Award,
  Bot,
  Briefcase,
  Compass,
  Cpu,
  Diamond,
  Flame,
  Globe,
  MessageSquareCode,
  Play,
  Sparkles,
  Target,
  UserCheck,
  Zap,
} from 'lucide-react';
import { AiLab } from './components/AiLab';
import { AiMentorModal } from './components/AiMentorModal';
import { BusinessHub } from './components/BusinessHub';
import { CertificatePreviewModal } from './components/CertificatePreviewModal';
import { LessonModal } from './components/LessonModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PromptTrainer } from './components/PromptTrainer';
import { PWAInstallButton } from './components/PWAInstallButton';
import { RegistrationModal } from './components/RegistrationModal';
import { SkillTreeMap } from './components/SkillTreeMap';
import { STAGE_CERTIFICATES } from './data/curriculum';
import { usePlayerProgress } from './hooks/usePlayerProgress';
import { AppCurrency, AppLanguage, UI_TEXT } from './i18n/locale';
import { ScreenTab, SkillNode, StudentRegistration } from './types/app';
import { buildCertificateReport } from './utils/certificateGenerator';

const LANG_OPTIONS: AppLanguage[] = ['ru', 'en', 'es'];
const CURRENCY_OPTIONS: AppCurrency[] = ['RUB', 'USD', 'EUR', 'GBP'];

export default function App() {
  const [activeTab, setActiveTab] = useState<ScreenTab>('map');
  const [activeLesson, setActiveLesson] = useState<SkillNode | null>(null);
  const [mentorOpen, setMentorOpen] = useState(false);
  const [mentorTopic, setMentorTopic] = useState<string | undefined>(undefined);
  const [mentorInitialQuery, setMentorInitialQuery] = useState<string | undefined>(undefined);
  const [showRegionMenu, setShowRegionMenu] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [pendingCertChapterId, setPendingCertChapterId] = useState<string | 'all' | null>(null);
  const [activeCertChapterId, setActiveCertChapterId] = useState<string | 'all' | null>(null);

  const [language, setLanguage] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem('neurocraft_lang') as AppLanguage | null;
      if (saved && LANG_OPTIONS.includes(saved)) return saved;
    } catch {
      // ignore
    }
    return 'ru';
  });

  const [currency, setCurrency] = useState<AppCurrency>(() => {
    try {
      const saved = localStorage.getItem('neurocraft_currency') as AppCurrency | null;
      if (saved && CURRENCY_OPTIONS.includes(saved)) return saved;
    } catch {
      // ignore
    }
    return 'RUB';
  });

  useEffect(() => {
    try {
      localStorage.setItem('neurocraft_lang', language);
      localStorage.setItem('neurocraft_currency', currency);
    } catch {
      // ignore
    }
  }, [language, currency]);

  const {
    progress,
    weeklyMissions,
    rankInfo,
    currentNodeId,
    allNodes,
    completeNode,
    unlockNodeWithCrystals,
    spendEnergy,
    refillEnergyWithCrystals,
    completeQuest,
    recordAgentRun,
    recordMvpBuilt,
    completeBusinessCase,
    recordMentorQuestion,
    claimWeeklyMission,
    claimStageBonus,
    saveRegistration,
    resetProgress,
  } = usePlayerProgress();

  const t = UI_TEXT[language];
  const currentNode = allNodes.find((n) => n.id === currentNodeId) ?? allNodes[0];

  const navItems: { id: ScreenTab; label: string; icon: typeof Compass }[] = [
    { id: 'map', label: t.nav.map, icon: Compass },
    { id: 'trainer', label: t.nav.trainer, icon: MessageSquareCode },
    { id: 'lab', label: t.nav.lab, icon: Cpu },
    { id: 'business', label: t.nav.business, icon: Briefcase },
  ];

  const openMentor = (topic?: string, prefillQuery?: string) => {
    setMentorTopic(topic);
    setMentorInitialQuery(prefillQuery);
    setMentorOpen(true);
  };

  const handleOpenCertificate = (chapterId: string | 'all') => {
    if (!progress.registration) {
      setPendingCertChapterId(chapterId);
      setRegistrationModalOpen(true);
      return;
    }
    setActiveCertChapterId(chapterId);
  };

  const handleSaveRegistration = (reg: StudentRegistration) => {
    saveRegistration(reg);
    setRegistrationModalOpen(false);
    if (pendingCertChapterId) {
      setActiveCertChapterId(pendingCertChapterId);
      setPendingCertChapterId(null);
    }
  };

  const activeCertMeta = activeCertChapterId
    ? STAGE_CERTIFICATES.find((c) => c.chapterId === activeCertChapterId) ?? null
    : null;
  const pendingCertMeta = pendingCertChapterId
    ? STAGE_CERTIFICATES.find((c) => c.chapterId === pendingCertChapterId) ?? null
    : null;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC]">
      {/* Mobile Compact Sticky Top HUD (48px) */}
      <header className="lg:hidden sticky top-0 z-30 h-12 bg-[#0B0F19]/90 backdrop-blur-md border-b border-[#1E293B] px-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-['Outfit'] text-base font-extrabold tracking-tight text-[#F8FAFC] whitespace-nowrap shrink-0">
            NeuroCraft
          </span>
          <button
            type="button"
            onClick={() => setShowRegionMenu((v) => !v)}
            aria-label={t.hud.regionLabel}
            className="min-h-[34px] px-2 rounded-lg bg-[#111827] border border-[#334155] font-mono text-[11px] font-bold text-[#94A3B8] hover:text-[#F8FAFC] flex items-center gap-1 shrink-0"
          >
            <Globe className="w-3 h-3 text-[#4CD7F6]" />
            <span>{language.toUpperCase()}</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5 font-mono text-xs font-bold tabular-nums shrink-0">
          <div className="flex items-center gap-1 text-[#F59E0B]" title={t.hud.streak}>
            <Flame className="w-3.5 h-3.5" />
            <span>{progress.streakDays}</span>
          </div>
          <div className="flex items-center gap-1 text-[#10B981]" title="XP">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{progress.xp}</span>
          </div>
          <div className="flex items-center gap-1 text-[#4CD7F6]" title={t.hud.crystals}>
            <Diamond className="w-3.5 h-3.5" />
            <span>{progress.crystals}</span>
          </div>
          <PWAInstallButton headerPill />
          <button
            type="button"
            onClick={() => openMentor()}
            aria-label={t.hud.askMentor}
            className="min-h-[34px] px-2 rounded-lg bg-[#06B6D4]/15 border border-[#06B6D4]/60 text-[#4CD7F6] flex items-center gap-1 text-[11px] font-bold whitespace-nowrap"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{t.hud.askMentorShort}</span>
          </button>
        </div>
      </header>

      {/* Mobile Region & Currency Dropdown */}
      {showRegionMenu && (
        <div className="lg:hidden sticky top-12 z-30 bg-[#111827] border-b border-[#334155] px-4 py-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8]">{t.hud.regionLabel}</span>
            <button
              type="button"
              onClick={() => setShowRegionMenu(false)}
              className="text-xs text-[#4CD7F6] font-semibold"
            >
              OK
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {LANG_OPTIONS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l)}
                className={`min-h-[36px] px-3 rounded-lg text-xs font-mono font-bold border ${
                  language === l
                    ? 'bg-[#06B6D4] text-[#082F49] border-[#06B6D4]'
                    : 'bg-[#0B0F19] text-[#94A3B8] border-[#334155]'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
            {CURRENCY_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`min-h-[36px] px-3 rounded-lg text-xs font-mono font-bold border ${
                  currency === c
                    ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                    : 'bg-[#0B0F19] text-[#94A3B8] border-[#334155]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="pt-1">
            <PWAInstallButton compact />
          </div>
        </div>
      )}

      {/* Responsive Shell: 1-col mobile, 3-col desktop */}
      <div className="max-w-[1340px] mx-auto px-4 lg:px-6 pt-4 pb-20 lg:py-6 lg:grid lg:grid-cols-[236px_minmax(0,1fr)_306px] lg:gap-7">
        {/* Desktop Left Navigation Rail */}
        <aside className="hidden lg:flex flex-col gap-5 sticky top-6 self-start">
          <div className="px-2">
            <div className="font-['Outfit'] text-2xl font-extrabold tracking-tight text-[#F8FAFC]">
              NeuroCraft
            </div>
          </div>

          <nav className="space-y-1.5" aria-label="Основная навигация">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full min-h-[48px] px-3.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#06B6D4]/15 border border-[#06B6D4]/60 text-[#4CD7F6]'
                      : 'text-[#94A3B8] border border-transparent hover:bg-[#111827] hover:text-[#F8FAFC]'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Desktop Rank Card */}
          <div className="rounded-2xl bg-[#111827] border border-[#334155]/70 p-4 space-y-3">
            <div className="space-y-0.5">
              <div className="text-xs font-medium text-[#4CD7F6]">
                {t.hud.level} {rankInfo.level}
              </div>
              <div className="text-sm font-bold text-[#F8FAFC]">{rankInfo.title}</div>
            </div>
            <div className="h-2.5 rounded-full bg-[#1E293B] overflow-hidden">
              <div
                className="h-full rounded-full neon-progress-fill"
                style={{ width: `${Math.max(8, rankInfo.progressPct)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-mono tabular-nums text-[#94A3B8]">
              <span>{progress.xp} XP</span>
              <span>{rankInfo.nextMinXp ? `${rankInfo.nextMinXp} XP` : 'MAX'}</span>
            </div>
          </div>

          {/* Global Region & Currency Switcher */}
          <div className="rounded-2xl bg-[#111827] border border-[#334155]/70 p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8]">
              <Globe className="w-3.5 h-3.5 text-[#4CD7F6]" />
              <span>{t.hud.regionLabel}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {LANG_OPTIONS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  className={`min-h-[34px] rounded-lg text-xs font-mono font-bold border ${
                    language === l
                      ? 'bg-[#06B6D4] text-[#082F49] border-[#06B6D4]'
                      : 'bg-[#0B0F19] text-[#94A3B8] border-[#334155] hover:text-[#F8FAFC]'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {CURRENCY_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`min-h-[34px] rounded-lg text-[11px] font-mono font-bold border ${
                    currency === c
                      ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                      : 'bg-[#0B0F19] text-[#94A3B8] border-[#334155] hover:text-[#F8FAFC]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          {/* Student & Certificates Card */}
          <div className="rounded-2xl bg-[#111827] border border-[#334155]/70 p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8]">
              <UserCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Сертификаты</span>
            </div>
            <div className="text-xs text-[#CBD5E1] leading-snug">
              {progress.registration ? (
                <span>
                  Студент:{' '}
                  <strong className="text-[#F8FAFC]">{progress.registration.fullName}</strong>
                </span>
              ) : (
                'Регистрация по желанию для скачивания именных дипломов'
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setPendingCertChapterId(null);
                setRegistrationModalOpen(true);
              }}
              className="w-full min-h-[38px] px-3 rounded-xl bg-[#0B0F19] border border-[#334155] text-xs font-semibold text-[#4CD7F6] hover:border-[#06B6D4] flex items-center justify-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{progress.registration ? 'Данные диплома' : 'Регистрация'}</span>
            </button>
          </div>

          <PWAInstallButton />

          <div className="px-2 text-[11px] text-[#64748B] leading-snug">
            Автор: Поставной Вячеслав Алексеевич
          </div>
        </aside>

        {/* Center Main Workspace */}
        <main className="min-w-0">
          {activeTab === 'map' && (
            <SkillTreeMap
              progress={progress}
              weeklyMissions={weeklyMissions}
              currentNodeId={currentNodeId}
              onSelectNode={(node) => setActiveLesson(node)}
              onUnlockNode={(nodeId) => unlockNodeWithCrystals(nodeId, 15)}
              onClaimMission={claimWeeklyMission}
              onClaimStageBonus={claimStageBonus}
              onOpenCertificate={handleOpenCertificate}
              onOpenRegistration={() => {
                setPendingCertChapterId(null);
                setRegistrationModalOpen(true);
              }}
              onGoToTab={(tab) => setActiveTab(tab)}
            />
          )}
          {activeTab === 'trainer' && (
            <PromptTrainer
              progress={progress}
              language={language}
              onCompleteQuest={completeQuest}
            />
          )}
          {activeTab === 'lab' && (
            <AiLab
              language={language}
              onAgentRun={recordAgentRun}
              onMvpBuilt={recordMvpBuilt}
            />
          )}
          {activeTab === 'business' && (
            <BusinessHub
              progress={progress}
              currency={currency}
              rankInfo={rankInfo}
              onCompleteCase={completeBusinessCase}
              onClaimStageBonus={claimStageBonus}
              onOpenCertificate={handleOpenCertificate}
              onOpenRegistration={() => {
                setPendingCertChapterId(null);
                setRegistrationModalOpen(true);
              }}
              onAskMentor={openMentor}
              onResetProgress={resetProgress}
            />
          )}
        </main>

        {/* Desktop Right Telemetry, AI Mentor & Daily Quests Rail */}
        <aside className="hidden lg:flex flex-col gap-5 sticky top-6 self-start">
          {/* HUD Metrics Card */}
          <div className="rounded-2xl bg-[#111827] border border-[#334155]/70 p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#0B0F19] border border-[#1E293B] p-3">
                <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                  <Flame className="w-4 h-4 text-[#F59E0B]" />
                  <span>{t.hud.streak}</span>
                </div>
                <div className="font-mono text-lg font-bold tabular-nums text-[#F8FAFC] mt-1">
                  {progress.streakDays}
                </div>
              </div>

              <div className="rounded-xl bg-[#0B0F19] border border-[#1E293B] p-3">
                <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                  <Diamond className="w-4 h-4 text-[#4CD7F6]" />
                  <span>{t.hud.crystals}</span>
                </div>
                <div className="font-mono text-lg font-bold tabular-nums text-[#F8FAFC] mt-1">
                  {progress.crystals}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#1E293B]">
              <div className="flex items-center gap-2 text-xs">
                <Zap className="w-4 h-4 text-[#8B5CF6]" />
                <span className="text-[#94A3B8]">{t.hud.energy}:</span>
                <span className="font-mono font-bold tabular-nums text-[#F8FAFC]">
                  {progress.energy}/{progress.maxEnergy}
                </span>
              </div>
              {progress.energy < progress.maxEnergy && (
                <button
                  type="button"
                  disabled={progress.crystals < 20}
                  onClick={refillEnergyWithCrystals}
                  className="text-xs font-semibold text-[#D0BCFF] hover:underline disabled:opacity-40"
                >
                  {t.hud.refill}
                </button>
              )}
            </div>
          </div>

          {/* Live AI Mentor Q&A Card */}
          <div className="rounded-2xl bg-[#111827] border border-[#8B5CF6]/50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D0BCFF]">
              <Bot className="w-4 h-4 text-[#4CD7F6]" />
              <span>{t.mentor.title}</span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">{t.mentor.subtitle}</p>
            <button
              type="button"
              onClick={() => openMentor()}
              className="btn-arcade-violet w-full min-h-[44px] rounded-xl font-bold text-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.hud.askMentor} (+10 XP)</span>
            </button>
          </div>

          {/* Active Next Lesson CTA */}
          {currentNode && (
            <div className="rounded-2xl bg-[#111827] border border-[#06B6D4]/40 p-4 space-y-3">
              <div className="text-xs font-semibold text-[#4CD7F6]">{t.hud.nextStep}</div>
              <div>
                <div className="text-base font-bold text-[#F8FAFC]">{currentNode.title}</div>
                <div className="text-xs text-[#94A3B8] mt-0.5">{currentNode.subtitle}</div>
              </div>
              <button
                type="button"
                onClick={() => setActiveLesson(currentNode)}
                className="btn-arcade-cyan w-full min-h-[44px] rounded-xl font-bold text-xs flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {t.hud.startLesson} (+{currentNode.xpReward} XP)
                </span>
              </button>
            </div>
          )}

          {/* Daily Challenges */}
          <div className="rounded-2xl bg-[#111827] border border-[#334155]/70 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#F59E0B]" />
              <h2 className="text-sm font-bold text-[#F8FAFC]">{t.hud.dailyChallenges}</h2>
            </div>

            <div className="space-y-3 text-xs">
              <DesktopChallenge
                label="Пройди 2 урока на карте"
                current={Math.min(2, progress.completedNodeIds.length)}
                target={2}
              />
              <DesktopChallenge
                label="Реши 1 квест в тренажере"
                current={Math.min(1, progress.completedQuestIds.length)}
                target={1}
              />
              <DesktopChallenge
                label="Запусти агента или MVP"
                current={Math.min(1, progress.agentsRunCount + progress.mvpsBuiltCount)}
                target={1}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Fixed Bottom Tab Bar (60px) */}
      <nav
        aria-label="Мобильная навигация"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-[60px] bg-[#0B0F19]/95 backdrop-blur-md border-t border-[#1E293B] grid grid-cols-4 items-center px-1"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors ${
                isActive ? 'text-[#4CD7F6]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <Icon className="w-[21px] h-[21px]" />
              <span className="text-[11px] font-semibold tracking-tight whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Interactive Micro-Lesson Modal */}
      {activeLesson && (
        <LessonModal
          node={activeLesson}
          energy={progress.energy}
          crystals={progress.crystals}
          alreadyCompleted={progress.completedNodeIds.includes(activeLesson.id)}
          onClose={() => setActiveLesson(null)}
          onMistake={spendEnergy}
          onRefillEnergy={refillEnergyWithCrystals}
          onComplete={completeNode}
          onAskMentor={(topic, prefillQuery) => openMentor(topic, prefillQuery)}
        />
      )}

      {/* Global Live-Search AI Mentor Modal */}
      {mentorOpen && (
        <AiMentorModal
          language={language}
          topicContext={mentorTopic}
          initialQuestion={mentorInitialQuery}
          onClose={() => {
            setMentorOpen(false);
            setMentorInitialQuery(undefined);
          }}
          onQuestionAnswered={recordMentorQuestion}
        />
      )}

      {/* Optional Student Registration Modal */}
      {registrationModalOpen && (
        <RegistrationModal
          initialRegistration={progress.registration}
          pendingCertificateTitle={pendingCertMeta?.title}
          onSave={handleSaveRegistration}
          onClose={() => {
            setRegistrationModalOpen(false);
            setPendingCertChapterId(null);
          }}
        />
      )}

      {/* Interactive Certificate Preview & Download Modal */}
      {activeCertMeta && progress.registration && (
        <CertificatePreviewModal
          report={buildCertificateReport(activeCertMeta, progress)}
          registration={progress.registration}
          onEditRegistration={() => {
            setPendingCertChapterId(activeCertMeta.chapterId);
            setActiveCertChapterId(null);
            setRegistrationModalOpen(true);
          }}
          onClose={() => setActiveCertChapterId(null)}
        />
      )}

      <OfflineIndicator />
    </div>
  );
}

function DesktopChallenge({
  label,
  current,
  target,
}: {
  label: string;
  current: number;
  target: number;
}) {
  const done = current >= target;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className={done ? 'text-[#10B981] font-medium' : 'text-[#CBD5E1]'}>
          {done ? '✓ ' : ''}
          {label}
        </span>
        <span className="font-mono tabular-nums text-[#94A3B8]">
          {current}/{target}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[#1E293B] overflow-hidden">
        <div
          className={`h-full rounded-full ${done ? 'bg-[#10B981]' : 'bg-[#06B6D4]'}`}
          style={{ width: `${Math.round((current / target) * 100)}%` }}
        />
      </div>
    </div>
  );
}
