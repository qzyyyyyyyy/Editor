// 画布 Service（本地实现）：纯 localStorage 读写，离线降级使用
// 实现 ICanvasService 接口，与 remoteCanvasService 签名完全一致

import { getCanvasListData, saveCanvasList } from './storage'
import type { CanvasItem } from './types'
import type { ICanvasService } from './interfaces'

export type ListItem = CanvasItem

export const canvasService: ICanvasService = {
  // 按 id 获取单条画布记录，不存在返回 undefined
  getCanvasById(id: number): Promise<ListItem | undefined> {
    const item = getCanvasListData().find((i) => i.id === id)
    return Promise.resolve(item)
  },

  // 获取列表，keyword 为空查全部，非空按 title 模糊过滤
  getCanvasList(keyword: string): Promise<ListItem[]> {
    let list = getCanvasListData()
    if (keyword) {
      list = list.filter((i) => (i.title || '').includes(keyword))
    }
    return Promise.resolve(list)
  },

  // 删除指定 id 的画布
  del(id: number): Promise<void> {
    const list = getCanvasListData()
    const idx = list.findIndex((i) => i.id === id)
    if (idx === -1) {
      return Promise.reject(new Error('该记录不存在'))
    }
    list.splice(idx, 1)
    saveCanvasList(list)
    return Promise.resolve()
  },

  // 保存画布（新建或更新），返回保存后的 id
  saveCanvas(payload: {
    id: number | null
    type: string
    title: string
    content: string
  }): Promise<number> {
    const list = getCanvasListData()
    const existing =
      payload.id != null
        ? list.find((item) => item.id === payload.id)
        : undefined

    let savedId: number
    if (existing) {
      existing.title = payload.title
      existing.content = payload.content
      existing.type = payload.type
      savedId = existing.id
    } else {
      savedId = list.length ? Math.max(...list.map((i) => i.id)) + 1 : 1
      list.push({
        id: savedId,
        title: payload.title,
        content: payload.content,
        type: payload.type,
      })
    }
    saveCanvasList(list)
    return Promise.resolve(savedId)
  },
}
