import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4", className)}
      style={{
        animation: "spin 1s linear infinite"
      }}
      {...props}
    />
  )
}

export { Spinner }
