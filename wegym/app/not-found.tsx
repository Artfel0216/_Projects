"use client";

import Link from 'next/link';
import { useTranslations } from '@/lib/i18n/hook';

export default function NotFound() {
  const { t } = useTranslations();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 p-4">
      <h2 className="text-lg font-semibold text-zinc-100">{t('notFound.title')}</h2>
      <p className="text-sm text-zinc-500">{t('notFound.description')}</p>
      <Link
        href="/"
        className="rounded-lg bg-orange-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
      >
        {t('notFound.backHome')}
      </Link>
    </div>
  );
}
