import { and, eq } from 'drizzle-orm'
import { getDatabase } from '../db'
import { cashRegisterSessions } from '../db/schema'

export interface OpenCashSessionInfo {
  id: number
  branchId: number
  sessionDate: string
}

export type CashSessionGuardResult =
  | { ok: true; session: OpenCashSessionInfo }
  | { ok: false; message: string }

/**
 * Require an open cash register session for the given branch today.
 *
 * Use this before any operation that moves cash through the physical drawer
 * (paid-in-cash expenses, A/P cash payments, cash refunds, cash commission
 * payouts, cash A/R receipts). Without an open session the GL would post a
 * Cash credit/debit while the register stays untouched, breaking the
 * GL ↔ register reconciliation.
 *
 * Returns the open session on success; a user-facing error message otherwise.
 */
export async function requireOpenCashSession(
  branchId: number
): Promise<CashSessionGuardResult> {
  if (!branchId) {
    return { ok: false, message: 'Branch is required to check cash register state' }
  }

  const db = getDatabase()
  const today = new Date().toISOString().split('T')[0]

  const session = await db.query.cashRegisterSessions.findFirst({
    where: and(
      eq(cashRegisterSessions.branchId, branchId),
      eq(cashRegisterSessions.sessionDate, today),
      eq(cashRegisterSessions.status, 'open')
    ),
    columns: { id: true, branchId: true, sessionDate: true },
  })

  if (!session) {
    return {
      ok: false,
      message:
        'No open cash register session for this branch. Open a cash register session before recording a cash transaction.',
    }
  }

  return { ok: true, session }
}

/**
 * Returns true when the payment method will touch the cash drawer.
 * Treats undefined/null as cash because several legacy callers omit the
 * method field when recording a cash expense.
 */
export function isCashMethod(method?: string | null): boolean {
  if (!method) return true
  return method === 'cash'
}
