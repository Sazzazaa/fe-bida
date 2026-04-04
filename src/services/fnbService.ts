import type { FnbItem, FnbPayload } from '../types/admin'
import { normalizeListResponse } from '../utils/normalizeListResponse'
import { api } from './api'

export async function getFnbItems(params?: {
  category?: string
}): Promise<FnbItem[]> {
  const { data } = await api.get<unknown>('/fnb', { params })
  return normalizeListResponse<FnbItem>(data)
}

export async function createFnbItem(payload: FnbPayload): Promise<FnbItem> {
  const { data } = await api.post<FnbItem>('/fnb', payload)
  return data
}

export async function updateFnbItem(
  id: string,
  payload: Partial<FnbPayload>,
): Promise<FnbItem> {
  const { data } = await api.patch<FnbItem>(`/fnb/${id}`, payload)
  return data
}

export async function deleteFnbItem(id: string): Promise<void> {
  await api.delete(`/fnb/${id}`)
}
