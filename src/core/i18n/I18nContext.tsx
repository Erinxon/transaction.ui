import { createContext } from 'react'
import type { TranslationKey } from './translations/es'

export type Locale = 'es' | 'en'

interface I18nContextType {
    locale: Locale
    toggleLocale: () => void
    t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

export const I18nContext = createContext<I18nContextType>({
    locale: 'es',
    toggleLocale: () => {},
    t: (key) => key,
})
