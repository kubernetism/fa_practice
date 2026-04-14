import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type ThemeType = 'light' | 'dark' | 'midnight' | 'system'
export type FontSizeOption = 'small' | 'default' | 'medium' | 'large'
export type ButtonSizeOption = 'compact' | 'default' | 'large'
export type IconSizeOption = 'small' | 'default' | 'medium' | 'large'

export const FONT_SIZE_MAP: Record<FontSizeOption, string> = {
  small: '13px',
  default: '14px',
  medium: '15px',
  large: '16px',
}

export const BUTTON_SIZE_MAP: Record<ButtonSizeOption, string> = {
  compact: '0.85',
  default: '1',
  large: '1.15',
}

export const ICON_SIZE_MAP: Record<IconSizeOption, string> = {
  small: '0.85',
  default: '1',
  medium: '1.15',
  large: '1.3',
}

export interface Theme {
  id: string
  name: string
  icon: string
  type: 'light' | 'dark' | 'custom'
  colors: Record<string, string>
}

export const DEFAULT_THEMES: Theme[] = [
  {
    id: 'light',
    name: 'Light',
    icon: 'sun',
    type: 'light',
    colors: {
      background: 'oklch(100% 0 0)',
      foreground: 'oklch(14.08% 0.004 285.82)',
      card: 'oklch(100% 0 0)',
      cardForeground: 'oklch(14.08% 0.004 285.82)',
      popover: 'oklch(100% 0 0)',
      popoverForeground: 'oklch(14.08% 0.004 285.82)',
      primary: 'oklch(20.47% 0.006 285.88)',
      primaryForeground: 'oklch(98.49% 0.001 106.42)',
      secondary: 'oklch(96.76% 0.001 286.38)',
      secondaryForeground: 'oklch(20.47% 0.006 285.88)',
      muted: 'oklch(96.76% 0.001 286.38)',
      mutedForeground: 'oklch(55.19% 0.014 285.94)',
      accent: 'oklch(96.76% 0.001 286.38)',
      accentForeground: 'oklch(20.47% 0.006 285.88)',
      destructive: 'oklch(57.71% 0.215 27.33)',
      destructiveForeground: 'oklch(98.49% 0.001 106.42)',
      border: 'oklch(91.97% 0.004 286.32)',
      input: 'oklch(91.97% 0.004 286.32)',
      ring: 'oklch(14.08% 0.004 285.82)',
      radius: '0.5rem',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    icon: 'moon',
    type: 'dark',
    colors: {
      background: 'oklch(14.08% 0.004 285.82)',
      foreground: 'oklch(98.49% 0.001 106.42)',
      card: 'oklch(17.76% 0.005 285.82)',
      cardForeground: 'oklch(98.49% 0.001 106.42)',
      popover: 'oklch(17.76% 0.005 285.82)',
      popoverForeground: 'oklch(98.49% 0.001 106.42)',
      primary: 'oklch(98.49% 0.001 106.42)',
      primaryForeground: 'oklch(20.47% 0.006 285.88)',
      secondary: 'oklch(26.87% 0.006 285.88)',
      secondaryForeground: 'oklch(98.49% 0.001 106.42)',
      muted: 'oklch(26.87% 0.006 285.88)',
      mutedForeground: 'oklch(71.19% 0.013 285.94)',
      accent: 'oklch(26.87% 0.006 285.88)',
      accentForeground: 'oklch(98.49% 0.001 106.42)',
      destructive: 'oklch(62.8% 0.257 29.23)',
      destructiveForeground: 'oklch(98.49% 0.001 106.42)',
      border: 'oklch(26.87% 0.006 285.88)',
      input: 'oklch(26.87% 0.006 285.88)',
      ring: 'oklch(83.14% 0.001 106.42)',
      radius: '0.5rem',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    icon: 'sparkles',
    type: 'dark',
    colors: {
      background: 'oklch(10% 0 0)',
      foreground: 'oklch(95% 0 0)',
      card: 'oklch(12% 0 0)',
      cardForeground: 'oklch(95% 0 0)',
      popover: 'oklch(12% 0 0)',
      popoverForeground: 'oklch(95% 0 0)',
      primary: 'oklch(60% 0.15 250)',
      primaryForeground: 'oklch(98% 0 0)',
      secondary: 'oklch(18% 0 0)',
      secondaryForeground: 'oklch(90% 0 0)',
      muted: 'oklch(18% 0 0)',
      mutedForeground: 'oklch(60% 0 0)',
      accent: 'oklch(25% 0.05 280)',
      accentForeground: 'oklch(95% 0 0)',
      destructive: 'oklch(55% 0.2 25)',
      destructiveForeground: 'oklch(98% 0 0)',
      border: 'oklch(20% 0 0)',
      input: 'oklch(18% 0 0)',
      ring: 'oklch(60% 0.15 250)',
      radius: '0.5rem',
    },
  },
]

interface ThemeContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
  resolvedTheme: 'light' | 'dark' | 'midnight'
  availableThemes: Theme[]
  customThemes: Theme[]
  addCustomTheme: (theme: Theme) => void
  removeCustomTheme: (themeId: string) => void
  isSystemTheme: boolean
  useSystemTheme: () => void
  cycleTheme: () => void
  fontSize: FontSizeOption
  setFontSize: (size: FontSizeOption) => void
  buttonSize: ButtonSizeOption
  setButtonSize: (size: ButtonSizeOption) => void
  iconSize: IconSizeOption
  setIconSize: (size: IconSizeOption) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'firearms-pos-theme'
const CUSTOM_THEMES_KEY = 'firearms-pos-custom-themes'
const FONT_SIZE_KEY = 'firearms-pos-font-size'
const BUTTON_SIZE_KEY = 'firearms-pos-button-size'
const ICON_SIZE_KEY = 'firearms-pos-icon-size'

function getSystemTheme(): 'light' | 'dark' | 'midnight' {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeType | null
      return stored || 'system'
    }
    return 'system'
  })

  const [isSystemTheme, setIsSystemTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      return stored === 'system'
    }
    return true
  })

  const [customThemes, setCustomThemes] = useState<Theme[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem(CUSTOM_THEMES_KEY) || '[]')
    } catch {
      return []
    }
  })

  const [fontSize, setFontSizeState] = useState<FontSizeOption>(() => {
    if (typeof window === 'undefined') return 'default'
    return (localStorage.getItem(FONT_SIZE_KEY) as FontSizeOption) || 'default'
  })

  const [buttonSize, setButtonSizeState] = useState<ButtonSizeOption>(() => {
    if (typeof window === 'undefined') return 'default'
    return (localStorage.getItem(BUTTON_SIZE_KEY) as ButtonSizeOption) || 'default'
  })

  const [iconSize, setIconSizeState] = useState<IconSizeOption>(() => {
    if (typeof window === 'undefined') return 'default'
    return (localStorage.getItem(ICON_SIZE_KEY) as IconSizeOption) || 'default'
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark' | 'midnight'>(() => {
    if (theme === 'system') {
      return getSystemTheme()
    }
    return theme === 'midnight' ? 'midnight' : theme === 'dark' ? 'dark' : 'light'
  })

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement

    // Remove all theme classes
    root.classList.remove('light', 'dark', 'midnight')

    // Determine the resolved theme
    let resolved: 'light' | 'dark' | 'midnight'
    if (theme === 'system') {
      resolved = getSystemTheme()
    } else {
      resolved = theme === 'midnight' ? 'midnight' : theme === 'dark' ? 'dark' : 'light'
    }

    // Apply the theme class
    root.classList.add(resolved)
    setResolvedTheme(resolved)

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      const colorMap = {
        light: '#ffffff',
        dark: '#09090b',
        midnight: '#050505',
      }
      metaThemeColor.setAttribute('content', colorMap[resolved])
    }
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (!isSystemTheme) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light'
      setResolvedTheme(newTheme)
      document.documentElement.classList.remove('light', 'dark', 'midnight')
      document.documentElement.classList.add(newTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [isSystemTheme])

  // Apply font size to DOM
  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', FONT_SIZE_MAP[fontSize])
  }, [fontSize])

  // Apply button size to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-btn-size', buttonSize)
  }, [buttonSize])

  // Apply icon size to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-icon-size', iconSize)
    document.documentElement.style.setProperty('--icon-scale', ICON_SIZE_MAP[iconSize])
  }, [iconSize])

  const setFontSize = useCallback((size: FontSizeOption) => {
    setFontSizeState(size)
    localStorage.setItem(FONT_SIZE_KEY, size)
  }, [])

  const setButtonSize = useCallback((size: ButtonSizeOption) => {
    setButtonSizeState(size)
    localStorage.setItem(BUTTON_SIZE_KEY, size)
  }, [])

  const setIconSize = useCallback((size: IconSizeOption) => {
    setIconSizeState(size)
    localStorage.setItem(ICON_SIZE_KEY, size)
  }, [])

  const setTheme = useCallback((newTheme: ThemeType) => {
    setIsSystemTheme(false)
    setThemeState(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
  }, [])

  const useSystemTheme = useCallback(() => {
    setIsSystemTheme(true)
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setThemeState('system')
    setResolvedTheme(systemPrefersDark ? 'dark' : 'light')
    localStorage.setItem(THEME_STORAGE_KEY, 'system')
  }, [])

  const cycleTheme = useCallback(() => {
    const themes = ['light', 'dark', 'midnight'] as const
    const currentIdx = themes.indexOf(resolvedTheme as 'light' | 'dark' | 'midnight')
    const nextIdx = (currentIdx + 1) % themes.length
    const nextTheme = themes[nextIdx]
    setIsSystemTheme(false)
    setThemeState(nextTheme)
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  }, [resolvedTheme])

  const addCustomTheme = useCallback((newTheme: Theme) => {
    setCustomThemes((prev) => {
      const updated = [...prev, newTheme]
      localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const removeCustomTheme = useCallback((themeId: string) => {
    setCustomThemes((prev) => {
      const updated = prev.filter((t) => t.id !== themeId)
      localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const availableThemes = [...DEFAULT_THEMES, ...customThemes]

  const value: ThemeContextType = {
    theme,
    setTheme,
    resolvedTheme,
    availableThemes,
    customThemes,
    addCustomTheme,
    removeCustomTheme,
    isSystemTheme,
    useSystemTheme,
    cycleTheme,
    fontSize,
    setFontSize,
    buttonSize,
    setButtonSize,
    iconSize,
    setIconSize,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
