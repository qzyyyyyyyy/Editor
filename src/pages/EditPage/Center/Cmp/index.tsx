import type { ICmpWithKey } from '@/store/editStoreTypes'
import type { MouseEvent } from 'react'
import styles from './index.module.less'
import { isTextComponent, isImgComponent } from '@/utils/const'
import { Text, Img } from './CmpDetail'
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

  const setSelected = (e: MouseEvent<HTMLDivElement>) => {
    // ⌘(Mac) 或 Ctrl(Win/Linux) + 点击 → 多选切换；普通点击 → 单选
    if (e.metaKey || e.ctrlKey) {
      setCmpsSelected([index])
    } else {
      setCmpSelected(index)
    }
  }

  const outerStyle = pick(style, ['position', 'top', 'left', 'width', 'height'])

  const innerStyle = omit(style, 'position', 'top', 'left')

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
      </div>
    </div>
  )
}
