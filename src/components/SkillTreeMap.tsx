import { useState } from 'react';
import {
  Award,
  Bot,
  Brain,
  Check,
  Code2,
  Coins,
  Diamond,
  Layers,
  Lock,
  MessageSquareCode,
  Play,
  ShieldCheck,
  Star,
  Target,
} from 'lucide-react';
import { CHAPTERS, STAGE_CERTIFICATES } from '../data/curriculum';
import {
  Chapter,
  NodeStatus,
  PlayerProgress,
  SkillNode,
  WeeklyMission,
} from '../types/app';
import { WeeklyMissionsCard } from './WeeklyMissionsCard';

interface Props {
  progress: PlayerProgress;
  weeklyMissions: WeeklyMission[];
  currentNodeId: string | null;
  onSelectNode: (node: SkillNode) => void;
  onUnlockNode: (nodeId: string) => boolean;
  onClaimMission: (mission: WeeklyMission) => void;
  onClaimStageBonus: (chapterId: string | 'all') => void;
  onOpenCertificate: (chapterId: string | 'all') => void;
  onOpenRegistration: () => void;
  onGoToTab: (tab: 'trainer' | 'lab' | 'business') => void;
}

const CHAPTER_ICONS: Record<string, typeof Brain> = {
  'ch-1': Brain,
  'ch-2': MessageSquareCode,
  'ch-3': Bot,
  'ch-4': Code2,
  'ch-5': Coins,
  'ch-6': Layers,
  'ch-7': ShieldCheck,
};

const NODE_OFFSETS = ['translate-x-0', '-translate-x-10', 'translate-x-10'];

export function SkillTreeMap({
  progress,
  weeklyMissions,
  currentNodeId,
  onSelectNode,
  onUnlockNode,
  onClaimMission,
  onClaimStageBonus,
  onOpenCertificate,
  onOpenRegistration,
  onGoToTab,
}: Props) {
  const [unlockNotice, setUnlockNotice] = useState<string | null>(null);
  const [mobileMissionTab, setMobileMissionTab] = useState<'weekly' | 'daily'>('weekly');

  const totalNodes = CHAPTERS.reduce((acc, ch) => acc + ch.nodes.length, 0);
  const completedCount = progress.completedNodeIds.length;
  const masteryPct = Math.round((completedCount / totalNodes) * 100);

  const getNodeStatus = (node: SkillNode): NodeStatus => {
    if (progress.completedNodeIds.includes(node.id)) return 'completed';
    if (node.id === currentNodeId) return 'current';
    return 'locked';
  };

  const handleNodeTap = (node: SkillNode, status: NodeStatus) => {
    if (status === 'locked') {
      setUnlockNotice(node.id);
      return;
    }
    setUnlockNotice(null);
    onSelectNode(node);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Summary Banner */}
      <section className="rounded-2xl bg-[#111827] border border-[#334155]/70 p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-medium text-[#4CD7F6]">
              Карта навыков · {completedCount} из {totalNodes} уроков
            </div>
            <h1 className="text-2xl font-extrabold text-[#F8FAFC] leading-tight">
              Путь AI-практика
            </h1>
            <p className="text-sm text-[#94A3B8]">
              Проходи этапы, забирай бонусы и получай именные сертификаты с оценкой и списком вопросов.
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="font-mono text-2xl font-bold tabular-nums text-[#F8FAFC]">
              {masteryPct}%
            </div>
            <div className="text-xs text-[#94A3B8]">освоено</div>
          </div>
        </div>

        <div className="h-3 rounded-full bg-[#1E293B] overflow-hidden">
          <div
            className="h-full rounded-full neon-progress-fill transition-all duration-300"
            style={{ width: `${Math.max(6, masteryPct)}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <span className="text-[#94A3B8]">
            {progress.registration
              ? `Студент: ${progress.registration.fullName}`
              : 'Регистрация по желанию для выпуска сертификатов'}
          </span>
          <button
            type="button"
            onClick={onOpenRegistration}
            className="font-semibold text-[#4CD7F6] hover:underline"
          >
            {progress.registration ? 'Профиль сертификата' : 'Зарегистрироваться'}
          </button>
        </div>
      </section>

      {/* Mobile Mission Switcher (Weekly Missions | Daily Challenges) */}
      <div className="lg:hidden space-y-3">
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#334155]/70">
          <button
            type="button"
            onClick={() => setMobileMissionTab('weekly')}
            className={`min-h-[40px] rounded-lg text-xs font-bold transition-colors ${
              mobileMissionTab === 'weekly'
                ? 'bg-[#8B5CF6] text-white'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Миссии недели
          </button>
          <button
            type="button"
            onClick={() => setMobileMissionTab('daily')}
            className={`min-h-[40px] rounded-lg text-xs font-bold transition-colors ${
              mobileMissionTab === 'daily'
                ? 'bg-[#06B6D4] text-[#082F49]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Ежедневные
          </button>
        </div>

        {mobileMissionTab === 'weekly' ? (
          <WeeklyMissionsCard
            progress={progress}
            missions={weeklyMissions}
            onClaimMission={onClaimMission}
          />
        ) : (
          <section className="rounded-2xl bg-[#111827] border border-[#334155]/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#F59E0B]" />
                <h2 className="text-sm font-bold text-[#F8FAFC]">Ежедневные челленджи</h2>
              </div>
              <span className="font-mono text-xs tabular-nums text-[#94A3B8]">Сегодня</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <ChallengeRow
                title="Пройди 2 урока на карте"
                current={Math.min(2, completedCount)}
                target={2}
                reward="+30 XP"
              />
              <ChallengeRow
                title="Реши 1 квест в Тренажере промптов"
                current={Math.min(1, progress.completedQuestIds.length)}
                target={1}
                reward="+25 кристаллов"
                onAction={() => onGoToTab('trainer')}
                actionLabel="Открыть"
              />
              <ChallengeRow
                title="Запусти агента или MVP в Лаборатории"
                current={Math.min(1, progress.agentsRunCount + progress.mvpsBuiltCount)}
                target={1}
                reward="+40 XP"
                onAction={() => onGoToTab('lab')}
                actionLabel="В лабу"
              />
            </div>
          </section>
        )}
      </div>

      {/* Desktop Weekly Missions Card */}
      <div className="hidden lg:block">
        <WeeklyMissionsCard
          progress={progress}
          missions={weeklyMissions}
          onClaimMission={onClaimMission}
        />
      </div>

      {/* Chapters & Oscillating Skill Path */}
      <div className="space-y-8">
        {CHAPTERS.map((chapter) => (
          <ChapterSection
            key={chapter.id}
            chapter={chapter}
            claimedStageIds={progress.claimedStageIds}
            getNodeStatus={getNodeStatus}
            unlockNoticeNodeId={unlockNotice}
            crystals={progress.crystals}
            onTapNode={handleNodeTap}
            onUnlock={(nodeId) => {
              const ok = onUnlockNode(nodeId);
              if (ok) {
                setUnlockNotice(null);
              }
            }}
            onClaimStageBonus={() => onClaimStageBonus(chapter.id)}
            onOpenCertificate={() => onOpenCertificate(chapter.id)}
            onDismissNotice={() => setUnlockNotice(null)}
          />
        ))}
      </div>
    </div>
  );
}

function ChallengeRow({
  title,
  current,
  target,
  reward,
  onAction,
  actionLabel,
}: {
  title: string;
  current: number;
  target: number;
  reward: string;
  onAction?: () => void;
  actionLabel?: string;
}) {
  const done = current >= target;
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-[#1E293B] last:border-b-0">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`font-medium truncate ${done ? 'text-[#10B981]' : 'text-[#E2E8F0]'}`}>
            {done ? '✓ ' : ''}
            {title}
          </span>
          <span className="font-mono tabular-nums text-[#94A3B8] shrink-0">
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
      {onAction && !done ? (
        <button
          type="button"
          onClick={onAction}
          className="min-h-[36px] px-2.5 rounded-lg bg-[#171B26] border border-[#334155] text-[#4CD7F6] font-semibold shrink-0 hover:border-[#06B6D4]"
        >
          {actionLabel}
        </button>
      ) : (
        <span className="font-mono text-[11px] text-[#F59E0B] shrink-0">{reward}</span>
      )}
    </div>
  );
}

function ChapterSection({
  chapter,
  claimedStageIds,
  getNodeStatus,
  unlockNoticeNodeId,
  crystals,
  onTapNode,
  onUnlock,
  onClaimStageBonus,
  onOpenCertificate,
  onDismissNotice,
}: {
  chapter: Chapter;
  claimedStageIds: string[];
  getNodeStatus: (node: SkillNode) => NodeStatus;
  unlockNoticeNodeId: string | null;
  crystals: number;
  onTapNode: (node: SkillNode, status: NodeStatus) => void;
  onUnlock: (nodeId: string) => void;
  onClaimStageBonus: () => void;
  onOpenCertificate: () => void;
  onDismissNotice: () => void;
}) {
  const Icon = CHAPTER_ICONS[chapter.id] ?? Brain;
  const doneInChapter = chapter.nodes.filter((n) => getNodeStatus(n) === 'completed').length;
  const stageDone = doneInChapter === chapter.nodes.length;
  const stageMeta = STAGE_CERTIFICATES.find((c) => c.chapterId === chapter.id);
  const bonusClaimed = claimedStageIds.includes(chapter.id);

  const accentText =
    chapter.accent === 'violet'
      ? 'text-[#D0BCFF]'
      : chapter.accent === 'emerald'
        ? 'text-[#10B981]'
        : chapter.accent === 'amber'
          ? 'text-[#F59E0B]'
          : 'text-[#4CD7F6]';

  return (
    <section className="space-y-5">
      {/* Chapter Banner */}
      <div className="rounded-2xl bg-[#111827] border border-[#334155]/70 p-4 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#171B26] border border-[#334155] flex items-center justify-center shrink-0">
              <Icon className={`w-5 h-5 ${accentText}`} />
            </div>
            <div className="min-w-0">
              <div className={`text-xs font-semibold ${accentText}`}>
                Глава {chapter.number} · {doneInChapter}/{chapter.nodes.length} пройдено
              </div>
              <h2 className="text-lg font-bold text-[#F8FAFC] leading-snug">{chapter.title}</h2>
              <p className="text-xs text-[#94A3B8] mt-0.5 line-clamp-2">{chapter.description}</p>
            </div>
          </div>
        </div>

        {stageMeta && (
          <div className="pt-2.5 border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-[#94A3B8]">
              <Award className={`w-4 h-4 ${stageDone ? 'text-[#F59E0B]' : 'text-[#64748B]'}`} />
              <span>
                {stageDone
                  ? 'Этап завершён · сертификат открыт'
                  : `Бонус этапа: +${stageMeta.bonusXp} XP, +${stageMeta.bonusCrystals} кристаллов и сертификат`}
              </span>
            </div>

            {stageDone && (
              <div className="flex flex-wrap items-center gap-2">
                {!bonusClaimed && (
                  <button
                    type="button"
                    onClick={onClaimStageBonus}
                    className="btn-arcade-emerald min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                  >
                    <Diamond className="w-3.5 h-3.5" />
                    <span>Бонус +{stageMeta.bonusCrystals}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenCertificate}
                  className="btn-arcade-cyan min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Сертификат</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Oscillating Path Nodes */}
      <div className="relative flex flex-col items-center gap-7 py-2">
        {/* Subtle vertical spine SVG behind nodes */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute top-6 bottom-6 left-1/2 -translate-x-1/2 w-36 h-[calc(100%-3rem)]"
          viewBox="0 0 140 300"
          preserveAspectRatio="none"
        >
          <path
            d="M 70 10 C 70 70, 22 70, 22 145 C 22 220, 118 220, 118 290"
            fill="none"
            stroke="#334155"
            strokeWidth="3"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
        </svg>

        {chapter.nodes.map((node, index) => {
          const status = getNodeStatus(node);
          const offset = NODE_OFFSETS[index % NODE_OFFSETS.length];
          const isCurrent = status === 'current';
          const isCompleted = status === 'completed';
          const showUnlockBox = unlockNoticeNodeId === node.id;

          return (
            <div
              key={node.id}
              className={`relative z-10 flex flex-col items-center gap-2 ${offset}`}
            >
              {isCurrent && (
                <div className="animate-float-pointer px-2.5 py-1 rounded-lg bg-[#06B6D4] text-[#082F49] font-mono text-[11px] font-bold tracking-wide">
                  Старт
                </div>
              )}

              <button
                type="button"
                onClick={() => onTapNode(node, status)}
                aria-label={`${node.title} (${isCompleted ? 'пройден' : isCurrent ? 'активен' : 'закрыт'})`}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-transform ${
                  isCompleted
                    ? 'bg-[#10B981] text-[#022C22] node-arcade-emerald'
                    : isCurrent
                      ? 'bg-[#06B6D4] text-[#082F49] node-arcade-cyan'
                      : 'bg-[#1E293B] text-[#64748B] border border-[#334155] node-arcade-locked opacity-80'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-7 h-7 stroke-[2.75]" />
                ) : isCurrent ? (
                  <Play className="w-7 h-7 fill-current ml-0.5" />
                ) : (
                  <Lock className="w-6 h-6" />
                )}

                {isCompleted && (
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#F59E0B] border-2 border-[#0B0F19] flex items-center justify-center">
                    <Star className="w-3.5 h-3.5 text-[#0B0F19] fill-current" />
                  </span>
                )}
              </button>

              <div className="text-center max-w-[190px]">
                <div
                  className={`text-sm font-semibold leading-tight ${
                    status === 'locked' ? 'text-[#94A3B8]' : 'text-[#F8FAFC]'
                  }`}
                >
                  {node.title}
                </div>
                <div className="text-[11px] text-[#64748B] mt-0.5">
                  +{node.xpReward} XP · {node.durationMin} мин
                </div>
              </div>

              {showUnlockBox && (
                <div className="mt-1 w-64 rounded-xl bg-[#171B26] border border-[#8B5CF6]/60 p-3 text-center space-y-2.5">
                  <div className="text-xs text-[#E2E8F0]">
                    Пройди предыдущие уроки или открой этот модуль сразу за 15 кристаллов.
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      disabled={crystals < 15}
                      onClick={() => onUnlock(node.id)}
                      className="btn-arcade-violet min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <Diamond className="w-3.5 h-3.5" />
                      <span>Открыть (-15)</span>
                    </button>
                    <button
                      type="button"
                      onClick={onDismissNotice}
                      className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#0B0F19] text-xs text-[#94A3B8] hover:text-[#F8FAFC]"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
