"use client"

import React from "react"
import { motion } from "framer-motion"

interface StaggeredTableRowsProps {
  children: React.ReactNode
  staggerDelay?: number
  duration?: number
}

export function StaggeredTableRows({ children, staggerDelay = 0.05, duration = 0.3 }: StaggeredTableRowsProps) {
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
      return React.cloneElement(child, {
        initial: "hidden",
        animate: "show",
        variants: itemVariants,
        transition: { duration },
        ...child.props,
      })
    }
    return child
  })

  return (
    <motion.tbody variants={containerVariants} initial="hidden" animate="show">
      {childrenWithVariants}
    </motion.tbody>
  )
}
