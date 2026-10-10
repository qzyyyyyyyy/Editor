// 画布 Service（远端实现）：通过 HTTP API 调用后端
// 接口形态与本地 canvasService 保持一致，调用方无需感知切换

import { http } from './http'
import type { CanvasItem } from './types'

export type ListItem = CanvasItem

// 按 id 获取单条画布记录
export async function getCanvasById(id: number): Promise<ListItem | undefined> {
  const res = await http.get(`/canvases/${id}`)
  return res.data.data as ListItem
}

// 获取列表
export function getCanvasList(
  keyword: string,
  onSuccess?: (res: { content: ListItem[] }) => void,
  onError?: (msg: string) => void
): void {
  http
    .get('/canvases', { params: { keyword: keyword || undefined } })
    .then((res) => {
      const list = (res.data.data as ListItem[]) || []
      onSuccess?.({ content: list })
    })
    .catch((err: Error) => {
      onError?.(err.message)
    })
}

// 删除
export function del(
  payload: { id: number },
  onSuccess?: () => void,
  onError?: (msg: string) => void
): void {
  http
    .delete(`/canvases/${payload.id}`)
    .then(() => onSuccess?.())
    .catch((err: Error) => onError?.(err.message))
}

// 保存画布（新建或更新），返回保存后的 id
export function saveCanvas(payload: {
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
    return http
      .put(`/canvases/${payload.id}`, requestBody)
      .then(() => payload.id as number)
  }
  return http.post('/canvases', requestBody).then((res) => res.data.data.id as number)
}
