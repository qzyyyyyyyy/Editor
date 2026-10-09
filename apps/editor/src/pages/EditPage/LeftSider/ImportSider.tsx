import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import { UploadOutlined } from '@ant-design/icons'
import { message } from 'antd'
import leftSideStyles from './leftSide.module.less'
import { addCmp } from '@/store/editStore'
import { defaultComponentStyle, isImgComponent } from '@/utils/const'

// 导入图片在 320x568 画布上的最大占位，超出按比例缩小
const MAX_WIDTH = 200
const MAX_HEIGHT = 300
// 一次导入多张时，组件依次错位摆放，避免完全重叠
const MULTI_OFFSET = 20

// 读取本地文件为 dataURL：存入画布后无跨域问题，导出图片也不会污染 canvas
const readFileAsDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

// 获取图片真实像素尺寸（需要等图片加载完成）
const loadImageSize = (
  src: string
): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = reject
    img.src = src
  })

const ImportSider = () => {
  const inputRef = useRef<HTMLInputElement>(null)

  const onFilesChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    // 先清空 value：否则连续两次选同一个文件不会再触发 change
    e.target.value = ''
    if (files.length === 0) {
      return
    }

    let imported = 0
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) {
        message.warning(`「${file.name}」不是图片，已跳过`)
        continue
      }

      try {
        const dataUrl = await readFileAsDataURL(file)
        const { width: rawWidth, height: rawHeight } =
          await loadImageSize(dataUrl)

        // 等比缩放到画布合适尺寸，小图保持原尺寸
        const scale = Math.min(1, MAX_WIDTH / rawWidth, MAX_HEIGHT / rawHeight)
        const offset = i * MULTI_OFFSET

        addCmp({
          type: isImgComponent,
          value: dataUrl,
          style: {
            ...defaultComponentStyle,
            width: Math.round(rawWidth * scale),
            height: Math.round(rawHeight * scale),
            top: offset,
            left: offset,
          },
        })
        imported++
      } catch {
        message.error(`「${file.name}」导入失败`)
      }
    }

    if (imported > 0) {
      message.success(`成功导入 ${imported} 张图片`)
    }
  }

  return (
    <div className={leftSideStyles.main}>
      {/* 隐藏的原生文件选择器，点击上传区域时程序化触发 */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className={leftSideStyles.fileInput}
        onChange={onFilesChange}
      />
      <div
        className={leftSideStyles.upload}
        onClick={() => inputRef.current?.click()}
      >
        <UploadOutlined className={leftSideStyles.uploadIcon} />
        <span className={leftSideStyles.uploadText}>点击导入本地图片</span>
        <span className={leftSideStyles.uploadTip}>
          支持多选，自动添加到画布
        </span>
      </div>
    </div>
  )
}

export default ImportSider
