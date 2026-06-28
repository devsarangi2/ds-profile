import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/nav/Sidebar'
import { TopNav } from '@/components/nav/TopNav'

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopNav />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
