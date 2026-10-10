import { config } from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 加载 server 根目录下的 .env
config({ path: path.resolve(__dirname, '../../.env') })

function required(name: string): string {
  const val = process.env[name]
  if (!val) {
    throw new Error(`环境变量 ${name} 未设置，请复制 .env.example 为 .env`)
  }
  return val
}

export const env = {
  PORT: Number(process.env.PORT || 3000),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: Number(process.env.JWT_EXPIRES_IN || 604800),
  DB_PATH: process.env.DB_PATH || './data/trouble.db',
} as const
