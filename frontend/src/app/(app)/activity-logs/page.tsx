"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { DataTableShell, TableHeadRow } from "@/components/data-table-shell"
import { activityApi, usersApi } from "@/lib/api"
import type { ActivityLog, User } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  async function load(userId?: string) {
    setLoading(true)
    try {
      const [l, u] = await Promise.all([
        activityApi.list(userId),
        usersApi.list(),
      ])
      setLogs(l)
      setUsers(u)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load activity")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(filter === "all" ? undefined : filter)
  }, [filter])

  const pills = useMemo(
    () => [{ id: "all", name: "All" }, ...users.map((u) => ({ id: u.id, name: u.name }))],
    [users],
  )

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Showing All Activities Performed By Users" },
        ]}
      />

      <div className="mb-4 rounded-2xl border border-white/10 bg-gradient-to-r from-[#5b21b6]/40 to-[#c026a0]/30 p-5">
        <h2 className="text-lg font-semibold">Activity Logs</h2>
        <p className="text-sm text-zinc-300">
          Filter activity logs by user for the last period.
        </p>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-sm text-zinc-400">List of All Users:</p>
        <div className="flex flex-wrap gap-2">
          {pills.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setFilter(p.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs",
                filter === p.id
                  ? "bg-[#c026a0] text-white"
                  : "bg-white text-black",
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <DataTableShell>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-zinc-500" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <TableHeadRow>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 font-medium">When</th>
              </TableHeadRow>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-white/5">
                  <td className="px-4 py-3">
                    {log.user?.name || users.find((u) => u.id === log.userId)?.name || "—"}
                  </td>
                  <td className="px-4 py-3">{log.action}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    {log.entity}
                    {log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {!logs.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-zinc-500">
                    No activity logs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </DataTableShell>
    </div>
  )
}
