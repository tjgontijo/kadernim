import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils/index"

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold font-body rounded-full border border-transparent transition-all whitespace-nowrap shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-sage text-paper",
        destructive: "bg-berry-2 text-berry",
        outline: "border-line bg-surface-card text-ink-soft",
        ghost: "hover:bg-paper-2 text-ink-soft",
        link: "text-primary underline-offset-4 hover:underline",
        // Subject variants
        port: "bg-subject-port-bg text-subject-port-fg",
        mat: "bg-subject-mat-bg text-subject-mat-fg",
        cien: "bg-subject-ciencias-bg text-subject-ciencias-fg",
        hist: "bg-subject-historia-bg text-subject-historia-fg",
        geo: "bg-subject-geografia-bg text-subject-geografia-fg",
        arte: "bg-subject-artes-bg text-subject-artes-fg",
        ingles: "bg-subject-mat-bg text-subject-mat-fg", // fallback
        edfis: "bg-subject-ciencias-bg text-subject-ciencias-fg", // fallback
        // Status variants
        new: "bg-sage-2 text-sage",
        warn: "bg-mustard-2 text-mustard",
        danger: "bg-berry-2 text-berry",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
