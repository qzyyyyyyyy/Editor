import { db } from '../db/index.js'
import type { CanvasListItem, SaveCanvasRequest } from '@trouble/shared'

interface CanvasRow {
  id: number
  user_id: number
  title: string
  type: string
  content: string
}

function rowToItem(row: CanvasRow): CanvasListItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    content: row.content,
  }
}

// 获取当前用户的画布列表（支持按 title 模糊搜索）
export function listCanvases(
  userId: number,
  keyword?: string
): CanvasListItem[] {
  let sql = 'SELECT * FROM canvases WHERE user_id = ?'
  const params: (number | string)[] = [userId]

  if (keyword) {
    sql += ' AND title LIKE ?'
    params.push(`%${keyword}%`)
  }
  sql += ' ORDER BY updated_at DESC'

  const rows = db.prepare(sql).all(...params) as unknown as CanvasRow[]
  return rows.map(rowToItem)
}

// 获取单个画布详情
export function getCanvas(userId: number, id: number): CanvasListItem | null {
  const row = db
    .prepare('SELECT * FROM canvases WHERE id = ? AND user_id = ?')
    .get(id, userId) as CanvasRow | undefined
  return row ? rowToItem(row) : null
}

// 新建画布，返回新 id
export function createCanvas(
  userId: number,
  payload: SaveCanvasRequest
): number {
  const result = db
    .prepare(
      'INSERT INTO canvases (user_id, title, type, content) VALUES (?, ?, ?, ?)'
    )
    .run(userId, payload.title, payload.type || 'page', payload.content)
  return Number(result.lastInsertRowid)
}

// 更新画布
export function updateCanvas(
  userId: number,
  id: number,
  payload: SaveCanvasRequest
): void {
  const result = db
    .prepare(
      `UPDATE canvases
       SET title = ?, type = ?, content = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`
    )
    .run(payload.title, payload.type || 'page', payload.content, id, userId)
  if (result.changes === 0) {
    throw new Error('画布不存在或无权操作')
  }
}

// 删除画布
export function deleteCanvas(userId: number, id: number): void {
  const result = db
    .prepare('DELETE FROM canvases WHERE id = ? AND user_id = ?')
    .run(id, userId)
  if (result.changes === 0) {
    throw new Error('画布不存在或无权操作')
  }
}
