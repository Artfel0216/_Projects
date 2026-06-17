'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from '@/lib/i18n/hook'
import { locales, localeNames, localeFlags } from '@/lib/i18n/config'
import { Globe } from 'lucide-react'

type Props = {
  showLabels?: boolean
}

export function LanguageSwitcher({ showLabels = true }: Props) {
  const { locale: currentLocale, changeLocale } = useTranslations()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title={!showLabels ? currentLocale : undefined}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-300 hover:bg-white/5 transition-colors text-left cursor-pointer border border-transparent ${
          showLabels ? '' : 'justify-center'
        }`}
        aria-label="Switch language"
      >
        <Globe size={18} className="shrink-0 text-zinc-500" />
        {showLabels && (
          <span className="text-[11px] font-black uppercase italic truncate">
            {currentLocale}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-56 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40 p-2 max-h-64 overflow-y-auto z-50">
          {locales.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => {
                changeLocale(l)
                setOpen(false)
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-semibold transition-colors cursor-pointer ${
                l === currentLocale
                  ? 'bg-orange-600/20 text-orange-400'
                  : 'text-zinc-300 hover:bg-white/5'
              }`}
            >
              <span className="text-base">{localeFlags[l]}</span>
              <span className="truncate">{localeNames[l]}</span>
              {l === currentLocale && <span className="ml-auto text-orange-400 text-[9px]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
