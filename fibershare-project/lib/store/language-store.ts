import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Language = "en" | "pt"

interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "pt",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "language-storage",
    },
  ),
)
