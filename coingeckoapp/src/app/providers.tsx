import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { Toaster } from 'sonner'

import { AuthProvider } from '../features/auth/auth-context'
import { ThemeProvider } from '../features/theme/theme-context'
import { useTheme } from '../features/theme/use-theme'

function AppToaster() {
  const { theme } = useTheme()

  return <Toaster richColors position="top-right" theme={theme} />
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          {children}
          <AppToaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
