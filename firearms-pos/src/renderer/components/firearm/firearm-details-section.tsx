import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { LookupCombobox } from './lookup-combobox'

export interface FirearmFieldsValue {
  make: 'local' | 'imported' | null
  madeYear: number | null
  madeCountry: string | null
  firearmModelId: number | null
  caliberId: number | null
  shapeId: number | null
  designId: number | null
  defaultSupplierId: number | null
}

interface Props {
  value: FirearmFieldsValue
  onChange: (v: FirearmFieldsValue) => void
  isFirearmCategory: boolean
  suppliers: Array<{ id: number; name: string }>
}

export const emptyFirearmFields: FirearmFieldsValue = {
  make: null,
  madeYear: null,
  madeCountry: null,
  firearmModelId: null,
  caliberId: null,
  shapeId: null,
  designId: null,
  defaultSupplierId: null,
}

const THIS_YEAR = new Date().getFullYear()

export function FirearmDetailsSection({
  value,
  onChange,
  isFirearmCategory,
  suppliers,
}: Props) {
  const [expanded, setExpanded] = useState(isFirearmCategory)
  useEffect(() => {
    if (isFirearmCategory) setExpanded(true)
  }, [isFirearmCategory])

  const set = <K extends keyof FirearmFieldsValue>(k: K, v: FirearmFieldsValue[K]): void => {
    onChange({ ...value, [k]: v })
  }

  const req = (label: string): string => (isFirearmCategory ? `${label} *` : label)

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setExpanded((e) => !e)}
      >
        <CardTitle className="flex items-center justify-between text-base">
          <span>
            Firearm Details{' '}
            {isFirearmCategory && (
              <span className="text-xs text-destructive">(required)</span>
            )}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </CardTitle>
      </CardHeader>
      {expanded && (
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{req('Make')}</Label>
            <RadioGroup
              className="flex gap-4 mt-2"
              value={value.make ?? ''}
              onValueChange={(v) =>
                set('make', ((v as 'local' | 'imported') || null) as FirearmFieldsValue['make'])
              }
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem id="make-local" value="local" />
                <Label htmlFor="make-local">Local</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="make-imported" value="imported" />
                <Label htmlFor="make-imported">Imported</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Made Year</Label>
            <Input
              type="number"
              min={1800}
              max={THIS_YEAR + 1}
              value={value.madeYear ?? ''}
              onChange={(e) =>
                set('madeYear', e.target.value ? Number(e.target.value) : null)
              }
              placeholder={`1800–${THIS_YEAR + 1}`}
            />
          </div>
          <div>
            <Label>Made Country</Label>
            <Input
              value={value.madeCountry ?? ''}
              onChange={(e) => set('madeCountry', e.target.value || null)}
              placeholder="Austria, Pakistan, USA…"
            />
          </div>
          <div>
            <Label>{req('Model')}</Label>
            <LookupCombobox
              kind="models"
              value={value.firearmModelId}
              onChange={(id) => set('firearmModelId', id)}
              required={isFirearmCategory}
            />
          </div>
          <div>
            <Label>{req('Caliber / Bore')}</Label>
            <LookupCombobox
              kind="calibers"
              value={value.caliberId}
              onChange={(id) => set('caliberId', id)}
              required={isFirearmCategory}
            />
          </div>
          <div>
            <Label>Shape</Label>
            <LookupCombobox
              kind="shapes"
              value={value.shapeId}
              onChange={(id) => set('shapeId', id)}
            />
          </div>
          <div>
            <Label>Design</Label>
            <LookupCombobox
              kind="designs"
              value={value.designId}
              onChange={(id) => set('designId', id)}
            />
          </div>
          <div>
            <Label>Default Supplier</Label>
            <select
              className="w-full rounded-md border px-3 py-2 bg-background"
              value={value.defaultSupplierId ?? ''}
              onChange={(e) =>
                set('defaultSupplierId', e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">— none —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
