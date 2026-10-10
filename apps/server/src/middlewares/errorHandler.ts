import type { Request, Response, NextFunction } from 'express'
import type { ApiResponse } from '@trouble/shared'

// 统一错误处理中间件：所有路由抛出的错误在此收口
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const status = err.name === 'AuthError' ? 400 : 500
  const body: ApiResponse = {
    success: false,
    message: err.message || '服务器内部错误',
  }
  res.status(status).json(body)
}
