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
