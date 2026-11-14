"use client"

import { FormEvent, useEffect, useState } from "react"
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { DataTableShell, TableHeadRow } from "@/components/data-table-shell"
import { categoriesApi, postsApi } from "@/lib/api"
import type { Category, Post } from "@/lib/types"
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

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Post | null>(null)
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    categoryId: "",
    status: "ACTIVE",
  })

  async function load() {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([postsApi.list(), categoriesApi.list()])
      setPosts(p)
      setCategories(c)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load posts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  function openCreate() {
    setEditing(null)
    setForm({
      title: "",
      slug: "",
      content: "",
      categoryId: categories[0]?.id || "",
      status: "ACTIVE",
    })
    setOpen(true)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const body = {
      ...form,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-"),
      categoryId: form.categoryId || null,
    }
    try {
      if (editing) await postsApi.update(editing.id, body)
      else await postsApi.create(body)
      toast.success(editing ? "Post updated" : "Post created")
      setOpen(false)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed")
    }
  }

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Build Your Website Posts" },
        ]}
        actions={
          <Button variant="outline" className="border-white/20" onClick={openCreate}>
            <Plus className="size-4" />
            Add Post
          </Button>
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
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Post Title</th>
                <th className="px-4 py-3 font-medium">Post Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </TableHeadRow>
            </thead>
            <tbody>
              {posts.map((p, i) => (
                <tr key={p.id} className="border-t border-white/5">
                  <td className="px-4 py-3 text-zinc-500">{i + 1}</td>
                  <td className="px-4 py-3">{p.title}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs text-black">
                      {p.category?.name || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setEditing(p)
                          setForm({
                            title: p.title,
                            slug: p.slug,
                            content: p.content,
                            categoryId: p.categoryId || "",
                            status: p.status,
                          })
                          setOpen(true)
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={async () => {
                          if (!confirm("Delete post?")) return
                          try {
                            await postsApi.remove(p.id)
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataTableShell>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-white/10 bg-zinc-950">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Post" : "Add Post"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                className="h-9 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="min-h-28"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
