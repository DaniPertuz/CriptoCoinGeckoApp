import { beforeEach, describe, expect, it } from 'vitest'

import { clearStoredToken, getStoredToken, setStoredToken } from './auth-storage'

describe('auth storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('stores and clears the JWT token', () => {
    setStoredToken('jwt-token')
    expect(getStoredToken()).toBe('jwt-token')

    clearStoredToken()
    expect(getStoredToken()).toBeNull()
  })
})
