import axios from 'axios'

export function getErrorMessage(error: unknown, fallback = 'Da co loi xay ra'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
    if (error.message) return error.message
  }
  if (error instanceof Error) return error.message
  return fallback
}
