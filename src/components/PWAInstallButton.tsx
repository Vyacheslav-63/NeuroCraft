import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Laptop,
  Monitor,
  Server,
  Share,
  Smartphone,
  X,
} from 'lucide-react';
import { ClientPlatform, usePWAInstall } from '../hooks/usePWAInstall';

type GuideTab = 'android' | 'ios' | 'windows' | 'mac' | 'server';

interface DownloadStatus {
  macArm64: boolean;
  macX64: boolean;
  windows: boolean;
  linux: boolean;
  sizesMb: {
    macArm64: number | null;
    macX64: number | null;
    windows: number | null;
    linux: number | null;
  };
}

function toGuideTab(platform: ClientPlatform): GuideTab {
  if (platform === 'android' || platform === 'ios' || platform === 'windows' || platform === 'mac') {
    return platform;
  }
  return 'android';
}

const PLATFORM_TABS: { id: GuideTab; label: string; badge: string }[] = [
  { id: 'android', label: 'Android', badge: 'Chrome / APK' },
  { id: 'ios', label: 'iOS', badge: 'Safari / Профиль' },
  { id: 'windows', label: 'Windows', badge: 'EXE / Edge' },
  { id: 'mac', label: 'macOS', badge: 'APP / Safari' },
  { id: 'server', label: 'Сервер / Linux', badge: 'VPS / Docker' },
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
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus | null>(null);

  useEffect(() => {
    if (!guideOpen) return;
    let active = true;
    fetch('/api/download/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: DownloadStatus | null) => {
        if (active && data) setDownloadStatus(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [guideOpen]);

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

  const formatSize = (mb?: number | null) => (typeof mb === 'number' ? ` (${mb} МБ)` : '');

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
          <span className="hidden sm:inline">Скачать / ОС</span>
        </button>
      ) : compact ? (
        <button
          type="button"
          onClick={handlePrimaryClick}
          className="min-h-[36px] px-3 rounded-lg bg-[#10B981]/15 border border-[#10B981]/50 text-[#34D399] hover:bg-[#10B981]/25 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span>{isInstallable ? 'Установить сейчас' : 'Скачать для всех ОС'}</span>
        </button>
      ) : (
        <div className="rounded-2xl bg-[#111827] border border-[#10B981]/40 p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#34D399] flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              <span>Скачать NeuroCraft</span>
            </span>
            <span className="font-mono text-[10px] text-[#94A3B8]">Все ОС + Сервер</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] leading-snug">
            Готовые сборки для macOS, Windows, Linux, Android, iOS и пакет для сервера.
          </p>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handlePrimaryClick}
              className="flex-1 min-h-[38px] px-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#052E16] text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isInstallable ? 'Установить' : 'Скачать'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedTab(toGuideTab(platform));
                setGuideOpen(true);
              }}
              aria-label="Скачать для всех платформ и сервера"
              className="min-h-[38px] px-2.5 rounded-xl bg-[#0B0F19] border border-[#334155] text-[11px] font-semibold text-[#CBD5E1] hover:border-[#06B6D4]"
            >
              Все ОС
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
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#111827] border border-[#334155] shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E293B]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center">
                  <Download className="w-4 h-4 text-[#34D399]" />
                </div>
                <div>
                  <h3 id="pwa-install-title" className="text-base font-bold text-[#F8FAFC]">
                    Скачивание и установка NeuroCraft
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    Приложения для всех устройств и готовая сборка для собственного сервера
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
              {(isInIframe || isInAppBrowser) && (
                <div className="rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/40 p-3.5 space-y-2.5">
                  <div className="flex items-start gap-2 text-xs text-[#FCD34D] font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      {isInIframe
                        ? 'Страница открыта внутри предпросмотра (iframe). Для установки PWA откройте ссылку в отдельной вкладке браузера — а архивы ниже можно скачать прямо сейчас.'
                        : 'Страница открыта во встроенном браузере мессенджера. Нажмите «⋮» → «Открыть в Chrome/Safari».'}
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
                      <span>{copiedUrl ? 'Ссылка скопирована' : 'Копировать ссылку'}</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="rounded-lg bg-[#0B0F19] border border-[#1E293B] px-2.5 py-2 flex items-center gap-1.5">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 shrink-0 ${
                      manifestReady ? 'text-[#10B981]' : 'text-[#F59E0B]'
                    }`}
                  />
                  <span className="text-[#CBD5E1] truncate">
                    Manifest: {manifestReady ? 'OK' : 'проверка'}
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
                    {isInstallable ? '1-клик OK' : 'Сборки готовы'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
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
                      <div className="text-[10px] font-mono text-[#64748B] truncate">{tab.badge}</div>
                    </button>
                  );
                })}
              </div>

              {selectedTab === 'android' && (
                <div className="rounded-xl bg-[#0B0F19] border border-[#1E293B] p-4 space-y-3 text-xs text-[#CBD5E1] leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-[#4CD7F6]">
                    <Smartphone className="w-4 h-4" />
                    <span>Android (Google Chrome, Edge, Яндекс Браузер и APK)</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1.5">
                    <li>
                      Откройте ссылку в <strong>Google Chrome</strong> на телефоне и нажмите <strong>«Установить прямо сейчас»</strong> или меню <strong>⋮ → «Установить приложение»</strong> (установится как отдельное WebAPK с офлайн-доступом).
                    </li>
                    <li>
                      Если требуется подписанный файл <strong>.APK</strong> для раздачи файлом, скачайте готовый проект Capacitor ниже и соберите APK через Android Studio или GitHub Actions.
                    </li>
                  </ol>
                  <a
                    href="/api/download/android-project"
                    download="NeuroCraft-Android-Capacitor.tar.gz"
                    className="min-h-[38px] px-3.5 rounded-xl bg-[#06B6D4]/15 border border-[#06B6D4]/50 text-[#4CD7F6] hover:bg-[#06B6D4]/25 text-xs font-bold inline-flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span>Скачать Android Capacitor проект (.tar.gz)</span>
                  </a>
                </div>
              )}

              {selectedTab === 'ios' && (
                <div className="rounded-xl bg-[#0B0F19] border border-[#1E293B] p-4 space-y-3 text-xs text-[#CBD5E1] leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-[#4CD7F6]">
                    <Share className="w-4 h-4" />
                    <span>iPhone и iPad (Safari PWA или профиль .mobileconfig)</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1.5">
                    <li>Откройте NeuroCraft в <strong>Safari</strong> → нажмите <strong>«Поделиться»</strong> → <strong>«На экран «Домой»</strong> → <strong>«Добавить»</strong>.</li>
                    <li>Либо скачайте конфигурационный профиль <strong>.mobileconfig</strong> ниже и подтвердите установку в <strong>Настройки → Профиль загружен</strong>.</li>
                  </ol>
                  <a
                    href="/api/download/ios-webclip"
                    download="NeuroCraft-iOS.mobileconfig"
                    className="min-h-[38px] px-3.5 rounded-xl bg-[#06B6D4]/15 border border-[#06B6D4]/50 text-[#4CD7F6] hover:bg-[#06B6D4]/25 text-xs font-bold inline-flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span>Скачать профиль для iPhone / iPad (.mobileconfig)</span>
                  </a>
                </div>
              )}

              {selectedTab === 'windows' && (
                <div className="rounded-xl bg-[#0B0F19] border border-[#1E293B] p-4 space-y-3 text-xs text-[#CBD5E1] leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-[#4CD7F6]">
                    <Monitor className="w-4 h-4" />
                    <span>Windows 10 / 11 (готовое приложение .EXE + Edge/Chrome)</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1.5">
                    <li>
                      Скачайте готовый архив <strong>NeuroCraft-Windows.zip</strong>, распакуйте папку и запустите <strong>NeuroCraft.exe</strong> (работает автономно даже без интернета).
                    </li>
                    <li>Либо установите как PWA за 1 клик через значок в адресной строке <strong>Microsoft Edge</strong> / <strong>Chrome</strong>.</li>
                  </ol>
                  <a
                    href="/api/download/windows"
                    download={downloadStatus?.windows ? 'NeuroCraft-Windows.zip' : undefined}
                    className="min-h-[38px] px-3.5 rounded-xl bg-[#06B6D4]/15 border border-[#06B6D4]/50 text-[#4CD7F6] hover:bg-[#06B6D4]/25 text-xs font-bold inline-flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {downloadStatus?.windows
                        ? `Скачать для Windows x64 (.zip)${formatSize(downloadStatus.sizesMb.windows)}`
                        : 'Скачать сборку для Windows (.zip)'}
                    </span>
                  </a>
                </div>
              )}

              {selectedTab === 'mac' && (
                <div className="rounded-xl bg-[#0B0F19] border border-[#1E293B] p-4 space-y-3 text-xs text-[#CBD5E1] leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-[#4CD7F6]">
                    <Laptop className="w-4 h-4" />
                    <span>macOS (готовое приложение NeuroCraft.app)</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1.5">
                    <li>Скачайте версию под ваш процессор Mac (почти все Mac с 2020 года — это <strong>Apple Silicon M1–M4</strong>).</li>
                    <li>Откройте скачанный <strong>.zip</strong> — внутри появится готовая программа <strong>NeuroCraft.app</strong>. Перетащите её в папку <strong>«Программы» (Applications)</strong>.</li>
                    <li>При первом запуске нажмите на <strong>NeuroCraft.app</strong> правой кнопкой мыши → <strong>«Открыть»</strong> (чтобы macOS разрешила запуск неподписанного приложения).</li>
                  </ol>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="/api/download/mac-package?arch=arm64"
                      download={downloadStatus?.macArm64 ? 'NeuroCraft-Mac-AppleSilicon.zip' : undefined}
                      className="min-h-[38px] px-3.5 rounded-xl bg-[#06B6D4]/15 border border-[#06B6D4]/50 text-[#4CD7F6] hover:bg-[#06B6D4]/25 text-xs font-bold inline-flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Mac Apple Silicon M1–M4 (.zip){formatSize(downloadStatus?.sizesMb.macArm64)}
                      </span>
                    </a>
                    <a
                      href="/api/download/mac-package?arch=x64"
                      download={downloadStatus?.macX64 ? 'NeuroCraft-Mac-Intel.zip' : undefined}
                      className="min-h-[38px] px-3.5 rounded-xl bg-[#1E293B] border border-[#334155] text-[#E2E8F0] hover:border-[#06B6D4] text-xs font-bold inline-flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Mac Intel x64 (.zip){formatSize(downloadStatus?.sizesMb.macX64)}
                      </span>
                    </a>
                  </div>
                </div>
              )}

              {selectedTab === 'server' && (
                <div className="rounded-xl bg-[#0B0F19] border border-[#1E293B] p-4 space-y-3 text-xs text-[#CBD5E1] leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-[#4CD7F6]">
                    <Server className="w-4 h-4" />
                    <span>Готовая сборка для сервера (VPS / Docker / Linux)</span>
                  </div>
                  <p>
                    Серверный пакет включает исходники, собранный <code className="text-[#4CD7F6]">dist/</code>,{' '}
                    <code className="text-[#4CD7F6]">Dockerfile</code>, <code className="text-[#4CD7F6]">docker-compose.yml</code>,{' '}
                    <code className="text-[#4CD7F6]">Caddyfile.example</code> (авто-HTTPS) и скрипт автоустановки{' '}
                    <code className="text-[#4CD7F6]">install-server.sh</code>:
                  </p>
                  <pre className="rounded-lg bg-[#050810] border border-[#1E293B] p-2.5 font-mono text-[11px] text-[#34D399] overflow-x-auto">
                    tar -xzf NeuroCraft-Server-Deploy.tar.gz && sudo bash install-server.sh
                  </pre>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="/api/download/server-bundle"
                      download="NeuroCraft-Server-Deploy.tar.gz"
                      className="min-h-[38px] px-3.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/50 text-[#34D399] hover:bg-[#10B981]/25 text-xs font-bold inline-flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 shrink-0" />
                      <span>Серверная сборка (быстрая, без бинарников)</span>
                    </a>
                    <a
                      href="/api/download/server-bundle?includeDesktop=1"
                      download="NeuroCraft-Full-Server-With-Apps.tar.gz"
                      className="min-h-[38px] px-3.5 rounded-xl bg-[#06B6D4]/15 border border-[#06B6D4]/50 text-[#4CD7F6] hover:bg-[#06B6D4]/25 text-xs font-bold inline-flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 shrink-0" />
                      <span>Сервер + приложения Mac/Win/Linux</span>
                    </a>
                    <a
                      href="/api/download/linux"
                      download="NeuroCraft-Linux.tar.gz"
                      className="min-h-[38px] px-3.5 rounded-xl bg-[#1E293B] border border-[#334155] text-[#E2E8F0] hover:border-[#06B6D4] text-xs font-bold inline-flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Десктоп Linux x64 (.tar.gz){formatSize(downloadStatus?.sizesMb.linux)}
                      </span>
                    </a>
                  </div>
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

