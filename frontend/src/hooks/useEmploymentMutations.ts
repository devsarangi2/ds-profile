import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Employment } from '@/hooks/useProfile'

interface EmploymentCreateData {
  company: string
  job_title: string
  employment_type: string
  profile_id: string
  location?: string
  remote?: boolean
  start_date?: string | null
  end_date?: string
  current?: boolean
  description?: string
  company_logo_url?: string
}

interface EmploymentUpdateData {
  company?: string
  job_title?: string
  employment_type?: string
  location?: string
  remote?: boolean
  start_date?: string
  end_date?: string
  current?: boolean
  description?: string
  company_logo_url?: string
}

export function useSingleEmployment(id: string) {
  return useQuery<Employment>({
    queryKey: ['employment', id],
    queryFn: () => api.get(`/employment/${id}`).then(r => r.data),
    enabled: !!id,
  })
}

export function useCreateEmployment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: EmploymentCreateData) =>
      api.post('/employment', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employment'] }),
  })
}

export function useUpdateEmployment(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: EmploymentUpdateData) =>
      api.patch(`/employment/${id}`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employment'] })
      qc.invalidateQueries({ queryKey: ['employment', id] })
    },
  })
}

export function useDeleteEmployment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/employment/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employment'] }),
  })
}
