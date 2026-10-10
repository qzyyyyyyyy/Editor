import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import { env } from '../config/env.js'

// 扩展 Express Request，挂载当前登录用户
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: number
      username?: string
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: '未登录或登录已过期' })
    return
  }

  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload
    req.userId = payload.sub != null ? Number(payload.sub) : 0
    req.username = payload.username as string
    next()
  } catch {
    res.status(401).json({ success: false, message: '登录已过期，请重新登录' })
  }
}
