import express, { Request, Response } from 'express'
import Exercise from '../models/Exercise'

const router = express.Router()

// 缓存结果
let cachedData: any = null

router.get('/data', async (_req: Request, res: Response) => {
  try {
    if (cachedData) {
      return res.json(cachedData)
    }

    const exercises = await Exercise.findAll()
    
    // 添加调试信息
    if (exercises.length > 0) {
      console.log('First exercise secondary_muscles:', exercises[0].secondary_muscles);
      console.log('Type:', typeof exercises[0].secondary_muscles);
    }
    
    const enhancedExercises = exercises.map((ex: any) => ({
      id: ex.id,
      name: ex.name,
      name_zh: ex.name_zh,
      equipment: ex.equipment,
      category: ex.category,
      target: ex.target,
      instructions: ex.instructions_zh || ex.instructions,
      muscle_group: ex.muscle_group,
      secondary_muscles: Array.isArray(ex.secondary_muscles) ? ex.secondary_muscles : (typeof ex.secondary_muscles === 'string' ? (() => {
        try {
          // 尝试解析 JSON 格式的字符串
          const parsed = JSON.parse(ex.secondary_muscles);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          // 如果解析失败，尝试按逗号分割
          return ex.secondary_muscles.split(',').map((m: string) => m.trim()).filter((m: string) => m !== '');
        }
      })() : []),
      image_url: ex.image_url,
      gif_url: ex.gif_url,
      created_at: ex.created_at
    }))

    cachedData = { success: true, exercises: enhancedExercises }
    res.json(cachedData)
  } catch (error) {
    console.error('读取训练动作数据失败:', error)
    res.status(500).json({ error: '读取数据失败' })
  }
})

export default router
