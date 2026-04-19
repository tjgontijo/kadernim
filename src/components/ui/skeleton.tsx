import { cn } from "@/lib/utils/index"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-paper-3 rounded-r-2 animate-pulse", className)}
      {...props}
    />
  )
}

export { Skeleton }
