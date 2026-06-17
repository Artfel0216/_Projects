"use client";

import { WifiOff } from "lucide-react";
import { useTranslations } from '@/lib/i18n/hook';

export default function OfflinePage() {
  const { t } = useTranslations();
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-6 px-6 font-sans">
      <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
        <WifiOff className="text-zinc-500" size={24} />
      </div>
      <h1 className="text-xl font-black italic uppercase tracking-tighter">
        {t('offline.title')}
      </h1>
      <p className="text-sm text-zinc-400 text-center max-w-xs leading-relaxed">
        {t('offline.description')}
      </p>
    </div>
  );
}
