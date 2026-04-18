import { useState } from 'react'
import { Pencil, Plus, Ban, Undo2, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  useFirearmLookups,
  type FirearmLookupKind,
  type FirearmLookupRow,
} from '@/hooks/use-firearm-lookups'

interface Props {
  kind: FirearmLookupKind
}

export function LookupTableEditor({ kind }: Props) {
  const { rows, loading, refresh } = useFirearmLookups(kind, false)
  const [filter, setFilter] = useState('')
  const [editing, setEditing] = useState<FirearmLookupRow | null>(null)
  const [formName, setFormName] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const filtered = rows.filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()))

  const openAdd = (): void => {
    setEditing(null)
    setFormName('')
    setErr(null)
    setDialogOpen(true)
  }
  const openEdit = (row: FirearmLookupRow): void => {
    setEditing(row)
    setFormName(row.name)
    setErr(null)
    setDialogOpen(true)
  }

  const save = async (): Promise<void> => {
    setSaving(true)
    setErr(null)
    const name = formName.trim()
    if (!name) {
      setErr('Name required')
      setSaving(false)
      return
    }
    const res = editing
      ? await window.api.firearmAttrs.update(kind, editing.id, { name })
      : await window.api.firearmAttrs.create(kind, { name })
    setSaving(false)
    if (!res.success) {
      setErr(res.message ?? 'Save failed')
      return
    }
    setDialogOpen(false)
    await refresh()
  }

  const toggleActive = async (row: FirearmLookupRow): Promise<void> => {
    const res = row.isActive
      ? await window.api.firearmAttrs.deactivate(kind, row.id)
      : await window.api.firearmAttrs.update(kind, row.id, { isActive: true })
    if (res.success) await refresh()
  }

  const changeSort = async (row: FirearmLookupRow, delta: number): Promise<void> => {
    const res = await window.api.firearmAttrs.update(kind, row.id, {
      sortOrder: row.sortOrder + delta,
    })
    if (res.success) await refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder={`Search ${kind}…`}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Sort</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-24">Status</TableHead>
            <TableHead className="w-48 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={4}>Loading…</TableCell>
            </TableRow>
          )}
          {!loading && filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}>No records.</TableCell>
            </TableRow>
          )}
          {filtered.map((r) => (
            <TableRow key={r.id} className={!r.isActive ? 'opacity-50' : ''}>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => changeSort(r, -1)}>
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => changeSort(r, +1)}>
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>{r.name}</TableCell>
              <TableCell>
                <Badge variant={r.isActive ? 'default' : 'outline'}>
                  {r.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toggleActive(r)}>
                  {r.isActive ? (
                    <>
                      <Ban className="h-3 w-3 mr-1" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Undo2 className="h-3 w-3 mr-1" />
                      Reactivate
                    </>
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit' : 'Add'} {kind.slice(0, -1)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              autoFocus
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            {err && <p className="text-sm text-destructive">{err}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving || !formName.trim()} onClick={save}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
