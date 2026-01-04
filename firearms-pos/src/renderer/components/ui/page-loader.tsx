import { LoaderPinwheel } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <LoaderPinwheel className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
