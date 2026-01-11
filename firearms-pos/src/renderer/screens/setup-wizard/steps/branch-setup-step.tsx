import { useEffect, useRef } from 'react'
import { useSetup } from '@/contexts/setup-context'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { MapPin, RefreshCw, Copy } from 'lucide-react'

// Debug logging helper
const DEBUG = true
const log = (message: string, ...args: unknown[]) => {
  if (DEBUG) {
    console.log(`[BranchSetupStep] ${message}`, ...args)
  }
}

export function BranchSetupStep() {
  const { branchInfo, updateBranchInfo, businessInfo, generateBranchCode } = useSetup()

  // NO AUTO-FILL, NO AUTO-FOCUS, NO AUTO-GENERATE
  // User must manually fill in all fields
  // This is to isolate the freeze issue

  console.log('[BranchSetupStep] Rendered once')

  const handleRegenerateCode = async () => {
    if (businessInfo.businessName) {
      const code = await generateBranchCode(businessInfo.businessName)
      if (code) {
        updateBranchInfo({ code })
      }
    }
  }

  const handleCopyFromBusiness = () => {
    updateBranchInfo({
      address: businessInfo.businessAddress,
      phone: businessInfo.businessPhone,
      email: businessInfo.businessEmail,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Main Branch Setup</h2>
          <p className="text-sm text-muted-foreground">
            Configure your primary store location
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
        This will be your main branch. You can add more branches later from the settings.
      </div>

      {/* Form */}
      <div className="grid gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Branch Name */}
          <div className="grid gap-2">
            <Label htmlFor="branchName">
              Branch Name <span className="text-destructive">*</span>
            </Label>
            <Input
              ref={branchNameRef}
              id="branchName"
              placeholder="Main Store"
              value={branchInfo.name}
              onChange={(e) => {
                log('Branch name onChange:', e.target.value.substring(0, 20))
                updateBranchInfo({ name: e.target.value })
              }}
              autoComplete="off"
              required
            />
          </div>

          {/* Branch Code */}
          <div className="grid gap-2">
            <Label htmlFor="branchCode">
              Branch Code <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="branchCode"
                placeholder="MAIN01"
                value={branchInfo.code}
                onChange={(e) => updateBranchInfo({ code: e.target.value.toUpperCase() })}
                className="uppercase"
                required
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleRegenerateCode}
                title="Regenerate code"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Unique identifier for this branch (auto-generated)
            </p>
          </div>
        </div>

        {/* Copy from Business Button */}
        <div className="flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={handleCopyFromBusiness}>
            <Copy className="w-4 h-4 mr-1" />
            Copy from Business Info
          </Button>
        </div>

        {/* Address */}
        <div className="grid gap-2">
          <Label htmlFor="branchAddress">Branch Address</Label>
          <Textarea
            id="branchAddress"
            placeholder="Enter branch address"
            value={branchInfo.address}
            onChange={(e) => updateBranchInfo({ address: e.target.value })}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Phone */}
          <div className="grid gap-2">
            <Label htmlFor="branchPhone">Phone</Label>
            <Input
              id="branchPhone"
              placeholder="Branch phone number"
              value={branchInfo.phone}
              onChange={(e) => updateBranchInfo({ phone: e.target.value })}
            />
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="branchEmail">Email</Label>
            <Input
              id="branchEmail"
              type="email"
              placeholder="Branch email address"
              value={branchInfo.email}
              onChange={(e) => updateBranchInfo({ email: e.target.value })}
            />
          </div>
        </div>

        {/* License Number */}
        <div className="grid gap-2">
          <Label htmlFor="licenseNumber">Firearms License Number</Label>
          <Input
            id="licenseNumber"
            placeholder="FFL-XXXXXXXX"
            value={branchInfo.licenseNumber}
            onChange={(e) => updateBranchInfo({ licenseNumber: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Federal Firearms License (FFL) number for this location
          </p>
        </div>
      </div>
    </div>
  )
}
