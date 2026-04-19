import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils/index"

function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "gap-6 rounded-r-4 border-[1.5px] border-dashed border-line p-12 flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center text-balance bg-surface-card paper-grain",
        className
      )}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        "gap-2 flex max-w-sm flex-col items-center",
        className
      )}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-paper-2 text-ink-mute flex size-24 shrink-0 items-center justify-center rounded-full border border-line/50 relative after:absolute after:w-[140%] after:h-px after:bg-line after:opacity-50 after:-bottom-1 after:-left-[20%] after:-rotate-[4deg] [&_svg:not([class*='size-'])]:size-10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn("font-display text-xl font-semibold text-ink", className)}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "text-body-s text-ink-mute max-w-xs mx-auto leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "gap-2.5 text-sm flex w-full max-w-sm min-w-0 flex-col items-center text-balance",
        className
      )}
      {...props}
    />
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
}
