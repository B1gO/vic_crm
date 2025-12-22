import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                    {
                        'default': "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg",
                        'secondary': "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                        'outline': "border border-border bg-transparent hover:bg-secondary",
                        'ghost': "hover:bg-secondary",
                        'destructive': "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                    }[variant],
                    {
                        'default': "h-10 px-4 py-2 text-sm",
                        'sm': "h-8 px-3 text-xs",
                        'lg': "h-12 px-6 text-base",
                        'icon': "h-10 w-10",
                    }[size],
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
