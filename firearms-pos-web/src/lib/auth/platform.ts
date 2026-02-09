import { auth } from '@/lib/auth/config'

export async function getPlatformAdmin() {
  const session = await auth()
  if (!(session as any)?.isPlatformAdmin) {
    throw new Error('Unauthorized: Platform admin access required')
  }
  return session!
}
