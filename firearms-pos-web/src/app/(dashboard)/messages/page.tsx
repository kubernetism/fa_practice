'use client'

import { useState, useEffect } from 'react'
import {
  MessageSquare,
  Send,
  Inbox,
  SendHorizontal,
  Circle,
  CheckCheck,
  Users,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  getMessages,
  getUnreadCount,
  sendMessage,
  getTeamMembers,
} from '@/actions/messages'
import { toast } from 'sonner'
import { PageLoader } from '@/components/ui/page-loader'

export default function MessagesPage() {
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [newMessage, setNewMessage] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [recipientId, setRecipientId] = useState('')
  const [dialogMessage, setDialogMessage] = useState('')
  const currentUserId = 1 // TODO: Get from session

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [messagesRes, unreadRes, teamRes] = await Promise.all([
        getMessages(),
        getUnreadCount(),
        getTeamMembers(),
      ])
      if (messagesRes.success) {
        setMessages(messagesRes.data)
      }
      if (unreadRes.success) {
        setUnreadCount(unreadRes.data.unread)
      }
      if (teamRes.success) {
        setTeamMembers(teamRes.data)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!recipientId || !dialogMessage) return
    try {
      const res = await sendMessage({
        recipientId: Number(recipientId),
        content: dialogMessage,
      })
      if (res.success) {
        toast.success('Message sent')
        setDialogOpen(false)
        setRecipientId('')
        setDialogMessage('')
        loadData()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
    }
  }

  const summaryCards = [
    { title: 'Total Messages', value: String(messages.length), icon: MessageSquare, accent: 'text-primary' },
    { title: 'Unread', value: String(unreadCount), icon: Inbox, accent: 'text-red-400' },
    { title: 'Sent', value: String(messages.filter((m) => m.message.senderId === currentUserId).length), icon: SendHorizontal, accent: 'text-blue-400' },
    { title: 'Team Members', value: String(teamMembers.length), icon: Users, accent: 'text-muted-foreground' },
  ]

  if (loading && messages.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
            <PageLoader />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">Internal team communication</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="brass-glow">
              <Send className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Send Message</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSend} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Recipient</Label>
                <Select value={recipientId} onValueChange={setRecipientId}>
                  <SelectTrigger><SelectValue placeholder="Select team member" /></SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.name} ({m.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Input placeholder="Type your message..." value={dialogMessage} onChange={(e) => setDialogMessage(e.target.value)} />
              </div>
              <Button type="submit" className="w-full brass-glow">Send Message</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="card-tactical">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <card.icon className={`w-5 h-5 ${card.accent}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="p-4 space-y-4">
              {messages.map((msg) => {
                const isMine = msg.message.senderId === currentUserId
                return (
                  <div
                    key={msg.message.id}
                    className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="w-8 h-8 border border-sidebar-border shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {msg.senderName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[70%] ${isMine ? 'items-end' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">{msg.senderName}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(msg.message.createdAt).toLocaleString()}
                        </span>
                        {!isMine && !msg.message.isRead && (
                          <Circle className="w-2 h-2 fill-primary text-primary" />
                        )}
                        {isMine && msg.message.isRead && (
                          <CheckCheck className="w-3 h-3 text-primary" />
                        )}
                      </div>
                      <div
                        className={`rounded-lg px-3 py-2 text-sm ${
                          isMine
                            ? 'bg-primary/10 text-foreground border border-primary/20'
                            : 'bg-muted border border-border'
                        }`}
                      >
                        {msg.message.content}
                      </div>
                    </div>
                  </div>
                )
              })}
              {messages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No messages yet
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button size="icon" className="brass-glow shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
