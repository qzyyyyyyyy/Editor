import { updateAssemblyCmpsByDistance } from '@/store/editStore'
import styles from './index.module.less'
import { throttle } from 'lodash-es'
import { commitHistoryIfChanged } from '@/store/editStore'
import type { MouseEvent } from 'react'

interface IStretchProps {
  zoom: number
  style: any
}

export default function StretchDots(props: IStretchProps) {
  const { zoom, style } = props
  const { width, height, transform } = style

  // 伸缩组件 style top left width height
  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const direction = (e.target as HTMLElement).dataset.direction

    if (!direction) return

    e.preventDefault()
    e.stopPropagation()

    let startX = e.pageX
    let startY = e.pageY

    const move = throttle((e) => {
      const x = e.pageX
      const y = e.pageY

      let disX = x - startX
      let disY = y - startY

      disX = disX * (100 / zoom)
      disY = disY * (100 / zoom)

      let newStyle: any = {}
      if (direction) {
        if (direction.indexOf('top') >= 0) {
          disY = 0 - disY
          newStyle.top = -disY
        }
        if (direction.indexOf('left') >= 0) {
          disX = 0 - disX
          newStyle.left = -disX
        }
      }
      Object.assign(newStyle, { width: disX, height: disY })

      updateAssemblyCmpsByDistance(newStyle)

      startX = x
      startY = y
    }, 50)

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
      {/* 左上角 */}
      <div
        className={styles.stretchDot}
        style={{
          top: -10,
          left: -10,
          transform,
          cursor: 'nwse-resize',
        }}
        data-direction="top, left"
        onMouseDown={onMouseDown}
      />
      {/* 上边中点 */}
      <div
        className={styles.stretchDot}
        style={{
          top: -10,
          left: width / 2 - 8,
          transform,
          cursor: 'row-resize',
        }}
        data-direction="top"
        onMouseDown={onMouseDown}
      />
      {/* 右上角 */}
      <div
        className={styles.stretchDot}
        style={{
          top: -10,
          left: width - 5,
          transform,
          cursor: 'nesw-resize',
        }}
        data-direction="top right"
        onMouseDown={onMouseDown}
      />
      {/* 右边中点 */}
      <div
        className={styles.stretchDot}
        style={{
          top: height / 2 - 8,
          left: width - 5,
          transform,
          cursor: 'col-resize',
        }}
        data-direction="right"
        onMouseDown={onMouseDown}
      />
      {/* 右下角 */}
      <div
        className={styles.stretchDot}
        style={{
          top: height - 5,
          left: width - 5,
          transform,
          cursor: 'nwse-resize',
        }}
        data-direction="bottom right"
        onMouseDown={onMouseDown}
      />
      {/* 下边中点 */}
      <div
        className={styles.stretchDot}
        style={{
          top: height - 5,
          left: width / 2 - 8,
          transform,
          cursor: 'row-resize',
        }}
        data-direction="bottom"
        onMouseDown={onMouseDown}
      />
      {/* 左下角 */}
      <div
        className={styles.stretchDot}
        style={{
          top: height - 5,
          left: -10,
          transform,
          cursor: 'nesw-resize',
        }}
        data-direction="bottom left"
        onMouseDown={onMouseDown}
      />
      {/* 左边中点 */}
      <div
        className={styles.stretchDot}
        style={{
          top: height / 2 - 8,
          left: -10,
          transform,
          cursor: 'col-resize',
        }}
        data-direction="left"
        onMouseDown={onMouseDown}
      />
    </>
  )
}
