import type { MouseEvent } from 'react'
import { throttle } from 'lodash-es'
import {
  setSelectedCmpStyleNoHistory,
  commitHistoryIfChanged,
} from '@/store/editStore'
import styles from './StretchDots/index.module.less'

interface IRotateDotProps {
  // 选中框宽度（画布坐标系），用于手柄水平居中
  width: number
  // 当前组件的 transform，用于解析起始角度
  transform?: string
}

// 从 transform: rotate(Ndeg) 中解析角度；无 transform 视为 0
const parseDeg = (t?: string): number => {
  const m = t?.match(/rotate\((-?\d+(?:\.\d+)?)deg\)/)
  return m ? parseFloat(m[1]) : 0
}

// 特殊角吸附目标与阈值（度）
const SNAP_DEGREES = [0, 90, 180, -90, -180]
const SNAP_DEG_THRESHOLD = 5

export default function RotateDot({ width, transform }: IRotateDotProps) {
  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    // 阻止冒泡：避免触发 EditBox 的拖拽移动
    e.preventDefault()
    e.stopPropagation()

    // 中心点取 EditBox 的包围盒中心；EditBox 有 transform 时 rect 中心
    // 仍是旋转中心（transform-origin 默认为中心），且 rect/clientX 同为视口
    // 坐标系，等比缩放不影响 atan2 角度，因此无需 zoom 换算
    const editBoxEl = (e.currentTarget as HTMLElement).parentElement
    if (!editBoxEl) {
      return
    }
    const rect = editBoxEl.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const startMouseAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
    const startDeg = parseDeg(transform)

    const move = throttle((ev: globalThis.MouseEvent) => {
      const angle = Math.atan2(ev.clientY - centerY, ev.clientX - centerX)
      let deg = Math.round(startDeg + ((angle - startMouseAngle) * 180) / Math.PI)
      // 归一化到 (-180, 180]
      deg = ((deg % 360) + 360) % 360
      if (deg > 180) {
        deg -= 360
      }
      // 特殊角吸附：接近 0/±90/±180 时贴齐
      for (const target of SNAP_DEGREES) {
        if (Math.abs(deg - target) <= SNAP_DEG_THRESHOLD) {
          deg = target
          break
        }
      }
      setSelectedCmpStyleNoHistory({
        transform: deg === 0 ? '' : `rotate(${deg}deg)`,
      })
    }, 16)

    const up = () => {
      commitHistoryIfChanged()
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', up)
    }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }

  return (
    <>
      {/* 连接线：选中框顶部中点 → 手柄，跟随 EditBox 旋转 */}
      <div
        className={styles.rotateLine}
        style={{ top: -30, left: width / 2 - 1, height: 30 }}
      />
      <div
        className={styles.rotateDot}
        style={{ top: -38, left: width / 2 - 7 }}
        onMouseDown={onMouseDown}
      />
    </>
  )
}
