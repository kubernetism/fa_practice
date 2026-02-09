import { Shield } from 'lucide-react'

export default function PlatformLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="platform-theme min-h-screen flex bg-tactical-grid">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative z-10 max-w-md px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Platform Admin</h1>
              <p className="text-sm text-muted-foreground">Control Panel</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
                Manage all tenants.
                <br />
                <span className="text-primary">One dashboard.</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Monitor subscriptions, manage tenant accounts, and oversee the
                entire Firearms POS platform from a single control panel.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {['Multi-Tenant', 'Subscriptions', 'Analytics', 'Impersonation'].map(
                (feature) => (
                  <span
                    key={feature}
                    className="px-3 py-1 text-xs font-medium rounded-full border border-border bg-card/50 text-muted-foreground"
                  >
                    {feature}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
