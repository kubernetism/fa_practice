export function PageLoader({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-12 ${className ?? ''}`}>
      <div className="flex flex-col items-center gap-3">
        <div className="loader" />
        <p className="text-xs text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  )
}

export function TableLoader({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12">
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="loader" />
            <p className="text-xs text-muted-foreground animate-pulse">Loading...</p>
          </div>
        </div>
      </td>
    </tr>
  )
}
