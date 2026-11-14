export type AppLanguage = 'ru' | 'en' | 'es';
export type AppCurrency = 'RUB' | 'USD' | 'EUR' | 'GBP';

export const CURRENCY_CONFIG: Record<
  AppCurrency,
  { symbol: string; code: AppCurrency; rateFromRub: number; locale: string }
> = {
  RUB: { symbol: '₽', code: 'RUB', rateFromRub: 1, locale: 'ru-RU' },
  USD: { symbol: '$', code: 'USD', rateFromRub: 0.011, locale: 'en-US' },
  EUR: { symbol: '€', code: 'EUR', rateFromRub: 0.01, locale: 'de-DE' },
  GBP: { symbol: '£', code: 'GBP', rateFromRub: 0.0085, locale: 'en-GB' },
};

export function formatMoneyFromRub(rubAmount: number, currency: AppCurrency): string {
  const cfg = CURRENCY_CONFIG[currency];
  const converted =
    currency === 'RUB'
      ? Math.round(rubAmount)
      : Math.max(1, Math.round((rubAmount * cfg.rateFromRub) / 5) * 5 || Math.round(rubAmount * cfg.rateFromRub));
  return `${converted.toLocaleString(cfg.locale)} ${cfg.symbol}`;
}

export function convertRubValue(rubAmount: number, currency: AppCurrency): number {
  const cfg = CURRENCY_CONFIG[currency];
  if (currency === 'RUB') return Math.round(rubAmount);
  return Math.max(1, Math.round(rubAmount * cfg.rateFromRub));
}

export const UI_TEXT: Record<
  AppLanguage,
  {
    nav: { map: string; trainer: string; lab: string; business: string };
    hud: {
      streak: string;
      crystals: string;
      energy: string;
      refill: string;
      level: string;
      progress: string;
      nextStep: string;
      startLesson: string;
      dailyChallenges: string;
      askMentor: string;
      askMentorShort: string;
      regionLabel: string;
    };
    mentor: {
      title: string;
      subtitle: string;
      placeholder: string;
      send: string;
      sources: string;
      contextPrefix: string;
      welcome: string;
      quickQuestions: string[];
    };
  }
> = {
  ru: {
    nav: {
      map: 'Карта',
      trainer: 'Тренажер',
      lab: 'Лаборатория',
      business: 'Бизнес',
    },
    hud: {
      streak: 'Серия',
      crystals: 'Кристаллы',
      energy: 'Энергия',
      refill: 'Пополнить (20)',
      level: 'Уровень',
      progress: 'освоено',
      nextStep: 'Следующий шаг',
      startLesson: 'Начать урок',
      dailyChallenges: 'Ежедневные челленджи',
      askMentor: 'Спросить AI-ментора',
      askMentorShort: 'AI-чат',
      regionLabel: 'Язык и валюта',
    },
    mentor: {
      title: 'AI-Ментор (Live Search)',
      subtitle: 'Задавай актуальные вопросы по LLM, агентам, кодингу и монетизации.',
      placeholder: 'Спроси о современных LLM, RAG, MCP или запуске проекта...',
      send: 'Спросить',
      sources: 'Актуальные источники',
      contextPrefix: 'Тема урока',
      welcome:
        'Привет! Я подключен к живому поиску и помогу разобраться в любых актуальных ИИ-технологиях: от выбора модели и MCP-агентов до экономики микро-SaaS.',
      quickQuestions: [
        'Как работает протокол MCP для AI-агентов?',
        'Что выбрать в 2026: RAG или длинное контекстное окно?',
        'Какие нейросети лучше для генерации веб-кода?',
        'Как снизить расходы на токены в коммерческом боте?',
      ],
    },
  },
  en: {
    nav: {
      map: 'Map',
      trainer: 'Trainer',
      lab: 'AI Lab',
      business: 'Business',
    },
    hud: {
      streak: 'Streak',
      crystals: 'Crystals',
      energy: 'Energy',
      refill: 'Refill (20)',
      level: 'Level',
      progress: 'mastered',
      nextStep: 'Next step',
      startLesson: 'Start lesson',
      dailyChallenges: 'Daily challenges',
      askMentor: 'Ask AI Mentor',
      askMentorShort: 'Ask AI',
      regionLabel: 'Language & Currency',
    },
    mentor: {
      title: 'AI Mentor (Live Search)',
      subtitle: 'Ask up-to-date questions about LLMs, AI agents, coding, and monetization.',
      placeholder: 'Ask about modern LLMs, RAG, MCP, or launching an AI product...',
      send: 'Ask',
      sources: 'Live sources',
      contextPrefix: 'Lesson topic',
      welcome:
        'Hi! I am connected to live web search and can answer any up-to-date questions on AI tech: model selection, MCP agents, RAG architecture, or SaaS pricing.',
      quickQuestions: [
        'How does Model Context Protocol (MCP) work for AI agents?',
        'RAG vs long context window: what should I choose today?',
        'Which AI models are strongest for full-stack web coding?',
        'How do I reduce token costs in a production SaaS?',
      ],
    },
  },
  es: {
    nav: {
      map: 'Mapa',
      trainer: 'Práctica',
      lab: 'Lab IA',
      business: 'Negocio',
    },
    hud: {
      streak: 'Racha',
      crystals: 'Cristales',
      energy: 'Energía',
      refill: 'Recargar (20)',
      level: 'Nivel',
      progress: 'completado',
      nextStep: 'Siguiente paso',
      startLesson: 'Iniciar lección',
      dailyChallenges: 'Retos diarios',
      askMentor: 'Preguntar al Mentor IA',
      askMentorShort: 'IA Chat',
      regionLabel: 'Idioma y Moneda',
    },
    mentor: {
      title: 'Mentor IA (Búsqueda en vivo)',
      subtitle: 'Haz preguntas actualizadas sobre LLMs, agentes, código y monetización.',
      placeholder: 'Pregunta sobre LLMs, RAG, MCP o cómo monetizar IA...',
      send: 'Enviar',
      sources: 'Fuentes en vivo',
      contextPrefix: 'Tema actual',
      welcome:
        '¡Hola! Estoy conectado a búsqueda web en vivo para responder dudas actuales sobre IA: modelos LLM, agentes MCP, arquitectura RAG y monetización.',
      quickQuestions: [
        '¿Cómo funciona el protocolo MCP para agentes de IA?',
        '¿Qué conviene más hoy: RAG o ventana de contexto larga?',
        '¿Qué modelos son mejores para programar aplicaciones web?',
        '¿Cómo reducir costos de tokens en un micro-SaaS?',
      ],
    },
  },
};
