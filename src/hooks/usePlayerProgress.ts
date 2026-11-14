import { useCallback, useEffect, useMemo, useState } from 'react';
import { ACHIEVEMENTS, CHAPTERS, LEVEL_TITLES, STAGE_CERTIFICATES } from '../data/curriculum';
import {
  EMPTY_WEEKLY_COUNTS,
  getMondayWeekKey,
  getWeeklyMissionsForKey,
} from '../data/weeklyMissions';
import {
  PlayerProgress,
  StudentRegistration,
  WeeklyMetricKey,
  WeeklyMission,
} from '../types/app';

const STORAGE_KEY = 'neurocraft_progress_v1';

function makeFreshWeekly() {
  return {
    weekKey: getMondayWeekKey(),
    counts: { ...EMPTY_WEEKLY_COUNTS },
    claimedMissionIds: [],
  };
}

const DEFAULT_PROGRESS: PlayerProgress = {
  xp: 40,
  streakDays: 3,
  crystals: 60,
  energy: 5,
  maxEnergy: 5,
  completedNodeIds: ['n-1-1'],
  nodeScores: {
    'n-1-1': {
      scorePct: 100,
      mistakes: 0,
      totalQuestions: 3,
      completedAt: new Date().toISOString().slice(0, 10),
    },
  },
  claimedStageIds: [],
  completedQuestIds: [],
  completedCaseIds: [],
  agentsRunCount: 0,
  mvpsBuiltCount: 0,
  unlockedAchievementIds: ['ach-first-node'],
  weekly: makeFreshWeekly(),
  earnedWeeklyBadges: [],
  registration: null,
};

function syncWeeklyWindow(progress: PlayerProgress): PlayerProgress {
  const currentWeek = getMondayWeekKey();
  if (progress.weekly && progress.weekly.weekKey === currentWeek) {
    return progress;
  }
  return {
    ...progress,
    weekly: {
      weekKey: currentWeek,
      counts: { ...EMPTY_WEEKLY_COUNTS },
      claimedMissionIds: [],
    },
  };
}

function incrementWeekly(progress: PlayerProgress, metric: WeeklyMetricKey): PlayerProgress {
  const synced = syncWeeklyWindow(progress);
  return {
    ...synced,
    weekly: {
      ...synced.weekly,
      counts: {
        ...synced.weekly.counts,
        [metric]: (synced.weekly.counts[metric] ?? 0) + 1,
      },
    },
  };
}

function computeAchievements(next: PlayerProgress): PlayerProgress {
  const unlocked = new Set(next.unlockedAchievementIds);
  let bonusXp = 0;

  const grant = (id: string) => {
    if (!unlocked.has(id)) {
      unlocked.add(id);
      const found = ACHIEVEMENTS.find((a) => a.id === id);
      if (found) bonusXp += found.xpBonus;
    }
  };

  if (next.completedNodeIds.length >= 1) grant('ach-first-node');
  if (next.completedQuestIds.length >= 1) grant('ach-prompt-master');
  if (next.agentsRunCount >= 1) grant('ach-agent-builder');
  if (next.mvpsBuiltCount >= 1) grant('ach-mvp-maker');
  if (next.completedCaseIds.length >= 1) grant('ach-deal-closer');
  if (next.completedNodeIds.length >= 16) grant('ach-rag-architect');
  if (next.completedNodeIds.length >= 18 || next.completedQuestIds.length >= 5) {
    grant('ach-safety-guardian');
  }
  if (next.claimedStageIds.length >= 1) grant('ach-first-cert');

  if (bonusXp === 0 && unlocked.size === next.unlockedAchievementIds.length) {
    return next;
  }

  return {
    ...next,
    xp: next.xp + bonusXp,
    unlockedAchievementIds: Array.from(unlocked),
  };
}

export function usePlayerProgress() {
  const [progress, setProgress] = useState<PlayerProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const raw = JSON.parse(saved);
        const parsed: PlayerProgress = {
          ...DEFAULT_PROGRESS,
          ...raw,
          nodeScores: { ...DEFAULT_PROGRESS.nodeScores, ...(raw.nodeScores ?? {}) },
          claimedStageIds: Array.isArray(raw.claimedStageIds) ? raw.claimedStageIds : [],
          registration: raw.registration ?? null,
        };
        return syncWeeklyWindow(parsed);
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_PROGRESS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore storage errors
    }
  }, [progress]);

  const weeklyMissions = useMemo(
    () => getWeeklyMissionsForKey(progress.weekly.weekKey),
    [progress.weekly.weekKey]
  );

  const allNodes = useMemo(() => CHAPTERS.flatMap((c) => c.nodes), []);

  const currentNodeId = useMemo(() => {
    const firstIncomplete = allNodes.find((n) => !progress.completedNodeIds.includes(n.id));
    return firstIncomplete ? firstIncomplete.id : null;
  }, [allNodes, progress.completedNodeIds]);

  const rankInfo = useMemo(() => {
    let current = LEVEL_TITLES[0];
    let next = LEVEL_TITLES[1];
    for (let i = 0; i < LEVEL_TITLES.length; i++) {
      if (progress.xp >= LEVEL_TITLES[i].minXp) {
        current = LEVEL_TITLES[i];
        next = LEVEL_TITLES[i + 1] ?? null;
      }
    }
    const span = next ? next.minXp - current.minXp : 500;
    const gained = progress.xp - current.minXp;
    const pct = next ? Math.min(100, Math.round((gained / span) * 100)) : 100;
    return {
      level: current.level,
      title: current.title,
      nextMinXp: next ? next.minXp : null,
      progressPct: pct,
    };
  }, [progress.xp]);

  const completeNode = useCallback(
    (
      nodeId: string,
      xpReward: number,
      crystalReward: number,
      scoreInfo?: { scorePct: number; mistakes: number; totalQuestions: number }
    ) => {
      setProgress((prev) => {
        const alreadyCompleted = prev.completedNodeIds.includes(nodeId);
        const prevScore = prev.nodeScores[nodeId];
        const incomingPct = scoreInfo?.scorePct ?? 100;
        const bestPct = prevScore ? Math.max(prevScore.scorePct, incomingPct) : incomingPct;

        const next: PlayerProgress = incrementWeekly(
          {
            ...prev,
            xp: prev.xp + (alreadyCompleted ? 15 : xpReward),
            crystals: prev.crystals + (alreadyCompleted ? 5 : crystalReward),
            completedNodeIds: alreadyCompleted
              ? prev.completedNodeIds
              : [...prev.completedNodeIds, nodeId],
            nodeScores: {
              ...prev.nodeScores,
              [nodeId]: {
                scorePct: bestPct,
                mistakes: scoreInfo?.mistakes ?? prevScore?.mistakes ?? 0,
                totalQuestions: scoreInfo?.totalQuestions ?? prevScore?.totalQuestions ?? 3,
                completedAt: new Date().toISOString().slice(0, 10),
              },
            },
          },
          'lessons'
        );
        return computeAchievements(next);
      });
    },
    []
  );

  const unlockNodeWithCrystals = useCallback((nodeId: string, cost = 15) => {
    let success = false;
    setProgress((prev) => {
      if (prev.crystals < cost) return prev;
      success = true;
      const existingScore = prev.nodeScores[nodeId];
      return {
        ...prev,
        crystals: prev.crystals - cost,
        completedNodeIds: prev.completedNodeIds.includes(nodeId)
          ? prev.completedNodeIds
          : [...prev.completedNodeIds, nodeId],
        nodeScores: existingScore
          ? prev.nodeScores
          : {
              ...prev.nodeScores,
              [nodeId]: {
                scorePct: 80,
                mistakes: 1,
                totalQuestions: 3,
                completedAt: new Date().toISOString().slice(0, 10),
              },
            },
      };
    });
    return success;
  }, []);

  const spendEnergy = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      energy: Math.max(0, prev.energy - 1),
    }));
  }, []);

  const refillEnergyWithCrystals = useCallback(() => {
    let ok = false;
    setProgress((prev) => {
      if (prev.crystals < 20 || prev.energy >= prev.maxEnergy) return prev;
      ok = true;
      return {
        ...prev,
        crystals: prev.crystals - 20,
        energy: prev.maxEnergy,
      };
    });
    return ok;
  }, []);

  const completeQuest = useCallback((questId: string, xpReward: number, crystalReward: number) => {
    setProgress((prev) => {
      const already = prev.completedQuestIds.includes(questId);
      const next: PlayerProgress = incrementWeekly(
        {
          ...prev,
          xp: prev.xp + (already ? 20 : xpReward),
          crystals: prev.crystals + (already ? 5 : crystalReward),
          completedQuestIds: already ? prev.completedQuestIds : [...prev.completedQuestIds, questId],
        },
        'quests'
      );
      return computeAchievements(next);
    });
  }, []);

  const recordAgentRun = useCallback(() => {
    setProgress((prev) => {
      const next: PlayerProgress = incrementWeekly(
        {
          ...prev,
          xp: prev.xp + 25,
          agentsRunCount: prev.agentsRunCount + 1,
        },
        'agents'
      );
      return computeAchievements(next);
    });
  }, []);

  const recordMvpBuilt = useCallback(() => {
    setProgress((prev) => {
      const next: PlayerProgress = incrementWeekly(
        {
          ...prev,
          xp: prev.xp + 40,
          crystals: prev.crystals + 15,
          mvpsBuiltCount: prev.mvpsBuiltCount + 1,
        },
        'mvps'
      );
      return computeAchievements(next);
    });
  }, []);

  const completeBusinessCase = useCallback((caseId: string) => {
    setProgress((prev) => {
      const already = prev.completedCaseIds.includes(caseId);
      const next: PlayerProgress = incrementWeekly(
        {
          ...prev,
          xp: prev.xp + (already ? 10 : 45),
          crystals: prev.crystals + (already ? 0 : 20),
          completedCaseIds: already ? prev.completedCaseIds : [...prev.completedCaseIds, caseId],
        },
        'cases'
      );
      return computeAchievements(next);
    });
  }, []);

  const recordMentorQuestion = useCallback(() => {
    setProgress((prev) =>
      incrementWeekly(
        {
          ...prev,
          xp: prev.xp + 10,
        },
        'mentor'
      )
    );
  }, []);

  const claimWeeklyMission = useCallback((mission: WeeklyMission) => {
    setProgress((prev) => {
      const synced = syncWeeklyWindow(prev);
      const currentVal = synced.weekly.counts[mission.metric] ?? 0;
      const alreadyClaimed = synced.weekly.claimedMissionIds.includes(mission.id);
      if (currentVal < mission.target || alreadyClaimed) return synced;

      const badgeExists =
        mission.badge &&
        synced.earnedWeeklyBadges.some((b) => b.id === mission.badge?.id);

      return {
        ...synced,
        xp: synced.xp + mission.xpReward,
        crystals: synced.crystals + mission.crystalReward,
        weekly: {
          ...synced.weekly,
          claimedMissionIds: [...synced.weekly.claimedMissionIds, mission.id],
        },
        earnedWeeklyBadges:
          mission.badge && !badgeExists
            ? [...synced.earnedWeeklyBadges, mission.badge]
            : synced.earnedWeeklyBadges,
      };
    });
  }, []);

  const claimStageBonus = useCallback((chapterId: string | 'all') => {
    let claimed = false;
    setProgress((prev) => {
      if (prev.claimedStageIds.includes(chapterId)) return prev;

      const meta = STAGE_CERTIFICATES.find((c) => c.chapterId === chapterId);
      if (!meta) return prev;

      const requiredNodes =
        chapterId === 'all'
          ? CHAPTERS.flatMap((ch) => ch.nodes)
          : CHAPTERS.find((ch) => ch.id === chapterId)?.nodes ?? [];

      if (
        requiredNodes.length === 0 ||
        !requiredNodes.every((n) => prev.completedNodeIds.includes(n.id))
      ) {
        return prev;
      }

      claimed = true;
      const next: PlayerProgress = {
        ...prev,
        xp: prev.xp + meta.bonusXp,
        crystals: prev.crystals + meta.bonusCrystals,
        claimedStageIds: [...prev.claimedStageIds, chapterId],
      };
      return computeAchievements(next);
    });
    return claimed;
  }, []);

  const saveRegistration = useCallback((reg: StudentRegistration | null) => {
    setProgress((prev) => ({
      ...prev,
      registration: reg,
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({
      ...DEFAULT_PROGRESS,
      weekly: makeFreshWeekly(),
    });
  }, []);

  return {
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
  };
}
