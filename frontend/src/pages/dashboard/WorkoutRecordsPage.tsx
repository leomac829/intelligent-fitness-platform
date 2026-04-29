import { FC } from "react"
import { Card, Button, DatePicker, Input, Select, message } from "antd"
import { PlusOutlined, DownloadOutlined } from "@ant-design/icons"
import dayjs from "dayjs"
const { Option } = Select
const { TextArea } = Input

interface WorkoutExercise {
  exerciseName: string
  sets: number
  reps: number
  weight: number
  restTime: number
}

interface Workout {
  id: number
  date: string
  duration: string
  calories: string
  notes?: string
  exercises: WorkoutExercise[]
}

interface WorkoutRecordsPageProps {
  workouts: Workout[]
  loading: boolean
  workoutForm: { date: string; duration: string; calories: string; notes: string; exercises: WorkoutExercise[] }
  showAddWorkoutModal: boolean
  showEditWorkoutModal: boolean
  editingWorkout: Workout | null
  setShowAddWorkoutModal: (show: boolean) => void
  setShowEditWorkoutModal: (show: boolean) => void
  setWorkoutForm: (form: any) => void
  handleDurationChange: (val: string) => void
  handleExerciseChange: (index: number, field: string, value: any) => void
  addExercise: () => void
  removeExercise: (index: number) => void
  saveWorkout: () => void
  editWorkout: (workout: Workout) => void
  viewWorkout: (workout: Workout) => void
  exportWorkouts: () => void
}

export const WorkoutRecordsPage: FC<WorkoutRecordsPageProps> = ({
  workouts,
  loading,
  showAddWorkoutModal,
  showEditWorkoutModal,
  editingWorkout,
  setShowAddWorkoutModal,
  setShowEditWorkoutModal,
  setWorkoutForm,
  handleDurationChange,
  handleExerciseChange,
  addExercise,
  removeExercise,
  saveWorkout,
  editWorkout,
  viewWorkout,
  exportWorkouts,
}) => {
  const workoutForm = (editingWorkout as any)?.form || { date: new Date().toISOString().split("T")[0], duration: "", calories: "", notes: "", exercises: [{ exerciseName: "", sets: 1, reps: 10, weight: 0, restTime: 60 }] }

  const renderExerciseForm = (exercises: WorkoutExercise[], isEdit: boolean = false) => (
    <div>
      <label className="block text-white/80 text-sm mb-2">训练动作</label>
      {exercises.map((exercise, index) => (
        <div key={index} className="bg-white/5 border border-white/20 rounded-xl p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium">动作 {index + 1}</h4>
            {index > 0 && <Button danger variant="outlined" className="delete-button" onClick={() => removeExercise(index)}>删除</Button>}
          </div>
          <div className="grid grid-cols-5 gap-4">
            <div>
              <label className="block text-white/80 text-xs mb-1">动作名称</label>
              <Select value={exercise.exerciseName} onChange={(value) => handleExerciseChange(index, "exerciseName", value)} placeholder="选择动作" className="w-full" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.2)", color: "white" }}>
                <Option value="">请选择动作</Option>
                <Option value="卧推">卧推</Option>
                <Option value="哑铃飞鸟">哑铃飞鸟</Option>
                <Option value="俯卧撑">俯卧撑</Option>
                <Option value="双杠臂屈伸">双杠臂屈伸</Option>
                <Option value="深蹲">深蹲</Option>
                <Option value="硬拉">硬拉</Option>
                <Option value="引体向上">引体向上</Option>
                <Option value="划船">划船</Option>
                <Option value="腿举">腿举</Option>
                <Option value="腿弯举">腿弯举</Option>
                <Option value="臀桥">臀桥</Option>
              </Select>
            </div>
            <div><label className="block text-white/80 text-xs mb-1">组数</label><Input type="number" value={exercise.sets} onChange={(e) => handleExerciseChange(index, "sets", parseInt(e.target.value))} style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.2)", color: "white" }} /></div>
            <div><label className="block text-white/80 text-xs mb-1">次数</label><Input type="number" value={exercise.reps} onChange={(e) => handleExerciseChange(index, "reps", parseInt(e.target.value))} style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.2)", color: "white" }} /></div>
            <div><label className="block text-white/80 text-xs mb-1">重量 (kg)</label><Input type="number" value={exercise.weight} onChange={(e) => handleExerciseChange(index, "weight", parseFloat(e.target.value))} style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.2)", color: "white" }} /></div>
            <div><label className="block text-white/80 text-xs mb-1">休息 (秒)</label><Input type="number" value={exercise.restTime} onChange={(e) => handleExerciseChange(index, "restTime", parseInt(e.target.value))} style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.2)", color: "white" }} /></div>
          </div>
        </div>
      ))}
      <Button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]" onClick={addExercise}><PlusOutlined className="mr-2 h-4 w-4" />添加动作</Button>
    </div>
  )

  return (
    <>
      <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">训练记录 📝</h3>
          <div className="flex space-x-2">
            <Button className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]" onClick={() => setShowAddWorkoutModal(true)}><PlusOutlined className="mr-2 h-4 w-4" />添加训练</Button>
            <Button className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]" onClick={exportWorkouts}><DownloadOutlined className="mr-2 h-4 w-4" />导出记录</Button>
          </div>
        </div>
        {loading ? (<div className="flex justify-center items-center py-10"><p className="text-white/80">加载中...</p></div>) : workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10"><p className="text-white/80 mb-4">还没有训练记录</p><Button className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]" onClick={() => setShowAddWorkoutModal(true)}><PlusOutlined className="mr-2 h-4 w-4" />添加第一条训练记录</Button></div>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <div key={workout.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer" onClick={() => viewWorkout(workout)}>
                <div className="flex items-center justify-between mb-3">
                  <div><p className="font-semibold text-white text-lg">{workout.exercises?.[0]?.exerciseName || "训练"}</p><p className="text-xs text-white/60">{new Date(workout.date).toLocaleDateString()} • {workout.duration}分钟</p></div>
                  <div className="text-right">
                    <p className="font-bold text-white text-sm">{workout.calories}千卡 <span className="text-xs text-white/40">(仅供参考)</span></p>
                    <div className="flex space-x-2 mt-2">
                      <Button size="small" className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20" onClick={(e) => { e.stopPropagation(); editWorkout(workout) }}>编辑</Button>
                      <Button size="small" danger variant="outlined" className="delete-button" onClick={(e) => { e.stopPropagation() }}>删除</Button>
                    </div>
                  </div>
                </div>
                {workout.exercises && workout.exercises.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-white/80">训练动作:</p>
                    {workout.exercises.map((exercise, ei) => (
                      <div key={ei} className="flex items-center space-x-4 p-2 bg-white/5 rounded-lg">
                        <div className="flex-1"><p className="text-sm text-white">{exercise.exerciseName}</p></div>
                        <div className="text-center"><p className="text-sm text-white/80">组数</p><p className="text-sm text-white">{exercise.sets}</p></div>
                        <div className="text-center"><p className="text-sm text-white/80">次数</p><p className="text-sm text-white">{exercise.reps}</p></div>
                        <div className="text-center"><p className="text-sm text-white/80">重量</p><p className="text-sm text-white">{exercise.weight}kg</p></div>
                        <div className="text-center"><p className="text-sm text-white/80">休息</p><p className="text-sm text-white">{exercise.restTime}s</p></div>
                      </div>
                    ))}
                  </div>
                )}
                {workout.notes && (<div className="mt-3 p-2 bg-white/5 rounded-lg"><p className="text-sm text-white/80">备注:</p><p className="text-sm text-white">{workout.notes}</p></div>)}
              </div>
            ))}
          </div>
        )}
      </Card>

      {showAddWorkoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-semibold text-white">添加训练记录</h3><Button className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20 rounded-lg px-4 py-2 transition-all duration-200" onClick={() => setShowAddWorkoutModal(false)}>关闭</Button></div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-white/80 text-sm mb-2">日期</label><DatePicker value={dayjs()} onChange={(date) => {}} className="w-full" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.2)", color: "white" }} format="YYYY-MM-DD" /></div>
                <div><label className="block text-white/80 text-sm mb-2">训练时长 (分钟)</label><Input type="number" value="" onChange={(e) => handleDurationChange(e.target.value)} placeholder="输入训练时长" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.2)", color: "white" }} /></div>
              </div>
              <div><label className="block text-white/80 text-sm mb-2">备注</label><TextArea value="" onChange={() => {}} placeholder="添加备注信息" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.2)", color: "white" }} /></div>
              {renderExerciseForm([{ exerciseName: "", sets: 1, reps: 10, weight: 0, restTime: 60 }])}
            </div>
            <div className="flex justify-end space-x-2 mt-6"><Button className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]" onClick={() => setShowAddWorkoutModal(false)}>取消</Button><Button className="backdrop-blur-xl bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 hover:border-blue-500/70 text-white transition-all duration-700 ease-out hover:scale-[1.02]" onClick={saveWorkout}>保存</Button></div>
          </div>
        </div>
      )}

      {showEditWorkoutModal && editingWorkout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-semibold text-white">编辑训练记录</h3><Button className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20 rounded-lg px-4 py-2 transition-all duration-200" onClick={() => { setShowEditWorkoutModal(false) }}>关闭</Button></div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-white/80 text-sm mb-2">日期</label><DatePicker value={dayjs(editingWorkout.date)} onChange={() => {}} className="w-full" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.2)", color: "white" }} format="YYYY-MM-DD" /></div>
                <div><label className="block text-white/80 text-sm mb-2">训练时长 (分钟)</label><Input type="number" value={editingWorkout.duration} onChange={(e) => handleDurationChange(e.target.value)} style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.2)", color: "white" }} /></div>
              </div>
              <div><label className="block text-white/80 text-sm mb-2">备注</label><TextArea value={editingWorkout.notes || ""} onChange={() => {}} style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.2)", color: "white" }} /></div>
              {renderExerciseForm(editingWorkout.exercises || [], true)}
            </div>
            <div className="flex justify-end space-x-2 mt-6"><Button className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]" onClick={() => setShowEditWorkoutModal(false)}>取消</Button><Button className="backdrop-blur-xl bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 hover:border-blue-500/70 text-white transition-all duration-700 ease-out hover:scale-[1.02]" onClick={saveWorkout}>保存</Button></div>
          </div>
        </div>
      )}
    </>
  )
}
