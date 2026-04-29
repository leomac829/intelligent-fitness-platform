import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Typography, Card, Button, Collapse, Tag, Space, message } from 'antd'
import { LeftOutlined, SaveOutlined, CalendarOutlined, FireOutlined, ThunderboltOutlined, ClockCircleOutlined, DownloadOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { Panel } = Collapse

interface ExerciseData {
  动作名称: string
  训练肌群: string
  所需器械: string
  组数: number
  次数: string
  休息时间秒: number
  建议重量kg?: number
  训练要点?: string
}

interface DayData {
  周次: number
  训练日类型: string
  训练日名称: string
  本周训练日序号: number
  动作列表: ExerciseData[]
}

const TanChengyiPlanPreview: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const planData = location.state?.planData || []
  const config = location.state?.config || {}
  const [saving, setSaving] = useState(false)

  if (!planData || planData.length === 0) {
    return (
      <div className="h-screen relative overflow-hidden flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/images/GG.jpg')` }}
        />
        <div className="bg-black/30 absolute inset-0" />
        <div className="relative z-10 text-center">
          <Title level={2} style={{ color: 'white' }}>暂无训练计划数据</Title>
          <Button
            onClick={() => navigate('/three-split-plan-config')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white mt-4"
          >
            返回配置页面
          </Button>
        </div>
      </div>
    )
  }

  // 按周次和训练日分组
  const groupedByWeek: Record<number, DayData[]> = {}
  planData.forEach((day: DayData) => {
    if (!groupedByWeek[day.周次]) {
      groupedByWeek[day.周次] = []
    }
    groupedByWeek[day.周次].push(day)
  })

  const weeks = Object.keys(groupedByWeek).map(Number).sort((a, b) => a - b)

  // 获取训练日类型颜色
  const getDayTypeColor = (dayType: string) => {
    switch (dayType) {
      case 'push':
        return 'bg-blue-500/30 border-blue-500/50 text-blue-300'
      case 'pull':
        return 'bg-purple-500/30 border-purple-500/50 text-purple-300'
      case 'leg':
        return 'bg-green-500/30 border-green-500/50 text-green-300'
      default:
        return 'bg-white/10 border-white/20 text-white'
    }
  }

  // 处理保存
  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        message.error('请先登录')
        navigate('/login')
        return
      }

      const response = await fetch('http://localhost:3002/api/three-split-plans/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          config,
          planData
        })
      })

      if (response.ok) {
        message.success('训练计划保存成功')
        // 保持在当前页面，不跳转
      } else {
        const error = await response.json()
        message.error(error.error || '保存失败')
      }
    } catch (error) {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  // 导出为JSON
  const handleExport = () => {
    const dataStr = JSON.stringify(planData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `谭成义三分化训练计划_${config.fitness_level}_${config.plan_weeks}周.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    message.success('导出成功')
  }

  return (
    <div className="h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/images/GG.jpg')` }}
      />
      <div className="bg-black/30 absolute inset-0" />

      <div className="relative z-10 p-6 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
          }
          .ant-collapse {
            background: transparent !important;
            border: none !important;
          }
          .ant-collapse-header {
            color: white !important;
            background: rgba(255, 255, 255, 0.05) !important;
            border-radius: 12px !important;
          }
          .ant-collapse-content {
            background: transparent !important;
            color: white !important;
          }
          .ant-collapse-content-box {
            color: white !important;
          }
          .ant-collapse-arrow {
            color: white !important;
          }
        `}</style>

        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              icon={<LeftOutlined />}
              onClick={() => navigate('/three-split-plan-config')}
              className="mr-4 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white"
            >
              返回
            </Button>
            <Title level={2} style={{ color: 'white', margin: 0 }}>
              <CalendarOutlined className="mr-2" />
              训练计划预览
            </Title>
          </div>
          <Space>
            <Button
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
              className="bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 hover:border-blue-500/70 text-white"
            >
              保存
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              className="bg-purple-500/30 hover:bg-purple-500/50 border border-purple-500/50 hover:border-purple-500/70 text-white"
            >
              导出
            </Button>
          </Space>
        </div>

        {/* 配置信息 */}
        <Card className="mb-6 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
          <Title level={4} style={{ color: 'white', marginBottom: '16px' }}>
            <FireOutlined className="mr-2" />
            训练配置
          </Title>
          <div className="flex flex-wrap gap-4">
            <Tag className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg">
              健身基础：{config.fitness_level === 'beginner' ? '新手' : config.fitness_level === 'intermediate' ? '中级' : '高级'}
            </Tag>
            <Tag className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg">
              训练目标：{config.training_goal === 'muscle_gain' ? '增肌' : config.training_goal === 'strength' ? '力量' : '减脂'}
            </Tag>
            <Tag className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg">
              每周训练：{config.weekly_training_days}天
            </Tag>
            <Tag className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg">
              基础重量：{config.base_weight}kg
            </Tag>
            <Tag className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg">
              渐进率：{config.progressive_rate}%
            </Tag>
            <Tag className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg">
              计划周期：{config.plan_weeks}周
            </Tag>
          </div>
        </Card>

        {/* 周次训练计划 */}
        {weeks.map(week => (
          <div key={week} className="mb-6">
            <Title level={3} style={{ color: 'white', marginBottom: '16px' }}>
              <CalendarOutlined className="mr-2" />
              第 {week} 周
            </Title>

            {groupedByWeek[week].map((day, dayIndex) => (
              <Collapse
                key={`${week}-${day.训练日类型}`}
                defaultActiveKey={dayIndex === 0 ? ['0'] : []}
                className="mb-4"
              >
                <Panel
                  header={
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">
                          {day.训练日名称}
                        </span>
                        <Tag className={getDayTypeColor(day.训练日类型)}>
                          {day.训练日类型 === 'push' ? '推' : day.训练日类型 === 'pull' ? '拉' : '腿'}
                        </Tag>
                      </div>
                      <Text style={{ color: 'rgba(255,255,255,0.6)' }}>
                        共 {day.动作列表.length} 个动作
                      </Text>
                    </div>
                  }
                  key={String(dayIndex)}
                >
                  <div className="space-y-4">
                    {day.动作列表.map((exercise, exIndex) => (
                      <Card
                        key={exIndex}
                        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl"
                        bodyStyle={{ padding: '16px' }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <ThunderboltOutlined style={{ color: '#60a5fa' }} />
                            <Text style={{ color: 'white', fontSize: '16px', fontWeight: 600 }}>
                              {exIndex + 1}. {exercise.动作名称}
                            </Text>
                          </div>
                          <Tag className="bg-blue-500/20 border-blue-500/30 text-blue-300">
                            {exercise.训练肌群}
                          </Tag>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <Text style={{ color: 'rgba(255,255,255,0.6)' }}>组数：</Text>
                            <Text style={{ color: 'white' }}>{exercise.组数}</Text>
                          </div>
                          <div className="flex items-center gap-2">
                            <Text style={{ color: 'rgba(255,255,255,0.6)' }}>次数：</Text>
                            <Text style={{ color: 'white' }}>{exercise.次数}</Text>
                          </div>
                          <div className="flex items-center gap-2">
                            <ClockCircleOutlined style={{ color: 'rgba(255,255,255,0.6)' }} />
                            <Text style={{ color: 'white' }}>{exercise.休息时间秒}s</Text>
                          </div>
                          {exercise.建议重量kg && (
                            <div className="flex items-center gap-2">
                              <Text style={{ color: 'rgba(255,255,255,0.6)' }}>重量：</Text>
                              <Text style={{ color: '#60a5fa', fontWeight: 600 }}>{exercise.建议重量kg}kg</Text>
                            </div>
                          )}
                        </div>

                        <div className="flex items-start gap-2 mb-2">
                          <Text style={{ color: 'rgba(255,255,255,0.6)' }}>器械：</Text>
                          <Text style={{ color: 'white' }}>{exercise.所需器械}</Text>
                        </div>

                        {exercise.训练要点 && (
                          <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <Text style={{ color: '#fbbf24', fontSize: '13px' }}>
                              💡 {exercise.训练要点}
                            </Text>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </Panel>
              </Collapse>
            ))}
          </div>
        ))}

        {/* 底部操作按钮 */}
        <div className="flex justify-end space-x-4 mt-6 pb-6">
          <Button
            onClick={() => navigate('/three-split-plan-config')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white"
          >
            返回配置
          </Button>
          <Button
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
            className="bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 hover:border-blue-500/70 text-white"
          >
            保存计划
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TanChengyiPlanPreview
