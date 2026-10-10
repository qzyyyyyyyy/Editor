// 前后端共享的 API 契约类型
// 所有 HTTP 响应统一使用此结构，前端按此字段解析

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
}

// 认证相关
export interface LoginRequest {
  name: string
  password: string
}

export interface LoginResponse {
  token: string
  username: string
}

// 画布保存请求（新建或更新）
export interface SaveCanvasRequest {
  id?: number | null
  type: string
  title: string
  content: string
}

// 画布列表响应项（与 CanvasItem 结构一致）
export type CanvasListItem = {
  id: number
  type: string
  title: string
  content: string
}
