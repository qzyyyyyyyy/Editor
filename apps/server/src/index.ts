import app from './app.js'
import { env } from './config/env.js'

// 启动 HTTP 服务
app.listen(env.PORT, () => {
  console.log(`[server] listening on http://localhost:${env.PORT}`)
  console.log(`[server] health check: http://localhost:${env.PORT}/api/health`)
})
