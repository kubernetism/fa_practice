import { useState } from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useFirearmLookups, type FirearmLookupKind } from '@/hooks/use-firearm-lookups'

interface Props {
  kind: FirearmLookupKind
  value: number | null
  onChange: (id: number | null) => void
  placeholder?: string
  allowAddNew?: boolean
  className?: string
  required?: boolean
  disabled?: boolean
}

export function LookupCombobox({
  kind,
  value,
  onChange,
  placeholder,
  allowAddNew = true,
  className,
  required,
  disabled,
}: Props) {
  const { rows, loading, create } = useFirearmLookups(kind, true)
  const [open, setOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createErr, setCreateErr] = useState<string | null>(null)

  const selected = rows.find((r) => r.id === value)
  const label = selected?.name ?? placeholder ?? `Select ${kind.slice(0, -1)}…`

  const handleAddNew = async (): Promise<void> => {
    setCreating(true)
    setCreateErr(null)
    const created = await create(newName.trim())
    if (created) {
      onChange(created.id)
      setAddOpen(false)
      setNewName('')
    } else {
      setCreateErr('Failed — name may already exist')
    }
    setCreating(false)
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-required={required}
            disabled={disabled}
            className={cn(
              'w-full justify-between font-normal',
              className,
              !selected && 'text-muted-foreground',
            )}
          >
            {label}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder={`Search ${kind}…`} />
            <CommandList>
              <CommandEmpty>{loading ? 'Loading…' : 'No results.'}</CommandEmpty>
              <CommandGroup>
                {rows.map((r) => (
                  <CommandItem
                    key={r.id}
                    value={r.name}
                    onSelect={() => {
                      onChange(r.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === r.id ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {r.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              {allowAddNew && (
                <CommandGroup>
                  <CommandItem
                    value="__add_new__"
                    onSelect={() => {
                      setOpen(false)
                      setAddOpen(true)
                    }}
                    className="text-primary"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add new…
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new {kind.slice(0, -1)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-lookup-name">Name</Label>
            <Input
              id="new-lookup-name"
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            {createErr && <p className="text-sm text-destructive">{createErr}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!newName.trim() || creating} onClick={handleAddNew}>
              {creating ? 'Adding…' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
