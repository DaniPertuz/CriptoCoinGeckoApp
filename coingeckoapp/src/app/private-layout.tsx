import { BarChart3, LogOut, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../features/auth/use-auth';
import { ThemeToggle } from '../features/theme/theme-toggle';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/users', label: 'Usuarios', icon: Users },
];

export function PrivateLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-svh bg-[#fdeadc] text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:block">
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cripto CoinGecko</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">Market Desk</h1>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-200 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
                  isActive && 'border border-[#f1c8b4] bg-[#fdeadc] text-slate-950 hover:bg-[#fdeadc] dark:border-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-100',
                )
              }
              key={item.to}
              to={item.to}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav className="flex gap-2 lg:hidden">
              {navItems.map((item) => (
                <NavLink
                  className={({ isActive }) =>
                    cn(
                      'inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-slate-600 dark:text-slate-300',
                      isActive && 'border border-[#f1c8b4] bg-[#fdeadc] text-slate-950 dark:border-slate-700 dark:bg-slate-100 dark:text-slate-950',
                    )
                  }
                  key={item.to}
                  to={item.to}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
              {user?.role ? <Badge tone={user.role === 'admin' ? 'success' : 'neutral'}>{user.role}</Badge> : null}
              <ThemeToggle className='hover:cursor-pointer' />
              <Button onClick={logout} variant="secondary" className='hover:cursor-pointer'>
                <LogOut className="h-4 w-4" />
                Salir
              </Button>
            </div>
          </div>
        </header>
        <main className="min-w-0 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
