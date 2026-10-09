import useEditStore, {
  updateAssemblyCmpsByDistance,
  updateSelectedCmpAttr,
  updateSelectedCmpStyle,
} from '@/store/editStore'
import type { MouseEvent } from 'react'
import styles from './index.module.less'
import { throttle, omit } from 'lodash-es'
import useZoomStore from '@/store/zoomStore'
import StretchDots from './StretchDots'
import RotateDot from './RotateDot'
import { isTextComponent } from '@/utils/const'
import { useState, useEffect } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { commitHistoryIfChanged } from '@/store/editStore'
import Menu from '../Menu'
import { computeSnap } from '../snap'
import useSnapStore from '../snapStore'

export default function EditBox() {
  const zoom = useZoomStore((state) => state.zoom)
  const cmps = useEditStore((state) => state.canvas.cmps)
  const assembly = useEditStore((state) => state.assembly)
  const canvasStyle = useEditStore((state) => state.canvas.style)
  const selectedCmp = cmps[Array.from(assembly)[0]]
  const size = assembly.size
  const [textareaFocused, setTextareaFocused] = useState(false)
  // 右键菜单：null 表示关闭；有值时为鼠标的视口坐标
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)

  // 切换选中组件或选中数量变化时退出编辑态，
  // 避免 A 组件的编辑态残留到 B 组件 / 多选状态
  const selectedKey = selectedCmp?.key
  useEffect(() => {
    setTextareaFocused(false)
  }, [selectedKey, size])

  // 右键菜单打开期间：点击菜单外部或窗口缩放时关闭
  useEffect(() => {
    if (!menuPos) {
      return
    }
    const close = () => setMenuPos(null)
    document.addEventListener('mousedown', close)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', close)
      window.removeEventListener('resize', close)
    }
  }, [menuPos])

  const onMouseDownOfCmp = (e: MouseEvent<HTMLDivElement>) => {
    const startPageX = e.pageX
    const startPageY = e.pageY

    // 拖拽开始时的位置快照，用于计算绝对目标位置
    const assemblyArr = Array.from(assembly)
    const startPositions = assemblyArr.map((i) => ({ ...cmps[i].style }))
    const first = startPositions[0]
    let currentLeft = first.left as number
    let currentTop = first.top as number

    // 上一次的 guides，用于去重，避免无意义的 setGuides 触发重渲染
    let lastGuidesKey = ''

    const move = throttle((e) => {
      const totalDeltaX = (e.pageX - startPageX) * (100 / zoom)
      const totalDeltaY = (e.pageY - startPageY) * (100 / zoom)

      // 目标绝对位置 = 起始位置 + 鼠标总位移（不累积，避免吸附粘性）
      let targetLeft = (first.left as number) + totalDeltaX
      let targetTop = (first.top as number) + totalDeltaY

      // 吸附计算：只对单选做吸附
      if (assemblyArr.length === 1) {
        const predStyle = {
          ...first,
          left: targetLeft,
          top: targetTop,
        }
        const { snapX, snapY, guides } = computeSnap(
          predStyle,
          cmps,
          assembly,
          canvasStyle
        )
        targetLeft += snapX
        targetTop += snapY

        // guides 去重：只在内容变化时更新 store，减少 Canvas 重渲染
        const guidesKey = guides
          .map((g) => `${g.type}:${g.position}:${g.start}:${g.end}`)
          .join('|')
        if (guidesKey !== lastGuidesKey) {
          lastGuidesKey = guidesKey
          useSnapStore.getState().setGuides(guides)
        }
      }

      // 增量 = 目标位置 - 当前位置，传给 store 更新
      const disX = targetLeft - currentLeft
      const disY = targetTop - currentTop
      if (disX !== 0 || disY !== 0) {
        updateAssemblyCmpsByDistance({ top: disY, left: disX })
        currentLeft = targetLeft
        currentTop = targetTop
      }
    }, 16)

    const up = () => {
      commitHistoryIfChanged()
      useSnapStore.getState().setGuides([])
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', up)
    }

    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }

  if (size === 0) {
    return null
  }

  let top = 9999,
    left = 9999,
    bottom = -9999,
    right = -9999

  assembly.forEach((index) => {
    const cmp = cmps[index]
    // 本编辑器组件的位置/尺寸存的都是数字像素值，CSSProperties 把它们标成
    // string | number | undefined，这里断言成 number 才能参与算术
    const cmpTop = cmp.style.top as number
    const cmpLeft = cmp.style.left as number
    const cmpWidth = cmp.style.width as number
    const cmpHeight = cmp.style.height as number

    top = Math.min(top, cmpTop)
    left = Math.min(left, cmpLeft)

    bottom = Math.max(bottom, cmpTop + cmpHeight)
    right = Math.max(right, cmpLeft + cmpWidth)
  })

  // outline 不占空间，框的尺寸/位置直接等于包围盒即可；
  // 与组件之间的间隙交给 CSS 的 outline-offset: 2px 处理
  const width = right - left
  const height = bottom - top

  // 单选时 EditBox 跟随组件旋转（多选时不旋转，保持简单清晰）
  const singleTransform =
    size === 1 && selectedCmp ? selectedCmp.style.transform : undefined

  return (
    <div
      className={styles.main}
      data-export-ignore=""
      style={{
        zIndex: 99999,
        top,
        left,
        width,
        height,
        transform: singleTransform,
      }}
      onContextMenu={(e) => {
        // 屏蔽浏览器默认菜单，在鼠标位置打开自定义菜单
        e.preventDefault()
        e.stopPropagation()
        setMenuPos({ x: e.clientX, y: e.clientY })
      }}
      onMouseDown={onMouseDownOfCmp}
      onMouseLeave={() => setTextareaFocused(false)}
      onClick={(e) => {
        e.stopPropagation()
      }}
      onDoubleClick={() => {
        setTextareaFocused(true)
      }}
    >
      {size === 1 &&
        selectedCmp.type === isTextComponent &&
        textareaFocused && (
          <TextareaAutosize
            autoFocus
            value={selectedCmp.value}
            style={{
              // 与包围盒严格对齐：EditBox 正好盖在组件上，
              // textarea 从 (0,0) 铺满，保证编辑态与展示态文字完全重合
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              boxSizing: 'border-box',
              margin: 0,
              padding: 0,
              border: 'none',
              outline: 'none',
              resize: 'none',
              cursor: 'text',
              whiteSpace: 'pre-wrap',
              // textarea 的浏览器默认字体不继承、默认背景为白色，
              // 这里重置为继承/透明，再用组件自身样式覆盖
              font: 'inherit',
              backgroundColor: 'transparent',
              // 其余文字样式与 Cmp 内层 div 保持一致，
              // 位置/尺寸不透传（由 EditBox 定位、高度自动撑开）
              ...omit(selectedCmp.style, [
                'position',
                'top',
                'left',
                'width',
                'height',
              ]),
            }}
            onChange={(e) => {
              updateSelectedCmpAttr('value', e.target.value)
            }}
            onHeightChange={(height) => {
              updateSelectedCmpStyle({ height })
            }}
            // 阻止冒泡：编辑时不要触发 EditBox 的拖拽和双击逻辑
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            // 失焦退出编辑态
            onBlur={() => setTextareaFocused(false)}
          />
        )}

      {menuPos && (
        <Menu
          x={menuPos.x}
          y={menuPos.y}
          assemblySize={size}
          onClose={() => setMenuPos(null)}
        />
      )}
      <StretchDots zoom={zoom} style={{ width, height }} />
      {/* 旋转手柄：仅单选且未锁定时显示；多选旋转语义复杂，暂不支持 */}
      {size === 1 && selectedCmp.locked !== true && (
        <RotateDot
          width={width}
          transform={selectedCmp.style.transform as string | undefined}
        />
      )}
    </div>
  )
}
