"use client"

import { FormEvent, useEffect, useState } from "react"
import { Loader2, Plus, Trash2, UserRound } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { DataTableShell, TableHeadRow } from "@/components/data-table-shell"
import { usersApi } from "@/lib/api"
import type { Role, User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EDITOR" as Role,
  })

  async function load() {
    setLoading(true)
    try {
      setUsers(await usersApi.list())
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    try {
      await usersApi.create(form)
      toast.success("User created")
      setOpen(false)
      setForm({ name: "", email: "", password: "", role: "EDITOR" })
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed")
    }
  }

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "List Of All Users" },
        ]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={<Button className="bg-gradient-to-r from-[#4c47ad] to-[#b02e8d]" />}
            >
              <Plus className="size-4" />
              Add User
            </DialogTrigger>
            <DialogContent className="border-white/10 bg-zinc-950">
              <DialogHeader>
                <DialogTitle>Add User</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreate} className="space-y-3">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <select
                    className="h-9 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm"
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value as Role })
                    }
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="EDITOR">EDITOR</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </div>
                <Button type="submit" className="w-full">
                  Create User
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTableShell>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-zinc-500" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <TableHeadRow>
                <th className="px-4 py-3 font-medium">User Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </TableHeadRow>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-white/5">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-xs">
                      <UserRound className="size-3.5" />
                      {u.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs">
                      {u.email}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs text-black">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={u.isActive ? "ACTIVE" : "INACTIVE"} />
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={async () => {
                        if (!confirm("Delete user?")) return
                        try {
                          await usersApi.remove(u.id)
                          toast.success("Deleted")
                          await load()
                        } catch (e) {
                          toast.error(
                            e instanceof Error ? e.message : "Delete failed",
                          )
                        }
                      }}
                    >
                      <Trash2 className="size-4 text-red-400" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataTableShell>
    </div>
  )
}
