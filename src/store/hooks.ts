import { useSearchParams } from "react-router-dom"

// 获取画布唯一标识id
export function useCanvasId(): number | null {
  const [params] = useSearchParams()
  const raw = params.get("id")

  if (raw == null) {
    return null
  }
  const num = parseInt(raw, 10)

  return Number.isNaN(num) ? null : num
}

// 页面 或者 模板, 如果为空, 则认为是模板
export function useCanvasType() {
  const [params] = useSearchParams()
  let type = params.get("type")

  return type || "content"
}
