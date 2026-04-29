import { useState, useEffect, useMemo, useRef } from 'react'
import { Input, Select, Tag, Spin, Modal, Pagination } from 'antd'
import { SearchOutlined, CloseOutlined } from '@ant-design/icons'

const { Option } = Select

interface Exercise {
  id: string
  name: string
  name_zh?: string
  instructions: string
  equipment: string
  muscle_group: string
  secondary_muscles: string[]
  target: string
  category: string
  image_url: string | null
  gif_url: string | null
}

const PAGE_SIZE = 48
const BASE_URL = 'http://localhost:3002'
const CACHE_KEY = 'training-exercises-cache'
const CACHE_EXPIRY = 30 * 60 * 1000 // 30分钟

export default function TrainingExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [search, setSearch] = useState('')
  const [equipmentFilter, setEquipmentFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const isModalClosingRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadExercises()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, equipmentFilter])

  const loadExercises = async () => {
    setLoading(true)
    setLoadingProgress(10)
    try {
      // 强制清除所有旧缓存，确保重新加载最新数据（包含中文描述）
      localStorage.removeItem(CACHE_KEY)
      localStorage.removeItem(`${CACHE_KEY}-time`)

      // 从网络加载
      setLoadingProgress(30)
      const response = await fetch(`${BASE_URL}/api/training-exercises/data`, {
        headers: { 'Cache-Control': 'no-cache' }
      })
      setLoadingProgress(60)
      const data = await response.json()
      setLoadingProgress(80)
      setExercises(data.exercises || [])
      
      // 缓存到本地
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
      localStorage.setItem(`${CACHE_KEY}-time`, Date.now().toString())
      setLoadingProgress(100)
    } catch (error) {
      console.error('加载训练动作失败:', error)
    } finally {
      setTimeout(() => setLoading(false), 100)
    }
  }

  const filteredExercises = useMemo(() => {
    let result = exercises
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(ex =>
        ex.name.toLowerCase().includes(q) ||
        (ex.name_zh && ex.name_zh.includes(q)) ||
        ex.equipment?.toLowerCase().includes(q) ||
        ex.muscle_group?.toLowerCase().includes(q) ||
        ex.target?.toLowerCase().includes(q) ||
        (ex.secondary_muscles && ex.secondary_muscles.some(m => m.toLowerCase().includes(q)))
      )
    }
    if (equipmentFilter) {
      result = result.filter(ex => ex.equipment === equipmentFilter)
    }
    return result
  }, [exercises, search, equipmentFilter])

  const paginatedExercises = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredExercises.slice(start, start + PAGE_SIZE)
  }, [filteredExercises, currentPage])

  const allEquipments = useMemo(() => {
    const set = new Set(exercises.map(ex => ex.equipment).filter(Boolean))
    return Array.from(set).sort()
  }, [exercises])

  const handleCardClick = (ex: Exercise) => {
    if (isModalClosingRef.current) return
    setSelectedExercise(ex)
  }

  const handleModalClose = () => {
    if (isModalClosingRef.current) return
    isModalClosingRef.current = true
    setSelectedExercise(null)
    setTimeout(() => {
      isModalClosingRef.current = false
    }, 500)
  }

  const getCols = () => {
    const w = window.innerWidth
    if (w >= 1600) return 8
    if (w >= 1200) return 6
    if (w >= 992) return 4
    if (w >= 768) return 3
    if (w >= 576) return 2
    return 2
  }

  const cols = getCols()

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '16px', flexShrink: 0 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', margin: 0 }}>训练动作</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          <Input
            placeholder="搜索动作名称 / 器材 / 肌肉群"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.6)' }} />}
            style={{ width: '256px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
          />
          <Select
            placeholder="器材"
            value={equipmentFilter || undefined}
            onChange={(v) => setEquipmentFilter(v || '')}
            allowClear
            style={{ width: '160px' }}
            dropdownStyle={{ background: '#1e293b' }}
          >
            {allEquipments.map(eq => (
              <Option key={eq} value={eq} style={{ color: '#fff' }}>{eq}</Option>
            ))}
          </Select>
          <Tag color="blue" style={{ fontSize: '12px' }}>{filteredExercises.length} 个动作</Tag>
        </div>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
          <Spin size="large" />
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>正在加载训练动作 {loadingProgress}%</div>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px' }}>没有找到匹配的动作</p>
        </div>
      ) : (
        <>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '12px' }}>
              {paginatedExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleCardClick(ex)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                  }}
                >
                  <div style={{ height: '112px', background: 'rgba(0,0,0,0.5)', overflow: 'hidden', position: 'relative' }}>
                    {ex.image_url ? (
                      <img
                        src={`${BASE_URL}${ex.image_url}`}
                        alt={ex.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                    ) : (
                      <span style={{ fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>🏋️</span>
                    )}
                  </div>
                  <div style={{ padding: '8px' }}>
                    <div style={{ color: '#fff', fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ex.name_zh || ex.name}>
                      {ex.name_zh || ex.name}
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <Tag color="cyan" style={{ fontSize: '11px', margin: 0 }}>{ex.equipment || '无'}</Tag>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flexShrink: 0, paddingTop: '12px', paddingBottom: '4px', display: 'flex', justifyContent: 'center' }}>
            <Pagination
              current={currentPage}
              total={filteredExercises.length}
              pageSize={PAGE_SIZE}
              onChange={(page) => {
                setCurrentPage(page)
                if (scrollRef.current) scrollRef.current.scrollTop = 0
              }}
              showSizeChanger={false}
              showQuickJumper
            />
          </div>
        </>
      )}

      <Modal
        open={!!selectedExercise}
        onCancel={handleModalClose}
        footer={null}
        width={400}
        className="text-white"
        closeIcon={<CloseOutlined style={{ color: '#fff' }} />}
        destroyOnClose
        maskClosable={false}
        styles={{
          content: {
            background: 'rgba(15, 23, 42, 0.98)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            backdropFilter: 'blur(20px)',
            padding: '24px',
            maxWidth: '400px',
            minWidth: '300px',
          },
        }}
      >
        {selectedExercise && (
          <div style={{ padding: '16px', textAlign: 'left' }}>
            <div style={{ height: '200px', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {selectedExercise.gif_url ? (
                <img
                  key={`gif-${selectedExercise.id}`}
                  src={`${BASE_URL}${selectedExercise.gif_url}`}
                  alt={selectedExercise.name}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              ) : selectedExercise.image_url ? (
                <img
                  key={`img-${selectedExercise.id}`}
                  src={`${BASE_URL}${selectedExercise.image_url}`}
                  alt={selectedExercise.name}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              ) : (
                <span style={{ fontSize: '48px' }}>🏋️</span>
              )}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '8px', textAlign: 'center' }}>{selectedExercise.name_zh || selectedExercise.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'center', textAlign: 'center' }}>
              <Tag color="cyan" style={{ backgroundColor: 'rgba(103, 194, 58, 0.8)', borderColor: 'rgba(103, 194, 58, 1)' }}>{selectedExercise.equipment || '无'}</Tag>
              {selectedExercise.category && <Tag color="purple" style={{ backgroundColor: 'rgba(120, 86, 255, 0.8)', borderColor: 'rgba(120, 86, 255, 1)' }}>{selectedExercise.category}</Tag>}
              {selectedExercise.target && <Tag color="orange" style={{ backgroundColor: 'rgba(250, 173, 20, 0.8)', borderColor: 'rgba(250, 173, 20, 1)' }}>{selectedExercise.target}</Tag>}
            </div>
            {selectedExercise.instructions && (
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginBottom: '8px', lineHeight: '1.6', textAlign: 'left' }}>{selectedExercise.instructions}</p>
            )}
            {selectedExercise.muscle_group && (
              <div style={{ marginBottom: '4px', textAlign: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px' }}>主要肌群：</span>
                <Tag style={{ fontSize: '12px', margin: '0 4px 0 0', backgroundColor: 'rgba(24, 144, 255, 0.8)', borderColor: 'rgba(24, 144, 255, 1)' }}>{selectedExercise.muscle_group}</Tag>
              </div>
            )}
            <div style={{ textAlign: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px' }}>辅助肌群：</span>
              {selectedExercise.secondary_muscles && selectedExercise.secondary_muscles.length > 0 ? (
                selectedExercise.secondary_muscles.map((m, i) => (
                  <Tag key={i} style={{ fontSize: '12px', margin: '0 4px 0 0', backgroundColor: 'rgba(103, 194, 58, 0.8)', borderColor: 'rgba(103, 194, 58, 1)' }}>{m}</Tag>
                ))
              ) : (
                <Tag style={{ fontSize: '12px', margin: '0 4px 0 0', backgroundColor: 'rgba(103, 194, 58, 0.8)', borderColor: 'rgba(103, 194, 58, 1)' }}>无</Tag>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
