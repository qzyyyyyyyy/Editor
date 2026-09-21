import type { EditStoreState, Style } from '../../editStoreTypes'
import { recordCanvasChangeHistory } from '../../historySlice'
import { selectedCmpIndexSelector } from '../selectors'
import useEditStore from '@/store/editStore/index'

// ! 修改组件属性（拖拽、缩放）
// 根据改变的量来修改（增量式）
export const updateAssemblyCmpsByDistance = (newStyle: Style) => {
  useEditStore.setState((draft: EditStoreState) => {
    draft.assembly.forEach((index) => {
      const cmp = { ...draft.canvas.cmps[index] }

      let invalid = false
      Object.entries(newStyle).forEach(([key, value]) => {
        if (
          (key === 'width' || key === 'height') &&
          (cmp.style[key as keyof Style] as number) + (value as number) < 2
        ) {
          invalid = true
          return
        }
        cmp.style[key as keyof Style] = ((cmp.style[
          key as keyof Style
        ] as number) + (value as number)) as any
      })
      if (!invalid) {
        draft.canvas.cmps[index] = cmp
      }
    })
  })
}

// ! 记录画布变化（防抖去重处理）
// 拖拽/缩放结束时调用，通过引用比较判断 canvas 是否真的变化，
// 避免单击/未拖动等噪声操作产生"假历史"
export const commitHistoryIfChanged = () => {
  const store = useEditStore.getState()
  if (
    store.canvas ===
    store.canvasChangeHistory[store.canvasChangeHistoryIndex].canvas
  ) {
    return
  }
  useEditStore.setState((draft) => {
    recordCanvasChangeHistory(draft)
  })
}

// 修改单个组件的 style（属性面板改样式，绝对值覆盖）
export const updateSelectedCmpStyle = (newStyle: Style) => {
  useEditStore.setState((draft) => {
    Object.assign(
      draft.canvas.cmps[selectedCmpIndexSelector(draft)].style,
      newStyle
    )
    recordCanvasChangeHistory(draft)
  })
}

// 修改单个组件的属性（属性面板改文字/类型）
export const updateSelectedCmpAttr = (name: string, value: string) => {
  useEditStore.setState((draft: EditStoreState) => {
    const selectedIndex = selectedCmpIndexSelector(draft)
    ;(draft.canvas.cmps[selectedIndex] as any)[name] = value
    recordCanvasChangeHistory(draft)
  })
}

// 修改选中组件的 style（面板上点对齐按钮）
export const editAssemblyStyle = (_style: Style) => {
  useEditStore.setState((draft) => {
    draft.assembly.forEach((index: number) => {
      const _s = { ...draft.canvas.cmps[index].style }
      const canvasStyle = draft.canvas.style
      const canvasWidth = canvasStyle.width as number
      const canvasHeight = canvasStyle.height as number
      const cmpWidth = _s.width as number
      const cmpHeight = _s.height as number
      if (_style.right === 0) {
        _s.left = canvasWidth - cmpWidth
      } else if (_style.bottom === 0) {
        _s.top = canvasHeight - cmpHeight
      } else if (_style.left === 'center') {
        _s.left = (canvasWidth - cmpWidth) / 2
      } else if (_style.top === 'center') {
        _s.top = (canvasHeight - cmpHeight) / 2
      } else {
        Object.assign(_s, _style)
      }
      draft.canvas.cmps[index].style = _s
      recordCanvasChangeHistory(draft)
    })
  })
}
