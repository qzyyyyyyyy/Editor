import type { EditStoreState } from './editStoreTypes'

const maxCanvasChangeHistory = 100

// ! 历史
// 所有 slice 函数统一接收 draft 参数，不在 slice 内部调 setState
// 调用方负责 useEditStore.setState((draft) => recordCanvasChangeHistory(draft))

export const recordCanvasChangeHistory = (draft: EditStoreState) => {
  // 撤销后又做了新修改：丢弃当前指针后面的"重做分支"，
  // slice 结果必须写回 draft，否则截断不生效、index 会指向旧条目
  draft.canvasChangeHistory = draft.canvasChangeHistory.slice(
    0,
    draft.canvasChangeHistoryIndex + 1
  )

  draft.canvasChangeHistory.push({
    canvas: draft.canvas,
    assembly: draft.assembly,
  })

  draft.canvasChangeHistoryIndex++

  if (draft.canvasChangeHistory.length > maxCanvasChangeHistory) {
    draft.canvasChangeHistory.shift()
    draft.canvasChangeHistoryIndex--
  }
}

// 撤销：指针前移一步，把目标快照写回 canvas/assembly
export const goPrevCanvasHistory = (draft: EditStoreState) => {
  const newIndex = draft.canvasChangeHistoryIndex - 1
  if (newIndex < 0) {
    return
  }
  // 目标条目不存在才退出
  if (!draft.canvasChangeHistory[newIndex]) {
    return
  }
  const item = draft.canvasChangeHistory[newIndex]
  draft.canvas = item.canvas
  draft.assembly = item.assembly
  draft.canvasChangeHistoryIndex = newIndex
}

// 重做：指针后移一步，把目标快照写回 canvas/assembly
export const goNextCanvasHistory = (draft: EditStoreState) => {
  const newIndex = draft.canvasChangeHistoryIndex + 1
  if (newIndex >= draft.canvasChangeHistory.length) {
    return
  }
  // 目标条目不存在才退出
  if (!draft.canvasChangeHistory[newIndex]) {
    return
  }
  const item = draft.canvasChangeHistory[newIndex]
  draft.canvas = item.canvas
  draft.assembly = item.assembly
  draft.canvasChangeHistoryIndex = newIndex
}
