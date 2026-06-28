import { Link, useLocation } from 'react-router-dom'
import { Briefcase, FolderOpen, Award, GitBranch, Upload, Settings, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard/experience', label: 'Experience', icon: Briefcase },
  { to: '/dashboard/projects', label: 'Projects', icon: FolderOpen },
  { to: '/dashboard/skills', label: 'Skills', icon: Award },
  { to: '/dashboard/variants', label: 'Variants', icon: GitBranch },
  { to: '/dashboard/import', label: 'Import', icon: Upload },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const { pathname } = useLocation()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
        <div className="px-4 py-5 border-b border-slate-200 dark:border-slate-700">
          <Link to="/" className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-sm text-slate-900 dark:text-white">ds-profile</span>
          </Link>
        </div>
        <nav className="flex flex-col gap-0.5 p-3 flex-1" aria-label="Dashboard navigation">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              aria-label={label}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith(to)
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex" aria-label="Mobile navigation">
        {NAV_ITEMS.slice(0, 5).map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            aria-label={label}
            className={cn(
              'flex flex-col items-center justify-center flex-1 py-2 text-xs gap-1 transition-colors',
              pathname.startsWith(to)
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
