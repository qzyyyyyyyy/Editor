import leftSideStyles from './leftSide.module.less'
import { addCmp } from '@/store/editStore'
import type { CSSProperties } from 'react'
import { defaultComponentStyle, isImgComponent } from '@/utils/const'

const defaultStyle: CSSProperties = {
  ...defaultComponentStyle,
  width: 100,
  height: 100,
}

// 分三段批量导入（路径必须以 / 开头，不能用 @/）
const gifModules = import.meta.glob('/src/assets/images/Angelina/GIF/*.gif', {
  eager: true,
  query: '?url',
  import: 'default',
})
const pngModules = import.meta.glob('/src/assets/images/Angelina/PNG/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
})
const uiModules = import.meta.glob('/src/assets/images/Angelina/UI素材/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
})

// glob 返回 { 路径: url }，转成数组方便渲染
const toSettings = (modules: Record<string, string>) =>
  Object.entries(modules).map(([path, url]) => ({
    value: url,
    style: { ...defaultStyle },
    key: path.split('/').pop() || path,
  }))

const groups = [
  { title: 'GIF', items: toSettings(gifModules) },
  { title: 'PNG', items: toSettings(pngModules) },
  { title: 'UI素材', items: toSettings(uiModules) },
]

const ImgSider = () => {
  return (
    <div
      className={leftSideStyles.main}
      style={{ overflowY: 'auto', maxHeight: '100%' }}
    >
      {groups.map((group) => (
        <div key={group.title}>
          <div
            style={{
              fontSize: 12,
              color: '#999',
              padding: '8px 4px 4px',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            {group.title}({group.items.length})
          </div>
          <ul className={leftSideStyles.box}>
            {group.items.map((item) => (
              <li
                draggable={true}
                key={item.key}
                className={leftSideStyles.item}
                onClick={() => addCmp({ ...item, type: isImgComponent })}
                onDragStart={(e) =>
                  e.dataTransfer.setData(
                    'drag-cap',
                    JSON.stringify({ ...item, type: isImgComponent })
                  )
                }
              >
                <img
                  src={item.value}
                  alt=""
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: 'cover',
                    pointerEvents: 'none',
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default ImgSider
