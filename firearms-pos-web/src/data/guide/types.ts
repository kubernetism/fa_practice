import type { LucideIcon } from 'lucide-react'

export type Language = 'en' | 'ur'

export type BilingualText = {
  en: string
  ur: string
}

export type GuideStep = {
  title: BilingualText
  description: BilingualText
}

export type GuideExample = {
  label: BilingualText
  fields: { name: BilingualText; value: string }[]
}

export type ConceptExplainer = {
  term: BilingualText
  analogy: BilingualText
  definition: BilingualText
  inApp: BilingualText
}

export type WorkflowPhase = {
  id: string
  title: BilingualText
  description: BilingualText
  modules: string[]
  icon: LucideIcon
}

export type GuideSection = {
  id: string
  title: BilingualText
  icon: LucideIcon
  category: 'operations' | 'financial' | 'accounting' | 'management'
  summary: BilingualText
  steps: GuideStep[]
  examples?: GuideExample[]
  concepts?: ConceptExplainer[]
  tips?: BilingualText[]
  warnings?: BilingualText[]
}
