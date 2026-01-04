import React from 'react'
import { useTheme } from '@/contexts/theme-context'
import { Sun, Moon, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const THEME_ICONS: Record<string, React.ElementType> = {
  light: Sun,
  dark: Moon,
  midnight: Sparkles,
}

export function ThemeToggle() {
  const { resolvedTheme, cycleTheme } = useTheme()
  const Icon = THEME_ICONS[resolvedTheme] || Sun

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        'p-2 rounded-md transition-all hover:scale-110',
        'text-foreground hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
      title={`Current theme: ${resolvedTheme} (click to cycle)`}
    >
      <Icon className="h-5 w-5" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
