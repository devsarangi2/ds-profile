import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GitBranch, Plus, Trash2, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useVariants, useDeleteVariant } from '@/hooks/useVariants'
import { useProfile } from '@/hooks/useProfile'
import { CreateVariantModal } from '@/components/dashboard/CreateVariantModal'

export function VariantsList() {
  const { data: variants = [], isLoading } = useVariants()
  const { data: profile } = useProfile()
  const deleteVariant = useDeleteVariant()
  const [showModal, setShowModal] = useState(false)

  return (
    <div data-testid="variants-list">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Resume Variants</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          New Variant
        </button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-20 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />)}
        </div>
      )}

      {!isLoading && variants.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <GitBranch className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No variants yet.</p>
          <p className="text-sm mt-1">Create a tailored resume variant from a job description.</p>
          <button onClick={() => setShowModal(true)} className="mt-4 text-blue-600 hover:underline text-sm">
            Create your first variant
          </button>
        </div>
      )}

      <div className="space-y-3">
        {variants.map(variant => (
          <div key={variant.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900">
            <div className="flex items-start gap-3">
              <GitBranch className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-medium text-slate-900 dark:text-white">{variant.name}</h2>
                  {variant.base && <Badge>Master</Badge>}
                </div>
                {variant.target_role && variant.target_company && (
                  <p className="text-sm text-slate-500">{variant.target_role} at {variant.target_company}</p>
                )}
                <p className="text-xs text-slate-400 mt-0.5">{variant.override_count} override{variant.override_count !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (window.confirm(`Delete variant "${variant.name}"?`)) {
                      deleteVariant.mutate(variant.id)
                    }
                  }}
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <Link
                  to={`/dashboard/variants/${variant.id}`}
                  className="text-slate-400 hover:text-blue-600 p-1"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <CreateVariantModal
          profileId={profile?.id ?? ''}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
