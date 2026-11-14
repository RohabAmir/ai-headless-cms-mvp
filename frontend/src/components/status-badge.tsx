import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const active = ["ACTIVE", "Active", "true"].includes(status)
  return (
    <Badge
      className={cn(
        "gap-1 rounded-full border px-2.5 py-0.5 font-medium",
        active
          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
          : "border-zinc-500/40 bg-zinc-500/15 text-zinc-300",
        className,
      )}
    >
      {active && <Check className="size-3" />}
      {active ? "Active" : status}
    </Badge>
  )
}
