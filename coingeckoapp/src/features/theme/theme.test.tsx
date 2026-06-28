import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { ThemeProvider } from './theme-context'
import { THEME_STORAGE_KEY } from './theme-storage'
import { ThemeToggle } from './theme-toggle'
import { useTheme } from './use-theme'

function ThemeValue() {
  const { theme } = useTheme()

  return <span>{theme}</span>
}

describe('theme', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = ''
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = ''
  })

  function renderTheme(children: ReactNode) {
    act(() => {
      root.render(<ThemeProvider>{children}</ThemeProvider>)
    })
  }

  async function clickThemeToggle() {
    const button = container.querySelector('button')

    if (!button) {
      throw new Error('Theme toggle button was not rendered')
    }

    await act(async () => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
  }

  it('starts in light mode by default', () => {
    renderTheme(<ThemeValue />)

    expect(container.textContent).toContain('light')
    expect(document.documentElement).not.toHaveClass('dark')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
  })

  it('restores dark mode from localStorage', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')

    renderTheme(<ThemeValue />)

    expect(container.textContent).toContain('dark')
    expect(document.documentElement).toHaveClass('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('toggles between light and dark mode', async () => {
    renderTheme(
      <>
        <ThemeToggle showLabel />
        <ThemeValue />
      </>,
    )

    expect(container.querySelector('button')).toHaveAttribute('aria-label', 'Cambiar a modo oscuro')

    await clickThemeToggle()

    expect(container.textContent).toContain('dark')
    expect(document.documentElement).toHaveClass('dark')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(container.querySelector('button')).toHaveAttribute('aria-label', 'Cambiar a modo claro')

    await clickThemeToggle()

    expect(container.textContent).toContain('light')
    expect(document.documentElement).not.toHaveClass('dark')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
  })
})
