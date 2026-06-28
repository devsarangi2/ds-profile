import { Link } from 'react-router-dom'
import { Moon, Sun, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

export function TopNav() {
  const { theme, toggle } = useTheme()

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between px-4 shrink-0">
      <div className="text-sm text-slate-500 dark:text-slate-400">Dashboard</div>
      <div className="flex items-center gap-2">
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View public profile"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
        <Button variant="ghost" size="sm" onClick={toggle} aria-label="Toggle dark mode">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  )
}
