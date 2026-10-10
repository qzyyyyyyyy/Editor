// Service 层契约接口：两个实现（local / remote）必须遵守
// 签名不一致编译期就报错，这是适配器模式的类型层保障

import type { CanvasItem } from './types'

export interface ICanvasService {
  /** 按 id 获取单条画布，不存在返回 undefined */
  getCanvasById(id: number): Promise<CanvasItem | undefined>

  /** 获取列表，keyword 为空查全部，非空按 title 模糊过滤 */
  getCanvasList(keyword: string): Promise<CanvasItem[]>

  /** 删除指定 id 的画布 */
  del(id: number): Promise<void>

  /** 保存画布（新建或更新），返回保存后的 id */
  saveCanvas(payload: {
    id: number | null
    type: string
    title: string
    content: string
  }): Promise<number>
}

export interface IAuthService {
  /** 登录，失败时抛 Error */
  login(payload: { name: string; password: string }): Promise<void>

  /** 登出 */
  logout(): Promise<void>

  /** 注册，失败时抛 Error */
  register(payload: { name: string; password: string }): Promise<void>

  /** 检查当前是否已登录 */
  isAuthenticated(): boolean

  /** 获取当前登录用户名（未登录返回 null） */
  getUsername(): string | null
}
