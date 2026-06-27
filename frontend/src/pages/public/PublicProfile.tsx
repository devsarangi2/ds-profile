import { useProfile, useEmployment, useSkills, useCertifications } from '@/hooks/useProfile'
import { MapPin, Mail, Globe, Link2, Calendar, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SkeletonCard } from '@/components/ui/SkeletonCard'

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function groupByCategory(skills: { category?: string; name: string }[]) {
  const groups: Record<string, string[]> = {}
  for (const s of skills) {
    const cat = s.category ?? 'Other'
    ;(groups[cat] ??= []).push(s.name)
  }
  return groups
}

export function PublicProfile() {
  const { data: profile, isLoading: profileLoading } = useProfile()
  const { data: employment = [] } = useEmployment()
  const { data: skills = [] } = useSkills()
  const { data: certifications = [] } = useCertifications()

  if (profileLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 space-y-4 py-8">
        <SkeletonCard className="h-40" />
        <SkeletonCard className="h-24" />
        <SkeletonCard className="h-64" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div data-testid="public-profile" className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        <p>Profile not found.</p>
      </div>
    )
  }

  const skillGroups = groupByCategory(skills)
  const recentJobs = employment.slice(0, 3)

  return (
    <div data-testid="public-profile" className="max-w-4xl mx-auto px-4 pb-16">
      {/* Cover + Avatar */}
      <div className="relative mb-16">
        <div
          className="h-48 rounded-b-xl bg-gradient-to-r from-blue-600 to-indigo-700"
          style={profile.cover_url ? { backgroundImage: `url(${profile.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        />
        <div className="absolute -bottom-12 left-6">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="h-24 w-24 rounded-full border-4 border-white dark:border-slate-950 object-cover"
            />
          ) : (
            <div className="h-24 w-24 rounded-full border-4 border-white dark:border-slate-950 bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
              {profile.name.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* Name / Headline */}
      <div className="px-2 space-y-1">
        <h1 data-testid="profile-name" className="text-2xl font-bold text-slate-900 dark:text-white">
          {profile.name}
        </h1>
        {profile.headline && (
          <p data-testid="profile-headline" className="text-lg text-slate-600 dark:text-slate-300">
            {profile.headline}
          </p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 pt-1">
          {profile.location && (
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{profile.location}</span>
          )}
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="flex items-center gap-1 hover:text-blue-600">
              <Mail className="h-3.5 w-3.5" />{profile.email}
            </a>
          )}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600">
              <Globe className="h-3.5 w-3.5" />Website
            </a>
          )}
          {profile.linkedin_url && (
            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600">
              <Link2 className="h-3.5 w-3.5" />LinkedIn
            </a>
          )}
        </div>
      </div>

      {/* About */}
      {profile.summary && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">About</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{profile.summary}</p>
        </section>
      )}

      {/* Recent Experience */}
      {employment.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Experience</h2>
          <div className="space-y-4">
            {recentJobs.map(job => (
              <div key={job.id} data-testid="employment-card" className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  {job.company_logo_url ? (
                    <img src={job.company_logo_url} alt={job.company} className="h-10 w-10 rounded object-contain" />
                  ) : (
                    <div className="h-10 w-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                      {job.company.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-slate-900 dark:text-white">{job.job_title}</h3>
                      <Badge variant="secondary">{job.employment_type}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{job.company}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {formatDate(job.start_date)} — {job.current ? 'Present' : formatDate(job.end_date)}
                    </p>
                    {job.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">{job.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {Object.keys(skillGroups).length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Skills</h2>
          <div className="space-y-3">
            {Object.entries(skillGroups).map(([cat, names]) => (
              <div key={cat}>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">{cat}</p>
                <div className="flex flex-wrap gap-2">
                  {names.map(name => (
                    <Badge key={name} variant="outline">{name}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Certifications</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {certifications.map(cert => (
              <div key={cert.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex gap-3">
                {cert.badge_url && (
                  <img src={cert.badge_url} alt={cert.name} className="h-10 w-10 object-contain rounded" />
                )}
                <div>
                  <p className="font-medium text-sm text-slate-900 dark:text-white">{cert.name}</p>
                  {cert.issuer && <p className="text-xs text-slate-500">{cert.issuer}</p>}
                  {cert.date && <p className="text-xs text-slate-400">{formatDate(cert.date)}</p>}
                  {cert.url && (
                    <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 flex items-center gap-0.5 mt-0.5">
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
