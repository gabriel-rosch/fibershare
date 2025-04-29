"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface FadeInProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  direction?: "up" | "down" | "left" | "right" | "none"
  delay?: number
  duration?: number
  distance?: number
}

export function FadeIn({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.3,
  distance = 20,
  ...props
}: FadeInProps) {
  const getInitialProps = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: distance }
      case "down":
        return { opacity: 0, y: -distance }
      case "left":
        return { opacity: 0, x: distance }
      case "right":
        return { opacity: 0, x: -distance }
      case "none":
        return { opacity: 0 }
      default:
        return { opacity: 0, y: distance }
    }
  }

  return (
    <motion.div
      className={cn(className)}
      initial={getInitialProps()}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
