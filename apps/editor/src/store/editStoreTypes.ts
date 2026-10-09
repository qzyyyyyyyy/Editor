import React from 'react'

export type Style = React.CSSProperties

export interface ICanvas {
  title: string
  style: Style
  cmps: Array<ICmpWithKey>
}

export interface ICmp {
  type: number
  style: Style
  value: string
  onClick?: string
  // 锁定后：画布上不可选中/拖拽/缩放/删除，仅可在图层面板解锁
  locked?: boolean
  // 隐藏后：画布与导出不渲染，仅在图层面板可见；undefined 视为显示
  visible?: boolean
}

export interface ICmpWithKey extends ICmp {
  key: number
}

export type EditStoreState = {
  canvas: ICanvas
  // 选中组件的下标集合（Set 支持多选，add/delete/has 语义清晰）
  assembly: Set<number>
  //记录历史
  canvasChangeHistory: Array<{ canvas: ICanvas; assembly: Set<number> }>
  // 记录当前操作索引
  canvasChangeHistoryIndex: number
}
