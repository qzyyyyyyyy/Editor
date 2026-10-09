import InputColor from '@/lib/InputColor'
import Item from '@/lib/Item'
import {
  editAssemblyStyle,
  updateSelectedCmpAttr,
  updateSelectedCmpStyle,
} from '@/store/editStore'
import type { ICmpWithKey, Style } from '@/store/editStoreTypes'
import { isImgComponent } from '@/utils/const'
import styles from './edit.module.less'

export default function EditCmp({ selectedCmp }: { selectedCmp: ICmpWithKey }) {
  const { value, style, onClick = '' } = selectedCmp

  // 修改组件value文本内容（图片描述/文字组件文字）
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    updateSelectedCmpAttr('value', newValue)
  }

  // 修改style样式属性
  const handleStyleChange = (
    _e: any, // 目前没有用到
    { name, value }: { name: string; value: string | number }
  ) => {
    const newStyle = { [name]: value }
    updateSelectedCmpStyle(newStyle)
  }

  // 修改组件普通属性（非style，如onClick链接）
  const handleAttrChange = (
    _e: any, // 目前没有用到
    { name, value }: { name: string; value: string }
  ) => {
    updateSelectedCmpAttr(name, value)
  }

  return (
    <div className={styles.main}>
      <div className={styles.title}>组件属性</div>

      {/* 图片组件：描述输入框 */}
      {selectedCmp.type === isImgComponent && (
        <Item label="描述:">
          <input
            type="text"
            className={styles.itemRight}
            value={value}
            onChange={handleValueChange}
          />
        </Item>
      )}

      {/* 字体大小 */}
      {style.fontSize !== undefined && (
        <Item label="字体大小:">
          <input
            type="number"
            className={styles.itemRight}
            value={style.fontSize}
            onChange={(e) => {
              handleStyleChange(e, {
                name: 'fontSize',
                value: parseInt(e.target.value) || 0,
              })
            }}
          />
        </Item>
      )}

      {/* 字体粗细 */}
      {style.fontWeight !== undefined && (
        <Item label="字体粗细:">
          <select
            className={styles.itemRight}
            value={style.fontWeight}
            onChange={(e) => {
              handleStyleChange(e, {
                name: 'fontWeight',
                value: e.target.value,
              })
            }}
          >
            <option value="normal">normal</option>
            <option value="bold">bold</option>
            <option value="lighter">lighter</option>
          </select>
        </Item>
      )}

      {/* 行高：style 里存的是 "30px" 字符串，number 输入框需要剥掉单位显示，保存时拼回 px */}
      {style.lineHeight !== undefined && (
        <Item label="行高:">
          <input
            type="number"
            className={styles.itemRight}
            value={
              typeof style.lineHeight === 'string'
                ? parseFloat(style.lineHeight) || 0
                : style.lineHeight
            }
            onChange={(e) => {
              handleStyleChange(e, {
                name: 'lineHeight',
                value: `${parseFloat(e.target.value) || 0}px`,
              })
            }}
          />
        </Item>
      )}

      {/* 文字装饰：下划线/上划线/删除线 */}
      {style.textDecoration !== undefined && (
        <Item label="文字装饰:">
          <select
            className={styles.itemRight}
            value={style.textDecoration || 'none'}
            onChange={(e) => {
              handleStyleChange(e, {
                name: 'textDecoration',
                value: e.target.value,
              })
            }}
          >
            <option value="none">无</option>
            <option value="underline">下划线</option>
            <option value="overline">上划线</option>
            <option value="line-through">删除线</option>
          </select>
        </Item>
      )}

      {/* 文本对齐 */}
      {style.textAlign !== undefined && (
        <Item label="对齐:">
          <select
            className={styles.itemRight}
            value={style.textAlign}
            onChange={(e) => {
              handleStyleChange(e, {
                name: 'textAlign',
                value: e.target.value,
              })
            }}
          >
            <option value="left">居左</option>
            <option value="center">居中</option>
            <option value="right">居右</option>
          </select>
        </Item>
      )}

      {/* 背景颜色选择器 */}
      {style.backgroundColor !== undefined && (
        <Item label="背景色:">
          <InputColor
            color={style.backgroundColor}
            onChangeComplete={(e: {
              rgb: { r: number; g: number; b: number; a?: number }
            }) => {
              handleStyleChange(null, {
                name: 'backgroundColor',
                value: `rgba(${Object.values(e.rgb).join(',')})`,
              })
            }}
          />
        </Item>
      )}

      {/* 描边颜色：图形组件 (SVG stroke) */}
      {style.borderColor !== undefined && (
        <Item label="描边色:">
          <InputColor
            color={style.borderColor}
            onChangeComplete={(e: {
              rgb: { r: number; g: number; b: number; a?: number }
            }) => {
              handleStyleChange(null, {
                name: 'borderColor',
                value: `rgba(${Object.values(e.rgb).join(',')})`,
              })
            }}
          />
        </Item>
      )}

      {/* 描边宽度：图形组件 (SVG stroke-width) */}
      {style.borderWidth !== undefined && (
        <Item label="描边宽度:">
          <input
            type="number"
            className={styles.itemRight}
            value={style.borderWidth}
            onChange={(e) => {
              handleStyleChange(e, {
                name: 'borderWidth',
                value: parseInt(e.target.value) || 0,
              })
            }}
          />
        </Item>
      )}

      {/* 线型：图形组件 (SVG stroke-dasharray) */}
      {style.borderStyle !== undefined && (
        <Item label="线型:">
          <select
            className={styles.itemRight}
            value={style.borderStyle}
            onChange={(e) => {
              handleStyleChange(e, {
                name: 'borderStyle',
                value: e.target.value,
              })
            }}
          >
            <option value="solid">实线</option>
            <option value="dashed">虚线</option>
            <option value="dotted">点线</option>
          </select>
        </Item>
      )}

      {/* 文本颜色选择器 */}
      {style.color !== undefined && (
        <Item label="文本颜色:">
          <InputColor
            color={style.color}
            onChangeComplete={(e: {
              rgb: { r: number; g: number; b: number; a?: number }
            }) => {
              handleStyleChange(null, {
                name: 'color',
                value: `rgba(${Object.values(e.rgb).join(',')})`,
              })
            }}
          />
        </Item>
      )}

      {/* 旋转角度：所有组件通用，存为 CSS transform */}
      <Item label="旋转角度:">
        <input
          type="number"
          className={styles.itemRight}
          min={-360}
          max={360}
          // 从 transform: rotate(Ndeg) 中解析出角度数字；无 transform 时显示 0
          value={(() => {
            const t = style.transform as string | undefined
            const m = t?.match(/rotate\((-?\d+(?:\.\d+)?)deg\)/)
            return m ? parseFloat(m[1]) : 0
          })()}
          onChange={(e) => {
            const deg = parseFloat(e.target.value) || 0
            handleStyleChange(e, {
              name: 'transform',
              value: deg === 0 ? '' : `rotate(${deg}deg)`,
            })
          }}
        />
      </Item>

      {/* 点击跳转链接 */}
      <Item label="点击跳转:">
        <input
          className={styles.itemRight}
          type="text"
          value={onClick}
          onChange={(e) => {
            handleAttrChange(e, {
              name: 'onClick',
              value: e.target.value,
            })
          }}
        />
      </Item>

      {/* 对齐页面（画布对齐，和批量组件共用editAssemblyStyle） */}
      <Item label="对齐页面:">
        <select
          className={styles.itemRight}
          onChange={(e) => {
            const align = e.target.value
            let newStyle: Style = {}
            switch (align) {
              case 'left':
                newStyle.left = 0
                break
              case 'right':
                newStyle.right = 0
                break
              case 'x-center':
                newStyle.left = 'center'
                break
              case 'top':
                newStyle.top = 0
                break
              case 'bottom':
                newStyle.bottom = 0
                break
              case 'y-center':
                newStyle.top = 'center'
                break
            }
            editAssemblyStyle(newStyle)
          }}
        >
          <option>选择对齐页面方式--</option>
          <option value="left">左对齐</option>
          <option value="right">右对齐</option>
          <option value="x-center">水平居中</option>
          <option value="top">上对齐</option>
          <option value="bottom">下对齐</option>
          <option value="y-center">垂直居中</option>
        </select>
      </Item>
    </div>
  )
}
