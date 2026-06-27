import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface VariantOverride {
  id: string
  entity_type: string
  entity_id: string
  field: string
  original_value?: string
  overridden_value?: string
}

export interface Variant {
  id: string
  user_id: string
  profile_id: string
  name: string
  base: boolean
  job_description_text?: string
  target_company?: string
  target_role?: string
  override_count: number
  created_at: string
  updated_at: string
}

export interface VariantDetail extends Variant {
  overrides: VariantOverride[]
}

export interface OverrideSuggestion {
  entity_type: string
  entity_id: string
  field: string
  original: string
  suggested: string
}

export function useVariants() {
  return useQuery<Variant[]>({
    queryKey: ['variants'],
    queryFn: () => api.get('/variants').then(r => r.data),
  })
}

export function useSingleVariant(id: string) {
  return useQuery<VariantDetail>({
    queryKey: ['variant', id],
    queryFn: () => api.get(`/variants/${id}`).then(r => r.data),
    enabled: !!id,
  })
}

export function useCreateVariant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      name: string
      profile_id: string
      job_description_text?: string
      target_company?: string
      target_role?: string
    }) => api.post('/variants', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['variants'] }),
  })
}

export function useDeleteVariant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/variants/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['variants'] }),
  })
}

export function useGenerateVariant() {
  return useMutation({
    mutationFn: (data: {
      job_description: string
      target_company: string
      target_role: string
      profile_id: string
    }) => api.post('/variants/generate', data).then(r => r.data),
  })
}

export function useAddOverride() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      variantId: string
      entity_type: string
      entity_id: string
      field: string
      original_value?: string
      overridden_value: string
    }) => {
      const { variantId, ...body } = data
      return api.post(`/variants/${variantId}/overrides`, body).then(r => r.data)
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['variant', variables.variantId] })
      qc.invalidateQueries({ queryKey: ['variants'] })
    },
  })
}
