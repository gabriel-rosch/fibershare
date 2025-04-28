"use client"

import { useLanguageStore } from "../store/language-store"
import { translations, type TranslationKey } from "./translations"

export function useTranslations() {
  const { language } = useLanguageStore()

  function t(section: TranslationKey, key: string): string {
    return translations[language][section][key] || `${section}.${key}`
  }

  return { t, language }
}
