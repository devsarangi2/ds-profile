import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { PublicLayout } from '@/layouts/PublicLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { PublicProfile } from '@/pages/public/PublicProfile'
import { PublicExperience } from '@/pages/public/PublicExperience'
import { PublicProjects } from '@/pages/public/PublicProjects'
import { DashboardHome } from '@/pages/dashboard/DashboardHome'
import { ExperienceList } from '@/pages/dashboard/ExperienceList'
import { ExperienceDetail } from '@/pages/dashboard/ExperienceDetail'
import { ProjectsList } from '@/pages/dashboard/ProjectsList'
import { ProjectDetail } from '@/pages/dashboard/ProjectDetail'
import { SkillsManager } from '@/pages/dashboard/SkillsManager'
import { VariantsList } from '@/pages/dashboard/VariantsList'
import { VariantDetail } from '@/pages/dashboard/VariantDetail'
import { ImportFlow } from '@/pages/dashboard/ImportFlow'
import { Settings } from '@/pages/dashboard/Settings'
import { Login } from '@/pages/auth/Login'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<PublicProfile />} />
            <Route path="/experience" element={<PublicExperience />} />
            <Route path="/projects" element={<PublicProjects />} />
          </Route>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="experience" element={<ExperienceList />} />
            <Route path="experience/:id" element={<ExperienceDetail />} />
            <Route path="projects" element={<ProjectsList />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="skills" element={<SkillsManager />} />
            <Route path="variants" element={<VariantsList />} />
            <Route path="variants/:id" element={<VariantDetail />} />
            <Route path="import" element={<ImportFlow />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
