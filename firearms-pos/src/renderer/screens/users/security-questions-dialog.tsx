import React, { useState, useEffect } from 'react'
import {
  ShieldQuestion,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

interface SecurityQuestionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: number
  userName: string
}

interface QuestionEntry {
  question: string
  answer: string
  isCustom: boolean
}

export function SecurityQuestionsDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: SecurityQuestionsDialogProps) {
  const [questions, setQuestions] = useState<QuestionEntry[]>([
    { question: '', answer: '', isCustom: false },
    { question: '', answer: '', isCustom: false },
  ])
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [hasExisting, setHasExisting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!open) return

    setMessage(null)
    setIsLoading(true)

    Promise.all([
      window.api.recovery.getSuggestedQuestions(),
      window.api.recovery.hasQuestions(userId),
      window.api.recovery.getQuestions(userId),
    ])
      .then(([suggestedRes, hasRes, existingRes]) => {
        if (suggestedRes.success && suggestedRes.data) {
          setSuggestedQuestions(suggestedRes.data)
        }

        setHasExisting(hasRes.success && hasRes.data)

        // If existing questions, populate the question text (answers are not returned)
        if (existingRes.success && existingRes.data && existingRes.data.length > 0) {
          setQuestions(
            existingRes.data.map((q: { question: string }) => ({
              question: q.question,
              answer: '', // Answers are hashed, user must re-enter
              isCustom: false,
            }))
          )
        } else {
          setQuestions([
            { question: '', answer: '', isCustom: false },
            { question: '', answer: '', isCustom: false },
          ])
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [open, userId])

  const updateQuestion = (index: number, field: keyof QuestionEntry, value: string | boolean) => {
    setQuestions((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addQuestion = () => {
    if (questions.length >= 3) return
    setQuestions((prev) => [...prev, { question: '', answer: '', isCustom: false }])
  }

  const removeQuestion = (index: number) => {
    if (questions.length <= 2) return
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setMessage(null)

    // Validate
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) {
        setMessage({ type: 'error', text: `Question ${i + 1} is required` })
        return
      }
      if (!questions[i].answer.trim()) {
        setMessage({ type: 'error', text: `Answer for question ${i + 1} is required` })
        return
      }
      if (questions[i].answer.trim().length < 2) {
        setMessage({ type: 'error', text: `Answer ${i + 1} must be at least 2 characters` })
        return
      }
    }

    // Check for duplicate questions
    const questionTexts = questions.map((q) => q.question.trim().toLowerCase())
    if (new Set(questionTexts).size !== questionTexts.length) {
      setMessage({ type: 'error', text: 'Each question must be unique' })
      return
    }

    setIsSaving(true)
    try {
      const result = await window.api.recovery.setQuestions(
        userId,
        questions.map((q) => ({ question: q.question.trim(), answer: q.answer.trim() }))
      )
      if (result.success) {
        setMessage({ type: 'success', text: 'Security questions saved successfully' })
        setHasExisting(true)
        setTimeout(() => onOpenChange(false), 1500)
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to save' })
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsSaving(false)
    }
  }

  // Get available suggested questions (exclude already selected ones)
  const getAvailableQuestions = (currentIndex: number) => {
    const selectedQuestions = questions
      .filter((_, i) => i !== currentIndex)
      .map((q) => q.question)
    return suggestedQuestions.filter((q) => !selectedQuestions.includes(q))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldQuestion className="h-5 w-5 text-primary" />
            Security Questions
          </DialogTitle>
          <DialogDescription>
            {hasExisting
              ? `Update recovery questions for ${userName}. Answers must be re-entered.`
              : `Set up recovery questions for ${userName} to enable password reset.`}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Message */}
            {message && (
              <div
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${
                  message.type === 'success'
                    ? 'border-green-500/30 bg-green-500/5 text-green-600'
                    : 'border-destructive/30 bg-destructive/5 text-destructive'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                )}
                {message.text}
              </div>
            )}

            {/* Questions */}
            {questions.map((q, idx) => (
              <div key={idx} className="space-y-2 rounded-lg border border-border/50 bg-muted/10 p-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Question {idx + 1}
                  </Label>
                  {questions.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeQuestion(idx)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                {/* Question selector */}
                <Select
                  value={q.question}
                  onValueChange={(val) => {
                    if (val === '__custom__') {
                      updateQuestion(idx, 'question', '')
                      updateQuestion(idx, 'isCustom', true)
                    } else {
                      updateQuestion(idx, 'question', val)
                      updateQuestion(idx, 'isCustom', false)
                    }
                  }}
                >
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder="Select a question..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableQuestions(idx).map((sq) => (
                      <SelectItem key={sq} value={sq} className="text-xs">
                        {sq}
                      </SelectItem>
                    ))}
                    <SelectItem value="__custom__" className="text-xs font-medium text-primary">
                      Write my own question...
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Custom question input */}
                {q.isCustom && (
                  <Input
                    type="text"
                    placeholder="Type your custom question"
                    value={q.question}
                    onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                    className="h-9 text-xs bg-background"
                  />
                )}

                {/* Answer input */}
                <Input
                  type="text"
                  placeholder="Your answer (case-insensitive)"
                  value={q.answer}
                  onChange={(e) => updateQuestion(idx, 'answer', e.target.value)}
                  className="h-9 text-xs bg-background"
                />
              </div>
            ))}

            {/* Add question button */}
            {questions.length < 3 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs gap-1.5"
                onClick={addQuestion}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Question ({questions.length}/3)
              </Button>
            )}

            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Minimum 2 questions required. Answers are stored securely (hashed). The user will need to answer all questions correctly to reset their password.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={handleSave}
            disabled={isSaving || isLoading}
          >
            {isSaving ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</>
            ) : (
              <><ShieldQuestion className="h-3.5 w-3.5" /> Save Questions</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
