// Service 层出口：根据环境变量切换 localStorage / 远端 API 实现
// 两种实现暴露相同的方法签名，调用方（store / 组件）无需感知

import * as localCanvas from './canvasService'
import * as remoteCanvas from './remoteCanvasService'
import * as localAuth from './authService'
import * as remoteAuth from './remoteAuthService'

// 通过 VITE_USE_API 控制：非空/true → 走远端，否则走本地
const USE_API = Boolean(import.meta.env.VITE_USE_API)

export const {
  getCanvasById,
  getCanvasList,
  del,
  saveCanvas,
} = USE_API ? remoteCanvas : localCanvas

export const { login, logout, register } = USE_API ? remoteAuth : localAuth

export type { ListItem } from './canvasService'
