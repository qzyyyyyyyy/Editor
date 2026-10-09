import useEditStore from '@/store/editStore/index'

// ! 选中组件

// 全部选中（隐藏的组件不可见，跳过不选）
export const setAllCmpsSelected = () => {
  useEditStore.setState((draft) => {
    draft.assembly = new Set(
      draft.canvas.cmps
        .map((cmp, i) => (cmp.visible === false ? -1 : i))
        .filter((i) => i >= 0)
    )
  })
}

// 选中多个
// 如果再次点击已经选中的组件，则取消选中
export const setCmpsSelected = (indexes: Array<number>) => {
  useEditStore.setState((draft) => {
    if (indexes)
      indexes.forEach((index) => {
        if (draft.assembly.has(index)) {
          draft.assembly.delete(index)
        } else {
          draft.assembly.add(index)
        }
      })
  })
}

// 选中单个
// 如果 index 为 -1，则取消选中
export const setCmpSelected = (index: number) => {
  if (index === -1) {
    useEditStore.setState((draft) => {
      if (draft.assembly.size > 0) {
        draft.assembly.clear()
      }
    })
  } else if (index > -1) {
    useEditStore.setState((draft) => {
      draft.assembly = new Set([index])
    })
  }
}
