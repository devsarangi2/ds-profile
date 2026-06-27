import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, X, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { InlineEdit } from '@/components/ui/InlineEdit'
import { ImproveButton } from '@/components/ai/ImproveButton'
import { useSingleProject, useUpdateProject, useDeleteProject, useAddRole, useRemoveRole } from '@/hooks/useProjectMutations'
import type { Project } from '@/hooks/useProfile'

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: project, isLoading } = useSingleProject(id!)
  const updateProject = useUpdateProject(id!)
  const deleteProject = useDeleteProject()
  const addRole = useAddRole(id!)
  const removeRole = useRemoveRole(id!)
  const [newRole, setNewRole] = useState('')
  const [newTech, setNewTech] = useState('')

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />)}
      </div>
    )
  }

  if (!project) {
    return <div className="text-slate-500 py-16 text-center">Project not found.</div>
  }

  const handleSaveField = (field: string) => async (value: string) => {
    await updateProject.mutateAsync({ [field]: value } as Partial<Project>)
  }

  const handleAddRole = async () => {
    const trimmed = newRole.trim()
    if (!trimmed) return
    await addRole.mutateAsync(trimmed)
    setNewRole('')
  }

  const handleAddTech = async () => {
    const trimmed = newTech.trim()
    if (!trimmed) return
    const updated = [...(project.tech_stack || []), trimmed]
    await updateProject.mutateAsync({ tech_stack: updated })
    setNewTech('')
  }

  const handleRemoveTech = async (tech: string) => {
    const updated = project.tech_stack.filter(t => t !== tech)
    await updateProject.mutateAsync({ tech_stack: updated })
  }

  return (
    <div data-testid="project-detail">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard/projects" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex-1">Project Detail</h1>
        <button
          onClick={() => {
            if (window.confirm('Delete this project?')) {
              deleteProject.mutate(project.id, { onSuccess: () => navigate('/dashboard/projects') })
            }
          }}
          className="text-slate-400 hover:text-red-500 p-1"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Project Name</label>
          <InlineEdit value={project.name} onSave={handleSaveField('name')} />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Description</label>
          <InlineEdit value={project.description ?? ''} onSave={handleSaveField('description')} multiline placeholder="Add a description..." />
          <div className="px-3">
            <ImproveButton
              text={project.description ?? ''}
              context={`Project: ${project.name}`}
              onAccept={async (suggestion) => {
                await updateProject.mutateAsync({ description: suggestion })
              }}
            />
          </div>
        </div>

        {/* Impact */}
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Impact</label>
          <InlineEdit value={project.impact ?? ''} onSave={handleSaveField('impact')} multiline placeholder="e.g. Reduced deployment time by 40%..." />
          <div className="px-3">
            <ImproveButton
              text={project.impact ?? ''}
              context={`Impact for project: ${project.name}`}
              onAccept={async (suggestion) => {
                await updateProject.mutateAsync({ impact: suggestion })
              }}
            />
          </div>
        </div>

        {/* Roles */}
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Roles</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {project.roles.map(role => (
              <span key={role.id} className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm px-3 py-1 rounded-full">
                {role.name}
                <button
                  onClick={() => removeRole.mutate(role.id)}
                  className="hover:text-red-500 ml-1"
                  aria-label={`Remove role ${role.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddRole() } }}
              placeholder="Add role (e.g. Enterprise Architect)"
              className="flex-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm"
            />
            <button
              onClick={handleAddRole}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Tech Stack</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(project.tech_stack || []).map(tech => (
              <span key={tech} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm px-3 py-1 rounded-full">
                {tech}
                <button
                  onClick={() => handleRemoveTech(tech)}
                  className="hover:text-red-500 ml-1"
                  aria-label={`Remove ${tech}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTech}
              onChange={e => setNewTech(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTech() } }}
              placeholder="Add technology (e.g. React)"
              className="flex-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm"
            />
            <button
              onClick={handleAddTech}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-600 text-white rounded-md hover:bg-slate-700"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Status</label>
          <Badge variant="secondary">{project.status}</Badge>
        </div>
      </div>
    </div>
  )
}
