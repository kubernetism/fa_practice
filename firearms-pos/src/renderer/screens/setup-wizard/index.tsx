import { useCallback, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSetup } from '@/contexts/setup-context'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Check, Loader2, Shield } from 'lucide-react'
import { ThemeToggle } from '@/components/theme'
import { WelcomeStep } from './steps/welcome-step'
import { BusinessInfoStep } from './steps/business-info-step'
import { BranchTaxStep } from './steps/branch-tax-step'
import { AdminAccountStep } from './steps/admin-account-step'

const STEPS = [
  { number: 1, title: 'Welcome', description: 'Getting Started' },
  { number: 2, title: 'Business', description: 'Business Details' },
  { number: 3, title: 'Branch & Tax', description: 'Location & Finance' },
  { number: 4, title: 'Admin', description: 'Create Admin User' },
]

export function SetupWizardScreen() {
  const navigate = useNavigate()
  const { currentStep, nextStep, prevStep, completeSetup, isLoading, error, businessInfo, adminAccountInfo } =
    useSetup()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
  }, [])

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return true
      case 2:
        return businessInfo.businessName.trim() !== ''
      case 3:
        return true
      case 4:
        return (
          adminAccountInfo.fullName.trim() !== '' &&
          adminAccountInfo.username.trim() !== '' &&
          adminAccountInfo.password.length >= 6 &&
          adminAccountInfo.password === adminAccountInfo.confirmPassword
        )
      default:
        return true
    }
  }, [currentStep, businessInfo.businessName, adminAccountInfo])

  const handleNext = useCallback(() => {
    if (currentStep < 4 && canProceed()) {
      nextStep()
    }
  }, [currentStep, canProceed, nextStep])

  const handlePrev = useCallback(() => {
    if (currentStep > 1) {
      prevStep()
    }
  }, [currentStep, prevStep])

  const handleComplete = useCallback(async () => {
    const success = await completeSetup()
    if (success) {
      navigate('/login')
    }
  }, [completeSetup, navigate])

  const handleRestoreComplete = useCallback(() => {
    navigate('/login')
  }, [navigate])

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onRestoreComplete={handleRestoreComplete} />
      case 2:
        return <BusinessInfoStep />
      case 3:
        return <BranchTaxStep />
      case 4:
        return <AdminAccountStep />
      default:
        return <WelcomeStep onRestoreComplete={handleRestoreComplete} />
    }
  }

  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left branded panel — vertical stepper */}
      <div className="hidden lg:flex lg:w-[260px] xl:w-[280px] relative bg-primary flex-col overflow-hidden shrink-0">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="wizard-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#wizard-grid)" className="text-primary-foreground" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col h-full p-6">
          {/* Brand header */}
          <div
            className="mb-10"
            style={{
              transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
              transitionDelay: '0.1s',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(-12px)',
            }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10 border border-primary-foreground/10 mb-4">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-bold text-primary-foreground tracking-tight">
              Initial Setup
            </h2>
            <p className="text-xs text-primary-foreground/50 mt-1">
              Configure your system
            </p>
          </div>

          {/* Vertical step indicators */}
          <nav className="flex-1 space-y-1">
            {STEPS.map((step, index) => {
              const isCompleted = currentStep > step.number
              const isCurrent = currentStep === step.number

              return (
                <div
                  key={step.number}
                  style={{
                    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
                    transitionDelay: `${0.15 + index * 0.08}s`,
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateX(0)' : 'translateX(-16px)',
                  }}
                >
                  <div className="flex items-center gap-3 py-2.5">
                    {/* Step circle */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                        isCompleted
                          ? 'bg-primary-foreground text-primary'
                          : isCurrent
                            ? 'bg-primary-foreground/20 text-primary-foreground ring-2 ring-primary-foreground/40'
                            : 'bg-primary-foreground/5 text-primary-foreground/30 border border-primary-foreground/10'
                      }`}
                    >
                      {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.number}
                    </div>

                    {/* Step text */}
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium truncate transition-colors ${
                          isCurrent
                            ? 'text-primary-foreground'
                            : isCompleted
                              ? 'text-primary-foreground/70'
                              : 'text-primary-foreground/30'
                        }`}
                      >
                        {step.title}
                      </p>
                      <p
                        className={`text-[10px] truncate transition-colors ${
                          isCurrent ? 'text-primary-foreground/50' : 'text-primary-foreground/20'
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Connecting line */}
                  {index < STEPS.length - 1 && (
                    <div className="ml-[15px] h-4 w-px">
                      <div
                        className={`h-full w-full transition-colors duration-300 ${
                          currentStep > step.number ? 'bg-primary-foreground/40' : 'bg-primary-foreground/10'
                        }`}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Bottom version */}
          <div
            className="text-[10px] text-primary-foreground/25 font-mono"
            style={{
              transition: 'opacity 0.6s ease-out',
              transitionDelay: '0.5s',
              opacity: mounted ? 1 : 0,
            }}
          >
            v1.0.0
          </div>
        </div>
      </div>

      {/* Right content panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border/50">
          {/* Mobile step indicator */}
          <div className="lg:hidden flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-xs text-muted-foreground">
              — {STEPS[currentStep - 1].title}
            </span>
          </div>
          {/* Desktop: step title */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Step {currentStep} of {STEPS.length}
            </span>
          </div>
          <ThemeToggle />
        </div>

        {/* Mobile progress bar */}
        <div className="lg:hidden h-0.5 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-6">
            <div
              style={{
                transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
                transitionDelay: '0.2s',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(12px)',
              }}
            >
              {error && (
                <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                  <div className="h-2 w-2 rounded-full bg-destructive shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {renderStep()}
            </div>
          </div>
        </div>

        {/* Navigation footer */}
        <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
          {/* Progress bar */}
          <div className="hidden lg:block h-0.5 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between px-6 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={currentStep === 1 || isLoading}
              className="gap-1.5 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>

            <p className="text-[10px] text-muted-foreground/50 hidden sm:block">
              Initial Setup Wizard
            </p>

            {currentStep < 4 ? (
              <Button
                size="sm"
                onClick={handleNext}
                disabled={!canProceed() || isLoading}
                className="gap-1.5 text-xs"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleComplete}
                disabled={!canProceed() || isLoading}
                className="gap-1.5 text-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Complete Setup
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
