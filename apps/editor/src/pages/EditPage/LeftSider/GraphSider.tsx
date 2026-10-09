import leftSideStyles from './leftSide.module.less'
import { addCmp } from '@/store/editStore'
import { isGraphComponent, SHAPES } from '@/utils/const'
import { Shape } from '../Center/Cmp/CmpDetail'

// 左侧图形面板预览尺寸
const PREVIEW_SIZE = 64

const GraphSider = () => {
  return (
    <div
      className={leftSideStyles.main}
      style={{ overflowY: 'auto', maxHeight: '100%' }}
    >
      <ul className={leftSideStyles.box}>
        {SHAPES.map((shape) => {
          const { defaultStyle } = shape
          const cmpData = {
            type: isGraphComponent,
            value: shape.key,
            style: defaultStyle,
          }
          return (
            <li
              draggable={true}
              key={shape.key}
              className={leftSideStyles.item}
              onClick={() => addCmp(cmpData)}
              onDragStart={(e) => {
                e.dataTransfer.setData('drag-cap', JSON.stringify(cmpData))
              }}
              title={shape.label}
            >
              <div
                style={{
                  width: PREVIEW_SIZE,
                  height: PREVIEW_SIZE,
                }}
              >
                <Shape
                  shape={shape.key}
                  fill={defaultStyle.backgroundColor as string}
                  stroke={defaultStyle.borderColor as string}
                  strokeWidth={defaultStyle.borderWidth as number}
                  strokeStyle={defaultStyle.borderStyle as string}
                />
              </div>
              <span className={leftSideStyles.shapeLabel}>{shape.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default GraphSider
