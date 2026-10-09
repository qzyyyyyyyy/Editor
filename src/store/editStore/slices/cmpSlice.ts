import type { ICmp, ICmpWithKey, Style } from '../../editStoreTypes'
import { getOnlyKey } from '@/utils'
import { recordCanvasChangeHistory } from '../../historySlice'
import useEditStore from '@/store/editStore/index'

// 副本相对原组件的位移，避免完全重叠看不出复制效果
const COPY_OFFSET = 20

// 计算偏移后的位置并夹在画布范围内（组件比画布还宽/高时贴左/贴顶）
const getClonedPosition = (
  style: Style,
  canvasWidth: number,
  canvasHeight: number,
  offset: number
): { left: number; top: number } => {
  const left = style.left as number
  const top = style.top as number
  const width = style.width as number
  const height = style.height as number
  return {
    left: Math.max(0, Math.min(left + offset, canvasWidth - width)),
    top: Math.max(0, Math.min(top + offset, canvasHeight - height)),
  }
}

// 添加组件到画布
export const addCmp = (cmp: ICmp) => {
  useEditStore.setState((draft) => {
    draft.canvas.cmps.push({ ...cmp, key: getOnlyKey() })
    draft.assembly = new Set([draft.canvas.cmps.length - 1])
    recordCanvasChangeHistory(draft)
  })
}

// 删除选中组件
export const delSelectedCmps = () => {
  useEditStore.setState((draft) => {
    const assembly = draft.assembly
    // 锁定的组件受保护，不被删除；过滤后存活组件下标前移，
    // 用"旧下标 → 新位置"的映射重建 assembly，避免选中框错套
    const kept = draft.canvas.cmps
      .map((cmp, oldIndex) => ({ cmp, oldIndex }))
      .filter(
        ({ cmp, oldIndex }) => !(assembly.has(oldIndex) && cmp.locked !== true)
      )
    if (kept.length === draft.canvas.cmps.length) {
      return
    }
    draft.canvas.cmps = kept.map(({ cmp }) => cmp)
    draft.assembly = new Set(
      kept
        .map(({ oldIndex }, newIndex) =>
          assembly.has(oldIndex) ? newIndex : -1
        )
        .filter((index) => index >= 0)
    )
    recordCanvasChangeHistory(draft)
  })
}

// 右键菜单"复制组件"：原地立即克隆一份（复制 + 粘贴一步完成）
// 支持多选批量克隆，副本间相对位置不变
export const duplicateSelectedCmps = () => {
  useEditStore.setState((draft) => {
    const indexes = Array.from(draft.assembly).sort((a, b) => a - b)
    if (indexes.length === 0) {
      return
    }

    const canvasWidth = draft.canvas.style.width as number
    const canvasHeight = draft.canvas.style.height as number
    const newIndexes: number[] = []

    indexes.forEach((index) => {
      const cmp = draft.canvas.cmps[index]
      draft.canvas.cmps.push({
        ...cmp,
        key: getOnlyKey(),
        style: {
          ...cmp.style,
          ...getClonedPosition(
            cmp.style,
            canvasWidth,
            canvasHeight,
            COPY_OFFSET
          ),
        },
      })
      newIndexes.push(draft.canvas.cmps.length - 1)
    })

    draft.assembly = new Set(newIndexes)
    recordCanvasChangeHistory(draft)
  })
}

// 内存剪贴板：暂存 Ctrl+C 的组件快照，不持久化（刷新后清空），可跨画布粘贴
let cmpsClipboard: ICmpWithKey[] = []
// 本轮复制后已粘贴的次数，用于让连续粘贴逐级错位
let pasteTimes = 0

// Ctrl/Cmd + C：把选中组件深拷贝到剪贴板（不改画布、不入历史）
export const copySelectedCmps = () => {
  const { canvas, assembly } = useEditStore.getState()
  cmpsClipboard = Array.from(assembly)
    .sort((a, b) => a - b)
    .map((index) => {
      const cmp = canvas.cmps[index]
      return { ...cmp, style: { ...cmp.style } }
    })
  pasteTimes = 0
}

// Ctrl/Cmd + V：把剪贴板组件克隆到当前画布，
// 每次粘贴重新生成 key/style，连续粘贴逐级偏移，粘贴后选中新组件
export const pasteCmps = () => {
  if (cmpsClipboard.length === 0) {
    return
  }
  pasteTimes += 1
  const offset = COPY_OFFSET * pasteTimes

  useEditStore.setState((draft) => {
    const canvasWidth = draft.canvas.style.width as number
    const canvasHeight = draft.canvas.style.height as number
    const newIndexes: number[] = []

    cmpsClipboard.forEach((cmp) => {
      draft.canvas.cmps.push({
        ...cmp,
        key: getOnlyKey(),
        style: {
          ...cmp.style,
          ...getClonedPosition(cmp.style, canvasWidth, canvasHeight, offset),
        },
      })
      newIndexes.push(draft.canvas.cmps.length - 1)
    })

    draft.assembly = new Set(newIndexes)
    recordCanvasChangeHistory(draft)
  })
}
