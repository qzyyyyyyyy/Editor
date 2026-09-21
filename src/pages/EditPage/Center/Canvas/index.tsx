import styles from './index.module.less'
import useEditStore, { addCmp } from '@/store/editStore'
import type { ICmp } from '@/store/editStoreTypes'
import Cmp from '../Cmp'
import EditBox from '../EditBox'
import type { DragEvent } from 'react'
import useZoomStore from '@/store/zoomStore'
export default function Canvas() {
  const zoom = useZoomStore((state) => state.zoom)
  const canvas = useEditStore((state) => state.canvas)
  const assembly = useEditStore((state) => state.assembly)
  const { cmps } = canvas
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    //读取拖拽数据
    const raw = e.dataTransfer.getData('drag-cap')
    if (!raw) {
      return
    }
    const dragCmp = JSON.parse(raw) as ICmp
    ///读取用户松手位置
    const endX = e.pageX
    const endY = e.pageY

    const canvasRect = e.currentTarget.getBoundingClientRect()
    const canvasDomPos = {
      top: canvasRect.top + window.scrollY,
      left: canvasRect.left + window.scrollX,
    }

    // 视觉坐标 → 画布坐标系坐标（除以缩放比例还原）
    const scale = zoom / 100
    const disX = (endX - canvasDomPos.left) / scale
    const disY = (endY - canvasDomPos.top) / scale

    dragCmp.style.left = disX - (dragCmp.style.width as number) / 2
    dragCmp.style.top = disY - (dragCmp.style.height as number) / 2
    //把组件存在state store 中
    addCmp(dragCmp)
  }

  return (
    <div
      id="canvas"
      className={styles.main}
      style={{
        ...canvas.style,
        backgroundImage: `url(${styles.backgroundImage})`,
        transform: `scale(${zoom / 100})`,
      }}
      onDrop={onDrop}
      onDragOver={(e: DragEvent<HTMLDivElement>) => e.preventDefault()}
    >
      {cmps.map((item, index) => (
        <Cmp
          key={item.key}
          cmp={item}
          index={index}
          isSelected={assembly.has(index)}
        />
      ))}
      <EditBox />
    </div>
  )
}
