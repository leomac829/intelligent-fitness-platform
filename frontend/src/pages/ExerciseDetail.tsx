import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Typography, Spin, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

const ExerciseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [exercise, setExercise] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      setLoading(true)
      fetch(`http://localhost:3002/api/training-exercises/data`)
        .then(res => res.json())
        .then(data => {
          const found = (data.exercises || []).find((ex: any) => ex.id === id)
          setExercise(found)
        })
        .catch(err => console.error('加载动作详情失败:', err))
        .finally(() => setLoading(false))
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="text-center text-white/60 py-20">
        <Title level={3}>动作不存在</Title>
        <Button onClick={() => navigate(-1)}>返回</Button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="mb-6">
        返回
      </Button>

      <Title level={2} className="text-white">{exercise.name_zh}</Title>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* 左侧：图片 */}
        <div>
          {exercise.image_url && (
            <img
              src={exercise.image_url}
              alt={exercise.name_zh}
              className="w-full rounded-xl"
              style={{ maxHeight: 400, objectFit: 'cover' }}
            />
          )}
          {exercise.gif_url && (
            <img
              src={exercise.gif_url}
              alt={exercise.name_zh}
              className="w-full rounded-xl mt-4"
              style={{ maxHeight: 400, objectFit: 'cover' }}
            />
          )}
        </div>

        {/* 右侧：信息 */}
        <div className="space-y-4">
          <div>
            <Text className="text-white/60 block">主要肌群</Text>
            <Text className="text-white">{exercise.muscle_group || '-'}</Text>
          </div>
          <div>
            <Text className="text-white/60 block">次要肌群</Text>
            <Text className="text-white">{exercise.secondary_muscles || '-'}</Text>
          </div>
          <div>
            <Text className="text-white/60 block">器械</Text>
            <Text className="text-white">{exercise.equipment || '-'}</Text>
          </div>
          <div>
            <Text className="text-white/60 block">分类</Text>
            <Text className="text-white">{exercise.category || '-'}</Text>
          </div>
          <div>
            <Text className="text-white/60 block">目标</Text>
            <Text className="text-white">{exercise.target || '-'}</Text>
          </div>
        </div>
      </div>

      {/* 说明 */}
      {exercise.instructions_zh && (
        <div className="mt-8 p-6 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
          <Title level={4} className="text-white">动作说明</Title>
          <Paragraph className="text-white/80 whitespace-pre-line">{exercise.instructions_zh}</Paragraph>
        </div>
      )}
    </div>
  )
}

export default ExerciseDetail
