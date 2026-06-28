import { useState, useRef, useEffect, useCallback } from 'react'
import { Loader2, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InlineEditProps {
  value: string
  onSave: (newValue: string) => Promise<void>
  multiline?: boolean
  placeholder?: string
  className?: string
  testId?: string
}

export function InlineEdit({
  value,
  onSave,
  multiline = false,
  placeholder = 'Click to edit...',
  className,
  testId,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep draft in sync when value prop changes externally
  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      // Put cursor at end
      const len = draft.length
      inputRef.current?.setSelectionRange(len, len)
    }
  }, [editing])

  const cancelEdit = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    setDraft(value)
    setEditing(false)
    setError(null)
  }, [value])

  const triggerSave = useCallback(
    async (newValue: string) => {
      if (newValue === value) {
        setEditing(false)
        return
      }
      setSaving(true)
      setError(null)
      try {
        await onSave(newValue)
        setEditing(false)
      } catch {
        setError('Failed to save. Try again.')
      } finally {
        setSaving(false)
      }
    },
    [value, onSave]
  )

  const scheduleSave = useCallback(
    (newValue: string) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => triggerSave(newValue), 500)
    },
    [triggerSave]
  )

  const handleBlur = () => {
    if (!saving) {
      scheduleSave(draft)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      cancelEdit()
      return
    }
    if (!multiline && e.key === 'Enter') {
      e.preventDefault()
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      triggerSave(draft)
    }
  }

  if (editing) {
    const sharedProps = {
      ref: inputRef as React.Ref<HTMLInputElement & HTMLTextAreaElement>,
      value: draft,
      placeholder,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setDraft(e.target.value),
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      disabled: saving,
      className: cn(
        'w-full rounded-md border border-blue-400 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50',
        className
      ),
    }

    return (
      <div className="relative">
        {multiline ? (
          <textarea {...sharedProps} rows={4} />
        ) : (
          <input type="text" {...sharedProps} />
        )}
        {saving && (
          <div data-testid="save-indicator" className="absolute right-2 top-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          </div>
        )}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  }

  return (
    <div
      data-testid={testId}
      role="button"
      tabIndex={0}
      onClick={() => setEditing(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') setEditing(true)
      }}
      className={cn(
        'group relative cursor-text rounded-md px-3 py-2 text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors min-h-[36px]',
        !value && 'text-slate-400',
        className
      )}
    >
      {value || placeholder}
      <span className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Pencil className="h-3.5 w-3.5 text-slate-400" />
      </span>
    </div>
  )
}
