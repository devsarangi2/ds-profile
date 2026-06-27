import { X, RefreshCw, Check } from 'lucide-react'

interface ImproveSuggestionModalProps {
  original: string
  suggestion: string
  onAccept: (value: string) => void
  onRetry: () => void
  onClose: () => void
}

export function ImproveSuggestionModal({
  original,
  suggestion,
  onAccept,
  onRetry,
  onClose,
}: ImproveSuggestionModalProps) {
  return (
    <div
      data-testid="ai-suggestion-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="AI Suggestion"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400">✨</span>
            <h2 className="font-semibold text-slate-900 dark:text-white">AI Suggestion</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Original */}
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Original</p>
            <div
              data-testid="original-text"
              className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed min-h-[120px]"
            >
              {original}
            </div>
          </div>

          {/* Suggested */}
          <div>
            <p className="text-xs font-medium text-purple-500 uppercase tracking-wide mb-2">Suggested</p>
            <div
              data-testid="suggested-text"
              className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-sm text-slate-900 dark:text-white leading-relaxed min-h-[120px]"
            >
              {suggestion}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Dismiss
          </button>
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
          <button
            onClick={() => onAccept(suggestion)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Check className="h-3.5 w-3.5" />
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
