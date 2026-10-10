import { useEffect, useState } from 'react'
import styles from './index.module.less'
import { Link, useNavigate } from 'react-router-dom'
import classNames from 'classnames'
import { DownloadOutlined } from '@ant-design/icons'
import { useCanvasId, useCanvasType } from '@/store/hooks'
import { saveCanvas, clearCanvas } from '@/store/editStore'
import { message } from 'antd'
import { goPrevCanvasHistory, goNextCanvasHistory } from '@/store/historySlice'
import useEditStore from '@/store/editStore'
import { exportCanvasAsImage } from '@/utils/exportImage'

// 工具条等比缩放：以设计稿宽度 1200px 为基准，窗口变窄时整体缩小；
// 最小 0.6（太窄就不再缩，避免文字糊掉），最大 1（大屏不放大，避免盖住下方内容区）
function useHeaderScale() {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const DESIGN_WIDTH = 1200
    const compute = () => {
      const s = window.innerWidth / DESIGN_WIDTH
      setScale(Math.min(1, Math.max(0.6, s)))
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])

  return scale
}

export default function Header() {
  const id = useCanvasId()
  const type = useCanvasType()
  const navigate = useNavigate()
  const scale = useHeaderScale()

  // 页面的新增与编辑更新
  const save = async () => {
    const savedId = await saveCanvas(id, type)
    if (id === null) {
      // 新增：保存后跳转到带新 id 的 URL，replace 避免在历史中留下无 id 的中间态
      navigate(`?id=${savedId}`, { replace: true })
      message.success('新增成功')
    }
  }

  const saveAndPreview = async () => {
    const savedId = await saveCanvas(id, type)
    message.success('保存成功')

    if (id === null) {
      // 新增：同步 URL，replace 避免历史中留下无 id 的中间态
      navigate(`?id=${savedId}`, { replace: true })
    }

    // 新标签页打开本项目预览页
    window.open(`${location.origin}/preview?id=${savedId}`)
  }

  const emptyCanvas = () => {
    clearCanvas()
  }

  // 导出画布为 PNG：异步截图期间防重复点击，并给出加载/结果反馈
  const [exporting, setExporting] = useState(false)
  const exportImage = async () => {
    if (exporting) {
      return
    }
    setExporting(true)
    const hide = message.loading('正在导出图片...', 0)
    try {
      const canvas = useEditStore.getState().canvas
      await exportCanvasAsImage(canvas)
      message.success('导出成功')
    } catch {
      message.error('导出失败，请重试')
    } finally {
      hide()
      setExporting(false)
    }
  }

  return (
    <div className={styles.main}>
      {/* 设计层：固定 64px 排版，整体随窗口宽度等比缩放 */}
      <div className={styles.bar} style={{ transform: `scale(${scale})` }}>
        <div className={classNames(styles.item)}>
          <Link to="/list" className={styles.link}>
            查看列表
          </Link>
        </div>

        <div className={classNames(styles.item)} onClick={save}>
          <span>
            <i className={classNames('iconfont icon-baocun', styles.icon)}></i>
          </span>
          <span className={styles.txt}>保存</span>
        </div>

        <div className={classNames(styles.item)} onClick={saveAndPreview}>
          <span>
            <i className={classNames('iconfont icon-baocun', styles.icon)}></i>
          </span>
          <span className={styles.txt}>保存并预览</span>
        </div>

        <div
          className={classNames(styles.item)}
          onClick={exportImage}
          style={{ opacity: exporting ? 0.6 : 1 }}
        >
          <span>
            <DownloadOutlined className={styles.icon} />
          </span>
          <span className={styles.txt}>导出图片</span>
        </div>

        <div
          className={classNames(styles.item)}
          onClick={() =>
            useEditStore.setState((draft) => goPrevCanvasHistory(draft))
          }
        >
          <span>
            <i
              className={classNames('iconfont icon-shangyibu', styles.icon)}
            ></i>
          </span>
          <span className={styles.txt}>上一步</span>
          <span className={styles.shortKey}>CMD+Z</span>
        </div>

        <div
          className={classNames(styles.item)}
          onClick={() =>
            useEditStore.setState((draft) => goNextCanvasHistory(draft))
          }
        >
          <span>
            <i
              className={classNames('iconfont icon-xiayibu', styles.icon)}
              style={{ transform: 'rotateY(180deg)' }}
            ></i>
          </span>
          <span className={styles.txt}>下一步</span>
          <span className={styles.shortKey}>CMD+Shift+Z</span>
        </div>

        <div className={classNames(styles.item)} onClick={emptyCanvas}>
          <span>
            <i className={classNames('iconfont icon-qingchu', styles.icon)}></i>
          </span>
          <span className={styles.txt}>清空</span>
        </div>
      </div>
    </div>
  )
}
