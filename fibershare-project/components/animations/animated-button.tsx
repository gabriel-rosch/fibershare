"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AnimatedButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode
}

export function AnimatedButton({ children, className, ...props }: AnimatedButtonProps) {
  return (
    <Button className={cn("transition-transform hover:scale-[1.03] active:scale-[0.97]", className)} {...props}>
      {children}
    </Button>
  )
}
