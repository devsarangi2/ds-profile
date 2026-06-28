import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Project } from '@/hooks/useProfile'

export function useSingleProject(id: string) {
  return useQuery<Project>({
    queryKey: ['project', id],
    queryFn: () => api.get(`/projects/${id}`).then(r => r.data),
    enabled: !!id,
  })
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Project>) => api.patch(`/projects/${id}`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['project', id] })
    },
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}

export function useAddRole(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => api.post(`/projects/${projectId}/roles`, { name }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', projectId] }),
  })
}

export function useRemoveRole(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (roleId: string) => api.delete(`/projects/${projectId}/roles/${roleId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', projectId] }),
  })
}
