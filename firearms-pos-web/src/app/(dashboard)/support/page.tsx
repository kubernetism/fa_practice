'use client'

import { useState } from 'react'
import {
  Headphones,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Check,
  Crown,
  Zap,
  Building2,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone,
  Copy,
  ExternalLink,
  Code2,
  Github,
  Globe,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/* ── Plan Data ── */
type Plan = {
  id: string
  name: string
  price: number
  period: string
  icon: typeof Zap
  features: string[]
  popular?: boolean
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 4999,
    period: '/mo',
    icon: Zap,
    features: ['1 Branch', '3 Users', 'Basic POS', 'Email Support', '500 Products'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 14999,
    period: '/mo',
    icon: Crown,
    popular: true,
    features: ['5 Branches', '15 Users', 'Full POS + Inventory', 'Priority Support', '5,000 Products', 'Reports & Analytics'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 39999,
    period: '/mo',
    icon: Building2,
    features: ['Unlimited Branches', 'Unlimited Users', 'Full Suite + API', 'Dedicated Support', 'Unlimited Products', 'Custom Integrations'],
  },
]

const currentPlanId = 'professional'

/* ── Developer Info ── */
const developer = {
  name: 'Safdar Ali Shah',
  title: 'AI Engineer & System Architect',
  bio: 'Lecturer Computer Science, like to work on Docker, Kubernetes and Dapr Agentic Cloud Ascent (DACA) — Planet Level Scaling AI Agents. Expert in Full Stack Technologies (Next.js, React, PostgreSQL, NeonDB, Tailwind CSS, Electron.js, Node.js).',
  github: 'https://github.com/programmer-safdar-ali',
  email: 'programmersafdar@live.com',
  phone: '03160917600',
  whatsapp: '03160917600',
  nayapay: '03160917600',
  easypaisa: '03160917600',
  location: 'Pakistan',
  expertise: ['Next.js', 'React', 'PostgreSQL', 'NeonDB', 'Tailwind CSS', 'Electron.js', 'Node.js', 'Docker', 'Kubernetes', 'DACA'],
}

export default function SupportPage() {
  const [planDialogOpen, setPlanDialogOpen] = useState(false)
  const [contactSubject, setContactSubject] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [contactCategory, setContactCategory] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [messageSent, setMessageSent] = useState(false)

  const currentPlan = plans.find((p) => p.id === currentPlanId)!
  const currentIdx = plans.findIndex((p) => p.id === currentPlanId)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    setMessageSent(true)
    setTimeout(() => {
      setMessageSent(false)
      setContactSubject('')
      setContactMessage('')
      setContactCategory('')
    }, 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support</h1>
        <p className="text-sm text-muted-foreground mt-1">Get help, manage your plan, or reach out to the developer</p>
      </div>

      {/* Developer Card + Quick Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Developer Profile */}
        <Card className="card-tactical lg:col-span-2 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Code2 className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold">{developer.name}</h2>
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                    <Shield className="w-2.5 h-2.5 mr-0.5" />
                    Verified Developer
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{developer.title}</p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xl">{developer.bio}</p>

                <a
                  href={developer.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-primary hover:underline"
                >
                  <Github className="w-3.5 h-3.5" />
                  {developer.github.replace('https://github.com/', '@')}
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {developer.expertise.map((tech) => (
                    <Badge key={tech} variant="outline" className="text-[10px] bg-muted/50 text-muted-foreground border-border/50">
                      {tech}
                    </Badge>
                  ))}
                </div>

                {/* Contact Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Email</p>
                      <p className="text-sm truncate">{developer.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => copyToClipboard(developer.email, 'email')}
                    >
                      {copied === 'email' ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Phone / WhatsApp</p>
                      <p className="text-sm">{developer.phone}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => copyToClipboard(developer.phone, 'phone')}
                    >
                      {copied === 'phone' ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-tactical">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Headphones className="w-4 h-4 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href={`mailto:${developer.email}`}>
              <Button variant="outline" className="w-full justify-start gap-2 h-10">
                <Mail className="w-4 h-4 text-primary" />
                Send Email
                <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground" />
              </Button>
            </a>
            <a href={`https://wa.me/92${developer.whatsapp.slice(1)}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full justify-start gap-2 h-10 mt-2">
                <MessageSquare className="w-4 h-4 text-green-500" />
                WhatsApp Chat
                <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground" />
              </Button>
            </a>
            <a href={`tel:${developer.phone}`}>
              <Button variant="outline" className="w-full justify-start gap-2 h-10 mt-2">
                <Phone className="w-4 h-4 text-blue-400" />
                Call Directly
                <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground" />
              </Button>
            </a>
            <div className="pt-2 border-t border-border/50 mt-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Available: Mon-Sat, 10 AM - 8 PM PKT</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card className="card-tactical">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary" />
            Payment Methods
          </CardTitle>
          <CardDescription>Use any of the following methods for subscription payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* NayaPay */}
            <div className="relative p-4 rounded-xl border border-border/50 bg-muted/20 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold">NayaPay</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Mobile Wallet</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-background/50 border border-border/30">
                <div>
                  <p className="text-[10px] text-muted-foreground">Account Number</p>
                  <p className="text-sm font-mono font-medium">{developer.nayapay}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => copyToClipboard(developer.nayapay, 'nayapay')}
                >
                  {copied === 'nayapay' ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">Account Title: <span className="font-medium text-foreground">{developer.name}</span></p>
            </div>

            {/* EasyPaisa */}
            <div className="relative p-4 rounded-xl border border-border/50 bg-muted/20 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold">EasyPaisa</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Mobile Wallet</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-background/50 border border-border/30">
                <div>
                  <p className="text-[10px] text-muted-foreground">Account Number</p>
                  <p className="text-sm font-mono font-medium">{developer.easypaisa}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => copyToClipboard(developer.easypaisa, 'easypaisa')}
                >
                  {copied === 'easypaisa' ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">Account Title: <span className="font-medium text-foreground">{developer.name}</span></p>
            </div>

            {/* Bank Transfer */}
            <div className="relative p-4 rounded-xl border border-border/50 bg-muted/20 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Bank Transfer</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Direct Deposit</p>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-background/50 border border-border/30">
                <p className="text-[10px] text-muted-foreground">Contact for bank account details</p>
                <p className="text-sm font-medium mt-1">{developer.email}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">IBAN / account details shared on request</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Upgrade / Downgrade */}
      <Card className="card-tactical">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Upgrade or Downgrade Plan
              </CardTitle>
              <CardDescription className="mt-1">
                Currently on <span className="font-semibold text-primary">{currentPlan.name}</span> at Rs. {currentPlan.price.toLocaleString()}{currentPlan.period}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
              <Crown className="w-2.5 h-2.5 mr-0.5" />
              {currentPlan.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlanId
              const planIdx = plans.findIndex((p) => p.id === plan.id)
              const isUpgrade = planIdx > currentIdx
              const isDowngrade = planIdx < currentIdx

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-xl border p-5 space-y-4 transition-all ${
                    isCurrent
                      ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                      : 'border-border/50 hover:border-border'
                  }`}
                >
                  {isCurrent && (
                    <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px]">
                      Current Plan
                    </Badge>
                  )}
                  {plan.popular && !isCurrent && (
                    <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px]">
                      Most Popular
                    </Badge>
                  )}

                  <div className="text-center space-y-1 pt-1">
                    <plan.icon className={`w-7 h-7 mx-auto ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                    <h3 className="font-bold text-base">{plan.name}</h3>
                    <div>
                      <span className="text-2xl font-bold">Rs. {plan.price.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button variant="outline" size="sm" className="w-full" disabled>
                      <Check className="w-4 h-4 mr-1" />
                      Active Plan
                    </Button>
                  ) : isUpgrade ? (
                    <Button
                      size="sm"
                      className="w-full brass-glow"
                      onClick={() => setPlanDialogOpen(true)}
                    >
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      Upgrade to {plan.name}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setPlanDialogOpen(true)}
                    >
                      <ArrowDownLeft className="w-4 h-4 mr-1" />
                      Downgrade to {plan.name}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/30">
            <p className="text-xs text-muted-foreground">
              To change your plan, contact the developer via email or WhatsApp. Plan changes take effect at the start of your next billing cycle.
              Downgrading may limit features — please ensure your current usage fits within the new plan limits.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Form */}
      <Card className="card-tactical">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" />
            Send a Message
          </CardTitle>
          <CardDescription>Report an issue, request a feature, or ask a question</CardDescription>
        </CardHeader>
        <CardContent>
          {messageSent ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
                <Check className="w-7 h-7 text-success" />
              </div>
              <h3 className="font-semibold text-lg">Message Sent!</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Thank you for reaching out. You will receive a response within 24 hours at your registered email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={contactCategory} onValueChange={setContactCategory}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="billing">Billing Question</SelectItem>
                      <SelectItem value="plan">Plan Change Request</SelectItem>
                      <SelectItem value="general">General Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Input
                    placeholder="Brief summary of your message"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Message *</Label>
                <Textarea
                  placeholder="Describe your issue, request, or question in detail..."
                  rows={5}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Response time: within 24 hours
                </p>
                <Button
                  type="submit"
                  className="brass-glow"
                  disabled={!contactCategory || !contactSubject || !contactMessage}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Plan Change Confirmation Dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Request Plan Change</DialogTitle>
            <DialogDescription>
              To upgrade or downgrade your plan, please contact the developer using one of these methods:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <a href={`mailto:${developer.email}?subject=Plan Change Request&body=I would like to change my plan from ${currentPlan.name}.`}>
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-[10px] text-muted-foreground">{developer.email}</p>
                </div>
              </Button>
            </a>
            <a href={`https://wa.me/92${developer.whatsapp.slice(1)}?text=Hi, I'd like to change my Firearms POS plan from ${currentPlan.name}.`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 mt-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">WhatsApp</p>
                  <p className="text-[10px] text-muted-foreground">{developer.phone}</p>
                </div>
              </Button>
            </a>
            <a href={`tel:${developer.phone}`}>
              <Button variant="outline" className="w-full justify-start gap-3 h-12 mt-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Phone Call</p>
                  <p className="text-[10px] text-muted-foreground">{developer.phone}</p>
                </div>
              </Button>
            </a>

            <div className="p-3 rounded-lg bg-muted/30 border border-border/30 mt-3">
              <h4 className="text-xs font-semibold mb-1.5">Payment via:</h4>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>NayaPay: <span className="font-mono text-foreground">{developer.nayapay}</span></span>
                <span>EasyPaisa: <span className="font-mono text-foreground">{developer.easypaisa}</span></span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Account Title: {developer.name}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
