import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { InlineEdit } from '@/components/ui/InlineEdit'
import { ImproveButton } from '@/components/ai/ImproveButton'
import { useQuery } from '@tanstack/react-query'
import { useUpdateEmployment, useDeleteEmployment } from '@/hooks/useEmploymentMutations'
import { api } from '@/lib/api'
import type { Employment } from '@/hooks/useProfile'

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function ExperienceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: job, isLoading } = useQuery<Employment>({
    queryKey: ['employment', id],
    queryFn: () => api.get(`/employment/${id}`).then(r => r.data),
    enabled: !!id,
  })
  const updateEmployment = useUpdateEmployment(id!)
  const deleteEmployment = useDeleteEmployment()

  const handleSaveField = (field: string) => async (value: string) => {
    await updateEmployment.mutateAsync({ [field]: value })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!job) {
    return <div className="text-slate-500 py-16 text-center">Employment not found.</div>
  }

  return (
    <div data-testid="experience-detail">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard/experience" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex-1">{job.company}</h1>
        <button
          onClick={() => {
            if (window.confirm('Delete this employment record?')) {
              deleteEmployment.mutate(job.id, {
                onSuccess: () => navigate('/dashboard/experience'),
              })
            }
          }}
          className="text-slate-400 hover:text-red-500 p-1"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
              Job Title
            </label>
            <InlineEdit
              value={job.job_title}
              onSave={handleSaveField('job_title')}
              testId="inline-edit-job-title"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
              Company
            </label>
            <InlineEdit
              value={job.company}
              onSave={handleSaveField('company')}
              testId="inline-edit-company"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
              Type
            </label>
            <div className="px-3 py-2">
              <Badge variant="secondary">{job.employment_type}</Badge>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
              Location
            </label>
            <InlineEdit
              value={job.location ?? ''}
              onSave={handleSaveField('location')}
              placeholder="Add location..."
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-500 px-3">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDate(job.start_date)} — {job.current ? 'Present' : formatDate(job.end_date)}
          </span>
          {job.remote && <Badge variant="outline">Remote</Badge>}
          {job.current && <Badge>Current</Badge>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1 px-3">
            Description
          </label>
          <InlineEdit
            value={job.description ?? ''}
            onSave={handleSaveField('description')}
            multiline
            placeholder="Add a description of this role..."
            testId="inline-edit-description"
          />
          <div className="px-3">
            <ImproveButton
              text={job.description ?? ''}
              context={`${job.job_title} at ${job.company}`}
              onAccept={async (suggestion) => {
                await updateEmployment.mutateAsync({ description: suggestion })
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-3">Projects</h2>
        <p className="text-sm text-slate-500">
          Projects for this role will appear here. Add them from the Projects page.
        </p>
      </div>
    </div>
  )
}
