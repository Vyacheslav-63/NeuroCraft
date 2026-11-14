import { WeeklyBadge, WeeklyMetricKey, WeeklyMission } from '../types/app';

export function getMondayWeekKey(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // Convert Sunday (0) -> 7, Monday (1) -> 1 ... Saturday (6) -> 6
  const dayNum = d.getDay() || 7;
  // Move to Thursday of current ISO week to compute ISO year & week number
  d.setDate(d.getDate() + 4 - dayNum);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function getTimeUntilNextMonday(date: Date = new Date()): {
  days: number;
  hours: number;
} {
  const day = date.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
  const daysUntilMon = day === 0 ? 1 : 8 - day;
  const nextMonday = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + daysUntilMon,
    0,
    0,
    0,
    0
  );
  const diffMs = Math.max(0, nextMonday.getTime() - date.getTime());
  const totalHours = Math.floor(diffMs / 3600000);
  return {
    days: Math.floor(totalHours / 24),
    hours: totalHours % 24,
  };
}

export const EMPTY_WEEKLY_COUNTS: Record<WeeklyMetricKey, number> = {
  lessons: 0,
  quests: 0,
  agents: 0,
  mvps: 0,
  cases: 0,
  mentor: 0,
};

const WEEKLY_POOLS: WeeklyMission[][] = [
  [
    {
      id: 'wm-lessons-4',
      title: 'Нейро-марафон недели',
      description: 'Пройди 4 урока на Карте приключений до следующего понедельника',
      metric: 'lessons',
      target: 4,
      crystalReward: 80,
      xpReward: 120,
      badge: {
        id: 'badge-neuro-sprinter',
        title: 'Нейро-спринтер',
        subtitle: 'Закрыл недельный марафон уроков',
        accent: 'cyan',
      },
    },
    {
      id: 'wm-quests-3',
      title: 'Мастер формулировок',
      description: 'Реши 3 чат-квеста на 70+ баллов в Тренажере промптов',
      metric: 'quests',
      target: 3,
      crystalReward: 95,
      xpReward: 150,
      badge: {
        id: 'badge-prompt-virtuoso',
        title: 'Виртуоз промптов',
        subtitle: 'Прошел 3 сложных квеста за неделю',
        accent: 'violet',
      },
    },
    {
      id: 'wm-agents-3',
      title: 'Лаборатория автономии',
      description: 'Протестируй и запусти 3 конфигурации AI-агентов',
      metric: 'agents',
      target: 3,
      crystalReward: 75,
      xpReward: 110,
      badge: {
        id: 'badge-agent-smith',
        title: 'Кузнец агентов',
        subtitle: 'Собрал 3 рабочих агента за неделю',
        accent: 'emerald',
      },
    },
    {
      id: 'wm-cases-3',
      title: 'Акула монетизации',
      description: 'Прими верные решения в 3 бизнес-кейсах Бизнес-Хаба',
      metric: 'cases',
      target: 3,
      crystalReward: 100,
      xpReward: 140,
      badge: {
        id: 'badge-deal-architect',
        title: 'Стратег сделок',
        subtitle: 'Решил 3 кейса монетизации за неделю',
        accent: 'amber',
      },
    },
  ],
  [
    {
      id: 'wm-mvps-2',
      title: 'Запуск за неделю',
      description: 'Сгенерируй 2 веб-MVP прототипа в режиме Веб-кодинга',
      metric: 'mvps',
      target: 2,
      crystalReward: 110,
      xpReward: 160,
      badge: {
        id: 'badge-mvp-founder',
        title: 'Основатель MVP',
        subtitle: 'Выпустил 2 прототипа за неделю',
        accent: 'violet',
      },
    },
    {
      id: 'wm-mentor-4',
      title: 'Охотник за трендами',
      description: 'Задай 4 актуальных вопроса AI-Ментору с живым поиском',
      metric: 'mentor',
      target: 4,
      crystalReward: 70,
      xpReward: 100,
      badge: {
        id: 'badge-ai-scout',
        title: 'AI-скаут',
        subtitle: 'Изучил 4 свежих тренда с Ментором',
        accent: 'cyan',
      },
    },
    {
      id: 'wm-lessons-5',
      title: 'Глубокое погружение',
      description: 'Заверши 5 модулей на Карте навыков за текущую неделю',
      metric: 'lessons',
      target: 5,
      crystalReward: 120,
      xpReward: 180,
      badge: {
        id: 'badge-deep-learner',
        title: 'Глубокий практик',
        subtitle: '5 модулей за одну неделю',
        accent: 'emerald',
      },
    },
    {
      id: 'wm-cases-4',
      title: 'B2B-экспертиза',
      description: 'Разбери и успешно реши 4 бизнес-кейса заработка на ИИ',
      metric: 'cases',
      target: 4,
      crystalReward: 115,
      xpReward: 160,
      badge: {
        id: 'badge-revenue-hunter',
        title: 'Архитектор выручки',
        subtitle: 'Решил 4 бизнес-сценария за неделю',
        accent: 'amber',
      },
    },
  ],
  [
    {
      id: 'wm-quests-4',
      title: 'Безупречный промпт',
      description: 'Пройди 4 практических квеста в Тренажере промптов',
      metric: 'quests',
      target: 4,
      crystalReward: 110,
      xpReward: 170,
      badge: {
        id: 'badge-syntax-lord',
        title: 'Мастер контекста',
        subtitle: '4 промпт-квеста за одну неделю',
        accent: 'violet',
      },
    },
    {
      id: 'wm-agents-4',
      title: 'Мультиагентный прорыв',
      description: 'Выполни 4 трассировки агентов в AI Лаборатории',
      metric: 'agents',
      target: 4,
      crystalReward: 95,
      xpReward: 140,
      badge: {
        id: 'badge-react-master',
        title: 'Оператор ReAct',
        subtitle: '4 успешных запуска агентов',
        accent: 'emerald',
      },
    },
    {
      id: 'wm-mvps-2-alt',
      title: 'Продуктовый спринт',
      description: 'Собери 2 интерактивных лендинга MVP в AI Лаборатории',
      metric: 'mvps',
      target: 2,
      crystalReward: 100,
      xpReward: 150,
      badge: {
        id: 'badge-ship-fast',
        title: 'Быстрый релиз',
        subtitle: '2 MVP-спринта за неделю',
        accent: 'cyan',
      },
    },
    {
      id: 'wm-mentor-3',
      title: 'Актуальный стек',
      description: 'Разбери 3 вопроса по новым AI-технологиям с Ментором',
      metric: 'mentor',
      target: 3,
      crystalReward: 65,
      xpReward: 95,
      badge: {
        id: 'badge-tech-explorer',
        title: 'Исследователь ИИ',
        subtitle: '3 сессии с Live Search Ментором',
        accent: 'amber',
      },
    },
  ],
];

export function getWeeklyMissionsForKey(weekKey: string): WeeklyMission[] {
  const match = weekKey.match(/W(\d+)/);
  const weekNum = match ? Number(match[1]) : 1;
  return WEEKLY_POOLS[weekNum % WEEKLY_POOLS.length];
}

export const ALL_WEEKLY_BADGES: WeeklyBadge[] = WEEKLY_POOLS.flat()
  .map((m) => m.badge)
  .filter((b): b is WeeklyBadge => Boolean(b));
