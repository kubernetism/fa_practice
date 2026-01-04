import React, { useState } from 'react'
import { useTheme, DEFAULT_THEMES } from '@/contexts/theme-context'
import { Sun, Moon, Sparkles, Monitor, Palette, Check, Palette as PaletteIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThemeOption {
  id: string
  name: string
  icon: React.ElementType
  type: 'light' | 'dark'
}

const THEME_ICONS: Record<string, React.ElementType> = {
  light: Sun,
  dark: Moon,
  midnight: Sparkles,
}

const defaultThemes: ThemeOption[] = [
  { id: 'light', name: 'Light', icon: Sun, type: 'light' },
  { id: 'dark', name: 'Dark', icon: Moon, type: 'dark' },
  { id: 'midnight', name: 'Midnight', icon: Sparkles, type: 'dark' },
]

export interface ThemeSelectorProps {
  variant?: 'dropdown' | 'button'
  buttonClassName?: string
}

export function ThemeSelector({ variant = 'button', buttonClassName }: ThemeSelectorProps) {
  const {
    theme,
    setTheme,
    availableThemes,
    customThemes,
    removeCustomTheme,
    isSystemTheme,
    useSystemTheme,
  } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const currentTheme = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme

  const CurrentIcon = THEME_ICONS[currentTheme] || PaletteIcon

  const handleThemeClick = (themeId: string) => {
    setTheme(themeId as any)
    setIsOpen(false)
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            buttonClassName
          )}
        >
          <CurrentIcon className="h-4 w-4" />
          <span>{isSystemTheme ? 'System' : defaultThemes.find(t => t.id === theme)?.name || theme}</span>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 z-20 min-w-[200px] rounded-md border bg-popover p-1 shadow-md">
              {/* System Theme Option */}
              <button
                onClick={() => {
                  useSystemTheme()
                  setIsOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  isSystemTheme && 'bg-accent'
                )}
              >
                <Monitor className="h-4 w-4" />
                <span className="flex-1 text-left">System</span>
                {isSystemTheme && <Check className="h-4 w-4" />}
              </button>

              <div className="my-1 border-t" />

              {/* Default Themes */}
              {defaultThemes.map((t) => {
                const Icon = t.icon
                return (
                  <button
                    key={t.id}
                    onClick={() => handleThemeClick(t.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      theme === t.id && !isSystemTheme && 'bg-accent'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{t.name}</span>
                    {theme === t.id && !isSystemTheme && <Check className="h-4 w-4" />}
                  </button>
                )
              })}

              {/* Custom Themes */}
              {customThemes.length > 0 && (
                <>
                  <div className="my-1 border-t" />
                  {customThemes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleThemeClick(t.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                        'hover:bg-accent hover:text-accent-foreground group',
                        theme === t.id && !isSystemTheme && 'bg-accent'
                      )}
                    >
                      <div
                        className="h-4 w-4 rounded"
                        style={{ backgroundColor: t.colors.primary }}
                      />
                      <span className="flex-1 text-left">{t.name}</span>
                      {theme === t.id && !isSystemTheme && <Check className="h-4 w-4" />}
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          removeCustomTheme(t.id)
                        }}
                        className="hidden group-hover:block text-destructive hover:text-destructive/80"
                        title="Remove theme"
                      >
                        <PaletteIcon className="h-3 w-3" />
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  // Button variant
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        buttonClassName
      )}
    >
      <CurrentIcon className="h-4 w-4" />
      <span>{isSystemTheme ? 'System' : defaultThemes.find(t => t.id === theme)?.name || theme}</span>
    </button>
  )
}
