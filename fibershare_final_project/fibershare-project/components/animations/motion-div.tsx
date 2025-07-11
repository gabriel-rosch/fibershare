"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface MotionDivProps {
  children: React.ReactNode
  className?: string
  initial?: any
  animate?: any
  exit?: any
  transition?: any
  variants?: any
  layoutId?: string
}

export function MotionDiv({
  children,
  className,
  initial = { opacity: 0 },
  animate = { opacity: 1 },
  exit = { opacity: 0 },
  transition = { duration: 0.3 },
  variants,
  layoutId,
}: MotionDivProps) {
  return (
    <motion.div
      className={cn(className)}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      variants={variants}
      layoutId={layoutId}
    >
      {children}
    </motion.div>
  )
}
