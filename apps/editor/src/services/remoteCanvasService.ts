// 画布 Service（远端实现）：通过 HTTP API 调用后端
// 实现 ICanvasService 接口，与本地 canvasService 签名完全一致

import { http } from './http'
import type { CanvasItem } from './types'
import type { ICanvasService } from './interfaces'

export type ListItem = CanvasItem

export const canvasService: ICanvasService = {
  // 按 id 获取单条画布记录
  async getCanvasById(id: number): Promise<ListItem | undefined> {
    const res = await http.get(`/canvases/${id}`)
    return res.data.data as ListItem
  },

  // 获取列表
  async getCanvasList(keyword: string): Promise<ListItem[]> {
    const res = await http.get('/canvases', {
      params: { keyword: keyword || undefined },
    })
    return (res.data.data as ListItem[]) || []
  },

  // 删除
  async del(id: number): Promise<void> {
    await http.delete(`/canvases/${id}`)
  },

  // 保存画布（新建或更新），返回保存后的 id
  async saveCanvas(payload: {
    id: number | null
    type: string
    title: string
    content: string
  }): Promise<number> {
    const requestBody = {
      type: payload.type,
      title: payload.title,
      content: payload.content,
    }

    if (payload.id != null) {
      await http.put(`/canvases/${payload.id}`, requestBody)
      return payload.id
    }
    const res = await http.post('/canvases', requestBody)
    return res.data.data.id as number
  },
}
