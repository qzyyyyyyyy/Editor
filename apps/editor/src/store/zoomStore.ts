import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface IZoomStore {
  zoom: number
  zoomOut: () => void
  zoomIn: () => void
  setZoom: (zoom: number) => void
  resetZoom: () => void
}

const useZoomStore = create(
  immer<IZoomStore>((set) => ({
    zoom: 100,
    zoomOut: () => {
      set((draft) => {
        draft.zoom += 25
      })
    },
    zoomIn: () => {
      set((draft) => {
        if (draft.zoom - 25 < 1) {
          draft.zoom = 1
        } else {
          draft.zoom -= 25
        }
      })
    },
    setZoom: (zoom: number) => {
      if (zoom >= 1) {
        set((draft) => {
          draft.zoom = zoom
        })
      }
    },
    resetZoom: () => {
      set({ zoom: 100 })
    },
  }))
)

export default useZoomStore
