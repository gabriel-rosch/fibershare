"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useTranslations } from "@/lib/i18n/use-translations"
import { useAuth } from "@/lib/authContext"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
// Adicionar o import para o ícone MessageSquare
import {
  LayoutDashboard,
  Users,
  Map,
  FileText,
  Settings,
  Menu,
  X,
  DollarSign,
  FileSignature,
  MessageSquare,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type UserRole = "admin" | "operator_admin" | "operator_user" | "client"

type NavItem = {
  title: string
  href: string
  icon: React.ElementType
  roles: UserRole[]
}

export function Sidebar() {
  const { t } = useTranslations()
  const pathname = usePathname()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  // Atualizar o array navItems para incluir o link para a página de chat
  const navItems: NavItem[] = [
    {
      title: t("common", "dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "operator_admin", "operator_user", "client"],
    },
    {
      title: t("common", "marketplace"),
      href: "/marketplace",
      icon: DollarSign,
      roles: ["admin"],
    },
    {
      title: t("common", "maps"),
      href: "/map",
      icon: Map,
      roles: ["admin"],
    },
    {
      title: "Ordens de Serviço",
      href: "/service-orders",
      icon: FileSignature,
      roles: ["admin"],
    },
    {
      title: "Chat",
      href: "/chat",
      icon: MessageSquare,
      roles: ["admin"],
    },
    {
      title: t("common", "users"),
      href: "/users",
      icon: Users,
      roles: ["admin"],
    },
    {
      title: t("common", "projects"),
      href: "/projects",
      icon: FileText,
      roles: ["admin"],
    },
    {
      title: t("common", "settings"),
      href: "/settings",
      icon: Settings,
      roles: ["admin"],
    },
  ]

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) => {
    if (!user || !user.role) return false;
    return item.roles.includes(user.role as UserRole);
  })

  return (
    <>
      <div className="md:hidden">
        <Button variant="ghost" size="icon" className="absolute left-4 top-4 z-50" onClick={() => setIsOpen(!isOpen)}>
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>

      <AnimatePresence>
        <motion.div
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 bg-background md:relative",
            isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
          initial={{ x: "-100%" }}
          animate={{ x: isOpen || !window.matchMedia("(max-width: 768px)").matches ? 0 : "-100%" }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="flex h-full flex-col border-r">
            <motion.div
              className="flex h-16 items-center border-b px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Link href="/dashboard" className="flex items-center">
                <Image src="/images/logo.png" alt="FIBERSHARE Logo" width={150} height={40} className="dark:invert" />
              </Link>
            </motion.div>

            <div className="flex-1 overflow-auto py-6 px-4">
              <motion.nav
                className="space-y-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {filteredNavItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        pathname === item.href ? "bg-[#FF6B00] text-white" : "text-foreground hover:bg-muted",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-5 w-5",
                          pathname === item.href ? "text-white" : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                      {item.title}
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>
            </div>

            {user && (
              <motion.div
                className="border-t p-4 mx-4 mb-4 mt-auto rounded-lg bg-muted/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <div className="flex items-center">
                  <motion.div
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A1A3A] text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.3, type: "spring" }}
                  >
                    {user.name?.charAt(0) || user.email.charAt(0)}
                  </motion.div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{user.name || user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
