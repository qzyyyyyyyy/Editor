// 认证 Service（远端实现）：通过 HTTP API 调用后端
// 接口形态与本地 authService 保持一致

import { http, setToken, clearToken } from './http'

export function login(
  payload: { name: string; password: string },
  onSuccess?: () => void,
  onError?: (msg: string) => void
): void {
  http
    .post('/auth/login', payload)
    .then((res) => {
      setToken(res.data.data.token)
      onSuccess?.()
    })
    .catch((err: Error) => onError?.(err.message))
}

export function logout(
  onSuccess?: () => void,
  _onError?: (msg: string) => void
): void {
  // JWT 无状态，前端清除 token 即登出
  clearToken()
  onSuccess?.()
}

export function register(
  payload: { name: string; password: string },
  onSuccess?: () => void,
  onError?: (msg: string) => void
): void {
  http
    .post('/auth/register', payload)
    .then(() => onSuccess?.())
    .catch((err: Error) => onError?.(err.message))
}
