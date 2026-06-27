import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Trash2, GitBranch } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useSingleVariant, useDeleteVariant } from '@/hooks/useVariants'

export function VariantDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: variant, isLoading } = useSingleVariant(id!)
  const deleteVariant = useDeleteVariant()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => <div key={i} className="h-20 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />)}
      </div>
    )
  }

  if (!variant) {
    return <div className="text-slate-500 py-16 text-center">Variant not found.</div>
  }

  return (
    <div data-testid="variant-detail">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard/variants" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <GitBranch className="h-5 w-5 text-blue-600" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{variant.name}</h1>
          {variant.base && <Badge>Master</Badge>}
        </div>
        <button
          onClick={() => {
            if (window.confirm('Delete this variant?')) {
              deleteVariant.mutate(variant.id, { onSuccess: () => navigate('/dashboard/variants') })
            }
          }}
          className="text-slate-400 hover:text-red-500 p-1"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {/* Meta */}
      {(variant.target_role || variant.target_company) && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-4">
          <p className="text-sm text-slate-500">Tailored for:</p>
          <p className="font-medium text-slate-900 dark:text-white">
            {variant.target_role} {variant.target_company ? `at ${variant.target_company}` : ''}
          </p>
        </div>
      )}

      {/* Overrides */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Overrides ({variant.overrides.length})
        </h2>
        {variant.overrides.length === 0 && (
          <p className="text-slate-500 text-sm">No field overrides in this variant yet.</p>
        )}
        {variant.overrides.map(override => (
          <div key={override.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
              {override.entity_type} · {override.field}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {override.original_value && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Original</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded p-2">
                    {override.original_value}
                  </p>
                </div>
              )}
              {override.overridden_value && (
                <div>
                  <p className="text-xs text-blue-500 mb-1">Override</p>
                  <p className="text-sm text-slate-900 dark:text-white bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded p-2">
                    {override.overridden_value}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* JD preview */}
      {variant.job_description_text && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">
            View job description
          </summary>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
            {variant.job_description_text}
          </p>
        </details>
      )}
    </div>
  )
}
