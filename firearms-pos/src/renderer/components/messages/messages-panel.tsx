import React, { useState, useEffect, useCallback } from 'react'
import { MessageCircle, Send, Trash2, Users, CheckCheck, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'

interface MessageUser {
  id: number
  username: string
  fullName: string
  role: string
}

interface Message {
  id: number
  content: string
  senderId: number
  recipientId: number | null
  isRead: boolean
  createdAt: string
  sender: MessageUser
  recipient: MessageUser | null
}

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  if (type === 'error') {
    console.error(message)
    alert(message)
  } else {
    console.log(message)
  }
}

export function MessagesPanel() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<MessageUser[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    content: '',
    recipientId: 'all', // 'all' for broadcast
  })

  const loadMessages = useCallback(async () => {
    try {
      const result = await window.api.messages.getAll()
      if (result.success) {
        setMessages(result.data || [])
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }, [])

  const loadUnreadCount = useCallback(async () => {
    try {
      const result = await window.api.messages.getUnreadCount()
      if (result.success) {
        setUnreadCount(result.data || 0)
      }
    } catch (error) {
      console.error('Failed to load unread count:', error)
    }
  }, [])

  const loadUsers = useCallback(async () => {
    try {
      const result = await window.api.messages.getUsers()
      if (result.success) {
        setUsers(result.data || [])
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }, [])

  useEffect(() => {
    // Load unread count on mount
    loadUnreadCount()

    // Poll for new messages every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [loadUnreadCount])

  useEffect(() => {
    if (isOpen) {
      loadMessages()
      loadUsers()
    }
  }, [isOpen, loadMessages, loadUsers])

  const handleSendMessage = async () => {
    if (!formData.content.trim()) {
      showToast('Message content is required', 'error')
      return
    }

    setIsLoading(true)
    try {
      const result = await window.api.messages.send({
        content: formData.content,
        recipientId: formData.recipientId === 'all' ? undefined : parseInt(formData.recipientId),
      })

      if (result.success) {
        showToast('Message sent successfully', 'success')
        setIsComposeDialogOpen(false)
        setFormData({ content: '', recipientId: 'all' })
        loadMessages()
      } else {
        showToast(result.message || 'Failed to send message', 'error')
      }
    } catch (error) {
      showToast('An error occurred', 'error')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (messageId: number) => {
    try {
      await window.api.messages.markRead(messageId)
      loadMessages()
      loadUnreadCount()
    } catch (error) {
      console.error('Failed to mark message as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await window.api.messages.markAllRead()
      loadMessages()
      loadUnreadCount()
    } catch (error) {
      console.error('Failed to mark all messages as read:', error)
    }
  }

  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      const result = await window.api.messages.delete(messageId)

      if (result.success) {
        showToast('Message deleted successfully', 'success')
        loadMessages()
        loadUnreadCount()
      } else {
        showToast(result.message || 'Failed to delete message', 'error')
      }
    } catch (error) {
      showToast('An error occurred', 'error')
      console.error(error)
    }
  }

  const isAdmin = user?.role?.toLowerCase() === 'admin'

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" title="Messages">
            <MessageCircle className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96 p-0">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <h3 className="font-semibold">Messages</h3>
              <p className="text-xs text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : 'No unread messages'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  title="Mark all as read"
                >
                  <CheckCheck className="h-4 w-4" />
                </Button>
              )}
              <Button size="sm" onClick={() => setIsComposeDialogOpen(true)}>
                <Send className="mr-1 h-4 w-4" />
                New
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[400px]">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <MessageCircle className="mb-2 h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No messages yet</p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => setIsComposeDialogOpen(true)}
                >
                  Send your first message
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {messages.map((message) => {
                  const isSender = message.senderId === user?.userId
                  const isUnread = !message.isRead && !isSender
                  const isBroadcast = message.recipientId === null

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        'p-4 hover:bg-accent/50 transition-colors cursor-pointer',
                        isUnread && 'bg-accent/30'
                      )}
                      onClick={() => !isSender && !message.isRead && handleMarkAsRead(message.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium flex-shrink-0">
                          {getInitials(message.sender.fullName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={cn('text-sm font-medium', isUnread && 'font-semibold')}>
                                {isSender ? 'You' : message.sender.fullName}
                              </span>
                              {isBroadcast ? (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  <Users className="h-3 w-3 mr-0.5" />
                                  All
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  <User className="h-3 w-3 mr-0.5" />
                                  {isSender ? message.recipient?.fullName : 'You'}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(message.createdAt)}
                              </span>
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteMessage(message.id)
                                  }}
                                  title="Delete message"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className={cn('mt-1 text-sm text-muted-foreground line-clamp-2', isUnread && 'text-foreground')}>
                            {message.content}
                          </p>
                          {isUnread && (
                            <Badge variant="destructive" className="mt-2 text-[10px]">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>Send a message to a user or broadcast to everyone</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient">Send To</Label>
              <Select
                value={formData.recipientId}
                onValueChange={(value) => setFormData({ ...formData, recipientId: value })}
              >
                <SelectTrigger id="recipient">
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      All Users (Broadcast)
                    </div>
                  </SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {u.fullName} ({u.role})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="content">Message *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Type your message here..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsComposeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={isLoading}>
              <Send className="mr-2 h-4 w-4" />
              {isLoading ? 'Sending...' : 'Send Message'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
