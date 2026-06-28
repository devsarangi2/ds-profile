import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface AISettings {
  id: string
  user_id: string
  ai_provider: string
  ai_model: string
  has_api_key: boolean
  lmstudio_base_url?: string
}

export const AI_PROVIDERS = [
  { id: 'lmstudio', label: 'LM Studio (Local)', requiresKey: false, requiresUrl: true },
  { id: 'openrouter', label: 'OpenRouter', requiresKey: true, requiresUrl: false },
  { id: 'anthropic', label: 'Anthropic', requiresKey: true, requiresUrl: false },
  { id: 'gemini', label: 'Google Gemini', requiresKey: true, requiresUrl: false },
] as const

export const PROVIDER_MODELS: Record<string, string[]> = {
  lmstudio: ['local/model', 'qwen/qwen-3.5-9b', 'mistral/mistral-7b-instruct'],
  openrouter: [
    'openrouter/anthropic/claude-sonnet-4-6',
    'openrouter/anthropic/claude-haiku-4-5-20251001',
    'openrouter/google/gemini-2.0-flash',
    'openrouter/meta-llama/llama-3.3-70b-instruct',
  ],
  anthropic: ['claude-sonnet-4-6', 'claude-haiku-4-5-20251001', 'claude-opus-4-8'],
  gemini: ['gemini/gemini-2.0-flash', 'gemini/gemini-1.5-pro'],
}

export function useAISettings() {
  return useQuery<AISettings>({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then(r => r.data),
  })
}

export function useUpdateAISettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      ai_provider?: string
      ai_model?: string
      ai_api_key?: string
      lmstudio_base_url?: string
    }) => api.patch('/settings', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  })
}
