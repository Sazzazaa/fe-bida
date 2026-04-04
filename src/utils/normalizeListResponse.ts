const LIST_KEYS = [
  'data',
  'items',
  'tables',
  'results',
  'content',
  'payload',
  'records',
] as const

/**
 * Backend co the tra mang truc tiep hoac goi trong { data: [...] }, { items: [...] }, v.v.
 */
export function normalizeListResponse<T>(body: unknown): T[] {
  if (Array.isArray(body)) return body as T[]
  if (body && typeof body === 'object') {
    const o = body as Record<string, unknown>
    for (const key of LIST_KEYS) {
      const v = o[key]
      if (Array.isArray(v)) return v as T[]
    }
  }
  return []
}
