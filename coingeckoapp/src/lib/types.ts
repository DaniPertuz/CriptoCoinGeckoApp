export type UserRole = 'user' | 'admin'
export type UserProvider = 'password' | 'google' | 'password_google'

export interface User {
  id: string
  name: string
  email: string
  provider: UserProvider
  googleId: string | null
  avatarUrl: string | null
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface CreateUserPayload extends RegisterPayload {
  role: UserRole
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  password?: string
  role?: UserRole
  avatarUrl?: string | null
}

export interface CryptoMarketCoin {
  id: string
  symbol: string
  name: string
  image: string
  currentPrice: number
  marketCap: number
  marketCapRank: number
  totalVolume: number
  priceChangePercentage1h: number | null
  priceChangePercentage24h: number | null
  priceChangePercentage7d: number | null
  sparkline7d: number[]
  lastUpdated: string
}

export interface GlobalMarketKpis {
  activeCryptocurrencies: number
  markets: number
  totalMarketCap: number
  totalVolume: number
  marketCapChangePercentage24hUsd: number
  dominance: Array<{
    symbol: string
    percentage: number
  }>
  updatedAt: string
}

export interface MarketChartPoint {
  timestamp: number
  value: number
}

export interface CryptoMarketChart {
  id: string
  vsCurrency: string
  days: number | string
  prices: MarketChartPoint[]
  marketCaps: MarketChartPoint[]
  totalVolumes: MarketChartPoint[]
  lastUpdated: string
}

export interface DashboardSummary {
  topCryptocurrencies: CryptoMarketCoin[]
  kpis: GlobalMarketKpis
  charts: Array<{
    id: string
    symbol: string
    name: string
    sparkline7d: number[]
  }>
  lastUpdated: string
}

export interface ApiSuccess<TData> {
  success: true
  data: TData
  meta?: Record<string, unknown>
}

export interface ApiFailure {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}
