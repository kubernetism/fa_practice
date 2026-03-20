import React, { useState } from 'react'
import {
  Linkedin,
  Facebook,
  Twitter,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  Copy,
  Check,
  Code2,
  Heart,
  Building2,
  Globe,
  Sparkles,
  Monitor,
  Database,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const DEVELOPER = {
  name: 'Syed Safdar Ali Shah',
  title: 'Full-Stack Software Engineer',
  handle: 'kubernetism',
  email: 'programmersafdar@live.com',
  phone: '03160917600',
  company: 'Epic Software Solutions Pvt Ltd.',
  companyTag: 'KPITB',
}

const SOCIAL_LINKS = [
  {
    name: 'LinkedIn',
    icon: Linkedin,
    url: 'https://linkedin.com/in/kubernetism',
    handle: '/kubernetism',
    color: '#0a66c2',
    hoverBg: 'hover:bg-[#0a66c2]/10',
  },
  {
    name: 'Facebook',
    icon: Facebook,
    url: 'https://facebook.com/kubernetism',
    handle: '/kubernetism',
    color: '#1877f2',
    hoverBg: 'hover:bg-[#1877f2]/10',
  },
  {
    name: 'X / Twitter',
    icon: Twitter,
    url: 'https://x.com/kubernetism',
    handle: '/kubernetism',
    color: '#f5f5f5',
    hoverBg: 'hover:bg-white/5',
  },
  {
    name: 'WhatsApp',
    icon: MessageCircle,
    url: 'https://wa.me/923160917600',
    handle: '/kubernetism (3160917600)',
    color: '#25d366',
    hoverBg: 'hover:bg-[#25d366]/10',
  },
]

const SYSTEM_INFO = [
  { icon: Monitor, label: 'Application', value: 'Firearms POS v1.0.0' },
  { icon: Layers, label: 'Platform', value: 'Electron + React' },
  { icon: Database, label: 'Database', value: 'SQLite' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1 rounded-md text-muted-foreground/40 hover:text-muted-foreground hover:bg-white/5 transition-all"
      title="Copy"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
    </button>
  )
}

export function DeveloperInfoScreen() {
  const openExternal = (url: string) => {
    window.open(url, '_blank')
  }

  return (
    <div className="h-[calc(100vh-8rem)] overflow-y-auto p-6">
      <div className="mx-auto w-full max-w-4xl">
        {/* Main Card */}
        <div className="relative overflow-hidden rounded-2xl border border-border/40 border-t-2 border-t-primary/30 bg-card shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12),0_1px_4px_-1px_rgba(0,0,0,0.08)] dark:shadow-none">
          {/* Decorative top accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary/60 via-primary/80 to-primary/60" />

          {/* Body: 2-column grid on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/30">

            {/* ── LEFT COLUMN: Identity + System Info ── */}
            <div className="flex flex-col gap-0">

              {/* Developer Identity */}
              <div className="relative px-6 pt-6 pb-5">
                {/* Subtle diagonal background pattern */}
                <div
                  className="absolute inset-0 opacity-[0.025]"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(45deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 12px)',
                  }}
                />

                <div className="relative flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                      <Code2 className="h-7 w-7 text-primary" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 border-2 border-card">
                      <Sparkles className="h-2.5 w-2.5 text-white" />
                    </div>
                  </div>

                  {/* Name, title, badges */}
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-bold tracking-tight text-foreground leading-tight">
                      {DEVELOPER.name}
                    </h1>
                    <p className="text-sm text-primary/80 font-medium mt-0.5">
                      {DEVELOPER.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                        <Heart className="h-2.5 w-2.5" />
                        Creator
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 border border-blue-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                        @{DEVELOPER.handle}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider inside left column */}
              <div className="mx-6 border-t border-border/30" />

              {/* System Info chips */}
              <div className="px-6 py-4">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-3">
                  System Information
                </h3>
                <div className="flex flex-col gap-2">
                  {SYSTEM_INFO.map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 rounded-lg border border-primary/10 bg-primary/[0.04] px-3 py-2"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 w-20 shrink-0">
                        {label}
                      </span>
                      <span className="text-xs font-mono text-foreground/80 truncate">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN: Contact + Social ── */}
            <div className="flex flex-col gap-0">

              {/* Contact Section */}
              <div className="px-6 pt-6 pb-5">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-3">
                  Support & Contact
                </h3>

                <div className="flex flex-col gap-2">
                  {/* Email */}
                  <div className="group flex items-center gap-3 rounded-lg border border-border/20 bg-muted/20 px-4 py-2.5 transition-colors hover:border-primary/20 hover:bg-primary/[0.03]">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 leading-none mb-0.5">
                        Email Support
                      </p>
                      <p className="text-xs font-mono text-foreground truncate">{DEVELOPER.email}</p>
                    </div>
                    <CopyButton text={DEVELOPER.email} />
                    <button
                      onClick={() => openExternal(`mailto:${DEVELOPER.email}`)}
                      className="p-1.5 rounded-md text-muted-foreground/30 hover:text-primary hover:bg-primary/10 transition-all"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Phone */}
                  <div className="group flex items-center gap-3 rounded-lg border border-border/20 bg-muted/20 px-4 py-2.5 transition-colors hover:border-primary/20 hover:bg-primary/[0.03]">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Phone className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 leading-none mb-0.5">
                        Support Contact
                      </p>
                      <p className="text-xs font-mono text-foreground">{DEVELOPER.phone}</p>
                    </div>
                    <CopyButton text={DEVELOPER.phone} />
                    <button
                      onClick={() => openExternal(`tel:${DEVELOPER.phone}`)}
                      className="p-1.5 rounded-md text-muted-foreground/30 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Divider inside right column */}
              <div className="mx-6 border-t border-border/30" />

              {/* Social Links Section */}
              <div className="px-6 py-4 flex-1">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-3">
                  Social Profiles
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {SOCIAL_LINKS.map((link) => (
                    <button
                      key={link.name}
                      onClick={() => openExternal(link.url)}
                      className={`group flex items-center gap-2.5 rounded-lg border border-border/20 bg-muted/20 px-3 py-2.5 text-left transition-all ${link.hoverBg} hover:border-border/40`}
                    >
                      <link.icon
                        className="h-4 w-4 shrink-0 transition-colors"
                        style={{ color: link.color }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground leading-tight">{link.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{link.handle}</p>
                      </div>
                      <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Company Footer: full-width, spanning both columns ── */}
          <div className="border-t border-border/30 px-6 py-4">
            <div className="flex items-center gap-3 rounded-lg border border-border/20 bg-muted/20 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/20">
                <Building2 className="h-4 w-4 text-slate-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                  Crafted by
                </p>
                <p className="text-sm font-semibold text-foreground">{DEVELOPER.company}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Khyber Pakhtunkhwa Information Technology Board ({DEVELOPER.companyTag})
                </p>
              </div>
              <Globe className="h-4 w-4 text-muted-foreground/20 shrink-0" />
            </div>
          </div>

          {/* Bottom accent */}
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>

        {/* Version tag */}
        <p className="text-center text-[10px] text-primary/40 mt-3 tracking-widest font-mono uppercase">
          Firearms POS &middot; Developed by {DEVELOPER.company} &middot; v1.0.0
        </p>
      </div>
    </div>
  )
}

export default DeveloperInfoScreen
