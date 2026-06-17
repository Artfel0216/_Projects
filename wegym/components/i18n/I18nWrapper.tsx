'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { I18nProvider } from '@/lib/i18n/provider'
import { COOKIE_NAME, defaultLocale, isLocale, type Locale } from '@/lib/i18n/config'
import type { TranslationDict } from '@/lib/i18n/types'

// Synchronously import default locale so SSR always has translations
import defaultTranslations from '@/translations/pt-BR.json'
import enTranslations from '@/translations/en.json'

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : undefined
}

const translationCache: Record<string, TranslationDict> = {
  'pt-BR': defaultTranslations as unknown as TranslationDict,
  en: enTranslations as unknown as TranslationDict,
}

async function loadTranslations(locale: Locale): Promise<TranslationDict> {
  if (translationCache[locale]) return translationCache[locale]
  try {
    const mod = await import(`@/translations/${locale}.json`)
    const dict = mod.default as TranslationDict
    translationCache[locale] = dict
    return dict
  } catch {
    return translationCache.en
  }
}

type Props = {
  children: ReactNode
}

export function I18nWrapper({ children }: Props) {
  const [locale, setLocale] = useState<Locale>(defaultLocale)
  const [translations, setTranslations] = useState<TranslationDict>(
    defaultTranslations as unknown as TranslationDict,
  )

  useEffect(() => {
    const detected = getCookie(COOKIE_NAME)
    if (detected && isLocale(detected) && detected !== defaultLocale) {
      setLocale(detected)
      loadTranslations(detected).then(setTranslations)
    }
  }, [])

  const handleLocaleChange = async (newLocale: Locale) => {
    setLocale(newLocale)
    const dict = await loadTranslations(newLocale)
    setTranslations(dict)
  }

  return (
    <I18nProvider
      locale={locale}
      translations={translations}
      onLocaleChange={handleLocaleChange}
    >
      {children}
    </I18nProvider>
  )
}
