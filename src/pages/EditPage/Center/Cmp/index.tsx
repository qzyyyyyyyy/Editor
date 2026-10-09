import type { ICmpWithKey } from '@/store/editStoreTypes'
import type { MouseEvent } from 'react'
import styles from './index.module.less'
import {
  isTextComponent,
  isImgComponent,
  isGraphComponent,
} from '@/utils/const'
import { Text, Img, Shape } from './CmpDetail'
import classNames from 'classnames'
import { pick, omit } from 'lodash-es'
import { setCmpsSelected, setCmpSelected } from '@/store/editStore'

interface ICmpProps {
  cmp: ICmpWithKey
  index: number
  isSelected: boolean
}

export default function Cmp(props: ICmpProps) {
  const { cmp, index, isSelected } = props
  const { style } = cmp

  // 隐藏的组件不在画布渲染（导出图片时同样不出现），仅图层面板可见
  if (cmp.visible === false) {
    return null
  }

  const setSelected = (e: MouseEvent<HTMLDivElement>) => {
    // 锁定的组件画布上不可选中，需先在图层面板解锁
    if (cmp.locked === true) {
      return
    }
    // ⌘(Mac) 或 Ctrl(Win/Linux) + 点击 → 多选切换；普通点击 → 单选
    if (e.metaKey || e.ctrlKey) {
      setCmpsSelected([index])
    } else {
      setCmpSelected(index)
    }
  }

  const outerStyle = pick(style, [
    'position',
    'top',
    'left',
    'width',
    'height',
    'transform',
  ])

  // 图形组件的填充/描边交给 SVG，不在内层 div 上重复绘制，避免出现多余的背景色/边框
  const innerStyle =
    cmp.type === isGraphComponent
      ? omit(
          style,
          'position',
          'top',
          'left',
          'backgroundColor',
          'borderColor',
          'borderWidth',
          'borderStyle',
          'transform'
        )
      : omit(style, 'position', 'top', 'left', 'transform')

  return (
    <div
      className={classNames(styles.main, isSelected && 'selectedBorder')}
      style={{
        ...outerStyle,
        zIndex: isSelected ? 9999 : index,
      }}
      onClick={setSelected}
    >
      <div className={styles.inner} style={{ ...innerStyle }}>
        {/* Text/Img 只需要 value；不要 {...cmp}，否则 cmp 里的 key 会通过
            spread 传入 JSX，React 要求 key 必须显式写、不能 spread */}
        {cmp.type === isTextComponent && <Text value={cmp.value} />}
        {cmp.type === isImgComponent && <Img value={cmp.value} />}
        {cmp.type === isGraphComponent && (
          <Shape
            shape={cmp.value || 'rect'}
            fill={style.backgroundColor as string}
            stroke={style.borderColor as string}
            strokeWidth={style.borderWidth as number}
            strokeStyle={style.borderStyle as string}
          />
        )}
      </div>
    </div>
  )
}
