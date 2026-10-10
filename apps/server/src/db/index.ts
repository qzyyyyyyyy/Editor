import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync } from 'node:fs'
import { env } from '../config/env.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 解析数据库文件路径（相对 server 根目录）
const dbPath = path.isAbsolute(env.DB_PATH)
  ? env.DB_PATH
  : path.resolve(__dirname, '../../', env.DB_PATH)

// 确保 data 目录存在
const dbDir = path.dirname(dbPath)
mkdirSync(dbDir, { recursive: true })

export const db = new DatabaseSync(dbPath)

// 开启外键约束
db.exec('PRAGMA foreign_keys = ON')
// WAL 模式提升并发读性能
db.exec('PRAGMA journal_mode = WAL')
