import dotenv from 'dotenv'
import { resolve } from 'node:path'

const envPath = resolve(process.cwd(), '.env')

const result = dotenv.config({ path: envPath })

if (result.error) {
  throw new Error(`Failed to load .env file at ${envPath}: ${result.error.message}`)
}

console.log('Loaded env file:', envPath)
console.log('Parsed environment keys:', Object.keys(result.parsed ?? {}))

function requiredEnv(key: string): string {
  const value = process.env[key]

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }

  return value
}

export const envConfig = {
  dbHost: process.env.DB_HOST ?? 'localhost',
  dbPort: Number(process.env.DB_PORT ?? 3306),
  dbUser: requiredEnv('DB_USER'),
  dbPassword: requiredEnv('DB_PASSWORD'),
  dbName: requiredEnv('DB_NAME')
}
