import { Award, CalendarClock, CheckCircle2, Diamond } from 'lucide-react';
import { getTimeUntilNextMonday } from '../data/weeklyMissions';
import { PlayerProgress, WeeklyMission } from '../types/app';

interface Props {
  progress: PlayerProgress;
  missions: WeeklyMission[];
  onClaimMission: (mission: WeeklyMission) => void;
  compact?: boolean;
}

export function WeeklyMissionsCard({
  progress,
  missions,
  onClaimMission,
  compact = false,
}: Props) {
  const { days, hours } = getTimeUntilNextMonday();
  const claimedCount = missions.filter((m) =>
    progress.weekly.claimedMissionIds.includes(m.id)
  ).length;

  return (
    <section className="rounded-2xl bg-[#111827] border border-[#8B5CF6]/40 p-4 sm:p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D0BCFF]">
            <CalendarClock className="w-4 h-4 text-[#8B5CF6]" />
            <span>Обновление каждый понедельник</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC]">
            Еженедельные миссии · {claimedCount}/{missions.length}
          </h2>
        </div>

        <span className="font-mono text-xs tabular-nums text-[#94A3B8] shrink-0">
          {days}д {hours}ч
        </span>
      </div>

      <div className="space-y-3">
        {missions.map((mission) => {
          const current = Math.min(
            mission.target,
            progress.weekly.counts[mission.metric] ?? 0
          );
          const completed = current >= mission.target;
          const claimed = progress.weekly.claimedMissionIds.includes(mission.id);
          const pct = Math.round((current / mission.target) * 100);

          return (
            <div
              key={mission.id}
              className={`rounded-xl p-3.5 border space-y-2.5 ${
                claimed
                  ? 'bg-[#10B981]/10 border-[#10B981]/40'
                  : completed
                    ? 'bg-[#06B6D4]/10 border-[#06B6D4]/60'
                    : 'bg-[#0B0F19] border-[#1E293B]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 space-y-0.5">
                  <div className="text-sm font-bold text-[#F8FAFC] leading-snug">
                    {mission.title}
                  </div>
                  {!compact && (
                    <div className="text-xs text-[#94A3B8] leading-snug">
                      {mission.description}
                    </div>
                  )}
                </div>
                <span className="font-mono text-xs font-bold tabular-nums text-[#4CD7F6] shrink-0">
                  {current}/{mission.target}
                </span>
              </div>

              <div className="h-2 rounded-full bg-[#1E293B] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    claimed ? 'bg-[#10B981]' : 'neon-progress-fill'
                  }`}
                  style={{ width: `${Math.max(4, pct)}%` }}
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-0.5 text-xs">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-mono font-bold text-[#F59E0B] flex items-center gap-1">
                    <Diamond className="w-3.5 h-3.5 text-[#4CD7F6]" />+{mission.crystalReward}
                  </span>
                  <span className="font-mono text-[#10B981]">+{mission.xpReward} XP</span>
                  {mission.badge && (
                    <span className="text-[#D0BCFF] flex items-center gap-1 truncate">
                      <Award className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{mission.badge.title}</span>
                    </span>
                  )}
                </div>

                {claimed ? (
                  <span className="flex items-center gap-1 text-[#10B981] font-semibold shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Получено</span>
                  </span>
                ) : completed ? (
                  <button
                    type="button"
                    onClick={() => onClaimMission(mission)}
                    className="btn-arcade-cyan min-h-[36px] px-3 rounded-lg text-xs font-bold shrink-0"
                  >
                    Забрать
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
