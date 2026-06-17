import 'server-only'
import { cookies } from 'next/headers'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import type { Locale } from './config'
import { locales, defaultLocale, isLocale, COOKIE_NAME } from './config'

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(COOKIE_NAME)?.value
  if (cookie && isLocale(cookie)) return cookie

  const headers = Object.fromEntries(
    (await cookies()).getAll().map((c) => [c.name, c.value]),
  )
  const negotiatorHeaders: Record<string, string> = {}
  try {
    const { headers: reqHeaders } = await import('next/headers')
    const h = await reqHeaders()
    const acceptLanguage = h.get('accept-language')
    if (acceptLanguage) negotiatorHeaders['accept-language'] = acceptLanguage
  } catch {
    // headers() not available in all contexts
  }

  if (!negotiatorHeaders['accept-language']) return defaultLocale

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages()
  return match(languages, [...locales], defaultLocale) as Locale
}

export async function getDictionary(locale: Locale): Promise<Record<string, unknown>> {
  try {
    return (await import(`../../translations/${locale}.json`)).default
  } catch {
    return (await import(`../../translations/en.json`)).default
  }
}

export async function getTranslations(locale: Locale): Promise<{
  translations: Record<string, unknown>
  fallbackTranslations: Record<string, unknown>
}> {
  const translations = await getDictionary(locale)
  let fallbackTranslations: Record<string, unknown> = {}
  if (locale !== 'en') {
    try {
      fallbackTranslations = (await import(`../../translations/en.json`)).default
    } catch {
      // no fallback available
    }
  }
  return { translations, fallbackTranslations }
}
