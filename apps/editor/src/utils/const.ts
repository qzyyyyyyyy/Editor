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

// 图形组件默认视觉样式：backgroundColor→SVG fill，borderColor→stroke，
// borderWidth→stroke-width，borderStyle→stroke-dasharray
const graphDefaultStyle: CSSProperties = {
  ...defaultComponentStyle,
  width: 120,
  height: 120,
  backgroundColor: '#1677ff',
  borderColor: '#0958d9',
  borderWidth: 2,
  borderStyle: 'solid',
}

// 图形形状注册表：key 存入 cmp.value，label 用于左侧面板展示
export interface ShapeMeta {
  key: string
  label: string
  defaultStyle: CSSProperties
}

export const SHAPES: ShapeMeta[] = [
  { key: 'rect', label: '矩形', defaultStyle: graphDefaultStyle },
  { key: 'roundRect', label: '圆角矩形', defaultStyle: graphDefaultStyle },
  { key: 'circle', label: '圆形', defaultStyle: graphDefaultStyle },
  { key: 'ellipse', label: '椭圆', defaultStyle: graphDefaultStyle },
  { key: 'triangle', label: '三角形', defaultStyle: graphDefaultStyle },
  { key: 'rightTriangle', label: '直角三角形', defaultStyle: graphDefaultStyle },
  { key: 'diamond', label: '菱形', defaultStyle: graphDefaultStyle },
  { key: 'pentagon', label: '五边形', defaultStyle: graphDefaultStyle },
  { key: 'hexagon', label: '六边形', defaultStyle: graphDefaultStyle },
  { key: 'star', label: '五角星', defaultStyle: graphDefaultStyle },
  { key: 'heart', label: '心形', defaultStyle: graphDefaultStyle },
  { key: 'line', label: '直线', defaultStyle: graphDefaultStyle },
  { key: 'arrow', label: '箭头', defaultStyle: graphDefaultStyle },
  { key: 'plus', label: '加号', defaultStyle: graphDefaultStyle },
  { key: 'cross', label: '叉号', defaultStyle: graphDefaultStyle },
]

// 画布尺寸预设：用户可一键切换常用终端尺寸
export interface CanvasPreset {
  key: string
  label: string
  width: number
  height: number
}

export const CANVAS_PRESETS: CanvasPreset[] = [
  { key: 'mobile-s', label: '手机 375×667', width: 375, height: 667 },
  { key: 'mobile-l', label: '大手机 414×896', width: 414, height: 896 },
  { key: 'tablet', label: '平板 768×1024', width: 768, height: 1024 },
  { key: 'desktop', label: '桌面 1440×900', width: 1440, height: 900 },
  { key: 'small', label: '小屏 320×568', width: 320, height: 568 },
]
