// Service 层类型定义

export interface User {
  name: string
  password: string
}

export interface CanvasItem {
  id: number
  type: string // 页面 / 模版页面
  title: string
  content: string
}
