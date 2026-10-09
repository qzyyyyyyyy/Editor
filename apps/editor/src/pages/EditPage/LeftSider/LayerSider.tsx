import classNames from 'classnames'
import { useRef } from 'react'
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  LockOutlined,
  UnlockOutlined,
  FontSizeOutlined,
  PictureOutlined,
  StarOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import useEditStore, {
  moveCmp,
  toggleCmpLocked,
  toggleCmpVisible,
  setCmpSelected,
} from '@/store/editStore'
import { isTextComponent, isImgComponent, isGraphComponent, isImportComponent, SHAPES } from '@/utils/const'
import type { ICmpWithKey } from '@/store/editStoreTypes'
import styles from './layerSider.module.less'

// 组件在图层面板里的显示名称
const getCmpLabel = (cmp: ICmpWithKey): string => {
  switch (cmp.type) {
    case isTextComponent:
      return `文本：${cmp.value.slice(0, 6)}` || '文本'
    case isImgComponent:
      return '图片'
    case isGraphComponent: {
      const shape = SHAPES.find((s) => s.key === cmp.value)
      return shape ? shape.label : '图形'
    }
    case isImportComponent:
      return '导入'
    default:
      return '组件'
  }
}

// 组件在图层面板里的类型图标
const getCmpIcon = (type: number) => {
  switch (type) {
    case isTextComponent:
      return <FontSizeOutlined />
    case isImgComponent:
      return <PictureOutlined />
    case isGraphComponent:
      return <StarOutlined />
    case isImportComponent:
      return <UploadOutlined />
    default:
      return <StarOutlined />
  }
}

// 图层面板：从上到下 = 图层从顶到底（cmps 下标倒序展示）
const LayerSider = () => {
  const cmps = useEditStore((state) => state.canvas.cmps)
  const assembly = useEditStore((state) => state.assembly)

  // 拖拽排序：记录拖起行与悬停行的画布下标（面板展示是倒序）
  const dragFrom = useRef<number | null>(null)
  const dragOverTo = useRef<number | null>(null)

  const items = cmps.map((cmp, index) => ({ cmp, index })).reverse()

  const handleDrop = () => {
    const from = dragFrom.current
    const to = dragOverTo.current
    dragFrom.current = null
    dragOverTo.current = null
    if (from !== null && to !== null) {
      moveCmp(from, to)
    }
  }

  return (
    <div className={styles.main}>
      <div className={styles.header}>图层</div>
      {items.length === 0 ? (
        <div className={styles.empty}>画布暂无组件</div>
      ) : (
        <ul className={styles.list}>
          {items.map(({ cmp, index }) => {
            const hidden = cmp.visible === false
            const locked = cmp.locked === true
            return (
              <li
                key={cmp.key}
                className={classNames(
                  styles.row,
                  assembly.has(index) && styles.selected
                )}
                onClick={() => setCmpSelected(index)}
                draggable
                onDragStart={() => {
                  dragFrom.current = index
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  dragOverTo.current = index
                }}
                onDrop={handleDrop}
                onDragEnd={() => {
                  dragFrom.current = null
                  dragOverTo.current = null
                }}
              >
                <span className={styles.typeIcon}>{getCmpIcon(cmp.type)}</span>
                <span
                  className={classNames(
                    styles.label,
                    hidden && styles.dimText
                  )}
                >
                  {getCmpLabel(cmp)}
                </span>
                <span
                  className={styles.action}
                  title={hidden ? '显示' : '隐藏'}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleCmpVisible(index)
                  }}
                >
                  {hidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </span>
                <span
                  className={classNames(
                    styles.action,
                    locked && styles.lockedAction
                  )}
                  title={locked ? '解锁' : '锁定'}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleCmpLocked(index)
                  }}
                >
                  {locked ? <LockOutlined /> : <UnlockOutlined />}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default LayerSider
