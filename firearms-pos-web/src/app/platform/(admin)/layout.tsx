import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { PlatformSidebar } from '@/components/platform/platform-sidebar'
import { PlatformHeader } from '@/components/platform/platform-header'

export default function PlatformAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="platform-theme">
      <SidebarProvider>
        <PlatformSidebar />
        <SidebarInset>
          <PlatformHeader />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
