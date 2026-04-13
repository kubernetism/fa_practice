import React, { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

type Priority = 'low' | 'medium' | 'high' | 'urgent'

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export interface ReversalRequestModalProps {
  open: boolean
  onClose: () => void
  entityType: string
  entityId: number
  /** Human-readable label shown in the dialog subtitle, e.g. "Sale #INV-2026-001" */
  entityLabel?: string
  branchId: number
  onSuccess?: () => void
}

/**
 * Reusable modal that lets a user submit a reversal request for any entity
 * (sale, expense, journal entry, etc.).  Calls the IPC channel
 * `reversal:create` and surfaces success / error feedback inline.
 */
export function ReversalRequestModal({
  open,
  onClose,
  entityType,
  entityId,
  entityLabel,
  branchId,
  onSuccess,
}: ReversalRequestModalProps) {
  const [reason, setReason] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Reset form state whenever the modal opens
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      handleClose()
    }
  }

  const handleClose = () => {
    setReason('')
    setPriority('medium')
    setIsSubmitting(false)
    setErrorMessage(null)
    setSuccessMessage(null)
    onClose()
  }

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setErrorMessage('Please provide a reason for the reversal request.')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      const result = await window.api.reversals.create({
        entityType,
        entityId,
        reason: reason.trim(),
        priority,
        branchId,
      })

      if (result?.success) {
        setSuccessMessage('Reversal request submitted successfully.')
        onSuccess?.()
        // Give the user a moment to read the success message before closing
        setTimeout(() => {
          handleClose()
        }, 1200)
      } else {
        setErrorMessage(result?.message || 'Failed to submit reversal request. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting reversal request:', error)
      setErrorMessage('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Request Reversal
          </DialogTitle>
          {entityLabel && (
            <DialogDescription>
              {entityLabel}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="reversal-priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as Priority)}
            >
              <SelectTrigger id="reversal-priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reversal-reason">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reversal-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe why this transaction should be reversed..."
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {/* Inline feedback */}
          {errorMessage && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
              {successMessage}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !reason.trim()}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
