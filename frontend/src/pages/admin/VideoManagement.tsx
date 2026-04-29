import { useState, useEffect, useRef, useCallback } from 'react'
import { Table, Button, Modal, Form, Input, message, Popconfirm, Upload } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, VideoCameraOutlined, PlayCircleOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'

interface VideoLibrary {
  id: string
  name: string
  description: string
  video_count: number
  cover_image?: string
  created_at: string
  videos?: any[]
}

const uploadProps: UploadProps = {
  name: 'videos',
  multiple: false,
  accept: 'video/*',
  showUploadList: false,
}

export function VideoManagement() {
  const [videos, setVideos] = useState<VideoLibrary[]>([])
  const [loading, setLoading] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<VideoLibrary | null>(null)
  const [addForm] = Form.useForm()
  const [editForm] = Form.useForm()
  const [uploadModalVisible, setUploadModalVisible] = useState(false)
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null)
  const [videoList, setVideoList] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }
  
  const isOpeningRef = useRef(false)
  const isClosingRef = useRef(false)

  useEffect(() => {
    loadVideoLibrary()
  }, [])

  const loadVideoLibrary = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3002/api/video-library?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (response.ok) {
        const data = await response.json()
        setVideos(data.data || [])
      } else {
        message.error('获取视频库列表失败')
      }
    } catch (error) {
      console.error('获取视频库列表失败:', error)
      message.error('获取视频库列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOpeningRef.current || isClosingRef.current) return
    isOpeningRef.current = true
    addForm.resetFields()
    setCurrentVideo(null)
    setTimeout(() => {
      setAddModalVisible(true)
      setTimeout(() => { isOpeningRef.current = false }, 300)
    }, 0)
  }, [addForm])

  const handleEdit = (video: VideoLibrary) => {
    if (isClosingRef.current) return
    setCurrentVideo(video)
    editForm.setFieldsValue(video)
    setEditModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3002/api/video-library/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (response.ok) {
        message.success('删除成功')
        loadVideoLibrary()
      } else {
        const data = await response.json()
        message.error(data.error || '删除失败')
      }
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSaveAdd = async (values: any) => {
    if (isClosingRef.current) return
    isClosingRef.current = true
    try {
      const response = await fetch('http://localhost:3002/api/video-library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(values)
      })
      if (response.ok) {
        message.success('添加成功')
        loadVideoLibrary()
        setAddModalVisible(false)
      } else {
        const data = await response.json()
        message.error(data.error || '添加失败')
      }
    } catch (error) {
      message.error('添加失败')
    } finally {
      setTimeout(() => { isClosingRef.current = false }, 500)
    }
  }

  const handleSaveEdit = async (values: any) => {
    if (isClosingRef.current) return
    isClosingRef.current = true
    if (currentVideo) {
      try {
        const response = await fetch(`http://localhost:3002/api/video-library/${currentVideo.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(values)
        })
        if (response.ok) {
          message.success('更新成功')
          loadVideoLibrary()
          setEditModalVisible(false)
        } else {
          const data = await response.json()
          message.error(data.error || '更新失败')
        }
      } catch (error) {
        message.error('更新失败')
      } finally {
        setTimeout(() => { isClosingRef.current = false }, 500)
      }
    }
  }

  const handleUploadClick = (e: React.MouseEvent, video: VideoLibrary) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOpeningRef.current || isClosingRef.current) return
    isOpeningRef.current = true
    setCurrentUploadId(video.id)
    loadVideoFiles(video.id)
    setUploadModalVisible(true)
    setTimeout(() => { isOpeningRef.current = false }, 300)
  }

  const loadVideoFiles = async (libraryId: string) => {
    try {
      const response = await fetch(`http://localhost:3002/api/video-library/${libraryId}/videos`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (response.ok) {
        const data = await response.json()
        setVideoList(data.data || [])
      }
    } catch (error) {
      console.error('加载视频列表失败:', error)
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    try {
      const response = await fetch(`http://localhost:3002/api/video-library/videos/${videoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (response.ok) {
        message.success('视频删除成功')
        if (currentUploadId) await loadVideoFiles(currentUploadId)
      } else {
        const data = await response.json()
        message.error(data.error || '删除视频失败')
      }
    } catch (error) {
      message.error('删除视频失败')
    }
  }

  const handleVideoUpload: UploadProps['customRequest'] = (options) => {
    const { file, onSuccess, onError } = options
    if (!currentUploadId) {
      onError?.(new Error('未选择视频库'))
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('videos', file as Blob)

    fetch(`http://localhost:3002/api/video-library/${currentUploadId}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: formData
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          message.success('上传成功')
          await loadVideoFiles(currentUploadId)
          onSuccess?.(data)
        } else {
          const data = await res.json()
          message.error(data.error || '上传失败')
          onError?.(new Error(data.error))
        }
      })
      .catch((err) => {
        message.error('上传失败')
        onError?.(err)
      })
      .finally(() => setUploading(false))
  }

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name', ellipsis: true, width: 120 },
    { title: '视频数', dataIndex: 'video_count', key: 'video_count', width: 80, align: 'center' as const, render: (val: number) => val || 0 },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 160, render: (d: string) => new Date(d).toLocaleString() },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right' as const,
      align: 'center' as const,
      render: (_: any, r: VideoLibrary) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          <Button type="primary" icon={<VideoCameraOutlined />} size="small" onClick={(e) => handleUploadClick(e, r)} style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)', color: 'white' }} />
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleEdit(r)} style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white' }} />
          <Popconfirm title="确定要删除这个视频库条目吗？" onConfirm={() => handleDelete(r.id)} okText="确定" cancelText="取消">
            <Button danger icon={<DeleteOutlined />} size="small" style={{ background: 'rgba(245, 34, 45, 0.2)', border: '1px solid rgba(245, 34, 45, 0.3)', color: 'white' }} />
          </Popconfirm>
        </div>
      )
    }
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">视频库管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={(e) => handleAdd(e)} className="bg-white/10 hover:bg-white/20 border border-white/20 text-white">添加视频</Button>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl p-4">
        <Table columns={columns} dataSource={videos} loading={loading} rowKey="id" pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }} className="text-white" style={{ backgroundColor: 'transparent' }} />
      </div>

      {/* 添加模态框 */}
      <Modal title="添加视频" open={addModalVisible} onCancel={() => { if (isClosingRef.current) return; isClosingRef.current = true; setAddModalVisible(false); setTimeout(() => { isClosingRef.current = false }, 500) }} onOk={() => addForm.submit()} className="text-white" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }} destroyOnClose maskClosable={false}>
        <Form form={addForm} layout="vertical" onFinish={handleSaveAdd}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入名称" className="bg-white/10 border border-white/20 text-white placeholder-gray-400" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="请输入描述" className="bg-white/10 border border-white/20 text-white placeholder-gray-400" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑模态框 */}
      <Modal title="编辑视频" open={editModalVisible} onCancel={() => { if (isClosingRef.current) return; isClosingRef.current = true; setEditModalVisible(false); setTimeout(() => { isClosingRef.current = false }, 500) }} onOk={() => editForm.submit()} className="text-white" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }} destroyOnClose maskClosable={false}>
        <Form form={editForm} layout="vertical" onFinish={handleSaveEdit}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入名称" className="bg-white/10 border border-white/20 text-white placeholder-gray-400" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="请输入描述" className="bg-white/10 border border-white/20 text-white placeholder-gray-400" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 上传视频模态框 */}
      <Modal title="上传视频" open={uploadModalVisible} onCancel={() => { if (isClosingRef.current) return; isClosingRef.current = true; setUploadModalVisible(false); setTimeout(() => { isClosingRef.current = false }, 500) }} footer={null} className="text-white" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }} destroyOnClose maskClosable={false}>

        <div className="space-y-4">
          <Upload.Dragger
            {...uploadProps}
            customRequest={handleVideoUpload}
            disabled={uploading}
          >
            <p className="ant-upload-drag-icon"><VideoCameraOutlined style={{ fontSize: 48, color: '#1890ff' }} /></p>
            <p className="ant-upload-text">点击或拖拽视频到此区域上传</p>
          </Upload.Dragger>
          <div className="mt-4">
            <h4 className="text-white mb-2">已上传视频：</h4>
            {videoList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                {videoList.map((v: any) => {
                  const fileType = v.path && v.path.match(/\.(mp4|webm|ogg|mov)$/i) ? 'video' : 'image'
                  return (
                    <div
                      key={v.id}
                      className="bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all"
                    >
                      {/* 视频预览 */}
                      <div className="relative aspect-video bg-black/40 flex items-center justify-center group cursor-pointer" onClick={() => {
                        if (fileType === 'video') {
                          window.open(`http://localhost:3002${v.path}`, '_blank')
                        }
                      }}>
                        {v.cover_image ? (
                          <>
                            <img
                              src={`http://localhost:3002${v.cover_image}`}
                              alt={v.filename}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                              <PlayCircleOutlined className="text-white text-5xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                            </div>
                          </>
                        ) : fileType === 'video' ? (
                          <>
                            <video
                              src={`http://localhost:3002${v.path}`}
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
                        ) : (
                          <img
                            src={`http://localhost:3002${v.path}`}
                            alt={v.filename}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>

                      {/* 视频信息 */}
                      <div className="p-3">
                        <p className="text-white text-sm font-medium truncate mb-1">
                          {v.filename || v.path}
                        </p>
                        <div className="flex items-center justify-between text-white/50 text-xs">
                          <span>{formatFileSize(v.size)}</span>
                          <Popconfirm title="确定删除此视频？" onConfirm={() => handleDeleteVideo(v.id)} okText="确定" cancelText="取消">
                            <Button danger icon={<DeleteOutlined />} size="small" className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-white" />
                          </Popconfirm>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : <p className="text-gray-400">暂无视频</p>}
          </div>
        </div>
      </Modal>
    </div>
  )
}
