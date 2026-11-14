"use client"

import { FormEvent, useEffect, useState } from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { DataTableShell, TableHeadRow } from "@/components/data-table-shell"
import { websitesApi } from "@/lib/api"
import type { Website } from "@/lib/types"
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

export default function WebsitesPage() {
  const [items, setItems] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    slug: "",
    url: "",
    description: "",
  })

  async function load() {
    setLoading(true)
    try {
      setItems(await websitesApi.list())
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load websites")
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
      await websitesApi.create({
        ...form,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
      })
      toast.success("Website attached")
      setOpen(false)
      setForm({ name: "", slug: "", url: "", description: "" })
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
          { label: "Attach Website Destinations" },
        ]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="outline" className="border-white/20" />}>
              <Plus className="size-4" />
              Attach Website
            </DialogTrigger>
            <DialogContent className="border-white/10 bg-zinc-950">
              <DialogHeader>
                <DialogTitle>Attach Website</DialogTitle>
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
                  <Label>Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="tourism-demo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website URL</Label>
                  <Input
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <Button type="submit" className="w-full">
                  Attach
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <p className="mb-4 max-w-3xl text-sm text-zinc-400">
        Attach any website URL to manage its pages and HTML sections as JSON content APIs.
        Tourism sites can consume{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
          /api/v1/sites/:slug/pages/:pageSlug
        </code>
        .
      </p>

      <DataTableShell>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-zinc-500" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <TableHeadRow>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">URL</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </TableHeadRow>
            </thead>
            <tbody>
              {items.map((w) => (
                <tr key={w.id} className="border-t border-white/5">
                  <td className="px-4 py-3">{w.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{w.slug}</td>
                  <td className="px-4 py-3">
                    <a
                      href={w.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#f0abfc] hover:underline"
                    >
                      {w.url}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={async () => {
                        if (!confirm("Remove website?")) return
                        try {
                          await websitesApi.remove(w.id)
                          toast.success("Removed")
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
