// 生成全局唯一 key（用于画布组件标识）
let counter = 0

export function getOnlyKey(): number {
  return Date.now() + counter++
}
