import { useState, useCallback, useEffect } from 'react'
import { message } from 'antd'

interface Goal {
  id: number
  type: string
  target_value: number
  start_value: number
  current_value: number
  start_date: string
  created_at: string
}

interface GoalForm {
  type: string
  target_value: string
  start_value: string
  start_date: string
}

interface UseGoalManagementReturn {
  goals: Goal[]
  showGoalModal: boolean
  setShowGoalModal: (show: boolean) => void
  showGoalDeleteConfirmModal: boolean
  setShowGoalDeleteConfirmModal: (show: boolean) => void
  editingGoal: Goal | null
  setEditingGoal: (goal: Goal | null) => void
  deletingGoalId: number | null
  setDeletingGoalId: (id: number | null) => void
  goalLoading: boolean
  goalForm: GoalForm
  setGoalForm: (form: GoalForm | ((prev: GoalForm) => GoalForm)) => void
  loadGoals: (forceRefresh?: boolean) => Promise<void>
  saveGoal: () => Promise<void>
  deleteGoal: () => Promise<void>
  openEditGoal: (goal: Goal) => void
  openAddGoal: (type: string) => void
  resetGoalForm: () => void
}

export function useGoalManagement(
  loadDashboardData?: (forceRefresh?: boolean) => Promise<void>
): UseGoalManagementReturn {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [showGoalDeleteConfirmModal, setShowGoalDeleteConfirmModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [deletingGoalId, setDeletingGoalId] = useState<number | null>(null)
  const [goalLoading, setGoalLoading] = useState(false)
  const [goalForm, setGoalForm] = useState<GoalForm>({
    type: 'weight',
    target_value: '',
    start_value: '',
    start_date: new Date().toISOString().split('T')[0]
  })

  const loadGoals = useCallback(async (forceRefresh = false) => {
    setGoalLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/goals', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setGoals(data.goals)
      }
    } catch (error) {
      console.error('加载目标失败:', error)
    } finally {
      setGoalLoading(false)
    }
  }, [])

  // 初始化时加载目标数据
  useEffect(() => {
    loadGoals()
  }, [loadGoals])

  const saveGoal = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const url = editingGoal ? `/api/goals/${editingGoal.id}` : '/api/goals'
      const method = editingGoal ? 'PUT' : 'POST'
      
      const payload = editingGoal 
        ? {
            target_value: parseFloat(goalForm.target_value),
            start_value: parseFloat(goalForm.start_value),
            start_date: goalForm.start_date
          }
        : {
            type: goalForm.type,
            target_value: parseFloat(goalForm.target_value),
            start_value: parseFloat(goalForm.start_value),
            start_date: goalForm.start_date
          }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        await Promise.all([
          loadGoals(true),
          loadDashboardData?.(true)
        ])
        setShowGoalModal(false)
        setEditingGoal(null)
        setGoalForm({
          type: 'weight',
          target_value: '',
          start_value: '',
          start_date: new Date().toISOString().split('T')[0]
        })
        message.success(editingGoal ? '目标更新成功' : '目标创建成功')
      } else {
        const errorData = await response.json()
        message.error(editingGoal ? '目标更新失败: ' + (errorData.error || '未知错误') : '目标创建失败: ' + (errorData.error || '未知错误'))
      }
    } catch (error) {
      console.error('保存目标失败:', error)
      message.error(editingGoal ? '目标更新失败' : '目标创建失败')
    }
  }, [editingGoal, goalForm, loadGoals, loadDashboardData])

  const deleteGoal = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/goals/${deletingGoalId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        await Promise.all([
          loadGoals(true),
          loadDashboardData?.(true)
        ])
        setShowGoalDeleteConfirmModal(false)
        setDeletingGoalId(null)
        message.success('目标删除成功')
      } else {
        const errorData = await response.json()
        message.error('目标删除失败: ' + (errorData.error || '未知错误'))
      }
    } catch (error) {
      console.error('删除目标失败:', error)
      message.error('目标删除失败: ' + error.message)
    }
  }, [deletingGoalId, loadGoals, loadDashboardData])

  const openEditGoal = useCallback((goal: Goal) => {
    setEditingGoal(goal)
    setGoalForm({
      type: goal.type,
      target_value: goal.target_value.toString(),
      start_value: goal.start_value.toString(),
      start_date: goal.start_date
    })
  }, [])

  const openAddGoal = useCallback((type: string) => {
    setEditingGoal(null)
    setGoalForm({
      type,
      target_value: '',
      start_value: '',
      start_date: new Date().toISOString().split('T')[0]
    })
  }, [])

  const resetGoalForm = useCallback(() => {
    setEditingGoal(null)
    setGoalForm({
      type: 'weight',
      target_value: '',
      start_value: '',
      start_date: new Date().toISOString().split('T')[0]
    })
  }, [])

  return {
    goals,
    showGoalModal,
    setShowGoalModal,
    showGoalDeleteConfirmModal,
    setShowGoalDeleteConfirmModal,
    editingGoal,
    setEditingGoal,
    deletingGoalId,
    setDeletingGoalId,
    goalLoading,
    goalForm,
    setGoalForm,
    loadGoals,
    saveGoal,
    deleteGoal,
    openEditGoal,
    openAddGoal,
    resetGoalForm
  }
}
