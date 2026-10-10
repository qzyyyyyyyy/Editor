import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import {
  listCanvases,
  getCanvas,
  createCanvas,
  updateCanvas,
  deleteCanvas,
} from '../services/canvasService.js'
import type { ApiResponse, CanvasListItem, SaveCanvasRequest } from '@trouble/shared'

const router = Router()

// GET /api/canvases?keyword=xxx
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const keyword = req.query.keyword as string | undefined
    const list = listCanvases(req.userId!, keyword)
    const body: ApiResponse<CanvasListItem[]> = { success: true, data: list }
    res.json(body)
  } catch (err) {
    next(err)
  }
})

// GET /api/canvases/:id
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const canvas = getCanvas(req.userId!, id)
    if (!canvas) {
      res.status(404).json({ success: false, message: '画布不存在' })
      return
    }
    res.json({ success: true, data: canvas })
  } catch (err) {
    next(err)
  }
})

// POST /api/canvases
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body as SaveCanvasRequest
    const id = createCanvas(req.userId!, payload)
    res.json({ success: true, data: { id } })
  } catch (err) {
    next(err)
  }
})

// PUT /api/canvases/:id
router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const payload = req.body as SaveCanvasRequest
    updateCanvas(req.userId!, id, payload)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/canvases/:id
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    deleteCanvas(req.userId!, id)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router
