import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          // Variant styles (no glow). Use subtle ring + translate to draw attention
          variant === "default" && "bg-primary text-primary-foreground hover:bg-primary hover:ring-2 hover:ring-primary/40 hover:-translate-y-0.5",
          variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:ring-2 hover:ring-destructive/30 hover:-translate-y-0.5",
          variant === "outline" && "border border-input bg-background hover:bg-primary/15 hover:text-foreground hover:ring-2 hover:ring-primary/40 hover:-translate-y-0.5",
          variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-primary/15 hover:ring-2 hover:ring-primary/40 hover:-translate-y-0.5",
          variant === "ghost" && "hover:bg-primary/15 hover:text-foreground hover:ring-2 hover:ring-primary/40 hover:-translate-y-0.5",
          variant === "link" && "text-primary underline-offset-4 hover:underline",
          // Size styles
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-9 rounded-md px-3",
          size === "lg" && "h-11 rounded-md px-8",
          size === "icon" && "h-10 w-10",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }