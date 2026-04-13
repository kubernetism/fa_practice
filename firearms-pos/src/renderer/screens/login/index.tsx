import React, { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, User, Shield, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { ThemeToggle } from '@/components/theme'
import { ForgotPassword } from './forgot-password'

export function LoginScreen() {
  const navigate = useNavigate()
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [businessName, setBusinessName] = useState('POS System')
  const [mounted, setMounted] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  useEffect(() => {
    window.api.businessSettings.getGlobal().then((settings) => {
      if (settings?.businessName) setBusinessName(settings.businessName)
    }).catch(() => {})
    // Trigger mount animations
    requestAnimationFrame(() => setMounted(true))
  }, [])

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await login(username, password)
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.message || 'Login failed')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative bg-primary overflow-hidden">
        {/* Geometric grid pattern */}
        <div className="absolute inset-0 opacity-[0.07]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" className="text-primary-foreground" />
          </svg>
        </div>

        {/* Crosshair motif */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
          style={{
            transition: 'opacity 1.2s ease-out, transform 1.2s ease-out',
            opacity: mounted ? 0.06 : 0,
            transform: mounted ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.8)',
          }}
        >
          <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="1" className="text-primary-foreground" />
            <circle cx="200" cy="200" r="100" stroke="currentColor" strokeWidth="0.7" className="text-primary-foreground" />
            <circle cx="200" cy="200" r="50" stroke="currentColor" strokeWidth="0.5" className="text-primary-foreground" />
            <line x1="200" y1="20" x2="200" y2="380" stroke="currentColor" strokeWidth="0.5" className="text-primary-foreground" />
            <line x1="20" y1="200" x2="380" y2="200" stroke="currentColor" strokeWidth="0.5" className="text-primary-foreground" />
          </svg>
        </div>

        {/* Brand content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-10">
          {/* Top: Shield icon */}
          <div
            style={{
              transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
              transitionDelay: '0.2s',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
            }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>

          {/* Center: Business name + tagline */}
          <div
            className="space-y-6"
            style={{
              transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
              transitionDelay: '0.4s',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            <div>
              <h1
                className="text-4xl xl:text-5xl font-bold tracking-tight animate-shimmer bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(110deg, var(--color-primary-foreground) 35%, rgba(255,255,255,0.6) 50%, var(--color-primary-foreground) 65%)',
                  backgroundSize: '200% 100%',
                }}
              >
                {businessName}
              </h1>
              <div className="mt-4 h-px w-20 bg-primary-foreground/20" />
            </div>
            <p className="text-primary-foreground/60 text-base leading-relaxed max-w-sm">
              Secure point-of-sale management system. Track inventory, manage sales, and streamline your operations.
            </p>
          </div>

          {/* Bottom: Version */}
          <div
            className="flex items-center gap-2 text-primary-foreground/30 text-xs"
            style={{
              transition: 'opacity 0.8s ease-out',
              transitionDelay: '0.6s',
              opacity: mounted ? 1 : 0,
            }}
          >
            <span className="font-mono">v1.0.0</span>
            <span>&middot;</span>
            <span>Secure Access</span>
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="lg:hidden">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm text-foreground">{businessName}</span>
            </div>
          </div>
          <div className="hidden lg:block" />
          <ThemeToggle />
        </div>

        {/* Login form / Forgot password */}
        <div className="flex-1 flex items-center justify-center px-6 pb-10">
          {showForgotPassword ? (
            <div
              style={{
                transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
                opacity: 1,
                transform: 'translateY(0)',
              }}
            >
              <ForgotPassword onBack={() => setShowForgotPassword(false)} />
            </div>
          ) : (
          <div
            className="w-full max-w-[380px] space-y-8"
            style={{
              transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
              transitionDelay: '0.3s',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(16px)',
            }}
          >
            {/* Header */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Welcome back
              </h2>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to access the system
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                <div className="h-2 w-2 rounded-full bg-destructive shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Username
                </Label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                  <Input
                    id="username"
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

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-[10px] font-medium text-primary/70 hover:text-primary transition-colors uppercase tracking-wider"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-11 h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                    required
                    disabled={isLoading}
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
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-semibold text-sm tracking-wide gap-2 group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-[10px] uppercase tracking-widest text-muted-foreground/50">
                  Quick Access
                </span>
              </div>
            </div>

            {/* Default credentials */}
            <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">Default Credentials</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3 text-muted-foreground/50" />
                      <code className="text-xs font-mono text-foreground/70">admin</code>
                    </div>
                    <div className="h-3 w-px bg-border/50" />
                    <div className="flex items-center gap-1.5">
                      <Lock className="h-3 w-3 text-muted-foreground/50" />
                      <code className="text-xs font-mono text-foreground/70">admin123</code>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setUsername('admin')
                    setPassword('admin123')
                  }}
                >
                  Auto-fill
                </Button>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 text-center">
          <p className="text-[10px] text-muted-foreground/40 tracking-wide">
            Secure session &middot; All activity is monitored
          </p>
        </div>
      </div>
    </div>
  )
}
