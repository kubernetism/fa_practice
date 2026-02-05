import { create } from 'zustand'

export interface CartItem {
  productId: number
  name: string
  code: string
  quantity: number
  unitPrice: number
  costPrice: number
  taxRate: number
  serialNumber?: string
}

interface CartState {
  items: CartItem[]
  customerId: number | null
  notes: string
  discountAmount: number

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  setCustomer: (customerId: number | null) => void
  setNotes: (notes: string) => void
  setDiscount: (amount: number) => void
  clearCart: () => void

  // Computed
  subtotal: () => number
  taxTotal: () => number
  total: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customerId: null,
  notes: '',
  discountAmount: 0,

  addItem: (item) => {
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + (item.quantity || 1) }
              : i
          ),
        }
      }
      return { items: [...state.items, { ...item, quantity: item.quantity || 1 }] }
    })
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    }))
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      ),
    }))
  },

  setCustomer: (customerId) => set({ customerId }),
  setNotes: (notes) => set({ notes }),
  setDiscount: (amount) => set({ discountAmount: amount }),
  clearCart: () => set({ items: [], customerId: null, notes: '', discountAmount: 0 }),

  subtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    )
  },

  taxTotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity * (item.taxRate / 100),
      0
    )
  },

  total: () => {
    return get().subtotal() + get().taxTotal() - get().discountAmount
  },
}))
