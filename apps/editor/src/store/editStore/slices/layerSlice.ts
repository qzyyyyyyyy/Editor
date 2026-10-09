import { recordCanvasChangeHistory } from '../../historySlice'
import { selectedCmpIndexSelector } from '../selectors'
import useEditStore from '@/store/editStore/index'

// ! 图层顺序
// 组件层级即 cmps 数组下标：渲染时 zIndex = index，下标越大越靠上层。
// 菜单只在单选时展示这些操作，因此直接取当前选中下标处理。
// 注意：移动后组件的下标会变，必须同步更新 assembly，否则选中框会错套到别的组件上。

// 上移一层：与上方（下标 +1）的组件交换；已在最顶层则不动
export const moveSelectedCmpUp = () => {
  useEditStore.setState((draft) => {
    const index = selectedCmpIndexSelector(draft)
    const cmps = draft.canvas.cmps
    if (index < 0 || index >= cmps.length - 1) {
      return
    }
    const [cmp] = cmps.splice(index, 1)
    cmps.splice(index + 1, 0, cmp)
    draft.assembly = new Set([index + 1])
    recordCanvasChangeHistory(draft)
  })
}

// 下移一层：与下方（下标 -1）的组件交换；已在最底层则不动
export const moveSelectedCmpDown = () => {
  useEditStore.setState((draft) => {
    const index = selectedCmpIndexSelector(draft)
    const cmps = draft.canvas.cmps
    if (index <= 0) {
      return
    }
    const [cmp] = cmps.splice(index, 1)
    cmps.splice(index - 1, 0, cmp)
    draft.assembly = new Set([index - 1])
    recordCanvasChangeHistory(draft)
  })
}

// 置顶：移到数组末尾（视觉最上层）
export const bringSelectedCmpToFront = () => {
  useEditStore.setState((draft) => {
    const index = selectedCmpIndexSelector(draft)
    const cmps = draft.canvas.cmps
    if (index < 0 || index === cmps.length - 1) {
      return
    }
    const [cmp] = cmps.splice(index, 1)
    cmps.push(cmp)
    draft.assembly = new Set([cmps.length - 1])
    recordCanvasChangeHistory(draft)
  })
}

// 置底：移到数组开头（视觉最底层）
export const sendSelectedCmpToBack = () => {
  useEditStore.setState((draft) => {
    const index = selectedCmpIndexSelector(draft)
    const cmps = draft.canvas.cmps
    if (index <= 0) {
      return
    }
    const [cmp] = cmps.splice(index, 1)
    cmps.unshift(cmp)
    draft.assembly = new Set([0])
    recordCanvasChangeHistory(draft)
  })
}

// ! 图层面板专用操作（按面板行的下标操作，不依赖选中态）

// 图层面板拖拽排序：把 fromIndex 的组件移动到 toIndex
// 移动后两侧组件的下标都会变化，同步修正 assembly
export const moveCmp = (fromIndex: number, toIndex: number) => {
  if (fromIndex === toIndex) {
    return
  }
  useEditStore.setState((draft) => {
    const cmps = draft.canvas.cmps
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= cmps.length ||
      toIndex >= cmps.length
    ) {
      return
    }
    const [cmp] = cmps.splice(fromIndex, 1)
    cmps.splice(toIndex, 0, cmp)

    // 修正所有选中下标：被拖动的组件新下标即 toIndex，
    // 其余选中组件随 splice 位移（避免先 add 再 translate 导致二次平移）
    const fixed = new Set<number>()
    draft.assembly.forEach((i) => {
      fixed.add(
        i === fromIndex ? toIndex : translateIndex(i, fromIndex, toIndex)
      )
    })
    draft.assembly = fixed
    recordCanvasChangeHistory(draft)
  })
}

// 计算某组件下标在 move(from→to) 后的新下标
const translateIndex = (i: number, from: number, to: number): number => {
  if (i === from) {
    return to
  }
  // 被抽出的下标 left 一个空位，右侧组件左移一格
  if (from < to) {
    return i > from && i <= to ? i - 1 : i
  }
  // 插入方向相反：from 右侧组件右移一格
  return i >= to && i < from ? i + 1 : i
}

// 切换组件显示/隐藏（undefined 视为显示）
// 隐藏时若该组件正被选中，先取消选中，避免选中框悬在看不见的位置
export const toggleCmpVisible = (index: number) => {
  useEditStore.setState((draft) => {
    const cmp = draft.canvas.cmps[index]
    if (!cmp) {
      return
    }
    cmp.visible = cmp.visible === false ? true : false
    if (cmp.visible === false) {
      draft.assembly.delete(index)
    }
    recordCanvasChangeHistory(draft)
  })
}

// 切换组件锁定/解锁（undefined 视为未锁定）
export const toggleCmpLocked = (index: number) => {
  useEditStore.setState((draft) => {
    const cmp = draft.canvas.cmps[index]
    if (!cmp) {
      return
    }
    cmp.locked = cmp.locked === true ? false : true
    recordCanvasChangeHistory(draft)
  })
}
