import type { EditStoreState } from '../editStoreTypes'

// 选中的单个组件的 index
// 没有选中时返回 -1
export const selectedCmpIndexSelector = (store: EditStoreState): number => {
  const selectedCmpIndex = Array.from(store.assembly)[0]
  return selectedCmpIndex === undefined ? -1 : selectedCmpIndex
}
