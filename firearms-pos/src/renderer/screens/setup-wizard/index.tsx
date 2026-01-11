import { useNavigate } from 'react-router-dom'
import { useSetup } from '@/contexts/setup-context'
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

  const handleNext = () => {
    if (currentStep < 5) {
      nextStep()
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      prevStep()
    }
  }

  const handleComplete = async () => {
    const success = await completeSetup()
    if (success) {
      navigate('/login')
    }
  }

  const canProceed = () => {
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
  }

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

              <div className="text-sm text-muted-foreground">
                Step {currentStep} of {STEPS.length}
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
