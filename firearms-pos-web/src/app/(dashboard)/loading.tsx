export default function Loading() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
      <div className="flex flex-col items-center gap-4">
        <div className="loader" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  )
}
