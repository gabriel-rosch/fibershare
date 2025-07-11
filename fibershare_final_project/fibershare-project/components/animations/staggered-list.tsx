"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StaggeredListProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  duration?: number
  as?: React.ElementType
}

export function StaggeredList({
  children,
  className,
  staggerDelay = 0.05,
  duration = 0.3,
  as = "div",
}: StaggeredListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration } },
  }

  // Clone children and add variants
  const childrenWithVariants = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return (
        <motion.div variants={itemVariants} className="w-full">
          {child}
        </motion.div>
      )
    }
    return child
  })

  return (
    <motion.div className={cn(className)} variants={containerVariants} initial="hidden" animate="show">
      {childrenWithVariants}
    </motion.div>
  )
}
