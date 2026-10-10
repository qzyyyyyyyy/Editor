import { Router } from 'express'
import authRoutes from './auth.routes.js'
import canvasRoutes from './canvases.routes.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = Router()

// 认证相关接口（登录/注册不需要 token）
router.use('/auth', authRoutes)

// 画布相关接口需要登录态
router.use('/canvases', authMiddleware, canvasRoutes)

export default router
