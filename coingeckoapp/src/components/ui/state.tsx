import type { ReactNode } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

import { Button } from './button';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-base font-semibold text-slate-950 dark:text-slate-50">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function LoadingState({ label = 'Cargando datos' }: { label?: string; }) {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
        <Loader2 className="h-5 w-5 animate-spin" />
        {label}
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void; }) {
  return (
    <div className="rounded-lg border border-rose-100 bg-rose-50 p-5 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5" />
        <div>
          <h2 className="font-semibold">No se pudo cargar la información</h2>
          <p className="mt-1 text-sm">{message}</p>
          {onRetry ? (
            <Button className="mt-4" onClick={onRetry} variant="secondary">
              Reintentar
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
