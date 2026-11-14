"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { PageHeader } from "@/components/page-header"
import { dashboardApi } from "@/lib/api"
import type { DashboardStats } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const COLORS = ["#c026a0", "#7c3aed", "#eab308", "#38bdf8"]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    dashboardApi
      .stats()
      .then(setStats)
      .catch((e) => toast.error(e.message || "Failed to load stats"))
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      href: "/users",
      gradient: true,
    },
    { label: "Total Pages", value: stats?.totalPages ?? 0, href: "/pages" },
    { label: "Total Posts", value: stats?.totalPosts ?? 0, href: "/posts" },
    {
      label: "Total Sections",
      value: stats?.totalSections ?? 0,
      href: "/pages",
    },
  ]

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Showcase All Dashboard Summary Metrics" },
        ]}
      />

      {loading && !stats ? (
        <div className="flex h-40 items-center justify-center text-zinc-500">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <div
                key={card.label}
                className={
                  card.gradient
                    ? "rounded-2xl bg-gradient-to-br from-[#c026a0] to-[#5b21b6] p-5 text-white shadow-lg shadow-[#c026a0]/20"
                    : "rounded-2xl border border-white/10 bg-zinc-950 p-5"
                }
              >
                <p className="text-sm opacity-80">{card.label}</p>
                <p className="mt-3 text-4xl font-semibold">{card.value}</p>
                <p className="mt-2 text-xs opacity-70">Trending up this month</p>
                <Link
                  href={card.href}
                  className="mt-4 inline-flex h-7 items-center rounded-lg border border-white/20 px-2.5 text-[0.8rem] hover:bg-white/10"
                >
                  View All
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-4">
            {[
              {
                title: "Active Pages",
                desc: "Pages that are live and accessible",
                value: stats?.activePages ?? stats?.totalPages ?? 0,
              },
              {
                title: "Active Posts",
                desc: "Posts currently engaging your audience",
                value: stats?.activePosts ?? stats?.totalPosts ?? 0,
              },
              {
                title: "Websites",
                desc: "Attached headless destinations",
                value: stats?.totalWebsites ?? 0,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-zinc-950 p-5"
              >
                <h3 className="font-medium">{item.title}</h3>
                <p className="mt-1 text-xs text-zinc-500">{item.desc}</p>
                <div className="mt-6 flex h-28 items-center justify-center">
                  <div className="flex size-20 items-center justify-center rounded-full bg-[radial-gradient(circle,_rgba(192,38,160,0.55)_0%,_rgba(0,0,0,0)_70%)] text-2xl font-semibold">
                    {item.value}
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
              <h3 className="font-medium">Post Distribution</h3>
              <div className="mt-2 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={
                        stats?.postDistribution?.length
                          ? stats.postDistribution
                          : [{ name: "Posts", value: stats?.totalPosts || 1 }]
                      }
                      dataKey="value"
                      nameKey="name"
                      innerRadius={40}
                      outerRadius={65}
                    >
                      {(stats?.postDistribution || [{ name: "Posts", value: 1 }]).map(
                        (_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ),
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-medium">Activity Graphical Representation</h3>
                <p className="text-xs text-zinc-500">
                  Retrieve activity count grouped by day over the past specified days.
                </p>
              </div>
              <div className="flex gap-2">
                {[90, 30, 7].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d)}
                    className={
                      days === d
                        ? "rounded-full bg-[#c026a0] px-3 py-1 text-xs text-white"
                        : "rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400"
                    }
                  >
                    Last {d} days
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={(stats?.activitySeries || []).slice(
                    days === 7 ? -7 : days === 30 ? -30 : undefined,
                  )}
                >
                  <defs>
                    <linearGradient id="act" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c026a0" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#c026a0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#c026a0"
                    fill="url(#act)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
