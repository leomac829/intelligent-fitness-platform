import { FC, useState } from "react"
import { Card, Button, message } from "antd"
import { PlusOutlined, RightOutlined, CheckOutlined } from "@ant-design/icons"
import dayjs from "dayjs"

interface WorkoutSchedule {
  id?: number
  name: string
  time: string
  details?: string[]
}

interface DayData {
  day: string
  date: string
  workouts: WorkoutSchedule[]
}

interface SchedulePageProps {
  loadSchedules: () => Promise<void>
  loadWorkouts: () => Promise<void>
}

export const SchedulePage: FC<SchedulePageProps> = ({ loadSchedules, loadWorkouts }) => {
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null)
  const [selectedWorkouts, setSelectedWorkouts] = useState<WorkoutSchedule[]>([])
  const [showWorkoutDetailModal, setShowWorkoutDetailModal] = useState(false)
  const [expandedWorkout, setExpandedWorkout] = useState<number | null>(null)
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false)
  const [currentDay, setCurrentDay] = useState<DayData | null>(null)
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false)
  const [currentWorkout, setCurrentWorkout] = useState<any>(null)

  return (
    <>
      <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">本周训练安排</h3>
          <Button className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]" onClick={() => console.log('添加日程')}>
            <PlusOutlined className="mr-2 h-4 w-4" /> 添加日程
          </Button>
        </div>
        <div className="mb-6 space-y-3">
          <div className="flex justify-between items-center"><span className="text-white/80 text-sm">本周训练完成率</span><span className="text-white font-semibold">已完成 2/5 次训练</span></div>
          <div className="w-full bg-white/10 rounded-full h-3"><div className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full" style={{ width: "40%" }}></div></div>
          <div className="flex justify-between text-sm"><span className="text-green-400">2次完成</span><span className="text-white/60">40%</span></div>
        </div>
        <div className="grid grid-cols-7 gap-4">
          {(() => {
            const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
            const today = dayjs()
            const startOfWeek = today.startOf('week').add(1, 'day')
            const workoutsMap: Record<number, WorkoutSchedule[]> = { 0: [{ name: '胸部训练', time: '19:00-20:00' }], 1: [{ name: '腿部训练', time: '18:30-19:30' }], 3: [{ name: '背部训练', time: '19:00-20:00' }], 4: [{ name: '肩部训练', time: '18:30-19:30' }], 5: [{ name: '手臂训练', time: '10:00-11:00' }] }
            return days.map((day, index) => {
              const currentDate = startOfWeek.add(index, 'day')
              const isToday = currentDate.isSame(today, 'day')
              const dateStr = currentDate.format('DD')
              const workouts = workoutsMap[index] || []
              const dayData: DayData = { day, date: dateStr, workouts }
              return (
                <div key={index} className={`relative rounded-xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer ${isToday ? 'bg-gradient-to-br from-blue-500/10 to-blue-400/5 border border-blue-400/30' : 'bg-white/5 border border-white/10'}`} onClick={() => { setSelectedDay(dayData); setSelectedWorkouts(dayData.workouts); setShowWorkoutDetailModal(true) }}>
                  <div className="text-center mb-3"><p className="text-white font-semibold">{day}</p><p className={`text-lg font-bold ${isToday ? 'text-blue-400' : 'text-white/80'}`}>{dateStr}</p></div>
                  <div className="space-y-2 mb-4">
                    {workouts.length > 0 ? workouts.map((workout, wi) => (<div key={wi} className="bg-white/5 rounded-lg p-2"><p className="text-blue-400 text-sm font-semibold">{workout.name}</p><p className="text-white/50 text-xs">{workout.time}</p></div>)) : (<div className="text-center space-y-1 opacity-70"><div className="text-white/50 text-2xl mb-1">🧘</div><p className="text-white/50 text-sm">休息日</p><div className="h-4"></div></div>)}
                  </div>
                  <Button size="small" className="absolute bottom-2 right-2 bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 text-white rounded-full w-6 h-6 flex items-center justify-center p-0" onClick={(e) => { e.stopPropagation(); setCurrentDay(dayData); setShowAddScheduleModal(true) }}><PlusOutlined className="h-3 w-3" /></Button>
                </div>
              )
            })
          })()}
        </div>
      </Card>

      <div className="h-8"></div>

      <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">即将到来的训练</h3>
        <div className="space-y-4">
          {[
            { name: "胸部训练", date: "今天 19:00-20:00", exercises: "5个动作", duration: "60分钟", status: "即将开始", details: ["卧推", "哑铃飞鸟", "俯卧撑", "双杠臂屈伸", "胸肌拉伸"] },
            { name: "腿部训练", date: "明天 18:30-19:30", exercises: "6个动作", duration: "60分钟", status: "已安排", details: ["深蹲", "硬拉", "腿举", "腿弯举", "小腿提踵", "臀桥"] },
            { name: "背部训练", date: "周四 19:00-20:00", exercises: "4个动作", duration: "60分钟", status: "已安排", details: ["引体向上", "硬拉", "划船", "高位下拉"] },
          ].map((workout, index) => (
            <div key={index} className={`p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 ${workout.status === '即将开始' ? 'border-yellow-400/30' : ''}`}>
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedWorkout(expandedWorkout === index ? null : index)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1"><p className={`font-semibold text-sm ${workout.status === '即将开始' ? 'text-white font-bold' : 'text-white'}`}>{workout.name}</p><p className="text-xs text-white/60">{workout.date}</p></div>
                    <div className="text-right ml-4"><div className={`text-xs ${workout.status === '即将开始' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30' : 'bg-blue-500/20 text-blue-400 border-blue-400/30'}`}><span>{workout.status}</span></div>{workout.status === '即将开始' && (<p className="text-xs text-white/60 mt-1">还有 2 小时开始</p>)}</div>
                  </div>
                </div>
                <div className={`ml-4 text-white/60 transition-transform duration-300 ${expandedWorkout === index ? 'transform rotate-180' : ''}`}><RightOutlined className="h-4 w-4" /></div>
              </div>
              {expandedWorkout === index && (<div className="mt-3 pt-3 border-t border-white/10"><p className="text-xs text-white/60 mb-2">训练动作：</p><div className="flex flex-wrap gap-2">{workout.details?.map((d, di) => (<span key={di} className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded-full">{d}</span>))}</div></div>)}
            </div>
          ))}
        </div>
      </Card>

      {showWorkoutDetailModal && selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">{selectedDay.day} 训练详情</h3>
              <Button className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20 rounded-lg px-4 py-2 transition-all duration-200" onClick={() => setShowWorkoutDetailModal(false)}>关闭</Button>
            </div>
            <div className="space-y-4">
              {selectedWorkouts.length > 0 ? selectedWorkouts.map((workout, index) => (
                <div key={index} className="bg-white/5 rounded-xl border border-white/10 p-4">
                  <div className="flex items-center justify-between mb-3"><h4 className="text-white font-semibold">{workout.name}</h4><div className="text-xs bg-blue-500/20 text-blue-400 border border-blue-400/30 px-2 py-0.5 rounded">已安排</div></div>
                  <p className="text-white/60 text-sm mb-3">{workout.time}</p>
                  <div className="flex justify-end space-x-2">
                    <Button size="small" className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20" onClick={async () => { try { const token = localStorage.getItem('token'); const response = await fetch(`/api/schedules/${workout.id}/complete`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } }); if (response.ok) { message.success('已标记为完成'); loadSchedules(); loadWorkouts(); } else { message.error('标记失败，请重试'); } } catch (error) { console.error('标记完成失败:', error); message.error('标记失败，请重试'); } }}>标记为已完成</Button>
                    <Button size="small" className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20" onClick={() => { setCurrentWorkout(workout); setShowEditScheduleModal(true) }}>编辑</Button>
                    <Button size="small" danger className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/30" onClick={() => message.success('训练已删除')}>删除</Button>
                  </div>
                </div>
              )) : (
                <div className="bg-white/5 rounded-xl border border-white/10 p-8 text-center">
                  <p className="text-white/60 text-sm mb-4">该日期暂无训练安排</p>
                  <Button className="bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 text-white transition-all duration-700 ease-out hover:scale-[1.02]" onClick={() => { setShowWorkoutDetailModal(false); setCurrentDay(selectedDay); setShowAddScheduleModal(true) }}><PlusOutlined className="mr-2 h-4 w-4" />添加训练计划</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddScheduleModal && currentDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-semibold text-white">添加 {currentDay.day} 的训练计划</h3><Button className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20 rounded-lg px-4 py-2 transition-all duration-200" onClick={() => setShowAddScheduleModal(false)}>关闭</Button></div>
            <div className="space-y-4">
              <div><label className="block text-white/80 text-sm mb-2">训练名称</label><input placeholder="输入训练名称" className="w-full bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200 px-3 py-2" /></div>
              <div><label className="block text-white/80 text-sm mb-2">训练时间</label><input placeholder="例如: 19:00-20:00" className="w-full bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200 px-3 py-2" /></div>
              <div><label className="block text-white/80 text-sm mb-2">训练动作</label><textarea placeholder="输入训练动作，多个动作请用逗号分隔" className="w-full bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200 px-3 py-2 resize-none" rows={3}></textarea></div>
              <div className="flex justify-end space-x-2 mt-6"><Button className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]" onClick={() => setShowAddScheduleModal(false)}>取消</Button><Button className="backdrop-blur-xl bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 hover:border-blue-500/70 text-white transition-all duration-700 ease-out hover:scale-[1.02]" onClick={() => { message.success('日程已添加'); setShowAddScheduleModal(false) }}>保存</Button></div>
            </div>
          </div>
        </div>
      )}

      {showEditScheduleModal && currentWorkout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-semibold text-white">编辑训练计划</h3><Button className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20 rounded-lg px-4 py-2 transition-all duration-200" onClick={() => setShowEditScheduleModal(false)}>关闭</Button></div>
            <div className="space-y-4">
              <div><label className="block text-white/80 text-sm mb-2">训练名称</label><input defaultValue={currentWorkout.name} className="w-full bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200 px-3 py-2" /></div>
              <div><label className="block text-white/80 text-sm mb-2">训练时间</label><input defaultValue={currentWorkout.time} className="w-full bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200 px-3 py-2" /></div>
              <div><label className="block text-white/80 text-sm mb-2">训练动作</label><textarea defaultValue={currentWorkout.details ? currentWorkout.details.join(', ') : ''} className="w-full bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200 px-3 py-2 resize-none" rows={3}></textarea></div>
              <div className="flex justify-end space-x-2 mt-6"><Button className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]" onClick={() => setShowEditScheduleModal(false)}>取消</Button><Button className="backdrop-blur-xl bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 hover:border-blue-500/70 text-white transition-all duration-700 ease-out hover:scale-[1.02]" onClick={() => { message.success('训练计划更新成功'); setShowEditScheduleModal(false) }}>保存</Button></div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
