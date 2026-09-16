// import useEditStore, { selectedCmpIndexSelector } from "src/store/editStore";
import { useEffect } from "react"
import styles from "./index.module.less"
import Canvas from "./Canvas"
import Zoom from "./Zoom"
import useZoomStore from "@/store/zoomStore"
import useEditStore, {
  copySelectedCmps,
  delSelectedCmps,
  pasteCmps,
  setAllCmpsSelected,
  setCmpSelected
} from "@/store/editStore"
import { goNextCanvasHistory, goPrevCanvasHistory } from "@/store/historySlice"

export default function Center() {
  const canvas = useEditStore((state) => state.canvas)
  const { zoom, zoomIn, zoomOut } = useZoomStore()

  // 全局快捷键：挂在 document 上，不依赖 #center 是否聚焦，
  // 点击过 Header 按钮后依然可用；Center 卸载时自动移除监听
  useEffect(() => {
    const keyDown = (e: KeyboardEvent) => {
      // 在输入框 / textarea / 富文本里编辑时不抢占快捷键，
      // Ctrl+Z、Ctrl+A 等交给浏览器原生文本编辑行为
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return
      }

      // Backspace / Delete 删除选中组件；
      // 无选中时不拦截，保留浏览器默认行为（如页面后退等）
      if (e.code === "Backspace" || e.code === "Delete") {
        if (useEditStore.getState().assembly.size > 0) {
          e.preventDefault()
          delSelectedCmps()
        }
        return
      }

      // Ctrl/Cmd 组合键
      if (e.ctrlKey || e.metaKey) {
        switch (e.code) {
          case "KeyA":
            e.preventDefault()
            setAllCmpsSelected()
            break

          case "Equal":
            e.preventDefault()
            zoomOut()
            break
          case "Minus":
            e.preventDefault()
            zoomIn()
            break

          // Ctrl/Cmd + C 复制选中组件到内存剪贴板；
          // 无选中时不拦截，保留浏览器原生复制（如复制页面文字）
          case "KeyC":
            if (useEditStore.getState().assembly.size > 0) {
              e.preventDefault()
              copySelectedCmps()
            }
            break

          // Ctrl/Cmd + V 粘贴，剪贴板为空时 pasteCmps 内部直接返回
          case "KeyV":
            e.preventDefault()
            pasteCmps()
            break

          // Ctrl/Cmd + Z 撤销；再加 Shift 重做
          case "KeyZ":
            e.preventDefault()
            if (e.shiftKey) {
              goNextCanvasHistory()
            } else {
              goPrevCanvasHistory()
            }
            break
        }
      }
    }

    document.addEventListener("keydown", keyDown)
    return () => document.removeEventListener("keydown", keyDown)
  }, [zoomIn, zoomOut])

  return (
    <div
      id="center"
      className={styles.main}
      style={{
        minHeight: (zoom / 100) * (canvas.style.height as number) + 100
      }}
      onClick={(e) => {
        // 点灰色空白区(center)或白色画布空白处(canvas)都取消选中；
        // 点组件时 e.target 是组件(无这两个 id)，不处理，由组件自己的 onClick 选中
        const targetId = (e.target as HTMLElement)?.id
        if (targetId === "center" || targetId === "canvas") {
          setCmpSelected(-1)
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault()
      }}
    >
      <Canvas />

      <Zoom />
    </div>
  )
}
