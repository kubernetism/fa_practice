import { useState } from 'react'
import {
  useTheme,
  DEFAULT_THEMES,
  FONT_SIZE_MAP,
  type Theme,
  type FontSizeOption,
  type ButtonSizeOption,
  type IconSizeOption,
} from '@/contexts/theme-context'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
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
import {
  Sun,
  Moon,
  Sparkles,
  Monitor,
  Check,
  Plus,
  Trash2,
  Palette,
  Type,
  MousePointer2,
  Info,
  RotateCcw,
  Maximize2,
} from 'lucide-react'

// ─── Theme icon map ───────────────────────────────────────────────
const THEME_ICONS: Record<string, React.ElementType> = {
  light: Sun,
  dark: Moon,
  midnight: Sparkles,
  system: Monitor,
}

// ─── Color keys for custom theme creation ─────────────────────────
const COLOR_KEYS = [
  'background',
  'foreground',
  'card',
  'cardForeground',
  'primary',
  'primaryForeground',
  'secondary',
  'secondaryForeground',
  'accent',
  'accentForeground',
  'muted',
  'mutedForeground',
  'destructive',
  'border',
  'input',
  'ring',
] as const

const COLOR_LABELS: Record<string, string> = {
  background: 'Background',
  foreground: 'Text',
  card: 'Card',
  cardForeground: 'Card Text',
  primary: 'Primary',
  primaryForeground: 'Primary Text',
  secondary: 'Secondary',
  secondaryForeground: 'Secondary Text',
  accent: 'Accent',
  accentForeground: 'Accent Text',
  muted: 'Muted',
  mutedForeground: 'Muted Text',
  destructive: 'Destructive',
  border: 'Border',
  input: 'Input',
  ring: 'Focus Ring',
}

// ─── Default hex colors for new custom theme ──────────────────────
const DEFAULT_DARK_COLORS: Record<string, string> = {
  background: '#1a1a1a',
  foreground: '#f5f5f5',
  card: '#222222',
  cardForeground: '#f5f5f5',
  primary: '#3b82f6',
  primaryForeground: '#ffffff',
  secondary: '#2a2a2a',
  secondaryForeground: '#e5e5e5',
  accent: '#374151',
  accentForeground: '#f5f5f5',
  muted: '#2a2a2a',
  mutedForeground: '#999999',
  destructive: '#ef4444',
  border: '#333333',
  input: '#2a2a2a',
  ring: '#3b82f6',
}

const DEFAULT_LIGHT_COLORS: Record<string, string> = {
  background: '#ffffff',
  foreground: '#1a1a1a',
  card: '#ffffff',
  cardForeground: '#1a1a1a',
  primary: '#1a1a1a',
  primaryForeground: '#ffffff',
  secondary: '#f5f5f5',
  secondaryForeground: '#1a1a1a',
  accent: '#f5f5f5',
  accentForeground: '#1a1a1a',
  muted: '#f5f5f5',
  mutedForeground: '#737373',
  destructive: '#ef4444',
  border: '#e5e5e5',
  input: '#e5e5e5',
  ring: '#1a1a1a',
}

// ─── Font size options ────────────────────────────────────────────
const FONT_SIZE_OPTIONS: { value: FontSizeOption; label: string; px: string }[] = [
  { value: 'small', label: 'Small', px: '13px' },
  { value: 'default', label: 'Default', px: '14px' },
  { value: 'medium', label: 'Medium', px: '15px' },
  { value: 'large', label: 'Large', px: '16px' },
]

// ─── Button size options ──────────────────────────────────────────
const BUTTON_SIZE_OPTIONS: { value: ButtonSizeOption; label: string; desc: string }[] = [
  { value: 'compact', label: 'Compact', desc: 'Smaller buttons, tighter spacing' },
  { value: 'default', label: 'Default', desc: 'Standard button sizing' },
  { value: 'large', label: 'Large', desc: 'Larger buttons, more padding' },
]

// ─── Icon size options ────────────────────────────────────────────
const ICON_SIZE_OPTIONS: { value: IconSizeOption; label: string; scale: string }[] = [
  { value: 'small', label: 'Small', scale: '85%' },
  { value: 'default', label: 'Default', scale: '100%' },
  { value: 'medium', label: 'Medium', scale: '115%' },
  { value: 'large', label: 'Large', scale: '130%' },
]

// ─── Swatch colors to display ─────────────────────────────────────
const SWATCH_KEYS = ['background', 'primary', 'accent', 'muted', 'destructive', 'border'] as const

// ═══════════════════════════════════════════════════════════════════
// Theme Settings Screen
// ═══════════════════════════════════════════════════════════════════
export function ThemeSettingsScreen() {
  const {
    theme,
    setTheme,
    resolvedTheme,
    availableThemes,
    customThemes,
    addCustomTheme,
    removeCustomTheme,
    isSystemTheme,
    useSystemTheme,
    fontSize,
    setFontSize,
    buttonSize,
    setButtonSize,
    iconSize,
    setIconSize,
  } = useTheme()

  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <div className="flex flex-col h-full">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
            <Palette className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">Appearance</h2>
            <p className="text-xs text-muted-foreground">
              Customize theme, text size, and button density
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] gap-1">
          <Info className="h-3 w-3" />
          Settings auto-save
        </Badge>
      </div>

      {/* ── Main Content ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-5 py-4 space-y-4">

          {/* ── Section 1: Theme Selection ────────────────────── */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Color Theme</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Choose a color scheme for the interface. Current:{' '}
                    <span className="font-medium text-foreground capitalize">{resolvedTheme}</span>
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {availableThemes.length} themes
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {/* System Theme Card */}
                <ThemeCard
                  label="System"
                  icon={Monitor}
                  isActive={isSystemTheme}
                  onClick={() => useSystemTheme()}
                  description="Follow OS preference"
                  swatchColors={null}
                />

                {/* Built-in Themes */}
                {DEFAULT_THEMES.map((t) => (
                  <ThemeCard
                    key={t.id}
                    label={t.name}
                    icon={THEME_ICONS[t.id] || Palette}
                    isActive={theme === t.id && !isSystemTheme}
                    onClick={() => setTheme(t.id as any)}
                    description={t.type === 'light' ? 'Light mode' : 'Dark mode'}
                    swatchColors={SWATCH_KEYS.map((k) => t.colors[k])}
                  />
                ))}

                {/* Custom Themes */}
                {customThemes.map((t) => (
                  <ThemeCard
                    key={t.id}
                    label={t.name}
                    icon={Palette}
                    isActive={theme === t.id && !isSystemTheme}
                    onClick={() => setTheme(t.id as any)}
                    description="Custom theme"
                    swatchColors={SWATCH_KEYS.map((k) => t.colors[k])}
                    onDelete={() => removeCustomTheme(t.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── Section 2: Display Settings ───────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Font Size Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-sm">Text Size</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Adjust the base font size across the application
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Segmented control */}
                <div className="flex rounded-lg border bg-muted/30 p-0.5">
                  {FONT_SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFontSize(opt.value)}
                      className={cn(
                        'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                        fontSize === opt.value
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <span>{opt.label}</span>
                      <span className="block text-[10px] opacity-70 mt-0.5">{opt.px}</span>
                    </button>
                  ))}
                </div>

                {/* Preview */}
                <div className="rounded-lg border bg-card/50 p-3 space-y-1.5">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Preview</p>
                  <p style={{ fontSize: FONT_SIZE_MAP[fontSize] }} className="transition-all">
                    The quick brown fox jumps over the lazy dog.
                  </p>
                  <p
                    style={{ fontSize: FONT_SIZE_MAP[fontSize] }}
                    className="text-muted-foreground transition-all"
                  >
                    0123456789 - ABCDEFGHIJKLM
                  </p>
                </div>

                {/* Reset */}
                {fontSize !== 'default' && (
                  <button
                    onClick={() => setFontSize('default')}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset to default
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Button Density Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MousePointer2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-sm">Button Density</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Control the size and spacing of buttons
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {BUTTON_SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setButtonSize(opt.value)}
                      className={cn(
                        'relative rounded-lg border-2 p-3 text-center transition-all',
                        buttonSize === opt.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      )}
                    >
                      {buttonSize === opt.value && (
                        <div className="absolute top-1.5 right-1.5">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                      )}
                      <p className="text-xs font-medium">{opt.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>

                      {/* Sample button preview */}
                      <div className="mt-2 flex justify-center">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-md bg-primary text-primary-foreground font-medium transition-all',
                            opt.value === 'compact' && 'px-2 py-0.5 text-[10px]',
                            opt.value === 'default' && 'px-3 py-1 text-[11px]',
                            opt.value === 'large' && 'px-4 py-1.5 text-xs'
                          )}
                        >
                          Sample
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Reset */}
                {buttonSize !== 'default' && (
                  <button
                    onClick={() => setButtonSize('default')}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset to default
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Icon Size Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Maximize2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-sm">Icon Size</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Scale icons across the app for better readability on large displays
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Segmented control */}
                <div className="flex rounded-lg border bg-muted/30 p-0.5">
                  {ICON_SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setIconSize(opt.value)}
                      className={cn(
                        'flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all',
                        iconSize === opt.value
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <span>{opt.label}</span>
                      <span className="block text-[10px] opacity-70 mt-0.5">{opt.scale}</span>
                    </button>
                  ))}
                </div>

                {/* Preview */}
                <div className="rounded-lg border bg-card/50 p-3 space-y-2">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Preview</p>
                  <div className="flex items-center gap-3">
                    <Plus className="h-4 w-4" />
                    <MousePointer2 className="h-4 w-4" />
                    <Type className="h-4 w-4" />
                    <Palette className="h-4 w-4" />
                    <Info className="h-4 w-4" />
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>

                {/* Reset */}
                {iconSize !== 'default' && (
                  <button
                    onClick={() => setIconSize('default')}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset to default
                  </button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Section 3: Custom Themes ──────────────────────── */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Custom Themes</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Create your own color schemes with custom colors
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCreateOpen(true)}
                  className="h-7 text-xs gap-1.5"
                >
                  <Plus className="h-3 w-3" />
                  Create Theme
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {customThemes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Palette className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No custom themes yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create a custom theme to personalize your workspace
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {customThemes.map((t) => (
                    <div
                      key={t.id}
                      className={cn(
                        'relative group rounded-lg border p-3 transition-all',
                        theme === t.id && !isSystemTheme
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      )}
                    >
                      <button
                        onClick={() => setTheme(t.id as any)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="h-3 w-3 rounded-full border"
                            style={{ backgroundColor: t.colors.primary }}
                          />
                          <span className="text-xs font-medium truncate">{t.name}</span>
                        </div>
                        <div className="grid grid-cols-6 gap-0.5 h-5">
                          {SWATCH_KEYS.map((k) => (
                            <div
                              key={k}
                              className="rounded-sm"
                              style={{ backgroundColor: t.colors[k] }}
                            />
                          ))}
                        </div>
                      </button>
                      <button
                        onClick={() => removeCustomTheme(t.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"
                        title="Delete theme"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Info Footer ───────────────────────────────────── */}
          <div className="flex items-center gap-2 px-1 pb-4">
            <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              All appearance settings are stored locally and persist across sessions.
              Use the theme toggle in the sidebar footer for quick switching.
            </p>
          </div>
        </div>
      </div>

      {/* ── Create Custom Theme Dialog ─────────────────────────── */}
      <CreateThemeDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={(newTheme) => {
          addCustomTheme(newTheme)
          setIsCreateOpen(false)
        }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// Theme Card Component
// ═══════════════════════════════════════════════════════════════════
function ThemeCard({
  label,
  icon: Icon,
  isActive,
  onClick,
  description,
  swatchColors,
  onDelete,
}: {
  label: string
  icon: React.ElementType
  isActive: boolean
  onClick: () => void
  description: string
  swatchColors: string[] | null
  onDelete?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative group rounded-lg border-2 p-3 text-left transition-all',
        isActive
          ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
          : 'border-border hover:border-primary/30'
      )}
    >
      {isActive && (
        <div className="absolute top-2 right-2">
          <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
            <Check className="h-2.5 w-2.5 text-primary-foreground" />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold">{label}</span>
      </div>

      <p className="text-[10px] text-muted-foreground mb-2">{description}</p>

      {/* Color swatches */}
      {swatchColors ? (
        <div className="grid grid-cols-6 gap-0.5 h-5 rounded overflow-hidden">
          {swatchColors.map((color, i) => (
            <div
              key={i}
              className="w-full h-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      ) : (
        /* System theme: split swatch */
        <div className="flex h-5 rounded overflow-hidden">
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-zinc-900" />
        </div>
      )}

      {onDelete && (
        <span
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 cursor-pointer"
          title="Delete theme"
        >
          <Trash2 className="h-3 w-3 text-destructive" />
        </span>
      )}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════════
// Create Theme Dialog
// ═══════════════════════════════════════════════════════════════════
function CreateThemeDialog({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (theme: Theme) => void
}) {
  const [name, setName] = useState('')
  const [baseType, setBaseType] = useState<'light' | 'dark'>('dark')
  const [colors, setColors] = useState<Record<string, string>>({ ...DEFAULT_DARK_COLORS })

  const handleBaseTypeChange = (type: 'light' | 'dark') => {
    setBaseType(type)
    setColors(type === 'light' ? { ...DEFAULT_LIGHT_COLORS } : { ...DEFAULT_DARK_COLORS })
  }

  const updateColor = (key: string, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }))
  }

  const handleCreate = () => {
    if (!name.trim()) return

    const newTheme: Theme = {
      id: `custom-${Date.now().toString(36)}`,
      name: name.trim(),
      icon: 'palette',
      type: baseType === 'light' ? 'light' : 'custom',
      colors: { ...colors, radius: '0.5rem' },
    }

    onSave(newTheme)
    // Reset form
    setName('')
    setBaseType('dark')
    setColors({ ...DEFAULT_DARK_COLORS })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-sm">Create Custom Theme</DialogTitle>
          <DialogDescription className="text-xs">
            Define a custom color scheme for your workspace
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Theme Name */}
          <div className="space-y-1.5">
            <Label className="text-xs">Theme Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Custom Theme"
              className="h-8 text-sm"
            />
          </div>

          {/* Base Type */}
          <div className="space-y-1.5">
            <Label className="text-xs">Base Type</Label>
            <Select value={baseType} onValueChange={(v) => handleBaseTypeChange(v as 'light' | 'dark')}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Color Pickers */}
          <div>
            <Label className="text-xs mb-2 block">Colors</Label>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {COLOR_KEYS.map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colors[key]}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="h-7 w-7 rounded border border-border cursor-pointer bg-transparent shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium truncate">{COLOR_LABELS[key]}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{colors[key]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Live Preview */}
          <div>
            <Label className="text-xs mb-2 block">Preview</Label>
            <div
              className="rounded-lg border p-3 space-y-2"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.foreground,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Sample Interface</span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: colors.muted, color: colors.mutedForeground }}
                >
                  Badge
                </span>
              </div>
              <div
                className="rounded-md p-2 text-xs"
                style={{ backgroundColor: colors.card, color: colors.cardForeground }}
              >
                Card content area with{' '}
                <span style={{ color: colors.primary }} className="font-medium">
                  primary
                </span>{' '}
                and{' '}
                <span style={{ color: colors.destructive }} className="font-medium">
                  destructive
                </span>{' '}
                colors.
              </div>
              <div className="flex gap-2">
                <span
                  className="px-2.5 py-1 rounded text-[11px] font-medium"
                  style={{ backgroundColor: colors.primary, color: colors.primaryForeground }}
                >
                  Primary
                </span>
                <span
                  className="px-2.5 py-1 rounded text-[11px] font-medium"
                  style={{ backgroundColor: colors.secondary, color: colors.secondaryForeground }}
                >
                  Secondary
                </span>
                <span
                  className="px-2.5 py-1 rounded text-[11px] font-medium"
                  style={{ backgroundColor: colors.accent, color: colors.accentForeground }}
                >
                  Accent
                </span>
              </div>
              <div
                className="h-1 rounded-full mt-1"
                style={{
                  background: `linear-gradient(to right, ${colors.primary}, ${colors.accent}, ${colors.destructive})`,
                }}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleCreate} disabled={!name.trim()}>
            Create Theme
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
