import { findUser, issueSession, clearSession } from "../utils/storage"

interface UserPayload {
  name: string
  password: string
}

// 前端登录：校验本地用户表，成功后写 cookie 登录态
export function login(
  payload: UserPayload,
  onSuccess?: () => void,
  onError?: (msg: string) => void,
) {
  const user = findUser(payload.name)
  if (!user) {
    onError?.("用户不存在，请先注册")
    return
  }
  if (user.password !== payload.password) {
    onError?.("密码错误")
    return
  }
  issueSession(user.name)
  onSuccess?.()
}

// 前端登出：清除 cookie 登录态
export function logout(
  onSuccess?: () => void,
  _onError?: (msg: string) => void,
) {
  clearSession()
  onSuccess?.()
}
