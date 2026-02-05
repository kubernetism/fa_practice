'use client'

import { useState } from 'react'
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

const teamMembers = [
  { id: 1, name: 'Admin User', role: 'admin' },
  { id: 2, name: 'Manager Khan', role: 'manager' },
  { id: 3, name: 'Cashier Ali', role: 'cashier' },
]

const mockMessages = [
  { id: 1, senderName: 'Manager Khan', senderId: 2, content: 'Inventory count done for section A. Numbers are matching.', isRead: true, createdAt: '2026-02-05 14:30', isMine: false },
  { id: 2, senderName: 'Admin User', senderId: 1, content: 'Great work! Please proceed with section B by end of day.', isRead: true, createdAt: '2026-02-05 14:32', isMine: true },
  { id: 3, senderName: 'Cashier Ali', senderId: 3, content: 'Customer asking about the special order Glock 19. Any update?', isRead: false, createdAt: '2026-02-05 15:10', isMine: false },
  { id: 4, senderName: 'Manager Khan', senderId: 2, content: 'Section B has a discrepancy of 3 items. Need to recount.', isRead: false, createdAt: '2026-02-05 15:45', isMine: false },
  { id: 5, senderName: 'Admin User', senderId: 1, content: 'The Glock 19 order is arriving tomorrow. Let the customer know.', isRead: true, createdAt: '2026-02-05 15:15', isMine: true },
]

const summaryCards = [
  { title: 'Total Messages', value: String(mockMessages.length), icon: MessageSquare, accent: 'text-primary' },
  { title: 'Unread', value: String(mockMessages.filter((m) => !m.isRead && !m.isMine).length), icon: Inbox, accent: 'text-red-400' },
  { title: 'Sent', value: String(mockMessages.filter((m) => m.isMine).length), icon: SendHorizontal, accent: 'text-blue-400' },
  { title: 'Team Members', value: String(teamMembers.length), icon: Users, accent: 'text-muted-foreground' },
]

export default function MessagesPage() {
  const [newMessage, setNewMessage] = useState('')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">Internal team communication</p>
        </div>
        <Dialog>
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
            <form className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Recipient</Label>
                <Select>
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
                <Input placeholder="Type your message..." />
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
              {mockMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.isMine ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="w-8 h-8 border border-sidebar-border shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {msg.senderName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`max-w-[70%] ${msg.isMine ? 'items-end' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">{msg.senderName}</span>
                      <span className="text-[10px] text-muted-foreground">{msg.createdAt}</span>
                      {!msg.isMine && !msg.isRead && (
                        <Circle className="w-2 h-2 fill-primary text-primary" />
                      )}
                      {msg.isMine && msg.isRead && (
                        <CheckCheck className="w-3 h-3 text-primary" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${
                        msg.isMine
                          ? 'bg-primary/10 text-foreground border border-primary/20'
                          : 'bg-muted border border-border'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
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
