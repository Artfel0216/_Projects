export const locales = [
  'pt-BR',
  'en',
  'es',
  'fr',
  'de',
  'it',
  'zh-CN',
  'ja',
  'ko',
  'ar',
  'hi',
  'ru',
  'nl',
  'tr',
  'pl',
] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'pt-BR'

export const localeNames: Record<Locale, string> = {
  'pt-BR': 'Português (Brasil)',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  'zh-CN': '中文 (简体)',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
  hi: 'हिन्दी',
  ru: 'Русский',
  nl: 'Nederlands',
  tr: 'Türkçe',
  pl: 'Polski',
}

export const localeFlags: Record<Locale, string> = {
  'pt-BR': '🇧🇷',
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
  'zh-CN': '🇨🇳',
  ja: '🇯🇵',
  ko: '🇰🇷',
  ar: '🇸🇦',
  hi: '🇮🇳',
  ru: '🇷🇺',
  nl: '🇳🇱',
  tr: '🇹🇷',
  pl: '🇵🇱',
}

export const isLocale = (value: string): value is Locale =>
  locales.includes(value as Locale)

export const COOKIE_NAME = 'WEGYM_LOCALE'
