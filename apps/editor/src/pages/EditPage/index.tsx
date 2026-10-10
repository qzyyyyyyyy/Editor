import { useEffect } from 'react'
import { Layout } from 'antd'
import styles from './index.module.less'
import LeftSider from './LeftSider'
import Center from './Center'
import RightSider from './RightSider'
import Header from './Header'
import { useCanvasId } from '@/store/hooks'
import { loadCanvas, resetCanvas } from '@/store/editStore'
import useZoomStore from '@/store/zoomStore'
import { getCanvasById } from '@/services'

export default function EditPage() {
  const id = useCanvasId()

  // 挂载 / URL id 变化时：还原对应画布；无 id 或记录不存在则重置为新建
  useEffect(() => {
    useZoomStore.getState().resetZoom()
    if (id == null) {
      resetCanvas()
      return
    }
    let cancelled = false
    void getCanvasById(id).then((record) => {
      if (cancelled) return
      if (record) {
        loadCanvas(record.content)
      } else {
        resetCanvas()
      }
    })
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <Layout className={styles.main}>
      <Header />
      <div className={styles.content}>
        <LeftSider />
        <Center />
        <RightSider />
      </div>
    </Layout>
  )
}
