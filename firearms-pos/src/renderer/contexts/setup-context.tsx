import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react'

// Debug logging helper - DISABLED
const DEBUG = false
const log = (message: string, ...args: unknown[]) => {
  if (DEBUG) {
    console.log(`[SetupContext] ${message}`, ...args)
  }
}

export interface BusinessInfo {
  businessName: string
  businessRegistrationNo: string
  businessType: string
  businessAddress: string
  businessCity: string
  businessState: string
  businessCountry: string
  businessPostalCode: string
  businessPhone: string
  businessEmail: string
  businessWebsite: string
  businessLogo: string
}

export interface BranchInfo {
  name: string
  code: string
  address: string
  phone: string
  email: string
  licenseNumber: string
}

export interface TaxCurrencyInfo {
  currencyCode: string
  currencySymbol: string
  currencyPosition: string
  decimalPlaces: number
  taxName: string
  taxRate: number
  taxId: string
}

export interface OperationsInfo {
  workingDaysStart: string
  workingDaysEnd: string
  openingTime: string
  closingTime: string
  defaultPaymentMethod: string
  allowedPaymentMethods: string
  lowStockThreshold: number
  stockValuationMethod: string
}

interface SetupContextType {
  // State
  currentStep: number
  isLoading: boolean
  isCheckingSetup: boolean
  needsSetup: boolean | null
  error: string | null

  // Data
  businessInfo: BusinessInfo
  branchInfo: BranchInfo
  taxCurrencyInfo: TaxCurrencyInfo
  operationsInfo: OperationsInfo

  // Actions
  setCurrentStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  updateBusinessInfo: (info: Partial<BusinessInfo>) => void
  updateBranchInfo: (info: Partial<BranchInfo>) => void
  updateTaxCurrencyInfo: (info: Partial<TaxCurrencyInfo>) => void
  updateOperationsInfo: (info: Partial<OperationsInfo>) => void
  completeSetup: () => Promise<boolean>
  checkSetupStatus: () => Promise<void>
  generateBranchCode: (businessName: string) => Promise<string>
}

const defaultBusinessInfo: BusinessInfo = {
  businessName: '',
  businessRegistrationNo: '',
  businessType: 'Retail',
  businessAddress: '',
  businessCity: '',
  businessState: '',
  businessCountry: '',
  businessPostalCode: '',
  businessPhone: '',
  businessEmail: '',
  businessWebsite: '',
  businessLogo: '',
}

const defaultBranchInfo: BranchInfo = {
  name: '',
  code: '',
  address: '',
  phone: '',
  email: '',
  licenseNumber: '',
}

const defaultTaxCurrencyInfo: TaxCurrencyInfo = {
  currencyCode: 'PKR',
  currencySymbol: 'Rs.',
  currencyPosition: 'prefix',
  decimalPlaces: 2,
  taxName: 'GST',
  taxRate: 0,
  taxId: '',
}

const defaultOperationsInfo: OperationsInfo = {
  workingDaysStart: 'Monday',
  workingDaysEnd: 'Saturday',
  openingTime: '09:00',
  closingTime: '18:00',
  defaultPaymentMethod: 'Cash',
  allowedPaymentMethods: 'Cash,Card,Bank Transfer',
  lowStockThreshold: 10,
  stockValuationMethod: 'FIFO',
}

const SetupContext = createContext<SetupContextType | undefined>(undefined)

export function SetupProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSetup, setIsCheckingSetup] = useState(true)
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(defaultBusinessInfo)
  const [branchInfo, setBranchInfo] = useState<BranchInfo>(defaultBranchInfo)
  const [taxCurrencyInfo, setTaxCurrencyInfo] = useState<TaxCurrencyInfo>(defaultTaxCurrencyInfo)
  const [operationsInfo, setOperationsInfo] = useState<OperationsInfo>(defaultOperationsInfo)

  // DISABLED - render tracking was causing issues
  const businessInfoUpdateCount = useRef(0)

  const checkSetupStatus = useCallback(async () => {
    log('checkSetupStatus called')
    setIsCheckingSetup(true)
    try {
      log('Calling window.api.setup.checkFirstRun...')
      const result = await window.api.setup.checkFirstRun()
      log('checkFirstRun result:', result)
      if (result.success && result.data) {
        setNeedsSetup(result.data.needsSetup)
        log('needsSetup set to:', result.data.needsSetup)
      } else {
        // If check fails, assume setup is needed
        setNeedsSetup(true)
        log('checkFirstRun failed, setting needsSetup to true')
      }
    } catch (err) {
      console.error('Failed to check setup status:', err)
      log('checkSetupStatus error:', err)
      setNeedsSetup(true)
    } finally {
      setIsCheckingSetup(false)
      log('checkSetupStatus finished')
    }
  }, [])

  useEffect(() => {
    checkSetupStatus()
  }, [checkSetupStatus])

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 5))
  }, [])

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }, [])

  const updateBusinessInfo = useCallback((info: Partial<BusinessInfo>) => {
    setBusinessInfo((prev) => ({ ...prev, ...info }))
  }, [])

  const updateBranchInfo = useCallback((info: Partial<BranchInfo>) => {
    setBranchInfo((prev) => ({ ...prev, ...info }))
  }, [])

  const updateTaxCurrencyInfo = useCallback((info: Partial<TaxCurrencyInfo>) => {
    setTaxCurrencyInfo((prev) => ({ ...prev, ...info }))
  }, [])

  const updateOperationsInfo = useCallback((info: Partial<OperationsInfo>) => {
    setOperationsInfo((prev) => ({ ...prev, ...info }))
  }, [])

  const generateBranchCode = useCallback(async (businessName: string): Promise<string> => {
    try {
      const result = await window.api.setup.generateBranchCode(businessName)
      if (result.success && result.data) {
        return result.data
      }
      return ''
    } catch (err) {
      console.error('Failed to generate branch code:', err)
      return ''
    }
  }, [])

  const completeSetup = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const setupData = {
        business: businessInfo,
        branch: branchInfo,
        taxCurrency: taxCurrencyInfo,
        operations: operationsInfo,
      }

      const result = await window.api.setup.complete(setupData)

      if (result.success) {
        setNeedsSetup(false)
        return true
      } else {
        setError(result.message || 'Failed to complete setup')
        return false
      }
    } catch (err) {
      console.error('Setup complete error:', err)
      setError('An unexpected error occurred')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [businessInfo, branchInfo, taxCurrencyInfo, operationsInfo])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      currentStep,
      isLoading,
      isCheckingSetup,
      needsSetup,
      error,
      businessInfo,
      branchInfo,
      taxCurrencyInfo,
      operationsInfo,
      setCurrentStep,
      nextStep,
      prevStep,
      updateBusinessInfo,
      updateBranchInfo,
      updateTaxCurrencyInfo,
      updateOperationsInfo,
      completeSetup,
      checkSetupStatus,
      generateBranchCode,
    }),
    [
      currentStep,
      isLoading,
      isCheckingSetup,
      needsSetup,
      error,
      businessInfo,
      branchInfo,
      taxCurrencyInfo,
      operationsInfo,
      setCurrentStep,
      nextStep,
      prevStep,
      updateBusinessInfo,
      updateBranchInfo,
      updateTaxCurrencyInfo,
      updateOperationsInfo,
      completeSetup,
      checkSetupStatus,
      generateBranchCode,
    ]
  )

  return (
    <SetupContext.Provider value={contextValue}>
      {children}
    </SetupContext.Provider>
  )
}

export function useSetup() {
  const context = useContext(SetupContext)
  if (context === undefined) {
    throw new Error('useSetup must be used within a SetupProvider')
  }
  return context
}
