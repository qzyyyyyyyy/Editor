// Service 层出口：根据环境变量切换 localStorage / 远端 API 实现
// 两个实现都遵守 ICanvasService / IAuthService 接口，签名不一致编译期报错

import * as localCanvasModule from './canvasService'
import * as remoteCanvasModule from './remoteCanvasService'
import * as localAuthModule from './authService'
import * as remoteAuthModule from './remoteAuthService'
import type { ICanvasService, IAuthService } from './interfaces'

// 通过 VITE_USE_API 控制：true → 走远端，否则走本地
const USE_API = Boolean(import.meta.env.VITE_USE_API)

export const canvasService: ICanvasService = USE_API
  ? remoteCanvasModule.canvasService
  : localCanvasModule.canvasService

export const authService: IAuthService = USE_API
  ? remoteAuthModule.authService
  : localAuthModule.authService

// 向后兼容：保持调用方已有的命名导入
export const { getCanvasById, getCanvasList, del, saveCanvas } = canvasService
export const { login, logout, register, isAuthenticated, getUsername } =
  authService

export type { ListItem } from './canvasService'
export type { ICanvasService, IAuthService } from './interfaces'
