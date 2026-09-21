import type { CSSProperties } from 'react'

// 组件类型标识
export const isTextComponent = 1
export const isImgComponent = 2
export const isGraphComponent = 3
export const isImportComponent = 4

// 组件拖入画布时的基础样式（绝对定位，左上角起）
export const defaultComponentStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
}
