import { useState, useRef, useEffect } from 'react'
import { SketchPicker } from 'react-color'

export default function InputColor({ onChangeComplete, color, ...rest }: any) {
  const [visible, setVisible] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // 打开时监听 document：点击组件外部（色块和面板之外）才关闭，
  // 鼠标在面板内移动/拖动色盘不再触发关闭
  useEffect(() => {
    if (!visible) return
    const onDocMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setVisible(false)
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [visible])

  return (
    <div
      ref={rootRef}
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        width: '100%',
        minHeight: 32,
        padding: 4,
        backgroundColor: color,
        border: '1px solid #d9d9d9',
        borderRadius: 4,
        cursor: 'pointer',
      }}
      {...rest}
      onClick={() => {
        setVisible((v) => !v)
      }}
    >
      {visible && (
        <div
          style={{
            zIndex: 1,
            position: 'relative',
            marginTop: '32px',
            marginLeft: '-70px',
            padding: '10px',
            width: '340px',
            border: 'solid 1px #333',
            backgroundColor: 'white',
          }}
          onClick={(e) => {
            // 阻止点击面板内部时冒泡到外层色块的 toggle
            e.stopPropagation()
          }}
        >
          <span
            style={{
              zIndex: 999,
              position: 'absolute',
              top: 0,
              left: '4px',
              color: '#999',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation()
              setVisible(false)
            }}
          >
            关闭
          </span>
          <SketchPicker color={color} onChangeComplete={onChangeComplete} />
        </div>
      )}
    </div>
  )
}
