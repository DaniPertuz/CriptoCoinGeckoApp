import { Moon, Sun } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { cn } from '../../lib/utils'
import { useTheme } from './use-theme'

interface ThemeToggleProps {
  showLabel?: boolean
  className?: string
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const Icon = isDark ? Sun : Moon
  const label = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'

  return (
    <Button
      aria-label={label}
      className={cn(showLabel ? 'whitespace-nowrap' : 'h-10 w-10 px-0', className)}
      onClick={toggleTheme}
      title={label}
      variant="secondary"
    >
      <Icon className="h-4 w-4" />
      {showLabel ? <span>{isDark ? 'Modo claro' : 'Modo oscuro'}</span> : null}
    </Button>
  )
}
