import express, { Request, Response } from 'express'
import VideoLibrary from '../models/VideoLibrary'
import Video from '../models/Video'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import ffprobePath from '@ffprobe-installer/ffprobe'

ffmpeg.setFfmpegPath(ffmpegPath.path)
ffmpeg.setFfprobePath(ffprobePath.path)
;(ffmpeg as any).setFfmpegPath(ffmpegPath.path)
;(ffmpeg as any).setFfprobePath(ffprobePath.path)

const router = express.Router()

// 文件名编码修复工具函数
const fixFilenameEncoding = (originalname: string) => {
  try {
    // 尝试解码可能被错误编码的文件名
    const buffer = Buffer.from(originalname, 'latin1')
    const decoded = buffer.toString('utf8')
    // 如果解码后包含中文字符，则使用解码后的结果
    if (/[\u4e00-\u9fff]/.test(decoded)) {
      return decoded
    }
  } catch (e) {
    // 忽略解码错误
  }
  return originalname
}

// 配置上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'videos')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname)
    cb(null, uniqueName)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('只支持 MP4, MOV, AVI, MKV 格式的视频'))
    }
  },
})

// GET /api/video-library - 获取视频库列表
router.get('/', async (_req: Request, res: Response) => {
  try {
    const items = await VideoLibrary.findAll({
      order: [['created_at', 'DESC']],
      raw: true,
    })

    // 统计每个条目的视频数量并获取封面
    const result = await Promise.all(
      items.map(async (item: any) => {
        const videoCount = await Video.count({ where: { library_id: item.id } })
        // 获取最多5个视频的封面作为文件夹封面网格
        const videosWithCovers = await Video.findAll({
          where: { library_id: item.id },
          order: [['created_at', 'DESC']],
          limit: 5,
          attributes: ['id', 'cover_image', 'path'],
          raw: true,
        })
        const coverImages = videosWithCovers
          .map((v: any) => v.cover_image || null)
          .filter(Boolean)
        return {
          ...item,
          video_count: videoCount,
          cover_image: coverImages[0] || null,
          cover_images: coverImages
        }
      })
    )

    res.json({ data: result })
  } catch (error: any) {
    console.error('获取视频库列表失败:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/video-library/:id/videos - 获取某个条目的视频
router.get('/:id/videos', async (req: Request, res: Response) => {
  try {
    const videos = await Video.findAll({
      where: { library_id: req.params.id },
      order: [['created_at', 'DESC']],
      raw: true,
    })
    // 修复文件名编码
    const fixedVideos = videos.map((v: any) => ({
      ...v,
      filename: fixFilenameEncoding(v.filename),
    }))
    res.json({ data: fixedVideos })
  } catch (error: any) {
    console.error('获取视频列表失败:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/video-library - 创建条目
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, category, difficulty } = req.body
    const item = await VideoLibrary.create({
      name,
      description,
      category,
      difficulty,
    })
    res.status(201).json({ data: item })
  } catch (error: any) {
    console.error('创建条目失败:', error)
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/video-library/:id - 更新条目
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const item = await VideoLibrary.findByPk(req.params.id)
    if (!item) {
      return res.status(404).json({ error: '条目不存在' })
    }
    await item.update(req.body)
    res.json({ data: item })
  } catch (error: any) {
    console.error('更新条目失败:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/video-library/:id - 删除条目及关联视频
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const item = await VideoLibrary.findByPk(req.params.id)
    if (!item) {
      return res.status(404).json({ error: '条目不存在' })
    }

    // 删除关联的视频文件
    const videos = await Video.findAll({ where: { library_id: req.params.id }, raw: true })
    for (const video of videos as any[]) {
      if (video.path) {
        const filePath = path.join(__dirname, '..', '..', video.path)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      }
    }

    await Video.destroy({ where: { library_id: req.params.id } })
    await item.destroy()
    res.json({ success: true })
  } catch (error: any) {
    console.error('删除条目失败:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/video-library/:id/upload - 上传视频
router.post('/:id/upload', upload.array('videos', 10), async (req: Request, res: Response) => {
  try {
    const item = await VideoLibrary.findByPk(req.params.id)
    if (!item) {
      return res.status(404).json({ error: '条目不存在' })
    }

    const files = (req.files || []) as Express.Multer.File[]
    if (files.length === 0) {
      return res.status(400).json({ error: '没有上传文件' })
    }

    const coversDir = path.join(__dirname, '..', '..', 'covers')
    if (!fs.existsSync(coversDir)) {
      fs.mkdirSync(coversDir, { recursive: true })
    }

    const createdVideos = await Promise.all(
      files.map(async (file) => {
        const videoPath = path.join(__dirname, '..', '..', 'uploads', 'videos', file.filename)
        const coverFilename = `cover-${file.filename.replace(/\.[^/.]+$/, '')}.jpg`
        const coverPath = `/covers/${coverFilename}`
        const coverFullPath = path.join(coversDir, coverFilename)

        let coverImageSaved = false
        try {
          await new Promise<void>((resolve, reject) => {
            ffmpeg(videoPath)
              .screenshots({
                timestamps: ['00:00:01'],
                filename: coverFilename,
                folder: coversDir,
                size: '320x180',
              })
              .on('end', () => resolve())
              .on('error', (err) => reject(err))
          })
          coverImageSaved = fs.existsSync(coverFullPath)
          if (coverImageSaved) {
            console.log(`✅ 封面生成成功: ${coverFilename}`)
          }
        } catch (err) {
          console.error('❌ 封面生成失败:', err instanceof Error ? err.message : err)
        }

        return Video.create({
          library_id: req.params.id,
          filename: fixFilenameEncoding(file.originalname),
          path: `/uploads/videos/${file.filename}`,
          cover_image: coverImageSaved ? coverPath : undefined,
          size: file.size,
        })
      })
    )

    res.status(201).json({ data: createdVideos })
  } catch (error: any) {
    console.error('上传视频失败:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/video-library/videos/:videoId - 删除单个视频
router.delete('/videos/:videoId', async (req: Request, res: Response) => {
  try {
    const video = await Video.findByPk(req.params.videoId)
    if (!video) {
      return res.status(404).json({ error: '视频不存在' })
    }

    // 删除文件
    const filePath = path.join(__dirname, '..', '..', (video as any).path)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    await video.destroy()
    res.json({ success: true })
  } catch (error: any) {
    console.error('删除视频失败:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
