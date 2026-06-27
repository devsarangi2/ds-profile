import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Profile {
  id: string
  name: string
  headline?: string
  summary?: string
  location?: string
  avatar_url?: string
  cover_url?: string
  email?: string
  website?: string
  linkedin_url?: string
}

export interface Employment {
  id: string
  company: string
  company_logo_url?: string
  job_title: string
  employment_type: string
  location?: string
  remote: boolean
  start_date?: string
  end_date?: string
  current: boolean
  description?: string
}

export interface ProjectRole {
  id: string
  name: string
}

export interface Project {
  id: string
  employment_id: string
  name: string
  description?: string
  status: string
  tech_stack: string[]
  roles: ProjectRole[]
  impact?: string
  url?: string
}

export interface Skill {
  id: string
  name: string
  category?: string
}

export interface Certification {
  id: string
  name: string
  issuer?: string
  date?: string
  url?: string
  badge_url?: string
}

export function useProfile() {
  return useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: () => api.get('/profiles/me').then(r => r.data),
    retry: false,
  })
}

export function useEmployment() {
  return useQuery<Employment[]>({
    queryKey: ['employment'],
    queryFn: () => api.get('/employment').then(r => r.data),
  })
}

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(r => r.data),
  })
}

export function useSkills() {
  return useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: () => api.get('/skills').then(r => r.data),
  })
}

export function useCertifications() {
  return useQuery<Certification[]>({
    queryKey: ['certifications'],
    queryFn: () => api.get('/certifications').then(r => r.data),
  })
}
