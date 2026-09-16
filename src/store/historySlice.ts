import useEditStore from "./editStore"
import type { EditStoreState } from "./editStoreTypes"

const maxCanvasChangeHistory = 100

// ! 历史
export const recordCanvasChangeHistory = (draft: EditStoreState) => {
  // 撤销后又做了新修改：丢弃当前指针后面的"重做分支"，
  // slice 结果必须写回 draft，否则截断不生效、index 会指向旧条目
  draft.canvasChangeHistory = draft.canvasChangeHistory.slice(
    0,
    draft.canvasChangeHistoryIndex + 1
  )

  draft.canvasChangeHistory.push({
    canvas: draft.canvas,
    assembly: draft.assembly
  })

  draft.canvasChangeHistoryIndex++

  if (draft.canvasChangeHistory.length > maxCanvasChangeHistory) {
    draft.canvasChangeHistory.shift()
    draft.canvasChangeHistoryIndex--
  }
}

export const goPrevCanvasHistory = () => {
  useEditStore.setState((draft) => {
    let newIndex = draft.canvasChangeHistoryIndex - 1
    if (newIndex < 0) {
      return
    }
    // 目标条目不存在才退出（原条件写反，导致永远提前 return）
    if (!draft.canvasChangeHistory[newIndex]) {
      return
    }
    const item = draft.canvasChangeHistory[newIndex]
    draft.canvas = item.canvas
    draft.assembly = item.assembly
    draft.canvasChangeHistoryIndex = newIndex
  })
}

export const goNextCanvasHistory = () => {
  useEditStore.setState((draft) => {
    let newIndex = draft.canvasChangeHistoryIndex + 1
    if (newIndex >= draft.canvasChangeHistory.length) {
      return
    }
    // 目标条目不存在才退出（原条件写反，导致永远提前 return）
    if (!draft.canvasChangeHistory[newIndex]) {
      return
    }
    const item = draft.canvasChangeHistory[newIndex]
    draft.canvas = item.canvas
    draft.assembly = item.assembly
    draft.canvasChangeHistoryIndex = newIndex
  })
}
