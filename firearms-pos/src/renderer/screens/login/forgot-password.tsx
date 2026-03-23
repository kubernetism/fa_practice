import React, { useState } from 'react'
import {
  ArrowLeft,
  Search,
  ShieldQuestion,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Step = 'username' | 'questions' | 'newPassword' | 'success'

interface UserLookupData {
  userId: number
  username: string
  fullName: string
  questions: { id: number; question: string }[]
}

interface ForgotPasswordProps {
  onBack: () => void
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [step, setStep] = useState<Step>('username')
  const [username, setUsername] = useState('')
  const [userData, setUserData] = useState<UserLookupData | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await window.api.recovery.lookupUser(username.trim())
      if (result.success && result.data) {
        setUserData(result.data)
        // Initialize answers map
        const initialAnswers: Record<number, string> = {}
        result.data.questions.forEach((q: { id: number }) => {
          initialAnswers[q.id] = ''
        })
        setAnswers(initialAnswers)
        setStep('questions')
      } else {
        setError(result.message || 'User not found')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyAnswers = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate all answers are provided
    const emptyAnswer = userData?.questions.find((q) => !answers[q.id]?.trim())
    if (emptyAnswer) {
      setError('Please answer all security questions')
      return
    }

    setStep('newPassword')
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const result = await window.api.recovery.resetPassword({
        userId: userData!.userId,
        answers: Object.entries(answers).map(([qId, answer]) => ({
          questionId: Number(qId),
          answer,
        })),
        newPassword,
      })

      if (result.success) {
        setStep('success')
      } else {
        setError(result.message || 'Failed to reset password')
        // If answers were wrong, go back to questions step
        if (result.message?.includes('incorrect')) {
          setStep('questions')
        }
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const stepConfig = {
    username: {
      icon: Search,
      title: 'Find Your Account',
      subtitle: 'Enter your username to begin the recovery process',
    },
    questions: {
      icon: ShieldQuestion,
      title: 'Verify Identity',
      subtitle: `Answer the security questions for ${userData?.fullName || 'your account'}`,
    },
    newPassword: {
      icon: KeyRound,
      title: 'Create New Password',
      subtitle: 'Choose a strong password for your account',
    },
    success: {
      icon: CheckCircle2,
      title: 'Password Reset',
      subtitle: 'Your password has been changed successfully',
    },
  }

  const currentStep = stepConfig[step]
  const StepIcon = currentStep.icon
  const stepIndex = ['username', 'questions', 'newPassword', 'success'].indexOf(step)

  return (
    <div className="w-full max-w-[400px] space-y-6">
      {/* Back button */}
      {step !== 'success' && (
        <button
          onClick={step === 'username' ? onBack : () => setStep(step === 'newPassword' ? 'questions' : 'username')}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          {step === 'username' ? 'Back to login' : 'Previous step'}
        </button>
      )}

      {/* Progress indicator */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              i <= stepIndex
                ? 'bg-primary'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Step header */}
      <div className="space-y-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
          step === 'success'
            ? 'bg-green-500/10 border-green-500/20'
            : 'bg-primary/5 border-primary/10'
        }`}>
          <StepIcon className={`h-5 w-5 ${step === 'success' ? 'text-green-500' : 'text-primary'}`} />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {currentStep.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {currentStep.subtitle}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Step: Username lookup */}
      {step === 'username' && (
        <form onSubmit={handleLookup} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="recovery-username" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Username
            </Label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
              <Input
                id="recovery-username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                required
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-11 font-semibold text-sm gap-2"
            disabled={isLoading || !username.trim()}
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Looking up...</>
            ) : (
              <><Search className="h-4 w-4" /> Find Account</>
            )}
          </Button>
        </form>
      )}

      {/* Step: Answer security questions */}
      {step === 'questions' && userData && (
        <form onSubmit={handleVerifyAnswers} className="space-y-5">
          {/* User identity card */}
          <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{userData.fullName}</p>
              <p className="text-[11px] text-muted-foreground">@{userData.username}</p>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {userData.questions.map((q, idx) => (
              <div key={q.id} className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Question {idx + 1}
                </Label>
                <p className="text-sm text-foreground font-medium leading-snug">{q.question}</p>
                <Input
                  type="text"
                  placeholder="Your answer"
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  className="h-10 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                  required
                  autoFocus={idx === 0}
                />
              </div>
            ))}
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-semibold text-sm gap-2"
            disabled={Object.values(answers).some((a) => !a.trim())}
          >
            <ShieldQuestion className="h-4 w-4" />
            Verify Answers
          </Button>
        </form>
      )}

      {/* Step: New password */}
      {step === 'newPassword' && (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              New Password
            </Label>
            <div className="relative group">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10 pr-11 h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                required
                autoFocus
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-0.5"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground">Minimum 6 characters</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Confirm Password
            </Label>
            <div className="relative group">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                required
                minLength={6}
              />
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[10px] text-destructive">Passwords do not match</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-semibold text-sm gap-2"
            disabled={isLoading || newPassword.length < 6 || newPassword !== confirmPassword}
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Resetting...</>
            ) : (
              <><KeyRound className="h-4 w-4" /> Reset Password</>
            )}
          </Button>
        </form>
      )}

      {/* Step: Success */}
      {step === 'success' && (
        <div className="space-y-5">
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-5 text-center space-y-2">
            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
            <p className="text-sm font-medium text-foreground">Password changed successfully!</p>
            <p className="text-xs text-muted-foreground">
              You can now sign in with your new password.
            </p>
          </div>
          <Button
            className="w-full h-11 font-semibold text-sm gap-2"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Button>
        </div>
      )}
    </div>
  )
}
