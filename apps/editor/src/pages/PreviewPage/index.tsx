import styles from './index.module.less'
import { useCanvasId } from '@/store/hooks'
import { getCanvasById } from '@/services/canvasService'
import { parseCanvas } from '@/store/editStore'
import Cmp from '../EditPage/Center/Cmp'

// 预览页：只读渲染画布
// 注意：预览通过 window.open 新开标签页，store 是全新实例，
// 所以这里直接从 localStorage 按 id 取数据，而不是读编辑器的 store
export default function PreviewPage() {
  const id = useCanvasId()
  const record = id != null ? getCanvasById(id) : undefined

  if (!record) {
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
