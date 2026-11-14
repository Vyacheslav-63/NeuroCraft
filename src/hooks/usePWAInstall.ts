import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __neurocraftInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

export type ClientPlatform = 'android' | 'ios' | 'windows' | 'mac' | 'other';

function detectPlatform(): ClientPlatform {
  if (typeof window === 'undefined') return 'other';
  const ua = window.navigator.userAgent.toLowerCase();
  const platform = (window.navigator.platform || '').toLowerCase();
  const isTouchMac = /macintosh/.test(ua) && navigator.maxTouchPoints > 1;

  if (/iphone|ipad|ipod/.test(ua) || isTouchMac) return 'ios';
  if (/android/.test(ua)) return 'android';
  if (/win/.test(platform) || /windows/.test(ua)) return 'windows';
  if (/mac/.test(platform) || /macintosh/.test(ua)) return 'mac';
  return 'other';
}

function detectInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent || '';
  return /Telegram|WhatsApp|Instagram|FBAN|FBAV|Line\/|Viber|VKClient|; wv\)/i.test(ua);
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && window.__neurocraftInstallPrompt) {
      return window.__neurocraftInstallPrompt;
    }
    return null;
  });
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<ClientPlatform>('other');
  const [isInIframe, setIsInIframe] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [swReady, setSwReady] = useState(false);
  const [manifestReady, setManifestReady] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);
    setPlatform(detectPlatform());
    setIsInAppBrowser(detectInAppBrowser());

    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    if (window.__neurocraftInstallPrompt) {
      setDeferredPrompt(window.__neurocraftInstallPrompt);
    }

    fetch('/manifest.webmanifest', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json && json.short_name) setManifestReady(true);
      })
      .catch(() => {});

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistration('/')
        .then((reg) => {
          if (reg && (reg.active || reg.waiting || reg.installing)) {
            setSwReady(true);
          }
        })
        .catch(() => {});

      navigator.serviceWorker.ready
        .then(() => setSwReady(true))
        .catch(() => {});
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__neurocraftInstallPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handleEarlyPromptReady = () => {
      if (window.__neurocraftInstallPrompt) {
        setDeferredPrompt(window.__neurocraftInstallPrompt);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__neurocraftInstallPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('neurocraft:installpromptready', handleEarlyPromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('neurocraft:installpromptready', handleEarlyPromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    const targetPrompt = deferredPrompt || window.__neurocraftInstallPrompt;
    if (!targetPrompt) return false;
    await targetPrompt.prompt();
    const { outcome } = await targetPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__neurocraftInstallPrompt = null;
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS: platform === 'ios',
    isInIframe,
    isInAppBrowser,
    swReady,
    manifestReady,
    platform,
    install,
  };
}
