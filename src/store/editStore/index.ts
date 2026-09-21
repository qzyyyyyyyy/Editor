import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet } from 'immer'
import type { EditStoreState } from '../editStoreTypes'
import { getDefaultCanvas } from './getDefaultCanvas'

// 必须在 create 之前启用，否则 Immer 无法代理 Set/Map
enableMapSet()

const useEditStore = create(
  immer<EditStoreState>(() => ({
    canvas: getDefaultCanvas(),
    // 记录选中组件下标
    assembly: new Set<number>(),
    // 记录历史
    canvasChangeHistory: [
      { canvas: getDefaultCanvas(), assembly: new Set<number>() },
    ],
    // 记录当前操作索引
    canvasChangeHistoryIndex: 0,
  }))
)

export default useEditStore
