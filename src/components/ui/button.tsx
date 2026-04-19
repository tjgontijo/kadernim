import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils/index"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 px-4.5 py-2.5 text-[15px] font-semibold font-body leading-none rounded-full transition-all active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-terracotta text-white shadow hover:bg-terracotta-hover",
        outline: "border border-line bg-background shadow-sm hover:bg-paper-2 hover:text-ink",
        secondary: "bg-sage text-white shadow-sm hover:bg-sage-hover",
        ghost: "text-ink-soft hover:bg-paper-2 hover:text-ink",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive-hover",
        link: "text-terracotta underline-offset-4 hover:underline",
        accent: "bg-sage text-white shadow-1 shadow-[0_1px_0_oklch(0.42_0.08_135)] hover:bg-sage-hover",
      },
      size: {
        default: "h-10 px-4.5",
        xs: "h-6 px-2 text-xs",
        sm: "h-8 px-3.5 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "size-10 p-0",
        "icon-sm": "size-8 p-0",
        "icon-lg": "size-12 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
