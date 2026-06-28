import type { ReactNode } from 'react';

import { ThemeToggle } from '../theme/theme-toggle';

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="grid min-h-svh bg-[#fdeadc] text-slate-950 dark:bg-slate-950 dark:text-slate-50 lg:grid-cols-[1fr_480px]">
      <section className="hidden border-r border-slate-200 bg-slate-950 p-10 text-white dark:border-slate-800 dark:bg-slate-900 lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-300">Cripto CoinGecko</p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight">
            Dashboard privado para seguir el mercado cripto con datos propios del backend.
          </h1>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm text-slate-300">
          <div className="rounded-lg border border-white/10 p-4">
            <p className="text-2xl font-semibold text-white">10</p>
            <p>criptomonedas top</p>
          </div>
          <div className="rounded-lg border border-white/10 p-4">
            <p className="text-2xl font-semibold text-white">24h</p>
            <p>variación y volumen</p>
          </div>
          <div className="rounded-lg border border-white/10 p-4">
            <p className="text-2xl font-semibold text-white">JWT</p>
            <p>rutas privadas</p>
          </div>
        </div>
      </section>
      <section className="relative flex items-center justify-center p-6">
        <div className="absolute right-6 top-6">
          <ThemeToggle className="hover:cursor-pointer" />
        </div>
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Market Desk</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">{title}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
