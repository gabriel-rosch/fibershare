"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface HoverCardProps {
  children: React.ReactNode
  className?: string
  scale?: number
  shadow?: boolean
}

export function HoverCard({ children, className, scale = 1.02, shadow = true }: HoverCardProps) {
  return (
    <motion.div
      className={cn(className, "overflow-hidden")}
      whileHover={{
        scale,
        boxShadow: shadow ? "0 10px 25px rgba(0, 0, 0, 0.1)" : "none",
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}
