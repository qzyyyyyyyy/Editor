import type { ICmpWithKey, Style } from '@/store/editStoreTypes'

// 吸附阈值：组件边缘与参考线距离小于此值时自动吸附（画布坐标系，px）
export const SNAP_THRESHOLD = 5

// 辅助线：在画布坐标系内描述一条对齐参考线
export interface GuideLine {
  type: 'vertical' | 'horizontal'
  position: number // 线在主坐标轴上的位置（垂直线=X，水平线=Y）
  start: number // 线在副坐标轴上的起点
  end: number // 线在副坐标轴上的终点
}

export interface SnapResult {
  snapX: number // X 方向吸附偏移量（加到 left 上）
  snapY: number // Y 方向吸附偏移量（加到 top 上）
  guides: GuideLine[]
}

// 从 style 中提取组件的边缘坐标
const getEdges = (style: Style) => {
  const left = style.left as number
  const top = style.top as number
  const width = style.width as number
  const height = style.height as number
  return {
    left,
    centerX: left + width / 2,
    right: left + width,
    top,
    centerY: top + height / 2,
    bottom: top + height,
  }
}

// 计算被拖组件的吸附偏移量与辅助线
// targetStyle: 被拖组件预测位置（拖拽开始位置 + 累积偏移）
// allCmps: 画布全部组件
// excludeIndexes: 需要排除的组件下标（被拖组件自身）
// canvasStyle: 画布尺寸（用于画布中线参考）
export function computeSnap(
  targetStyle: Style,
  allCmps: ICmpWithKey[],
  excludeIndexes: Set<number>,
  canvasStyle: Style
): SnapResult {
  const target = getEdges(targetStyle)
  const targetXEdges = [target.left, target.centerX, target.right]
  const targetYEdges = [target.top, target.centerY, target.bottom]

  const canvasWidth = canvasStyle.width as number
  const canvasHeight = canvasStyle.height as number

  // X 方向参考线：{ 位置, 参考组件的 top/bottom 范围 }
  const xRefs: { pos: number; top: number; bottom: number }[] = [
    { pos: canvasWidth / 2, top: 0, bottom: canvasHeight }, // 画布水平中线
  ]
  // Y 方向参考线：{ 位置, 参考组件的 left/right 范围 }
  const yRefs: { pos: number; left: number; right: number }[] = [
    { pos: canvasHeight / 2, left: 0, right: canvasWidth }, // 画布垂直中线
  ]

  allCmps.forEach((cmp, index) => {
    if (excludeIndexes.has(index) || cmp.visible === false) {
      return
    }
    const e = getEdges(cmp.style)
    xRefs.push(
      { pos: e.left, top: e.top, bottom: e.bottom },
      { pos: e.centerX, top: e.top, bottom: e.bottom },
      { pos: e.right, top: e.top, bottom: e.bottom }
    )
    yRefs.push(
      { pos: e.top, left: e.left, right: e.right },
      { pos: e.centerY, left: e.left, right: e.right },
      { pos: e.bottom, left: e.left, right: e.right }
    )
  })

  // 找最佳 X 吸附：遍历被拖组件三条边与所有 X 参考线，取最近且在阈值内的
  let bestSnapX = 0
  let bestXRef: (typeof xRefs)[0] | null = null
  let bestDistX = SNAP_THRESHOLD

  for (const edge of targetXEdges) {
    for (const ref of xRefs) {
      const dist = Math.abs(edge - ref.pos)
      if (dist < bestDistX) {
        bestDistX = dist
        bestSnapX = ref.pos - edge
        bestXRef = ref
      }
    }
  }

  // 找最佳 Y 吸附
  let bestSnapY = 0
  let bestYRef: (typeof yRefs)[0] | null = null
  let bestDistY = SNAP_THRESHOLD

  for (const edge of targetYEdges) {
    for (const ref of yRefs) {
      const dist = Math.abs(edge - ref.pos)
      if (dist < bestDistY) {
        bestDistY = dist
        bestSnapY = ref.pos - edge
        bestYRef = ref
      }
    }
  }

  // 生成辅助线：从被拖组件一端延伸到参考组件一端
  const guides: GuideLine[] = []
  if (bestXRef) {
    guides.push({
      type: 'vertical',
      position: bestXRef.pos,
      start: Math.min(target.top, bestXRef.top),
      end: Math.max(target.bottom, bestXRef.bottom),
    })
  }
  if (bestYRef) {
    guides.push({
      type: 'horizontal',
      position: bestYRef.pos,
      start: Math.min(target.left, bestYRef.left),
      end: Math.max(target.right, bestYRef.right),
    })
  }

  return { snapX: bestSnapX, snapY: bestSnapY, guides }
}
