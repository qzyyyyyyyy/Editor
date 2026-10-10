import { useEffect, useState } from 'react'
import styles from './index.module.less'
import { useCanvasId } from '@/store/hooks'
import { getCanvasById, type ListItem } from '@/services'
import { parseCanvas } from '@/store/editStore'
import Cmp from '../EditPage/Center/Cmp'

// 预览页：只读渲染画布
export default function PreviewPage() {
  const id = useCanvasId()
  const [record, setRecord] = useState<ListItem | undefined>()

  useEffect(() => {
    if (id == null) return
    let cancelled = false
    void getCanvasById(id).then((r) => {
      if (!cancelled) setRecord(r)
    })
    return () => {
      cancelled = true
    }
  }, [id])

  if (id == null || !record) {
    return <div className={styles.empty}>画布不存在或已被删除</div>
  }

  const canvas = parseCanvas(record.content)

  return (
    <div className={styles.main}>
      <div className={styles.canvas} style={canvas.style}>
        {canvas.cmps.map((cmp, index) => (
          <Cmp key={cmp.key} cmp={cmp} index={index} isSelected={false} />
        ))}
      </div>
    </div>
  )
}
