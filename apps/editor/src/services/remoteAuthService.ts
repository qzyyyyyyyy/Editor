// 认证 Service（远端实现）：通过 HTTP API 调用后端
// 实现 IAuthService 接口，与本地 authService 签名完全一致

import { http, getToken, setToken, clearToken } from './http'
import type { IAuthService } from './interfaces'

const USERNAME_KEY = '__username__'

export const authService: IAuthService = {
  // 登录：调后端接口，成功后存 token + 用户名
  async login(payload: { name: string; password: string }): Promise<void> {
    const res = await http.post('/auth/login', payload)
    setToken(res.data.data.token)
    localStorage.setItem(USERNAME_KEY, res.data.data.username)
  },

  // 登出：清除 token + 用户名
  logout(): Promise<void> {
    clearToken()
    localStorage.removeItem(USERNAME_KEY)
    return Promise.resolve()
  },

  // 注册：调后端注册接口
  async register(payload: { name: string; password: string }): Promise<void> {
    await http.post('/auth/register', payload)
  },

  // 检查当前是否已登录（localStorage 中有 token）
  isAuthenticated(): boolean {
    return !!getToken()
  },

  // 获取当前登录用户名
  getUsername(): string | null {
    return localStorage.getItem(USERNAME_KEY)
  },
}
