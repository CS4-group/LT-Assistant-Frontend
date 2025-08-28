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
          variant === "default" && "bg-primary text-primary-foreground hover:bg-[#991b1b] hover:shadow-[0_0_18px_rgba(185,28,28,0.45)]",
          variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          variant === "outline" && "border border-input bg-background hover:bg-primary/30 hover:text-foreground hover:shadow-[0_0_16px_rgba(185,28,28,0.35)]",
          variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-primary/25 hover:shadow-[0_0_16px_rgba(185,28,28,0.3)]",
          variant === "ghost" && "hover:bg-primary/25 hover:text-foreground hover:shadow-[0_0_14px_rgba(185,28,28,0.25)]",
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
