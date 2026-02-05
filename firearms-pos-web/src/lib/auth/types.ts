import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
    }
    tenantId: number
    role: 'admin' | 'manager' | 'cashier'
    branchId: number | null
    permissions: string[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    tenantId: number
    role: 'admin' | 'manager' | 'cashier'
    branchId: number | null
    permissions: string[]
  }
}
