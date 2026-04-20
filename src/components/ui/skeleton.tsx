import { cn } from "@/lib/utils/index"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-paper-3 rounded-r-2 motion-safe:animate-pulse motion-reduce:animate-none", className)}
      {...props}
    />
  )
}

export { Skeleton }
