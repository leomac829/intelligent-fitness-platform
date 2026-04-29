import React, { useEffect, useState, useMemo } from 'react'
import { Card, Row, Col, Input, Tag, Spin, Modal, message } from 'antd'
import {
  SearchOutlined,
  FolderOutlined,
  PlayCircleOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  LoadingOutlined,
} from '@ant-design/icons'

// 视频项接口
interface VideoItem {
  id: string
  library_id: string
  filename: string
  path: string
  cover_image?: string
  size: number
  duration?: number
  created_at: string
}

// 动作项接口
interface ExerciseItem {
  id: string
  name: string
  description: string
  category: string
  difficulty: string
  created_at: string
  updated_at: string
  video_count: number
  cover_image?: string
  cover_images?: string[]
}

// 视频文件类型判断
const getFileType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext || '')) return 'video'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image'
  return 'other'
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const ExerciseLibrary: React.FC = () => {
  const [exercises, setExercises] = useState<ExerciseItem[]>([])
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null)
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [videoLoading, setVideoLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [folderPlayingVideoId, setFolderPlayingVideoId] = useState<string | null>(null)
  const [folderVideos, setFolderVideos] = useState<{[key: string]: VideoItem[]}>({})

  // 加载动作列表
  useEffect(() => {
    loadExercises()
  }, [])

  const loadExercises = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3002/api/video-library?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        }
      })
      const data = await response.json()
      console.log('从API加载的动作列表:', data.data?.length || 0, '个')
      setExercises(data.data || [])
    } catch (error) {
      console.error('加载动作列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 加载某个动作的视频列表
  const loadVideos = async (exerciseId: string) => {
    setVideoLoading(true)
    try {
      const response = await fetch(`http://localhost:3002/api/video-library/${exerciseId}/videos`)
      const data = await response.json()
      console.log('加载到的视频列表:', data.data?.length || 0, '个')
      setVideos(data.data || [])
    } catch (error) {
      console.error('加载视频列表失败:', error)
    } finally {
      setVideoLoading(false)
    }
  }

  // 处理动作卡片点击
  const handleExerciseClick = async (exercise: ExerciseItem) => {
    setSelectedExercise(exercise)
    await loadVideos(exercise.id)
  }

  // 预加载文件夹的视频列表（用于封面网格点击播放）
  const loadFolderVideos = async (exerciseId: string) => {
    if (folderVideos[exerciseId]) return
    try {
      const response = await fetch(`http://localhost:3002/api/video-library/${exerciseId}/videos`)
      const data = await response.json()
      setFolderVideos(prev => ({ ...prev, [exerciseId]: data.data || [] }))
    } catch (error) {
      console.error('预加载文件夹视频失败:', error)
    }
  }

  // 处理文件夹封面的视频点击播放
  const handleFolderCoverClick = (e: React.MouseEvent, exercise: ExerciseItem, videoIndex: number) => {
    e.stopPropagation()
    const vids = folderVideos[exercise.id]
    if (vids && vids[videoIndex]) {
      const video = vids[videoIndex]
      setFolderPlayingVideoId(folderPlayingVideoId === video.id ? null : video.id)
    }
  }

  // 过滤后的动作列表
  const filteredExercises = useMemo(() => {
    if (!searchTerm.trim()) return exercises

    const term = searchTerm.toLowerCase()
    return exercises.filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(term) ||
        (exercise.description && exercise.description.toLowerCase().includes(term))
    )
  }, [exercises, searchTerm])

  // 难度标签颜色
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case '初级':
      case 'beginner':
        return 'green'
      case '中级':
      case 'intermediate':
        return 'orange'
      case '高级':
      case 'advanced':
        return 'red'
      default:
        return 'blue'
    }
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="p-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">视频库</h2>
            <p className="text-white/70 text-sm">浏览和观看训练视频</p>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <Input
              placeholder="搜索动作..."
              prefix={<SearchOutlined className="text-white/50" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40"
              allowClear
            />
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <FolderOutlined className="text-blue-400 text-lg" />
              </div>
              <div>
                <p className="text-white/70 text-sm">视频文件夹</p>
                <p className="text-white text-xl font-bold">{exercises.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <VideoCameraOutlined className="text-green-400 text-lg" />
              </div>
              <div>
                <p className="text-white/70 text-sm">总视频数</p>
                <p className="text-white text-xl font-bold">
                  {exercises.reduce((sum, e) => sum + (e.video_count || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <SearchOutlined className="text-purple-400 text-lg" />
              </div>
              <div>
                <p className="text-white/70 text-sm">搜索结果</p>
                <p className="text-white text-xl font-bold">{filteredExercises.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <ClockCircleOutlined className="text-orange-400 text-lg" />
              </div>
              <div>
                <p className="text-white/70 text-sm">最近更新</p>
                <p className="text-white text-sm font-bold">
                  {exercises.length > 0
                    ? new Date(exercises[0].updated_at).toLocaleDateString('zh-CN')
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 动作文件夹列表 */}
        <div className="mb-4">
          <h3 className="text-white text-lg font-semibold mb-4">视频文件夹</h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin
              size="large"
              indicator={<LoadingOutlined style={{ fontSize: 48, color: '#3b82f6' }} spin />}
            />
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white/5 rounded-2xl border border-white/10">
            <FolderOutlined className="text-white/30 text-6xl mb-4" />
            <p className="text-white/50 text-lg">
              {searchTerm ? '没有找到匹配的动作' : '暂无视频数据'}
            </p>
            <p className="text-white/40 text-sm mt-2">
              {searchTerm ? '请尝试其他关键词' : '联系管理员添加视频内容'}
            </p>
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {filteredExercises.map((exercise) => (
              <Col xs={24} sm={12} md={8} lg={6} key={exercise.id}>
                <Card
                  hoverable
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 hover:border-white/30 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleExerciseClick(exercise)}
                  onMouseEnter={() => loadFolderVideos(exercise.id)}
                  bodyStyle={{ padding: 0 }}
                >
                  {/* 封面图片网格 */}
                  <div className="relative aspect-video bg-black/40 overflow-hidden">
                    {exercise.cover_images && exercise.cover_images.length > 0 ? (
                      <div className="grid w-full h-full" style={{
                        gridTemplateColumns: exercise.cover_images.length <= 2 ? '1fr' : exercise.cover_images.length <= 4 ? '1fr 1fr' : '1fr 1fr',
                        gridTemplateRows: exercise.cover_images.length <= 2 ? '1fr 1fr' : exercise.cover_images.length === 3 ? '1fr 1fr' : '1fr 1fr',
                      }}>
                        {exercise.cover_images.slice(0, 5).map((cover, idx) => {
                          const vids = folderVideos[exercise.id]
                          const video = vids?.[idx]
                          const isPlaying = folderPlayingVideoId === video?.id
                          return (
                            <div
                              key={idx}
                              className="relative overflow-hidden border border-white/5"
                              onClick={(e) => handleFolderCoverClick(e, exercise, idx)}
                            >
                              {!isPlaying ? (
                                <>
                                  <img
                                    src={`http://localhost:3002${cover}`}
                                    alt={`${exercise.name}-${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                                    <PlayCircleOutlined className="text-white text-2xl" />
                                  </div>
                                </>
                              ) : (
                                <video
                                  src={`http://localhost:3002${video.path}`}
                                  controls
                                  autoPlay
                                  muted
                                  className="w-full h-full object-contain"
                                />
                              )}
                            </div>
                          )
                        })}
                        {exercise.cover_images.length > 5 && (
                          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded z-10 pointer-events-none">
                            +{exercise.video_count - 5}
                          </div>
                        )}
                      </div>
                    ) : exercise.cover_image ? (
                      <img
                        src={`http://localhost:3002${exercise.cover_image}`}
                        alt={exercise.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                          <FolderOutlined className="text-blue-400 text-3xl" />
                        </div>
                      </div>
                    )}
                    {/* 整体播放按钮覆盖层 */}
                    {(!folderPlayingVideoId || !folderVideos[exercise.id]?.find(v => v.id === folderPlayingVideoId)) && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        <PlayCircleOutlined className="text-white text-5xl" />
                      </div>
                    )}
                  </div>

                  {/* 信息 */}
                  <div className="p-4">
                    {/* 动作名称 */}
                    <h4 className="text-white text-center font-semibold mb-2 truncate group-hover:text-blue-300 transition-colors">
                      {exercise.name}
                    </h4>

                    {/* 描述 */}
                    {exercise.description && (
                      <p className="text-white/60 text-sm text-center mb-3 line-clamp-2">
                        {exercise.description}
                      </p>
                    )}

                    {/* 标签 */}
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <Tag color={getDifficultyColor(exercise.difficulty)} className="border-0">
                        {exercise.difficulty || '未分类'}
                      </Tag>

                      <div className="flex items-center gap-1 text-white/60 text-sm">
                        <PlayCircleOutlined />
                        <span>{exercise.video_count || 0} 视频</span>
                      </div>
                    </div>

                    {/* 分类 */}
                    {exercise.category && (
                      <div className="mt-2 text-center">
                        <Tag className="bg-white/10 text-white/70 border-0">{exercise.category}</Tag>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* 视频播放弹窗 */}
      <Modal
        open={!!selectedExercise}
        onCancel={() => setSelectedExercise(null)}
        footer={null}
        width={400}
        className="video-modal"
        styles={{
          content: {
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            backdropFilter: 'blur(20px)',
            padding: '24px',
          },
        }}
      >
        {selectedExercise && (
          <div>
            {/* 弹窗标题 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white text-xl font-bold">{selectedExercise.name}</h3>
                {selectedExercise.description && (
                  <p className="text-white/60 text-sm mt-1">{selectedExercise.description}</p>
                )}
              </div>
              <Tag color={getDifficultyColor(selectedExercise.difficulty)}>
                {selectedExercise.difficulty || '未分类'}
              </Tag>
            </div>

            {/* 视频列表 */}
            {videoLoading ? (
              <div className="flex justify-center items-center h-48">
                <Spin size="large" />
              </div>
            ) : videos.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-48 bg-white/5 rounded-xl border border-white/10">
                <VideoCameraOutlined className="text-white/30 text-4xl mb-3" />
                <p className="text-white/50">该动作暂无视频</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                {videos.map((video) => {
                  const fileType = getFileType(video.filename)
                  return (
                    <div
                      key={video.id}
                      className="bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all"
                    >
                      {/* 视频预览 */}
                      <div className="relative aspect-video bg-black/40 flex items-center justify-center group cursor-pointer">
                        {video.cover_image ? (
                          <>
                            <img
                              src={`http://localhost:3002${video.cover_image}`}
                              alt={video.filename}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                              <PlayCircleOutlined className="text-white text-5xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                            </div>
                          </>
                        ) : fileType === 'video' ? (
                          <>
                            <video
                              src={`http://localhost:3002${video.path}`}
                              className="w-full h-full object-contain"
                              controls={false}
                              muted
                              playsInline
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                              <PlayCircleOutlined className="text-white text-5xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                            </div>
                          </>
                        ) : fileType === 'image' ? (
                          <img
                            src={`http://localhost:3002${video.path}`}
                            alt={video.filename}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center">
                            <VideoCameraOutlined className="text-white/50 text-4xl mb-2" />
                            <p className="text-white/50 text-sm">不支持的文件类型</p>
                          </div>
                        )}

                        {/* 时长标签 */}
                        {video.duration && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {Math.floor(video.duration / 60)}:
                            {String(Math.floor(video.duration % 60)).padStart(2, '0')}
                          </div>
                        )}
                      </div>

                      {/* 视频信息 */}
                      <div className="p-3">
                        <p className="text-white text-sm font-medium truncate mb-1">
                          {video.filename}
                        </p>
                        <div className="flex items-center justify-between text-white/50 text-xs">
                          <span>{formatFileSize(video.size)}</span>
                          <span>
                            {new Date(video.created_at).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ExerciseLibrary
