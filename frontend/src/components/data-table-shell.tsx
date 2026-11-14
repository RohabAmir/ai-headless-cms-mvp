import { cn } from "@/lib/utils"

export function DataTableShell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/10 bg-zinc-950",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function TableHeadRow({ children }: { children: React.ReactNode }) {
  return (
    <tr className="bg-gradient-to-r from-[#5b21b6] to-[#c026a0] text-left text-sm text-white">
      {children}
    </tr>
  )
}
