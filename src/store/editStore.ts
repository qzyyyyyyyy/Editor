import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { enableMapSet } from "immer"
import type {
  EditStoreState,
  ICanvas,
  ICmp,
  ICmpWithKey,
  Style
} from "./editStoreTypes"
import { getOnlyKey } from "@/utils"
import { getCanvasListData, saveCanvasList } from "@/utils/storage"
import { resetZoom } from "./zoomStore"
import { recordCanvasChangeHistory } from "./historySlice"

// 必须在 create 之前启用，否则 Immer 无法代理 Set/Map
enableMapSet()

const useEditStore = create(
  immer<EditStoreState>(() => ({
    canvas: getDefaultCanvas(),
    //记录选中组件下标
    assembly: new Set<number>(),
    //记录历史
    canvasChangeHistory: [
      { canvas: getDefaultCanvas(), assembly: new Set<number>() }
    ],
    // 记录当前操作索引
    canvasChangeHistoryIndex: 0
  }))
)

export const claerCanvas = () => {
  useEditStore.setState((draft) => {
    draft.canvas = getDefaultCanvas()
    draft.assembly.clear()
  })

  resetZoom()
}

export const addCmp = (cmp: ICmp) => {
  useEditStore.setState((draft) => {
    draft.canvas.cmps.push({ ...cmp, key: getOnlyKey() })
    draft.assembly = new Set([draft.canvas.cmps.length - 1])
    recordCanvasChangeHistory(draft)
  })
}

// 将 localStorage 的 content 字符串还原为完整 ICanvas
// 与默认画布合并，兼容脏数据（如种子记录的 "{}"）
export function parseCanvas(content: string): ICanvas {
  const defaultCanvas = getDefaultCanvas()
  let parsed: Partial<ICanvas>
  try {
    parsed = JSON.parse(content)
  } catch {
    parsed = {}
  }
  return {
    ...defaultCanvas,
    ...parsed,
    style: { ...defaultCanvas.style, ...parsed.style },
    cmps: Array.isArray(parsed.cmps) ? parsed.cmps : []
  }
}

// 加载已有画布到 store（EditPage 按 URL id 还原时调用）
export const loadCanvas = (content: string) => {
  useEditStore.setState((draft) => {
    draft.canvas = parseCanvas(content)
    draft.assembly.clear()
  })
}

// 重置为默认空画布（新建场景）
export const resetCanvas = () => {
  useEditStore.setState((draft) => {
    draft.canvas = getDefaultCanvas()
    draft.assembly.clear()
  })
}

export const delSelectedCmps = () => {
  useEditStore.setState((draft) => {
    const assembly = draft.assembly
    draft.canvas.cmps = draft.canvas.cmps.filter(
      (_, index) => !assembly.has(index)
    )
    draft.assembly.clear()
    recordCanvasChangeHistory(draft)
  })
}

// 副本相对原组件的位移，避免完全重叠看不出复制效果
const COPY_OFFSET = 20

// 计算偏移后的位置并夹在画布范围内（组件比画布还宽/高时贴左/贴顶）
const getClonedPosition = (
  style: Style,
  canvasWidth: number,
  canvasHeight: number,
  offset: number
): { left: number; top: number } => {
  const left = style.left as number
  const top = style.top as number
  const width = style.width as number
  const height = style.height as number
  return {
    left: Math.max(0, Math.min(left + offset, canvasWidth - width)),
    top: Math.max(0, Math.min(top + offset, canvasHeight - height))
  }
}

// 右键菜单"复制组件"：原地立即克隆一份（复制 + 粘贴一步完成）
// 支持多选批量克隆，副本间相对位置不变
export const duplicateSelectedCmps = () => {
  useEditStore.setState((draft) => {
    // 升序处理，保证多选克隆后新组件顺序与原选择顺序一致
    const indexes = Array.from(draft.assembly).sort((a, b) => a - b)
    if (indexes.length === 0) {
      return
    }

    const canvasWidth = draft.canvas.style.width as number
    const canvasHeight = draft.canvas.style.height as number
    const newIndexes: number[] = []

    indexes.forEach((index) => {
      const cmp = draft.canvas.cmps[index]
      // key 重新生成避免 React 列表 key 冲突；
      // style 必须单独拷贝，否则副本与原组件共享同一个样式对象
      draft.canvas.cmps.push({
        ...cmp,
        key: getOnlyKey(),
        style: {
          ...cmp.style,
          ...getClonedPosition(
            cmp.style,
            canvasWidth,
            canvasHeight,
            COPY_OFFSET
          )
        }
      })
      newIndexes.push(draft.canvas.cmps.length - 1)
    })

    // 完成后只选中副本，方便连续再克隆 / 直接拖动
    draft.assembly = new Set(newIndexes)
    recordCanvasChangeHistory(draft)
  })
}

// 内存剪贴板：暂存 Ctrl+C 的组件快照，不持久化（刷新后清空），可跨画布粘贴
let cmpsClipboard: ICmpWithKey[] = []
// 本轮复制后已粘贴的次数，用于让连续粘贴逐级错位
let pasteTimes = 0

// Ctrl/Cmd + C：把选中组件深拷贝到剪贴板（不改画布、不入历史）
export const copySelectedCmps = () => {
  const { canvas, assembly } = useEditStore.getState()
  cmpsClipboard = Array.from(assembly)
    .sort((a, b) => a - b)
    .map((index) => {
      const cmp = canvas.cmps[index]
      // 拍快照：style 单独拷贝，之后修改原件不会污染剪贴板
      return { ...cmp, style: { ...cmp.style } }
    })
  pasteTimes = 0
}

// Ctrl/Cmd + V：把剪贴板组件克隆到当前画布，
// 每次粘贴重新生成 key/style，连续粘贴逐级偏移，粘贴后选中新组件
export const pasteCmps = () => {
  if (cmpsClipboard.length === 0) {
    return
  }
  pasteTimes += 1
  const offset = COPY_OFFSET * pasteTimes

  useEditStore.setState((draft) => {
    const canvasWidth = draft.canvas.style.width as number
    const canvasHeight = draft.canvas.style.height as number
    const newIndexes: number[] = []

    cmpsClipboard.forEach((cmp) => {
      draft.canvas.cmps.push({
        ...cmp,
        key: getOnlyKey(),
        style: {
          ...cmp.style,
          ...getClonedPosition(cmp.style, canvasWidth, canvasHeight, offset)
        }
      })
      newIndexes.push(draft.canvas.cmps.length - 1)
    })

    draft.assembly = new Set(newIndexes)
    recordCanvasChangeHistory(draft)
  })
}

// ! 图层顺序
// 组件层级即 cmps 数组下标：渲染时 zIndex = index，下标越大越靠上层。
// 菜单只在单选时展示这些操作，因此直接取当前选中下标处理。
// 注意：移动后组件的下标会变，必须同步更新 assembly，否则选中框会错套到别的组件上。

// 上移一层：与上方（下标 +1）的组件交换；已在最顶层则不动
export const moveSelectedCmpUp = () => {
  useEditStore.setState((draft) => {
    const index = selectedCmpIndexSelector(draft)
    const cmps = draft.canvas.cmps
    if (index < 0 || index >= cmps.length - 1) {
      return
    }
    // splice 取出再插回，Immer 对 draft 数组的移动是安全的
    const [cmp] = cmps.splice(index, 1)
    cmps.splice(index + 1, 0, cmp)
    draft.assembly = new Set([index + 1])
    recordCanvasChangeHistory(draft)
  })
}

// 下移一层：与下方（下标 -1）的组件交换；已在最底层则不动
export const moveSelectedCmpDown = () => {
  useEditStore.setState((draft) => {
    const index = selectedCmpIndexSelector(draft)
    const cmps = draft.canvas.cmps
    if (index <= 0) {
      return
    }
    const [cmp] = cmps.splice(index, 1)
    cmps.splice(index - 1, 0, cmp)
    draft.assembly = new Set([index - 1])
    recordCanvasChangeHistory(draft)
  })
}

// 置顶：移到数组末尾（视觉最上层）
export const bringSelectedCmpToFront = () => {
  useEditStore.setState((draft) => {
    const index = selectedCmpIndexSelector(draft)
    const cmps = draft.canvas.cmps
    if (index < 0 || index === cmps.length - 1) {
      return
    }
    const [cmp] = cmps.splice(index, 1)
    cmps.push(cmp)
    draft.assembly = new Set([cmps.length - 1])
    recordCanvasChangeHistory(draft)
  })
}

// 置底：移到数组开头（视觉最底层）
export const sendSelectedCmpToBack = () => {
  useEditStore.setState((draft) => {
    const index = selectedCmpIndexSelector(draft)
    const cmps = draft.canvas.cmps
    if (index <= 0) {
      return
    }
    const [cmp] = cmps.splice(index, 1)
    cmps.unshift(cmp)
    draft.assembly = new Set([0])
    recordCanvasChangeHistory(draft)
  })
}

// 保存画布到 localStorage
// id 为 null → 新建；有值 → 更新已有记录
// 返回保存后的 id，供调用方跳转/刷新使用
export const saveCanvas = (id: number | null, type: string): number => {
  const canvas = useEditStore.getState().canvas
  const content = JSON.stringify(canvas)

  const list = getCanvasListData()
  const existing = id != null ? list.find((item) => item.id === id) : undefined

  let savedId: number
  if (existing) {
    // 更新已有记录
    existing.title = canvas.title
    existing.content = content
    existing.type = type
    savedId = existing.id
  } else {
    // 新建记录，id 取已有最大 id + 1
    savedId = list.length ? Math.max(...list.map((i) => i.id)) + 1 : 1
    list.push({
      id: savedId,
      title: canvas.title,
      content,
      type
    })
  }
  saveCanvasList(list)
  return savedId
}

// ! 选中组件
// 全部选中
export const setAllCmpsSelected = () => {
  useEditStore.setState((draft) => {
    const len = draft.canvas.cmps.length
    // 生成 [0,1,...,len-1] 下标集合；_ 是未使用的元素位，下划线开头 TS 不报
    draft.assembly = new Set(Array.from({ length: len }, (_, i) => i))
  })
}

// 选中多个
// 如果再次点击已经选中的组件，则取消选中
export const setCmpsSelected = (indexes: Array<number>) => {
  useEditStore.setState((draft) => {
    if (indexes)
      indexes.forEach((index) => {
        if (draft.assembly.has(index)) {
          // 取消这个组件的选中
          draft.assembly.delete(index)
        } else {
          // 选中
          draft.assembly.add(index)
        }
      })
  })
}
// 选中单个
// 如果index为-1，则取消选中
export const setCmpSelected = (index: number) => {
  if (index === -1) {
    useEditStore.setState((draft) => {
      if (draft.assembly.size > 0) {
        draft.assembly.clear()
      }
    })
  } else if (index > -1) {
    useEditStore.setState((draft) => {
      draft.assembly = new Set([index])
    })
  }
}

// ! 修改组件属性（拖拽、缩放）
// 根据改变的量来修改
export const updateAssemblyCmpsByDistance = (newStyle: Style) => {
  useEditStore.setState((draft) => {
    draft.assembly.forEach((index) => {
      const cmp = { ...draft.canvas.cmps[index] }

      let invalid = false
      Object.entries(newStyle).forEach(([key, value]) => {
        if (
          (key === "width" || key === "height") &&
          (cmp.style[key as keyof Style] as number) + (value as number) < 2
        ) {
          invalid = true
          return
        }
        cmp.style[key as keyof Style] = ((cmp.style[
          key as keyof Style
        ] as number) + (value as number)) as any
      })
      if (!invalid) {
        draft.canvas.cmps[index] = cmp
      }
    })
  })
}

// ! 记录画布变化(防抖去重处理)
export const recordCanvasChangeHistory_2 = () => {
  const store = useEditStore.getState()
  if (
    store.canvas ===
    store.canvasChangeHistory[store.canvasChangeHistoryIndex].canvas
  ) {
    return
  }
  useEditStore.setState((draft) => {
    recordCanvasChangeHistory(draft)
  })
}

// 更新画布标题
export const updateCanvasTitle = (title: string) => {
  useEditStore.setState((draft) => {
    draft.canvas.title = title
    recordCanvasChangeHistory(draft)
  })
}

// ! 更新画布属性
export const updateCanvasStyle = (_style: any) => {
  useEditStore.setState((draft) => {
    Object.assign(draft.canvas.style, _style)
    recordCanvasChangeHistory(draft)
  })
}

// 修改单个组件的style（属性面板改样式）
export const updateSelectedCmpStyle = (newStyle: Style) => {
  useEditStore.setState((draft) => {
    Object.assign(
      draft.canvas.cmps[selectedCmpIndexSelector(draft)].style,
      newStyle
    )
    recordCanvasChangeHistory(draft)
  })
}

// 修改单个组件的属性（属性面板改文字/类型）
export const updateSelectedCmpAttr = (name: string, value: string) => {
  useEditStore.setState((draft: any) => {
    const selectedIndex = selectedCmpIndexSelector(draft)
    draft.canvas.cmps[selectedIndex][name] = value
    recordCanvasChangeHistory(draft)
  })
}

// 修改选中组件的style（面板上点对齐按钮）
export const editAssemblyStyle = (_style: Style) => {
  useEditStore.setState((draft) => {
    draft.assembly.forEach((index: number) => {
      const _s = { ...draft.canvas.cmps[index].style }
      const canvasStyle = draft.canvas.style
      // 画布/组件的宽高存的都是数字像素值，断言为 number 参与算术
      const canvasWidth = canvasStyle.width as number
      const canvasHeight = canvasStyle.height as number
      const cmpWidth = _s.width as number
      const cmpHeight = _s.height as number
      if (_style.right === 0) {
        // 计算left
        _s.left = canvasWidth - cmpWidth
      } else if (_style.bottom === 0) {
        // top
        _s.top = canvasHeight - cmpHeight
      } else if (_style.left === "center") {
        _s.left = (canvasWidth - cmpWidth) / 2
      } else if (_style.top === "center") {
        _s.top = (canvasHeight - cmpHeight) / 2
      } else {
        Object.assign(_s, _style)
      }
      draft.canvas.cmps[index].style = _s
      recordCanvasChangeHistory(draft)
    })
  })
}

// 选中的单个组件的index
export const selectedCmpIndexSelector = (store: EditStoreState): number => {
  const selectedCmpIndex = Array.from(store.assembly)[0]
  return selectedCmpIndex === undefined ? -1 : selectedCmpIndex
}

function getDefaultCanvas(): ICanvas {
  return {
    title: "未命名",
    // 页面样式
    style: {
      width: 320,
      height: 568,
      backgroundColor: "#ffffff",
      backgroundImage: "",
      backgroundPosition: "center",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat"
    },
    // 组件
    cmps: []
  }
}

export default useEditStore