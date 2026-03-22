'use client'

import { useState, useMemo } from 'react'
import {
  BookOpen,
  Search,
  Lightbulb,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Headphones,
  Target,
  Home,
  Monitor,
  Languages,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  workflowIntro,
  workflowPhases,
  guideSections,
} from '@/data/guide/guide-content'
import type { Language, BilingualText, GuideSection, ConceptExplainer } from '@/data/guide/types'

/* ── Helpers ── */
const t = (text: BilingualText, lang: Language) => text[lang]

const categoryLabels: Record<string, BilingualText> = {
  all: { en: 'All', ur: 'سب' },
  operations: { en: 'Operations', ur: 'آپریشنز' },
  financial: { en: 'Financial', ur: 'مالیاتی' },
  accounting: { en: 'Accounting', ur: 'حسابات' },
  management: { en: 'Management', ur: 'انتظامیہ' },
}

const categoryColors: Record<string, string> = {
  operations: 'text-blue-400',
  financial: 'text-green-400',
  accounting: 'text-purple-400',
  management: 'text-primary',
}

const categories = ['all', 'operations', 'financial', 'accounting', 'management']

/* ── Concept Explainer Box ── */
function ConceptBox({ concept, lang }: { concept: ConceptExplainer; lang: Language }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/50 overflow-hidden">
      <div className="px-3 py-2 bg-primary/5 border-b border-border/30">
        <span className="text-xs font-bold text-primary">{t(concept.term, lang)}</span>
      </div>
      <div className="p-3 space-y-2.5">
        <div className="flex items-start gap-2">
          <Home className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
              {lang === 'en' ? 'Simple Analogy' : 'آسان مثال'}
            </span>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t(concept.analogy, lang)}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
              {lang === 'en' ? 'Definition' : 'تعریف'}
            </span>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t(concept.definition, lang)}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Monitor className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-semibold text-green-400 uppercase tracking-wider">
              {lang === 'en' ? 'In This App' : 'ایپ میں کہاں ہے'}
            </span>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t(concept.inApp, lang)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ── */
export default function GuidePage() {
  const [lang, setLang] = useState<Language>('en')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [showWorkflow, setShowWorkflow] = useState(true)

  const isUrdu = lang === 'ur'

  const filtered = useMemo(() => {
    return guideSections.filter((s) => {
      if (activeCategory !== 'all' && s.category !== activeCategory) return false
      if (search) {
        const q = search.toLowerCase()
        const title = t(s.title, lang).toLowerCase()
        const summary = t(s.summary, lang).toLowerCase()
        const stepsMatch = s.steps.some(
          (st) =>
            t(st.title, lang).toLowerCase().includes(q) ||
            t(st.description, lang).toLowerCase().includes(q)
        )
        if (!title.includes(q) && !summary.includes(q) && !stepsMatch) return false
      }
      return true
    })
  }, [search, activeCategory, lang])

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isUrdu ? 'استعمال کی گائیڈ' : 'How-To Guide'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isUrdu
              ? 'فائر آرمز POS سسٹم کے ہر ماڈیول کی مکمل رہنمائی'
              : 'Complete bilingual guide for every module in Firearms POS'}
          </p>
        </div>
        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 bg-card hover:bg-accent transition-colors shrink-0"
        >
          <Languages className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {lang === 'en' ? 'اردو' : 'English'}
          </span>
        </button>
      </div>

      {/* ── Welcome Banner ── */}
      <Card className="card-tactical border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <div className={`flex items-start gap-4 ${isUrdu ? 'flex-row-reverse text-right' : ''}`}>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div className={isUrdu ? 'font-urdu' : ''} dir={isUrdu ? 'rtl' : 'ltr'}>
              <h2 className="font-bold text-base">
                {isUrdu ? 'فائر آرمز POS میں خوش آمدید' : 'Welcome to Firearms POS'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {t(workflowIntro, lang)}
              </p>
              <div className={`flex items-center gap-4 mt-3 text-xs text-muted-foreground ${isUrdu ? 'flex-row-reverse' : ''}`}>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  <span>{guideSections.length} {isUrdu ? 'گائیڈز دستیاب' : 'guides'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isUrdu ? 'مرحلہ وار ہدایات' : 'Step-by-step'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isUrdu ? 'انگریزی / اردو' : 'English / Urdu'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Workflow Overview ── */}
      <div>
        <button
          onClick={() => setShowWorkflow(!showWorkflow)}
          className="flex items-center gap-2 mb-3 group"
        >
          {showWorkflow ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <h2 className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
            {isUrdu ? 'کاروبار کا ورک فلو' : 'Business Workflow Overview'}
          </h2>
          <Badge variant="outline" className="text-[9px]">
            {isUrdu ? '6 مراحل' : '6 Phases'}
          </Badge>
        </button>

        {showWorkflow && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {workflowPhases.map((phase, idx) => (
              <Card key={phase.id} className="card-tactical">
                <CardContent className="p-4">
                  <div className={isUrdu ? 'text-right font-urdu' : ''} dir={isUrdu ? 'rtl' : 'ltr'}>
                    <div className={`flex items-center gap-2.5 mb-2 ${isUrdu ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <phase.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`flex items-center gap-1.5 ${isUrdu ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[10px] font-bold text-primary">
                            {isUrdu ? `مرحلہ ${idx + 1}` : `Phase ${idx + 1}`}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold truncate">{t(phase.title, lang)}</h3>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {t(phase.description, lang)}
                    </p>
                    <div className={`flex flex-wrap gap-1 mt-2.5 ${isUrdu ? 'justify-end' : ''}`}>
                      {phase.modules.map((mod) => (
                        <button
                          key={mod}
                          onClick={() => {
                            setExpandedId(mod)
                            setActiveCategory('all')
                            setSearch('')
                            setShowWorkflow(false)
                            setTimeout(() => {
                              document.getElementById(`guide-${mod}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            }, 100)
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          {guideSections.find((s) => s.id === mod)
                            ? t(guideSections.find((s) => s.id === mod)!.title, lang)
                            : mod}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Search + Category Filter ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={isUrdu ? 'گائیڈز تلاش کریں...' : 'Search guides...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`pl-9 ${isUrdu ? 'font-urdu text-right' : ''}`}
            dir={isUrdu ? 'rtl' : 'ltr'}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {t(categoryLabels[cat], lang)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Per-Module Guide Sections ── */}
      <div className="space-y-3">
        {filtered.map((section) => {
          const isExpanded = expandedId === section.id
          const catColor = categoryColors[section.category] || 'text-muted-foreground'

          return (
            <Card key={section.id} id={`guide-${section.id}`} className="card-tactical overflow-hidden">
              {/* Collapsed Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : section.id)}
                className="w-full text-left"
              >
                <CardContent className="p-4">
                  <div className={`flex items-center gap-3 ${isUrdu ? 'flex-row-reverse text-right' : ''}`}>
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <section.icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`flex items-center gap-2 ${isUrdu ? 'flex-row-reverse' : ''}`}>
                        <h3 className={`font-semibold text-sm ${isUrdu ? 'font-urdu' : ''}`}>
                          {t(section.title, lang)}
                        </h3>
                        <Badge variant="outline" className={`text-[9px] ${catColor} border-current/20`}>
                          {t(categoryLabels[section.category], lang)}
                        </Badge>
                      </div>
                      <p className={`text-xs text-muted-foreground mt-0.5 ${isUrdu ? 'font-urdu' : ''}`}>
                        {t(section.summary, lang)}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 shrink-0 ${isUrdu ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[10px] text-muted-foreground">
                        {section.steps.length} {isUrdu ? 'مراحل' : 'steps'}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div
                  className="border-t border-border/50 px-4 pb-4"
                  dir={isUrdu ? 'rtl' : 'ltr'}
                >
                  {/* Concept Explainers */}
                  {section.concepts && section.concepts.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className={`text-xs font-semibold text-primary mb-2 ${isUrdu ? 'font-urdu text-right' : ''}`}>
                        {isUrdu ? 'پہلے یہ سمجھیں' : 'Understand These Concepts First'}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {section.concepts.map((concept, idx) => (
                          <ConceptBox key={idx} concept={concept} lang={lang} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Steps */}
                  <div className="mt-4 space-y-0">
                    {section.steps.map((step, idx) => (
                      <div key={idx} className={`flex gap-3 ${isUrdu ? 'flex-row-reverse' : ''}`}>
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                            {idx + 1}
                          </div>
                          {idx < section.steps.length - 1 && (
                            <div className="w-px flex-1 bg-border/50 my-1" />
                          )}
                        </div>
                        <div className={`pb-4 ${isUrdu ? 'font-urdu text-right' : ''}`}>
                          <p className="text-sm font-medium">{t(step.title, lang)}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {t(step.description, lang)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Examples */}
                  {section.examples && section.examples.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {section.examples.map((example, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                          <p className={`text-xs font-semibold text-blue-400 mb-2 ${isUrdu ? 'font-urdu text-right' : ''}`}>
                            {t(example.label, lang)}
                          </p>
                          <div className="space-y-1">
                            {example.fields.map((field, fIdx) => (
                              <div
                                key={fIdx}
                                className={`flex items-center gap-2 text-xs ${isUrdu ? 'flex-row-reverse' : ''}`}
                              >
                                <span className="text-muted-foreground min-w-[100px]">
                                  {t(field.name, lang)}:
                                </span>
                                <span className="font-mono text-foreground">{field.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tips */}
                  {section.tips && section.tips.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <div className={`flex items-center gap-1.5 mb-2 ${isUrdu ? 'flex-row-reverse' : ''}`}>
                        <Lightbulb className="w-3.5 h-3.5 text-primary" />
                        <span className={`text-xs font-semibold text-primary ${isUrdu ? 'font-urdu' : ''}`}>
                          {isUrdu ? 'مفید مشورے' : 'Pro Tips'}
                        </span>
                      </div>
                      <ul className="space-y-1.5">
                        {section.tips.map((tip, idx) => (
                          <li
                            key={idx}
                            className={`flex items-start gap-2 text-xs text-muted-foreground ${isUrdu ? 'flex-row-reverse text-right font-urdu' : ''}`}
                          >
                            <ArrowRight className={`w-3 h-3 text-primary shrink-0 mt-0.5 ${isUrdu ? 'rotate-180' : ''}`} />
                            <span>{t(tip, lang)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings */}
                  {section.warnings && section.warnings.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                      <div className={`flex items-center gap-1.5 mb-2 ${isUrdu ? 'flex-row-reverse' : ''}`}>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        <span className={`text-xs font-semibold text-amber-500 ${isUrdu ? 'font-urdu' : ''}`}>
                          {isUrdu ? 'اہم تنبیہ' : 'Important'}
                        </span>
                      </div>
                      <ul className="space-y-1.5">
                        {section.warnings.map((warn, idx) => (
                          <li
                            key={idx}
                            className={`flex items-start gap-2 text-xs text-muted-foreground ${isUrdu ? 'flex-row-reverse text-right font-urdu' : ''}`}
                          >
                            <AlertTriangle className={`w-3 h-3 text-amber-500 shrink-0 mt-0.5`} />
                            <span>{t(warn, lang)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {isUrdu ? 'آپ کی تلاش سے کوئی گائیڈ نہیں ملی' : 'No guides found matching your search'}
            </p>
            <p className="text-xs mt-1">
              {isUrdu ? 'مختلف الفاظ آزمائیں یا فلٹر صاف کریں' : 'Try different keywords or clear the filter'}
            </p>
          </div>
        )}
      </div>

      {/* ── Need More Help ── */}
      <Card className="card-tactical border-border/30">
        <CardContent className="p-5">
          <div className={`flex items-center justify-between ${isUrdu ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${isUrdu ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Headphones className="w-5 h-5 text-primary" />
              </div>
              <div className={isUrdu ? 'text-right font-urdu' : ''}>
                <p className="text-sm font-semibold">
                  {isUrdu ? 'مزید مدد چاہیے؟' : 'Need more help?'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isUrdu ? 'ذاتی مدد کے لیے ڈویلپر سے رابطہ کریں' : 'Contact the developer for personalized assistance'}
                </p>
              </div>
            </div>
            <a href="/support">
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-primary/10 text-primary border-primary/20 transition-colors"
              >
                {isUrdu ? 'سپورٹ' : 'Go to Support'}
                <ArrowRight className={`w-3 h-3 ${isUrdu ? 'mr-1 rotate-180' : 'ml-1'}`} />
              </Badge>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
