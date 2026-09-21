import type { ICanvas } from '../editStoreTypes'

// 默认画布配置：新建/清空时使用
export function getDefaultCanvas(): ICanvas {
  return {
    title: '未命名',
    style: {
      width: 320,
      height: 568,
      backgroundColor: '#ffffff',
      backgroundImage: '',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
    },
    cmps: [],
  }
}
