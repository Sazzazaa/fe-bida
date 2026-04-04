import type { RevenueReport } from '../types/admin'
import { api } from './api'

export async function getRevenueReport(params: {
  from: string
  to: string
}): Promise<RevenueReport> {
  const { data } = await api.get<RevenueReport>('/admin/revenue', { params })
  return data
}
