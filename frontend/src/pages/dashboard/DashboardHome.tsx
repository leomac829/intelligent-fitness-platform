import { Card, Button, Select, Badge, message, Modal, Checkbox } from "antd"
import {
  BarChartOutlined,
  CheckOutlined,
  FireOutlined,
  CalendarOutlined,
  FilterOutlined,
  DownloadOutlined,
  UserOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons"
import { FC, useState, useEffect } from "react"
import dayjs from "dayjs"

const BODY_PARTS = [
  { key: 'chest', label: '胸', color: 'bg-red-500/30 text-red-400 border-red-400/30' },
  { key: 'back', label: '背', color: 'bg-blue-500/30 text-blue-400 border-blue-400/30' },
  { key: 'shoulders', label: '肩', color: 'bg-yellow-500/30 text-yellow-400 border-yellow-400/30' },
  { key: 'arms', label: '手臂', color: 'bg-green-500/30 text-green-400 border-green-400/30' },
  { key: 'abs', label: '腹肌', color: 'bg-purple-500/30 text-purple-400 border-purple-400/30' },
  { key: 'glutes', label: '臀', color: 'bg-pink-500/30 text-pink-400 border-pink-400/30' },
  { key: 'legs', label: '腿', color: 'bg-cyan-500/30 text-cyan-400 border-cyan-400/30' },
]

interface ScheduleItem {
  id: string
  date: string
  body_parts: string[]
}

interface DashboardHomeProps {
  dashboardData: any
  goals: any[]
  calendarView: { year: number; month: number }
  setCalendarView: (view: { year: number; month: number }) => void
  setActiveMenu: (menu: string) => void
  setActiveSubMenu: (menu: string) => void
  setShowGoalModal: (show: boolean) => void
  setEditingGoal: (goal: any) => void
  setGoalForm: (form: any) => void
  loadGoals: () => Promise<void>
}

export const DashboardHome: FC<DashboardHomeProps> = ({
  dashboardData,
  goals,
  calendarView,
  setCalendarView,
  setActiveMenu,
  setActiveSubMenu,
  setShowGoalModal,
  setEditingGoal,
  setGoalForm,
  loadGoals,
}) => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedParts, setSelectedParts] = useState<string[]>([])
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null)

  const loadSchedules = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3002/api/schedules?year=${calendarView.year}&month=${calendarView.month}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setSchedules(data.data || [])
    } catch (e) { console.error('加载日程失败', e) }
  }

  useEffect(() => { loadSchedules() }, [calendarView])

  const openScheduleModal = (date: string) => {
    setSelectedDate(date)
    const existing = schedules.find(s => s.date === date)
    if (existing) {
      setEditingScheduleId(existing.id)
      setSelectedParts(existing.body_parts || [])
    } else {
      setEditingScheduleId(null)
      setSelectedParts([])
    }
    setShowScheduleModal(true)
  }

  const saveSchedule = async () => {
    if (!selectedDate || selectedParts.length === 0) {
      message.warning('请选择至少一个训练部位')
      return
    }
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3002/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ date: selectedDate, body_parts: selectedParts })
      })
      const data = await res.json()
      if (data.success) {
        message.success(editingScheduleId ? '日程已更新' : '日程已创建')
        setShowScheduleModal(false)
        loadSchedules()
      } else {
        message.error(data.error || '保存失败')
      }
    } catch (e) {
      console.error('保存日程失败', e)
      message.error('保存失败')
    }
  }

  const deleteSchedule = async () => {
    if (!editingScheduleId) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3002/api/schedules/${editingScheduleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        message.success('日程已删除')
        setShowScheduleModal(false)
        loadSchedules()
      } else {
        message.error(data.error || '删除失败')
      }
    } catch (e) {
      console.error('删除日程失败', e)
      message.error('删除失败')
    }
  }

  const getPartsForDate = (dateStr: string): string[] => {
    const schedule = schedules.find(s => s.date === dateStr)
    return schedule ? schedule.body_parts : []
  }

  const getWorkoutIcon = (type: string) => {
    switch (type) {
      case 'cardio': return <FireOutlined className="text-green-400" />
      case 'flexibility': return <UserOutlined className="text-orange-400" />
      default: return <BarChartOutlined className="text-blue-400" />
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const isToday = date.toDateString() === today.toDateString()
    const isYesterday = date.toDateString() === yesterday.toDateString()
    if (isToday) return '今天'
    if (isYesterday) return '昨天'
    if (date.getMonth() !== today.getMonth()) {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    }
    const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24))
    return `${diffDays}天前`
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-6">
        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 active:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/80 text-sm">总训练次数</h3>
            <div className="w-10 h-10 bg-[#6B5CA5]/20 rounded-xl flex items-center justify-center">
              <BarChartOutlined className="text-[#6B5CA5] text-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-white">{dashboardData.totalSessions}</p>
            {dashboardData.isNewMonth ? (
              <p className="text-xs text-blue-400">本月训练刚开始，加油💪</p>
            ) : dashboardData.showComparison ? (
              <p className={`text-xs ${dashboardData.totalSessions >= dashboardData.lastMonthSessions ? 'text-green-400' : 'text-red-400'}`}>
                {dashboardData.lastMonthSessions > 0 
                  ? `${((dashboardData.totalSessions - dashboardData.lastMonthSessions) / dashboardData.lastMonthSessions * 100).toFixed(1)}%`
                  : '0%'} 较上月
              </p>
            ) : (
              <p className="text-xs text-white/60">本月暂无环比</p>
            )}
          </div>
        </Card>

        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 active:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/80 text-sm">消耗热量</h3>
            <div className="w-10 h-10 bg-[#FF9F43]/20 rounded-xl flex items-center justify-center">
              <FireOutlined className="text-[#FF9F43] text-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-white">{dashboardData.totalCalories.toLocaleString()}</p>
            {dashboardData.isNewMonth ? (
              <p className="text-xs text-blue-400">本月训练刚开始，加油💪</p>
            ) : dashboardData.showComparison ? (
              <p className={`text-xs ${dashboardData.totalCalories >= dashboardData.lastMonthCalories ? 'text-green-400' : 'text-red-400'}`}>
                {dashboardData.lastMonthCalories > 0 
                  ? `${((dashboardData.totalCalories - dashboardData.lastMonthCalories) / dashboardData.lastMonthCalories * 100).toFixed(1)}%`
                  : '0%'} 较上月
              </p>
            ) : (
              <p className="text-xs text-white/60">本月暂无环比</p>
            )}
          </div>
        </Card>

        <Card 
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 active:bg-white/10 transition-all duration-300 cursor-pointer"
          onClick={() => setActiveSubMenu('training-records')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/80 text-sm">连续天数</h3>
            <div className="w-10 h-10 bg-[#58B957]/20 rounded-xl flex items-center justify-center">
              <CalendarOutlined className="text-[#58B957] text-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-white">{dashboardData.streakDays}</p>
            <p className="text-xs text-green-400">
              {dashboardData.streakDays > 0 ? `连续训练 ${dashboardData.streakDays} 天` : '开始你的训练吧'}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-5 active:bg-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">最近训练</h3>
              <div className="flex items-center space-x-2">
                <Button size="small" className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20 text-xs px-2 py-1" onClick={() => message.info('筛选功能开发中')}>
                  <FilterOutlined className="mr-1 h-3 w-3" /> 筛选
                </Button>
                <Button size="small" className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20 text-xs px-2 py-1" onClick={() => message.info('导出功能开发中')}>
                  <DownloadOutlined className="mr-1 h-3 w-3" /> 导出
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {dashboardData.recentWorkouts.length > 0 ? (
                dashboardData.recentWorkouts.slice(0, 3).map((workout: any, index: number) => (
                  <div key={index} className="flex items-center p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer" onClick={() => message.info('训练详情功能开发中')}>
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mr-2">{getWorkoutIcon(workout.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{workout.name}</p>
                      <p className="text-xs text-white/60">{formatDate(workout.date)} · {workout.duration}分钟</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white text-sm">{workout.calories}千卡</p>
                      <Badge className="text-xs bg-green-500/20 text-green-400 border-green-400/30">完成</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <BarChartOutlined className="text-3xl text-white/20 mb-2" />
                  <p className="text-white/60 text-sm mb-2">还没有训练记录</p>
                  <Button size="small" className="bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 text-white text-xs" onClick={() => setActiveMenu('plans')}>去创建训练计划</Button>
                </div>
              )}
            </div>
          </Card>

          <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-5 active:bg-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">训练日历</h3>
              <div className="flex items-center space-x-2">
                <Select value={calendarView.year} onChange={(value) => setCalendarView({ ...calendarView, year: value })} className="w-24" size="small" bordered={false} dropdownStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.2)' }}>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <Select.Option key={year} value={year} className="text-white">{year}年</Select.Option>
                  ))}
                </Select>
                <Select value={calendarView.month} onChange={(value) => setCalendarView({ ...calendarView, month: value })} className="w-16" size="small" bordered={false} dropdownStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.2)' }}>
                  {Array.from({ length: 12 }, (_, i) => i).map(month => (
                    <Select.Option key={month} value={month} className="text-white">{month + 1}月</Select.Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <Button size="small" className="text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border-none" onClick={() => { const newMonth = calendarView.month - 1; if (newMonth < 0) { setCalendarView({ year: calendarView.year - 1, month: 11 }); } else { setCalendarView({ ...calendarView, month: newMonth }); } }}>← 上月</Button>
              <span className="text-white font-medium">{calendarView.year}年{calendarView.month + 1}月</span>
              <Button size="small" className="text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border-none" onClick={() => { const newMonth = calendarView.month + 1; if (newMonth > 11) { setCalendarView({ year: calendarView.year + 1, month: 0 }); } else { setCalendarView({ ...calendarView, month: newMonth }); } }}>下月 →</Button>
            </div>
            <div className="bg-white/5 rounded-xl border border-white/10 p-3">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                  <div key={day} className="text-center text-white/60 text-xs py-1">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {(() => {
                  const today = new Date()
                  const year = calendarView.year
                  const month = calendarView.month
                  const firstDay = new Date(year, month, 1)
                  const lastDay = new Date(year, month + 1, 0)
                  const startPadding = firstDay.getDay()
                  const daysInMonth = lastDay.getDate()
                  const days = []
                  for (let i = 0; i < startPadding; i++) { days.push(<div key={`empty-${i}`} className="h-10"></div>) }
                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                    const parts = getPartsForDate(dateStr)
                    const hasSchedule = parts.length > 0
                    days.push(
                      <div key={day} className={`h-10 flex flex-col items-center justify-center rounded-lg text-xs cursor-pointer transition-all duration-200 relative ${isToday ? 'bg-blue-500/50 text-white font-bold ring-2 ring-blue-400/50' : hasSchedule ? 'bg-green-500/20 text-green-400 hover:bg-green-500/40' : 'text-white/60 hover:bg-white/10'}`} onClick={() => openScheduleModal(dateStr)}>
                        <span className="text-xs">{day}</span>
                        {hasSchedule && (
                          <div className="flex gap-0.5 mt-0.5">
                            {parts.slice(0, 3).map(p => {
                              const partInfo = BODY_PARTS.find(b => b.key === p)
                              return partInfo ? <span key={p} className={`text-[8px] px-0.5 rounded ${partInfo.color}`}>{partInfo.label}</span> : null
                            })}
                            {parts.length > 3 && <span className="text-[8px] text-white/50">+{parts.length - 3}</span>}
                          </div>
                        )}
                      </div>
                    )
                  }
                  return days
                })()}
              </div>
              <div className="flex items-center justify-center space-x-4 mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center space-x-1"><div className="w-3 h-3 bg-blue-500/50 rounded ring-1 ring-blue-400/50"></div><span className="text-white/60 text-xs">今天</span></div>
                <div className="flex items-center space-x-1"><div className="w-3 h-3 bg-green-500/30 rounded"></div><span className="text-white/60 text-xs">有安排</span></div>
                <div className="flex items-center space-x-1"><div className="w-3 h-3 bg-white/10 rounded"></div><span className="text-white/60 text-xs">无安排</span></div>
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <Button size="small" className="text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/20 text-xs" onClick={() => { const today = new Date(); setCalendarView({ year: today.getFullYear(), month: today.getMonth() }) }}>返回今天</Button>
            </div>
          </Card>
        </div>

        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 active:bg-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">健身目标</h3>
            <Button size="small" className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20" onClick={async () => { setEditingGoal(null); setGoalForm({ type: 'weight', target_value: '', start_value: '', start_date: new Date().toISOString().split('T')[0] }); await loadGoals(); setShowGoalModal(true) }}>
              <SettingOutlined className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">体重目标</span>
                <span className="text-white font-semibold text-sm">{goals.find(g => g.type === 'weight') ? `${goals.find(g => g.type === 'weight')?.start_value}kg → ${goals.find(g => g.type === 'weight')?.target_value}kg` : '未设置'}</span>
              </div>
              {goals.find(g => g.type === 'weight') && (<>
                <div className="w-full bg-white/10 rounded-full h-2"><div className="bg-gradient-to-r from-[#4FACFE] to-[#00F2FE] h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (goals.find(g => g.type === 'weight')?.current_value || 0) / (goals.find(g => g.type === 'weight')?.target_value || 1) * 100)}%` }}></div></div>
                <div className="flex justify-between text-xs"><span className="text-[#4FACFE]">{Math.round(((goals.find(g => g.type === 'weight')?.start_value - goals.find(g => g.type === 'weight')?.current_value) / (goals.find(g => g.type === 'weight')?.start_value - goals.find(g => g.type === 'weight')?.target_value) || 0) * 100)}% 完成</span></div>
              </>)}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">月度训练目标</span>
                <span className="text-white font-semibold text-sm">{dashboardData.goals.training.current}/{dashboardData.goals.training.target}次</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2"><div className="bg-gradient-to-r from-[#4ECDC4] to-[#6B5CA5] h-2 rounded-full transition-all duration-500" style={{ width: `${dashboardData.goals.training.completionRate}%` }}></div></div>
              <div className="flex justify-between text-xs"><span className="text-[#4ECDC4]">{dashboardData.goals.training.completionRate}% 完成</span>{dashboardData.goals.training.completionRate >= 100 && (<span className="text-green-400">已完成✅</span>)}</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">月度热量消耗</span>
                <span className="text-white font-semibold text-sm">{dashboardData.goals.calories.current.toLocaleString()}/{dashboardData.goals.calories.target.toLocaleString()}千卡</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2"><div className="bg-gradient-to-r from-[#FF9F43] to-[#FF6B6B] h-2 rounded-full transition-all duration-500" style={{ width: `${dashboardData.goals.calories.completionRate}%` }}></div></div>
              <div className="flex justify-between text-xs"><span className="text-[#FF9F43]">{dashboardData.goals.calories.completionRate}% 完成</span>{dashboardData.goals.calories.completionRate >= 100 && (<span className="text-green-400">已完成✅</span>)}</div>
            </div>
            <div className="space-y-3">
              <h4 className="text-white font-medium text-sm">训练类型分布</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between"><div className="flex items-center space-x-2"><div className="w-2 h-2 bg-blue-400 rounded-full"></div><span className="text-white/80 text-xs">力量训练</span></div><span className="text-white text-xs">{dashboardData.trainingTypeDistribution.strength}%</span></div>
                <div className="w-full bg-white/10 rounded-full h-1.5"><div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${dashboardData.trainingTypeDistribution.strength}%` }}></div></div>
                <div className="flex items-center justify-between"><div className="flex items-center space-x-2"><div className="w-2 h-2 bg-green-400 rounded-full"></div><span className="text-white/80 text-xs">有氧运动</span></div><span className="text-white text-xs">{dashboardData.trainingTypeDistribution.cardio}%</span></div>
                <div className="w-full bg-white/10 rounded-full h-1.5"><div className="bg-green-400 h-1.5 rounded-full" style={{ width: `${dashboardData.trainingTypeDistribution.cardio}%` }}></div></div>
                <div className="flex items-center justify-between"><div className="flex items-center space-x-2"><div className="w-2 h-2 bg-orange-400 rounded-full"></div><span className="text-white/80 text-xs">柔韧性训练</span></div><span className="text-white text-xs">{dashboardData.trainingTypeDistribution.flexibility}%</span></div>
                <div className="w-full bg-white/10 rounded-full h-1.5"><div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${dashboardData.trainingTypeDistribution.flexibility}%` }}></div></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
              <div className="bg-white/5 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-white">{dashboardData.remainingSessions}</p><p className="text-white/60 text-xs">本月剩余训练次数</p></div>
              <div className="bg-white/5 rounded-lg p-3 text-center"><p className={`text-lg font-bold ${dashboardData.todayWorkoutStatus === '已完成（有效）' ? 'text-green-400' : dashboardData.todayWorkoutStatus === '无效记录' ? 'text-orange-400' : 'text-white'}`}>{dashboardData.todayWorkoutStatus}</p><p className="text-white/60 text-xs">今日训练状态</p></div>
            </div>
          </div>
        </Card>
      </div>

      {/* 日程弹窗 */}
      <Modal
        title={editingScheduleId ? `编辑日程 (${selectedDate})` : `新增日程 (${selectedDate})`}
        open={showScheduleModal}
        onCancel={() => setShowScheduleModal(false)}
        onOk={saveSchedule}
        okText="保存"
        cancelText="取消"
        footer={[
          <Button key="delete" danger icon={<DeleteOutlined />} disabled={!editingScheduleId} onClick={deleteSchedule}>
            删除
          </Button>,
          <Button key="cancel" onClick={() => setShowScheduleModal(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={saveSchedule}>
            保存
          </Button>,
        ]}
      >
        <div className="py-4">
          <p className="text-white/80 text-sm mb-4">选择今天训练的部位（可多选）：</p>
          <div className="grid grid-cols-3 gap-3">
            {BODY_PARTS.map(part => (
              <div
                key={part.key}
                onClick={() => {
                  setSelectedParts(prev =>
                    prev.includes(part.key) ? prev.filter(p => p !== part.key) : [...prev, part.key]
                  )
                }}
                className={`cursor-pointer rounded-xl p-4 text-center transition-all duration-200 border ${
                  selectedParts.includes(part.key)
                    ? part.color + ' bg-opacity-30 scale-105 shadow-lg'
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                }`}
              >
                <p className="text-lg font-bold">{part.label}</p>
                {selectedParts.includes(part.key) && <CheckOutlined className="mt-1" />}
              </div>
            ))}
          </div>
          {selectedParts.length > 0 && (
            <div className="mt-4 p-3 bg-white/5 rounded-xl">
              <p className="text-white/60 text-xs mb-2">已选择：{selectedParts.length} 个部位</p>
              <div className="flex flex-wrap gap-2">
                {selectedParts.map(p => {
                  const partInfo = BODY_PARTS.find(b => b.key === p)
                  return partInfo ? <span key={p} className={`text-xs px-2 py-1 rounded-full ${partInfo.color}`}>{partInfo.label}</span> : null
                })}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
