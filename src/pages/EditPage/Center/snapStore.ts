import { create } from 'zustand'
import type { GuideLine } from './snap'

// 辅助线全局状态：EditBox 拖拽时写入，Canvas 读取渲染
// 独立于 editStore，避免频繁 setState 触发画布重渲染
interface SnapState {
  guides: GuideLine[]
  setGuides: (guides: GuideLine[]) => void
}

const useSnapStore = create<SnapState>((set) => ({
  guides: [],
  setGuides: (guides) => set({ guides }),
}))

export default useSnapStore
