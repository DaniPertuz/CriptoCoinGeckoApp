import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { LoadingState } from '../components/ui/state';
import { useAuth } from '../features/auth/use-auth';

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="min-h-svh bg-[#fdeadc] p-6 dark:bg-slate-950">
        <LoadingState label="Restaurando sesión" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}
