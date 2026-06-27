import { useState } from 'react'
import { Plus, X, Tag } from 'lucide-react'
import { useSkills } from '@/hooks/useProfile'
import { useCreateSkill, useDeleteSkill } from '@/hooks/useSkillMutations'

interface Skill {
  id: string
  name: string
  category?: string
}

function groupSkills(skills: Skill[]): Record<string, Skill[]> {
  const groups: Record<string, Skill[]> = {}
  for (const skill of skills) {
    const cat = skill.category ?? 'Other'
    ;(groups[cat] ??= []).push(skill)
  }
  return groups
}

export function SkillsManager() {
  const { data: skills = [], isLoading } = useSkills()
  const createSkill = useCreateSkill()
  const deleteSkill = useDeleteSkill()
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [error, setError] = useState<string | null>(null)

  const grouped = groupSkills(skills)
  const categories = Object.keys(grouped).sort()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setError(null)
    try {
      await createSkill.mutateAsync({
        name,
        category: newCategory.trim() || undefined,
      })
      setNewName('')
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } }
      setError(axiosError?.response?.data?.detail ?? 'Failed to add skill')
    }
  }

  const handleDelete = (id: string) => {
    deleteSkill.mutate(id)
  }

  return (
    <div data-testid="skills-manager">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Skills</h1>
        <span className="text-sm text-slate-500">
          {skills.length} skill{skills.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Add skill form */}
      <form
        onSubmit={handleAdd}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-6"
      >
        <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Add Skill</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Skill name (e.g. TypeScript)"
            aria-label="Skill name"
            className="flex-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
          />
          <input
            type="text"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            placeholder="Category (e.g. Languages)"
            aria-label="Category"
            className="flex-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={!newName.trim() || createSkill.isPending}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </form>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-24 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && skills.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <Tag className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No skills yet. Add your first skill above.</p>
        </div>
      )}

      {/* Grouped skills */}
      <div className="space-y-4">
        {categories.map(category => (
          <div
            key={category}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4"
          >
            <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
              {category}
            </h2>
            <div className="flex flex-wrap gap-2">
              {grouped[category].map(skill => (
                <span
                  key={skill.id}
                  className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm px-3 py-1 rounded-full"
                >
                  {skill.name}
                  <button
                    onClick={() => handleDelete(skill.id)}
                    className="hover:text-red-500 transition-colors"
                    aria-label={`Remove ${skill.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
