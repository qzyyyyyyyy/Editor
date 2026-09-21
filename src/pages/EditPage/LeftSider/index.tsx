import classNames from 'classnames'
import { memo, useState, useEffect } from 'react'
import { UploadOutlined } from '@ant-design/icons'
import styles from './index.module.less'
import TextSider from './TextSider'
import ImgSider from './ImgSider'
import GraphSider from './GraphSider'
import ImportSider from './ImportSider'
import {
  isTextComponent,
  isImgComponent,
  isGraphComponent,
  isImportComponent,
} from '@/utils/const'

const LeftSider = memo(() => {
  const [showSide, setShowSide] = useState(0)

  const _setShowSide = (which: number | undefined) => {
    if (showSide === which) {
      setShowSide(0)
    } else {
      setShowSide(which || 0)
    }
  }

  useEffect(() => {
    const cancelShow = () => setShowSide(0)
    document.getElementById('center')?.addEventListener('click', cancelShow)
    return () => {
      document
        .getElementById('center')
        ?.removeEventListener('click', cancelShow)
    }
  }, [])

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
      </ul>

      {showSide === isTextComponent && <TextSider />}
      {showSide === isImgComponent && <ImgSider />}
      {showSide === isGraphComponent && <GraphSider />}
      {showSide === isImportComponent && <ImportSider />}
    </div>
  )
})

export default LeftSider
