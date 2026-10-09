// 认证 Service 层：登录/注册/登出的业务封装

import { findUser, saveUser, issueSession, clearSession } from './storage'

interface UserPayload {
  name: string
  password: string
}

interface RegisterPayload {
  name: string
  password: string
}

// 前端登录：校验本地用户表，成功后写 cookie 登录态
export function login(
  payload: UserPayload,
  onSuccess?: () => void,
  onError?: (msg: string) => void
) {
  const user = findUser(payload.name)
  if (!user) {
    onError?.('用户不存在，请先注册')
    return
  }
  if (user.password !== payload.password) {
    onError?.('密码错误')
    return
  }
  issueSession(user.name)
  onSuccess?.()
}

// 前端登出：清除 cookie 登录态
export function logout(
  onSuccess?: () => void,
  _onError?: (msg: string) => void
) {
  clearSession()
  onSuccess?.()
}

// 前端注册：校验后写入本地用户表
export function register(
  payload: RegisterPayload,
  onSuccess?: () => void,
  onError?: (msg: string) => void
) {
  if (!payload.name || !payload.password) {
    onError?.('用户名和密码不能为空')
    return
  }
  if (payload.name.length < 2) {
    onError?.('用户名至少 2 个字符')
    return
  }
  if (payload.password.length < 4) {
    onError?.('密码至少 4 位')
    return
  }
  if (findUser(payload.name)) {
    onError?.('该用户名已被注册')
    return
  }
  saveUser({ name: payload.name, password: payload.password })
  onSuccess?.()
}
