import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface SkillCreateData {
  name: string
  category?: string
}

export function useCreateSkill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SkillCreateData) => api.post('/skills', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skills'] }),
  })
}

export function useDeleteSkill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/skills/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skills'] }),
  })
}
