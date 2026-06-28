import { Outlet, Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

export function PublicLayout() {
  const { theme, toggle } = useTheme()

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <header className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <nav className="flex gap-6 text-sm text-slate-600 dark:text-slate-400">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium">Profile</Link>
          <Link to="/experience" className="hover:text-blue-600 dark:hover:text-blue-400">Experience</Link>
          <Link to="/projects" className="hover:text-blue-600 dark:hover:text-blue-400">Projects</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggle} aria-label="Toggle dark mode">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Link
            to="/dashboard"
            className={cn(buttonVariants({ size: 'sm' }))}
          >
            Dashboard
          </Link>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
