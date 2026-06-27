import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Briefcase, Calendar, Trash2, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useEmployment, useProfile } from '@/hooks/useProfile'
import { useCreateEmployment, useDeleteEmployment } from '@/hooks/useEmploymentMutations'
import { AddEmploymentModal } from '@/components/dashboard/AddEmploymentModal'
import type { Employment } from '@/hooks/useProfile'

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function ExperienceList() {
  const { data: employment = [], isLoading } = useEmployment()
  const { data: profile } = useProfile()
  const createEmployment = useCreateEmployment()
  const deleteEmployment = useDeleteEmployment()
  const [showModal, setShowModal] = useState(false)

  // Sort: current roles first, then by start_date descending
  const sorted = [...employment].sort((a: Employment, b: Employment) => {
    if (a.current && !b.current) return -1
    if (!a.current && b.current) return 1
    const aDate = a.start_date ?? ''
    const bDate = b.start_date ?? ''
    return bDate.localeCompare(aDate)
  })

  return (
    <div data-testid="experience-list">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Experience</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Employment
        </button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && sorted.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No employment records yet.</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-blue-600 hover:underline text-sm"
          >
            Add your first role
          </button>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map((job: Employment) => (
          <div
            key={job.id}
            className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-sm transition-shadow bg-white dark:bg-slate-900"
          >
            <div className="flex items-start gap-3">
              {job.company_logo_url ? (
                <img
                  src={job.company_logo_url}
                  alt={job.company}
                  className="h-10 w-10 rounded object-contain"
                />
              ) : (
                <div className="h-10 w-10 rounded bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold">
                  {job.company.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-medium text-slate-900 dark:text-white">{job.job_title}</h2>
                  <Badge variant="secondary">{job.employment_type}</Badge>
                  {job.current && <Badge>Current</Badge>}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{job.company}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Calendar className="h-3 w-3" />
                  {formatDate(job.start_date)} — {job.current ? 'Present' : formatDate(job.end_date)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (window.confirm(`Delete ${job.company}?`)) {
                      deleteEmployment.mutate(job.id)
                    }
                  }}
                  className="text-slate-400 hover:text-red-500 p-1"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <Link
                  to={`/dashboard/experience/${job.id}`}
                  className="flex items-center text-slate-400 hover:text-blue-600 p-1"
                  aria-label="Open detail"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <AddEmploymentModal
          profileId={profile?.id ?? ''}
          onSubmit={async (data) => {
            if (!profile?.id) {
              throw new Error('Profile not found. Please create your profile first.')
            }
            await createEmployment.mutateAsync(data)
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
