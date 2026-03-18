import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  Banknote,
  Receipt,
  X,
  AlertCircle,
  Package,
  Clock,
  Smartphone,
  Percent,
  Truck,
  MapPin,
  Phone,
  DollarSign,
  Building2,
  CheckCircle2,
  Wrench,
  Ticket,
  UserPlus,
  Printer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBranch } from '@/contexts/branch-context'
import { useCurrency } from '@/contexts/settings-context'
import { useCurrentBranchSettings } from '@/contexts/settings-context'
import { debounce } from '@/lib/utils'
import type { Product, Customer, Service } from '@shared/types'

interface CartItem {
  type: 'product' | 'service'
  product?: Product
  service?: Service
  quantity: number
  serialNumber?: string
  hours?: number // For hourly services
}

interface AvailableProduct {
  product: Product
  quantity: number
}

export function POSScreen() {
  const { currentBranch } = useBranch()
  const { formatCurrency } = useCurrency()
  const { settings } = useCurrentBranchSettings()
  const [activeTab, setActiveTab] = useState<'products' | 'services'>('products')
  const [searchQuery, setSearchQuery] = useState('')
  const [serviceSearchQuery, setServiceSearchQuery] = useState('')
  const [allProducts, setAllProducts] = useState<AvailableProduct[]>([])
  const [allServices, setAllServices] = useState<Service[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showHoursDialog, setShowHoursDialog] = useState(false)
  const [pendingHourlyService, setPendingHourlyService] = useState<Service | null>(null)
  const [serviceHours, setServiceHours] = useState('1')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [allCustomers, setAllCustomers] = useState<Customer[]>([])
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false)
  const [quickAddFirstName, setQuickAddFirstName] = useState('')
  const [quickAddLastName, setQuickAddLastName] = useState('')
  const [quickAddPhone, setQuickAddPhone] = useState('')
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showSerialDialog, setShowSerialDialog] = useState(false)
  const [pendingSerialProduct, setPendingSerialProduct] = useState<Product | null>(null)
  const [serialNumber, setSerialNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'cod' | 'mobile' | 'receivable'>('cash')
  const [amountPaid, setAmountPaid] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [addToReceivable, setAddToReceivable] = useState(false)

  // Success invoice dialog state
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [completedSale, setCompletedSale] = useState<{
    saleId: number
    invoiceNumber: string
    totalAmount: number
    amountPaid: number
    changeGiven: number
    paymentMethod: string
    paymentStatus: string
    customerName: string
    remainingAmount: number
    newCustomerCreated: boolean
    codName: string
    receiptPath?: string
  } | null>(null)

  // Tax settings state - loaded from businessSettings
  const [taxSettings, setTaxSettings] = useState<{
    taxRate: number
    taxName: string
    taxNumber: string
  }>({
    taxRate: 0,
    taxName: 'GST',
    taxNumber: '',
  })

  // Load tax settings from businessSettings or context
  useEffect(() => {
    const loadTaxSettings = async () => {
      try {
        // First try from context settings (useCurrentBranchSettings)
        if (settings && settings.taxRate !== undefined && settings.taxRate > 0) {
          setTaxSettings({
            taxRate: settings.taxRate,
            taxName: settings.taxName ?? 'GST',
            taxNumber: settings.taxNumber ?? '',
          })
          return
        }

        // Fallback: directly fetch from businessSettings API
        const businessSettings = await window.api.businessSettings.getGlobal()
        if (businessSettings && businessSettings.taxRate !== undefined) {
          setTaxSettings({
            taxRate: businessSettings.taxRate ?? 0,
            taxName: businessSettings.taxName ?? 'GST',
            taxNumber: businessSettings.taxNumber ?? '',
          })
        }
      } catch (error) {
        console.error('Failed to load tax settings:', error)
      }
    }
    loadTaxSettings()
  }, [settings])

  // COD fields
  const [codName, setCodName] = useState('')
  const [codPhone, setCodPhone] = useState('')
  const [codAddress, setCodAddress] = useState('')
  const [codCity, setCodCity] = useState('')
  const [codCharges, setCodCharges] = useState('')
  const [showCodDialog, setShowCodDialog] = useState(false)

  // Mobile Payment fields
  const [mobileProvider, setMobileProvider] = useState<'jazzcash' | 'easypaisa' | 'nayapay' | 'sadapay' | 'other'>('jazzcash')
  const [mobileReceiverPhone, setMobileReceiverPhone] = useState('')
  const [mobileSenderPhone, setMobileSenderPhone] = useState('')
  const [mobileTransactionId, setMobileTransactionId] = useState('')
  const [showMobileDialog, setShowMobileDialog] = useState(false)

  // Card Payment fields
  const [cardHolderName, setCardHolderName] = useState('')
  const [cardLastFourDigits, setCardLastFourDigits] = useState('')
  const [showCardDialog, setShowCardDialog] = useState(false)

  // Discount field
  const [discountAmount, setDiscountAmount] = useState('')

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<{
    id: number
    code: string
    discountAmount: number
  } | null>(null)
  const [voucherError, setVoucherError] = useState('')
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false)

  // COD form validation
  const isCodFormValid = useMemo(() => {
    return (
      codName.trim() !== '' &&
      codPhone.trim() !== '' &&
      codAddress.trim() !== '' &&
      codCity.trim() !== ''
    )
  }, [codName, codPhone, codAddress, codCity])

  // Mobile payment form validation
  const isMobileFormValid = useMemo(() => {
    return (
      mobileReceiverPhone.trim() !== '' &&
      mobileSenderPhone.trim() !== '' &&
      mobileTransactionId.trim() !== ''
    )
  }, [mobileReceiverPhone, mobileSenderPhone, mobileTransactionId])

  // Card payment form validation
  const isCardFormValid = useMemo(() => {
    return (
      cardHolderName.trim() !== '' &&
      cardLastFourDigits.trim().length === 4
    )
  }, [cardHolderName, cardLastFourDigits])

  // Mobile provider labels
  const mobileProviderLabels: Record<string, string> = {
    jazzcash: 'JazzCash',
    easypaisa: 'Easypaisa',
    nayapay: 'NayaPay',
    sadapay: 'SadaPay',
    other: 'Other',
  }

  // Handle COD dialog save
  const handleCodSave = () => {
    if (isCodFormValid) {
      setShowCodDialog(false)
    }
  }

  // Handle COD dialog cancel
  const handleCodCancel = () => {
    setShowCodDialog(false)
    // Reset COD fields if not valid
    if (!isCodFormValid) {
      setCodName('')
      setCodPhone('')
      setCodAddress('')
      setCodCity('')
      setCodCharges('')
    }
  }

  // Handle Mobile dialog save
  const handleMobileSave = () => {
    if (isMobileFormValid) {
      setShowMobileDialog(false)
    }
  }

  // Handle Mobile dialog cancel
  const handleMobileCancel = () => {
    setShowMobileDialog(false)
    // Reset mobile fields if not valid
    if (!isMobileFormValid) {
      setMobileProvider('jazzcash')
      setMobileReceiverPhone('')
      setMobileSenderPhone('')
      setMobileTransactionId('')
    }
  }

  // Handle Card dialog save
  const handleCardSave = () => {
    if (isCardFormValid) {
      setShowCardDialog(false)
    }
  }

  // Handle Card dialog cancel
  const handleCardCancel = () => {
    setShowCardDialog(false)
    // Reset card fields if not valid
    if (!isCardFormValid) {
      setCardHolderName('')
      setCardLastFourDigits('')
    }
  }

  // Get tax rate from taxSettings (loaded from businessSettings)
  const taxRate = taxSettings.taxRate

  // Calculate totals - handle both products and services
  const subtotal = cart.reduce((sum, item) => {
    if (item.type === 'product' && item.product) {
      return sum + item.product.sellingPrice * item.quantity
    } else if (item.type === 'service' && item.service) {
      if (item.service.pricingType === 'hourly' && item.hours) {
        return sum + item.service.price * item.hours
      }
      return sum + item.service.price * item.quantity
    }
    return sum
  }, 0)
  const discount = parseFloat(discountAmount) || 0
  const codChargesNum = parseFloat(codCharges) || 0
  const taxableAmount = subtotal - discount
  const taxAmount = taxableAmount > 0 ? taxableAmount * (taxRate / 100) : 0
  // Add COD charges only for COD payment method
  const total = taxableAmount + taxAmount + (paymentMethod === 'cod' ? codChargesNum : 0)

  // Load all available products on mount and when branch changes
  const loadAvailableProducts = useCallback(async () => {
    if (!currentBranch) return

    setIsLoadingProducts(true)
    try {
      const result = await window.api.products.getAvailable({
        branchId: currentBranch.id,
        limit: 500,
      })
      if (result.success && result.data) {
        setAllProducts(result.data)
      }
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setIsLoadingProducts(false)
    }
  }, [currentBranch])

  // Load all active services
  const loadServices = useCallback(async () => {
    setIsLoadingServices(true)
    try {
      const result = await window.api.services.getActive()
      if (result.success && result.data) {
        setAllServices(result.data)
      }
    } catch (error) {
      console.error('Failed to load services:', error)
    } finally {
      setIsLoadingServices(false)
    }
  }, [])

  useEffect(() => {
    loadAvailableProducts()
    loadServices()
  }, [loadAvailableProducts, loadServices])

  // Filter products based on search query
  const filteredProducts = searchQuery.trim()
    ? allProducts.filter(
        (item) =>
          item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.product.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.product.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allProducts

  // Filter services based on search query
  const filteredServices = serviceSearchQuery.trim()
    ? allServices.filter(
        (service) =>
          service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
          service.code?.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
          service.description?.toLowerCase().includes(serviceSearchQuery.toLowerCase())
      )
    : allServices

  // Load all customers when dialog opens
  const loadAllCustomers = useCallback(async () => {
    setIsLoadingCustomers(true)
    try {
      // Pass high limit to fetch all customers (default is 20)
      const result = await window.api.customers.getAll({ limit: 1000, isActive: true })
      if (result.success && result.data) {
        setAllCustomers(result.data)
        setCustomers(result.data)
      }
    } catch (error) {
      console.error('Failed to load customers:', error)
    } finally {
      setIsLoadingCustomers(false)
    }
  }, [])

  // Filter customers based on search
  useEffect(() => {
    if (!customerSearch.trim()) {
      setCustomers(allCustomers)
      return
    }

    const query = customerSearch.toLowerCase()
    const filtered = allCustomers.filter(
      (customer) =>
        customer.firstName?.toLowerCase().includes(query) ||
        customer.lastName?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.firearmLicenseNumber?.toLowerCase().includes(query)
    )
    setCustomers(filtered)
  }, [customerSearch, allCustomers])

  // Load customers when dialog opens
  useEffect(() => {
    if (showCustomerDialog && allCustomers.length === 0) {
      loadAllCustomers()
    }
  }, [showCustomerDialog, allCustomers.length, loadAllCustomers])

  // Add product to cart
  const addToCart = (product: Product, availableQty: number) => {
    if (product.isSerialTracked) {
      setPendingSerialProduct(product)
      setShowSerialDialog(true)
      return
    }

    // Check if we have enough stock
    const existingInCart = cart.find((item) => item.type === 'product' && item.product?.id === product.id)
    const currentCartQty = existingInCart?.quantity ?? 0

    if (currentCartQty >= availableQty) {
      setError(`Only ${availableQty} units available in stock`)
      return
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.type === 'product' && item.product?.id === product.id)
      if (existing) {
        return prevCart.map((item) =>
          item.type === 'product' && item.product?.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prevCart, { type: 'product', product, quantity: 1 }]
    })
    setError('')
  }

  // Add service to cart
  const addServiceToCart = (service: Service) => {
    // For hourly services, ask for hours
    if (service.pricingType === 'hourly') {
      setPendingHourlyService(service)
      setServiceHours('1')
      setShowHoursDialog(true)
      return
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.type === 'service' && item.service?.id === service.id)
      if (existing) {
        return prevCart.map((item) =>
          item.type === 'service' && item.service?.id === service.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prevCart, { type: 'service', service, quantity: 1 }]
    })
    setError('')
  }

  // Add hourly service with hours
  const addHourlyServiceToCart = () => {
    if (!pendingHourlyService) return
    const hours = parseFloat(serviceHours) || 1

    setCart((prevCart) => [
      ...prevCart,
      { type: 'service', service: pendingHourlyService, quantity: 1, hours }
    ])
    setShowHoursDialog(false)
    setPendingHourlyService(null)
    setServiceHours('1')
    setError('')
  }

  // Add serial tracked item
  const addSerialTrackedItem = () => {
    if (!pendingSerialProduct || !serialNumber.trim()) return

    setCart((prevCart) => [
      ...prevCart,
      { type: 'product', product: pendingSerialProduct, quantity: 1, serialNumber: serialNumber.trim() },
    ])
    setShowSerialDialog(false)
    setPendingSerialProduct(null)
    setSerialNumber('')
    setSearchQuery('')
  }

  // Update quantity with inventory cap (for products) or unlimited (for services)
  const updateQuantity = (itemType: 'product' | 'service', itemId: number, delta: number) => {
    if (itemType === 'product') {
      // Get available stock for this product
      const productStock = allProducts.find((p) => p.product.id === itemId)
      const availableStock = productStock?.quantity ?? 0

      setCart((prevCart) =>
        prevCart
          .map((item) => {
            if (item.type === 'product' && item.product?.id === itemId) {
              const newQty = item.quantity + delta
              // Cap at 0 minimum, and at available stock maximum
              const clampedQty = Math.min(Math.max(0, newQty), availableStock)
              if (delta > 0 && clampedQty === item.quantity) {
                // Tried to increment but hit stock limit
                setError(`Only ${availableStock} units available in stock`)
              }
              return { ...item, quantity: clampedQty }
            }
            return item
          })
          .filter((item) => item.quantity > 0)
      )
    } else {
      // Services don't have stock limits
      setCart((prevCart) =>
        prevCart
          .map((item) => {
            if (item.type === 'service' && item.service?.id === itemId) {
              const newQty = Math.max(0, item.quantity + delta)
              return { ...item, quantity: newQty }
            }
            return item
          })
          .filter((item) => item.quantity > 0)
      )
    }
  }

  // Remove from cart
  const removeFromCart = (itemType: 'product' | 'service', itemId: number, serialNumber?: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => {
        if (itemType === 'product') {
          return !(item.type === 'product' && item.product?.id === itemId && item.serialNumber === serialNumber)
        } else {
          return !(item.type === 'service' && item.service?.id === itemId)
        }
      })
    )
  }

  // Validate and apply voucher
  const validateVoucher = async () => {
    if (!voucherCode.trim()) return
    setIsValidatingVoucher(true)
    setVoucherError('')
    try {
      const result = await window.api.vouchers.validate(voucherCode.trim())
      if (result.success && result.data) {
        setAppliedVoucher({
          id: result.data.id,
          code: result.data.code,
          discountAmount: result.data.discountAmount,
        })
        setDiscountAmount(String(result.data.discountAmount))
        setVoucherCode('')
      } else {
        setVoucherError(result.message || 'Invalid voucher code')
      }
    } catch (error) {
      console.error('Voucher validation error:', error)
      setVoucherError('Failed to validate voucher')
    } finally {
      setIsValidatingVoucher(false)
    }
  }

  // Remove applied voucher
  const removeVoucher = () => {
    setAppliedVoucher(null)
    setDiscountAmount('')
    setVoucherError('')
  }

  // Clear cart
  const clearCart = () => {
    setCart([])
    setSelectedCustomer(null)
    setError('')
    setAppliedVoucher(null)
    setVoucherCode('')
    setVoucherError('')
  }

  // Process payment
  const processPayment = async () => {
    if (!currentBranch) return
    if (cart.length === 0) return

    // Check for firearms without customer
    const hasFirearms = cart.some((item) => item.type === 'product' && item.product?.isSerialTracked)
    if (hasFirearms && !selectedCustomer) {
      setError('Customer selection is required for firearm purchases')
      return
    }

    // Receivable requires customer (but COD can auto-create from details)
    if (paymentMethod === 'receivable' && !selectedCustomer) {
      setError('Customer selection is required for Pay Later / Receivable')
      return
    }

    // Add to receivable requires customer - but for COD we can auto-create from details
    if (addToReceivable && !selectedCustomer && paymentMethod !== 'cod') {
      setError('Customer selection is required when adding to Account Receivables')
      return
    }

    // Partial payment requires customer (for creating receivable)
    const paidAmount = paymentMethod === 'cash' ? parseFloat(amountPaid) || 0 : total
    const isPartialPayment = paymentMethod === 'cash' && paidAmount > 0 && paidAmount < total
    if (isPartialPayment && !selectedCustomer) {
      setError('Customer selection is required for partial payments. The remaining amount will be added to Account Receivables.')
      return
    }

    // COD validation
    if (paymentMethod === 'cod') {
      if (!codName.trim() || !codPhone.trim() || !codAddress.trim() || !codCity.trim()) {
        setError('All COD fields are required')
        return
      }
    }

    setIsProcessing(true)
    setError('')

    try {
      // Auto-create customer from COD details if needed for receivable
      let customerIdToUse = selectedCustomer?.id
      let newCustomerCreated = false
      if (paymentMethod === 'cod' && addToReceivable && !selectedCustomer) {
        // Create a new customer from COD details
        const nameParts = codName.trim().split(' ')
        const firstName = nameParts[0] || codName.trim()
        const lastName = nameParts.slice(1).join(' ') || ''

        const customerResult = await window.api.customers.create({
          firstName,
          lastName,
          phone: codPhone.trim(),
          address: `${codAddress.trim()}, ${codCity.trim()}`,
          isActive: true,
        })

        if (customerResult.success && customerResult.data) {
          customerIdToUse = customerResult.data.id
          newCustomerCreated = true
          // Refresh customers list
          loadAllCustomers()
        } else {
          setError(customerResult.message || 'Failed to create customer from COD details')
          setIsProcessing(false)
          return
        }
      }

      // Build notes for COD, Mobile, or Card payment
      let notes = ''
      if (paymentMethod === 'cod') {
        notes = `COD Details:\nName: ${codName}\nPhone: ${codPhone}\nAddress: ${codAddress}, ${codCity}`
        if (codChargesNum > 0) {
          notes += `\nCOD Charges: ${codChargesNum}`
        }
      } else if (paymentMethod === 'mobile') {
        notes = `Mobile Payment Details:\nProvider: ${mobileProviderLabels[mobileProvider]}\nReceiver: ${mobileReceiverPhone}\nSender: ${mobileSenderPhone}\nTransaction ID: ${mobileTransactionId}`
      } else if (paymentMethod === 'card') {
        notes = `Card Payment Details:\nCard Holder: ${cardHolderName}\nCard: **** **** **** ${cardLastFourDigits}`
      }

      // Calculate payment status based on amount paid and receivable option
      let actualAmountPaid: number
      let paymentStatus: 'paid' | 'partial' | 'pending' = 'paid'

      if (paymentMethod === 'receivable' || addToReceivable) {
        // Full amount goes to receivable
        actualAmountPaid = 0
        paymentStatus = 'pending'
      } else if (paymentMethod === 'cash') {
        actualAmountPaid = parseFloat(amountPaid) || 0
        if (actualAmountPaid < total) {
          paymentStatus = actualAmountPaid > 0 ? 'partial' : 'pending'
        }
      } else {
        // Card, COD, Mobile - full payment
        actualAmountPaid = total
      }

      const remainingAmount = Math.max(0, total - actualAmountPaid)
      const changeGiven = actualAmountPaid > total ? actualAmountPaid - total : 0

      // Separate products and services from cart
      const productItems = cart.filter((item) => item.type === 'product' && item.product)
      const serviceItems = cart.filter((item) => item.type === 'service' && item.service)

      const saleData = {
        customerId: customerIdToUse,
        branchId: currentBranch.id,
        items: productItems.map((item) => ({
          productId: item.product!.id,
          quantity: item.quantity,
          unitPrice: item.product!.sellingPrice,
          costPrice: item.product!.costPrice,
          serialNumber: item.serialNumber,
          taxRate: item.product!.isTaxable ? taxRate : 0,
        })),
        services: serviceItems.map((item) => ({
          serviceId: item.service!.id,
          serviceName: item.service!.name,
          quantity: item.quantity,
          unitPrice: item.service!.price,
          hours: item.hours,
          taxRate: item.service!.isTaxable ? taxRate : 0,
        })),
        paymentMethod: addToReceivable ? 'receivable' : paymentMethod,
        paymentStatus,
        amountPaid: actualAmountPaid,
        discountAmount: discount,
        codCharges: paymentMethod === 'cod' ? codChargesNum : 0,
        codName: paymentMethod === 'cod' ? codName : undefined,
        codPhone: paymentMethod === 'cod' ? codPhone : undefined,
        codAddress: paymentMethod === 'cod' ? codAddress : undefined,
        codCity: paymentMethod === 'cod' ? codCity : undefined,
        // Mobile payment fields
        mobileProvider: paymentMethod === 'mobile' ? mobileProvider : undefined,
        mobileReceiverPhone: paymentMethod === 'mobile' ? mobileReceiverPhone : undefined,
        mobileSenderPhone: paymentMethod === 'mobile' ? mobileSenderPhone : undefined,
        mobileTransactionId: paymentMethod === 'mobile' ? mobileTransactionId : undefined,
        // Card payment fields
        cardHolderName: paymentMethod === 'card' ? cardHolderName : undefined,
        cardLastFourDigits: paymentMethod === 'card' ? cardLastFourDigits : undefined,
        notes: notes || undefined,
        // Voucher
        voucherId: appliedVoucher?.id,
      }

      const result = await window.api.sales.create(saleData)

      if (result.success) {
        // NOTE: Receivable is automatically created by the backend (sales-ipc.ts)
        // when there's an outstanding balance and customer exists.
        // Do NOT create receivable here to avoid duplicates.

        // Generate receipt automatically
        let receiptPath: string | undefined
        try {
          const receiptResult = await window.api.receipt.generate(result.data.id)
          if (receiptResult.success) {
            receiptPath = receiptResult.data.filePath
            console.log('Receipt generated:', receiptPath)
          } else {
            console.error('Receipt generation failed:', receiptResult.message)
          }
        } catch (receiptError) {
          console.error('Receipt generation error:', receiptError)
          // Don't block the sale completion on receipt error
        }

        // Clear cart and show success
        clearCart()
        setShowPaymentDialog(false)
        setAmountPaid('')
        setDiscountAmount('')
        setCodName('')
        setCodPhone('')
        setCodAddress('')
        setCodCity('')
        setCodCharges('')
        // Clear mobile payment fields
        setMobileProvider('jazzcash')
        setMobileReceiverPhone('')
        setMobileSenderPhone('')
        setMobileTransactionId('')
        // Clear card payment fields
        setCardHolderName('')
        setCardLastFourDigits('')
        setAddToReceivable(false)
        // Clear voucher fields
        setAppliedVoucher(null)
        setVoucherCode('')
        setVoucherError('')

        // Reload products to update stock quantities
        loadAvailableProducts()

        // Show success invoice dialog instead of plain alert
        setCompletedSale({
          saleId: result.data.id,
          invoiceNumber: result.data.invoiceNumber,
          totalAmount: total,
          amountPaid: actualAmountPaid,
          changeGiven,
          paymentMethod: addToReceivable ? 'receivable' : paymentMethod,
          paymentStatus,
          customerName: selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`.trim() : (newCustomerCreated ? codName : 'Walk-in Customer'),
          remainingAmount,
          newCustomerCreated,
          codName,
          receiptPath,
        })
        setShowSuccessDialog(true)
      } else {
        setError(result.message || 'Failed to process sale')
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Products and Services Tabs */}
      <div className="flex flex-1 flex-col">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'products' | 'services')} className="flex flex-col h-full">
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Services
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="flex-1 flex flex-col mt-0">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name, code, or barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-lg"
                />
              </div>
            </div>

            <Card className="flex-1 overflow-hidden">
              <CardContent className="p-4 h-full">
                {isLoadingProducts ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <ScrollArea className="h-[calc(100vh-24rem)]">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {filteredProducts.map((item) => {
                        const cartItem = cart.find((c) => c.type === 'product' && c.product?.id === item.product.id)
                        const inCartQty = cartItem?.quantity ?? 0
                        const remainingStock = item.quantity - inCartQty

                        return (
                          <button
                            key={item.product.id}
                            onClick={() => addToCart(item.product, item.quantity)}
                            disabled={remainingStock <= 0 && !item.product.isSerialTracked}
                            className="relative flex flex-col rounded-lg border p-3 text-left transition-all hover:bg-accent hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed h-full group"
                          >
                            {/* Plus Icon - appears on hover */}
                            <div className="absolute inset-0 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <Plus className="h-12 w-12 text-green-600" strokeWidth={3} />
                            </div>

                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium break-words whitespace-normal leading-tight text-sm">
                                  {item.product.name}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">{item.product.code}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                {item.product.isSerialTracked && (
                                  <Badge variant="outline" className="text-xs">
                                    Serial
                                  </Badge>
                                )}
                                <Badge
                                  variant={remainingStock <= 5 ? "destructive" : "secondary"}
                                  className="text-xs whitespace-nowrap"
                                >
                                  {remainingStock} left
                                </Badge>
                              </div>
                            </div>
                            <div className="mt-auto flex items-center justify-between pt-2 border-t">
                              <p className="text-lg font-bold">{formatCurrency(item.product.sellingPrice)}</p>
                              {inCartQty > 0 && (
                                <Badge variant="default" className="text-xs">
                                  {inCartQty} in cart
                                </Badge>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </ScrollArea>
                ) : searchQuery ? (
                  <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                    <Package className="h-12 w-12 mb-4" />
                    <p>No products found for "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                    <Package className="h-12 w-12 mb-4" />
                    <p>No products available in inventory</p>
                    <p className="text-sm">Add products to inventory first</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="flex-1 flex flex-col mt-0">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services by name, code, or description..."
                  value={serviceSearchQuery}
                  onChange={(e) => setServiceSearchQuery(e.target.value)}
                  className="pl-9 text-lg"
                />
              </div>
            </div>

            <Card className="flex-1 overflow-hidden">
              <CardContent className="p-4 h-full">
                {isLoadingServices ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : filteredServices.length > 0 ? (
                  <ScrollArea className="h-[calc(100vh-24rem)]">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {filteredServices.map((service) => {
                        const cartItem = cart.find((c) => c.type === 'service' && c.service?.id === service.id)
                        const inCartQty = cartItem?.quantity ?? 0

                        return (
                          <button
                            key={service.id}
                            onClick={() => addServiceToCart(service)}
                            className="relative flex flex-col rounded-lg border p-3 text-left transition-all hover:bg-accent hover:shadow-md group border-blue-200 bg-blue-50/30"
                          >
                            {/* Plus Icon - appears on hover */}
                            <div className="absolute inset-0 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <Plus className="h-12 w-12 text-blue-600" strokeWidth={3} />
                            </div>

                            <div className="flex items-center gap-1 mb-1 flex-wrap">
                              <Badge variant="outline" className="text-[10px] bg-blue-100 text-blue-700 border-blue-300 px-1.5 py-0">
                                <Wrench className="h-2.5 w-2.5 mr-0.5" />
                                Service
                              </Badge>
                              {service.pricingType === 'hourly' && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  <Clock className="h-2.5 w-2.5 mr-0.5" />
                                  Hourly
                                </Badge>
                              )}
                            </div>
                            <div className="mb-1">
                              <p className="font-medium break-words whitespace-normal leading-tight text-sm">
                                {service.name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">{service.code}</p>
                            </div>
                            {service.description && (
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                {service.description}
                              </p>
                            )}
                            <div className="mt-auto flex items-center justify-between pt-2 border-t">
                              <p className="text-lg font-bold text-blue-700">
                                {formatCurrency(service.price)}
                                {service.pricingType === 'hourly' && <span className="text-xs font-normal">/hr</span>}
                              </p>
                              {inCartQty > 0 && (
                                <Badge variant="default" className="text-xs bg-blue-600">
                                  {inCartQty} in cart
                                </Badge>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </ScrollArea>
                ) : serviceSearchQuery ? (
                  <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                    <Wrench className="h-12 w-12 mb-4" />
                    <p>No services found for "{serviceSearchQuery}"</p>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                    <Wrench className="h-12 w-12 mb-4" />
                    <p>No services available</p>
                    <p className="text-sm">Add services in the Services section first</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Cart */}
      <Card className="w-96 flex flex-col overflow-hidden">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>Cart ({cart.length})</CardTitle>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart}>
                Clear
              </Button>
            )}
          </div>
          {/* Customer Selection */}
          <div className="mt-2">
            {selectedCustomer ? (
              <div className="flex items-center justify-between rounded-lg bg-muted p-2">
                <div className="flex items-center gap-2 min-w-0">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm truncate">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => setSelectedCustomer(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowCustomerDialog(true)}
              >
                <User className="mr-2 h-4 w-4" />
                Select Customer
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col p-4 pt-0 min-h-0">
          {error && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-destructive/10 p-2 text-sm text-destructive flex-shrink-0">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="break-words">{error}</span>
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              {cart.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  Cart is empty
                </div>
              ) : (
                <div className="space-y-2 pr-2">
                  {cart.map((item, index) => (
                    <div
                      key={`${item.type}-${item.type === 'product' ? item.product?.id : item.service?.id}-${item.serialNumber || index}`}
                      className={`flex items-center gap-2 rounded-lg border p-2 ${item.type === 'service' ? 'border-blue-200 bg-blue-50/30' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {item.type === 'service' && (
                            <Wrench className="h-3 w-3 text-blue-600 flex-shrink-0" />
                          )}
                          <p className="font-medium text-sm leading-tight break-words">
                            {item.type === 'product' ? item.product?.name : item.service?.name}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.type === 'product' ? (
                            <>
                              {formatCurrency(item.product?.sellingPrice ?? 0)}
                              {item.serialNumber && (
                                <span className="ml-2">SN: {item.serialNumber}</span>
                              )}
                            </>
                          ) : (
                            <>
                              {formatCurrency(item.service?.price ?? 0)}
                              {item.service?.pricingType === 'hourly' && item.hours && (
                                <span className="ml-2">× {item.hours} hr{item.hours > 1 ? 's' : ''}</span>
                              )}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {item.type === 'product' && !item.serialNumber && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity('product', item.product!.id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity('product', item.product!.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        {item.type === 'service' && item.service?.pricingType !== 'hourly' && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity('service', item.service!.id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity('service', item.service!.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => removeFromCart(
                            item.type,
                            item.type === 'product' ? item.product!.id : item.service!.id,
                            item.serialNumber
                          )}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="mt-4 space-y-2 border-t pt-4 flex-shrink-0">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-between text-sm cursor-help group">
                    <span className="flex items-center gap-1.5">
                      <Percent className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{taxSettings.taxName || 'GST'}</span>
                      {taxRate > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({taxRate}%)
                        </span>
                      )}
                    </span>
                    <span className="font-medium text-emerald-600 group-hover:text-emerald-700">
                      {formatCurrency(taxAmount)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <div className="space-y-1.5 text-xs">
                    <p className="font-semibold">{taxSettings.taxName || 'GST'} Details</p>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Rate:</span>
                      <span>{taxRate}%</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Taxable Amount:</span>
                      <span>{formatCurrency(taxableAmount)}</span>
                    </div>
                    {taxSettings.taxNumber && (
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Tax ID:</span>
                        <span className="font-mono">{taxSettings.taxNumber}</span>
                      </div>
                    )}
                    <Separator className="my-1" />
                    <div className="flex justify-between gap-4 font-medium">
                      <span>Tax Amount:</span>
                      <span>{formatCurrency(taxAmount)}</span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <Button
                size="lg"
                variant="outline"
                disabled={cart.length === 0}
                onClick={() => {
                  setPaymentMethod('cash')
                  setAddToReceivable(false)
                  setShowPaymentDialog(true)
                }}
              >
                <Banknote className="mr-2 h-4 w-4" />
                Cash
              </Button>
              <Button
                size="lg"
                variant="outline"
                disabled={cart.length === 0}
                onClick={() => {
                  setPaymentMethod('card')
                  setAmountPaid(total.toString())
                  setAddToReceivable(false)
                  setShowPaymentDialog(true)
                }}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Card
              </Button>
              <Button
                size="lg"
                variant="outline"
                disabled={cart.length === 0}
                onClick={() => {
                  setPaymentMethod('mobile')
                  setAmountPaid(total.toString())
                  setAddToReceivable(false)
                  setShowPaymentDialog(true)
                }}
              >
                <Smartphone className="mr-2 h-4 w-4" />
                Mobile
              </Button>
              <Button
                size="lg"
                variant="outline"
                disabled={cart.length === 0}
                onClick={() => {
                  setPaymentMethod('cod')
                  setAmountPaid(total.toString())
                  setAddToReceivable(false)
                  setShowPaymentDialog(true)
                }}
              >
                <Package className="mr-2 h-4 w-4" />
                COD
              </Button>
              <Button
                size="lg"
                variant="outline"
                disabled={cart.length === 0}
                onClick={() => {
                  setPaymentMethod('receivable')
                  setAmountPaid('0')
                  setAddToReceivable(false)
                  setShowPaymentDialog(true)
                }}
                className="col-span-2"
              >
                <Clock className="mr-2 h-4 w-4" />
                Pay Later (Full Receivable)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Selection Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={(open) => {
        setShowCustomerDialog(open)
        if (!open) {
          setShowQuickAddCustomer(false)
          setQuickAddFirstName('')
          setQuickAddLastName('')
          setQuickAddPhone('')
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
            <DialogDescription>
              Search from {allCustomers.length} customers or continue without one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, email, or license..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant={showQuickAddCustomer ? 'default' : 'outline'}
                size="icon"
                onClick={() => setShowQuickAddCustomer(!showQuickAddCustomer)}
                title="Quick add new customer"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Add Customer Form */}
            {showQuickAddCustomer && (
              <div className="rounded-lg border border-dashed border-primary/50 bg-primary/5 p-3 space-y-3">
                <p className="text-sm font-medium flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Quick Add Customer
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="quick-first-name" className="text-xs">First Name *</Label>
                    <Input
                      id="quick-first-name"
                      value={quickAddFirstName}
                      onChange={(e) => setQuickAddFirstName(e.target.value)}
                      placeholder="First name"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quick-last-name" className="text-xs">Last Name *</Label>
                    <Input
                      id="quick-last-name"
                      value={quickAddLastName}
                      onChange={(e) => setQuickAddLastName(e.target.value)}
                      placeholder="Last name"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="quick-phone" className="text-xs">Phone (optional)</Label>
                  <Input
                    id="quick-phone"
                    value={quickAddPhone}
                    onChange={(e) => setQuickAddPhone(e.target.value)}
                    placeholder="Phone number"
                    className="h-8 text-sm"
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  disabled={!quickAddFirstName.trim() || !quickAddLastName.trim() || isCreatingCustomer}
                  onClick={async () => {
                    try {
                      setIsCreatingCustomer(true)
                      const result = await window.api.customers.create({
                        firstName: quickAddFirstName.trim(),
                        lastName: quickAddLastName.trim(),
                        phone: quickAddPhone.trim() || null,
                      })
                      if (result?.success && result.data) {
                        setSelectedCustomer(result.data)
                        setShowCustomerDialog(false)
                        setShowQuickAddCustomer(false)
                        setQuickAddFirstName('')
                        setQuickAddLastName('')
                        setQuickAddPhone('')
                        setCustomerSearch('')
                        // Refresh customer list in background
                        loadAllCustomers()
                      } else {
                        alert(result?.message || 'Failed to create customer.')
                      }
                    } catch (error) {
                      console.error('Quick add customer failed:', error)
                      alert('Failed to create customer. Please try again.')
                    } finally {
                      setIsCreatingCustomer(false)
                    }
                  }}
                >
                  {isCreatingCustomer ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  Add & Select Customer
                </Button>
                <p className="text-xs text-muted-foreground">
                  More details can be added later from the Customers tab.
                </p>
              </div>
            )}

            <ScrollArea className="h-72 border rounded-lg">
              {isLoadingCustomers ? (
                <div className="flex h-full items-center justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : customers.length > 0 ? (
                <div className="p-2 space-y-1">
                  {customers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer(customer)
                        setShowCustomerDialog(false)
                        setCustomerSearch('')
                      }}
                      className="w-full rounded-lg border p-3 text-left hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {customer.phone} {customer.email && `| ${customer.email}`}
                          </p>
                        </div>
                        {customer.firearmLicenseNumber && (
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            License: {customer.firearmLicenseNumber}
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : customerSearch ? (
                <div className="flex flex-col h-full items-center justify-center p-8 gap-3">
                  <p className="text-center text-muted-foreground">No customers found for &quot;{customerSearch}&quot;</p>
                  {!showQuickAddCustomer && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowQuickAddCustomer(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add New Customer
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center p-8">
                  <p className="text-center text-muted-foreground">No customers available</p>
                </div>
              )}
            </ScrollArea>
            <p className="text-xs text-muted-foreground text-center">
              Showing {customers.length} of {allCustomers.length} customers
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Serial Number Dialog */}
      <Dialog open={showSerialDialog} onOpenChange={setShowSerialDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Serial Number</DialogTitle>
            <DialogDescription>
              This product requires a serial number: {pendingSerialProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="serial">Serial Number</Label>
              <Input
                id="serial"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="Enter serial number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSerialDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addSerialTrackedItem} disabled={!serialNumber.trim()}>
              Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Hours Dialog */}
      <Dialog open={showHoursDialog} onOpenChange={setShowHoursDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Service Hours</DialogTitle>
            <DialogDescription>
              {pendingHourlyService?.name} is charged at {formatCurrency(pendingHourlyService?.price ?? 0)}/hour
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="hours">Number of Hours</Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                min="0.5"
                value={serviceHours}
                onChange={(e) => setServiceHours(e.target.value)}
                placeholder="Enter hours"
              />
            </div>
            {parseFloat(serviceHours) > 0 && (
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-sm text-blue-700">
                  Total: {formatCurrency((pendingHourlyService?.price ?? 0) * parseFloat(serviceHours))}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowHoursDialog(false)
              setPendingHourlyService(null)
            }}>
              Cancel
            </Button>
            <Button onClick={addHourlyServiceToCart} disabled={!serviceHours || parseFloat(serviceHours) <= 0}>
              Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md p-0 gap-0 border-border/50 overflow-hidden">
          {/* Payment Header */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-5 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold tracking-wider uppercase">Complete Payment</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 capitalize">
                  {paymentMethod === 'receivable' ? 'Pay Later' : paymentMethod} Payment
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-500 uppercase tracking-wider">Total</p>
                <p className="text-xl font-bold font-mono tabular-nums">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>

          <DialogHeader className="sr-only">
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>Payment details</DialogDescription>
          </DialogHeader>

          <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Voucher Code Input */}
            <div className="rounded-lg border p-3 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="h-4 w-4 text-amber-600" />
                <Label htmlFor="voucher-code" className="font-medium text-amber-800 dark:text-amber-300">Voucher Code</Label>
              </div>
              {appliedVoucher ? (
                <div className="flex items-center justify-between rounded-md bg-amber-100 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">
                      Voucher Applied: <code className="font-mono">{appliedVoucher.code}</code>
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {formatCurrency(appliedVoucher.discountAmount)} off
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={removeVoucher}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="voucher-code"
                    value={voucherCode}
                    onChange={(e) => {
                      setVoucherCode(e.target.value.toUpperCase())
                      setVoucherError('')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        validateVoucher()
                      }
                    }}
                    placeholder="Enter voucher code"
                    className="bg-white font-mono"
                    maxLength={10}
                  />
                  <Button
                    variant="outline"
                    onClick={validateVoucher}
                    disabled={isValidatingVoucher || !voucherCode.trim()}
                  >
                    {isValidatingVoucher ? 'Checking...' : 'Apply'}
                  </Button>
                </div>
              )}
              {voucherError && (
                <p className="text-sm text-red-600 mt-2">{voucherError}</p>
              )}
            </div>

            {/* Discount Input - shown for all payment methods */}
            <div className="rounded-lg border p-3 bg-green-50 dark:bg-green-950/20 dark:border-green-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="h-4 w-4 text-green-600" />
                <Label htmlFor="discount" className="font-medium text-green-800 dark:text-green-300">Apply Discount</Label>
              </div>
              <Input
                id="discount"
                type="number"
                step="0.01"
                min="0"
                max={subtotal}
                value={discountAmount}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0
                  if (value <= subtotal) {
                    setDiscountAmount(e.target.value)
                  }
                }}
                placeholder="Enter discount amount"
                className="bg-white"
                disabled={!!appliedVoucher}
              />
              {discount > 0 && (
                <p className="text-sm text-green-700 mt-2">
                  Discount: {formatCurrency(discount)} | New Total: {formatCurrency(total)}
                </p>
              )}
            </div>

            {paymentMethod === 'cash' && !addToReceivable && (
              <div>
                <Label htmlFor="amount">Amount Received</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="Enter amount"
                />
                {parseFloat(amountPaid) > 0 && parseFloat(amountPaid) >= total && (
                  <p className="mt-2 text-sm text-green-600">
                    Change: {formatCurrency(parseFloat(amountPaid) - total)}
                  </p>
                )}
                {parseFloat(amountPaid) > 0 && parseFloat(amountPaid) < total && (
                  <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <div className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 mt-0.5 text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-amber-800">Partial Payment</p>
                        <p className="text-amber-700">
                          Remaining: <strong>{formatCurrency(total - parseFloat(amountPaid))}</strong> will be added to Account Receivables.
                        </p>
                        {!selectedCustomer && (
                          <p className="mt-2 text-red-600 font-medium">
                            Please select a customer for partial payment!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {paymentMethod === 'card' && !addToReceivable && (
              <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 dark:border-blue-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                      Card Payment
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCardDialog(true)}
                    className="border-blue-300 hover:bg-blue-100 dark:border-blue-700 dark:hover:bg-blue-900/50"
                  >
                    {isCardFormValid ? 'Edit Details' : 'Add Details'}
                  </Button>
                </div>

                {isCardFormValid ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span className="text-blue-900 dark:text-blue-100">{cardHolderName}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CreditCard className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span className="text-blue-900 dark:text-blue-100 font-mono">
                        **** **** **** {cardLastFourDigits}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <AlertCircle className="h-4 w-4" />
                    <span>Please add card details to continue</span>
                  </div>
                )}
              </div>
            )}
            {paymentMethod === 'mobile' && !addToReceivable && (
              <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 dark:border-purple-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white">
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-purple-900 dark:text-purple-100">
                      Mobile Payment
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMobileDialog(true)}
                    className="border-purple-300 hover:bg-purple-100 dark:border-purple-700 dark:hover:bg-purple-900/50"
                  >
                    {isMobileFormValid ? 'Edit Details' : 'Add Details'}
                  </Button>
                </div>

                {isMobileFormValid ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {mobileProviderLabels[mobileProvider]}
                      </Badge>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-purple-600 mt-0.5" />
                      <div className="text-purple-900 dark:text-purple-100">
                        <span className="text-xs text-muted-foreground">To:</span> {mobileReceiverPhone}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-purple-600 mt-0.5" />
                      <div className="text-purple-900 dark:text-purple-100">
                        <span className="text-xs text-muted-foreground">From:</span> {mobileSenderPhone}
                      </div>
                    </div>
                    <div className="flex items-start gap-2 pt-1 border-t border-purple-200 dark:border-purple-800">
                      <Receipt className="h-4 w-4 text-purple-600 mt-0.5" />
                      <div className="text-purple-900 dark:text-purple-100 font-mono">
                        <span className="text-xs text-muted-foreground">TxID:</span> {mobileTransactionId}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                    <AlertCircle className="h-4 w-4" />
                    <span>Please add payment details to continue</span>
                  </div>
                )}
              </div>
            )}
            {paymentMethod === 'cod' && !addToReceivable && (
              <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white">
                      <Truck className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-amber-900 dark:text-amber-100">
                      Cash on Delivery
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCodDialog(true)}
                    className="border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/50"
                  >
                    {isCodFormValid ? 'Edit Details' : 'Add Details'}
                  </Button>
                </div>

                {isCodFormValid ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-amber-600 mt-0.5" />
                      <span className="text-amber-900 dark:text-amber-100">{codName}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-amber-600 mt-0.5" />
                      <span className="text-amber-900 dark:text-amber-100">{codPhone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-amber-600 mt-0.5" />
                      <span className="text-amber-900 dark:text-amber-100">
                        {codAddress}, {codCity}
                      </span>
                    </div>
                    {codChargesNum > 0 && (
                      <div className="flex items-start gap-2 pt-1 border-t border-amber-200 dark:border-amber-800">
                        <DollarSign className="h-4 w-4 text-amber-600 mt-0.5" />
                        <span className="text-amber-900 dark:text-amber-100 font-medium">
                          Delivery: {formatCurrency(codChargesNum)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                    <AlertCircle className="h-4 w-4" />
                    <span>Please add delivery details to continue</span>
                  </div>
                )}
              </div>
            )}
            {(paymentMethod === 'receivable' || addToReceivable) && (
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Payment will be recorded as receivable</p>
                    <p className="text-muted-foreground">
                      The full amount ({formatCurrency(total)}) will be added to the customer's balance. Payment is expected later.
                    </p>
                    {!selectedCustomer && paymentMethod === 'cod' && codName.trim() && codPhone.trim() ? (
                      <p className="mt-2 text-blue-600 font-medium">
                        A new customer will be created from COD details.
                      </p>
                    ) : !selectedCustomer && (
                      <p className="mt-2 text-destructive font-medium">
                        Please select a customer first!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Add to Receivable Option - shown for all methods except 'receivable' */}
            {paymentMethod !== 'receivable' && (
              <div className="rounded-lg border p-4 mt-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="add-to-receivable"
                    checked={addToReceivable}
                    onCheckedChange={(checked) => setAddToReceivable(checked === true)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="add-to-receivable" className="font-medium cursor-pointer">
                      Add to Account Receivables
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Check this to record the full amount as a receivable instead of processing payment now.
                      Useful for credit sales or delayed payments.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/30">
            <Button variant="ghost" className="flex-1 h-10" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button
              className="flex-[2] h-10 font-semibold"
              onClick={processPayment}
              disabled={
                isProcessing ||
                (paymentMethod === 'cash' && !addToReceivable && (parseFloat(amountPaid) <= 0 || (parseFloat(amountPaid) < total && !selectedCustomer))) ||
                (paymentMethod === 'receivable' && !selectedCustomer) ||
                (addToReceivable && !selectedCustomer && paymentMethod !== 'cod') ||
                (addToReceivable && !selectedCustomer && paymentMethod === 'cod' && (!codName.trim() || !codPhone.trim() || !codAddress.trim() || !codCity.trim())) ||
                (paymentMethod === 'cod' && !addToReceivable && (!codName.trim() || !codPhone.trim() || !codAddress.trim() || !codCity.trim())) ||
                (paymentMethod === 'mobile' && !addToReceivable && !isMobileFormValid) ||
                (paymentMethod === 'card' && !addToReceivable && !isCardFormValid)
              }
            >
              {isProcessing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <Receipt className="mr-2 h-4 w-4" />
                  {addToReceivable ? 'Add to Receivables' : 'Complete Sale'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* COD Details Dialog */}
      <Dialog open={showCodDialog} onOpenChange={setShowCodDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl">Cash on Delivery</DialogTitle>
                <DialogDescription>
                  Enter delivery details for COD payment
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Delivery Charges Section */}
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 border border-blue-100 dark:border-blue-900">
              <Label htmlFor="cod-charges-dialog" className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium mb-2">
                <DollarSign className="h-4 w-4" />
                Delivery Charges (Optional)
              </Label>
              <Input
                id="cod-charges-dialog"
                type="number"
                step="0.01"
                min="0"
                value={codCharges}
                onChange={(e) => setCodCharges(e.target.value)}
                placeholder="0.00"
                className="text-lg font-semibold bg-white dark:bg-gray-950 border-blue-200 dark:border-blue-800 focus:ring-blue-500"
              />
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-start gap-1">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                This amount will be added to the total and recorded as delivery expense
              </p>
            </div>

            <Separator />

            {/* Customer Details Section */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Customer Information
              </h4>

              <div className="space-y-1">
                <Label htmlFor="cod-name-dialog" className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cod-name-dialog"
                  value={codName}
                  onChange={(e) => setCodName(e.target.value)}
                  placeholder="Enter customer's full name"
                  className={!codName.trim() ? 'border-red-200 focus:ring-red-500' : ''}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cod-phone-dialog" className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cod-phone-dialog"
                  value={codPhone}
                  onChange={(e) => setCodPhone(e.target.value)}
                  placeholder="Enter contact number"
                  className={!codPhone.trim() ? 'border-red-200 focus:ring-red-500' : ''}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cod-address-dialog" className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Delivery Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cod-address-dialog"
                  value={codAddress}
                  onChange={(e) => setCodAddress(e.target.value)}
                  placeholder="Enter complete delivery address"
                  className={!codAddress.trim() ? 'border-red-200 focus:ring-red-500' : ''}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cod-city-dialog" className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cod-city-dialog"
                  value={codCity}
                  onChange={(e) => setCodCity(e.target.value)}
                  placeholder="Enter city name"
                  className={!codCity.trim() ? 'border-red-200 focus:ring-red-500' : ''}
                />
              </div>
            </div>

            {/* Order Summary in Dialog */}
            {codChargesNum > 0 && (
              <>
                <Separator />
                <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order Amount</span>
                    <span>{formatCurrency(subtotal - discount + taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-amber-600 dark:text-amber-400">
                    <span>+ Delivery Charges</span>
                    <span>{formatCurrency(codChargesNum)}</span>
                  </div>
                  <Separator className="my-1" />
                  <div className="flex justify-between font-bold">
                    <span>Total to Collect</span>
                    <span className="text-lg">{formatCurrency(total)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCodCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleCodSave}
              disabled={!isCodFormValid}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirm Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Payment Details Dialog */}
      <Dialog open={showMobileDialog} onOpenChange={setShowMobileDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 text-white shadow-lg">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl">Mobile Payment</DialogTitle>
                <DialogDescription>
                  Enter mobile payment details
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Provider Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                Payment Provider <span className="text-red-500">*</span>
              </Label>
              <Select
                value={mobileProvider}
                onValueChange={(value: 'jazzcash' | 'easypaisa' | 'nayapay' | 'sadapay' | 'other') => setMobileProvider(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jazzcash">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      JazzCash
                    </span>
                  </SelectItem>
                  <SelectItem value="easypaisa">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Easypaisa
                    </span>
                  </SelectItem>
                  <SelectItem value="nayapay">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      NayaPay
                    </span>
                  </SelectItem>
                  <SelectItem value="sadapay">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-purple-500" />
                      SadaPay
                    </span>
                  </SelectItem>
                  <SelectItem value="other">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-gray-500" />
                      Other
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Phone Numbers Section */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Payment Details
              </h4>

              <div className="space-y-1">
                <Label htmlFor="mobile-receiver-phone" className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Receiver Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mobile-receiver-phone"
                  value={mobileReceiverPhone}
                  onChange={(e) => setMobileReceiverPhone(e.target.value)}
                  placeholder="Phone number where payment is sent"
                  className={!mobileReceiverPhone.trim() ? 'border-red-200 focus:ring-red-500' : ''}
                />
                <p className="text-xs text-muted-foreground">Your account number receiving the payment</p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="mobile-sender-phone" className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Sender Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mobile-sender-phone"
                  value={mobileSenderPhone}
                  onChange={(e) => setMobileSenderPhone(e.target.value)}
                  placeholder="Customer's phone number"
                  className={!mobileSenderPhone.trim() ? 'border-red-200 focus:ring-red-500' : ''}
                />
                <p className="text-xs text-muted-foreground">Customer's account number sending the payment</p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="mobile-transaction-id" className="flex items-center gap-2">
                  <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                  Transaction ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mobile-transaction-id"
                  value={mobileTransactionId}
                  onChange={(e) => setMobileTransactionId(e.target.value)}
                  placeholder="Enter transaction ID"
                  className={`font-mono ${!mobileTransactionId.trim() ? 'border-red-200 focus:ring-red-500' : ''}`}
                />
                <p className="text-xs text-muted-foreground">Transaction reference from payment confirmation</p>
              </div>
            </div>

            {/* Payment Summary */}
            <Separator />
            <div className="rounded-lg bg-purple-50 dark:bg-purple-950/30 p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Amount</span>
                <span className="font-bold text-lg">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleMobileCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleMobileSave}
              disabled={!isMobileFormValid}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Card Payment Details Dialog */}
      <Dialog open={showCardDialog} onOpenChange={setShowCardDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-lg">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl">Card Payment</DialogTitle>
                <DialogDescription>
                  Enter card payment details (non-sensitive info only)
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Card Details Section */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="card-holder-name" className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Card Holder Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="card-holder-name"
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                  placeholder="Enter name on card"
                  className={!cardHolderName.trim() ? 'border-red-200 focus:ring-red-500' : ''}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="card-last-four" className="flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                  Last 4 Digits of Card <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-mono">**** **** ****</span>
                  <Input
                    id="card-last-four"
                    value={cardLastFourDigits}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                      setCardLastFourDigits(value)
                    }}
                    placeholder="1234"
                    maxLength={4}
                    className={`w-20 font-mono text-center ${cardLastFourDigits.length !== 4 ? 'border-red-200 focus:ring-red-500' : ''}`}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Only last 4 digits for reference - no sensitive data stored</p>
              </div>
            </div>

            {/* Payment Summary */}
            <Separator />
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Amount</span>
                <span className="font-bold text-lg">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCardCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleCardSave}
              disabled={!isCardFormValid}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sale Success Invoice Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-[420px] p-0 gap-0 border-border/50 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Sale Complete</DialogTitle>
            <DialogDescription>Invoice details</DialogDescription>
          </DialogHeader>

          {completedSale && (
            <div>
              {/* Header */}
              <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 px-6 py-5 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',
                  backgroundSize: '30px 30px',
                }} />
                <div className="relative">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-lg font-bold tracking-wide">Sale Complete!</h2>
                  <p className="text-emerald-100 text-xs mt-1">Transaction processed successfully</p>
                </div>
              </div>

              {/* Invoice Number Band */}
              <div className="flex items-center justify-between px-6 py-3 bg-muted/30 border-b border-border/30">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60">Invoice</p>
                  <p className="font-mono text-sm font-bold tracking-wider">#{completedSale.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60">Customer</p>
                  <p className="text-sm font-medium truncate max-w-[180px]">{completedSale.customerName}</p>
                </div>
              </div>

              {/* Details */}
              <div className="px-6 py-4 space-y-3">
                {/* Grand Total */}
                <div className="flex items-center justify-between py-3 border-b-2 border-t-2 border-foreground/10">
                  <span className="text-sm font-bold uppercase tracking-wider">Total Amount</span>
                  <span className="text-2xl font-bold font-mono tabular-nums">
                    {formatCurrency(completedSale.totalAmount)}
                  </span>
                </div>

                {/* Payment Info */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium capitalize">
                      {completedSale.paymentMethod === 'receivable' ? 'Pay Later' : completedSale.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`font-semibold text-xs uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      completedSale.paymentStatus === 'paid'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : completedSale.paymentStatus === 'partial'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-slate-500/10 text-slate-400'
                    }`}>
                      {completedSale.paymentStatus}
                    </span>
                  </div>
                  {completedSale.amountPaid > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Amount Paid</span>
                      <span className="font-mono tabular-nums font-medium text-emerald-500">
                        {formatCurrency(completedSale.amountPaid)}
                      </span>
                    </div>
                  )}
                  {completedSale.changeGiven > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Change Returned</span>
                      <span className="font-mono tabular-nums font-medium">
                        {formatCurrency(completedSale.changeGiven)}
                      </span>
                    </div>
                  )}
                  {completedSale.remainingAmount > 0 && (
                    <div className="flex justify-between items-center text-sm rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 mt-1">
                      <span className="text-amber-500 font-medium">Added to Receivables</span>
                      <span className="font-mono tabular-nums font-bold text-amber-500">
                        {formatCurrency(completedSale.remainingAmount)}
                      </span>
                    </div>
                  )}
                </div>

                {completedSale.newCustomerCreated && (
                  <div className="flex items-center gap-2 text-xs bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                    <UserPlus className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-blue-500">New customer <strong>{completedSale.codName}</strong> created from COD details</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-5 pt-1 flex gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-11 gap-2"
                  onClick={async () => {
                    try {
                      let filePath = completedSale.receiptPath
                      if (!filePath) {
                        const receiptResult = await window.api.receipt.generate(completedSale.saleId)
                        if (receiptResult.success && receiptResult.data?.filePath) {
                          filePath = receiptResult.data.filePath
                        }
                      }
                      if (filePath) {
                        await window.api.shell.openPath(filePath)
                      }
                    } catch (err) {
                      console.error('Failed to print receipt:', err)
                    }
                  }}
                >
                  <Printer className="h-4 w-4" />
                  Print Invoice
                </Button>
                <Button
                  size="lg"
                  className="flex-1 h-11 font-semibold"
                  onClick={() => {
                    setShowSuccessDialog(false)
                    setCompletedSale(null)
                  }}
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
