"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils/index"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer items-center rounded-full border border-line bg-paper-3 transition-all outline-none data-[state=checked]:bg-sage data-[state=checked]:border-sage disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 rounded-full bg-white shadow-1 transition-transform data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-[2px]"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
