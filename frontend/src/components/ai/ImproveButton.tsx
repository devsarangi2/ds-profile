import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { ImproveSuggestionModal } from './ImproveSuggestionModal'
import { api } from '@/lib/api'

interface ImproveButtonProps {
  text: string
  context?: string
  onAccept: (suggestion: string) => void
}

export function ImproveButton({ text, context = '', onAccept }: ImproveButtonProps) {
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/ai/improve', { text, context })
      setSuggestion(res.data.suggestion)
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'AI service unavailable')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = (value: string) => {
    onAccept(value)
    setSuggestion(null)
  }

  const handleRetry = async () => {
    setSuggestion(null)
    await handleClick()
  }

  return (
    <>
      <button
        data-testid="improve-ai-btn"
        onClick={handleClick}
        disabled={loading || !text.trim()}
        className="inline-flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title="Improve with AI"
      >
        <Sparkles className={`h-3.5 w-3.5 ${loading ? 'animate-pulse' : ''}`} />
        {loading ? 'Thinking...' : 'Improve with AI'}
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
      {suggestion !== null && (
        <ImproveSuggestionModal
          original={text}
          suggestion={suggestion}
          onAccept={handleAccept}
          onRetry={handleRetry}
          onClose={() => setSuggestion(null)}
        />
      )}
    </>
  )
}
