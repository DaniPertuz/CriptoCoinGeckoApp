import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'

import { ProtectedRoute } from './protected-route'
import { PublicRoute } from './public-route'
import { PrivateLayout } from './private-layout'
import { LoginPage } from '../features/auth/login-page'
import { RegisterPage } from '../features/auth/register-page'
import { DashboardPage } from '../features/dashboard/dashboard-page'
import { UsersPage } from '../features/users/users-page'

const router = createBrowserRouter([
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
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
