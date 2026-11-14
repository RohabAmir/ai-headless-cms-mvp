"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Activity,
  ChevronDown,
  FileText,
  FolderKanban,
  Globe,
  LayoutDashboard,
  LogOut,
  MoreVertical,
  Search,
  Tags,
  Users,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pages", label: "Pages", icon: FolderKanban },
  {
    label: "Posts",
    icon: FileText,
    children: [
      { href: "/posts", label: "Posts" },
      { href: "/categories", label: "Categories" },
    ],
  },
  { href: "/users", label: "Users Management", icon: Users },
  { href: "/activity-logs", label: "Activity Logs", icon: Activity },
  { href: "/seo", label: "SEO Settings", icon: Search },
  { href: "/websites", label: "Websites", icon: Globe },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [openPosts, setOpenPosts] = useState(
    pathname.startsWith("/posts") || pathname.startsWith("/categories"),
  )

  return (
    <aside className="flex h-svh w-64 shrink-0 flex-col border-r border-white/5 bg-[#0a0a0b]">
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-[#c026a0] to-[#4c1d95] text-sm font-bold text-white">
          H
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wide text-white">Headly</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            headless cms
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {nav.map((item) => {
          if ("children" in item && item.children) {
            const Icon = item.icon
            const childActive = item.children.some((c) =>
              pathname.startsWith(c.href),
            )
            return (
              <div key={item.label}>
                <button
                  type="button"
                  onClick={() => setOpenPosts((v) => !v)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5",
                    childActive && "bg-white/5 text-white",
                  )}
                >
                  <Icon className="size-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    className={cn(
                      "size-4 transition",
                      openPosts && "rotate-180",
                    )}
                  />
                </button>
                {openPosts && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:text-white",
                          pathname.startsWith(child.href) &&
                            "bg-[#c026a0]/20 text-[#f0abfc]",
                        )}
                      >
                        {child.label === "Categories" ? (
                          <span className="inline-flex items-center gap-2">
                            <Tags className="size-3.5" />
                            {child.label}
                          </span>
                        ) : (
                          child.label
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          const Icon = item.icon!
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5",
                active &&
                  "bg-gradient-to-r from-[#c026a0] to-[#7c3aed] font-medium text-white shadow-lg shadow-[#c026a0]/20",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-[#c026a0] to-[#4c1d95] text-xs font-semibold">
            {user?.name?.charAt(0) || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user?.name || "User"}
            </p>
            <p className="truncate text-xs text-zinc-500">{user?.email}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-md p-1 text-zinc-400 hover:bg-white/10 hover:text-white">
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={logout}>
                <LogOut className="size-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  )
}
