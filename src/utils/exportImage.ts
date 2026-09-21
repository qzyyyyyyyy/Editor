import { toPng } from 'html-to-image'
import type { ICanvas } from '@/store/editStoreTypes'

// 导出像素比：2 倍图，在高分屏上更清晰
const PIXEL_RATIO = 2

// 去掉文件名中 Windows / 浏览器下载不允许的字符
const sanitizeFileName = (name: string) =>
  name.replace(/[\\/:*?"<>|]/g, '_').trim() || '未命名'

/**
 * 把当前画布导出为 PNG 并触发浏览器下载。
 * 导出前会临时归一化编辑态（取消缩放、隐藏选中框），完成后再恢复，
 * 用户在界面上无感知；无论成功失败都会恢复现场。
 *
 * @param canvas 当前画布数据（由调用方从 store 取出传入，避免 utils 反向依赖 store）
 */
export const exportCanvasAsImage = async (canvas: ICanvas): Promise<void> => {
  const node = document.getElementById('canvas')
  if (!node) {
    throw new Error('未找到画布节点')
  }

  // 1. 临时去掉画布的 scale，按真实尺寸（如 320x568）导出，
  //    否则会按当前缩放比例截出放大/缩小后的尺寸
  const originalTransform = node.style.transform
  node.style.transform = 'none'

  // 2. 临时移除选中组件的 outline（.selectedBorder 是挂在组件外层的
  //    全局类，不能整体 filter 掉，否则组件本身也会从图里消失）
  const selectedNodes = Array.from(
    node.querySelectorAll<HTMLElement>('.selectedBorder')
  )
  selectedNodes.forEach((el) => el.classList.remove('selectedBorder'))

  try {
    const dataUrl = await toPng(node, {
      pixelRatio: PIXEL_RATIO,
      // 与画布默认背景一致，避免透明背景
      backgroundColor: (canvas.style.backgroundColor as string) || '#ffffff',
      // 排除编辑 UI：EditBox（红色选中框、拉伸点、文字编辑 textarea）
      filter: (el) =>
        !(el instanceof HTMLElement && el.hasAttribute('data-export-ignore')),
    })

    // 3. 触发浏览器下载
    const link = document.createElement('a')
    link.download = `${sanitizeFileName(canvas.title)}.png`
    link.href = dataUrl
    link.click()
  } finally {
    // 4. 恢复现场
    node.style.transform = originalTransform
    selectedNodes.forEach((el) => el.classList.add('selectedBorder'))
  }
}
