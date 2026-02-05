/**
 * Check if user has a specific permission.
 * Supports wildcards: '*' grants all, 'products:*' grants all product permissions.
 */
export function checkPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean {
  if (!userPermissions || userPermissions.length === 0) return false

  // Wildcard grants all
  if (userPermissions.includes('*')) return true

  // Exact match
  if (userPermissions.includes(requiredPermission)) return true

  // Module-level wildcard (e.g., 'products:*' matches 'products:create')
  const [module] = requiredPermission.split(':')
  if (userPermissions.includes(`${module}:*`)) return true

  return false
}

/**
 * Check if user role has sufficient access level.
 * admin > manager > cashier
 */
export function hasMinimumRole(
  userRole: string,
  minimumRole: 'admin' | 'manager' | 'cashier'
): boolean {
  const roleHierarchy = { admin: 3, manager: 2, cashier: 1 }
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[minimumRole]
  return userLevel >= requiredLevel
}
