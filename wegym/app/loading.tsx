"use client";

import { useTranslations } from '@/lib/i18n/hook';

export default function RootLoading() {
  const { t } = useTranslations();
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 animate-spin rounded-full border-4 border-zinc-800 border-t-orange-500" />
        <p className="text-sm text-zinc-500">{t('common.loading')}</p>
      </div>
    </div>
  );
}
