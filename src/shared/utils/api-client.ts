import axios, { AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'
import {
  AppError,
  ExternalApiError,
  NotFoundError,
  UnauthorizedError
} from '../../main/utils/app-errors'

export const apiClient = (): AxiosInstance => {
  const baseURL = process.env.EXTERNAL_API_BASE_URL
  if (!baseURL) throw new Error('Missing EXTERNAL_API_BASE_URL')

  const client = axios.create({
    baseURL,
    timeout: 60_000,
    headers: { Accept: 'application/json' }
  })

  // Add Bearer token to every request
  client.interceptors.request.use((config) => {
    const token = process.env.EXTERNAL_API_TOKEN // replace later with your login flow
    if (!token) throw new UnauthorizedError('No access token available')
    config.headers.set('Authorization', `Bearer ${token}`)
    return config
  })

  // Retry on network errors and 429
  axiosRetry(client, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) =>
      axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429
  })

  // Convert axios errors into your AppError types
  client.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error instanceof AppError) return Promise.reject(error)

      const status = error.response?.status
      const options = { cause: error }

      if (status === 401 || status === 403)
        return Promise.reject(new UnauthorizedError('API authentication failed', options))
      if (status === 404)
        return Promise.reject(new NotFoundError('API resource not found', options))
      if (status)
        return Promise.reject(new ExternalApiError(`API responded with ${status}`, options))
      if (error.code === 'ECONNABORTED')
        return Promise.reject(new ExternalApiError('API timeout', options))

      return Promise.reject(new ExternalApiError('API unreachable', options))
    }
  )

  return client
}
