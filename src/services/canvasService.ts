// 画布 Service 层：业务语义封装
// 对外暴露的接口形态和真实后端 API 一致，方便后续无缝迁移到真后端

import { getCanvasListData, saveCanvasList } from './storage'
import type { CanvasItem } from './types'

export type ListItem = CanvasItem

// 按 id 获取单条画布记录，不存在返回 undefined
export function getCanvasById(id: number): ListItem | undefined {
  return getCanvasListData().find((i) => i.id === id)
}

// 获取列表
// keyword 为空 → 查全部；非空 → 按 title 模糊过滤
export function getCanvasList(
  keyword: string,
  onSuccess?: (res: { content: ListItem[] }) => void,
  _onError?: (msg: string) => void
) {
  let list = getCanvasListData()
  if (keyword) {
    list = list.filter((i) => (i.title || '').includes(keyword))
  }
  onSuccess?.({ content: list })
}

// 删除
export function del(
  payload: { id: number },
  onSuccess?: () => void,
  onError?: (msg: string) => void
) {
  const list = getCanvasListData()
  const idx = list.findIndex((i) => i.id === payload.id)
  if (idx === -1) {
    onError?.('该记录不存在')
    return
  }
  list.splice(idx, 1)
  saveCanvasList(list)
  onSuccess?.()
}

// 保存画布（新建或更新）
// 返回保存后的 id，供调用方跳转/刷新使用
export function saveCanvas(payload: {
  id: number | null
  type: string
  title: string
  content: string
}): number {
  const list = getCanvasListData()
  const existing =
    payload.id != null ? list.find((item) => item.id === payload.id) : undefined

  let savedId: number
  if (existing) {
    // 更新已有记录
    existing.title = payload.title
    existing.content = payload.content
    existing.type = payload.type
    savedId = existing.id
  } else {
    // 新建记录，id 取已有最大 id + 1
    savedId = list.length ? Math.max(...list.map((i) => i.id)) + 1 : 1
    list.push({
      id: savedId,
      title: payload.title,
      content: payload.content,
      type: payload.type,
    })
  }
  saveCanvasList(list)
  return savedId
}
