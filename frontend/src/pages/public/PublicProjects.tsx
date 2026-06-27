import { useProjects, useEmployment } from '@/hooks/useProfile'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import { SkeletonCard } from '@/components/ui/SkeletonCard'

export function PublicProjects() {
  const { data: projects = [], isLoading } = useProjects()
  const { data: employment = [] } = useEmployment()

  const employmentMap = Object.fromEntries(employment.map(e => [e.id, e]))

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} className="h-48" />)}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Projects</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map(project => {
          const employer = employmentMap[project.employment_id]
          return (
            <div key={project.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <h2 className="font-semibold text-slate-900 dark:text-white">{project.name}</h2>
                <div className="flex gap-2">
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {project.roles.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.roles.map(r => (
                    <Badge key={r.id} variant="secondary" className="text-xs">{r.name}</Badge>
                  ))}
                </div>
              )}

              {project.description && (
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{project.description}</p>
              )}

              {project.impact && (
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{project.impact}</p>
              )}

              {project.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-auto">
                  {project.tech_stack.map(t => (
                    <span key={t} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              )}

              {employer && (
                <p className="text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                  {employer.company} • {employer.job_title}
                </p>
              )}
            </div>
          )
        })}
        {projects.length === 0 && (
          <p className="text-slate-500 col-span-2 text-center py-12">No projects listed yet.</p>
        )}
      </div>
    </div>
  )
}
