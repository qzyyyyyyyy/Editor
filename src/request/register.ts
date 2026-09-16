import { findUser, saveUser } from "../utils/storage"

interface RegisterPayload {
  name: string
  password: string
}

// 前端注册：校验后写入本地用户表
export function register(
  payload: RegisterPayload,
  onSuccess?: () => void,
  onError?: (msg: string) => void,
) {
  if (!payload.name || !payload.password) {
    onError?.("用户名和密码不能为空")
    return
  }
  if (payload.name.length < 2) {
    onError?.("用户名至少 2 个字符")
    return
  }
  if (payload.password.length < 4) {
    onError?.("密码至少 4 位")
    return
  }
  if (findUser(payload.name)) {
    onError?.("该用户名已被注册")
    return
  }
  saveUser({ name: payload.name, password: payload.password })
  onSuccess?.()
}
