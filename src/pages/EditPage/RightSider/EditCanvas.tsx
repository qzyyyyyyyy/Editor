import InputColor from '@/lib/InputColor'
import Item from '@/lib/Item'
import { updateCanvasStyle, updateCanvasTitle } from '@/store/editStore'
import type { ICanvas } from '@/store/editStoreTypes'
import { CANVAS_PRESETS } from '@/utils/const'
import styles from './edit.module.less'

export default function EditCanvas({ canvas }: { canvas: ICanvas }) {
  const style = canvas.style

  const handleStyleChange = (
    _e: React.ChangeEvent<HTMLInputElement>,
    { name, value }: { name: string; value: number | string }
  ) => {
    updateCanvasStyle({ [name]: value })
  }

  // 选择预设尺寸：直接覆盖画布宽高
  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = CANVAS_PRESETS.find((p) => p.key === e.target.value)
    if (preset) {
      updateCanvasStyle({ width: preset.width, height: preset.height })
    }
  }

  // 横竖屏切换：交换宽高
  const toggleOrientation = () => {
    updateCanvasStyle({
      width: style.height as number,
      height: style.width as number,
    })
  }

  return (
    <div className={styles.main}>
      <div className={styles.title}>画布属性</div>

      <Item label="标题:">
        <input
          type="text"
          className={styles.itemRight}
          value={canvas.title}
          onChange={(e) => {
            let newValue = e.target.value
            updateCanvasTitle(newValue)
          }}
        />
      </Item>

      {/* 尺寸预设：一键切换常用终端尺寸 */}
      <Item label="尺寸预设:">
        <select
          className={styles.itemRight}
          onChange={handlePresetChange}
          value=""
        >
          <option value="" disabled>
            选择预设尺寸--
          </option>
          {CANVAS_PRESETS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
      </Item>

      {/* 横竖屏切换 */}
      <Item label="横竖屏:">
        <button
          className={styles.itemRight}
          onClick={toggleOrientation}
          style={{ cursor: 'pointer' }}
        >
          切换横屏/竖屏
        </button>
      </Item>

      <Item label="画布宽度 (px):">
        <input
          type="number"
          className={styles.itemRight}
          value={style.width}
          onChange={(e) => {
            handleStyleChange(e, {
              name: 'width',
              value: parseInt(e.target.value) - 0,
            })
          }}
        />
      </Item>

      <Item label="画布高度 (px):">
        <input
          type="number"
          className={styles.itemRight}
          value={style.height}
          onChange={(e) => {
            handleStyleChange(e, {
              name: 'height',
              value: parseInt(e.target.value) - 0,
            })
          }}
        />
      </Item>

      <Item label="背景颜色:">
        <InputColor
          className={styles.itemRight}
          color={style.backgroundColor}
          onChangeComplete={(e: any) => {
            handleStyleChange(e, {
              name: 'backgroundColor',
              value: `rgba(${Object.values(e.rgb).join(',')})`,
            })
          }}
        />
      </Item>

      <Item label="背景图片:">
        <input
          type="text"
          className={styles.itemRight}
          value={style.backgroundImage}
          onChange={(e) => {
            handleStyleChange(e, {
              name: 'backgroundImage',
              value: e.target.value,
            })
          }}
        />
      </Item>
    </div>
  )
}
