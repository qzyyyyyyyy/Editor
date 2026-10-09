import classNames from 'classnames'
import { memo, useState } from 'react'
import { UploadOutlined, AppstoreOutlined } from '@ant-design/icons'
import styles from './index.module.less'
import TextSider from './TextSider'
import ImgSider from './ImgSider'
import GraphSider from './GraphSider'
import ImportSider from './ImportSider'
import LayerSider from './LayerSider'
import {
  isTextComponent,
  isImgComponent,
  isGraphComponent,
  isImportComponent,
} from '@/utils/const'

// 图层面板的侧栏标识（面板 id 与组件类型值共用一个编号空间）
const isLayerPanel = 5

const LeftSider = memo(() => {
  const [showSide, setShowSide] = useState(0)

  const _setShowSide = (which: number | undefined) => {
    if (showSide === which) {
      setShowSide(0)
    } else {
      setShowSide(which || 0)
    }
  }

  return (
    <div className={styles.main}>
      <ul className={styles.cmps}>
        <li
          className={classNames(
            styles.cmp,
            showSide === isTextComponent ? styles.selected : ''
          )}
          onClick={() => _setShowSide(isTextComponent)}
        >
          <i className={classNames('iconfont icon-icon', styles.cmpIcon)} />
          <span className={styles.cmpText}>文本</span>
        </li>
        <li
          className={classNames(
            styles.cmp,
            showSide === isImgComponent ? styles.selected : ''
          )}
          onClick={() => _setShowSide(isImgComponent)}
        >
          <i className={classNames('iconfont icon-icon1', styles.cmpIcon)} />
          <span className={styles.cmpText}>图片</span>
        </li>
        <li
          className={classNames(
            styles.cmp,
            showSide === isGraphComponent ? styles.selected : ''
          )}
          onClick={() => _setShowSide(isGraphComponent)}
        >
          <i className={classNames('iconfont icon-shape', styles.cmpIcon)} />
          <span className={styles.cmpText}>图形</span>
        </li>
        <li
          className={classNames(
            styles.cmp,
            showSide === isImportComponent ? styles.selected : ''
          )}
          onClick={() => _setShowSide(isImportComponent)}
        >
          <UploadOutlined className={styles.cmpIcon} />
          <span className={styles.cmpText}>导入</span>
        </li>
        <li
          className={classNames(
            styles.cmp,
            showSide === isLayerPanel ? styles.selected : ''
          )}
          onClick={() => _setShowSide(isLayerPanel)}
        >
          <AppstoreOutlined className={styles.cmpIcon} />
          <span className={styles.cmpText}>图层</span>
        </li>
      </ul>

      {showSide === isTextComponent && <TextSider />}
      {showSide === isImgComponent && <ImgSider />}
      {showSide === isGraphComponent && <GraphSider />}
      {showSide === isImportComponent && <ImportSider />}
      {showSide === isLayerPanel && <LayerSider />}
    </div>
  )
})

export default LeftSider
