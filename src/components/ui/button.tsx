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
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          // Variant styles
          // Keep background steady on hover for primary; add glow only
          variant === "default" && "bg-primary text-primary-foreground hover:bg-primary hover:shadow-[0_0_22px_rgba(92,20,20,0.65)]",
          variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          // Ghost/outline should glow same as primary on hover
          variant === "outline" && "border border-input bg-background hover:bg-primary/20 hover:text-foreground hover:shadow-[0_0_22px_rgba(92,20,20,0.65)]",
          variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-primary/20 hover:shadow-[0_0_22px_rgba(92,20,20,0.65)]",
          variant === "ghost" && "hover:bg-primary/20 hover:text-foreground hover:shadow-[0_0_22px_rgba(92,20,20,0.65)]",
          variant === "link" && "text-primary underline-offset-4 hover:underline hover:text-primary",
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