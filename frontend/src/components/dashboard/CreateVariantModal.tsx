import { useState } from 'react'
import { X, Sparkles, Check, Loader2 } from 'lucide-react'
import { useCreateVariant, useGenerateVariant, type OverrideSuggestion } from '@/hooks/useVariants'
import { useNavigate } from 'react-router-dom'

interface CreateVariantModalProps {
  profileId: string
  onClose: () => void
}

type Step = 'form' | 'generating' | 'review'

export function CreateVariantModal({ profileId, onClose }: CreateVariantModalProps) {
  const navigate = useNavigate()
  const createVariant = useCreateVariant()
  const generateVariant = useGenerateVariant()
  const [step, setStep] = useState<Step>('form')
  const [form, setForm] = useState({
    name: '',
    target_company: '',
    target_role: '',
    job_description: '',
  })
  const [suggestions, setSuggestions] = useState<OverrideSuggestion[]>([])
  const [accepted, setAccepted] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.job_description.trim() || !form.target_company || !form.target_role) {
      setError('Job description, company, and role are all required')
      return
    }
    const name = form.name.trim() || `${form.target_role.toLowerCase().replace(/\s+/g, '-')}-${form.target_company.toLowerCase().replace(/\s+/g, '-')}`
    setForm(f => ({ ...f, name }))
    setError(null)
    setStep('generating')

    try {
      const result = await generateVariant.mutateAsync({
        job_description: form.job_description,
        target_company: form.target_company,
        target_role: form.target_role,
        profile_id: profileId,
      })
      setSuggestions(result.suggestions ?? [])
      setAccepted(new Set((result.suggestions ?? []).map((_: unknown, i: number) => i)))
      setStep('review')
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { detail?: string } } }
      setError(apiError?.response?.data?.detail ?? 'Generation failed')
      setStep('form')
    }
  }

  const handleSave = async () => {
    const name = form.name || `variant-${Date.now()}`
    try {
      const variant = await createVariant.mutateAsync({
        name,
        profile_id: profileId,
        job_description_text: form.job_description,
        target_company: form.target_company,
        target_role: form.target_role,
      })
      onClose()
      navigate(`/dashboard/variants/${variant.id}`)
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { detail?: string } } }
      setError(apiError?.response?.data?.detail ?? 'Save failed')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Create Variant"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            {step === 'form' && 'New Resume Variant'}
            {step === 'generating' && 'Generating AI Suggestions...'}
            {step === 'review' && `${suggestions.length} Suggestions`}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'form' && (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Company *</label>
                  <input
                    type="text"
                    value={form.target_company}
                    onChange={e => setForm(f => ({ ...f, target_company: e.target.value }))}
                    placeholder="Accenture"
                    className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Role *</label>
                  <input
                    type="text"
                    value={form.target_role}
                    onChange={e => setForm(f => ({ ...f, target_role: e.target.value }))}
                    placeholder="Principal Consultant"
                    className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Variant Name (optional)</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Auto-generated from company + role"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job Description *</label>
                <textarea
                  value={form.job_description}
                  onChange={e => setForm(f => ({ ...f, job_description: e.target.value }))}
                  rows={8}
                  placeholder="Paste the full job description here..."
                  className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm resize-none"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!form.job_description.trim() || !form.target_company || !form.target_role}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Suggestions
                </button>
              </div>
            </form>
          )}

          {step === 'generating' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
              <p className="text-slate-600 dark:text-slate-300">Analyzing job description and tailoring your profile...</p>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-4">
              {suggestions.length === 0 && (
                <p className="text-slate-500 text-center py-8">No suggestions generated. The AI could not find improvements to suggest.</p>
              )}
              <div className="flex justify-end">
                <button
                  onClick={() => setAccepted(new Set(suggestions.map((_, i) => i)))}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Accept all
                </button>
              </div>
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className={`border rounded-xl p-4 transition-colors ${
                    accepted.has(i) ? 'border-green-400 bg-green-50 dark:bg-green-950/20' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                      {s.entity_type} · {s.field}
                    </span>
                    <button
                      onClick={() => {
                        setAccepted(prev => {
                          const next = new Set(prev)
                          if (next.has(i)) next.delete(i)
                          else next.add(i)
                          return next
                        })
                      }}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md ${
                        accepted.has(i) ? 'bg-green-500 text-white' : 'border border-slate-300 text-slate-600 hover:border-green-400'
                      }`}
                    >
                      {accepted.has(i) ? <><Check className="h-3 w-3" /> Accepted</> : 'Accept'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Original</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded p-2">{s.original}</p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-500 mb-1">Suggested</p>
                      <p className="text-sm text-slate-900 dark:text-white bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded p-2">{s.suggested}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer (review step) */}
        {step === 'review' && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 shrink-0">
            <button
              onClick={() => setStep('form')}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Edit
            </button>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg">Cancel</button>
              <button
                onClick={handleSave}
                disabled={createVariant.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createVariant.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save variant ({accepted.size} override{accepted.size !== 1 ? 's' : ''})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
