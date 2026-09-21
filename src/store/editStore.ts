// 兼容层：editStore 已拆分到 editStore/ 目录
// 保留 re-export，旧代码无需改动 import 路径

export { default } from './editStore/index'

// canvasSlice
export {
  parseCanvas,
  loadCanvas,
  resetCanvas,
  clearCanvas,
  clearCanvas as claerCanvas, // 兼容旧拼写，已弃用
  saveCanvas,
  updateCanvasTitle,
  updateCanvasStyle,
} from './editStore/slices/canvasSlice'

// cmpSlice
export {
  addCmp,
  delSelectedCmps,
  duplicateSelectedCmps,
  copySelectedCmps,
  pasteCmps,
} from './editStore/slices/cmpSlice'

// layerSlice
export {
  moveSelectedCmpUp,
  moveSelectedCmpDown,
  bringSelectedCmpToFront,
  sendSelectedCmpToBack,
} from './editStore/slices/layerSlice'

// selectionSlice
export {
  setAllCmpsSelected,
  setCmpsSelected,
  setCmpSelected,
} from './editStore/slices/selectionSlice'

// styleSlice
export {
  updateAssemblyCmpsByDistance,
  commitHistoryIfChanged,
  commitHistoryIfChanged as recordCanvasChangeHistory_2, // 兼容旧命名
  updateSelectedCmpStyle,
  updateSelectedCmpAttr,
  editAssemblyStyle,
} from './editStore/slices/styleSlice'

// selectors
export { selectedCmpIndexSelector } from './editStore/selectors'
