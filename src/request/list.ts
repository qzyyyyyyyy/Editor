import {
  getCanvasListData,
  saveCanvasList,
  type CanvasItem
} from "../utils/storage"

// 列表项类型，供 ListPage 复用
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
    list = list.filter((i) => (i.title || "").includes(keyword))
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
    onError?.("该记录不存在")
    return
  }
  list.splice(idx, 1)
  saveCanvasList(list)
  onSuccess?.()
}
