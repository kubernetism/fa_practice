import { Crosshair, Building2, Sparkles, Shield } from 'lucide-react'

export function WelcomeStep() {
  return (
    <div className="text-center space-y-8">
      {/* Logo/Icon */}
      <div className="flex justify-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <Crosshair className="w-12 h-12 text-primary" />
        </div>
      </div>

      {/* Welcome Text */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">Welcome to Your POS System</h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Your complete Point of Sale &amp; Inventory Management solution
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
        <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
          <Building2 className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-medium">Multi-Branch</h3>
          <p className="text-sm text-muted-foreground text-center">
            Manage multiple store locations
          </p>
        </div>

        <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
          <Sparkles className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-medium">Easy to Use</h3>
          <p className="text-sm text-muted-foreground text-center">
            Intuitive interface for daily operations
          </p>
        </div>

        <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
          <Shield className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-medium">Secure</h3>
          <p className="text-sm text-muted-foreground text-center">
            Role-based access control & audit logs
          </p>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="pt-4">
        <div className="inline-block p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm text-muted-foreground">
            This wizard will help you configure your business settings in just a few steps.
            <br />
            Click <span className="font-medium text-foreground">Next</span> to get started.
          </p>
        </div>
      </div>
    </div>
  )
}
