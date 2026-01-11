import { useEffect, useRef } from 'react'
import { useSetup } from '@/contexts/setup-context'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2 } from 'lucide-react'

// Debug logging helper
const DEBUG = true
const log = (message: string, ...args: unknown[]) => {
  if (DEBUG) {
    console.log(`[BusinessInfoStep] ${message}`, ...args)
  }
}

const BUSINESS_TYPES = ['Retail', 'Wholesale', 'Mixed']

export function BusinessInfoStep() {
  const { businessInfo, updateBusinessInfo } = useSetup()
  const businessNameRef = useRef<HTMLInputElement>(null)

  // Track render count
  const renderCount = useRef(0)
  renderCount.current += 1

  // Log every render
  useEffect(() => {
    log(`Component rendered - count: ${renderCount.current}`)
  })

  // Log when businessInfo changes
  useEffect(() => {
    log(`BusinessInfo in step:`, {
      businessName: businessInfo.businessName?.substring(0, 20),
      businessType: businessInfo.businessType,
    })
  }, [businessInfo])

  // Warning for excessive renders
  useEffect(() => {
    if (renderCount.current > 50) {
      console.error('[BusinessInfoStep] WARNING: Excessive renders detected!', renderCount.current)
    }
  })

  // Auto-focus on business name field when step loads
  useEffect(() => {
    log('Setting up auto-focus timer')
    const timer = setTimeout(() => {
      log('Auto-focus executing')
      businessNameRef.current?.focus()
    }, 100)
    return () => {
      log('Cleaning up auto-focus timer')
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Business Information</h2>
          <p className="text-sm text-muted-foreground">Enter your business details</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-4">
        {/* Business Name - Required */}
        <div className="grid gap-2">
          <Label htmlFor="businessName">
            Business Name <span className="text-destructive">*</span>
          </Label>
          <Input
            ref={businessNameRef}
            id="businessName"
            placeholder="Enter your business name"
            value={businessInfo.businessName}
            onChange={(e) => {
              log('Business name onChange:', e.target.value.substring(0, 20))
              updateBusinessInfo({ businessName: e.target.value })
            }}
            autoComplete="off"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Registration Number */}
          <div className="grid gap-2">
            <Label htmlFor="businessRegistrationNo">Registration Number</Label>
            <Input
              id="businessRegistrationNo"
              placeholder="Business registration number"
              value={businessInfo.businessRegistrationNo}
              onChange={(e) => updateBusinessInfo({ businessRegistrationNo: e.target.value })}
            />
          </div>

          {/* Business Type */}
          <div className="grid gap-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Select
              value={businessInfo.businessType}
              onValueChange={(value) => updateBusinessInfo({ businessType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Address */}
        <div className="grid gap-2">
          <Label htmlFor="businessAddress">Address</Label>
          <Textarea
            id="businessAddress"
            placeholder="Enter your business address"
            value={businessInfo.businessAddress}
            onChange={(e) => updateBusinessInfo({ businessAddress: e.target.value })}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* City */}
          <div className="grid gap-2">
            <Label htmlFor="businessCity">City</Label>
            <Input
              id="businessCity"
              placeholder="City"
              value={businessInfo.businessCity}
              onChange={(e) => updateBusinessInfo({ businessCity: e.target.value })}
            />
          </div>

          {/* State */}
          <div className="grid gap-2">
            <Label htmlFor="businessState">State/Province</Label>
            <Input
              id="businessState"
              placeholder="State"
              value={businessInfo.businessState}
              onChange={(e) => updateBusinessInfo({ businessState: e.target.value })}
            />
          </div>

          {/* Country */}
          <div className="grid gap-2">
            <Label htmlFor="businessCountry">Country</Label>
            <Input
              id="businessCountry"
              placeholder="Country"
              value={businessInfo.businessCountry}
              onChange={(e) => updateBusinessInfo({ businessCountry: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Phone */}
          <div className="grid gap-2">
            <Label htmlFor="businessPhone">Phone</Label>
            <Input
              id="businessPhone"
              placeholder="Business phone number"
              value={businessInfo.businessPhone}
              onChange={(e) => updateBusinessInfo({ businessPhone: e.target.value })}
            />
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="businessEmail">Email</Label>
            <Input
              id="businessEmail"
              type="email"
              placeholder="Business email address"
              value={businessInfo.businessEmail}
              onChange={(e) => updateBusinessInfo({ businessEmail: e.target.value })}
            />
          </div>
        </div>

        {/* Website */}
        <div className="grid gap-2">
          <Label htmlFor="businessWebsite">Website</Label>
          <Input
            id="businessWebsite"
            placeholder="https://www.example.com"
            value={businessInfo.businessWebsite}
            onChange={(e) => updateBusinessInfo({ businessWebsite: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
