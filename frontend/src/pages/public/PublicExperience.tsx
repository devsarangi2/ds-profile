import { useEmployment, useProjects } from '@/hooks/useProfile'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, ExternalLink } from 'lucide-react'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { useState } from 'react'

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function PublicExperience() {
  const { data: employment = [], isLoading } = useEmployment()
  const { data: projects = [] } = useProjects()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map(i => <SkeletonCard key={i} className="h-32" />)}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Experience</h1>
      <div className="space-y-4">
        {employment.map(job => {
          const jobProjects = projects.filter(p => p.employment_id === job.id)
          const isExpanded = expandedId === job.id
          return (
            <div key={job.id} data-testid="employment-card" className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <button
                className="w-full text-left p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : job.id)}
              >
                <div className="flex items-start gap-3">
                  {job.company_logo_url ? (
                    <img src={job.company_logo_url} alt={job.company} className="h-12 w-12 rounded object-contain" />
                  ) : (
                    <div className="h-12 w-12 rounded bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-lg">
                      {job.company.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold text-slate-900 dark:text-white">{job.job_title}</h2>
                      <Badge variant="secondary">{job.employment_type}</Badge>
                      {job.remote && <Badge variant="outline">Remote</Badge>}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">{job.company}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(job.start_date)} — {job.current ? 'Present' : formatDate(job.end_date)}
                      </span>
                      {job.location && (
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                      )}
                    </div>
                  </div>
                  {jobProjects.length > 0 && (
                    <span className="text-xs text-slate-400">{jobProjects.length} project{jobProjects.length !== 1 ? 's' : ''} {isExpanded ? '▲' : '▼'}</span>
                  )}
                </div>
                {job.description && (
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{job.description}</p>
                )}
              </button>

              {isExpanded && jobProjects.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                  {jobProjects.map(project => (
                    <div key={project.id} className="p-5 pl-8 bg-slate-50/50 dark:bg-slate-800/30">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-slate-900 dark:text-white">{project.name}</h3>
                        <div className="flex gap-2 shrink-0">
                          {project.url && (
                            <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                      {project.roles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {project.roles.map(r => (
                            <Badge key={r.id} variant="outline" className="text-xs">{r.name}</Badge>
                          ))}
                        </div>
                      )}
                      {project.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{project.description}</p>
                      )}
                      {project.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.tech_stack.map(t => (
                            <span key={t} className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">{t}</span>
                          ))}
                        </div>
                      )}
                      {project.impact && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 font-medium">{project.impact}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        {employment.length === 0 && (
          <p className="text-slate-500 text-center py-12">No experience listed yet.</p>
        )}
      </div>
    </div>
  )
}
