import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-[72px] lg:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-[#F59E0B] px-3.5 py-2 text-xs font-bold text-[#0B0F19] shadow-lg"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Офлайн-режим: уроки и прогресс доступны из кэша</span>
    </div>
  );
}
