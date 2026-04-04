import type { BilliardTable, TablePayload } from '../types/admin'
import { normalizeListResponse } from '../utils/normalizeListResponse'
import { api } from './api'

export async function getTables(): Promise<BilliardTable[]> {
  const { data } = await api.get<unknown>('/tables')
  return normalizeListResponse<BilliardTable>(data)
}

export async function createTable(payload: TablePayload): Promise<BilliardTable> {
  const { data } = await api.post<BilliardTable>('/tables', payload)
  return data
}

export async function updateTable(
  id: string,
  payload: Partial<TablePayload>,
): Promise<BilliardTable> {
  const { data } = await api.patch<BilliardTable>(`/tables/${id}`, payload)
  return data
}

export async function deleteTable(id: string): Promise<void> {
  await api.delete(`/tables/${id}`)
}
