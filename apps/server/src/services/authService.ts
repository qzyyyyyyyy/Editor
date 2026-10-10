import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../db/index.js'
import { env } from '../config/env.js'
import type { LoginResponse } from '@trouble/shared'

interface UserRow {
  id: number
  username: string
  password_hash: string
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

// 登录：校验用户名密码，返回 JWT
export function login(username: string, password: string): LoginResponse {
  const user = db
    .prepare('SELECT id, username, password_hash FROM users WHERE username = ?')
    .get(username) as UserRow | undefined

  if (!user) {
    throw new AuthError('用户不存在，请先注册')
  }
  if (!bcrypt.compareSync(password, user.password_hash)) {
    throw new AuthError('密码错误')
  }

  const token = jwt.sign(
    { sub: user.id, username: user.username },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  )

  return { token, username: user.username }
}

// 注册
export function register(username: string, password: string): void {
  if (!username || !password) {
    throw new AuthError('用户名和密码不能为空')
  }
  if (username.length < 2) {
    throw new AuthError('用户名至少 2 个字符')
  }
  if (password.length < 4) {
    throw new AuthError('密码至少 4 位')
  }

  const exists = db
    .prepare('SELECT id FROM users WHERE username = ?')
    .get(username)
  if (exists) {
    throw new AuthError('该用户名已被注册')
  }

  db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(
    username,
    bcrypt.hashSync(password, 10)
  )
}
