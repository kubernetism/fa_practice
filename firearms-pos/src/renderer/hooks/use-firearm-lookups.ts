import { useCallback, useEffect, useState } from 'react'

export type FirearmLookupKind = 'models' | 'calibers' | 'shapes' | 'designs'

export interface FirearmLookupRow {
  id: number
  name: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface UseFirearmLookups {
  rows: FirearmLookupRow[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  create: (name: string) => Promise<FirearmLookupRow | null>
}

export function useFirearmLookups(
  kind: FirearmLookupKind,
  activeOnly = true,
): UseFirearmLookups {
  const [rows, setRows] = useState<FirearmLookupRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await window.api.firearmAttrs.list(kind, { activeOnly })
    if (res.success) setRows(res.data as FirearmLookupRow[])
    else setError(res.message ?? 'Failed to load')
    setLoading(false)
  }, [kind, activeOnly])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(
    async (name: string): Promise<FirearmLookupRow | null> => {
      const res = await window.api.firearmAttrs.create(kind, { name })
      if (res.success && res.data) {
        await refresh()
        return res.data as FirearmLookupRow
      }
      setError(res.message ?? 'Failed to create')
      return null
    },
    [kind, refresh],
  )

  return { rows, loading, error, refresh, create }
}
