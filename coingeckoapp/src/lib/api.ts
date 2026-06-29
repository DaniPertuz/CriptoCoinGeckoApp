import { clearStoredToken, getStoredToken } from './auth-storage'
import type {
  ApiFailure,
  ApiSuccess,
  AuthResponse,
  CreateUserPayload,
  CryptoMarketChart,
  DashboardSummary,
  LoginPayload,
  RegisterPayload,
  UpdateUserPayload,
  User,
} from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'

export class ApiError extends Error {
  status: number
  code: string
  details?: unknown

  constructor(message: string, status: number, code = 'API_ERROR', details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  auth?: boolean
}

function buildUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}

async function request<TData>(path: string, options: RequestOptions = {}): Promise<TData> {
  const token = getStoredToken()
  const headers = new Headers(options.headers)

  headers.set('Accept', 'application/json')

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.auth !== false && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (response.status === 401) {
    clearStoredToken()
    window.dispatchEvent(new Event('auth:unauthorized'))
  }

  const text = await response.text()
  const payload = text ? (JSON.parse(text) as ApiSuccess<TData> | ApiFailure) : null

  if (!response.ok || payload?.success === false) {
    const failure = payload?.success === false ? payload.error : undefined
    throw new ApiError(
      failure?.message ?? 'Request failed',
      response.status,
      failure?.code,
      failure?.details,
    )
  }

  if (!payload || payload.success !== true) {
    return undefined as TData
  }

  return payload.data
}

export const api = {
  login: (payload: LoginPayload) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: payload,
      auth: false,
    }),
  register: (payload: RegisterPayload) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: payload,
      auth: false,
    }),
  googleLogin: (idToken: string) =>
    request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: { idToken },
      auth: false,
    }),
  me: () => request<User>('/auth/me'),
  dashboard: () =>
    request<DashboardSummary>('/cryptocurrencies/dashboard?limit=10&vsCurrency=usd', {
      auth: false,
    }),
  marketChart: (id: string, days = 7) =>
    request<CryptoMarketChart>(
      `/cryptocurrencies/${encodeURIComponent(id)}/market-chart?days=${days}&vsCurrency=usd`,
      {
        auth: false,
      },
    ),
  users: () => request<User[]>('/users'),
  createUser: (payload: CreateUserPayload) =>
    request<User>('/users', {
      method: 'POST',
      body: payload,
    }),
  updateUser: (id: string, payload: UpdateUserPayload) =>
    request<User>(`/users/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: payload,
    }),
  deleteUser: (id: string) =>
    request<void>(`/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
}
