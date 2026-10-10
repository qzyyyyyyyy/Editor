import type { EditStoreState, ICanvas, Style } from '../../editStoreTypes'
import { getDefaultCanvas } from '../getDefaultCanvas'
import { recordCanvasChangeHistory } from '../../historySlice'
import useZoomStore from '../../zoomStore'
import useEditStore from '@/store/editStore/index'
import { saveCanvas as saveCanvasService } from '@/services'

// 将 localStorage 的 content 字符串还原为完整 ICanvas
// 与默认画布合并，兼容脏数据（如种子记录的 "{}"）
export function parseCanvas(content: string): ICanvas {
  const defaultCanvas = getDefaultCanvas()
  let parsed: Partial<ICanvas>
  try {
    parsed = JSON.parse(content)
  } catch {
    parsed = {}
  }
  return {
    ...defaultCanvas,
    ...parsed,
    style: { ...defaultCanvas.style, ...parsed.style },
    cmps: Array.isArray(parsed.cmps) ? parsed.cmps : [],
  }
}

// 加载已有画布到 store（EditPage 按 URL id 还原时调用）
export const loadCanvas = (content: string) => {
  useEditStore.setState((draft) => {
    draft.canvas = parseCanvas(content)
    draft.assembly.clear()
  })
}

// 重置为默认空画布（新建场景）
export const resetCanvas = () => {
  useEditStore.setState((draft) => {
    draft.canvas = getDefaultCanvas()
    draft.assembly.clear()
  })
}

// 清空画布（Header 调用）
export const clearCanvas = () => {
  useEditStore.setState((draft) => {
    draft.canvas = getDefaultCanvas()
    draft.assembly.clear()
  })
  useZoomStore.getState().resetZoom()
}

// 保存画布
// id 为 null → 新建；有值 → 更新已有记录
// 返回保存后的 id，供调用方跳转/刷新使用
export const saveCanvas = async (
  id: number | null,
  type: string
): Promise<number> => {
  const canvas = useEditStore.getState().canvas
  const content = JSON.stringify(canvas)
  return saveCanvasService({ id, type, title: canvas.title, content })
}

// 更新画布标题
export const updateCanvasTitle = (title: string) => {
  useEditStore.setState((draft: EditStoreState) => {
    draft.canvas.title = title
    recordCanvasChangeHistory(draft)
  })
}

// 更新画布属性
export const updateCanvasStyle = (_style: Partial<Style>) => {
  useEditStore.setState((draft: EditStoreState) => {
    Object.assign(draft.canvas.style, _style)
    recordCanvasChangeHistory(draft)
  })
}
