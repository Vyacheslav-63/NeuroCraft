import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Laptop,
  Monitor,
  Share,
  Smartphone,
  X,
} from 'lucide-react';
import { ClientPlatform, usePWAInstall } from '../hooks/usePWAInstall';

type GuideTab = 'android' | 'ios' | 'windows' | 'mac';

function toGuideTab(platform: ClientPlatform): GuideTab {
  if (platform === 'android' || platform === 'ios' || platform === 'windows' || platform === 'mac') {
    return platform;
  }
  return 'android';
}

const PLATFORM_TABS: { id: GuideTab; label: string; badge: string }[] = [
  { id: 'android', label: 'Android', badge: 'Chrome / APK' },
  { id: 'ios', label: 'iOS', badge: 'Safari / IPA' },
  { id: 'windows', label: 'Windows', badge: 'Edge / EXE' },
  { id: 'mac', label: 'macOS', badge: 'Safari / DMG' },
];

export function PWAInstallButton({
  compact = false,
  headerPill = false,
}: {
  compact?: boolean;
  headerPill?: boolean;
}) {
  const {
    isInstallable,
    isInstalled,
    isInIframe,
    isInAppBrowser,
    swReady,
    manifestReady,
    platform,
    install,
  } = usePWAInstall();
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<GuideTab>(() => toGuideTab(platform));
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (isInstalled) {
    return null;
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handlePrimaryClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) return;
    }
    setSelectedTab(toGuideTab(platform));
    setGuideOpen(true);
  };

  const handleCopyUrl = async () => {
    if (!currentUrl) return;
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <>
      {headerPill ? (
        <button
          type="button"
          onClick={handlePrimaryClick}
          aria-label="Установить приложение"
          className="min-h-[34px] px-2 rounded-lg bg-[#10B981]/15 border border-[#10B981]/60 text-[#34D399] flex items-center gap-1 text-[11px] font-bold whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Установить</span>
        </button>
      ) : compact ? (
        <button
          type="button"
          onClick={handlePrimaryClick}
          className="min-h-[36px] px-3 rounded-lg bg-[#10B981]/15 border border-[#10B981]/50 text-[#34D399] hover:bg-[#10B981]/25 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span>{isInstallable ? 'Установить сейчас' : 'Установить приложение'}</span>
        </button>
      ) : (
        <div className="rounded-2xl bg-[#111827] border border-[#10B981]/40 p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#34D399] flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              <span>Установить NeuroCraft</span>
            </span>
            <span className="font-mono text-[10px] text-[#94A3B8]">4 ОС</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] leading-snug">
            Работает как отдельное приложение на Android, iOS, Windows и macOS.
          </p>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handlePrimaryClick}
              className="flex-1 min-h-[38px] px-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#052E16] text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isInstallable ? 'Установить' : 'Установить на ОС'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedTab(toGuideTab(platform));
                setGuideOpen(true);
              }}
              aria-label="Инструкция для всех платформ"
              className="min-h-[38px] px-2.5 rounded-xl bg-[#0B0F19] border border-[#334155] text-[11px] font-semibold text-[#CBD5E1] hover:border-[#06B6D4]"
            >
              ОС
            </button>
          </div>
        </div>
      )}

      {guideOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
        >
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#111827] border border-[#334155] shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E293B]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center">
                  <Download className="w-4 h-4 text-[#34D399]" />
                </div>
                <div>
                  <h3 id="pwa-install-title" className="text-base font-bold text-[#F8FAFC]">
                    Установка NeuroCraft на устройство
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    Отдельное окно, иконка на экране и офлайн-доступ к урокам
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGuideOpen(false)}
                aria-label="Закрыть"
                className="min-h-[36px] min-w-[36px] rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Live environment diagnostic */}
              {(isInIframe || isInAppBrowser) && (
                <div className="rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/40 p-3.5 space-y-2.5">
                  <div className="flex items-start gap-2 text-xs text-[#FCD34D] font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      {isInIframe
                        ? 'Страница открыта внутри окна предпросмотра (iframe). Браузер блокирует установку из iframe — откройте ссылку в отдельной вкладке Chrome.'
                        : 'Страница открыта во встроенном браузере мессенджера (Telegram / WhatsApp / WebView). Нажмите «⋮» → «Открыть в Chrome».'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentUrl && (
                      <a
                        href={currentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[36px] px-3 rounded-lg bg-[#06B6D4] text-[#082F49] text-xs font-extrabold inline-flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Открыть в новой вкладке</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="min-h-[36px] px-3 rounded-lg bg-[#0B0F19] border border-[#334155] text-xs font-semibold text-[#F8FAFC] inline-flex items-center gap-1.5"
                    >
                      {copiedUrl ? (
                        <Check className="w-3.5 h-3.5 text-[#10B981]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#4CD7F6]" />
                      )}
                      <span>{copiedUrl ? 'Ссылка скопирована' : 'Копировать ссылку для Chrome'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Ready status indicators */}
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="rounded-lg bg-[#0B0F19] border border-[#1E293B] px-2.5 py-2 flex items-center gap-1.5">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 shrink-0 ${
                      manifestReady ? 'text-[#10B981]' : 'text-[#F59E0B]'
                    }`}
                  />
                  <span className="text-[#CBD5E1] truncate">
                    Manifest: {manifestReady ? 'OK' : 'ошибка'}
                  </span>
                </div>
                <div className="rounded-lg bg-[#0B0F19] border border-[#1E293B] px-2.5 py-2 flex items-center gap-1.5">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 shrink-0 ${
                      swReady ? 'text-[#10B981]' : 'text-[#F59E0B]'
                    }`}
                  />
                  <span className="text-[#CBD5E1] truncate">
                    SW: {swReady ? 'активен' : 'запуск'}
                  </span>
                </div>
                <div className="rounded-lg bg-[#0B0F19] border border-[#1E293B] px-2.5 py-2 flex items-center gap-1.5">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isInstallable ? 'text-[#10B981]' : 'text-[#4CD7F6]'
                    }`}
                  />
                  <span className="text-[#CBD5E1] truncate">
                    {isInstallable ? '1-клик OK' : 'Меню ОС'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PLATFORM_TABS.map((tab) => {
                  const active = selectedTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedTab(tab.id)}
                      className={`rounded-xl px-2.5 py-2 text-left border transition-colors ${
                        active
                          ? 'bg-[#06B6D4]/15 border-[#06B6D4] text-[#F8FAFC]'
                          : 'bg-[#0B0F19] border-[#1E293B] text-[#94A3B8] hover:border-[#334155]'
                      }`}
                    >
                      <div className="text-xs font-bold">{tab.label}</div>
                      <div className="text-[10px] font-mono text-[#64748B]">{tab.badge}</div>
                    </button>
                  );
                })}
              </div>

              {selectedTab === 'android' && (
                <div className="rounded-xl bg-[#0B0F19] border border-[#1E293B] p-4 space-y-2.5 text-xs text-[#CBD5E1] leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-[#4CD7F6]">
                    <Smartphone className="w-4 h-4" />
                    <span>Android (Google Chrome, Edge, Яндекс Браузер)</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1.5">
                    <li>
                      Убедитесь, что открыли ссылку именно в <strong>Google Chrome</strong> (если вы внутри предпросмотра или мессенджера — скопируйте ссылку и вставьте в Chrome).
                    </li>
                    <li>
                      Нажмите кнопку <strong>«Установить прямо сейчас»</strong> ниже или откройте меню браузера <strong>⋮ (справа сверху)</strong> → <strong>«Добавить на гл. экран» / «Установить приложение»</strong>.
                    </li>
                    <li>
                      Если браузер на телефоне просит вход в Google — сначала авторизуйтесь или обновите деплой приложения в AI Studio.
                    </li>
                    <li>
                      Для получения отдельного файла <strong>.APK</strong> запустите GitHub Action <strong>Build Installable Apps</strong> из репозитория.
                    </li>
                  </ol>
                </div>
              )}

              {selectedTab === 'ios' && (
                <div className="rounded-xl bg-[#0B0F19] border border-[#1E293B] p-4 space-y-2.5 text-xs text-[#CBD5E1] leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-[#4CD7F6]">
                    <Share className="w-4 h-4" />
                    <span>iPhone и iPad (iOS / iPadOS Safari)</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1.5">
                    <li>Откройте NeuroCraft в браузере <strong>Safari</strong>.</li>
                    <li>Нажмите кнопку <strong>«Поделиться»</strong> (квадрат со стрелкой вверх).</li>
                    <li>Выберите <strong>«На экран «Домой»</strong> → <strong>«Добавить»</strong>.</li>
                    <li>Для сборки <strong>IPA</strong> в App Store используйте <code className="text-[#4CD7F6]">capacitor.config.ts</code> в Xcode.</li>
                  </ol>
                </div>
              )}

              {selectedTab === 'windows' && (
                <div className="rounded-xl bg-[#0B0F19] border border-[#1E293B] p-4 space-y-2.5 text-xs text-[#CBD5E1] leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-[#4CD7F6]">
                    <Monitor className="w-4 h-4" />
                    <span>Windows 10 / 11 (Edge, Chrome, или .EXE)</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1.5">
                    <li>Откройте приложение в <strong>Microsoft Edge</strong> или <strong>Google Chrome</strong>.</li>
                    <li>В правой части адресной строки нажмите значок установки и выберите <strong>«Установить»</strong>.</li>
                    <li>Для сборки инсталлятора <strong>.EXE</strong> используйте <code className="text-[#4CD7F6]">electron-builder.yml</code> или GitHub Action.</li>
                  </ol>
                </div>
              )}

              {selectedTab === 'mac' && (
                <div className="rounded-xl bg-[#0B0F19] border border-[#1E293B] p-4 space-y-2.5 text-xs text-[#CBD5E1] leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-[#4CD7F6]">
                    <Laptop className="w-4 h-4" />
                    <span>macOS (Safari 17+, Chrome, или .DMG)</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1.5">
                    <li>В <strong>Safari</strong> откройте меню <strong>«Файл» → «Добавить в Dock»</strong>, либо установите через <strong>Chrome</strong>.</li>
                    <li>Для сборки универсального образа <strong>.DMG</strong> используйте <code className="text-[#4CD7F6]">electron-builder.yml</code> или GitHub Action.</li>
                  </ol>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                {isInstallable && (
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await install();
                      if (ok) setGuideOpen(false);
                    }}
                    className="btn-arcade-cyan flex-1 min-h-[42px] px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Установить прямо сейчас</span>
                  </button>
                )}
                {!isInIframe && !isInAppBrowser && currentUrl && (
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="min-h-[42px] px-4 rounded-xl bg-[#0B0F19] border border-[#334155] hover:border-[#06B6D4] text-xs font-semibold text-[#F8FAFC] flex items-center justify-center gap-1.5"
                  >
                    {copiedUrl ? (
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#4CD7F6]" />
                    )}
                    <span>{copiedUrl ? 'Скопировано' : 'Копировать URL'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
