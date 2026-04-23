import * as React from "react"

import { cn } from "@/lib/utils/index"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "bg-surface-card border border-line rounded-3 px-3.5 py-2.5 text-[15px] font-body text-ink transition-all outline-none placeholder:text-ink-faint focus:border-terracotta focus:ring-4 focus:ring-terracotta-2 disabled:bg-paper-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
