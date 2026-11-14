import axios, { AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'
import {
  AppError,
  ExternalApiError,
  NotFoundError,
  UnauthorizedError
} from '../../main/utils/app-errors'

// Pull a readable message out of whatever shape the server returned
const extractServerMessage = (data: unknown): string => {
  if (!data) return ''
  if (typeof data === 'string') return data.slice(0, 500)
  try {
    return JSON.stringify(data).slice(0, 500)
  } catch {
    return ''
  }
}

export const apiClient = (): AxiosInstance => {
  const baseURL = process.env.EXTERNAL_API_BASE_URL
  const username = process.env.EXTERNAL_API_USERNAME
  const password = process.env.EXTERNAL_API_PASSWORD

  // fail at startup instead of sending an empty Basic auth header
  if (!baseURL || !username || !password) {
    throw new Error(
      'Missing EXTERNAL_API_BASE_URL / EXTERNAL_API_USERNAME / EXTERNAL_API_PASSWORD. ' +
        'Check that dotenv is loaded before bootstrapContainer().'
    )
  }

  const client = axios.create({
    baseURL,
    timeout: 60_000,
    headers: { Accept: 'application/json' },
    // Basic auth: axios builds the "Authorization: Basic base64(user:pass)" header
    auth: { username, password }
  })

  // Retry on network errors, 5xx on idempotent requests, and 429
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
      const serverMessage = extractServerMessage(error.response?.data)
      const options = { cause: error }

      if (serverMessage) {
        console.error(
          `[API ${error.config?.method?.toUpperCase()} ${error.config?.url}] ${status}: ${serverMessage}`
        )
      }

      if (status === 401 || status === 403)
        return Promise.reject(new UnauthorizedError('API authentication failed', options))
      if (status === 404)
        return Promise.reject(new NotFoundError('API resource not found', options))
      if (status)
        return Promise.reject(
          new ExternalApiError(
            serverMessage
              ? `API responded with ${status}: ${serverMessage}`
              : `API responded with ${status}`,
            options
          )
        )
      if (error.code === 'ECONNABORTED')
        return Promise.reject(new ExternalApiError('API timeout', options))

      return Promise.reject(new ExternalApiError('API unreachable', options))
    }
  )

  return client
}
