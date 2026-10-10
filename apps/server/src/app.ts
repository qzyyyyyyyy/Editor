import express from 'express'
import cors from 'cors'
import apiRoutes from './routes/index.js'
import { errorHandler } from './middlewares/errorHandler.js'

const app = express()

// 中间件
app.use(cors())
app.use(express.json({ limit: '10mb' })) // 画布 content 可能较大

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } })
})

// 业务路由
app.use('/api', apiRoutes)

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' })
})

// 统一错误处理（必须放在最后）
app.use(errorHandler)

export default app
