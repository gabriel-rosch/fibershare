"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface MotionDivProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  initial?: object
  animate?: object
  exit?: object
  transition?: object
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
  ...props
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
      {...props}
    >
      {children}
    </motion.div>
  )
}
