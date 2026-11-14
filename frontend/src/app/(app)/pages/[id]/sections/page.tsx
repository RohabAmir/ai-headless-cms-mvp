"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Loader2, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { DataTableShell, TableHeadRow } from "@/components/data-table-shell"
import { pagesApi, sectionsApi } from "@/lib/api"
import type { Page, PageSection, Section } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function SortableRow({
  item,
  onEdit,
  onDelete,
}: {
  item: PageSection
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <tr ref={setNodeRef} style={style} className="border-t border-white/5">
      <td className="px-2 py-3">
        <button
          type="button"
          className="cursor-grab px-2 text-zinc-500"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      </td>
      <td className="px-4 py-3">
        {item.section?.name || item.sectionId}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status="ACTIVE" />
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={onEdit}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}>
            <Trash2 className="size-4 text-red-400" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

export default function PageSectionsPage() {
  const params = useParams<{ id: string }>()
  const pageId = params.id
  const [page, setPage] = useState<Page | null>(null)
  const [items, setItems] = useState<PageSection[]>([])
  const [library, setLibrary] = useState<Section[]>([])
  const [selected, setSelected] = useState("")
  const [loading, setLoading] = useState(true)
  const [editItem, setEditItem] = useState<PageSection | null>(null)
  const [jsonText, setJsonText] = useState("")

  const sensors = useSensors(useSensor(PointerSensor))

  async function load() {
    setLoading(true)
    try {
      const [p, ps, secs] = await Promise.all([
        pagesApi.get(pageId),
        sectionsApi.pageSections(pageId),
        sectionsApi.list(),
      ])
      setPage(p)
      setItems(ps.sort((a, b) => a.order - b.order))
      setLibrary(secs)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load sections")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [pageId])

  const unused = useMemo(
    () =>
      library.filter((s) => !items.some((i) => i.sectionId === s.id)),
    [library, items],
  )

  async function attach() {
    if (!selected) return
    try {
      await sectionsApi.attach(pageId, selected)
      toast.success("Section attached")
      setSelected("")
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Attach failed")
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const next = arrayMove(items, oldIndex, newIndex)
    setItems(next)
    try {
      await sectionsApi.reorder(
        pageId,
        next.map((i) => i.id),
      )
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reorder failed")
      await load()
    }
  }

  async function saveEdit() {
    if (!editItem) return
    try {
      const parsed = JSON.parse(jsonText)
      await sectionsApi.updatePageSection(pageId, editItem.id, {
        contentOverride: parsed,
      })
      toast.success("Section content updated")
      setEditItem(null)
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid JSON / save failed")
    }
  }

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: "Pages", href: "/pages" },
          { label: "Build Your Website Sections" },
        ]}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          className="h-9 min-w-64 rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Choose a section from list</option>
          {unused.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <Button onClick={attach} disabled={!selected}>
          Attach Section
        </Button>
        <div className="ml-auto rounded-lg border border-white/10 px-3 py-2 text-sm">
          {page?.name || "Page"} Sections
        </div>
      </div>

      <DataTableShell>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-zinc-500" />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <table className="w-full text-sm">
              <thead>
                <TableHeadRow>
                  <th className="w-10 px-2 py-3" />
                  <th className="px-4 py-3 font-medium">Section Name</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </TableHeadRow>
              </thead>
              <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody>
                  {items.map((item) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      onEdit={() => {
                        setEditItem(item)
                        setJsonText(
                          JSON.stringify(
                            item.contentOverride || item.section?.content || {},
                            null,
                            2,
                          ),
                        )
                      }}
                      onDelete={async () => {
                        if (!confirm("Remove section from page?")) return
                        try {
                          await sectionsApi.detach(pageId, item.id)
                          toast.success("Removed")
                          await load()
                        } catch (e) {
                          toast.error(
                            e instanceof Error ? e.message : "Remove failed",
                          )
                        }
                      }}
                    />
                  ))}
                  {!items.length && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-10 text-center text-zinc-500"
                      >
                        No sections on this page yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </SortableContext>
            </table>
          </DndContext>
        )}
      </DataTableShell>

      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent className="border-white/10 bg-zinc-950 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              Edit JSON — {editItem?.section?.name || "Section"}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="min-h-64 font-mono text-xs"
          />
          <Button onClick={saveEdit}>Save Content API</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
