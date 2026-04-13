import { ipcMain } from 'electron'
import { eq, and } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { getDatabase } from '../db'
import { users, userSecurityQuestions } from '../db/schema'
import { createAuditLog } from '../utils/audit'

interface SecurityQuestionInput {
  question: string
  answer: string
}

const SUGGESTED_QUESTIONS = [
  'What is the name of your first pet?',
  'What city were you born in?',
  'What is your mother\'s maiden name?',
  'What was the name of your first school?',
  'What is your favorite childhood game?',
  'What is the name of the street you grew up on?',
  'What was your childhood nickname?',
  'What is your father\'s middle name?',
  'What was the make of your first vehicle?',
  'What is your favorite book?',
]

export function registerRecoveryHandlers(): void {
  const db = getDatabase()

  // Get suggested questions list
  ipcMain.handle('recovery:get-suggested-questions', () => {
    return { success: true, data: SUGGESTED_QUESTIONS }
  })

  // Set security questions for a user (overwrites existing)
  ipcMain.handle(
    'recovery:set-questions',
    async (_, userId: number, questions: SecurityQuestionInput[]) => {
      try {
        if (!questions || questions.length < 2) {
          return { success: false, message: 'At least 2 security questions are required' }
        }

        if (questions.length > 3) {
          return { success: false, message: 'Maximum 3 security questions allowed' }
        }

        // Verify user exists
        const user = await db.query.users.findFirst({
          where: eq(users.id, userId),
        })
        if (!user) {
          return { success: false, message: 'User not found' }
        }

        // Validate all questions have non-empty answers
        for (const q of questions) {
          if (!q.question.trim() || !q.answer.trim()) {
            return { success: false, message: 'All questions and answers must be filled' }
          }
          if (q.answer.trim().length < 2) {
            return { success: false, message: 'Answers must be at least 2 characters' }
          }
        }

        // Delete existing questions for this user
        await db.delete(userSecurityQuestions).where(eq(userSecurityQuestions.userId, userId))

        // Insert new questions with hashed answers
        const now = new Date().toISOString()
        for (let i = 0; i < questions.length; i++) {
          const answerHash = await bcrypt.hash(questions[i].answer.trim().toLowerCase(), 10)
          await db.insert(userSecurityQuestions).values({
            userId,
            question: questions[i].question.trim(),
            answerHash,
            sortOrder: i,
            createdAt: now,
            updatedAt: now,
          })
        }

        await createAuditLog({
          action: 'set_security_questions',
          entity: 'user',
          entityId: userId,
          description: `Security questions set for user: ${user.username} (${questions.length} questions)`,
        })

        return { success: true, message: 'Security questions saved successfully' }
      } catch (error) {
        console.error('Set security questions error:', error)
        return { success: false, message: 'Failed to save security questions' }
      }
    }
  )

  // Check if a user has security questions configured
  ipcMain.handle('recovery:has-questions', async (_, userId: number) => {
    try {
      const questions = await db.query.userSecurityQuestions.findMany({
        where: eq(userSecurityQuestions.userId, userId),
        columns: { id: true },
      })
      return { success: true, data: questions.length >= 2 }
    } catch (error) {
      console.error('Check security questions error:', error)
      return { success: false, data: false }
    }
  })

  // Get questions for a user (returns question text only, no answers)
  ipcMain.handle('recovery:get-questions', async (_, userId: number) => {
    try {
      const questions = await db.query.userSecurityQuestions.findMany({
        where: eq(userSecurityQuestions.userId, userId),
        columns: { id: true, question: true, sortOrder: true },
        orderBy: (q, { asc }) => [asc(q.sortOrder)],
      })
      return { success: true, data: questions }
    } catch (error) {
      console.error('Get security questions error:', error)
      return { success: false, message: 'Failed to fetch security questions' }
    }
  })

  // Lookup user by username for recovery flow (returns minimal info)
  ipcMain.handle('recovery:lookup-user', async (_, username: string) => {
    try {
      const user = await db.query.users.findFirst({
        where: and(eq(users.username, username), eq(users.isActive, true)),
        columns: { id: true, username: true, fullName: true },
      })

      if (!user) {
        return { success: false, message: 'No active user found with this username' }
      }

      // Check if they have security questions
      const questions = await db.query.userSecurityQuestions.findMany({
        where: eq(userSecurityQuestions.userId, user.id),
        columns: { id: true, question: true, sortOrder: true },
        orderBy: (q, { asc }) => [asc(q.sortOrder)],
      })

      if (questions.length < 2) {
        return {
          success: false,
          message: 'This account has no security questions configured. Please contact an administrator.',
        }
      }

      return {
        success: true,
        data: {
          userId: user.id,
          username: user.username,
          fullName: user.fullName,
          questions: questions.map((q) => ({ id: q.id, question: q.question })),
        },
      }
    } catch (error) {
      console.error('Lookup user for recovery error:', error)
      return { success: false, message: 'Failed to look up user' }
    }
  })

  // Verify security answers and reset password
  ipcMain.handle(
    'recovery:reset-password',
    async (
      _,
      params: {
        userId: number
        answers: { questionId: number; answer: string }[]
        newPassword: string
      }
    ) => {
      try {
        const { userId, answers, newPassword } = params

        if (!newPassword || newPassword.length < 6) {
          return { success: false, message: 'New password must be at least 6 characters' }
        }

        // Get user's security questions
        const storedQuestions = await db.query.userSecurityQuestions.findMany({
          where: eq(userSecurityQuestions.userId, userId),
        })

        if (storedQuestions.length < 2) {
          return { success: false, message: 'Security questions not configured for this user' }
        }

        // Verify ALL answers match
        for (const stored of storedQuestions) {
          const provided = answers.find((a) => a.questionId === stored.id)
          if (!provided) {
            return { success: false, message: 'All security questions must be answered' }
          }

          const isMatch = await bcrypt.compare(
            provided.answer.trim().toLowerCase(),
            stored.answerHash
          )
          if (!isMatch) {
            await createAuditLog({
              action: 'password_reset_failed',
              entity: 'user',
              entityId: userId,
              description: `Failed password reset attempt - incorrect security answers`,
            })
            return { success: false, message: 'One or more answers are incorrect' }
          }
        }

        // All answers correct — reset the password
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        await db
          .update(users)
          .set({ password: hashedPassword, updatedAt: new Date().toISOString() })
          .where(eq(users.id, userId))

        const user = await db.query.users.findFirst({
          where: eq(users.id, userId),
          columns: { username: true },
        })

        await createAuditLog({
          action: 'password_reset',
          entity: 'user',
          entityId: userId,
          description: `Password reset via security questions for user: ${user?.username || userId}`,
        })

        return { success: true, message: 'Password has been reset successfully' }
      } catch (error) {
        console.error('Reset password error:', error)
        return { success: false, message: 'Failed to reset password' }
      }
    }
  )
}
