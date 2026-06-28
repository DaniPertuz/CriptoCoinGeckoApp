import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';

import { ProtectedRoute } from './protected-route';
import { PublicRoute } from './public-route';
import { PrivateLayout } from './private-layout';
import { LoginPage } from '../features/auth/login-page';
import { RegisterPage } from '../features/auth/register-page';
import { DashboardPage } from '../features/dashboard/dashboard-page';
import { UsersPage } from '../features/users/users-page';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Navigate replace to="/dashboard" />,
    },
    {
      path: '/login',
      element: (
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      ),
    },
    {
      path: '/register',
      element: (
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      ),
    },
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <PrivateLayout />,
          children: [
            {
              path: '/dashboard',
              element: <DashboardPage />,
            },
            {
              path: '/users',
              element: <UsersPage />,
            },
          ],
        },
      ],
    },
    {
      path: '*',
      element: <Navigate replace to="/dashboard" />,
    },
  ],
  {
    basename,
  },
);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
