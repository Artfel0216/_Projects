'use client'

import { createContext, useContext, useCallback, useEffect, type ReactNode } from 'react'
import type { Locale } from './config'
import type { TranslationDict } from './types'

type I18nContextType = {
  locale: Locale
  t: (key: string, fallback?: string) => string
  changeLocale: (locale: Locale) => void
  dir: 'ltr' | 'rtl'
}

const I18nContext = createContext<I18nContextType | null>(null)

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return ctx
}

function resolve(obj: TranslationDict | string | undefined, path: string): string | undefined {
  if (!obj || typeof obj === 'string') return undefined
  const parts = path.split('.')
  let current: TranslationDict | string | undefined = obj
  for (const part of parts) {
    if (!current || typeof current === 'string') return undefined
    current = current[part]
  }
  return typeof current === 'string' ? current : undefined
}

type Props = {
  locale: Locale
  translations: TranslationDict
  fallbackTranslations?: TranslationDict
  children: ReactNode
  onLocaleChange?: (locale: Locale) => void
}

export function I18nProvider({ locale, translations, fallbackTranslations, children, onLocaleChange }: Props) {
  const t = useCallback(
    (key: string, fallback?: string): string => {
      const value = resolve(translations, key)
      if (value !== undefined) return value
      const fallbackValue = resolve(fallbackTranslations, key)
      if (fallbackValue !== undefined) return fallbackValue
      return fallback ?? key
    },
    [translations, fallbackTranslations],
  )

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  }, [locale])

  const changeLocale = useCallback(
    (newLocale: Locale) => {
      document.cookie = `WEGYM_LOCALE=${newLocale};path=/;max-age=31536000`
      onLocaleChange?.(newLocale)
    },
    [onLocaleChange],
  )

  const dir: 'ltr' | 'rtl' = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <I18nContext.Provider value={{ locale, t, changeLocale, dir }}>
      {children}
    </I18nContext.Provider>
  )
}
