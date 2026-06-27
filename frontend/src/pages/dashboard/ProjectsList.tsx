import { Link } from 'react-router-dom'
import { FolderOpen, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useProjects, useEmployment } from '@/hooks/useProfile'

export function ProjectsList() {
  const { data: projects = [], isLoading } = useProjects()
  const { data: employment = [] } = useEmployment()
  const employmentMap = Object.fromEntries(employment.map(e => [e.id, e]))

  return (
    <div data-testid="projects-list">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Projects</h1>
        <p className="text-sm text-slate-500">Add projects via the Experience detail page</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />)}
        </div>
      )}

      {!isLoading && projects.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No projects yet.</p>
          <Link to="/dashboard/experience" className="mt-4 text-blue-600 hover:underline text-sm">
            Add projects from your experience
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {projects.map(project => {
          const employer = employmentMap[project.employment_id]
          return (
            <div key={project.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-medium text-slate-900 dark:text-white">{project.name}</h2>
                    <Badge variant="secondary">{project.status}</Badge>
                  </div>
                  {employer && (
                    <p className="text-xs text-slate-500 mt-0.5">{employer.company} • {employer.job_title}</p>
                  )}
                  {project.roles.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {project.roles.map(r => (
                        <Badge key={r.id} variant="outline" className="text-xs">{r.name}</Badge>
                      ))}
                    </div>
                  )}
                  {project.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{project.description}</p>
                  )}
                  {project.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {project.tech_stack.slice(0, 5).map(t => (
                        <span key={t} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">{t}</span>
                      ))}
                      {project.tech_stack.length > 5 && (
                        <span className="text-xs text-slate-400">+{project.tech_stack.length - 5} more</span>
                      )}
                    </div>
                  )}
                </div>
                <Link
                  to={`/dashboard/projects/${project.id}`}
                  className="flex items-center text-slate-400 hover:text-blue-600 p-1 shrink-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
