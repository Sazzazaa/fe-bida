export type TableStatus = 'available' | 'playing' | 'reserved' | 'maintenance'

export type BilliardTable = {
  id: string
  name: string
  type: string
  pricePerHour: number
  position?: string
  status: TableStatus
}

export type FnbItem = {
  id: string
  name: string
  category: string
  price: number
  imageUrl?: string
  inStock: boolean
}

export type DailyRevenue = { date: string; amount: number }

export type TopTable = { tableId: string; name: string; sessionCount: number }

export type TopFnb = { fnbId: string; name: string; quantitySold: number }

export type RevenueReport = {
  daily: DailyRevenue[]
  totalRevenue: number
  sessionCount: number
  avgPerSession: number
  topTables: TopTable[]
  topFnb: TopFnb[]
}

export type TablePayload = {
  name: string
  type: string
  pricePerHour: number
  position?: string
  status?: TableStatus
}

export type FnbPayload = {
  name: string
  category: string
  price: number
  imageUrl?: string
  inStock?: boolean
}
