import classNames from 'classnames'
import { createPortal } from 'react-dom'
import { useLayoutEffect, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import {
  bringSelectedCmpToFront,
  delSelectedCmps,
  duplicateSelectedCmps,
  moveSelectedCmpDown,
  moveSelectedCmpUp,
  sendSelectedCmpToBack,
} from '@/store/editStore'
import styles from './index.module.less'

interface MenuProps {
  // 鼠标右键位置（视口坐标，配合 position: fixed 使用）
  x: number
  y: number
  assemblySize: number
  onClose: () => void
}

// 菜单距视口边缘至少留的间隙
const EDGE_GAP = 8

export default function Menu({ x, y, assemblySize, onClose }: MenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x, y })

  // 挂载后按菜单实际尺寸做视口边缘翻转：
  // 靠近右边/下边时，改为向左/向上展开，避免超出屏幕
  useLayoutEffect(() => {
    const el = menuRef.current
    if (!el) {
      return
    }
    const rect = el.getBoundingClientRect()
    let nextX = x
    let nextY = y
    if (x + rect.width > window.innerWidth - EDGE_GAP) {
      nextX = x - rect.width
    }
    if (y + rect.height > window.innerHeight - EDGE_GAP) {
      nextY = y - rect.height
    }
    setPos({ x: nextX, y: nextY })
  }, [x, y])

  // Esc 关闭
  useLayoutEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  if (assemblySize === 0) {
    return null
  }

  // 点击菜单内部不要冒泡到 document（外部点击关闭逻辑），
  // 否则菜单项的 onClick 还没执行就先被关掉了
  const stopMouseDown = (e: ReactMouseEvent) => {
    e.stopPropagation()
  }

  // 统一的菜单项点击：执行动作后关闭菜单
  const run = (action: () => void) => (e: ReactMouseEvent) => {
    e.stopPropagation()
    action()
    onClose()
  }

  return createPortal(
    <div
      ref={menuRef}
      className={classNames(styles.main)}
      style={{ left: pos.x, top: pos.y }}
      onMouseDown={stopMouseDown}
      onClick={onClose}
    >
      <ul className={styles.menu}>
        <li onClick={run(duplicateSelectedCmps)}>复制组件</li>
        <li onClick={run(delSelectedCmps)}>删除组件</li>
        {assemblySize === 1 && (
          <>
            <li className={styles.divider} />
            <li onClick={run(moveSelectedCmpUp)}>上移一层</li>
            <li onClick={run(moveSelectedCmpDown)}>下移一层</li>
            <li onClick={run(bringSelectedCmpToFront)}>置顶</li>
            <li onClick={run(sendSelectedCmpToBack)}>置底</li>
          </>
        )}
      </ul>
    </div>,
    document.body
  )
}
