import { createContext } from 'react'
import { vi } from './vi'

export type Language = 'vi' | 'en'

type DeepStringRecord<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepStringRecord<T[K]> : string
}

export type TranslationDictionary = DeepStringRecord<typeof vi>

export interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => Promise<void>
  t: TranslationDictionary
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

