import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSetup } from '@/contexts/setup-context'

// Debug logging helper
const DEBUG = true
const log = (message: string, ...args: unknown[]) => {
  if (DEBUG) {
    console.log(`[SetupWizard] ${message}`, ...args)
  }
}
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react'
import { WelcomeStep } from './steps/welcome-step'
import { BusinessInfoStep } from './steps/business-info-step'
import { BranchSetupStep } from './steps/branch-setup-step'
import { TaxCurrencyStep } from './steps/tax-currency-step'
import { OperationsStep } from './steps/operations-step'

const STEPS = [
  { number: 1, title: 'Welcome', description: 'Getting Started' },
  { number: 2, title: 'Business', description: 'Business Information' },
  { number: 3, title: 'Branch', description: 'Main Branch Setup' },
  { number: 4, title: 'Tax & Currency', description: 'Financial Settings' },
  { number: 5, title: 'Operations', description: 'Operational Settings' },
]

function StepIndicator({
  step,
  currentStep,
}: {
  step: { number: number; title: string; description: string }
  currentStep: number
}) {
  const isCompleted = currentStep > step.number
  const isCurrent = currentStep === step.number

  return (
    <div className="flex items-center">
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
          isCompleted
            ? 'bg-primary border-primary text-primary-foreground'
            : isCurrent
              ? 'border-primary text-primary'
              : 'border-muted-foreground/30 text-muted-foreground'
        }`}
      >
        {isCompleted ? <Check className="w-5 h-5" /> : step.number}
      </div>
      <div className="ml-3 hidden sm:block">
        <p
          className={`text-sm font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}
        >
          {step.title}
        </p>
        <p className="text-xs text-muted-foreground">{step.description}</p>
      </div>
    </div>
  )
}

export function SetupWizardScreen() {
  const navigate = useNavigate()
  const { currentStep, nextStep, prevStep, completeSetup, isLoading, error, businessInfo } =
    useSetup()

  // DISABLED ALL LOGGING TO FIX FREEZE
  // console.log('[SetupWizard] Rendered, step:', currentStep)

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return true // Welcome step can always proceed
      case 2:
        return businessInfo.businessName.trim() !== ''
      case 3:
        return true // Branch info is optional or auto-filled
      case 4:
        return true // Tax/currency has defaults
      case 5:
        return true // Operations has defaults
      default:
        return true
    }
  }, [currentStep, businessInfo.businessName])

  const handleNext = useCallback(() => {
    if (currentStep < 5 && canProceed()) {
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

  // TEMPORARILY DISABLED - Keyboard navigation was causing issues
  // TODO: Re-enable after debugging the freeze issue
  /*
  // Track keyboard handler setup count
  const keyboardSetupCount = useRef(0)

  // Keyboard navigation - Enter key to proceed, Escape to go back
  useEffect(() => {
    keyboardSetupCount.current += 1
    log(`Keyboard handler setup - count: ${keyboardSetupCount.current}, step: ${currentStep}`)

    // Warn if being set up too many times
    if (keyboardSetupCount.current > 20) {
      console.error('[SetupWizard] WARNING: Keyboard handler being set up too many times!', keyboardSetupCount.current)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in a textarea or select dropdown
      const target = e.target as HTMLElement
      if (
        target.tagName === 'TEXTAREA' ||
        target.getAttribute('role') === 'listbox' ||
        target.getAttribute('role') === 'option'
      ) {
        return
      }

      log(`Key pressed: ${e.key}, step: ${currentStep}, isLoading: ${isLoading}`)

      if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
        e.preventDefault()
        log('Enter key - proceeding to next step')
        if (currentStep < 5) {
          handleNext()
        } else {
          handleComplete()
        }
      } else if (e.key === 'Escape' && currentStep > 1 && !isLoading) {
        e.preventDefault()
        log('Escape key - going back')
        handlePrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      log('Keyboard handler cleanup')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentStep, isLoading, handleNext, handlePrev, handleComplete])
  */

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep />
      case 2:
        return <BusinessInfoStep />
      case 3:
        return <BranchSetupStep />
      case 4:
        return <TaxCurrencyStep />
      case 5:
        return <OperationsStep />
      default:
        return <WelcomeStep />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex flex-col">
      {/* Progress Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {STEPS.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <StepIndicator step={step} currentStep={currentStep} />
                {index < STEPS.length - 1 && (
                  <div
                    className={`hidden sm:block w-12 h-0.5 mx-2 ${
                      currentStep > step.number ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl shadow-lg">
          <CardContent className="p-6 sm:p-8">
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 1 || isLoading}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="text-center">
                <div className="text-sm text-muted-foreground">
                  Step {currentStep} of {STEPS.length}
                </div>
              </div>

              {currentStep < 5 ? (
                <Button onClick={handleNext} disabled={!canProceed() || isLoading}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Complete Setup
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="border-t bg-background/80 backdrop-blur-sm py-3">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-muted-foreground">
          Firearms POS - Initial Setup Wizard
        </div>
      </div>
    </div>
  )
}
