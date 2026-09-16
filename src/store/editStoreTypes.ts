import React from "react"

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
}

export interface ICmpWithKey extends ICmp {
  key: number
}

export type EditStoreState = {
  canvas: ICanvas
  // 选中组件的下标集合（Set 支持多选，add/delete/has 语义清晰）
  assembly: Set<number>
  //记录历史
  canvasChangeHistory: Array<{canvas: ICanvas; assembly: Set<number>}>
  // 记录当前操作索引
  canvasChangeHistoryIndex: number
}

