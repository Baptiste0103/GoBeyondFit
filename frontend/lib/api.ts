const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api'

export interface ApiRequestOptions extends RequestInit {
  headers?: HeadersInit
}

export async function apiCall<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // Get auth token from localStorage if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(error.message || `API error: ${response.status}`)
  }

  return response.json()
}

export const api = {
  get: <T,>(endpoint: string, options?: ApiRequestOptions) =>
    apiCall<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T,>(endpoint: string, data?: any, options?: ApiRequestOptions) =>
    apiCall<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: <T,>(endpoint: string, data?: any, options?: ApiRequestOptions) =>
    apiCall<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: <T,>(endpoint: string, options?: ApiRequestOptions) =>
    apiCall<T>(endpoint, { ...options, method: 'DELETE' }),
}
