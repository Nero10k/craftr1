import * as React from "react"
import { cn } from "@/lib/utils"

interface StepsProps {
  children: React.ReactNode
  className?: string
}

interface StepProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function Steps({ children, className }: StepsProps) {
  const steps = React.Children.toArray(children)
  const totalSteps = steps.length

  return (
    <div className={cn("space-y-8", className)}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return null

        return (
          <div className="relative">
            {index !== totalSteps - 1 && (
              <div
                className="absolute left-3.5 top-8 h-full w-px bg-border"
                aria-hidden="true"
              />
            )}
            <div className="flex items-start">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border bg-background text-sm font-medium">
                {index + 1}
              </div>
              <div className="ml-4 w-full">{child}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function Step({ title, children, className }: StepProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="font-medium leading-none tracking-tight">{title}</h3>
      <div>{children}</div>
    </div>
  )
} 