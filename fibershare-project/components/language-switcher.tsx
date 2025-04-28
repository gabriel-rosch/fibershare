"use client"

import { useLanguageStore, type Language } from "@/lib/store/language-store"
import { useTranslations } from "@/lib/i18n/use-translations"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguageStore()
  const { t } = useTranslations()

  const languages = [
    { code: "en", label: t("common", "english") },
    { code: "pt", label: t("common", "portuguese") },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-md">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("common", "language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as Language)}
            className={`flex items-center gap-2 ${language === lang.code ? "bg-accent" : ""}`}
          >
            <span className="w-4 h-4 flex items-center justify-center">
              {language === lang.code && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
