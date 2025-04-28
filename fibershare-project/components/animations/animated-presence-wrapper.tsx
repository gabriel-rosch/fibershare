"use client"

import type React from "react"

import { AnimatePresence } from "framer-motion"

interface AnimatedPresenceWrapperProps {
  children: React.ReactNode
}

export function AnimatedPresenceWrapper({ children }: AnimatedPresenceWrapperProps) {
  return <AnimatePresence mode="wait">{children}</AnimatePresence>
}
