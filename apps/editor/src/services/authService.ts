// 认证 Service（本地实现）：校验本地用户表，写 cookie 登录态
// 实现 IAuthService 接口，与 remoteAuthService 签名完全一致

import { findUser, saveUser, issueSession, clearSession } from './storage'
import docCookies from '@/utils/cookies'
import type { IAuthService } from './interfaces'

export const authService: IAuthService = {
  // 登录：校验本地用户表，成功后写 cookie 登录态
  login(payload: { name: string; password: string }): Promise<void> {
    const user = findUser(payload.name)
    if (!user) {
      return Promise.reject(new Error('用户不存在，请先注册'))
    }
    if (user.password !== payload.password) {
      return Promise.reject(new Error('密码错误'))
    }
    issueSession(user.name)
    return Promise.resolve()
  },

  // 登出：清除 cookie 登录态
  logout(): Promise<void> {
    clearSession()
    return Promise.resolve()
  },

  // 注册：校验后写入本地用户表
  register(payload: { name: string; password: string }): Promise<void> {
    if (!payload.name || !payload.password) {
      return Promise.reject(new Error('用户名和密码不能为空'))
    }
    if (payload.name.length < 2) {
      return Promise.reject(new Error('用户名至少 2 个字符'))
    }
    if (payload.password.length < 4) {
      return Promise.reject(new Error('密码至少 4 位'))
    }
    if (findUser(payload.name)) {
      return Promise.reject(new Error('该用户名已被注册'))
    }
    saveUser({ name: payload.name, password: payload.password })
    return Promise.resolve()
  },

  // 检查当前是否已登录（cookie 中有 sessionId）
  isAuthenticated(): boolean {
    return !!docCookies.getItem('sessionId')
  },

  // 获取当前登录用户名
  getUsername(): string | null {
    return docCookies.getItem('name')
  },
}
