import docCookies from "./cookies"

// 纯前端本地存储工具
// 用户表、会话态、画布列表都持久化在浏览器（localStorage + cookie）

// ============ 用户表 ============
export interface User {
  name: string
  password: string
}

const USERS_KEY = "__users__"

export function getUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as User[]) : []
  } catch {
    return []
  }
}

export function saveUser(user: User): void {
  const users = getUsers()
  users.push(user)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function findUser(name: string): User | undefined {
  return getUsers().find((u) => u.name === name)
}

// ============ 会话（登录态，写 cookie 供 Login 组件读取） ============
const SESSION_KEY = "sessionId"
const NAME_KEY = "name"

export function issueSession(name: string): void {
  const sessionId = "sess_" + Math.random().toString(36).slice(2, 18)
  const expireSec = 7 * 24 * 60 * 60 // 7 天
  docCookies.setItem(SESSION_KEY, sessionId, expireSec, "/")
  docCookies.setItem(NAME_KEY, name, expireSec, "/")
}

export function clearSession(): void {
  docCookies.removeItem(SESSION_KEY, "/")
  docCookies.removeItem(NAME_KEY, "/")
}

// ============ 画布列表 ============
export interface CanvasItem {
  id: number
  type: string // 页面 / 模版页面
  title: string
  content: string
}

const CANVAS_LIST_KEY = "__canvas_list__"

export function getCanvasListData(): CanvasItem[] {
  try {
    const raw = localStorage.getItem(CANVAS_LIST_KEY)
    if (raw) return JSON.parse(raw) as CanvasItem[]
  } catch {
    // 损坏数据兜底
  }
  // 首次访问塞几条种子数据，方便直接看到效果
  const seed: CanvasItem[] = [
    { id: 1, type: "page", title: "首页", content: "{}" },
    { id: 2, type: "page", title: "关于我们", content: "{}" },
    { id: 3, type: "template", title: "商品详情模板", content: "{}" },
  ]
  localStorage.setItem(CANVAS_LIST_KEY, JSON.stringify(seed))
  return seed
}

export function saveCanvasList(list: CanvasItem[]): void {
  localStorage.setItem(CANVAS_LIST_KEY, JSON.stringify(list))
}
