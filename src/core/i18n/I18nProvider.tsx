import { useMemo, useState, type ReactNode } from 'react'
import { I18nContext, type Locale } from './I18nContext'
import { es, type TranslationKey } from './translations/es'
import { en } from './translations/en'

const dictionaries = { es, en }

function interpolate(str: string, vars?: Record<string, string | number>): string {
    if (!vars) return str
    return Object.entries(vars).reduce(
        (acc, [key, val]) => acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val)),
        str
    )
}

export const I18nProvider = ({ children }: { children: ReactNode }) => {
    const [locale, setLocale] = useState<Locale>(() => {
        const stored = localStorage.getItem('locale') as Locale | null
        if (stored === 'es' || stored === 'en') return stored
        return navigator.language.startsWith('es') ? 'es' : 'en'
    })

    const toggleLocale = () => {
        setLocale(prev => {
            const next: Locale = prev === 'es' ? 'en' : 'es'
            localStorage.setItem('locale', next)
            return next
        })
    }

    const t = useMemo(
        () =>
            (key: TranslationKey, vars?: Record<string, string | number>): string => {
                const dict = dictionaries[locale]
                const str = (dict as Record<string, string>)[key] ?? (es as Record<string, string>)[key] ?? key
                return interpolate(str, vars)
            },
        [locale]
    )

    return (
        <I18nContext.Provider value={{ locale, toggleLocale, t }}>
            {children}
        </I18nContext.Provider>
    )
}
