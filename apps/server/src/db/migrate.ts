import bcrypt from 'bcryptjs'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { db } from './index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const schemaPath = path.resolve(__dirname, './schema.sql')

// 一次性执行建表 DDL（IF NOT EXISTS 保证幂等）
const schema = readFileSync(schemaPath, 'utf-8')
db.exec(schema)

console.log('[db] 数据库迁移完成')

// 写入一条种子用户（admin / 123456），方便联调
const seedUser = db
  .prepare('SELECT id FROM users WHERE username = ?')
  .get('admin')

if (!seedUser) {
  db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(
    'admin',
    bcrypt.hashSync('123456', 10)
  )
  console.log('[db] 种子用户已创建: admin / 123456')
}
