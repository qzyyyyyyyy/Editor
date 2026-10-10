import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import { login, register, AuthError } from '../services/authService.js'
import type { ApiResponse, LoginRequest, LoginResponse } from '@trouble/shared'

const router = Router()

// POST /api/auth/login
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, password } = req.body as LoginRequest
    const data = login(name, password)
    const body: ApiResponse<LoginResponse> = { success: true, data }
    res.json(body)
  } catch (err) {
    next(err)
  }
})

// POST /api/auth/register
router.post(
  '/register',
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, password } = req.body as LoginRequest
      register(name, password)
      res.json({ success: true })
    } catch (err) {
      // 注册时的 AuthError 走 400
      if (err instanceof AuthError) {
        res.status(400).json({ success: false, message: err.message })
        return
      }
      next(err)
    }
  }
)

export default router
