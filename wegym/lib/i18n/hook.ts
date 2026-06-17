'use client'

import { useI18n } from './provider'
import type { TranslationDict } from './types'

export function useTranslations() {
  const { t, locale, changeLocale, dir } = useI18n()

  return {
    t: (key: string, fallback?: string) => t(key, fallback),
    locale,
    changeLocale,
    dir,
  } as const
}
