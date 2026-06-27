import { useState, useCallback } from 'react'
import { Upload, Check, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

type Step = 'upload' | 'processing' | 'review'

interface ExtractedEmployment {
  company: string
  job_title: string
  employment_type: string
  description?: string
  projects?: Array<{ name: string; description?: string; roles?: string[]; tech_stack?: string[] }>
}

interface ExtractedData {
  name?: string
  headline?: string
  summary?: string
  location?: string
  email?: string
  employment?: ExtractedEmployment[]
  skills?: Array<{ name: string; category?: string }>
}

export function ImportFlow() {
  const [step, setStep] = useState<Step>('upload')
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [extracted, setExtracted] = useState<ExtractedData | null>(null)
  const [elementCount, setElementCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [acceptedFields, setAcceptedFields] = useState<Set<string>>(new Set())

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.pdf')) {
      setError('Only PDF files are supported')
      return
    }
    setFileName(file.name)
    setStep('processing')
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await api.post('/imports/pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      })
      setExtracted(res.data.extracted)
      setElementCount(res.data.raw_elements)
      setStep('review')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } }
      setError(axiosErr?.response?.data?.detail ?? 'Import failed. Is the PDF parser running?')
      setStep('upload')
    }
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const toggleField = (key: string) => {
    setAcceptedFields(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const acceptAll = () => {
    if (!extracted) return
    const keys = Object.keys(extracted).filter(k => extracted[k as keyof ExtractedData] !== undefined)
    setAcceptedFields(new Set(keys))
  }

  const handleMerge = async () => {
    // TODO: call merge API once master record merge endpoint is built
    alert(`Would merge ${acceptedFields.size} field(s) into your master profile.\n\nFields: ${[...acceptedFields].join(', ')}`)
  }

  const steps: Step[] = ['upload', 'processing', 'review']
  const currentStepIndex = steps.indexOf(step)

  return (
    <div data-testid="import-flow">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Import from PDF</h1>
        {step !== 'upload' && (
          <button
            onClick={() => { setStep('upload'); setExtracted(null); setFileName(null); setError(null) }}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Start over
          </button>
        )}
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 text-xs">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium ${
              step === s ? 'bg-blue-600 text-white' :
              currentStepIndex > i ? 'bg-green-500 text-white' :
              'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}>
              {currentStepIndex > i ? '✓' : i + 1}
            </span>
            <span className="text-slate-500 capitalize">{s}</span>
            {i < 2 && <span className="text-slate-300 dark:text-slate-600">→</span>}
          </div>
        ))}
      </div>

      {/* Upload step */}
      {step === 'upload' && (
        <div
          data-testid="pdf-dropzone"
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          className={`border-2 border-dashed rounded-2xl p-16 text-center transition-colors ${
            dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-slate-300 dark:border-slate-600'
          }`}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <h2 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            Drop your CV/Resume here
          </h2>
          <p className="text-sm text-slate-500 mb-6">PDF files only, up to 20MB</p>
          <label className="cursor-pointer px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            Choose file
            <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFileInput} />
          </label>
          {error && (
            <p className="mt-4 text-sm text-red-500">{error}</p>
          )}
        </div>
      )}

      {/* Processing step */}
      {step === 'processing' && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <div className="text-center">
            <p className="text-lg font-medium text-slate-900 dark:text-white">Processing {fileName}</p>
            <p className="text-sm text-slate-500 mt-1">Parsing PDF and extracting profile data with AI...</p>
          </div>
        </div>
      )}

      {/* Review step */}
      {step === 'review' && extracted && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Parsed {elementCount} elements · {Object.keys(extracted).filter(k => extracted[k as keyof ExtractedData] !== undefined).length} fields extracted
            </p>
            <button
              onClick={acceptAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Accept all
            </button>
          </div>

          {/* Scalar fields */}
          {(['name', 'headline', 'summary', 'location', 'email'] as const).map(field => {
            const value = extracted[field]
            if (!value) return null
            return (
              <div
                key={field}
                className={`border rounded-xl p-4 transition-colors ${
                  acceptedFields.has(field)
                    ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{field}</span>
                  <button
                    onClick={() => toggleField(field)}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${
                      acceptedFields.has(field)
                        ? 'bg-green-500 text-white'
                        : 'border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-green-400 hover:text-green-600'
                    }`}
                  >
                    {acceptedFields.has(field) ? <><Check className="h-3 w-3" /> Accepted</> : 'Accept'}
                  </button>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{value}</p>
              </div>
            )
          })}

          {/* Employment */}
          {extracted.employment && extracted.employment.length > 0 && (
            <div className={`border rounded-xl p-4 ${
              acceptedFields.has('employment')
                ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
                : 'border-slate-200 dark:border-slate-700'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Employment ({extracted.employment.length} roles)
                </span>
                <button
                  onClick={() => toggleField('employment')}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${
                    acceptedFields.has('employment')
                      ? 'bg-green-500 text-white'
                      : 'border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-green-400'
                  }`}
                >
                  {acceptedFields.has('employment') ? <><Check className="h-3 w-3" /> Accepted</> : 'Accept'}
                </button>
              </div>
              <div className="space-y-2">
                {extracted.employment.map((emp, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-medium text-slate-900 dark:text-white">{emp.job_title} @ {emp.company}</p>
                    {emp.projects && emp.projects.length > 0 && (
                      <p className="text-xs text-slate-500">{emp.projects.length} project(s)</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {extracted.skills && extracted.skills.length > 0 && (
            <div className={`border rounded-xl p-4 ${
              acceptedFields.has('skills')
                ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
                : 'border-slate-200 dark:border-slate-700'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Skills ({extracted.skills.length})
                </span>
                <button
                  onClick={() => toggleField('skills')}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${
                    acceptedFields.has('skills')
                      ? 'bg-green-500 text-white'
                      : 'border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-green-400'
                  }`}
                >
                  {acceptedFields.has('skills') ? <><Check className="h-3 w-3" /> Accepted</> : 'Accept'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {extracted.skills.map((s, i) => (
                  <span key={i} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Merge button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleMerge}
              disabled={acceptedFields.size === 0}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Merge {acceptedFields.size} field{acceptedFields.size !== 1 ? 's' : ''} into master profile
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
