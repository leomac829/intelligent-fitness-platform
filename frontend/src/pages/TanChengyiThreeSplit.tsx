import { useState, useEffect, useRef, useCallback } from 'react'
import { Button, InputNumber, Select, message, Card, Tag, Collapse, Radio } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Option } = Select
const { Panel } = Collapse

const TanChengyiThreeSplit: React.FC = () => {
  const navigate = useNavigate()

  const [config, setConfig] = useState({
    fitness_level: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    training_goal: 'muscle_gain' as 'muscle_gain' | 'strength' | 'fat_loss',
    weekly_training_days: 3 as 3 | 6,
    base_weight: 50,
    progressive_rate: 5,
    plan_weeks: 4
  })

  const [planData, setPlanData] = useState<any[]>([])
  const [configData, setConfigData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null)
  const [activeWeek, setActiveWeek] = useState(0)

  const hasRequestedPlan = useRef(false)

  // 加载用户最新计划
  const loadLatestPlan = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3002/api/three-split-plans/latest', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success && data.data) {
        setPlanData(data.data.planData)
        setConfigData(data.data.config)
        setSavedPlanId(data.data.id || null)
        if (data.data.config) {
          setConfig(prev => ({ ...prev, ...data.data.config }))
        }
      }
    } catch (e) {
      console.error('加载历史计划失败:', e)
    }
  }, [])

  useEffect(() => {
    if (!hasRequestedPlan.current) {
      hasRequestedPlan.current = true
      loadLatestPlan()
    }
  }, [loadLatestPlan])

  const generatePlan = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const requestData = {
        fitness_level: config.fitness_level,
        training_goal: config.training_goal,
        weekly_training_days: config.weekly_training_days,
        base_weight: config.base_weight,
        progressive_rate: config.progressive_rate / 100,
        plan_weeks: config.plan_weeks
      }

      const response = await fetch('http://localhost:3002/api/three-split-plans/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })

      const data = await response.json()
      if (data.success && data.data) {
        setPlanData(data.data.planData)
        setConfigData(data.data.config)
        setSavedPlanId(data.data.id || null)
        setActiveWeek(0)
        message.success('训练计划生成成功！')
      } else {
        message.error(data.error || '生成失败')
      }
    } catch (error) {
      console.error('生成训练计划失败:', error)
      message.error('网络请求失败')
    } finally {
      setLoading(false)
    }
  }

  // 按周次分组
  const groupedByWeek: Record<number, any[]> = {}
  planData.forEach((day: any) => {
    const week = day.周次
    if (!groupedByWeek[week]) groupedByWeek[week] = []
    groupedByWeek[week].push(day)
  })
  const weeks = Object.keys(groupedByWeek).map(Number).sort((a, b) => a - b)

  const getDayTypeColor = (dayType: string) => {
    switch (dayType) {
      case 'push': return 'bg-blue-500/30 border-blue-500/50 text-blue-300'
      case 'pull': return 'bg-purple-500/30 border-purple-500/50 text-purple-300'
      case 'leg': return 'bg-green-500/30 border-green-500/50 text-green-300'
      default: return 'bg-white/10 border-white/20 text-white'
    }
  }

  const currentWeekDays = weeks[activeWeek] ? groupedByWeek[weeks[activeWeek]] : []

  return (
    <div className="col-span-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 pb-6 max-h-[calc(100vh-4rem)] overflow-y-auto flex flex-col custom-scrollbar">
      <style>{`
        .tan-chengyi-input .ant-input-number-input {
          color: white !important;
        }
        .tan-chengyi-input .ant-input-number-handler-wrap button {
          color: white !important;
        }
        .tan-chengyi-select .ant-select-selector {
          color: white !important;
        }
        .tan-chengyi-select .ant-select-selection-item {
          color: white !important;
        }
      `}</style>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">谭成义三分化训练计划</h1>
        <Tag color="blue" className="text-base px-4 py-1 bg-blue-500/20 border-blue-500/30 text-blue-300">智能生成</Tag>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {/* 配置区域 */}
        <Card
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex-shrink-0"
          title={<span className="text-white text-base">🏋️ 训练配置</span>}
          bodyStyle={{ padding: '12px' }}
        >
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-white/80 text-xs mb-1">健身基础</label>
              <Select
                value={config.fitness_level}
                onChange={(value) => setConfig({ ...config, fitness_level: value })}
                size="small"
                className="tan-chengyi-select"
                style={{ width: '100%', backgroundColor: 'rgba(15, 23, 42, 0.60)', borderColor: 'rgba(148, 163, 184, 0.40)', color: '#f1f5f9' }}
              >
                <Option value="beginner">新手</Option>
                <Option value="intermediate">中级</Option>
                <Option value="advanced">高级</Option>
              </Select>
            </div>

            <div>
              <label className="block text-white/80 text-xs mb-1">训练目标</label>
              <Select
                value={config.training_goal}
                onChange={(value) => setConfig({ ...config, training_goal: value })}
                size="small"
                className="tan-chengyi-select"
                style={{ width: '100%', backgroundColor: 'rgba(15, 23, 42, 0.60)', borderColor: 'rgba(148, 163, 184, 0.40)', color: '#f1f5f9' }}
              >
                <Option value="muscle_gain">增肌</Option>
                <Option value="strength">力量</Option>
                <Option value="fat_loss">减脂</Option>
              </Select>
            </div>

            <div>
              <label className="block text-white/80 text-xs mb-1">每周训练天数</label>
              <Select
                value={config.weekly_training_days}
                onChange={(value) => setConfig({ ...config, weekly_training_days: value })}
                size="small"
                className="tan-chengyi-select"
                style={{ width: '100%', backgroundColor: 'rgba(15, 23, 42, 0.60)', borderColor: 'rgba(148, 163, 184, 0.40)', color: '#f1f5f9' }}
              >
                <Option value={3}>3天（推/拉/腿各1次）</Option>
                <Option value={6}>6天（推/拉/腿各2次）</Option>
              </Select>
            </div>

            <div>
              <label className="block text-white/80 text-xs mb-1">基础重量 (kg)</label>
              <InputNumber
                value={config.base_weight}
                onChange={(value) => setConfig({ ...config, base_weight: value || 50 })}
                min={10} max={200}
                size="small"
                className="tan-chengyi-input"
                style={{ width: '100%', backgroundColor: 'rgba(15, 23, 42, 0.60)', borderColor: 'rgba(148, 163, 184, 0.40)', color: '#f1f5f9' }}
              />
            </div>

            <div>
              <label className="block text-white/80 text-xs mb-1">渐进超负荷率 (%)</label>
              <InputNumber
                value={config.progressive_rate}
                onChange={(value) => setConfig({ ...config, progressive_rate: value || 5 })}
                min={5} max={10}
                size="small"
                className="tan-chengyi-input"
                style={{ width: '100%', backgroundColor: 'rgba(15, 23, 42, 0.60)', borderColor: 'rgba(148, 163, 184, 0.40)', color: '#f1f5f9' }}
              />
            </div>

            <div>
              <label className="block text-white/80 text-xs mb-1">计划周期 (周)</label>
              <InputNumber
                value={config.plan_weeks}
                onChange={(value) => setConfig({ ...config, plan_weeks: value || 4 })}
                min={1} max={52}
                size="small"
                className="tan-chengyi-input"
                style={{ width: '100%', backgroundColor: 'rgba(15, 23, 42, 0.60)', borderColor: 'rgba(148, 163, 184, 0.40)', color: '#f1f5f9' }}
              />
            </div>
          </div>

          <div className="mt-3">
            <Button
              type="primary"
              block
              size="middle"
              loading={loading}
              onClick={generatePlan}
              className="bg-gradient-to-r from-blue-500 to-purple-500 border-none text-white"
            >
              🚀 生成训练计划
            </Button>
          </div>
        </Card>

        {/* 计划展示区域 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
          {planData.length > 0 ? (
            <>
              {/* 周次切换 */}
              {weeks.length > 1 && (
                <Card
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex-shrink-0"
                  bodyStyle={{ padding: '12px 16px' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">📅 第 {weeks[activeWeek]} 周</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="small"
                        className="bg-white/10 hover:bg-white/20 border border-white/20 text-white h-7 px-3"
                        onClick={() => setActiveWeek(prev => prev <= 0 ? weeks.length - 1 : prev - 1)}
                      >
                        ‹ 上一周
                      </Button>
                      <span className="text-white/60 text-sm">{activeWeek + 1}/{weeks.length}</span>
                      <Button
                        size="small"
                        className="bg-white/10 hover:bg-white/20 border border-white/20 text-white h-7 px-3"
                        onClick={() => setActiveWeek(prev => prev >= weeks.length - 1 ? 0 : prev + 1)}
                      >
                        下一周 ›
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* 训练日展示 */}
              {currentWeekDays.map((day, dayIdx) => (
                <Collapse
                  key={dayIdx}
                  defaultActiveKey={dayIdx === 0 ? ['0'] : []}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden"
                  ghost
                  expandIconPosition="end"
                  style={{ background: 'transparent' }}
                >
                  <Panel
                    header={
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-semibold text-base">{day.训练日名称}</span>
                          <Tag className={getDayTypeColor(day.训练日类型)}>
                            {day.训练日类型 === 'push' ? '推' : day.训练日类型 === 'pull' ? '拉' : '腿'}
                          </Tag>
                        </div>
                        <span className="text-white/60 text-sm">共 {day.动作列表.length} 个动作</span>
                      </div>
                    }
                    key={String(dayIdx)}
                    style={{ color: 'white' }}
                  >
                    <div className="space-y-3 mt-2">
                      {day.动作列表.map((exercise: any, exIdx: number) => (
                        <div
                          key={exIdx}
                          className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-400 font-bold text-lg">{exIdx + 1}.</span>
                              <span className="text-white font-semibold text-base">{exercise.动作名称}</span>
                            </div>
                            <Tag className="bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs">
                              {exercise.训练肌群}
                            </Tag>
                          </div>

                          <div className="grid grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-1">
                              <span className="text-white/50">组数</span>
                              <span className="text-white font-medium">{exercise.组数}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-white/50">次数</span>
                              <span className="text-white font-medium">{exercise.次数}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-white/50">休息</span>
                              <span className="text-white font-medium">{exercise.休息时间秒}s</span>
                            </div>
                            {exercise.建议重量kg && (
                              <div className="flex items-center gap-1">
                                <span className="text-white/50">重量</span>
                                <span className="text-blue-400 font-bold">{exercise.建议重量kg}kg</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-2 text-xs text-white/50">
                            器械：{exercise.所需器械}
                          </div>

                          {exercise.训练要点 && (
                            <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                              <span className="text-amber-400 text-xs">💡 {exercise.训练要点}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Panel>
                </Collapse>
              ))}
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-6xl mb-4">🏋️</div>
                <h3 className="text-white text-xl mb-2">配置你的训练计划</h3>
                <p className="text-white/60 text-sm">设置参数后点击"生成训练计划"</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TanChengyiThreeSplit
