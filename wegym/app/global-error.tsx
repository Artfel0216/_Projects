"use client";

import { useTranslations } from '@/lib/i18n/hook';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslations();
  return (
    <html lang="pt-BR">
      <body className="bg-zinc-950 text-zinc-100">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
          <h2 className="text-lg font-semibold">{t('error.critical.title')}</h2>
          <p className="text-sm text-zinc-500">{t('error.critical.description')}</p>
          <button
            onClick={reset}
            className="rounded-lg bg-orange-600 px-6 py-2 text-sm font-medium text-white"
          >
            {t('error.critical.reload')}
          </button>
        </div>
      </body>
    </html>
  );
}
