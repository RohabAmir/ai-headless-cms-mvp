"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { DataTableShell, TableHeadRow } from "@/components/data-table-shell"
import { pagesApi, websitesApi } from "@/lib/api"
import type { Page, Website } from "@/lib/types"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    slug: "",
    websiteId: "",
    parentId: "",
  })

  async function load() {
    setLoading(true)
    try {
      const [p, w] = await Promise.all([pagesApi.list(), websitesApi.list()])
      setPages(p)
      setWebsites(w)
      if (!form.websiteId && w[0]) {
        setForm((f) => ({ ...f, websiteId: w[0].id }))
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load pages")
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
      await pagesApi.create({
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
        websiteId: form.websiteId,
        parentId: form.parentId || null,
        status: "ACTIVE",
      })
      toast.success("Page created")
      setOpen(false)
      setForm((f) => ({ ...f, name: "", slug: "", parentId: "" }))
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed")
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this page?")) return
    try {
      await pagesApi.remove(id)
      toast.success("Page deleted")
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed")
    }
  }

  const parentName = (p: Page) =>
    p.parent?.name || pages.find((x) => x.id === p.parentId)?.name || "—"

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Build Your Website Pages" },
        ]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="outline" className="border-white/20" />}>
              <Plus className="size-4" />
              Create Page
            </DialogTrigger>
            <DialogContent className="border-white/10 bg-zinc-950">
              <DialogHeader>
                <DialogTitle>Create Page</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Website</Label>
                  <select
                    className="h-9 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm"
                    value={form.websiteId}
                    onChange={(e) => setForm({ ...form, websiteId: e.target.value })}
                    required
                  >
                    <option value="">Select website</option>
                    {websites.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Page Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="auto-from-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Parent Page (optional)</Label>
                  <select
                    className="h-9 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm"
                    value={form.parentId}
                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  >
                    <option value="">None</option>
                    {pages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" className="w-full">
                  Create
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
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Page Name</th>
                <th className="px-4 py-3 font-medium">Parent Page</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </TableHeadRow>
            </thead>
            <tbody>
              {pages.map((p, i) => (
                <tr key={p.id} className="border-t border-white/5">
                  <td className="px-4 py-3 text-zinc-500">{i + 1}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs">
                      {p.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {parentName(p) === "—" ? (
                      "—"
                    ) : (
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs text-black">
                        {parentName(p)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        render={<Link href={`/pages/${p.id}/sections`} />}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => onDelete(p.id)}>
                        <Trash2 className="size-4 text-red-400" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="rounded-md p-1.5 hover:bg-white/10">
                          <MoreVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            render={<Link href={`/pages/${p.id}/sections`} />}
                          >
                            Add Section
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
              {!pages.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
                    No pages yet. Create one to start managing sections.
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
