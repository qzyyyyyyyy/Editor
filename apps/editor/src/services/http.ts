// HTTP 客户端：统一封装 axios，集中处理 token 注入与错误格式
import axios from 'axios'
import type { ApiResponse } from '@trouble/shared'

const TOKEN_KEY = '__token__'

export const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// 请求拦截器：自动附带 JWT
http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：统一解包 { success, data, message }
http.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse
    if (body && body.success === false) {
      return Promise.reject(new Error(body.message || '请求失败'))
    }
    return response
  },
  (error) => {
    // 后端返回的错误信息优先
    const msg =
      error.response?.data?.message || error.message || '网络异常，请稍后重试'
    return Promise.reject(new Error(msg))
  }
)

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}
