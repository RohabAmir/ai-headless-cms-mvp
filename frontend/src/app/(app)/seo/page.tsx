"use client"

import { FormEvent, useEffect, useState } from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { DataTableShell, TableHeadRow } from "@/components/data-table-shell"
import { pagesApi, seoApi, websitesApi } from "@/lib/api"
import type { Page, SeoSetting, Website } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function SeoPage() {
  const [items, setItems] = useState<SeoSetting[]>([])
  const [websites, setWebsites] = useState<Website[]>([])
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    entityType: "SITE",
    entityId: "",
    title: "",
    description: "",
    keywords: "",
    ogImage: "",
  })

  async function load() {
    setLoading(true)
    try {
      const [s, w, p] = await Promise.all([
        seoApi.list(),
        websitesApi.list(),
        pagesApi.list(),
      ])
      setItems(s)
      setWebsites(w)
      setPages(p)
      if (!form.entityId && w[0]) {
        setForm((f) => ({ ...f, entityId: w[0].id }))
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load SEO")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function onSave(e: FormEvent) {
    e.preventDefault()
    try {
      await seoApi.upsert({
        entityType: form.entityType,
        entityId: form.entityId,
        title: form.title,
        description: form.description || undefined,
        keywords: form.keywords
          ? form.keywords.split(",").map((k) => k.trim()).filter(Boolean)
          : undefined,
        ogImage: form.ogImage || undefined,
      })
      toast.success("SEO saved")
      setOpen(false)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed")
    }
  }

  const entityOptions =
    form.entityType === "SITE"
      ? websites.map((w) => ({ id: w.id, label: w.name }))
      : pages.map((p) => ({ id: p.id, label: p.name }))

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "SEO Settings" },
        ]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="outline" className="border-white/20" />}>
              <Plus className="size-4" />
              Upsert SEO
            </DialogTrigger>
            <DialogContent className="border-white/10 bg-zinc-950">
              <DialogHeader>
                <DialogTitle>SEO Meta</DialogTitle>
              </DialogHeader>
              <form onSubmit={onSave} className="space-y-3">
                <div className="space-y-2">
                  <Label>Entity Type</Label>
                  <select
                    className="h-9 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm"
                    value={form.entityType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        entityType: e.target.value,
                        entityId: "",
                      })
                    }
                  >
                    <option value="SITE">SITE</option>
                    <option value="PAGE">PAGE</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Entity</Label>
                  <select
                    className="h-9 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm"
                    value={form.entityId}
                    onChange={(e) => setForm({ ...form, entityId: e.target.value })}
                    required
                  >
                    <option value="">Select…</option>
                    {entityOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Keywords (comma separated)</Label>
                  <Input
                    value={form.keywords}
                    onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>OG Image URL</Label>
                  <Input
                    value={form.ogImage}
                    onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Save
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
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </TableHeadRow>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-t border-white/5">
                  <td className="px-4 py-3">{s.entityType}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    {s.entityId.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3">{s.title}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-zinc-400">
                    {s.description}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={async () => {
                        if (!confirm("Delete SEO entry?")) return
                        try {
                          await seoApi.remove(s.id)
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
