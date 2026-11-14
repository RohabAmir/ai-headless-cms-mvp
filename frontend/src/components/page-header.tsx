import Link from "next/link"
import { ChevronRight } from "lucide-react"

export function PageHeader({
  crumbs,
  actions,
}: {
  crumbs: { label: string; href?: string }[]
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-zinc-400">
        {crumbs.map((c, i) => (
          <div key={`${c.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-3.5" />}
            {c.href && i < crumbs.length - 1 ? (
              <Link href={c.href} className="hover:text-white">
                {c.label}
              </Link>
            ) : (
              <span className="text-zinc-200">{c.label}</span>
            )}
          </div>
        ))}
      </nav>
      {actions}
    </div>
  )
}
