"use client"

import { useAuthStore } from "@/lib/store/auth-store"
import { useTranslations } from "@/lib/i18n/use-translations"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggleSimple } from "@/components/theme-toggle-simple"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Bell, ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function MapHeader() {
  const { user, signOut } = useAuthStore()
  const { t } = useTranslations()
  const router = useRouter()
  const [is3DEnabled, setIs3DEnabled] = useState(false)

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  const toggle3DMode = () => {
    setIs3DEnabled(!is3DEnabled)
    // Emitir um evento personalizado para que o componente do mapa possa reagir
    window.dispatchEvent(new CustomEvent("toggle3DMode", { detail: { enabled: !is3DEnabled } }))
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleBackToDashboard} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">FIBERSHARE Maps</h1>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant={is3DEnabled ? "default" : "outline"}
          size="sm"
          onClick={toggle3DMode}
          className={is3DEnabled ? "bg-[#FF6B00] hover:bg-[#FF6B00]/90" : ""}
        >
          {is3DEnabled ? "3D" : "2D"}
        </Button>

        <ThemeToggleSimple />
        <LanguageSwitcher />

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-[#FF6B00]" />
          <span className="sr-only">{t("common", "notifications")}</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 overflow-hidden border">
              <div className="flex h-full w-full items-center justify-center bg-[#0A1A3A] text-white">
                {user?.name?.charAt(0) || user?.email.charAt(0)}
              </div>
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || user?.email}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">{t("common", "profile")}</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">{t("common", "settings")}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              {t("common", "logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
