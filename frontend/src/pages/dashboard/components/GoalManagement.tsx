import { FC } from 'react'
import React from 'react'
import { Button, Input } from 'antd'

interface Goal {
  id: number
  type: string
  target_value: number
  start_value: number
  current_value?: number
  start_date: string
}

interface GoalForm {
  type: string
  target_value: string
  start_value: string
  start_date: string
}

interface GoalManagementProps {
  goals: Goal[]
  dashboardData: any
  showGoalModal: boolean
  showGoalDeleteConfirmModal: boolean
  editingGoal: Goal | null
  deletingGoalId: number | null
  goalLoading: boolean
  goalForm: GoalForm
  setShowGoalModal: (show: boolean) => void
  setShowGoalDeleteConfirmModal: (show: boolean) => void
  setDeletingGoalId: (id: number | null) => void
  setGoalForm: React.Dispatch<React.SetStateAction<GoalForm>>
  saveGoal: () => Promise<void>
  deleteGoal: () => Promise<void>
  setEditingGoal: (goal: Goal | null) => void
  resetGoalForm: () => void
  openEditGoal: (goal: Goal) => void
  loadGoals: () => Promise<void>
}

export const GoalManagement: FC<GoalManagementProps> = ({
  goals,
  dashboardData,
  showGoalModal,
  showGoalDeleteConfirmModal,
  editingGoal,
  deletingGoalId,
  goalLoading,
  goalForm,
  setShowGoalModal,
  setShowGoalDeleteConfirmModal,
  setDeletingGoalId,
  setGoalForm,
  saveGoal,
  deleteGoal,
  setEditingGoal,
  resetGoalForm,
  openEditGoal,
  loadGoals,
}) => {
  if (!showGoalModal && !showGoalDeleteConfirmModal) return null

  const findGoal = (type: string) => goals.find(g => g.type === type)
  const weightGoal = findGoal('weight')
  const trainingGoal = findGoal('training')

  // 判断是否处于编辑模式
  const isEditingMode = editingGoal !== null

  // 处理编辑体重目标
  const handleEditWeight = () => {
    if (weightGoal) {
      openEditGoal(weightGoal)
    } else {
      setEditingGoal(null)
      setGoalForm({
        type: 'weight',
        target_value: '',
        start_value: '',
        start_date: new Date().toISOString().split('T')[0]
      })
    }
  }

  // 处理编辑训练目标
  const handleEditTraining = () => {
    if (trainingGoal) {
      openEditGoal(trainingGoal)
    } else {
      setEditingGoal(null)
      setGoalForm({
        type: 'training',
        target_value: '',
        start_value: '',
        start_date: new Date().toISOString().split('T')[0]
      })
    }
  }

  // 渲染目标信息卡片（查看模式）
  const renderGoalInfoCards = () => (
    <>
      <div className="space-y-3 p-4 bg-white/5 border border-white/10 rounded-xl">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-medium">体重目标</h4>
          <button
            className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
            onClick={handleEditWeight}
          >
            {weightGoal ? '编辑' : '添加'}
          </button>
        </div>
        {weightGoal ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">开始值</span>
              <span className="text-white">{weightGoal.start_value}kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">目标值</span>
              <span className="text-white">{weightGoal.target_value}kg</span>
            </div>
            {weightGoal.current_value != null && (
              <div className="flex justify-between text-sm">
                <span className="text-white/60">当前值</span>
                <span className="text-white">{weightGoal.current_value}kg</span>
              </div>
            )}
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, ((weightGoal.current_value || 0) / (weightGoal.target_value || 1)) * 100)}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <p className="text-white/40 text-sm text-center py-2">暂无体重目标</p>
        )}
      </div>

      <div className="space-y-3 p-4 bg-white/5 border border-white/10 rounded-xl">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-medium">训练目标</h4>
          <button
            className="text-green-400 hover:text-green-300 text-xs transition-colors"
            onClick={handleEditTraining}
          >
            {trainingGoal ? '编辑' : '添加'}
          </button>
        </div>
        {trainingGoal ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">开始值</span>
              <span className="text-white">{trainingGoal.start_value}次</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">目标值</span>
              <span className="text-white">{trainingGoal.target_value}次</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-400 to-cyan-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${dashboardData?.goals?.training?.completionRate || 0}%` }}
              ></div>
            </div>
            <div className="text-xs text-green-400">{dashboardData?.goals?.training?.completionRate || 0}% 完成</div>
          </div>
        ) : (
          <p className="text-white/40 text-sm text-center py-2">暂无训练目标</p>
        )}
      </div>
    </>
  )

  // 渲染编辑表单（编辑模式）
  const renderEditForm = () => (
    <div className="space-y-4 p-4 bg-white/10 border border-white/15 rounded-xl">
      <h4 className="text-white font-medium">
        {editingGoal ? '编辑' : '添加'}
        {goalForm.type === 'weight' ? '体重' : '训练'}目标
      </h4>

      {/* 目标类型切换按钮 */}
      <div className="flex gap-2 mb-4">
        <button
          className={`flex-1 py-2 rounded-lg text-sm transition-all ${
            goalForm.type === 'weight'
              ? 'bg-blue-500/30 text-white border border-blue-400/50'
              : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
          }`}
          onClick={handleEditWeight}
        >
          体重目标
        </button>
        <button
          className={`flex-1 py-2 rounded-lg text-sm transition-all ${
            goalForm.type === 'training'
              ? 'bg-green-500/30 text-white border border-green-400/50'
              : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
          }`}
          onClick={handleEditTraining}
        >
          训练目标
        </button>
      </div>

      {/* 开始值输入 */}
      <div>
        <label className="block text-white/80 text-sm mb-2">开始值</label>
        <Input
          type="number"
          step={goalForm.type === 'weight' ? '0.1' : '1'}
          min="0"
          value={goalForm.start_value}
          onChange={(e) => setGoalForm(prev => ({ ...prev, start_value: e.target.value }))}
          placeholder={goalForm.type === 'weight' ? '初始体重 (kg)' : '初始训练次数'}
          className="bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        />
      </div>

      {/* 目标值输入 */}
      <div>
        <label className="block text-white/80 text-sm mb-2">目标值</label>
        <Input
          type="number"
          step={goalForm.type === 'weight' ? '0.1' : '1'}
          min="0"
          value={goalForm.target_value}
          onChange={(e) => setGoalForm(prev => ({ ...prev, target_value: e.target.value }))}
          placeholder={goalForm.type === 'weight' ? '目标体重 (kg)' : '目标训练次数'}
          className="bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end space-x-2 pt-2">
        <Button
          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white"
          onClick={resetGoalForm}
        >
          重置
        </Button>
        <Button
          className="bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 text-white"
          onClick={saveGoal}
          loading={goalLoading}
        >
          保存
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* 目标设置模态框 */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            {/* 标题栏 */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">设置目标</h3>
              <Button
                className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20 rounded-lg px-4 py-2 transition-all duration-200"
                onClick={() => {
                  setShowGoalModal(false)
                  setEditingGoal(null)
                  resetGoalForm()
                }}
              >
                关闭
              </Button>
            </div>

            {/* 内容区：根据编辑模式切换显示 */}
            <div className="space-y-6">
              {isEditingMode ? renderEditForm() : renderGoalInfoCards()}
            </div>
          </div>
        </div>
      )}

      {/* 删除确认模态框 */}
      {showGoalDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-semibold text-white mb-4">确认删除</h3>
            <p className="text-white/80 mb-6">确定要删除这个目标吗？此操作不可恢复。</p>
            <div className="flex justify-end space-x-2">
              <Button
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                onClick={() => {
                  setShowGoalDeleteConfirmModal(false)
                  setDeletingGoalId(null)
                }}
              >
                取消
              </Button>
              <Button
                danger
                onClick={deleteGoal}
                loading={goalLoading}
              >
                确认删除
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
