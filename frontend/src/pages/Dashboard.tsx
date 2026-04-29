﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿

import { useState, useEffect, useCallback, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card } from "antd"
import { Button, Input, Badge, message, Select, DatePicker, Spin } from "antd"
const { Option } = Select
import { useNavigate } from "react-router-dom"
import dayjs from "dayjs"
import * as echarts from "echarts"
import { logoutUser, getUserProfile } from "../store/userSlice.ts"
import { useDataCache, CACHE_KEYS } from "../hooks/useDataCache"
import { useGoalManagement } from "../hooks/useGoalManagement"
import { GoalManagement } from "./dashboard/components/GoalManagement"
import FatLossPlan from "./FatLossPlan"
import TrainingExercises from "./TrainingExercises"
import TanChengyiThreeSplit from "./TanChengyiThreeSplit"
import {
  UserOutlined,
  LineChartOutlined,
  SearchOutlined,
  SettingOutlined,
  PlusOutlined,
  FilterOutlined,
  DownloadOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  MessageOutlined,
  DatabaseOutlined,
  LogoutOutlined,
  RightOutlined,
  FireOutlined,
  SendOutlined,
  AppstoreOutlined,
  CheckOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons"
import { Modal, Checkbox } from "antd"

export function Dashboard() {
  const { getCached, setCache, invalidate } = useDataCache()
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [activeMenu, setActiveMenu] = useState('dashboard') // dashboard, analysis, plans, schedule, goals
  const [activeSubMenu, setActiveSubMenu] = useState('') // training-records, video-library, community, fitness-plan, body-data, profile, notification, quick-action
  // 训练日记相关状态
  const [diaries, setDiaries] = useState<any[]>([])
  const [showDiaryModal, setShowDiaryModal] = useState(false)
  const [showDiaryDetailModal, setShowDiaryDetailModal] = useState(false)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [diaryForm, setDiaryForm] = useState({
    content: '',
    tags: '',
    date: ''
  })
  const [editingDiary, setEditingDiary] = useState<any>(null)
  const [selectedDiary, setSelectedDiary] = useState<any>(null)
  const [deletingDiaryId, setDeletingDiaryId] = useState<number | null>(null)
  const [diaryLoading, setDiaryLoading] = useState(false)

  // 训练记录删除确认模态框状态
  const [showWorkoutDeleteConfirmModal, setShowWorkoutDeleteConfirmModal] = useState(false)
  const [deletingWorkoutId, setDeletingWorkoutId] = useState<number | null>(null)

  // 日程安排状态
  const [calendarSchedules, setCalendarSchedules] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedParts, setSelectedParts] = useState<string[]>([])
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null)

  // 获取星期几的辅助函数
  const getDayOfWeek = (dateString: string) => {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const date = new Date(dateString)
    return days[date.getDay()]
  }

  // 当切换到训练日记模块时加载数据
  useEffect(() => {
    if (activeSubMenu === 'community') {
      loadDiaries();
    }
  }, [activeSubMenu]);

  // 加载视频库数据（从后台API动态获取）
  useEffect(() => {
    loadVideoLibrary();
    loadTrainingExercises();
  }, []);
  
  const loadTrainingExercises = async () => {
    setTrainingExercisesLoading(true);
    try {
      const response = await fetch('http://localhost:3002/api/training-exercises/data');
      const data = await response.json();
      console.log('Dashboard - 从API加载的训练动作:', data.exercises?.length || 0, '个');
      setTrainingExercises(data.exercises || []);
    } catch (error) {
      console.error('加载训练动作失败:', error);
    } finally {
      setTrainingExercisesLoading(false);
    }
  }

  const loadVideoLibrary = async () => {
    setExercisesLoading(true);
    try {
      const response = await fetch(`http://localhost:3002/api/video-library?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json()
      console.log('Dashboard - 从API加载的视频列表:', data.data?.length || 0, '个')
      setExercises(data.data || [])
    } catch (error) {
      console.error('加载视频列表失败:', error)
    } finally {
      setExercisesLoading(false)
    }
  }

  // 加载某个视频条目的视频列表
  const loadExerciseVideos = async (exerciseId: string) => {
    try {
      const response = await fetch(`http://localhost:3002/api/video-library/${exerciseId}/videos`)
      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('加载视频列表失败:', error)
      return []
    }
  }

  // 加载训练日记
  const loadDiaries = async () => {
    setDiaryLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/diaries', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDiaries(data.diaries)
      } else {
        console.error('加载训练日记失败')
      }
    } catch (error) {
      console.error('加载训练日记失败:', error)
    } finally {
      setDiaryLoading(false)
    }
  }

  // 保存训练日记
  const saveDiary = async () => {
    try {
      const token = localStorage.getItem('token')
      const url = editingDiary ? `/api/diaries/${editingDiary.id}` : '/api/diaries'
      const method = editingDiary ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...diaryForm,
          status: 'valid' // 标记为有效训练
        })
      })
      
      if (response.ok) {
        // 重新加载所有相关数据，确保三大模块数据一致
        await Promise.all([
          loadDiaries(),
          loadDashboardData(),
          loadGoals()
        ]);
        setShowDiaryModal(false)
        setDiaryForm({
          content: '',
          tags: '',
          date: ''
        })
        setEditingDiary(null)
        message.success(editingDiary ? '日记更新成功' : '日记创建成功')
      } else {
        console.error('保存训练日记失败')
        message.error(editingDiary ? '日记更新失败' : '日记创建失败')
      }
    } catch (error) {
      console.error('保存训练日记失败:', error)
      message.error(editingDiary ? '日记更新失败' : '日记创建失败')
    }
  }

  // 删除训练日记
  const deleteDiary = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/diaries/${deletingDiaryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        // 重新加载所有相关数据，确保三大模块数据一致
        await Promise.all([
          loadDiaries(),
          loadDashboardData(),
          loadGoals()
        ]);
        setShowDeleteConfirmModal(false)
        setDeletingDiaryId(null)
        message.success('日记删除成功')
      } else {
        console.error('删除训练日记失败')
        message.error('日记删除失败')
      }
    } catch (error) {
      console.error('删除训练日记失败:', error)
      message.error('日记删除失败')
    }
  }

  // 从后端加载聊天记录
  const [messages, setMessages] = useState(() => [
    {
      id: 1,
      role: 'assistant',
      content: '你好！我是你的AI健身助手，有什么可以帮助你的吗？',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  // 进度状态
  const [aiProgress, setAiProgress] = useState(0);
  const [aiStatus, setAiStatus] = useState('');
  
  // 个人设置表单状态
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    name: '',
    gender: '',
    age: '',
    height: '',
    weight: '',
    fitness_level: ''
  });
  
  // 训练记录状态
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);
  const [showEditWorkoutModal, setShowEditWorkoutModal] = useState(false);
  const [showViewWorkoutModal, setShowViewWorkoutModal] = useState(false);
  const [currentWorkoutRecord, setCurrentWorkoutRecord] = useState<any>(null);
  const [editingWorkout, setEditingWorkout] = useState<any>(null);
  
  // 首页快捷记录弹窗状态
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightForm, setWeightForm] = useState({ date: new Date().toISOString().split('T')[0], weight: '' });
  const [showBodyFatModal, setShowBodyFatModal] = useState(false);
  const [bodyFatForm, setBodyFatForm] = useState({ date: new Date().toISOString().split('T')[0], bodyFat: '' });
  const [showCircumferenceModal, setShowCircumferenceModal] = useState(false);
  const [circumferenceForm, setCircumferenceForm] = useState({ date: new Date().toISOString().split('T')[0], chest: '', waist: '', hips: '', biceps: '' });
  const [showBmiModal, setShowBmiModal] = useState(false);
  const [bmiForm, setBmiForm] = useState({ date: new Date().toISOString().split('T')[0], weight: '' });
  
  // 身体数据状态
  const [bodyMeasurements, setBodyMeasurements] = useState<any[]>([]);
  const [showAddBodyDataModal, setShowAddBodyDataModal] = useState(false);
  const [bodyDataForm, setBodyDataForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    bodyFat: '',
    muscleMass: '',
    waist: '',
    chest: '',
    hips: '',
    biceps: '',
    thighs: '',
    notes: ''
  });
  
  // 控制高级围度的展开/收起状态
  const [showAdvancedMeasurements, setShowAdvancedMeasurements] = useState(false);
  // 控制腰围图表的显示状态
  const [showWaistChart, setShowWaistChart] = useState(true);
  
  // 训练详情模态框状态
  const [showWorkoutDetailModal, setShowWorkoutDetailModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  
  // 展开/折叠状态
  const [expandedWorkout, setExpandedWorkout] = useState(null);
  
  // 图表引用
  const weightChartRef = useRef(null);
  const bodyFatChartRef = useRef(null);
  const muscleMassChartRef = useRef(null);
  const bmiChartRef = useRef(null);
  const waistChartRef = useRef(null);
  
  // 首页迷你图表引用
  const miniWeightChartRef = useRef(null);
  const miniBodyFatChartRef = useRef(null);
  const miniMuscleChartRef = useRef(null);
  const miniBmiChartRef = useRef(null);
  
  // 图表实例
  const [weightChart, setWeightChart] = useState(null);
  const [bodyFatChart, setBodyFatChart] = useState(null);
  const [muscleMassChart, setMuscleMassChart] = useState(null);
  const [bmiChart, setBmiChart] = useState(null);
  const [waistChart, setWaistChart] = useState(null);
  
  // 首页迷你图表实例
  const [miniWeightChart, setMiniWeightChart] = useState(null);
  const [miniBodyFatChart, setMiniBodyFatChart] = useState(null);
  const [miniMuscleChart, setMiniMuscleChart] = useState(null);
  const [miniBmiChart, setMiniBmiChart] = useState(null);
  
  // 视频播放器状态
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  // 文件夹打开状态
  const [openFolder, setOpenFolder] = useState(null);

  // 视频库数据（从API动态获取）
  const [exercises, setExercises] = useState([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  
  // 训练动作数据（从API动态获取）
  const [trainingExercises, setTrainingExercises] = useState([]);
  const [trainingExercisesLoading, setTrainingExercisesLoading] = useState(false);

  const [bodyDataStats, setBodyDataStats] = useState({
    latest: null,
    history: [],
    bmi: 0
  });

  // 数据分析模块状态
  const [analysisTimeFilter, setAnalysisTimeFilter] = useState('this_month');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState({
    training: {
      totalSessions: 0,
      totalDuration: 0,
      avgDuration: 0,
      lastMonthSessions: 0,
      lastMonthDuration: 0,
      sessionsChange: 0,
      durationChange: 0,
      showComparison: false // 是否展示环比
    },
    body: {
      currentWeight: 0,
      currentBodyFat: 0,
      currentMuscleMass: 0,
      lastMonthWeight: 0,
      lastMonthBodyFat: 0,
      lastMonthMuscleMass: 0,
      weightChange: 0,
      bodyFatChange: 0,
      muscleMassChange: 0,
      hasComparison: false // 是否有上月对比
    },
    calories: {
      totalBurned: 0,
      dailyAvg: 0,
      targetCalories: 0,
      completionRate: 0,
      lastMonthBurned: 0,
      burnedChange: 0,
      showComparison: false // 是否展示环比
    },
    achievement: {
      goalCompletionRate: 0,
      streakDays: 0,
      checkInRate: 0
    },
    weeklyFrequency: [0, 0, 0, 0, 0, 0, 0],
    bodyTrend: [],
    caloriesTrend: [],
    trainingTypeDistribution: {
      strength: 0,
      cardio: 0,
      flexibility: 0,
      hasData: false, // 是否有数据
      counts: { strength: 0, cardio: 0, flexibility: 0 } // 原始计数
    },
    smartSuggestions: [], // 智能建议
    hasValidData: false // 是否有有效训练数据
  });

  // 仪表盘数据状态
  const [dashboardData, setDashboardData] = useState({
    totalSessions: 0,
    completedPlans: 0,
    totalCalories: 0,
    streakDays: 0,
    lastMonthSessions: 0,
    lastMonthPlans: 0,
    lastMonthCalories: 0,
    lastMonthStreak: 0,
    recentWorkouts: [],
    goals: {
      training: { current: 0, target: 0, completionRate: 0 },
      calories: { current: 0, target: 0, completionRate: 0 }
    },
    trainingTypeDistribution: {
      strength: 0,
      cardio: 0,
      flexibility: 0
    },
    remainingSessions: 0,
    todayWorkout: null
  });

  // 日历显示状态 - 支持自由跳转查阅
  const [calendarView, setCalendarView] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() // 0-11
  });

  const BODY_PARTS = [
    { key: 'chest', label: '胸', color: 'bg-red-500/30 text-white border-red-400/30' },
    { key: 'back', label: '背', color: 'bg-blue-500/30 text-white border-blue-400/30' },
    { key: 'shoulders', label: '肩', color: 'bg-yellow-500/30 text-white border-yellow-400/30' },
    { key: 'arms', label: '手臂', color: 'bg-green-500/30 text-white border-green-400/30' },
    { key: 'abs', label: '腹肌', color: 'bg-purple-500/30 text-white border-purple-400/30' },
    { key: 'glutes', label: '臀', color: 'bg-pink-500/30 text-white border-pink-400/30' },
    { key: 'legs', label: '腿', color: 'bg-cyan-500/30 text-white border-cyan-400/30' },
  ]

  const loadCalendarSchedules = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3002/api/schedules?year=${calendarView.year}&month=${calendarView.month}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setCalendarSchedules(data.data || [])
    } catch (e) { console.error('加载日程失败', e) }
  }, [calendarView.year, calendarView.month])

  useEffect(() => { loadCalendarSchedules() }, [loadCalendarSchedules])

  const openScheduleModal = (date: string) => {
    setSelectedDate(date)
    const existing = calendarSchedules.find(s => s.date === date)
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
        loadCalendarSchedules()
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
        loadCalendarSchedules()
      } else {
        message.error(data.error || '删除失败')
      }
    } catch (e) {
      console.error('删除日程失败', e)
      message.error('删除失败')
    }
  }

  // 预设常用训练动作
  const commonExercises = {
    胸部: [
      '卧推', '哑铃飞鸟', '俯卧撑', '双杠臂屈伸', '胸肌拉伸'
    ],
    肩部: [
      '哑铃肩推', '侧平举', '前平举', '俯身飞鸟', '肩绕环'
    ],
    背部: [
      '引体向上', '硬拉', '划船', '高位下拉', '背部拉伸'
    ],
    腿部: [
      '深蹲', '硬拉', '腿举', '腿弯举', '小腿提踵'
    ],
    臀部: [
      '臀桥', '深蹲', '硬拉', '髋外展', '臀大肌拉伸'
    ]
  };
  
  // 训练记录表单
  const [workoutForm, setWorkoutForm] = useState({
    date: new Date().toISOString().split('T')[0],
    duration: '',
    calories: '',
    notes: '',
    exercises: [{
      exerciseName: '',
      sets: 1,
      reps: 10,
      weight: 0
    }]
  });
  
  // 加载聊天记录
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch('/api/chat/messages', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages.map((msg: any) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.timestamp).toLocaleTimeString()
            })));
          }
        }
      } catch (error) {
        console.error('加载聊天消息失败:', error);
      }
    };
    
    loadMessages();
  }, [])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state: any) => state.user)

  // 加载用户资料
  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch])
  
  // 当user对象变化时，更新表单状态
  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        email: user.email || '',
        name: user.name || '',
        gender: user.gender || '',
        age: user.age || '',
        height: user.height || '',
        weight: user.weight || '',
        fitness_level: user.fitness_level || ''
      });
    }
  }, [user])
  
  // 加载训练记录（带缓存）
  const loadWorkouts = async (forceRefresh = false) => {
    // 检查缓存
    if (!forceRefresh) {
      const cached = getCached(CACHE_KEYS.WORKOUTS)
      if (cached) {
        setWorkouts(cached)
        return
      }
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/workouts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data.workouts);
        // 写入缓存
        setCache(CACHE_KEYS.WORKOUTS, data.workouts)
      } else {
        // 如果API调用失败，尝试从缓存加载
        const cached = getCached(CACHE_KEYS.WORKOUTS)
        if (cached) {
          setWorkouts(cached)
        } else {
          const existingWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]');
          setWorkouts(existingWorkouts);
        }
      }
    } catch (error) {
      // 如果发生错误，从本地存储加载
      try {
        const existingWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]');
        setWorkouts(existingWorkouts);
      } catch (localError) {
        console.error('加载训练记录失败:', error);
        message.error('加载训练记录失败');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // 当切换到训练记录页面时，加载训练记录
  useEffect(() => {
    if (activeSubMenu === 'training-records') {
      loadWorkouts();
    }
  }, [activeSubMenu])
  
  // 计算热量消耗（基于动作、组数、次数、重量和体重）
  const calculateCalories = (exercises, weight = 70) => {
    if (!exercises || exercises.length === 0) return 0;
    
    // 基础代谢率（简化计算）
    const bmr = weight * 24;
    
    // 每个动作的热量消耗系数（根据动作类型和强度）
    const exerciseIntensity = {
      '卧推': 0.05,
      '哑铃飞鸟': 0.04,
      '俯卧撑': 0.06,
      '双杠臂屈伸': 0.07,
      '胸肌拉伸': 0.02,
      '哑铃肩推': 0.06,
      '侧平举': 0.04,
      '前平举': 0.04,
      '俯身飞鸟': 0.05,
      '肩绕环': 0.02,
      '引体向上': 0.08,
      '硬拉': 0.10,
      '划船': 0.06,
      '高位下拉': 0.06,
      '背部拉伸': 0.02,
      '深蹲': 0.08,
      '腿举': 0.07,
      '腿弯举': 0.05,
      '小腿提踵': 0.03,
      '臀桥': 0.06,
      '髋外展': 0.04,
      '臀大肌拉伸': 0.02
    };
    
    let totalCalories = 0;
    
    exercises.forEach(exercise => {
      if (exercise.exerciseName && exercise.sets > 0 && exercise.reps > 0) {
        // 获取动作的强度系数，默认为0.04
        const intensity = exerciseIntensity[exercise.exerciseName] || 0.04;
        
        // 计算单个动作的热量消耗
        // 公式：体重(kg) * 组数 * 次数 * 强度系数 * (1 + 重量影响因子)
        const weightFactor = exercise.weight > 0 ? (1 + exercise.weight / 100) : 1;
        const exerciseCalories = weight * exercise.sets * exercise.reps * intensity * weightFactor;
        totalCalories += exerciseCalories;
      }
    });
    
    return Math.round(totalCalories);
  };
  
  // 处理训练时长变化
  const handleDurationChange = (value) => {
    setWorkoutForm(prev => ({
      ...prev,
      duration: value
    }));
  };
  
  // 处理训练动作变化，自动计算热量
  const handleExerciseChange = (index, field, value) => {
    setWorkoutForm(prev => {
      const newExercises = [...prev.exercises];
      newExercises[index] = {
        ...newExercises[index],
        [field]: value
      };
      
      // 计算总热量
      const totalCalories = calculateCalories(newExercises, user?.weight || 70);
      
      return {
        ...prev,
        exercises: newExercises,
        calories: totalCalories.toString()
      };
    });
  };
  
  // 添加训练动作
  const addExercise = () => {
    setWorkoutForm(prev => ({
      ...prev,
      exercises: [...prev.exercises, {
        exerciseName: '',
        sets: 1,
        reps: 10,
        weight: 0
      }]
    }));
  };
  
  // 删除训练动作
  const removeExercise = (index) => {
    setWorkoutForm(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };
  
  // 保存训练记录
  const saveWorkout = async () => {
    // 表单验证
    if (!workoutForm.duration) {
      message.error('请填写训练时长');
      return;
    }
    
    // 检查是否有至少一个训练动作
    if (!workoutForm.exercises || workoutForm.exercises.length === 0) {
      message.error('请添加至少一个训练动作');
      return;
    }
    
    // 检查每个训练动作是否填写了名称
    for (let i = 0; i < workoutForm.exercises.length; i++) {
      if (!workoutForm.exercises[i].exerciseName) {
        message.error(`请填写第${i + 1}个训练动作的名称`);
        return;
      }
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(workoutForm)
      });
      
      if (response.ok) {
        message.success('训练记录保存成功');
        setShowAddWorkoutModal(false);
        // 重置表单
        setWorkoutForm({
          date: new Date().toISOString().split('T')[0],
          duration: '',
          calories: '',
          notes: '',
          exercises: [{
            exerciseName: '',
            sets: 1,
            reps: 10,
            weight: 0
          }]
        });
        // 清除相关缓存并重新加载
        invalidate(CACHE_KEYS.WORKOUTS)
        invalidate(CACHE_KEYS.DASHBOARD)
        await Promise.all([loadWorkouts(true), loadDashboardData(true)]);
      } else {
        // 尝试获取错误信息
        try {
          const errorData = await response.json();
          message.error(`保存失败: ${errorData.error || '未知错误'}`);
        } catch {
          message.error('保存失败，请重试');
        }
        
        // 不要自动使用本地存储作为备份，因为可能是表单数据有问题
      }
    } catch (error) {
      console.error('保存训练记录失败:', error);
      message.error('保存失败，请重试');
    }
  };
  
  // 编辑训练记录
  const editWorkout = (workout) => {
    setEditingWorkout(workout);
    setWorkoutForm({
      date: workout.date.split('T')[0],
      duration: workout.duration.toString(),
      calories: workout.calories.toString(),
      notes: workout.notes || '',
      exercises: workout.exercises || [{
        exerciseName: '',
        sets: 1,
        reps: 10,
        weight: 0
      }]
    });
    setShowEditWorkoutModal(true);
  };
  
  // 保存编辑后的训练记录
  const saveEditWorkout = async () => {
    // 表单验证
    if (!workoutForm.duration) {
      message.error('请填写训练时长');
      return;
    }
    
    // 检查是否有至少一个训练动作
    if (!workoutForm.exercises || workoutForm.exercises.length === 0) {
      message.error('请添加至少一个训练动作');
      return;
    }
    
    // 检查每个训练动作是否填写了名称
    for (let i = 0; i < workoutForm.exercises.length; i++) {
      if (!workoutForm.exercises[i].exerciseName) {
        message.error(`请填写第${i + 1}个训练动作的名称`);
        return;
      }
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/workouts/${editingWorkout.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(workoutForm)
      });
      
      if (response.ok) {
        message.success('训练记录更新成功');
        setShowEditWorkoutModal(false);
        // 重置表单
        setWorkoutForm({
          date: new Date().toISOString().split('T')[0],
          duration: '',
          calories: '',
          notes: '',
          exercises: [{
            exerciseName: '',
            sets: 1,
            reps: 10,
            weight: 0
          }]
        });
        setEditingWorkout(null);
        // 清除相关缓存并重新加载
        invalidate(CACHE_KEYS.WORKOUTS)
        invalidate(CACHE_KEYS.DASHBOARD)
        await Promise.all([loadWorkouts(true), loadDashboardData(true)]);
      } else {
        // 尝试获取错误信息
        try {
          const errorData = await response.json();
          message.error(`更新失败: ${errorData.error || '未知错误'}`);
        } catch {
          message.error('更新失败，请重试');
        }
      }
    } catch (error) {
      console.error('更新训练记录失败:', error);
      message.error('更新失败，请重试');
    }
  };
  
  // 查看训练记录详情
  const viewWorkout = (workout) => {
    setCurrentWorkoutRecord(workout);
    setShowViewWorkoutModal(true);
  };
  
  // 删除训练记录
  const deleteWorkout = async () => {
    if (!deletingWorkoutId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/workouts/${deletingWorkoutId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        message.success('训练记录已删除');
        // 清除相关缓存并重新加载
        invalidate(CACHE_KEYS.WORKOUTS)
        invalidate(CACHE_KEYS.DASHBOARD)
        await Promise.all([loadWorkouts(true), loadDashboardData(true)]);
      } else {
        // 如果API调用失败，从本地存储删除
        const existingWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]');
        const updatedWorkouts = existingWorkouts.filter(workout => workout.id !== deletingWorkoutId);
        localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
        
        message.success('训练记录已删除（本地备份）');
        // 清除相关缓存并重新加载
        invalidate(CACHE_KEYS.WORKOUTS)
        invalidate(CACHE_KEYS.DASHBOARD)
        await Promise.all([loadWorkouts(true), loadDashboardData(true)]);
      }
      
      // 关闭删除确认模态框
      setShowWorkoutDeleteConfirmModal(false);
      setDeletingWorkoutId(null);
    } catch (error) {
      // 如果发生错误，从本地存储删除
      try {
        const existingWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]');
        const updatedWorkouts = existingWorkouts.filter(workout => workout.id !== deletingWorkoutId);
        localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
        
        message.success('训练记录已删除（本地备份）');
        // 清除相关缓存并重新加载
        invalidate(CACHE_KEYS.WORKOUTS)
        invalidate(CACHE_KEYS.DASHBOARD)
        await Promise.all([loadWorkouts(true), loadDashboardData(true)]);
        
        // 关闭删除确认模态框
        setShowWorkoutDeleteConfirmModal(false);
        setDeletingWorkoutId(null);
      } catch (localError) {
        console.error('删除训练记录失败:', error);
        message.error('删除失败，请重试');
      }
    }
  };
  
  // 导出训练记录
  const exportWorkouts = () => {
    if (workouts.length === 0) {
      message.info('没有训练记录可导出');
      return;
    }
    
    // 转换为CSV格式
    const headers = ['日期', '时长(分钟)', '消耗热量', '备注', '动作', '组数', '次数', '重量', '休息时间(秒)'];
    const rows = workouts.flatMap(workout => {
      if (workout.exercises && workout.exercises.length > 0) {
        return workout.exercises.map((exercise, index) => [
          index === 0 ? new Date(workout.date).toLocaleDateString() : '',
          index === 0 ? workout.duration : '',
          index === 0 ? workout.calories : '',
          index === 0 ? (workout.notes || '') : '',
          exercise.exerciseName,
          exercise.sets,
          exercise.reps,
          exercise.weight,
          exercise.restTime
        ]);
      } else {
        return [[
          new Date(workout.date).toLocaleDateString(),
          workout.duration,
          workout.calories,
          workout.notes || '',
          '', '', '', '', ''
        ]];
      }
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `训练记录_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('训练记录导出成功');
  };
  
  // 加载身体数据
  const loadBodyMeasurements = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        message.error('请先登录');
        navigate('/login');
        return;
      }
      
      const response = await fetch('/api/body-measurements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBodyMeasurements(data.measurements);
      } else {
        const errorData = await response.json();
        if (errorData.error === '无效的认证令牌' || errorData.error === '未认证') {
          message.error('登录已过期，请重新登录');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          message.error(`加载身体数据失败: ${errorData.error || '未知错误'}`);
        }
      }
    } catch (error) {
      console.error('加载身体数据失败:', error);
      message.error('网络错误，请检查网络连接');
    }
  };
  
  // 加载身体数据统计
  const loadBodyDataStats = async () => {
    try {
      console.log('Loading body data stats...');
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Available' : 'Not available');
      
      if (!token) {
        message.error('请先登录');
        navigate('/login');
        return;
      }
      
      const response = await fetch('/api/body-measurements/stats/summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received body data stats:', data);
        setBodyDataStats(data);
        console.log('Body data stats updated in state');
        // 图表更新将由useEffect钩子自动处理，因为它依赖于bodyDataStats状态
      } else {
        const errorData = await response.json();
        console.error('Failed to load body data stats:', errorData);
        if (errorData.error === '无效的认证令牌' || errorData.error === '未认证') {
          message.error('登录已过期，请重新登录');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          message.error(`加载身体数据统计失败: ${errorData.error || '未知错误'}`);
        }
      }
    } catch (error) {
      console.error('加载身体数据统计失败:', error);
      message.error('网络错误，请检查网络连接');
    }
  };
  
  // 保存身体数据
  const saveBodyData = async () => {
    try {
      // 表单验证
      if (!bodyDataForm.weight) {
        message.error('请填写体重');
        return;
      }
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        message.error('请先登录');
        navigate('/login');
        return;
      }
      
      const response = await fetch('/api/body-measurements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyDataForm)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Body data saved successfully:', data);
        message.success('身体数据保存成功');
        setShowAddBodyDataModal(false);
        // 重置表单
        setBodyDataForm({
          date: new Date().toISOString().split('T')[0],
          weight: '',
          bodyFat: '',
          muscleMass: '',
          waist: '',
          chest: '',
          hips: '',
          biceps: '',
          thighs: '',
          notes: ''
        });
        
        // 同步更新体重目标的 current_value
        try {
          const weightGoal = goals.find(g => g.type === 'weight');
          if (weightGoal && bodyDataForm.weight) {
            const newWeight = parseFloat(bodyDataForm.weight);
            await fetch(`/api/goals/${weightGoal.id}/progress`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ current_value: newWeight })
            });
          }
        } catch (error) {
          console.error('同步体重目标失败:', error);
        }
        
        // 重新加载所有相关数据，确保三大模块数据一致
        await Promise.all([
          loadBodyMeasurements(),
          loadBodyDataStats(),
          loadGoals(true),
          loadDashboardData(true)
        ]);
        console.log('Body data reloaded');
      } else {
        const errorData = await response.json();
        console.error('Save failed:', errorData);
        if (errorData.error === '无效的认证令牌' || errorData.error === '未认证') {
          message.error('登录已过期，请重新登录');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          message.error(`保存失败: ${errorData.error || '未知错误'}`);
        }
      }
    } catch (error) {
      console.error('保存身体数据失败:', error);
      message.error('网络错误，请检查网络连接');
    }
  };
  
  const saveQuickWeight = async () => {
    if (!weightForm.weight) { message.error('请填写体重'); return; }
    const token = localStorage.getItem('token');
    if (!token) { message.error('请先登录'); navigate('/login'); return; }
    try {
      // 合并当前最新数据
      const dataToSave = {
        ...weightForm,
        weight: parseFloat(weightForm.weight),
        bodyFat: bodyDataStats.latest?.bodyFat || null,
        muscleMass: bodyDataStats.latest?.muscleMass || null,
        chest: bodyDataStats.latest?.chest || null,
        waist: bodyDataStats.latest?.waist || null,
        hips: bodyDataStats.latest?.hips || null,
        biceps: bodyDataStats.latest?.biceps || null,
        thighs: bodyDataStats.latest?.thighs || null
      };
      
      const res = await fetch('/api/body-measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(dataToSave)
      });
      if (res.ok) {
        message.success('体重记录成功');
        setShowWeightModal(false);
        setWeightForm({ date: new Date().toISOString().split('T')[0], weight: '' });
        await Promise.all([loadBodyMeasurements(), loadBodyDataStats(), loadGoals(true), loadDashboardData(true)]);
      }
    } catch (e) { console.error(e); message.error('网络错误'); }
  };
  
  const saveQuickBodyFat = async () => {
    if (!bodyFatForm.bodyFat) { message.error('请填写体脂率'); return; }
    const token = localStorage.getItem('token');
    if (!token) { message.error('请先登录'); navigate('/login'); return; }
    try {
      // 合并当前最新数据
      const dataToSave = {
        ...bodyFatForm,
        bodyFat: parseFloat(bodyFatForm.bodyFat),
        weight: bodyDataStats.latest?.weight || null,
        muscleMass: bodyDataStats.latest?.muscleMass || null,
        chest: bodyDataStats.latest?.chest || null,
        waist: bodyDataStats.latest?.waist || null,
        hips: bodyDataStats.latest?.hips || null,
        biceps: bodyDataStats.latest?.biceps || null,
        thighs: bodyDataStats.latest?.thighs || null
      };
      
      const res = await fetch('/api/body-measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(dataToSave)
      });
      if (res.ok) {
        message.success('体脂率记录成功');
        setShowBodyFatModal(false);
        setBodyFatForm({ date: new Date().toISOString().split('T')[0], bodyFat: '' });
        await Promise.all([loadBodyMeasurements(), loadBodyDataStats(), loadGoals(true), loadDashboardData(true)]);
      }
    } catch (e) { console.error(e); message.error('网络错误'); }
  };
  
  const saveQuickCircumference = async () => {
    if (!circumferenceForm.chest && !circumferenceForm.waist && !circumferenceForm.hips && !circumferenceForm.biceps) { message.error('请至少填写一项围度'); return; }
    const token = localStorage.getItem('token');
    if (!token) { message.error('请先登录'); navigate('/login'); return; }
    try {
      // 合并当前最新数据
      const dataToSave = {
        ...circumferenceForm,
        chest: circumferenceForm.chest ? parseFloat(circumferenceForm.chest) : bodyDataStats.latest?.chest || null,
        waist: circumferenceForm.waist ? parseFloat(circumferenceForm.waist) : bodyDataStats.latest?.waist || null,
        hips: circumferenceForm.hips ? parseFloat(circumferenceForm.hips) : bodyDataStats.latest?.hips || null,
        biceps: circumferenceForm.biceps ? parseFloat(circumferenceForm.biceps) : bodyDataStats.latest?.biceps || null,
        weight: bodyDataStats.latest?.weight || null,
        bodyFat: bodyDataStats.latest?.bodyFat || null,
        muscleMass: bodyDataStats.latest?.muscleMass || null,
        thighs: bodyDataStats.latest?.thighs || null
      };
      
      const res = await fetch('/api/body-measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(dataToSave)
      });
      if (res.ok) {
        message.success('围度记录成功');
        setShowCircumferenceModal(false);
        setCircumferenceForm({ date: new Date().toISOString().split('T')[0], chest: '', waist: '', hips: '', biceps: '' });
        await Promise.all([loadBodyMeasurements(), loadBodyDataStats(), loadGoals(true), loadDashboardData(true)]);
      }
    } catch (e) { console.error(e); message.error('网络错误'); }
  };
  
  const saveQuickBmi = async () => {
    if (!bmiForm.weight) { message.error('请填写体重'); return; }
    const token = localStorage.getItem('token');
    if (!token) { message.error('请先登录'); navigate('/login'); return; }
    try {
      // 合并当前最新数据
      const dataToSave = {
        ...bmiForm,
        weight: parseFloat(bmiForm.weight),
        bodyFat: bodyDataStats.latest?.bodyFat || null,
        muscleMass: bodyDataStats.latest?.muscleMass || null,
        chest: bodyDataStats.latest?.chest || null,
        waist: bodyDataStats.latest?.waist || null,
        hips: bodyDataStats.latest?.hips || null,
        biceps: bodyDataStats.latest?.biceps || null,
        thighs: bodyDataStats.latest?.thighs || null
      };
      
      const res = await fetch('/api/body-measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(dataToSave)
      });
      if (res.ok) {
        message.success('BMI记录成功');
        setShowBmiModal(false);
        setBmiForm({ date: new Date().toISOString().split('T')[0], weight: '' });
        await Promise.all([loadBodyMeasurements(), loadBodyDataStats(), loadGoals(true), loadDashboardData(true)]);
      }
    } catch (e) { console.error(e); message.error('网络错误'); }
  };
  
  // 当切换到身体数据页面时，加载身体数据
  useEffect(() => {
    // 页面加载时总是加载身体数据统计
    loadBodyDataStats();
    
    if (activeSubMenu === 'body-data') {
      loadBodyMeasurements();
      loadBodyDataStats();
    }
    // 首页也需要加载身体数据统计
    if (activeMenu === 'dashboard' && !activeSubMenu) {
      loadBodyDataStats();
    }
  }, [activeSubMenu, activeMenu]);
  
  // 初始化体重趋势图
  const initWeightChart = useCallback(() => {
    if (weightChartRef.current) {
      const chart = echarts.init(weightChartRef.current);
      setWeightChart(chart);
      return chart;
    }
    return null;
  }, []);
  
  // 初始化体脂率环形图
  const initBodyFatChart = useCallback(() => {
    if (bodyFatChartRef.current) {
      const chart = echarts.init(bodyFatChartRef.current);
      setBodyFatChart(chart);
      return chart;
    }
    return null;
  }, []);
  
  // 初始化肌肉量饼图
  const initMuscleMassChart = useCallback(() => {
    if (muscleMassChartRef.current) {
      const chart = echarts.init(muscleMassChartRef.current);
      setMuscleMassChart(chart);
      return chart;
    }
    return null;
  }, []);
  
  // 初始化BMI图表
  const initBmiChart = useCallback(() => {
    if (bmiChartRef.current) {
      const chart = echarts.init(bmiChartRef.current);
      setBmiChart(chart);
      return chart;
    }
    return null;
  }, []);
  
  // 初始化腰围趋势图
  const initWaistChart = useCallback(() => {
    if (waistChartRef.current) {
      const chart = echarts.init(waistChartRef.current);
      setWaistChart(chart);
      return chart;
    }
    return null;
  }, []);
  
  // 首页迷你图表初始化
  const initMiniWeightChart = useCallback(() => {
    if (miniWeightChartRef.current) {
      const chart = echarts.init(miniWeightChartRef.current);
      setMiniWeightChart(chart);
      return chart;
    }
    return null;
  }, []);
  
  const initMiniBodyFatChart = useCallback(() => {
    if (miniBodyFatChartRef.current) {
      const chart = echarts.init(miniBodyFatChartRef.current);
      setMiniBodyFatChart(chart);
      return chart;
    }
    return null;
  }, []);
  
  const initMiniMuscleChart = useCallback(() => {
    if (miniMuscleChartRef.current) {
      const chart = echarts.init(miniMuscleChartRef.current);
      setMiniMuscleChart(chart);
      return chart;
    }
    return null;
  }, []);
  
  const initMiniBmiChart = useCallback(() => {
    if (miniBmiChartRef.current) {
      const chart = echarts.init(miniBmiChartRef.current);
      setMiniBmiChart(chart);
      return chart;
    }
    return null;
  }, []);
  
  // 首页迷你图表更新
  const updateMiniWeightChart = useCallback((data) => {
    let chart = miniWeightChart;
    if (!chart && miniWeightChartRef.current) {
      chart = echarts.init(miniWeightChartRef.current);
      setMiniWeightChart(chart);
    }
    if (!chart) return;
    const dates = data.map(item => {
      const date = new Date(item.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    const weights = data.map(item => item.weight);
    chart.setOption({
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: 'transparent', textStyle: { color: 'white', fontSize: 10 }, formatter: '{b}: {c}kg' },
      grid: { left: 5, right: 5, top: 10, bottom: 15, containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: dates, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } }, axisLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 8 }, axisTick: { show: false } },
      yAxis: { type: 'value', min: 30, max: 120, axisLine: { show: false }, axisLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 8 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } } },
      series: [{ data: weights, type: 'line', smooth: true, lineStyle: { color: 'rgba(34,197,94,0.8)', width: 2 }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(34,197,94,0.25)' }, { offset: 1, color: 'rgba(34,197,94,0.02)' }] } }, symbol: 'none' }]
    }, true);
  }, [miniWeightChart]);
  
  const updateMiniBodyFatChart = useCallback((currentBodyFat) => {
    let chart = miniBodyFatChart;
    if (!chart && miniBodyFatChartRef.current) {
      chart = echarts.init(miniBodyFatChartRef.current);
      setMiniBodyFatChart(chart);
    }
    if (!chart) return;
    let status = '正常';
    let markerColor = '#22c55e';
    if (currentBodyFat < 10) { status = '偏低'; markerColor = '#3b82f6'; }
    else if (currentBodyFat < 20) { status = '正常'; markerColor = '#22c55e'; }
    else if (currentBodyFat < 30) { status = '偏高'; markerColor = '#eab308'; }
    else { status = '肥胖'; markerColor = '#ef4444'; }
    
    const minVal = 5;
    const maxVal = 40;
    const progress = Math.min(1, Math.max(0, (currentBodyFat - minVal) / (maxVal - minVal)));
    
    chart.setOption({
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderColor: 'transparent',
        textStyle: { color: 'white', fontSize: 11 },
        formatter: (p) => {
          if (p.data && p.data.tooltip) return p.data.tooltip;
          return `体脂率: ${currentBodyFat}% (${status})`;
        }
      },
      grid: { left: 0, right: 0, top: 0, bottom: 0, containLabel: false },
      xAxis: { type: 'value', show: false, min: 0, max: 1 },
      yAxis: { type: 'value', show: false, min: 0, max: 1 },
      series: [
        {
          type: 'custom',
          renderItem: (params, api) => {
            const cx = api.coord([0.5, 0.5])[0];
            const cy = api.coord([0.5, 0.4])[1];
            const radius = 70;
            const lineWidth = 40;
            
            // 绘制完整的渐变弧形（开口向下的彩虹形状）
            const arcPath = {
              type: 'path',
              shape: {
                d: `M${cx - radius},${cy} A${radius},${radius} 0 0,1 ${cx + radius},${cy}`
              },
              style: {
                fill: 'none',
                stroke: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 1,
                  y2: 0,
                  colorStops: [
                    { offset: 0, color: 'rgba(59,130,246,0.3)' },
                    { offset: 0.3, color: 'rgba(34,197,94,0.3)' },
                    { offset: 0.6, color: 'rgba(234,179,8,0.3)' },
                    { offset: 1, color: 'rgba(239,68,68,0.3)' }
                  ]
                },
                lineWidth: lineWidth,
                lineCap: 'round'
              }
            };
            
            // 绘制进度弧形（从左侧起始到当前位置）
            const startAngle = Math.PI;
            const endAngle = 0;
            const currentAngle = startAngle + (endAngle - startAngle) * progress;
            const progressX = cx + radius * Math.cos(currentAngle);
            const progressY = cy - radius * Math.sin(currentAngle);
            
            const progressPath = {
              type: 'path',
              shape: {
                d: `M${cx - radius},${cy} A${radius},${radius} 0 0,1 ${progressX},${progressY}`
              },
              style: {
                fill: 'none',
                stroke: markerColor,
                lineWidth: lineWidth,
                lineCap: 'round',
                opacity: 0.5
              }
            };
            
            // 标记点
            const markerX = cx + radius * Math.cos(currentAngle);
            const markerY = cy - radius * Math.sin(currentAngle);
            
            const marker = {
              type: 'circle',
              shape: { cx: markerX, cy: markerY, r: 7 },
              style: {
                fill: 'white',
                stroke: markerColor,
                lineWidth: 2,
                shadowColor: 'rgba(0,0,0,0.3)',
                shadowBlur: 5,
                shadowOffsetY: 1
              }
            };
            
            return { type: 'group', children: [arcPath, progressPath, marker] };
          },
          data: [{ tooltip: `体脂率: ${currentBodyFat}% (${status})` }],
          animation: false,
          emphasis: {
            scale: 1.1,
            itemStyle: { shadowBlur: 10 }
          }
        }
      ]
    }, true);
  }, [miniBodyFatChart]);
  
  const updateMiniMuscleChart = useCallback((chest, waist, hips, biceps) => {
    let chart = miniMuscleChart;
    if (!chart && miniMuscleChartRef.current) {
      chart = echarts.init(miniMuscleChartRef.current);
      setMiniMuscleChart(chart);
    }
    if (!chart) return;
    const maxVal = Math.max(chest, waist, hips, biceps, 1) * 1.5;
    chart.setOption({
      grid: { left: '5%', right: '5%', top: '5%', bottom: '5%', containLabel: true },
      radar: {
        indicator: [
          { name: '胸围', max: maxVal, nameGap: 5 },
          { name: '腰围', max: maxVal, nameGap: 5 },
          { name: '臀围', max: maxVal, nameGap: 5 },
          { name: '臂围', max: maxVal, nameGap: 5 }
        ],
        shape: 'polygon',
        radius: '115%',
        startAngle: 45,
        axisName: { color: 'rgba(255,255,255,0.8)', fontSize: 13, position: 'end' },
        splitArea: { areaStyle: { color: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.04)'] } },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)', width: 2.5 } },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.2)', width: 2 } }
      },
      series: [{
        type: 'radar',
        data: [{
          value: [chest, waist, hips, biceps],
          name: '四围',
          lineStyle: { color: 'rgba(255,255,255,0.9)', width: 1 },
          areaStyle: { color: 'rgba(34,197,94,0.3)' },
          itemStyle: { color: 'rgba(255,255,255,0.9)', borderColor: 'rgba(34,197,94,0.7)', borderWidth: 1 },
          symbol: 'circle',
          symbolSize: 5
        }]
      }],
      tooltip: { trigger: 'item', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: 'transparent', textStyle: { color: 'white', fontSize: 10 }, formatter: (p) => `${p.seriesName}\n胸围: ${p.value[0]}cm\n腰围: ${p.value[1]}cm\n臀围: ${p.value[2]}cm\n臂围: ${p.value[3]}cm` }
    }, true);
  }, [miniMuscleChart]);
  
  const updateMiniBmiChart = useCallback((bmi) => {
    let chart = miniBmiChart;
    if (!chart && miniBmiChartRef.current) {
      chart = echarts.init(miniBmiChartRef.current);
      setMiniBmiChart(chart);
    }
    if (!chart) return;
    let status = '正常';
    let markerColor = '#22c55e';
    if (bmi < 18.5) { status = '偏瘦'; markerColor = '#3b82f6'; }
    else if (bmi < 24) { status = '正常'; markerColor = '#22c55e'; }
    else if (bmi < 28) { status = '超重'; markerColor = '#eab308'; }
    else { status = '肥胖'; markerColor = '#ef4444'; }
    
    const minBmi = 14;
    const maxBmi = 35;
    
    chart.setOption({
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0,0,0,0.75)',
        borderColor: 'transparent',
        textStyle: { color: 'white', fontSize: 11 },
        formatter: () => `BMI: ${bmi.toFixed(1)}\n状态: ${status}`
      },
      grid: { left: 0, right: 0, top: 0, bottom: 0, containLabel: false },
      xAxis: { type: 'value', min: minBmi, max: maxBmi, show: false },
      yAxis: { type: 'category', data: ['BMI'], show: false },
      series: [
        {
          type: 'custom',
          renderItem: (params, api) => {
            const yCenter = api.coord([0, 0])[1];
            const barHeight = 40;
            const y = yCenter - barHeight / 2;
            const r = barHeight / 2;
            
            // 计算条形宽度
            const xStart = api.coord([minBmi, 0])[0];
            const xEnd = api.coord([maxBmi, 0])[0];
            
            // 绘制渐变彩虹条
            const rainbowBar = {
              type: 'path',
              shape: {
                d: `M${xStart + r},${y} L${xEnd - r},${y} A${r},${r} 0 0 1 ${xEnd},${y + r} L${xEnd},${y + barHeight - r} A${r},${r} 0 0 1 ${xEnd - r},${y + barHeight} L${xStart + r},${y + barHeight} A${r},${r} 0 0 1 ${xStart},${y + barHeight - r} L${xStart},${y + r} A${r},${r} 0 0 1 ${xStart + r},${y} Z`
              },
              style: {
                fill: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 1,
                  y2: 0,
                  colorStops: [
                    { offset: 0, color: 'rgba(59,130,246,0.3)' },
                    { offset: 0.25, color: 'rgba(34,197,94,0.3)' },
                    { offset: 0.6, color: 'rgba(234,179,8,0.3)' },
                    { offset: 1, color: 'rgba(239,68,68,0.3)' }
                  ]
                }
              },
              tooltip: {
                show: true,
                formatter: '偏瘦(<18.5) → 正常(18.5-24) → 超重(24-28) → 肥胖(>28)'
              }
            };
            
            // 绘制进度条（从左侧到当前位置）
            const markerX = api.coord([bmi, 0])[0];
            const progressBar = {
              type: 'path',
              shape: {
                d: `M${xStart + r},${y} L${markerX},${y} L${markerX},${y + barHeight} L${xStart + r},${y + barHeight} A${r},${r} 0 0 1 ${xStart},${y + barHeight - r} L${xStart},${y + r} A${r},${r} 0 0 1 ${xStart + r},${y} Z`
              },
              style: {
                fill: markerColor,
                opacity: 0.5
              }
            };
            
            // 标记点
            const marker = {
              type: 'circle',
              shape: { cx: markerX, cy: yCenter, r: 10 },
              style: {
                fill: 'white',
                stroke: markerColor,
                lineWidth: 2.5,
                shadowColor: 'rgba(0,0,0,0.3)',
                shadowBlur: 6,
                shadowOffsetY: 2
              },
              tooltip: { show: true, formatter: `当前 BMI: ${bmi.toFixed(1)} (${status})` }
            };
            
            return { type: 'group', children: [rainbowBar, progressBar, marker] };
          },
          data: [{ tooltip: `BMI: ${bmi.toFixed(1)} (${status})` }],
          animation: false,
          emphasis: {
            scale: 1.05,
            itemStyle: { shadowBlur: 10 }
          }
        }
      ]
    }, true);
  }, [miniBmiChart]);
  
  // 更新体重趋势图
  const updateWeightChart = useCallback((data) => {
    let chart = weightChart;
    if (!chart && weightChartRef.current) {
      chart = echarts.init(weightChartRef.current);
      setWeightChart(chart);
    }
    if (!chart) return;
    
    // 函数：正确解析本地日期，处理时区问题
    const parseLocalDate = (dateStr) => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    };
    
    // 函数：格式化日期为本地时区的月/日
    const formatLocalDate = (timestamp) => {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      // 重新构造本地日期，避免时区问题
      const localDate = new Date(year, month - 1, day);
      return `${localDate.getMonth() + 1}/${localDate.getDate()}`;
    };
    
    // 数据去重：同一天只保留最新一条记录
    const dateMap = new Map();
    data.forEach(item => {
      const localDate = parseLocalDate(item.date);
      const dateKey = localDate.toDateString(); // 按日期去重
      dateMap.set(dateKey, { ...item, localDate });
    });
    
    // 转换为数组并按日期升序排列
    const uniqueData = Array.from(dateMap.values()).sort((a, b) => 
      a.localDate.getTime() - b.localDate.getTime()
    );
    
    // 格式化数据为 [timestamp, value] 格式，使用本地日期的时间戳
    const chartData = uniqueData.map(item => [
      item.localDate.getTime(),
      item.weight
    ]);
    
    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderColor: 'transparent',
        textStyle: { color: 'white', fontSize: 12 },
        borderRadius: 4,
        formatter: (params) => {
          if (params && params[0]) {
            return `${formatLocalDate(params[0].value[0])}: ${params[0].value[1]}kg`;
          }
          return '';
        }
      },
      grid: {
        left: '8%',
        right: '5%',
        bottom: '10%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: 'rgba(255,255,255,0.7)',
          fontSize: 12,
          formatter: (value) => {
            return formatLocalDate(value);
          }
        }
      },
      yAxis: {
        type: 'value',
        min: 30,
        max: 120,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: 'rgba(255,255,255,0.7)',
          fontSize: 12
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.1)'
          }
        }
      },
      series: [
        {
          data: chartData,
          type: 'line',
          smooth: true,
          connectNulls: true,
          lineStyle: {
            color: '#4ade80',
            width: 2
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(74, 222, 128, 0.2)' },
                { offset: 1, color: 'rgba(74, 222, 128, 0.02)' }
              ]
            }
          },
          symbol: 'circle',
          symbolSize: 5,
          itemStyle: {
            color: '#4ade80'
          }
        }
      ]
    };
    
    chart.setOption(option, true);
  }, [weightChart]);
  
  // 更新体脂率半环形进度图
  const updateBodyFatChart = useCallback((currentBodyFat) => {
    let chart = bodyFatChart;
    if (!chart && bodyFatChartRef.current) {
      chart = echarts.init(bodyFatChartRef.current);
      setBodyFatChart(chart);
    }
    if (!chart) return;
    
    // 计算各区间的角度
    const totalAngle = 180; // 半环形
    const maxValue = 30;
    const thinAngle = (15 / maxValue) * totalAngle;
    const healthyAngle = (5 / maxValue) * totalAngle;
    const highAngle = (5 / maxValue) * totalAngle;
    const obeseAngle = (5 / maxValue) * totalAngle;
    
    // 计算当前值的角度位置
    const currentAngle = (currentBodyFat / maxValue) * totalAngle;
    
    // 确定状态和颜色
    let status = '健康';
    let statusColor = '#10b981';
    
    if (currentBodyFat < 15) {
      status = '偏瘦';
      statusColor = '#3b82f6';
    } else if (currentBodyFat >= 15 && currentBodyFat < 20) {
      status = '健康';
      statusColor = '#10b981';
    } else if (currentBodyFat >= 20 && currentBodyFat < 25) {
      status = '偏高';
      statusColor = '#f59e0b';
    } else {
      status = '肥胖';
      statusColor = '#ef4444';
    }
    
    const option = {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        textStyle: { color: 'white' },
        formatter: function(params) {
          return `${params.name}: ${params.value}%`;
        }
      },
      legend: {
        show: false
      },
      grid: {
        left: '5%',
        right: '5%',
        top: '20%',
        bottom: '5%',
        containLabel: true
      },
      series: [
        // 背景环
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 30,
          splitNumber: 6,
          radius: '90%',
          center: ['50%', '65%'],
          axisLine: {
            lineStyle: {
              width: 15,
              color: [
                [0.5, 'rgba(255, 255, 255, 0.1)'],
                [1, 'rgba(255, 255, 255, 0.1)']
              ],
              borderRadius: 10
            }
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false
          },
          pointer: {
            show: false
          },
          detail: {
            show: false
          }
        },
        // 偏瘦区间
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 180 - thinAngle,
          min: 0,
          max: 15,
          splitNumber: 3,
          radius: '90%',
          center: ['50%', '65%'],
          axisLine: {
            lineStyle: {
              width: 15,
              color: [
                [1, '#3b82f6']
              ],
              borderRadius: 10
            }
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false
          },
          pointer: {
            show: false
          },
          detail: {
            show: false
          }
        },
        // 健康区间
        {
          type: 'gauge',
          startAngle: 180 - thinAngle,
          endAngle: 180 - thinAngle - healthyAngle,
          min: 15,
          max: 20,
          splitNumber: 1,
          radius: '90%',
          center: ['50%', '65%'],
          axisLine: {
            lineStyle: {
              width: 15,
              color: [
                [1, '#10b981']
              ],
              borderRadius: 10
            }
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false
          },
          pointer: {
            show: false
          },
          detail: {
            show: false
          }
        },
        // 偏高区间
        {
          type: 'gauge',
          startAngle: 180 - thinAngle - healthyAngle,
          endAngle: 180 - thinAngle - healthyAngle - highAngle,
          min: 20,
          max: 25,
          splitNumber: 1,
          radius: '90%',
          center: ['50%', '65%'],
          axisLine: {
            lineStyle: {
              width: 15,
              color: [
                [1, '#f59e0b']
              ],
              borderRadius: 10
            }
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false
          },
          pointer: {
            show: false
          },
          detail: {
            show: false
          }
        },
        // 肥胖区间
        {
          type: 'gauge',
          startAngle: 180 - thinAngle - healthyAngle - highAngle,
          endAngle: 0,
          min: 25,
          max: 30,
          splitNumber: 1,
          radius: '90%',
          center: ['50%', '65%'],
          axisLine: {
            lineStyle: {
              width: 15,
              color: [
                [1, '#ef4444']
              ],
              borderRadius: 10
            }
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false
          },
          pointer: {
            show: false
          },
          detail: {
            show: false
          }
        },
        // 当前值标记 - 白色指针
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 30,
          splitNumber: 6,
          radius: '90%',
          center: ['50%', '65%'],
          axisLine: {
            show: false
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false
          },
          pointer: {
            show: true,
            length: '70%',
            width: 4,
            itemStyle: {
              color: 'white'
            }
          },
          detail: {
            show: false
          },
          data: [{
            value: currentBodyFat,
            name: '当前体脂率',
            title: {
              show: false
            },
            detail: {
              show: false
            }
          }]
        }
      ],
      graphic: []
    };
    
    chart.setOption(option, true);
  }, [bodyFatChart]);
  
  // 更新肌肉量柱状图
  const updateMuscleMassChart = useCallback((muscleMass, totalWeight) => {
    let chart = muscleMassChart;
    if (!chart && muscleMassChartRef.current) {
      chart = echarts.init(muscleMassChartRef.current);
      setMuscleMassChart(chart);
    }
    if (!chart) return;
    
    const nonMuscleMass = totalWeight - muscleMass;
    
    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        textStyle: { color: 'white' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['肌肉', '非肌肉'],
        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
        axisLabel: { color: 'rgba(255, 255, 255, 0.8)' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
        axisLabel: { color: 'rgba(255, 255, 255, 0.8)' },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
      },
      series: [
        {
          data: [
            {
              value: muscleMass,
              itemStyle: { color: '#3b82f6' }
            },
            {
              value: nonMuscleMass,
              itemStyle: { color: 'rgba(255, 255, 255, 0.2)' }
            }
          ],
          type: 'bar',
          barWidth: '60%'
        }
      ]
    };
    
    chart.setOption(option, true);
  }, [muscleMassChart]);
  
  // 更新BMI水平区间进度条
  const updateBmiChart = useCallback((bmi) => {
    let chart = bmiChart;
    if (!chart && bmiChartRef.current) {
      chart = echarts.init(bmiChartRef.current);
      setBmiChart(chart);
    }
    if (!chart) return;
    
    let status = '健康';
    
    if (bmi < 18.5) {
      status = '偏瘦';
    } else if (bmi >= 18.5 && bmi < 24) {
      status = '健康';
    } else if (bmi >= 24 && bmi < 28) {
      status = '超重';
    } else {
      status = '肥胖';
    }
    
    // 计算各区间的宽度（最大BMI为40）
    const totalWidth = 40;
    
    // 计算当前值在进度条上的位置（百分比）
    // 确保位置在0-100%之间
    // 考虑grid的左右边距（各15%），所以实际图表区域是70%宽度
    const gridLeft = 15; // 15%
    const gridWidth = 70; // 70%
    const normalizedPosition = Math.max(0, Math.min(100, (bmi / totalWidth) * 100));
    const currentPosition = gridLeft + (normalizedPosition / 100) * gridWidth;
    
    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        textStyle: { color: 'white' },
        formatter: function() {
          return `当前BMI: ${bmi.toFixed(1)}`;
        }
      },
      legend: {
        show: false
      },
      grid: {
        left: '15%',
        right: '15%',
        bottom: '20%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: totalWidth,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'category',
        data: ['BMI'],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false }
      },
      series: [
        // 分段颜色进度条
        {
          type: 'bar',
          data: [totalWidth],
          barWidth: '20%',
          itemStyle: {
            borderRadius: [5, 5, 5, 5],
            // 使用线性渐变实现分段颜色
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#3b82f6' },      // 偏瘦（<18.5）
              { offset: 18.5/40, color: '#3b82f6' },
              { offset: 18.5/40, color: '#10b981' },    // 健康（18.5-24）
              { offset: 24/40, color: '#10b981' },
              { offset: 24/40, color: '#f59e0b' },      // 超重（24-28）
              { offset: 28/40, color: '#f59e0b' },
              { offset: 28/40, color: '#ef4444' },      // 肥胖（>28）
              { offset: 1, color: '#ef4444' }
            ])
          },
          showSymbol: false,
          legendHoverLink: false
        }
      ],
      graphic: [
        // 当前值标记 - 白色实心倒三角（在进度条下方）
        {
          type: 'text',
          left: `${currentPosition}%`,
          top: '55%',
          style: {
            text: '▲',
            fontSize: 16,
            fontWeight: 'bold',
            fill: 'white'
          }
        }
      ]
    };
    
    chart.setOption(option, true);
  }, [bmiChart]);
  
  // 更新腰围趋势图
  const updateWaistChart = useCallback((data) => {
    let chart = waistChart;
    if (!chart && waistChartRef.current) {
      chart = echarts.init(waistChartRef.current);
      setWaistChart(chart);
    }
    if (!chart) return;
    
    // 从历史数据中提取腰围数据
    const waistData = data.filter(item => item.waist);
    const dates = waistData.map(item => {
      const date = new Date(item.date);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    });
    const waists = waistData.map(item => item.waist);
    
    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        textStyle: { color: 'white' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
        axisLabel: { color: 'rgba(255, 255, 255, 0.8)' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
        axisLabel: { color: 'rgba(255, 255, 255, 0.8)' },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
      },
      series: [
        {
          data: waists,
          type: 'line',
          smooth: true,
          lineStyle: {
            color: '#10b981',
            width: 3
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.1)' }
            ])
          },
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: '#10b981'
          }
        }
      ]
    };
    
    chart.setOption(option, true);
  }, [waistChart]);
  
  // 初始化所有图表
  useEffect(() => {
    // 确保图表容器已经渲染
    setTimeout(() => {
      initWeightChart();
      initBodyFatChart();
      initMuscleMassChart();
      initBmiChart();
      initWaistChart();
    }, 100);
  }, [activeSubMenu, initWeightChart, initBodyFatChart, initMuscleMassChart, initBmiChart, initWaistChart]);
  
  // 初始化首页迷你图表
  useEffect(() => {
    if (activeMenu === 'dashboard' && !activeSubMenu) {
      setTimeout(() => {
        initMiniWeightChart();
        initMiniBodyFatChart();
        initMiniMuscleChart();
        initMiniBmiChart();
      }, 100);
      
      // 布局稳定后重新调整图表大小
      setTimeout(() => {
        miniWeightChart?.resize();
        miniBodyFatChart?.resize();
        miniMuscleChart?.resize();
        miniBmiChart?.resize();
      }, 500);
    }
  }, [activeMenu, activeSubMenu, initMiniWeightChart, initMiniBodyFatChart, initMiniMuscleChart, initMiniBmiChart, miniWeightChart, miniBodyFatChart, miniMuscleChart, miniBmiChart]);
  
  // 当身体数据统计加载完成后更新图表
  useEffect(() => {
    console.log('Body data stats updated:', bodyDataStats);
    
    // 体重图表
    if (bodyDataStats.history && bodyDataStats.history.length > 0) {
      console.log('Updating weight chart with data:', bodyDataStats.history);
      updateWeightChart(bodyDataStats.history);
    } else {
      // 使用默认数据
      const defaultWeightData = [
        { date: '2026-03-01', weight: 68 },
        { date: '2026-03-08', weight: 67.5 },
        { date: '2026-03-15', weight: 66.8 },
        { date: '2026-03-22', weight: 66.2 },
        { date: '2026-03-29', weight: 65.5 }
      ];
      console.log('Using default weight data');
      updateWeightChart(defaultWeightData);
    }
    
    // 体脂率图表
    const bodyFat = bodyDataStats.latest?.bodyFat || 18;
    console.log('Updating body fat chart with data:', bodyFat);
    updateBodyFatChart(bodyFat);
    
    // 肌肉量图表
    const muscleMass = bodyDataStats.latest?.muscleMass || 45;
    const weight = bodyDataStats.latest?.weight || 65.5;
    console.log('Updating muscle mass chart with data:', muscleMass, weight);
    updateMuscleMassChart(muscleMass, weight);
    
    // BMI图表
    const bmi = bodyDataStats.bmi || 22;
    console.log('Updating BMI chart with data:', bmi);
    updateBmiChart(bmi);
    
    // 腰围图表
    console.log('Updating waist chart with data:', bodyDataStats.history);
    updateWaistChart(bodyDataStats.history || []);
    
    // 首页迷你图表更新
    const miniData = bodyDataStats.history && bodyDataStats.history.length > 0 ? bodyDataStats.history : [
      { date: '2026-03-01', weight: 68 }, { date: '2026-03-08', weight: 67.5 },
      { date: '2026-03-15', weight: 66.8 }, { date: '2026-03-22', weight: 66.2 },
      { date: '2026-03-29', weight: 65.5 }
    ];
    updateMiniWeightChart(miniData);
    updateMiniBodyFatChart(bodyDataStats.latest?.bodyFat || 18);
    updateMiniMuscleChart(bodyDataStats.latest?.chest || 90, bodyDataStats.latest?.waist || 75, bodyDataStats.latest?.hips || 95, bodyDataStats.latest?.biceps || 35);
    updateMiniBmiChart(bodyDataStats.bmi || 22);
  }, [bodyDataStats, updateWeightChart, updateBodyFatChart, updateMuscleMassChart, updateBmiChart, updateWaistChart, updateMiniWeightChart, updateMiniBodyFatChart, updateMiniMuscleChart, updateMiniBmiChart]);
  
  // 窗口大小变化时调整图表大小
  useEffect(() => {
    const handleResize = () => {
      weightChart?.resize();
      bodyFatChart?.resize();
      muscleMassChart?.resize();
      bmiChart?.resize();
      waistChart?.resize();
      miniWeightChart?.resize();
      miniBodyFatChart?.resize();
      miniMuscleChart?.resize();
      miniBmiChart?.resize();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [weightChart, bodyFatChart, muscleMassChart, bmiChart, waistChart, miniWeightChart, miniBodyFatChart, miniMuscleChart, miniBmiChart]);

  // 加载仪表盘数据（带缓存）
  const loadDashboardData = async (forceRefresh = false) => {
    // 检查缓存
    if (!forceRefresh) {
      const cached = getCached(CACHE_KEYS.DASHBOARD)
      if (cached) {
        setDashboardData(cached)
        return
      }
    }
    
    try {
      const token = localStorage.getItem('token');
      
      // 并行获取所有需要的数据：训练记录、训练计划、健身目标、身体数据
      const [workoutsRes, plansRes, goalsRes, bodyRes] = await Promise.all([
        fetch('/api/workouts', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/plans', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/goals', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/body-measurements', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      const workoutsData = workoutsRes.ok ? await workoutsRes.json() : { workouts: [] };
      const plansData = plansRes.ok ? await plansRes.json() : { plans: [] };
      const goalsData = goalsRes.ok ? await goalsRes.json() : { goals: [] };
      const bodyData = bodyRes.ok ? await bodyRes.json() : { measurements: [] };
      
      // 计算时间范围 - 严格按自然月切割
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      // 获取本月第一天和最后一天
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
      
      // 获取上月第一天和最后一天
      const firstDayOfLastMonth = new Date(lastMonthYear, lastMonth, 1);
      const lastDayOfLastMonth = new Date(lastMonthYear, lastMonth + 1, 0);
      
      // 筛选本月和上月的训练记录 - 严格按自然月
      const thisMonthWorkouts = (workoutsData.workouts || []).filter(w => {
        const date = new Date(w.date);
        return date >= firstDayOfMonth && date <= lastDayOfMonth;
      });
      
      const lastMonthWorkouts = (workoutsData.workouts || []).filter(w => {
        const date = new Date(w.date);
        return date >= firstDayOfLastMonth && date <= lastDayOfLastMonth;
      });
      
      // 有效训练校验：时长>0
      const isValidTraining = (w) => {
        const duration = parseInt(w.duration) || 0;
        return duration > 0;
      };
      
      // 筛选有效训练
      const validThisMonthWorkouts = thisMonthWorkouts.filter(isValidTraining);
      const validLastMonthWorkouts = lastMonthWorkouts.filter(isValidTraining);
      
      // 计算总训练次数（仅有效训练）
      const totalSessions = validThisMonthWorkouts.length;
      const lastMonthSessions = validLastMonthWorkouts.length;
      
      // 计算完成计划数
      const completedPlans = (plansData.plans || []).filter(p => p.progress >= 100).length;
      const lastMonthCompletedPlans = completedPlans;
      
      // 计算总消耗热量
      const totalCalories = validThisMonthWorkouts.reduce((sum, w) => sum + (parseInt(w.calories) || 0), 0);
      const lastMonthCalories = validLastMonthWorkouts.reduce((sum, w) => sum + (parseInt(w.calories) || 0), 0);
      
      // 计算连续训练天数（仅有效训练计入）
      const validSortedWorkouts = (workoutsData.workouts || [])
        .filter(isValidTraining)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      
      let streakDays = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < validSortedWorkouts.length; i++) {
        const workoutDate = new Date(validSortedWorkouts[i].date);
        workoutDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === streakDays) {
          streakDays++;
        } else {
          break;
        }
      }
      
      // 获取最近5条训练记录（仅有效训练）
      const recentWorkouts = validSortedWorkouts.slice(0, 5).map(w => {
        // 根据训练动作判断类型
        const exercises = w.exercises || [];
        const exerciseNames = exercises.map(e => (e.exerciseName || '').toLowerCase()).join(' ');
        
        let type = 'strength';
        let typeName = '力量';
        
        if (exerciseNames.includes('有氧') || exerciseNames.includes('跑步') || exerciseNames.includes('骑行') || 
            exerciseNames.includes('游泳') || exerciseNames.includes('hiit') || exerciseNames.includes('燃脂')) {
          type = 'cardio';
          typeName = '有氧';
        } else if (exerciseNames.includes('瑜伽') || exerciseNames.includes('拉伸') || exerciseNames.includes('柔韧') || exerciseNames.includes('放松')) {
          type = 'flexibility';
          typeName = '柔韧';
        }
        
        return {
          id: w.id,
          name: `${typeName}训练`,
          date: w.date,
          duration: parseInt(w.duration) || 0,
          calories: parseInt(w.calories) || 0,
          type: type,
          status: '有效'
        };
      });
      
      // 获取目标数据
      const trainingGoal = (goalsData.goals || []).find(g => g.type === 'training');
      const calorieGoal = (goalsData.goals || []).find(g => g.type === 'calorie');
      
      const trainingTarget = trainingGoal ? trainingGoal.target_value : 20;
      const calorieTarget = calorieGoal ? calorieGoal.target_value : 15000;
      
      // 计算训练类型分布（仅基于本月有效训练）
      let strength = 0, cardio = 0, flexibility = 0;
      validThisMonthWorkouts.forEach(w => {
        const exercises = w.exercises || [];
        const exerciseNames = exercises.map(e => (e.exerciseName || '').toLowerCase()).join(' ');
        
        if (exerciseNames.includes('有氧') || exerciseNames.includes('跑步') || exerciseNames.includes('骑行') || 
            exerciseNames.includes('游泳') || exerciseNames.includes('hiit') || exerciseNames.includes('燃脂')) {
          cardio++;
        } else if (exerciseNames.includes('瑜伽') || exerciseNames.includes('拉伸') || exerciseNames.includes('柔韧') || exerciseNames.includes('放松')) {
          flexibility++;
        } else {
          strength++;
        }
      });
      
      const totalTypes = strength + cardio + flexibility || 1;
      
      // 计算剩余训练次数
      const remainingSessions = Math.max(0, trainingTarget - totalSessions);
      
      // 检查今日训练状态
      const todayStr = now.toISOString().split('T')[0];
      const todayWorkout = validSortedWorkouts.find(w => w.date.startsWith(todayStr));
      
      // 判断今日训练是否有效
      let todayWorkoutStatus = '未完成';
      if (todayWorkout) {
        todayWorkoutStatus = '已完成（有效）';
      }
      
      // 检查今日是否有无效记录
      const todayAllWorkouts = (workoutsData.workouts || []).filter(w => w.date.startsWith(todayStr));
      const hasInvalidToday = todayAllWorkouts.some(w => !isValidTraining(w));
      
      if (hasInvalidToday && !todayWorkout) {
        todayWorkoutStatus = '无效记录';
      }
      
      // 计算环比显示规则：本月进度≥70%或月末最后3天才显示环比
      const daysInMonth = lastDayOfMonth.getDate();
      const currentDay = now.getDate();
      const isLast3Days = daysInMonth - currentDay < 3;
      const trainingProgress = trainingTarget > 0 ? (totalSessions / trainingTarget) : 0;
      const showComparison = trainingProgress >= 0.7 || isLast3Days || totalSessions === 0;
      
      setDashboardData({
        totalSessions,
        completedPlans,
        totalCalories,
        streakDays,
        lastMonthSessions,
        lastMonthPlans: lastMonthCompletedPlans,
        lastMonthCalories,
        lastMonthStreak: streakDays,
        recentWorkouts,
        goals: {
          training: { 
            current: totalSessions, 
            target: trainingTarget, 
            completionRate: trainingTarget > 0 ? Math.min(100, Math.round((totalSessions / trainingTarget) * 100)) : 0 
          },
          calories: { 
            current: totalCalories, 
            target: calorieTarget, 
            completionRate: calorieTarget > 0 ? Math.min(100, Math.round((totalCalories / calorieTarget) * 100)) : 0 
          }
        },
        trainingTypeDistribution: {
          strength: Math.round((strength / totalTypes) * 100),
          cardio: Math.round((cardio / totalTypes) * 100),
          flexibility: Math.round((flexibility / totalTypes) * 100)
        },
        remainingSessions,
        todayWorkout,
        todayWorkoutStatus,
        showComparison,
        isNewMonth: currentDay === 1 && totalSessions === 0
      });
      
      // 写入缓存（使用函数式更新后的值）
      setCache(CACHE_KEYS.DASHBOARD, {
        totalSessions,
        completedPlans,
        totalCalories,
        streakDays,
        lastMonthSessions,
        lastMonthPlans: lastMonthCompletedPlans,
        lastMonthCalories,
        recentWorkouts,
        goals: {
          training: { current: totalSessions, target: trainingTarget, completionRate: trainingTarget > 0 ? Math.min(100, Math.round((totalSessions / trainingTarget) * 100)) : 0 },
          calories: { current: totalCalories, target: calorieTarget, completionRate: calorieTarget > 0 ? Math.min(100, Math.round((totalCalories / calorieTarget) * 100)) : 0 }
        },
        trainingTypeDistribution: { strength: Math.round((strength / totalTypes) * 100), cardio: Math.round((cardio / totalTypes) * 100), flexibility: Math.round((flexibility / totalTypes) * 100) },
        remainingSessions,
        todayWorkout,
        todayWorkoutStatus,
        showComparison,
        isNewMonth: currentDay === 1 && totalSessions === 0
      });
      
    } catch (error) {
      console.error('加载仪表盘数据失败:', error);
    }
  };

  // 使用 useGoalManagement hook 封装目标管理逻辑
  const {
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
    resetGoalForm,
    openEditGoal,
  } = useGoalManagement(loadDashboardData);

  // 当切换到仪表盘时加载数据
  useEffect(() => {
    if (activeMenu === 'dashboard') {
      loadDashboardData();
    }
  }, [activeMenu]);

  // 加载数据分析数据 - 修复版：严格自然月切割 + 有效训练校验
  const loadAnalysisData = async () => {
    setAnalysisLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // 并行获取所有需要的数据
      const [diariesRes, bodyRes, goalsRes] = await Promise.all([
        fetch('/api/diaries', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/body-measurements', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/goals', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      const diariesData = diariesRes.ok ? await diariesRes.json() : { diaries: [] };
      const bodyData = bodyRes.ok ? await bodyRes.json() : { measurements: [] };
      const goalsData = goalsRes.ok ? await goalsRes.json() : { goals: [] };
      
      // ==================== 严格自然月/自然周时间范围计算 ====================
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-11
      
      // 本月严格范围：当月1日 00:00:00 到 当月最后一日 23:59:59
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
      lastDayOfMonth.setHours(23, 59, 59, 999);
      
      // 上月严格范围
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const firstDayOfLastMonth = new Date(lastMonthYear, lastMonth, 1);
      firstDayOfLastMonth.setHours(0, 0, 0, 0);
      const lastDayOfLastMonth = new Date(lastMonthYear, lastMonth + 1, 0);
      lastDayOfLastMonth.setHours(23, 59, 59, 999);
      
      // 本周严格范围（周一开始）
      const dayOfWeek = now.getDay(); // 0=周日, 1=周一
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(now.getDate() - daysFromMonday);
      firstDayOfWeek.setHours(0, 0, 0, 0);
      const lastDayOfWeek = new Date(firstDayOfWeek);
      lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
      lastDayOfWeek.setHours(23, 59, 59, 999);
      
      // 上周严格范围
      const firstDayOfLastWeek = new Date(firstDayOfWeek);
      firstDayOfLastWeek.setDate(firstDayOfWeek.getDate() - 7);
      const lastDayOfLastWeek = new Date(firstDayOfWeek);
      lastDayOfLastWeek.setDate(firstDayOfWeek.getDate() - 1);
      lastDayOfLastWeek.setHours(23, 59, 59, 999);
      
      // ==================== 有效训练校验函数 ====================
      const isValidTraining = (d) => {
        return d.content && d.content.trim().length > 0;
      };
      
      // ==================== 严格筛选本月有效训练 ====================
      const allDiaries = diariesData.diaries || [];
      
      // 本月有效训练：日期在本月范围内 且 是有效训练
      const thisMonthValidDiaries = allDiaries.filter(d => {
        const diaryDate = new Date(d.date);
        return diaryDate >= firstDayOfMonth && 
               diaryDate <= lastDayOfMonth && 
               isValidTraining(d);
      });
      
      // 上月有效训练
      const lastMonthValidDiaries = allDiaries.filter(d => {
        const diaryDate = new Date(d.date);
        return diaryDate >= firstDayOfLastMonth && 
               diaryDate <= lastDayOfLastMonth && 
               isValidTraining(d);
      });
      
      // 本周有效训练
      const thisWeekValidDiaries = allDiaries.filter(d => {
        const diaryDate = new Date(d.date);
        return diaryDate >= firstDayOfWeek && 
               diaryDate <= lastDayOfWeek && 
               isValidTraining(d);
      });
      
      // 上周有效训练
      const lastWeekValidDiaries = allDiaries.filter(d => {
        const diaryDate = new Date(d.date);
        return diaryDate >= firstDayOfLastWeek && 
               diaryDate <= lastDayOfLastWeek && 
               isValidTraining(d);
      });
      
      // ==================== 计算本月训练统计（仅基于有效训练） ====================
      const thisMonthSessions = thisMonthValidDiaries.length;
      const lastMonthSessions = lastMonthValidDiaries.length;
      const thisMonthDuration = thisMonthValidDiaries.reduce((sum, d) => sum + (parseInt(d.duration) || 0), 0);
      const lastMonthDuration = lastMonthValidDiaries.reduce((sum, d) => sum + (parseInt(d.duration) || 0), 0);
      const avgDuration = thisMonthSessions > 0 ? Math.round(thisMonthDuration / thisMonthSessions) : 0;
      
      // ==================== 环比逻辑修复 ====================
      // 仅当本月进度>=70% 或 月末最后3天，才展示全月环比
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const currentDay = now.getDate();
      const isLast3DaysOfMonth = currentDay >= daysInMonth - 2;
      const monthProgress = daysInMonth > 0 ? (currentDay / daysInMonth) * 100 : 0;
      const showMonthComparison = monthProgress >= 70 || isLast3DaysOfMonth;
      
      // 计算环比变化（仅当需要展示时）
      let sessionsChange = 0;
      let durationChange = 0;
      
      if (showMonthComparison) {
        sessionsChange = lastMonthSessions > 0 
          ? parseFloat((((thisMonthSessions - lastMonthSessions) / lastMonthSessions) * 100).toFixed(1))
          : (thisMonthSessions > 0 ? 100 : 0);
        durationChange = lastMonthDuration > 0
          ? parseFloat((((thisMonthDuration - lastMonthDuration) / lastMonthDuration) * 100).toFixed(1))
          : (thisMonthDuration > 0 ? 100 : 0);
      }
      
      // ==================== 计算身体数据 ====================
      const measurements = bodyData.measurements || [];
      const latestMeasurement = measurements.length > 0 
        ? measurements.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        : null;
      
      // 上月身体数据：取上月范围内的最新记录
      const lastMonthMeasurements = measurements.filter(m => {
        const mDate = new Date(m.date);
        return mDate >= firstDayOfLastMonth && mDate <= lastDayOfLastMonth;
      }).sort((a, b) => new Date(b.date) - new Date(a.date));
      
      const lastMonthMeasurement = lastMonthMeasurements.length > 0 ? lastMonthMeasurements[0] : null;
      
      // 身体数据环比：无上月对比时隐藏
      const hasBodyComparison = lastMonthMeasurement !== null;
      
      // ==================== 计算热量消耗（仅基于有效训练） ====================
      const thisMonthCalories = thisMonthValidDiaries.reduce((sum, d) => sum + (parseInt(d.calories) || 0), 0);
      const lastMonthCalories = lastMonthValidDiaries.reduce((sum, d) => sum + (parseInt(d.calories) || 0), 0);
      const dailyAvgCalories = currentDay > 0 ? Math.round(thisMonthCalories / currentDay) : 0;
      
      // 获取热量目标
      const calorieGoal = (goalsData.goals || []).find(g => g.type === 'calorie');
      const targetCalories = calorieGoal ? calorieGoal.target_value : 0;
      const completionRate = targetCalories > 0 ? Math.min(100, Math.round((thisMonthCalories / targetCalories) * 100)) : 0;
      
      // 热量环比（仅当需要展示时）
      let burnedChange = 0;
      if (showMonthComparison) {
        burnedChange = lastMonthCalories > 0 
          ? parseFloat((((thisMonthCalories - lastMonthCalories) / lastMonthCalories) * 100).toFixed(1))
          : (thisMonthCalories > 0 ? 100 : 0);
      }
      
      // ==================== 计算训练达成（仅基于有效训练） ====================
      const trainingGoal = (goalsData.goals || []).find(g => g.type === 'training');
      const goalCompletionRate = trainingGoal && trainingGoal.target_value > 0
        ? Math.min(100, Math.round((thisMonthSessions / trainingGoal.target_value) * 100))
        : 0;
      
      // ==================== 计算连续训练天数（仅基于有效训练） ====================
      // 只考虑本月的有效训练来计算连续天数
      const sortedValidDiaries = thisMonthValidDiaries.sort((a, b) => new Date(b.date) - new Date(a.date));
      let streakDays = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // 检查今天或昨天是否有训练
      const hasTrainingToday = sortedValidDiaries.some(d => {
        const dDate = new Date(d.date);
        dDate.setHours(0, 0, 0, 0);
        return dDate.getTime() === today.getTime();
      });
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const hasTrainingYesterday = sortedValidDiaries.some(d => {
        const dDate = new Date(d.date);
        dDate.setHours(0, 0, 0, 0);
        return dDate.getTime() === yesterday.getTime();
      });
      
      // 如果今天或昨天有训练，开始计算连续天数
      if (hasTrainingToday || hasTrainingYesterday) {
        const startDate = hasTrainingToday ? today : yesterday;
        streakDays = 1;
        
        // 向前检查连续天数
        for (let i = 1; i <= 365; i++) {
          const checkDate = new Date(startDate);
          checkDate.setDate(checkDate.getDate() - i);
          
          const hasTraining = thisMonthValidDiaries.some(d => {
            const dDate = new Date(d.date);
            dDate.setHours(0, 0, 0, 0);
            return dDate.getTime() === checkDate.getTime();
          });
          
          if (hasTraining) {
            streakDays++;
          } else {
            break;
          }
        }
      }
      
      // ==================== 计算打卡率（仅基于有效训练） ====================
      const passedDays = currentDay; // 本月已过去的天数
      const checkInRate = passedDays > 0 ? Math.round((thisMonthSessions / passedDays) * 100) : 0;
      
      // ==================== 计算周训练频率（仅基于本月有效训练） ====================
      const weeklyFrequency = [0, 0, 0, 0, 0, 0, 0]; // 周一到周日
      thisMonthValidDiaries.forEach(d => {
        const date = new Date(d.date);
        const dayOfWeek = date.getDay(); // 0=周日, 1=周一
        const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 转换为 0-6（周一到周日）
        weeklyFrequency[index]++;
      });
      
      // ==================== 计算身体数据趋势（近30天） ====================
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      const bodyTrend = measurements
        .filter(m => {
          const mDate = new Date(m.date);
          return mDate >= thirtyDaysAgo;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(m => ({
          date: m.date,
          weight: m.weight,
          bodyFat: m.body_fat,
          muscleMass: m.muscle_mass
        }));
      
      // ==================== 计算热量消耗趋势（近30天，仅有效训练） ====================
      const caloriesTrend = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        
        // 只统计本月内的热量
        if (date >= firstDayOfMonth && date <= lastDayOfMonth) {
          const dayCalories = thisMonthValidDiaries
            .filter(d => d.date.startsWith(dateStr))
            .reduce((sum, d) => sum + (parseInt(d.calories) || 0), 0);
          caloriesTrend.push({
            date: dateStr,
            calories: dayCalories
          });
        } else {
          caloriesTrend.push({
            date: dateStr,
            calories: 0
          });
        }
      }
      
      // ==================== 计算训练类型分布（仅基于本月有效训练） ====================
      let strength = 0, cardio = 0, flexibility = 0;
      thisMonthValidDiaries.forEach(d => {
        const content = (d.content || '').toLowerCase();
        const tags = (d.tags || '').toLowerCase();
        const text = content + ' ' + tags;
        
        if (text.includes('力量') || text.includes('增肌') || text.includes('卧推') || 
            text.includes('深蹲') || text.includes('硬拉') || text.includes('哑铃')) {
          strength++;
        } else if (text.includes('有氧') || text.includes('跑步') || text.includes('骑行') || 
                   text.includes('游泳') || text.includes('hiit')) {
          cardio++;
        } else if (text.includes('瑜伽') || text.includes('拉伸') || text.includes('柔韧')) {
          flexibility++;
        } else {
          // 默认归类为力量训练
          strength++;
        }
      });
      
      const totalTypes = strength + cardio + flexibility;
      const hasTrainingTypeData = totalTypes > 0;
      
      // ==================== 生成智能建议（仅基于本月有效训练） ====================
      let smartSuggestions = [];
      
      if (thisMonthSessions === 0) {
        // 无有效数据时显示引导
        smartSuggestions = [{
          type: 'empty',
          icon: 'info',
          title: '本月暂无训练',
          content: '完成训练后获取专属建议💪'
        }];
      } else {
        // 基于有效数据生成建议
        if (cardio / totalTypes < 0.3) {
          smartSuggestions.push({
            type: 'cardio',
            icon: 'check',
            title: '增加有氧训练',
            content: '当前有氧训练占比较低，建议每周增加2-3次有氧训练，提升心肺功能和减脂效率'
          });
        }
        
        if (streakDays >= 7) {
          smartSuggestions.push({
            type: 'streak',
            icon: 'trophy',
            title: '连续训练优秀',
            content: `太棒了！已连续训练${streakDays}天，保持这个节奏，效果会越来越好`
          });
        }
        
        if (completionRate < 50 && targetCalories > 0) {
          smartSuggestions.push({
            type: 'intensity',
            icon: 'fire',
            title: '提升训练强度',
            content: '热量消耗目标完成率较低，建议延长单次训练时长或增加训练频率'
          });
        }
        
        if (avgDuration < 30) {
          smartSuggestions.push({
            type: 'duration',
            icon: 'clock',
            title: '延长训练时长',
            content: `当前平均训练时长${avgDuration}分钟，建议逐步延长至45-60分钟以获得更好效果`
          });
        }
      }
      
      // ==================== 设置分析数据 ====================
      setAnalysisData({
        training: {
          totalSessions: thisMonthSessions,
          totalDuration: thisMonthDuration,
          avgDuration,
          lastMonthSessions,
          lastMonthDuration,
          sessionsChange,
          durationChange,
          showComparison: showMonthComparison // 新增：是否展示环比
        },
        body: {
          currentWeight: latestMeasurement?.weight || 0,
          currentBodyFat: latestMeasurement?.body_fat || 0,
          currentMuscleMass: latestMeasurement?.muscle_mass || 0,
          lastMonthWeight: lastMonthMeasurement?.weight || 0,
          lastMonthBodyFat: lastMonthMeasurement?.body_fat || 0,
          lastMonthMuscleMass: lastMonthMeasurement?.muscle_mass || 0,
          weightChange: latestMeasurement && lastMonthMeasurement 
            ? parseFloat((latestMeasurement.weight - lastMonthMeasurement.weight).toFixed(1))
            : 0,
          bodyFatChange: latestMeasurement && lastMonthMeasurement
            ? parseFloat((latestMeasurement.body_fat - lastMonthMeasurement.body_fat).toFixed(1))
            : 0,
          muscleMassChange: latestMeasurement && lastMonthMeasurement
            ? parseFloat((latestMeasurement.muscle_mass - lastMonthMeasurement.muscle_mass).toFixed(1))
            : 0,
          hasComparison: hasBodyComparison // 新增：是否有上月对比
        },
        calories: {
          totalBurned: thisMonthCalories,
          dailyAvg: dailyAvgCalories,
          targetCalories,
          completionRate,
          lastMonthBurned: lastMonthCalories,
          burnedChange,
          showComparison: showMonthComparison // 新增：是否展示环比
        },
        achievement: {
          goalCompletionRate,
          streakDays,
          checkInRate
        },
        weeklyFrequency,
        bodyTrend,
        caloriesTrend,
        trainingTypeDistribution: {
          strength: hasTrainingTypeData ? Math.round((strength / totalTypes) * 100) : 0,
          cardio: hasTrainingTypeData ? Math.round((cardio / totalTypes) * 100) : 0,
          flexibility: hasTrainingTypeData ? Math.round((flexibility / totalTypes) * 100) : 0,
          hasData: hasTrainingTypeData, // 新增：是否有数据
          counts: { strength, cardio, flexibility } // 新增：原始计数
        },
        smartSuggestions, // 新增：智能建议
        hasValidData: thisMonthSessions > 0 // 新增：是否有有效训练数据
      });
      
    } catch (error) {
      console.error('加载分析数据失败:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // 当切换到数据分析模块时加载数据
  useEffect(() => {
    if (activeMenu === 'analysis') {
      loadAnalysisData();
    }
  }, [activeMenu, analysisTimeFilter]);

  // 无操作超时时间（毫秒）
  const IDLE_TIMEOUT = 10 * 60 * 1000 // 10分钟

  // 更新活动时间
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now())
  }, [])

  // 处理用户活动
  useEffect(() => {
    // 监听用户活动
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      window.addEventListener(event, updateActivity)
    })

    // 清除事件监听器
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity)
      })
    }
  }, [updateActivity])

  // 检查超时
  useEffect(() => {
    const checkTimeout = setInterval(() => {
      if (Date.now() - lastActivity > IDLE_TIMEOUT) {
        // 超时，执行退出登录
        message.warning('无操作时间过长，已自动退出登录')
        dispatch(logoutUser())
        navigate('/login')
      }
    }, 1000) // 每秒检查一次

    return () => clearInterval(checkTimeout)
  }, [lastActivity, IDLE_TIMEOUT, dispatch, navigate])

  // 处理发送消息
  // 清空对话
  const handleClearChat = async () => {
    try {
      // 清空后端的聊天消息
      await fetch('/api/chat/messages', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const initialMessage = [
        {
          id: 1,
          role: 'assistant',
          content: '你好！我是你的AI健身助手，有什么可以帮助你的吗？',
          timestamp: new Date().toLocaleTimeString()
        }
      ];
      setMessages(initialMessage);
    } catch (error) {
      console.error('清空聊天消息失败:', error);
      message.error('清空聊天消息失败');
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    }
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('')
    setIsLoading(true)
    setAiProgress(0)
    setAiStatus('正在处理您的请求...')

    // 保存用户消息到后端
    await fetch('/api/chat/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        role: 'user',
        content: inputValue
      })
    });

    // 生成临时AI消息ID
    const aiMessageId = Date.now();
    const tempMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString(),
      isStreaming: true
    };
    
    // 添加临时消息用于流式输出
    const messagesWithTemp = [...updatedMessages, tempMessage];
    setMessages(messagesWithTemp);

    // 动态进度更新（持续到接收到流式数据）
    let progressValue = 0;
    let statusIndex = 0;
    const statusMessages = [
      '正在理解您的问题...',
      '正在分析最佳方案...',
      '正在生成专业建议...',
      '正在整理详细计划...',
      '正在优化训练方案...',
      '几乎完成了...'
    ];
    
    const progressInterval = setInterval(() => {
      progressValue += 1; // 更慢的进度条速度
      if (progressValue > 95) {
        progressValue = 95; // 停留在95%等待真实数据
      }
      setAiProgress(progressValue);
      
      // 动态更新状态文本
      const newStatusIndex = Math.min(Math.floor(progressValue / 16), statusMessages.length - 1);
      if (newStatusIndex !== statusIndex) {
        statusIndex = newStatusIndex;
        setAiStatus(statusMessages[statusIndex]);
      }
      
      // 当进度超过80%时，显示等待API响应的状态
      if (progressValue > 80) {
        setAiStatus('正在等待AI响应...');
      }
    }, 300); // 更慢的更新频率，让进度条更符合实际等待时间

    try {
      // 集成真实的豆包API（流式响应）
      const API_KEY = '632fa856-8daa-4e30-991c-d1b76e56f1e7'; // 用户提供的API密钥
      const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
      
      // 构建完整的消息列表，包括系统消息、历史消息和当前用户消息
      const fullMessages = [
        {
          role: 'system',
          content: '你是我的专属健身搭子，拥有专业健身教练资质，精通科学训练、营养搭配、体态纠正和运动恢复。说话风格像身边靠谱的朋友，轻松、接地气、不死板、不生硬；既有专业度，又会适时鼓励我、鞭策我坚持，不打击、不PUA。根据我的身高、体重、目标（增肌 / 减脂 / 塑形）、训练条件，给出科学、安全、可执行的计划；回答简洁实用，不堆砌专业术语。'
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: inputValue
        }
      ];
      
      // 发送流式请求
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'doubao-seed-1-8-251228', // 豆包模型ID
          messages: fullMessages,
          temperature: 0.7,
          max_tokens: 2000, // 增加token限制，避免内容被截断
          stream: true, // 启用流式响应
          stream_options: { include_usage: false } // 优化流式响应
        })
      });

      if (!response.ok) {
        throw new Error('API请求失败');
      }

      // 清除进度更新
      clearInterval(progressInterval);
      // 快速完成进度条
      setAiProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setAiProgress(0);
        setAiStatus('');
      }, 300); // 短暂延迟让用户看到进度完成

      // 处理SSE流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      let fullResponse = '';
      let isFirstChunk = true;
      let lastUpdateTime = 0;
      const MIN_UPDATE_INTERVAL = 50; // 最小更新间隔，避免过于频繁的DOM更新

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 解码响应数据
        const chunk = new TextDecoder('utf-8').decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6).trim();
            if (data === '[DONE]') {
              break;
            }

            try {
              const json = JSON.parse(data);
              if (json.choices && json.choices[0] && json.choices[0].delta) {
                const delta = json.choices[0].delta;
                if (delta.content) {
                  // 第一次接收到内容时，确保加载状态已隐藏
                  if (isFirstChunk) {
                    isFirstChunk = false;
                    // 确保加载状态完全清除
                    setIsLoading(false);
                    setAiProgress(0);
                    setAiStatus('');
                  }

                  // 累加响应内容
                  fullResponse += delta.content;

                  // 控制更新频率，避免过多的DOM操作
                  const now = Date.now();
                  if (now - lastUpdateTime > MIN_UPDATE_INTERVAL) {
                    // 更新临时消息内容
                    setMessages(prev => prev.map(msg => 
                      msg.id === aiMessageId ? { ...msg, content: fullResponse } : msg
                    ));
                    lastUpdateTime = now;
                  }
                }
              }
            } catch (error) {
              console.error('解析SSE数据失败:', error);
            }
          }
        }
      }

      // 确保最后一次更新被渲染
      if (fullResponse) {
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId ? { ...msg, content: fullResponse } : msg
        ));
      }

      // 流式结束，保存完整响应到后端
      if (fullResponse) {
        const aiMessageResponse = await fetch('/api/chat/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            role: 'assistant',
            content: fullResponse
          })
        });

        // 移除临时消息的isStreaming标记
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg
        ));
      }
    } catch (error) {
      console.error('Error calling AI API:', error)
      // 添加详细的错误消息
      let errorContent = '抱歉，我暂时无法回答你的问题，请稍后再试。';
      if (error instanceof Error) {
        errorContent = `抱歉，API调用失败：${error.message}`;
      }
      
      // 保存错误消息到后端
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          role: 'assistant',
          content: errorContent
        })
      });

      // 更新临时消息为错误消息
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId ? { ...msg, content: errorContent, isStreaming: false } : msg
      ));
      
      // 清除状态
      clearInterval(progressInterval);
      setIsLoading(false);
      setAiProgress(0);
      setAiStatus('');
    }
  }

  return (
    <div className="h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/GG.jpg')`,
        }}
      />
      <div className="bg-black/30 absolute inset-0" />

      <div className="relative z-10 p-6 grid grid-cols-12 gap-6 h-screen">
        {/* Custom scrollbar styles */}
        <style>{`
          /* Custom scrollbar styles */
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
          
          /* Firefox scrollbar */
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
          }
          
          /* Delete Button Styles */
          .delete-button {
            background: rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: white !important;
            border-radius: 8px !important;
            padding: 2px 8px !important;
            transition: all 0.3s ease !important;
          }
          
          .delete-button:hover {
            background: rgba(255, 0, 0, 0.2) !important;
            color: rgba(255, 255, 255, 0.9) !important;
            border-color: rgba(255, 0, 0, 0.3) !important;
          }
          
          /* Custom Select Dropdown Styles */
          .ant-select-dropdown {
            background-color: rgba(255, 255, 255, 0.15) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            border-radius: 12px !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
          }
          
          .ant-select-dropdown .ant-select-item {
            color: white !important;
            background: transparent !important;
            transition: all 0.2s ease !important;
          }
          
          .ant-select-dropdown .ant-select-item:hover {
            background-color: rgba(255, 255, 255, 0.2) !important;
          }
          
          .ant-select-dropdown .ant-select-item-option-selected {
            background-color: rgba(255, 255, 255, 0.25) !important;
            font-weight: 600 !important;
          }
          
          /* Password Input Styles */
          .custom-password-input input {
            background-color: transparent !important;
            color: white !important;
            box-shadow: none !important;
          }
          
          .custom-password-input input:-webkit-autofill,
          .custom-password-input input:-webkit-autofill:hover,
          .custom-password-input input:-webkit-autofill:focus,
          .custom-password-input input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px rgba(255, 255, 255, 0.05) inset !important;
            -webkit-text-fill-color: white !important;
            transition: background-color 5000s ease-in-out 0s !important;
          }
          
          /* Select Input Styles */
          .ant-select-selector {
            background-color: rgba(255, 255, 255, 0.05) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
            color: white !important;
          }
          
          .ant-select-selection-placeholder {
            color: rgba(255, 255, 255, 0.4) !important;
          }
          
          .ant-select-selection-item {
            color: white !important;
          }
          
          .ant-select-arrow {
            color: rgba(255, 255, 255, 0.6) !important;
          }
          
          /* Date Picker Styles */
          .ant-picker {
            background-color: rgba(255, 255, 255, 0.05) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
            color: white !important;
          }
          
          .ant-picker-input > input {
            color: white !important;
          }
          
          .ant-picker-suffix {
            color: rgba(255, 255, 255, 0.6) !important;
          }
          
          .ant-picker-dropdown {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }
          
          .ant-picker-panel {
            background: transparent !important;
          }
          
          .ant-picker-header {
            color: white !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
          }
          
          .ant-picker-header button {
            color: rgba(255, 255, 255, 0.8) !important;
          }
          
          .ant-picker-content th {
            color: rgba(255, 255, 255, 0.8) !important;
          }
          
          .ant-picker-cell {
            color: rgba(255, 255, 255, 0.6) !important;
          }
          
          .ant-picker-cell-in-view {
            color: white !important;
          }
          
          .ant-picker-cell:hover .ant-picker-cell-inner {
            background-color: rgba(255, 255, 255, 0.2) !important;
          }
          
          .ant-picker-cell-selected .ant-picker-cell-inner {
            background-color: rgba(255, 255, 255, 0.3) !important;
            color: white !important;
          }
          
          .ant-picker-cell-today .ant-picker-cell-inner::before {
            border-color: rgba(255, 255, 255, 0.5) !important;
          }
          
          /* DatePicker Dropdown Panel Content */
          .ant-picker-dropdown .ant-picker-panel-container {
            background: rgba(255, 255, 255, 0.15) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            border-radius: 12px !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
          }
          
          .ant-picker-dropdown .ant-picker-panel {
            background: transparent !important;
          }
          
          .ant-picker-dropdown .ant-picker-date-panel,
          .ant-picker-dropdown .ant-picker-month-panel,
          .ant-picker-dropdown .ant-picker-year-panel {
            background: transparent !important;
          }
          
          .ant-picker-dropdown .ant-picker-body {
            background: transparent !important;
          }
          
          .ant-picker-dropdown .ant-picker-content {
            background: transparent !important;
          }
          
          .ant-picker-dropdown .ant-picker-cell-inner {
            color: white !important;
          }
          
          .ant-picker-dropdown .ant-picker-cell-disabled .ant-picker-cell-inner {
            color: rgba(255, 255, 255, 0.3) !important;
          }
          
          .ant-picker-dropdown .ant-picker-footer {
            background: transparent !important;
            border-top: 1px solid rgba(255, 255, 255, 0.2) !important;
          }
          
          .ant-picker-dropdown .ant-picker-today-btn {
            color: rgba(255, 255, 255, 0.8) !important;
          }
          
          .ant-picker-dropdown .ant-picker-today-btn:hover {
            color: white !important;
          }
          
          /* Native Date Input Styles */
          input[type="date"] {
            background-color: rgba(255, 255, 255, 0.05) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
            color: white !important;
          }
          
          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(1) !important;
            opacity: 0.6 !important;
            cursor: pointer !important;
          }
          
          input[type="date"]::-webkit-calendar-picker-indicator:hover {
            opacity: 1 !important;
          }
          
          /* Custom DatePicker Styles */
          .custom-datepicker {
            background-color: rgba(255, 255, 255, 0.05) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
          }
          
          .custom-datepicker .ant-picker-input {
            padding-right: 30px !important;
          }
          
          .custom-datepicker .ant-picker-input > input {
            color: white !important;
          }
          
          .custom-datepicker .ant-picker-suffix {
            color: rgba(255, 255, 255, 0.6) !important;
            position: absolute !important;
            right: 8px !important;
          }
          
          .custom-datepicker .ant-picker-clear {
            color: rgba(255, 255, 255, 0.6) !important;
            background: transparent !important;
            position: absolute !important;
            right: 28px !important;
          }
          
          .custom-datepicker .ant-picker-clear:hover {
            color: white !important;
          }
          
          .custom-datepicker.ant-picker-focused {
            border-color: rgba(255, 255, 255, 0.4) !important;
            background-color: rgba(255, 255, 255, 0.1) !important;
          }
          
          .custom-datepicker:hover {
            border-color: rgba(255, 255, 255, 0.3) !important;
            background-color: rgba(255, 255, 255, 0.08) !important;
          }
        `}</style>
        {/* Left Sidebar Card */}
        <Card className="col-span-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 pb-6 max-h-[calc(100vh-4rem)] overflow-y-auto flex flex-col custom-scrollbar">
          <div className="space-y-6">
            {/* Logo */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">你的健身搭子</h1>
              <p className="text-white/60 text-sm">专业健身管理</p>
            </div>

            {/* Main Navigation */}
            <div>
              <h4 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-3">主菜单</h4>
              <nav className="space-y-2">
                {/* Dashboard Button */}
                <Button

                  className={`w-full justify-start text-base text-white/80 hover:bg-white/20 hover:text-white transition-all duration-700 ease-out hover:scale-[1.02] h-11 border border-white/20 ${
                    activeMenu === 'dashboard' ? 'bg-white/20 text-white' : 'bg-white/10'
                  }`}
                  onClick={() => {
                    setActiveMenu('dashboard');
                    setActiveSubMenu('');
                  }}
                >
                  <UserOutlined className="mr-3 h-5 w-5" />
                  首页
                </Button>
                
                {/* AI Assistant Button */}
                <Button
  
                    className={`w-full justify-start text-base text-white/80 hover:bg-white/20 hover:text-white transition-all duration-700 ease-out hover:scale-[1.02] h-11 border border-white/20 ${
                      activeMenu === 'ai-assistant' ? 'bg-white/20 text-white' : 'bg-white/10'
                    }`}
                    onClick={() => {
                      setActiveMenu('ai-assistant');
                      setActiveSubMenu('');
                    }}
                  >
                    <MessageOutlined className="mr-3 h-5 w-5" />
                    健身助手
                  </Button>
              </nav>
            </div>

            {/* Fitness Tools */}
            <div>
              <h4 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-3">健身工具</h4>
              <nav className="space-y-2">
                {
                  [
                    { icon: FileTextOutlined, label: "训练记录", key: "training-records" },
                    { icon: AppstoreOutlined, label: "训练动作", key: "training-exercises" },
                    { icon: DatabaseOutlined, label: "视频教学", key: "video-library" },
                    { icon: FileTextOutlined, label: "训练日记", key: "community" },
                    { icon: FireOutlined, label: "饮食计划", key: "fatloss-plan" },
                    { icon: ThunderboltOutlined, label: "训练计划", key: "tanchengyi" },
                  ].map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <Button
                        key={index}
      
                        className={`w-full justify-start text-base text-white/80 hover:bg-white/20 hover:text-white transition-all duration-700 ease-out hover:scale-[1.02] h-11 border border-white/20 ${activeSubMenu === item.key ? 'bg-white/20 text-white' : 'bg-white/10'}`}
                        onClick={() => {
                          setActiveSubMenu(item.key);
                          setActiveMenu('');
                        }}
                      >
                        <IconComponent className="mr-3 h-5 w-5" />
                        {item.label}
                      </Button>
                    );
                  })
                }
              </nav>
            </div>

            {/* Administration */}
            <div>
              <h4 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-3">设置</h4>
              <nav className="space-y-2">
                {
                  [
                    { icon: SettingOutlined, label: "个人设置", key: "profile" },
                  ].map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <Button
                        key={index}
      
                        className={`w-full justify-start text-base text-white/80 hover:bg-white/20 hover:text-white transition-all duration-700 ease-out hover:scale-[1.02] h-11 border border-white/20 ${activeSubMenu === item.key ? 'bg-white/20 text-white' : 'bg-white/10'}`}
                        onClick={() => {
                          setActiveSubMenu(item.key);
                          setActiveMenu('');
                        }}
                      >
                        <IconComponent className="mr-3 h-5 w-5" />
                        {item.label}
                      </Button>
                    );
                  })
                }
              </nav>
            </div>
          </div>

          <div className="flex-shrink-0 space-y-4 pt-4 border-t border-white/10">
            <div className="space-y-2">
              <Button
                variant="text"
                className="w-full justify-start text-base text-white/80 hover:bg-white/20 hover:text-white transition-all duration-700 ease-out hover:scale-[1.02] h-11 bg-white/10 border border-white/20"
                onClick={() => {
                  dispatch(logoutUser())
                  navigate('/login')
                }}
              >
                <LogoutOutlined className="mr-3 h-5 w-5" />
                退出登录
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Content Area */}
        <div className="col-span-10 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
          {/* Dashboard Content */}
          {activeMenu === 'dashboard' && !activeSubMenu && (
            <>
              {/* 顶部核心数据概览区 - 4张身体数据卡片 */}
              <div className="grid grid-cols-4 gap-4">
                {/* 体重记录卡 */}
                <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-4 hover:bg-white/15 active:bg-white/10 transition-all duration-300 flex flex-col" style={{ height: '280px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-white/80 text-sm font-medium">当前体重</span>
                      <span className="text-xl font-bold text-white" style={{ width: '80px' }}>{bodyDataStats.latest?.weight ? `${bodyDataStats.latest.weight}kg` : '未记录'}</span>
                    </div>
                    <Button size="small" className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 text-xs px-2 py-0 h-6" onClick={() => {
                      setWeightForm({ date: new Date().toISOString().split('T')[0], weight: bodyDataStats.latest?.weight?.toString() || '' });
                      setShowWeightModal(true);
                    }}>+ 记录</Button>
                  </div>
                  <div className="mt-3" style={{ height: '190px' }}>
                    <div ref={miniWeightChartRef} style={{ width: '100%', height: '100%' }}></div>
                  </div>
                </Card>

                {/* 体脂率卡 */}
                <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-4 hover:bg-white/15 active:bg-white/10 transition-all duration-300 flex flex-col" style={{ height: '280px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-white/80 text-sm font-medium">体脂率</span>
                      <span className="text-xl font-bold text-white" style={{ width: '80px' }}>{bodyDataStats.latest?.bodyFat ? `${bodyDataStats.latest.bodyFat}%` : '未记录'}</span>
                    </div>
                    <Button size="small" className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 text-xs px-2 py-0 h-6" onClick={() => {
                      setBodyFatForm({ date: new Date().toISOString().split('T')[0], bodyFat: bodyDataStats.latest?.bodyFat?.toString() || '' });
                      setShowBodyFatModal(true);
                    }}>+ 记录</Button>
                  </div>
                  <div className="mt-3 flex items-center justify-center" style={{ height: '190px' }}>
                    <div ref={miniBodyFatChartRef} style={{ width: '100%', height: '100%' }}></div>
                  </div>
                </Card>

                {/* 四围数据卡 */}
                <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-4 hover:bg-white/15 active:bg-white/10 transition-all duration-300 flex flex-col" style={{ height: '280px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-white/80 text-sm font-medium">四围数据</span>
                    </div>
                    <Button size="small" className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 text-xs px-2 py-0 h-6" onClick={() => {
                      setCircumferenceForm({ date: new Date().toISOString().split('T')[0], chest: bodyDataStats.latest?.chest?.toString() || '', waist: bodyDataStats.latest?.waist?.toString() || '', hips: bodyDataStats.latest?.hips?.toString() || '', biceps: bodyDataStats.latest?.biceps?.toString() || '' });
                      setShowCircumferenceModal(true);
                    }}>+ 记录</Button>
                  </div>
                  <div className="mt-3" style={{ height: '190px' }}>
                    <div ref={miniMuscleChartRef} style={{ width: '100%', height: '100%' }}></div>
                  </div>
                </Card>

                {/* BMI 卡 */}
                <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-4 hover:bg-white/15 active:bg-white/10 transition-all duration-300 flex flex-col" style={{ height: '280px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-white/80 text-sm font-medium">BMI</span>
                      <span className="text-xl font-bold text-white" style={{ width: '80px' }}>{bodyDataStats.bmi ? bodyDataStats.bmi.toFixed(1) : '未计算'}</span>
                    </div>
                    <Button size="small" className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 text-xs px-2 py-0 h-6" onClick={() => {
                      setBmiForm({ date: new Date().toISOString().split('T')[0], weight: bodyDataStats.latest?.weight?.toString() || '' });
                      setShowBmiModal(true);
                    }}>+ 记录</Button>
                  </div>
                  <div className="mt-3 flex items-center justify-center" style={{ height: '190px' }}>
                    <div ref={miniBmiChartRef} style={{ width: '100%', height: '100%' }}></div>
                  </div>
                </Card>
              </div>

              {/* 左侧训练日历 + 右侧健身目标 */}
              <div className="grid grid-cols-4 gap-4">
                {/* 训练日历 - 占 3 份 */}
                <div className="col-span-3">
                  <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-4 active:bg-white/10">
                    {/* 标题和年月选择器 */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">训练日历</h3>
                      <div className="flex items-center space-x-2">
                        <Select value={calendarView.year} onChange={(value) => setCalendarView({ ...calendarView, year: value })} className="w-24" size="small" bordered={false} dropdownStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.2)' }}>
                          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                            <Select.Option key={y} value={y} className="text-white">{y}年</Select.Option>
                          ))}
                        </Select>
                        <Select value={calendarView.month} onChange={(value) => setCalendarView({ ...calendarView, month: value })} className="w-16" size="small" bordered={false} dropdownStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.2)' }}>
                          {Array.from({ length: 12 }, (_, i) => i).map(m => (
                            <Select.Option key={m} value={m} className="text-white">{m + 1}月</Select.Option>
                          ))}
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <Button size="small" className="text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border-none" onClick={() => {
                        const newMonth = calendarView.month - 1;
                        if (newMonth < 0) { setCalendarView({ year: calendarView.year - 1, month: 11 }); } else { setCalendarView({ ...calendarView, month: newMonth }); }
                      }}>← 上月</Button>
                      <span className="text-white font-medium">{calendarView.year}年{calendarView.month + 1}月</span>
                      <div className="flex items-center space-x-2">
                        <Button size="small" className="text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border-none" onClick={() => {
                          const newMonth = calendarView.month + 1;
                          if (newMonth > 11) { setCalendarView({ year: calendarView.year + 1, month: 0 }); } else { setCalendarView({ ...calendarView, month: newMonth }); }
                        }}>下月 →</Button>
                        <Button size="small" className="text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/20 text-xs" onClick={() => {
                          const today = new Date(); setCalendarView({ year: today.getFullYear(), month: today.getMonth() });
                        }}>返回今天</Button>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-xl border border-white/10 p-3">
                      <div className="grid grid-cols-7 gap-0 mb-2">
                        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                          <div key={d} className="text-center text-white/80 text-lg font-semibold py-1">{d}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-[2px]">
                        {(() => {
                          const today = new Date(); const year = calendarView.year; const month = calendarView.month;
                          const firstDay = new Date(year, month, 1); const lastDay = new Date(year, month + 1, 0);
                          const startPadding = firstDay.getDay(); const daysInMonth = lastDay.getDate();
                          const days = [];
                          for (let i = 0; i < startPadding; i++) { days.push(<div key={`empty-${i}`} className="h-20 bg-white/[0.02] border border-white/[0.08] rounded-md"></div>); }
                          for (let day = 1; day <= daysInMonth; day++) {
                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                            const schedule = calendarSchedules.find(s => s.date === dateStr);
                            const parts = schedule ? (schedule as any).body_parts || [] : [];
                            const hasSchedule = parts.length > 0;
                            days.push(
                              <div key={day} className={`h-20 flex flex-col items-center justify-start rounded-md cursor-pointer transition-all duration-200 relative p-1.5 border ${isToday ? 'bg-blue-500/30 text-white ring-2 ring-blue-400/50 border-blue-400/50' : hasSchedule ? 'bg-white/20 text-white hover:bg-white/30 border-white/20' : 'bg-white/[0.03] text-white/50 hover:bg-white/[0.06] border-white/[0.08]'}`} onClick={() => openScheduleModal(dateStr)}>
                                <span className="text-lg font-bold mb-1.5 leading-none">{day}</span>
                                {hasSchedule && (
                                  <div className="flex flex-wrap gap-0.5 justify-center w-full">
                                    {parts.slice(0, 4).map((p: string) => {
                                      const partInfo = BODY_PARTS.find(b => b.key === p);
                                      return partInfo ? <span key={p} className={`text-sm px-2 py-0.5 rounded-md font-semibold border ${partInfo.color}`}>{partInfo.label}</span> : null;
                                    })}
                                    {parts.length > 4 && <span className="text-sm text-white/60 font-medium">+{parts.length - 4}</span>}
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return days;
                        })()}
                      </div>
                    </div>
                  </Card>
                </div>

                {/* 健身目标模块 - 占 1 份 */}
                <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-4 active:bg-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">健身目标</h3>
                    <Button 
                      size="small" 
                      className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20"
                      onClick={async () => {
                        setEditingGoal(null);
                        setGoalForm({
                          type: 'weight',
                          target_value: '',
                          start_value: '',
                          start_date: new Date().toISOString().split('T')[0]
                        });
                        await loadGoals();
                        setShowGoalModal(true);
                      }}
                    >
                      <SettingOutlined className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-5">
                    {/* 体重目标进度 */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80 text-sm">体重目标</span>
                        <span className="text-white font-semibold text-sm">
                          {goals.find(g => g.type === 'weight') ? `${goals.find(g => g.type === 'weight')?.start_value}kg → ${goals.find(g => g.type === 'weight')?.target_value}kg` : '未设置'}
                        </span>
                      </div>
                      {goals.find(g => g.type === 'weight') && (
                        <>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[#4FACFE] to-[#00F2FE] h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, (goals.find(g => g.type === 'weight')?.current_value || 0) / (goals.find(g => g.type === 'weight')?.target_value || 1) * 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#4FACFE]">
                              {Math.round(((goals.find(g => g.type === 'weight')?.start_value - goals.find(g => g.type === 'weight')?.current_value) / (goals.find(g => g.type === 'weight')?.start_value - goals.find(g => g.type === 'weight')?.target_value) || 0) * 100)}% 完成
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* 月度训练目标进度 */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80 text-sm">月度训练目标</span>
                        <span className="text-white font-semibold text-sm">
                          {dashboardData.goals.training.current}/{dashboardData.goals.training.target}次
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#4ECDC4] to-[#6B5CA5] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${dashboardData.goals.training.completionRate}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#4ECDC4]">{dashboardData.goals.training.completionRate}% 完成</span>
                        {dashboardData.goals.training.completionRate >= 100 && (
                          <span className="text-green-400">已完成✅</span>
                        )}
                      </div>
                    </div>

                    {/* 月度热量消耗目标 */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80 text-sm">月度热量消耗</span>
                        <span className="text-white font-semibold text-sm">
                          {dashboardData.goals.calories.current.toLocaleString()}/{dashboardData.goals.calories.target.toLocaleString()}千卡
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#FF9F43] to-[#FF6B6B] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${dashboardData.goals.calories.completionRate}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#FF9F43]">{dashboardData.goals.calories.completionRate}% 完成</span>
                        {dashboardData.goals.calories.completionRate >= 100 && (
                          <span className="text-green-400">已完成✅</span>
                        )}
                      </div>
                    </div>

                    {/* 训练类型分布 - 简化为进度条 */}
                    <div className="space-y-3">
                      <h4 className="text-white font-medium text-sm">训练类型分布</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span className="text-white/80 text-xs">力量训练</span>
                          </div>
                          <span className="text-white text-xs">{dashboardData.trainingTypeDistribution.strength}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${dashboardData.trainingTypeDistribution.strength}%` }}></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-white/80 text-xs">有氧运动</span>
                          </div>
                          <span className="text-white text-xs">{dashboardData.trainingTypeDistribution.cardio}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div className="bg-green-400 h-1.5 rounded-full" style={{ width: `${dashboardData.trainingTypeDistribution.cardio}%` }}></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            <span className="text-white/80 text-xs">柔韧性训练</span>
                          </div>
                          <span className="text-white text-xs">{dashboardData.trainingTypeDistribution.flexibility}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${dashboardData.trainingTypeDistribution.flexibility}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* 快捷数据区 */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-white">{dashboardData.remainingSessions}</p>
                        <p className="text-white/60 text-xs">本月剩余训练次数</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className={`text-lg font-bold ${
                          dashboardData.todayWorkoutStatus === '已完成（有效）' ? 'text-green-400' :
                          dashboardData.todayWorkoutStatus === '无效记录' ? 'text-orange-400' : 'text-white'
                        }`}>
                          {dashboardData.todayWorkoutStatus}
                        </p>
                        <p className="text-white/60 text-xs">今日训练状态</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* Goals Content */}
          {/* AI Assistant Content */}
          {activeMenu === 'ai-assistant' && !activeSubMenu && (
            <>
              <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">与AI健身助手对话</h3>
                  <div className="flex items-center space-x-2">
                    <Button 
     
                      size="small"
                      className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20"
                      onClick={handleClearChat}
                    >
                      清空对话
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Chat Messages */}
                  <div className="h-[600px] bg-white/5 rounded-xl border border-white/10 p-4 overflow-y-auto custom-scrollbar">
                    {messages.map(message => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.role === 'user' ? 'justify-end' : ''} mb-4`}
                      >
                        {message.role === 'assistant' && <div className="mr-3 text-2xl">🤖</div>}
                        <div className={`backdrop-blur-xl ${message.role === 'user' ? 'bg-blue-500/20' : 'bg-white/10'} border border-white/20 rounded-lg p-4 max-w-[80%]`}>
                          <div className="text-white whitespace-pre-wrap break-words">
                            {message.content.split('\n').map((line, index) => {
                              // 清理多余的符号和格式
                              let cleanLine = line
                                .replace(/\*\*/g, '') // 去除**粗体标记
                                .replace(/<br\/>/g, '') // 去除HTML换行
                                .replace(/\|/g, '') // 去除表格分隔符
                                .trim();
                              
                              if (!cleanLine) return null;
                              
                              return (
                                <p key={index} className="mb-2">
                                  {cleanLine.startsWith('#') ? (
                                    <strong className={`block ${cleanLine.startsWith('# ') ? 'text-lg mt-4 mb-2' : cleanLine.startsWith('## ') ? 'text-base mt-3 mb-1' : 'text-sm mt-2 mb-1'}`}>
                                      {cleanLine.replace(/#+/g, '').trim()}
                                    </strong>
                                  ) : cleanLine.startsWith('* ') || cleanLine.startsWith('- ') ? (
                                    <span className="ml-4">• {cleanLine.replace(/[*-] /g, '').trim()}</span>
                                  ) : cleanLine.startsWith('  * ') || cleanLine.startsWith('  - ') ? (
                                    <span className="ml-8">• {cleanLine.replace(/  [*-] /g, '').trim()}</span>
                                  ) : cleanLine}
                                </p>
                              );
                            })}
                          </div>
                          <p className="text-white/40 text-xs mt-2 text-right">{message.timestamp}</p>
                        </div>
                        {message.role === 'user' && (
                          <div className="ml-3">
                            {user?.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt="用户头像" 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">👤</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex mb-4">
                        <div className="mr-3 text-2xl">🤖</div>
                        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-3 max-w-[80%]">
                          <p className="text-white text-sm mb-2">{aiStatus || '正在思考...'}</p>
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div 
                              className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${aiProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Input Area */}
                  <div className="flex space-x-3">
                    <Input
                      placeholder="输入你的健身问题..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputValue.trim()}
                      className="bg-white/20 hover:bg-white/30 border border-white/30 hover:border-white/40 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                    >
                      <SendOutlined className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  {/* Quick Questions */}
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="small" 
     
                      className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20"
                      onClick={() => {
                        setInputValue('如何制定减脂计划？');
                        handleSendMessage();
                      }}
                    >
                      如何制定减脂计划？
                    </Button>
                    <Button 
                      size="small" 
     
                      className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20"
                      onClick={() => {
                        setInputValue('初学者应该如何开始健身？');
                        handleSendMessage();
                      }}
                    >
                      初学者如何开始？
                    </Button>
                    <Button 
                      size="small" 
     
                      className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20"
                      onClick={() => {
                        setInputValue('健身饮食有什么建议？');
                        handleSendMessage();
                      }}
                    >
                      健身饮食建议
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Training Records Content */}
          {activeSubMenu === 'training-records' && (
            <>
              <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">训练记录 📝</h3>
                  <div className="flex space-x-2">
                    <Button 
                      className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                      onClick={() => setShowAddWorkoutModal(true)}
                    >
                      <PlusOutlined className="mr-2 h-4 w-4" />
                      添加训练
                    </Button>
                    <Button 
                      className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                      onClick={exportWorkouts}
                    >
                      <DownloadOutlined className="mr-2 h-4 w-4" />
                      导出记录
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-10">
                    <p className="text-white/80">加载中...</p>
                  </div>
                ) : workouts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <p className="text-white/80 mb-4">还没有训练记录</p>
                    <Button 
                      className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                      onClick={() => setShowAddWorkoutModal(true)}
                    >
                      <PlusOutlined className="mr-2 h-4 w-4" />
                      添加第一条训练记录
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workouts.map((workout, index) => (
                      <div
                        key={workout.id}
                        className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                        onClick={() => viewWorkout(workout)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-white text-lg">{workout.exercises?.[0]?.exerciseName || '训练'}</p>
                            <p className="text-xs text-white/60">
                              {new Date(workout.date).toLocaleDateString()} • {workout.duration}分钟
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white text-sm">{workout.calories}千卡 <span className="text-xs text-white/40">(仅供参考)</span></p>
                            <div className="flex space-x-2 mt-2">
                              <Button 
                                size="small" 
                                className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  editWorkout(workout);
                                }}
                              >
                                编辑
                              </Button>
                              <Button 
                                size="small" 
                                danger
                                variant="outlined" 
                                className="delete-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingWorkoutId(workout.id);
                                  setShowWorkoutDeleteConfirmModal(true);
                                }}
                              >
                                删除
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {workout.exercises && workout.exercises.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm text-white/80">训练动作:</p>
                            {workout.exercises.map((exercise, exerciseIndex) => (
                              <div key={exerciseIndex} className="flex items-center space-x-4 p-2 bg-white/5 rounded-lg">
                                <div className="flex-1">
                                  <p className="text-sm text-white">{exercise.exerciseName}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm text-white/80">组数</p>
                                  <p className="text-sm text-white">{exercise.sets}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm text-white/80">次数</p>
                                  <p className="text-sm text-white">{exercise.reps}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm text-white/80">重量</p>
                                  <p className="text-sm text-white">{exercise.weight}kg</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {workout.notes && (
                          <div className="mt-3 p-2 bg-white/5 rounded-lg">
                            <p className="text-sm text-white/80">备注:</p>
                            <p className="text-sm text-white">{workout.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* 添加训练记录模态框 */}
              {showAddWorkoutModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-white">添加训练记录</h3>
                      <Button 
       
                        className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20 rounded-lg px-4 py-2 transition-all duration-200"
                        onClick={() => setShowAddWorkoutModal(false)}
                      >
                        关闭
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/80 text-sm mb-2">日期</label>
                          <DatePicker
                            value={workoutForm.date ? dayjs(workoutForm.date) : null}
                            onChange={(date) => setWorkoutForm(prev => ({ ...prev, date: date ? date.format('YYYY-MM-DD') : '' }))}
                            className="w-full bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200 custom-datepicker"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                            placeholder="选择日期"
                            format="YYYY-MM-DD"
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-2">训练时长 (分钟)</label>
                          <Input
                            type="number"
                            value={workoutForm.duration}
                            onChange={(e) => handleDurationChange(e.target.value)}
                            placeholder="输入训练时长"
                            className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                          />
                        </div>
                      </div>
                       

                      
                      <div>
                        <label className="block text-white/80 text-sm mb-2">备注</label>
                        <Input.TextArea
                          value={workoutForm.notes}
                          onChange={(e) => setWorkoutForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="添加备注信息"
                          className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white/80 text-sm mb-2">训练动作</label>
                        {workoutForm.exercises.map((exercise, index) => (
                          <div key={index} className="bg-white/5 border border-white/20 rounded-xl p-4 mb-3">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-white font-medium">动作 {index + 1}</h4>
                              {index > 0 && (
                                <Button 
                                  danger 
                                  variant="outlined" 
                                  className="delete-button"
                                  onClick={() => removeExercise(index)}
                                >
                                  删除
                                </Button>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-5 gap-4">
                              <div className="col-span-2">
                                <label className="block text-white/80 text-xs mb-1">动作名称</label>
                                <Select
                                  value={exercise.exerciseName}
                                  onChange={(value) => handleExerciseChange(index, 'exerciseName', value)}
                                  placeholder="搜索或选择动作"
                                  showSearch
                                  filterOption={(input, option) =>
                                    (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                                  }
                                  className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200 w-full"
                                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                                >
                                  <Option value="">请选择动作</Option>
                                  {trainingExercises.map((ex: any) => (
                                    <Option key={ex.id} value={ex.name_zh}>{ex.name_zh}</Option>
                                  ))}
                                </Select>
                              </div>
                              <div>
                                <label className="block text-white/80 text-xs mb-1">组数</label>
                                <Input
                                  type="number"
                                  value={exercise.sets}
                                  onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value))}
                                  className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                                />
                              </div>
                              <div>
                                <label className="block text-white/80 text-xs mb-1">次数</label>
                                <Input
                                  type="number"
                                  value={exercise.reps}
                                  onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value))}
                                  className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                                />
                              </div>
                              <div>
                                <label className="block text-white/80 text-xs mb-1">重量 (kg)</label>
                                <Input
                                  type="number"
                                  value={exercise.weight}
                                  onChange={(e) => handleExerciseChange(index, 'weight', parseFloat(e.target.value))}
                                  className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <Button 
                          className="w-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                          onClick={addExercise}
                        >
                          <PlusOutlined className="mr-2 h-4 w-4" />
                          添加动作
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-6">
                      <Button 
                        className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                        onClick={() => setShowAddWorkoutModal(false)}
                      >
                        取消
                      </Button>
                      <Button 
                        className="backdrop-blur-xl bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 hover:border-blue-500/70 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                        onClick={saveWorkout}
                      >
                        保存
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 编辑训练记录模态框 */}
              {showEditWorkoutModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-white">编辑训练记录</h3>
                      <Button 
                        className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20 rounded-lg px-4 py-2 transition-all duration-200"
                        onClick={() => {
                          setShowEditWorkoutModal(false);
                          setWorkoutForm({
                            date: new Date().toISOString().split('T')[0],
                            duration: '',
                            calories: '',
                            notes: '',
                            exercises: [{
                            exerciseName: '',
                            sets: 1,
                            reps: 10,
                            weight: 0
                          }]
                          });
                          setEditingWorkout(null);
                        }}
                      >
                        关闭
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/80 text-sm mb-2">日期</label>
                          <DatePicker
                            value={workoutForm.date ? dayjs(workoutForm.date) : null}
                            onChange={(date) => setWorkoutForm(prev => ({ ...prev, date: date ? date.format('YYYY-MM-DD') : '' }))}
                            className="w-full bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200 custom-datepicker"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                            placeholder="选择日期"
                            format="YYYY-MM-DD"
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-2">训练时长 (分钟)</label>
                          <Input
                            type="number"
                            value={workoutForm.duration}
                            onChange={(e) => handleDurationChange(e.target.value)}
                            placeholder="输入训练时长"
                            className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                          />
                        </div>
                      </div>
                       
                      <div>
                        <label className="block text-white/80 text-sm mb-2">备注</label>
                        <Input.TextArea
                          value={workoutForm.notes}
                          onChange={(e) => setWorkoutForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="添加备注信息"
                          className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white/80 text-sm mb-2">训练动作</label>
                        {workoutForm.exercises.map((exercise, index) => (
                          <div key={index} className="bg-white/5 border border-white/20 rounded-xl p-4 mb-3">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-white font-medium">动作 {index + 1}</h4>
                              {index > 0 && (
                                <Button 
                                  danger 
                                  variant="outlined" 
                                  className="delete-button"
                                  onClick={() => removeExercise(index)}
                                >
                                  删除
                                </Button>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-5 gap-4">
                              <div className="col-span-2">
                                <label className="block text-white/80 text-xs mb-1">动作名称</label>
                                <Select
                                  value={exercise.exerciseName}
                                  onChange={(value) => handleExerciseChange(index, 'exerciseName', value)}
                                  placeholder="搜索或选择动作"
                                  showSearch
                                  filterOption={(input, option) =>
                                    (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                                  }
                                  className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200 w-full"
                                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                                >
                                  <Option value="">请选择动作</Option>
                                  {trainingExercises.map((ex: any) => (
                                    <Option key={ex.id} value={ex.name_zh}>{ex.name_zh}</Option>
                                  ))}
                                </Select>
                              </div>
                              <div>
                                <label className="block text-white/80 text-xs mb-1">组数</label>
                                <Input
                                  type="number"
                                  value={exercise.sets}
                                  onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value))}
                                  className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                                />
                              </div>
                              <div>
                                <label className="block text-white/80 text-xs mb-1">次数</label>
                                <Input
                                  type="number"
                                  value={exercise.reps}
                                  onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value))}
                                  className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                                />
                              </div>
                              <div>
                                <label className="block text-white/80 text-xs mb-1">重量 (kg)</label>
                                <Input
                                  type="number"
                                  value={exercise.weight}
                                  onChange={(e) => handleExerciseChange(index, 'weight', parseFloat(e.target.value))}
                                  className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <Button 
                          className="w-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                          onClick={addExercise}
                        >
                          <PlusOutlined className="mr-2 h-4 w-4" />
                          添加动作
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-6">
                      <Button 
                        className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                        onClick={() => {
                          setShowEditWorkoutModal(false);
                          setWorkoutForm({
                            date: new Date().toISOString().split('T')[0],
                            duration: '',
                            calories: '',
                            notes: '',
                            exercises: [{
                              exerciseName: '',
                              sets: 1,
                              reps: 10,
                              weight: 0,
                              restTime: 60
                            }]
                          });
                          setEditingWorkout(null);
                        }}
                      >
                        取消
                      </Button>
                      <Button 
                        className="backdrop-blur-xl bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 hover:border-blue-500/70 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                        onClick={saveEditWorkout}
                      >
                        保存
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 查看训练记录详情模态框 */}
              {showViewWorkoutModal && currentWorkoutRecord && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-white">训练记录详情</h3>
                      <Button 
                        className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20 rounded-lg px-4 py-2 transition-all duration-200"
                        onClick={() => {
                          setShowViewWorkoutModal(false);
                          setCurrentWorkoutRecord(null);
                        }}
                      >
                        关闭
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-white/80 text-sm">日期</p>
                          <p className="text-white font-medium">{new Date(currentWorkoutRecord.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-white/80 text-sm">训练时长</p>
                          <p className="text-white font-medium">{currentWorkoutRecord.duration}分钟</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-white/80 text-sm">消耗热量</p>
                        <p className="text-white font-medium">{currentWorkoutRecord.calories}千卡 <span className="text-xs text-white/40">(仅供参考)</span></p>
                      </div>
                      
                      {currentWorkoutRecord.notes && (
                        <div>
                          <p className="text-white/80 text-sm">备注</p>
                          <p className="text-white font-medium">{currentWorkoutRecord.notes}</p>
                        </div>
                      )}
                      
                      {currentWorkoutRecord.exercises && currentWorkoutRecord.exercises.length > 0 && (
                        <div>
                          <p className="text-white/80 text-sm mb-3">训练动作</p>
                          {currentWorkoutRecord.exercises.map((exercise, index) => (
                            <div key={index} className="bg-white/5 border border-white/20 rounded-xl p-4 mb-3">
                              <div className="grid grid-cols-5 gap-4">
                                <div>
                                  <p className="text-white/80 text-xs mb-1">动作名称</p>
                                  <p className="text-white font-medium">{exercise.exerciseName}</p>
                                </div>
                                <div>
                                  <p className="text-white/80 text-xs mb-1">组数</p>
                                  <p className="text-white font-medium">{exercise.sets}</p>
                                </div>
                                <div>
                                  <p className="text-white/80 text-xs mb-1">次数</p>
                                  <p className="text-white font-medium">{exercise.reps}</p>
                                </div>
                                <div>
                                  <p className="text-white/80 text-xs mb-1">重量</p>
                                  <p className="text-white font-medium">{exercise.weight}kg</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2 mt-6">
                      <Button 
                        className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                        onClick={() => {
                          setShowViewWorkoutModal(false);
                          editWorkout(currentWorkoutRecord);
                        }}
                      >
                        编辑
                      </Button>
                      <Button 
                        className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                        onClick={() => {
                          setShowViewWorkoutModal(false);
                          setCurrentWorkoutRecord(null);
                        }}
                      >
                        关闭
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 视频播放器模态窗口 */}
          {showVideoPlayer && currentVideo && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-4xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">{currentVideo.title}</h3>
                  <Button 
                    className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20 rounded-lg px-4 py-2 transition-all duration-200"
                    onClick={() => setShowVideoPlayer(false)}
                  >
                    关闭
                  </Button>
                </div>
                
                <div className="relative aspect-video mb-6">
                  <video 
                    src={currentVideo.url} 
                    controls 
                    autoPlay
                    preload="auto"
                    playsInline
                    crossOrigin="anonymous"
                    className="w-full h-full object-contain rounded-xl"
                    onError={(e) => {
                      console.error('视频加载失败:', e);
                    }}
                  >
                    您的浏览器不支持视频播放
                  </video>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white"
                    onClick={() => setShowVideoPlayer(false)}
                  >
                    关闭
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 体重记录弹窗 */}
          {showWeightModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-white mb-4">记录体重</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-white/80 text-sm mb-1">日期</label>
                    <DatePicker value={weightForm.date ? dayjs(weightForm.date) : null} onChange={(d) => setWeightForm(prev => ({ ...prev, date: d ? d.format('YYYY-MM-DD') : '' }))} className="w-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} format="YYYY-MM-DD" />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-1">体重 (kg) *</label>
                    <Input type="number" value={weightForm.weight} onChange={(e) => setWeightForm(prev => ({ ...prev, weight: e.target.value }))} placeholder="输入体重" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-5">
                  <Button className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white" onClick={() => setShowWeightModal(false)}>取消</Button>
                  <Button className="backdrop-blur-xl bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 text-white" onClick={saveQuickWeight}>保存</Button>
                </div>
              </div>
            </div>
          )}

          {/* 体脂率记录弹窗 */}
          {showBodyFatModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-white mb-4">记录体脂率</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-white/80 text-sm mb-1">日期</label>
                    <DatePicker value={bodyFatForm.date ? dayjs(bodyFatForm.date) : null} onChange={(d) => setBodyFatForm(prev => ({ ...prev, date: d ? d.format('YYYY-MM-DD') : '' }))} className="w-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} format="YYYY-MM-DD" />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-1">体脂率 (%) *</label>
                    <Input type="number" value={bodyFatForm.bodyFat} onChange={(e) => setBodyFatForm(prev => ({ ...prev, bodyFat: e.target.value }))} placeholder="输入体脂率" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-5">
                  <Button className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white" onClick={() => setShowBodyFatModal(false)}>取消</Button>
                  <Button className="backdrop-blur-xl bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 text-white" onClick={saveQuickBodyFat}>保存</Button>
                </div>
              </div>
            </div>
          )}

          {/* 四围数据记录弹窗 */}
          {showCircumferenceModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-white mb-4">记录四围数据</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-white/80 text-sm mb-1">日期</label>
                    <DatePicker value={circumferenceForm.date ? dayjs(circumferenceForm.date) : null} onChange={(d) => setCircumferenceForm(prev => ({ ...prev, date: d ? d.format('YYYY-MM-DD') : '' }))} className="w-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} format="YYYY-MM-DD" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white/80 text-sm mb-1">胸围 (cm)</label>
                      <Input type="number" value={circumferenceForm.chest} onChange={(e) => setCircumferenceForm(prev => ({ ...prev, chest: e.target.value }))} placeholder="胸围" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-1">腰围 (cm)</label>
                      <Input type="number" value={circumferenceForm.waist} onChange={(e) => setCircumferenceForm(prev => ({ ...prev, waist: e.target.value }))} placeholder="腰围" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-1">臀围 (cm)</label>
                      <Input type="number" value={circumferenceForm.hips} onChange={(e) => setCircumferenceForm(prev => ({ ...prev, hips: e.target.value }))} placeholder="臀围" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-1">臂围 (cm)</label>
                      <Input type="number" value={circumferenceForm.biceps} onChange={(e) => setCircumferenceForm(prev => ({ ...prev, biceps: e.target.value }))} placeholder="臂围" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-5">
                  <Button className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white" onClick={() => setShowCircumferenceModal(false)}>取消</Button>
                  <Button className="backdrop-blur-xl bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 text-white" onClick={saveQuickCircumference}>保存</Button>
                </div>
              </div>
            </div>
          )}

          {/* BMI记录弹窗 */}
          {showBmiModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-white mb-4">记录BMI</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-white/80 text-sm mb-1">日期</label>
                    <DatePicker value={bmiForm.date ? dayjs(bmiForm.date) : null} onChange={(d) => setBmiForm(prev => ({ ...prev, date: d ? d.format('YYYY-MM-DD') : '' }))} className="w-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} format="YYYY-MM-DD" />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-1">体重 (kg) *</label>
                    <Input type="number" value={bmiForm.weight} onChange={(e) => setBmiForm(prev => ({ ...prev, weight: e.target.value }))} placeholder="输入体重（用于计算BMI）" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                    <p className="text-white/50 text-xs mt-1">BMI = 体重(kg) / 身高(m)²，身高默认170cm</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-5">
                  <Button className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white" onClick={() => setShowBmiModal(false)}>取消</Button>
                  <Button className="backdrop-blur-xl bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 text-white" onClick={saveQuickBmi}>保存</Button>
                </div>
              </div>
            </div>
          )}


          {/* Video Library Content */}
          {activeSubMenu === 'video-library' && (
            <>
              <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">视频教学</h3>
                  <div className="relative">
                    <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                    <Input
                      placeholder="搜索动作..."
                      className="pl-10 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10"
                      onChange={(e) => console.log('搜索:', e.target.value)}
                    />
                  </div>
                </div>

                {/* 文件夹展示区域 */}
                <div className="mb-8">
                  <h4 className="text-white font-semibold mb-4">视频文件夹</h4>
                  <div className="grid grid-cols-4 gap-6">
                    {exercisesLoading ? (
                      <div className="col-span-4 flex justify-center items-center h-64">
                        <Spin size="large" />
                      </div>
                    ) : exercises.length === 0 ? (
                      <div className="col-span-4 text-center py-16 text-white/60">
                        <p>暂无动作</p>
                        <p className="text-sm mt-2">请在后台添加动作</p>
                      </div>
                    ) : (
                      exercises.map((exercise) => {
                        return (
                        <div
                          key={exercise.id}
                          className="relative w-[288px] cursor-pointer group"
                          onClick={async () => {
                            console.log('打开文件夹:', exercise.name);
                            const videos = await loadExerciseVideos(exercise.id);
                            setOpenFolder({
                              id: exercise.id,
                              name: exercise.name,
                              videos: exercise.video_count || 0,
                              videosList: videos.map(video => ({
            id: video.id,
            title: video.filename,
            cover: video.cover_image || null,
            url: video.path
          }))
                            });
                          }}
                        >
                        <div className="relative w-[288px]" style={{ perspective: "1200px" }}>
                          {/* Back panel */}
                          <div 
                            className="relative z-0 rounded-2xl transition-all duration-300"
                            style={{
                              height: "224px",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              transformStyle: "preserve-3d",
                              transformOrigin: "center bottom",
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                              backdropFilter: "blur(16px)",
                              WebkitBackdropFilter: "blur(16px)",
                              transform: "rotateX(0deg)",
                              transition: "transform 0.3s ease, backgroundColor 0.3s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "rotateX(15deg)";
                              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "rotateX(0deg)";
                              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                            }}
                          >
                            <div 
                              className="absolute inset-0"
                              style={{
                                transformStyle: "flat",
                                transformOrigin: "center bottom",
                                transform: "rotateX(0deg)",
                                transition: "transform 0.3s ease"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "rotateX(-15deg)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "rotateX(0deg)";
                              }}
                            >
                              {[...Array(5)].map((_, imgIndex) => {
                                const coverImages = exercise.cover_images || [];
                                const coverVideoPaths = exercise.cover_video_paths || [];
                                const coverUrl = coverImages[imgIndex] || null;
                                const videoUrl = coverVideoPaths[imgIndex] || null;
                                const centerIndex = 2;
                                const distanceFromCenter = Math.abs(imgIndex - centerIndex);
                                const zIndex = 10 - distanceFromCenter;
                                const brightness = distanceFromCenter === 0 ? 1 : distanceFromCenter === 1 ? 0.7 : distanceFromCenter === 2 ? 0.55 : 0.4;
                                const blurAmount = distanceFromCenter === 0 ? 0 : distanceFromCenter === 1 ? 0.3 : distanceFromCenter === 2 ? 0.6 : 0.9;
                                const yOffset = -16 * (1 - distanceFromCenter / centerIndex) || 0;
                                const scale = distanceFromCenter === 0 ? 1.05 : distanceFromCenter === 1 ? 1 : distanceFromCenter === 2 ? 0.95 : 0.9;
                                const xPos = distanceFromCenter === 0 ? 0 : distanceFromCenter === 1 ? (imgIndex < centerIndex ? -40 : 40) : distanceFromCenter === 2 ? (imgIndex < centerIndex ? -80 : 80) : 0;
                                const rotation = distanceFromCenter === 0 ? 0 : distanceFromCenter === 1 ? (imgIndex < centerIndex ? -3 : 3) : distanceFromCenter === 2 ? (imgIndex < centerIndex ? -6 : 6) : 0;

                                return (
                                  <div
                                    key={imgIndex}
                                    className="absolute left-1/2 top-0 transition-all duration-300"
                                    style={{
                                      transform: `translate(calc(-50% + ${xPos}px), ${8 + yOffset}px) rotate(${rotation}deg) scale(${scale})`,
                                      zIndex: zIndex,
                                      transition: "transform 0.3s ease"
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.transform = `translate(calc(-50% + ${xPos * 1.4}px), ${-8 + yOffset}px) rotate(${rotation * 1.3}deg) scale(${scale * 1.02})`;
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform = `translate(calc(-50% + ${xPos}px), ${8 + yOffset}px) rotate(${rotation}deg) scale(${scale})`;
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (coverUrl && videoUrl) {
                                        setCurrentVideo({
                                          id: `cover-${imgIndex}`,
                                          title: exercise.name,
                                          cover: coverUrl,
                                          url: videoUrl
                                        });
                                        setShowVideoPlayer(true);
                                      }
                                    }}
                                  >
                                    <div className="h-[160px] w-[100px] overflow-hidden rounded-lg">
                                      <div
                                        className="h-full w-full rounded-lg"
                                        style={{
                                          backgroundImage: coverUrl ? `url('${coverUrl}')` : 'none',
                                          backgroundSize: 'cover',
                                          backgroundPosition: 'center',
                                          backgroundColor: 'rgba(255,255,255,0.05)',
                                          backgroundRepeat: 'no-repeat'
                                        }}
                                      >
                                        <div
                                          className="h-full w-full"
                                          style={{
                                            filter: `brightness(${brightness}) contrast(1.08) saturate(${1 - distanceFromCenter * 0.2}) blur(${blurAmount}px)`
                                          }}
                                        >
                                          {!coverUrl && (
                                            <div className="h-full w-full flex items-center justify-center">
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                              </svg>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Front panel */}
                          <div 
                            className="absolute bottom-0 left-0 right-0 z-10 rounded-2xl overflow-hidden transition-all duration-300"
                            style={{
                              backdropFilter: "blur(16px)",
                              WebkitBackdropFilter: "blur(16px)",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              transformStyle: "preserve-3d",
                              transformOrigin: "center bottom",
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                              transform: "rotateX(0deg)",
                              transition: "transform 0.3s ease, backgroundColor 0.3s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "rotateX(-25deg)";
                              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "rotateX(0deg)";
                              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                            }}
                          >
                            <div className="relative py-4 px-4 min-h-[2.75rem]">
                              <h3 className="font-semibold text-white/70 text-base leading-snug line-clamp-2 min-h-[2.75rem] relative z-0 transition-all duration-200 group-hover:text-white">
                                {exercise.name}
                              </h3>
                            </div>
                            <div className="relative h-[48px]">
                              <div className="absolute inset-x-0 top-0 h-[1px] bg-white/[0.04]" />
                              <div className="relative h-full flex items-center justify-between px-4">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[13px] font-medium text-white/70">{exercise.video_count || 0}</span>
                                  <span className="text-[13px] text-white/60">视频</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white text-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                  >
                                    打开
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }))}
                  </div>
                </div>

                {/* 文件夹内容展示 */}
                {openFolder && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-semibold">{openFolder.name} - 视频列表</h4>
                      <Button 
                        className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white"
                        onClick={() => setOpenFolder(null)}
                      >
                        返回
                      </Button>
                    </div>
                    <div className="grid grid-cols-5 gap-4">
                      {openFolder.videosList.map((video) => (
                        <div 
                          key={video.id} 
                          className="bg-white/5 border border-white/20 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                          onClick={() => {
                            setCurrentVideo(video);
                            setShowVideoPlayer(true);
                          }}
                        >
                          <div 
                            className="relative aspect-video mb-3 rounded-lg overflow-hidden"
                            style={{
                              backgroundImage: video.cover ? `url('${video.cover}')` : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              backgroundRepeat: 'no-repeat'
                            }}
                          >
                            {!video.cover && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                </svg>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/20"></div>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                              <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <h5 className="text-white font-semibold text-sm mb-1 truncate">{video.title}</h5>
                          <Button 
                            size="small"
                            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentVideo(video);
                              setShowVideoPlayer(true);
                            }}
                          >
                            播放
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </>
          )}

          {/* Community Content */}
          {activeSubMenu === 'community' && (
            <>
              <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">训练日记</h3>
                  <Button 
                    className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                    onClick={() => {
                      setShowDiaryModal(true);
                      setDiaryForm({
                        content: '',
                        duration: '',
                        tags: '',
                        date: new Date().toISOString().split('T')[0]
                      });
                      setEditingDiary(null);
                    }}
                  >
                    <PlusOutlined className="mr-2 h-4 w-4" />
                    写日记
                  </Button>
                </div>

                <div className="space-y-6">
                  {diaryLoading ? (
                    <div className="text-center py-12">
                      <Spin size="large" className="text-white" />
                    </div>
                  ) : diaries.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-white/60">还没有训练日记，点击上方「写日记」按钮开始记录</p>
                    </div>
                  ) : (
                    diaries.map((diary) => (
                      <div 
                        key={diary.id} 
                        className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                        onClick={() => {
                          setSelectedDiary(diary);
                          setShowDiaryDetailModal(true);
                        }}
                      >
                        <div className="mb-3">
                          <p className="text-white/60 text-sm">{diary.date} {getDayOfWeek(diary.date)}</p>
                        </div>
                        <p className="text-white mb-4">{diary.content}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-white/80 text-sm">{diary.duration ? `${diary.duration}分钟` : ''}</span>
                            {diary.tags && (
                              <span className="text-white/80 text-sm">{diary.tags.split(',').map(tag => `#${tag}`).join(' ')}</span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="small" 
                              className="text-white/80 hover:bg-white/20 hover:text-white bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingDiary(diary);
                                setDiaryForm({
                                  content: diary.content,
                                  duration: diary.duration,
                                  tags: diary.tags,
                                  date: diary.date
                                });
                                setShowDiaryModal(true);
                              }}
                            >
                              编辑
                            </Button>
                            <Button 
                              size="small" 
                              danger 
                              className="text-white/80 hover:bg-red-500/20 hover:text-red-400 bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingDiaryId(diary.id);
                                setShowDeleteConfirmModal(true);
                              }}
                            >
                              删除
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </>
          )}

          {/* Fitness Plan Content */}
          {activeSubMenu === 'fitness-plan' && (
            <>
              <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">健身计划</h3>
                  <Button className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]">
                    <PlusOutlined className="mr-2 h-4 w-4" />
                    创建计划
                  </Button>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      name: "初学者全身训练计划",
                      duration: "4周",
                      frequency: "每周3次",
                      level: "初级",
                      progress: 75,
                    },
                    {
                      name: "减脂塑形计划",
                      duration: "8周",
                      frequency: "每周5次",
                      level: "中级",
                      progress: 30,
                    },
                    {
                      name: "力量增长计划",
                      duration: "12周",
                      frequency: "每周4次",
                      level: "高级",
                      progress: 10,
                    },
                  ].map((plan, index) => (
                    <div key={index} className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-semibold">{plan.name}</h4>
                        <Badge className={`text-xs ${plan.level === '初级' ? 'bg-green-500/20 text-green-400 border-green-400/30' : plan.level === '中级' ? 'bg-blue-500/20 text-blue-400 border-blue-400/30' : 'bg-red-500/20 text-red-400 border-red-400/30'}`}>
                          {plan.level}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-white/60 text-sm">时长</p>
                          <p className="text-white font-medium">{plan.duration}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">频率</p>
                          <p className="text-white font-medium">{plan.frequency}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">进度</p>
                          <p className="text-white font-medium">{plan.progress}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                        <div
                          className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                          style={{ width: `${plan.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button size="small" className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20" onClick={() => {
                          setCurrentPlanId(index + 1);
                          setShowPlanDetailModal(true);
                        }}>
                          查看详情
                        </Button>
                        <Button size="small" className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20" onClick={() => {
                          setCurrentPlanId(index + 1);
                          setShowEditPlanModal(true);
                        }}>
                          编辑
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* Profile Content */}
          {activeSubMenu === 'profile' && (
            <>
              <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">个人设置</h3>
                </div>

                <div className="space-y-6">
                  <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                    <div className="flex items-center space-x-6 mb-6">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="relative cursor-pointer group">
                          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-5xl overflow-hidden">
                            {user?.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt="头像" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              '👤'
                            )}
                          </div>
                          <input 
                            id="avatar-upload" 
                            type="file" 
                            accept="image/*" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={async (e) => {
                              console.log('File input changed:', e.target.files);
                              const file = e.target.files?.[0];
                              if (file) {
                                console.log('Selected file:', file);
                                // 上传头像到后端
                                const formData = new FormData();
                                formData.append('avatar', file);
                                
                                try {
                                  console.log('Sending request to /api/auth/avatar');
                                  const response = await fetch('/api/auth/avatar', {
                                    method: 'POST',
                                    headers: {
                                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                                    },
                                    body: formData
                                  });
                                  
                                  console.log('Response status:', response.status);
                                  if (response.ok) {
                                    const data = await response.json();
                                    console.log('Response data:', data);
                                    console.log('Avatar URL from response:', data.user.avatar);
                                    
                                    // 直接使用返回的用户数据更新本地状态
                                    // 这样可以立即看到头像更新，不需要等待getUserProfile
                                    dispatch({ type: 'user/getProfile/fulfilled', payload: data.user });
                                    message.success('头像上传成功');
                                  } else {
                                    const errorData = await response.json();
                                    console.error('Upload failed:', errorData);
                                    message.error('头像上传失败');
                                  }
                                } catch (error) {
                                  console.error('上传头像失败:', error);
                                  message.error('头像上传失败');
                                }
                              }
                            }}
                          />

                        </div>
                        <button 
                          className="text-white/80 hover:text-white text-sm transition-colors"
                          onClick={() => {
                            // 触发文件选择
                            const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
                            console.log('File input element:', fileInput);
                            fileInput?.click();
                          }}
                        >
                          更换头像
                        </button>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-lg">{user?.name || '加载中...'}</h4>
                        <p className="text-white/60">高级会员</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-white/80 text-sm mb-2">用户名</label>
                        <Input
                          value={profileForm.username}
                          onChange={(e) => {
                            setProfileForm(prev => ({ ...prev, username: e.target.value }));
                          }}
                          className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-2">密码</label>
                        <Input.Password
                          className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200 custom-password-input"
                          style={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                            borderColor: 'rgba(255, 255, 255, 0.2)', 
                            color: 'white',
                            boxShadow: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-2">邮箱</label>
                        <Input
                          value={profileForm.email}
                          onChange={(e) => {
                            setProfileForm(prev => ({ ...prev, email: e.target.value }));
                          }}
                          className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-2">姓名</label>
                        <Input
                          value={profileForm.name}
                          onChange={(e) => {
                            setProfileForm(prev => ({ ...prev, name: e.target.value }));
                          }}
                          className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                        />
                      </div>
                      <div className="grid grid-cols-5 gap-4">
                        <div className="flex-1">
                          <label className="block text-white/80 text-sm mb-2">性别</label>
                          <Select
                            value={profileForm.gender}
                            onChange={(value) => {
                              setProfileForm(prev => ({ ...prev, gender: value }));
                            }}
                            placeholder="请选择性别"
                            className="w-full bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                          >
                            <Option value="male">男</Option>
                            <Option value="female">女</Option>
                            <Option value="other">其他</Option>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-white/80 text-sm mb-2">年龄</label>
                          <Input
                            type="number"
                            value={profileForm.age}
                            onChange={(e) => {
                              setProfileForm(prev => ({ ...prev, age: e.target.value }));
                            }}
                            className="w-full bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-white/80 text-sm mb-2">身高 (cm)</label>
                          <Input
                            type="number"
                            value={profileForm.height}
                            onChange={(e) => {
                              setProfileForm(prev => ({ ...prev, height: e.target.value }));
                            }}
                            className="w-full bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-white/80 text-sm mb-2">体重 (kg)</label>
                          <Input
                            type="number"
                            value={profileForm.weight}
                            onChange={(e) => {
                              setProfileForm(prev => ({ ...prev, weight: e.target.value }));
                            }}
                            className="w-full bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-white/80 text-sm mb-2">健身水平</label>
                          <Select
                            value={profileForm.fitness_level}
                            onChange={(value) => {
                              setProfileForm(prev => ({ ...prev, fitness_level: value }));
                            }}
                            placeholder="请选择"
                            className="w-full bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                          >
                            <Option value="beginner">初级</Option>
                            <Option value="intermediate">中级</Option>
                            <Option value="advanced">高级</Option>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                          onClick={async () => {
                            try {
                              // 实际项目中，这里会调用API更新用户资料
                              console.log('Save changes clicked:', profileForm);
                              const token = localStorage.getItem('token');
                              const response = await fetch('/api/auth/profile', {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify(profileForm)
                              });
                              
                              if (response.ok) {
                                const data = await response.json();
                                dispatch({ type: 'user/getProfile/fulfilled', payload: data.user });
                                message.success('个人设置已保存');
                              } else {
                                message.error('保存失败，请重试');
                              }
                            } catch (error) {
                              console.error('保存个人设置失败:', error);
                              message.error('保存失败，请重试');
                            }
                          }}
                        >
                          保存更改
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Quick Action Content */}
          {activeSubMenu === 'book-coach' && (
            <>
              <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">预约教练</h3>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      {
                        name: "李教练",
                        specialty: "力量训练",
                        experience: "5年经验",
                        rating: 4.8,
                      },
                      {
                        name: "王教练",
                        specialty: "有氧运动",
                        experience: "3年经验",
                        rating: 4.6,
                      },
                    ].map((coach, index) => (
                      <Card key={index} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-4 hover:bg-white/15 transition-all duration-300">
                        <div className="text-3xl mb-3">👨‍💼</div>
                        <h4 className="text-white font-semibold mb-2">{coach.name}</h4>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-white/80 text-sm">专长</span>
                            <span className="text-white">{coach.specialty}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/80 text-sm">经验</span>
                            <span className="text-white">{coach.experience}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/80 text-sm">评分</span>
                            <span className="text-white">{coach.rating} ⭐</span>
                          </div>
                        </div>
                        <Button size="small" className="w-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]">
                          预约
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
            </>
          )}

          {activeSubMenu === 'send-message' && (
            <>
              <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">发送消息</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">收件人</label>
                    <Input
                      placeholder="选择联系人..."
                      className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">消息内容</label>
                    <Input.TextArea
                      rows={4}
                      placeholder="输入消息..."
                      className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]">
                      发送
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          )}

          {activeSubMenu === 'schedule-workout' && (
            <>
              <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">安排训练</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">训练名称</label>
                    <Input
                      placeholder="输入训练名称..."
                      className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">日期</label>
                    <Input
                      type="date"
                      className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">时间</label>
                    <Input
                      type="time"
                      className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">时长</label>
                    <Input
                      placeholder="输入训练时长..."
                      className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]">
                      保存
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          )}

          {activeSubMenu === 'add-record' && (
            <>
              <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">添加训练记录</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">训练名称</label>
                    <Input
                      placeholder="输入训练名称..."
                      className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">日期</label>
                    <Input
                      type="date"
                      className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">时长</label>
                    <Input
                      placeholder="输入训练时长..."
                      className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">消耗热量</label>
                    <Input
                      placeholder="输入消耗热量..."
                      className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]">
                      保存
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          )}

          {activeSubMenu === 'fatloss-plan' && <FatLossPlan />}
          {activeSubMenu === 'training-exercises' && <TrainingExercises />}
          {activeSubMenu === 'tanchengyi' && <TanChengyiThreeSplit />}
        </div>

        {/* 体重记录弹窗 */}
        {showWeightModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-white mb-4">记录体重</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-white/80 text-sm mb-1">日期</label>
                  <DatePicker value={weightForm.date ? dayjs(weightForm.date) : null} onChange={(d) => setWeightForm(prev => ({ ...prev, date: d ? d.format('YYYY-MM-DD') : '' }))} className="w-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} format="YYYY-MM-DD" />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-1">体重 (kg) *</label>
                  <Input type="number" value={weightForm.weight} onChange={(e) => setWeightForm(prev => ({ ...prev, weight: e.target.value }))} placeholder="输入体重" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-5">
                <Button className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white" onClick={() => setShowWeightModal(false)}>取消</Button>
                <Button className="backdrop-blur-xl bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 text-white" onClick={saveQuickWeight}>保存</Button>
              </div>
            </div>
          </div>
        )}

        {/* 体脂率记录弹窗 */}
        {showBodyFatModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-white mb-4">记录体脂率</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-white/80 text-sm mb-1">日期</label>
                  <DatePicker value={bodyFatForm.date ? dayjs(bodyFatForm.date) : null} onChange={(d) => setBodyFatForm(prev => ({ ...prev, date: d ? d.format('YYYY-MM-DD') : '' }))} className="w-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} format="YYYY-MM-DD" />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-1">体脂率 (%) *</label>
                  <Input type="number" value={bodyFatForm.bodyFat} onChange={(e) => setBodyFatForm(prev => ({ ...prev, bodyFat: e.target.value }))} placeholder="输入体脂率" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-5">
                <Button className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white" onClick={() => setShowBodyFatModal(false)}>取消</Button>
                <Button className="backdrop-blur-xl bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 text-white" onClick={saveQuickBodyFat}>保存</Button>
              </div>
            </div>
          </div>
        )}

        {/* 四围数据记录弹窗 */}
        {showCircumferenceModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-white mb-4">记录四围数据</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-white/80 text-sm mb-1">日期</label>
                  <DatePicker value={circumferenceForm.date ? dayjs(circumferenceForm.date) : null} onChange={(d) => setCircumferenceForm(prev => ({ ...prev, date: d ? d.format('YYYY-MM-DD') : '' }))} className="w-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} format="YYYY-MM-DD" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/80 text-sm mb-1">胸围 (cm)</label>
                    <Input type="number" value={circumferenceForm.chest} onChange={(e) => setCircumferenceForm(prev => ({ ...prev, chest: e.target.value }))} placeholder="胸围" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-1">腰围 (cm)</label>
                    <Input type="number" value={circumferenceForm.waist} onChange={(e) => setCircumferenceForm(prev => ({ ...prev, waist: e.target.value }))} placeholder="腰围" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-1">臀围 (cm)</label>
                    <Input type="number" value={circumferenceForm.hips} onChange={(e) => setCircumferenceForm(prev => ({ ...prev, hips: e.target.value }))} placeholder="臀围" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-1">臂围 (cm)</label>
                    <Input type="number" value={circumferenceForm.biceps} onChange={(e) => setCircumferenceForm(prev => ({ ...prev, biceps: e.target.value }))} placeholder="臂围" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-5">
                <Button className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white" onClick={() => setShowCircumferenceModal(false)}>取消</Button>
                <Button className="backdrop-blur-xl bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 text-white" onClick={saveQuickCircumference}>保存</Button>
              </div>
            </div>
          </div>
        )}

        {/* BMI记录弹窗 */}
        {showBmiModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-white mb-4">记录BMI</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-white/80 text-sm mb-1">日期</label>
                  <DatePicker value={bmiForm.date ? dayjs(bmiForm.date) : null} onChange={(d) => setBmiForm(prev => ({ ...prev, date: d ? d.format('YYYY-MM-DD') : '' }))} className="w-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} format="YYYY-MM-DD" />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-1">体重 (kg) *</label>
                  <Input type="number" value={bmiForm.weight} onChange={(e) => setBmiForm(prev => ({ ...prev, weight: e.target.value }))} placeholder="输入体重（用于计算BMI）" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                  <p className="text-white/50 text-xs mt-1">BMI = 体重(kg) / 身高(m)²，身高默认170cm</p>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-5">
                <Button className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white" onClick={() => setShowBmiModal(false)}>取消</Button>
                <Button className="backdrop-blur-xl bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 text-white" onClick={saveQuickBmi}>保存</Button>
              </div>
            </div>
          </div>
        )}

        {/* 写日记模态窗口 */}
        {showDiaryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">{editingDiary ? '编辑日记' : '写日记'}</h3>
                <Button 
                  className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20 rounded-lg px-4 py-2 transition-all duration-200"
                  onClick={() => {
                    setShowDiaryModal(false);
                    setDiaryForm({
                      content: '',
                      duration: '',
                      tags: '',
                      date: ''
                    });
                    setEditingDiary(null);
                  }}
                >
                  关闭
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">日期</label>
                  <DatePicker
                    value={diaryForm.date ? dayjs(diaryForm.date) : null}
                    onChange={(date) => setDiaryForm(prev => ({ ...prev, date: date ? date.format('YYYY-MM-DD') : '' }))}
                    className="w-full bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200 custom-datepicker"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                    placeholder="选择日期"
                    format="YYYY-MM-DD"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-2">训练感受/感悟</label>
                  <Input.TextArea
                    value={diaryForm.content}
                    onChange={(e) => setDiaryForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="分享你的训练感受和感悟..."
                    rows={6}
                    className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">标签 (用逗号分隔)</label>
                    <Input
                      value={diaryForm.tags}
                      onChange={(e) => setDiaryForm(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="如：胸肌训练,力量增长"
                      className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                  onClick={() => {
                    setShowDiaryModal(false);
                    setDiaryForm({
                      content: '',
                      duration: '',
                      tags: '',
                      date: ''
                    });
                    setEditingDiary(null);
                  }}
                >
                  取消
                </Button>
                <Button 
                  className="backdrop-blur-xl bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 hover:border-blue-500/70 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                  onClick={saveDiary}
                >
                  保存
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 日记详情模态窗口 */}
        {showDiaryDetailModal && selectedDiary && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">日记详情</h3>
                <Button 
                  className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20 rounded-lg px-4 py-2 transition-all duration-200"
                  onClick={() => {
                    setShowDiaryDetailModal(false);
                    setSelectedDiary(null);
                  }}
                >
                  关闭
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-white/60 text-sm">日期</p>
                  <p className="text-white font-semibold">{selectedDiary.date} {getDayOfWeek(selectedDiary.date)}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">训练感受</p>
                  <p className="text-white">{selectedDiary.content}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/60 text-sm">训练时长</p>
                    <p className="text-white font-semibold">{selectedDiary.duration ? `${selectedDiary.duration}分钟` : ''}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">标签</p>
                    <p className="text-white font-semibold">{selectedDiary.tags ? selectedDiary.tags.split(',').map(tag => `#${tag}`).join(' ') : '无'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                  onClick={() => {
                    setEditingDiary(selectedDiary);
                    setDiaryForm({
                      content: selectedDiary.content,
                      tags: selectedDiary.tags,
                      date: selectedDiary.date
                    });
                    setShowDiaryDetailModal(false);
                    setShowDiaryModal(true);
                  }}
                >
                  编辑
                </Button>
                <Button 
                  className="backdrop-blur-xl bg-red-500/30 hover:bg-red-500/50 border border-red-500/50 hover:border-red-500/70 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                  onClick={() => {
                    setDeletingDiaryId(selectedDiary.id);
                    setShowDiaryDetailModal(false);
                    setShowDeleteConfirmModal(true);
                  }}
                >
                  删除
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 删除确认模态窗口 */}
        {showDeleteConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-white mb-4">确认删除</h3>
              <p className="text-white/80 mb-6">确定要删除这篇训练日记吗？此操作不可撤销。</p>
              <div className="flex justify-end space-x-2">
                <Button 
                  className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                  onClick={() => {
                    setShowDeleteConfirmModal(false);
                    setDeletingDiaryId(null);
                  }}
                >
                  取消
                </Button>
                <Button 
                  className="backdrop-blur-xl bg-red-500/30 hover:bg-red-500/50 border border-red-500/50 hover:border-red-500/70 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                  onClick={deleteDiary}
                >
                  确认删除
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 训练记录删除确认模态框 */}
        {showWorkoutDeleteConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-white mb-4">确认删除</h3>
              <p className="text-white/80 mb-6">确定要删除这条训练记录吗？此操作不可撤销。</p>
              <div className="flex justify-end space-x-2">
                <Button 
                  className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                  onClick={() => {
                    setShowWorkoutDeleteConfirmModal(false);
                    setDeletingWorkoutId(null);
                  }}
                >
                  取消
                </Button>
                <Button 
                  className="backdrop-blur-xl bg-red-500/30 hover:bg-red-500/50 border border-red-500/50 hover:border-red-500/70 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                  onClick={deleteWorkout}
                >
                  确认删除
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 日程弹窗 */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {editingScheduleId ? `编辑日程 (${selectedDate})` : `新增日程 (${selectedDate})`}
                </h3>
                <Button 
                  className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm transition-all duration-200"
                  onClick={() => setShowScheduleModal(false)}
                >
                  关闭
                </Button>
              </div>

              <div className="py-4">
                <p className="text-white/80 text-sm mb-4">选择今天训练的部位（可多选）：</p>
                <div className="grid grid-cols-3 gap-2">
                  {BODY_PARTS.map(part => (
                    <div
                      key={part.key}
                      onClick={() => {
                        setSelectedParts(prev =>
                          prev.includes(part.key) ? prev.filter(p => p !== part.key) : [...prev, part.key]
                        )
                      }}
                      className={`cursor-pointer rounded-xl p-3 text-center transition-all duration-200 border ${
                        selectedParts.includes(part.key)
                          ? part.color + ' bg-opacity-30 scale-105 shadow-lg'
                          : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      <p className="text-base font-bold">{part.label}</p>
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

              <div className="flex justify-between mt-6">
                <Button 
                  danger 
                  icon={<DeleteOutlined />} 
                  disabled={!editingScheduleId} 
                  size="small"
                  onClick={async () => {
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
                        loadCalendarSchedules()
                      } else {
                        message.error(data.error || '删除失败')
                      }
                    } catch (e) {
                      console.error('删除日程失败', e)
                      message.error('删除失败')
                    }
                  }}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/30"
                >
                  删除
                </Button>
                <div className="space-x-2">
                  <Button 
                    size="small"
                    className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                    onClick={() => setShowScheduleModal(false)}
                  >
                    取消
                  </Button>
                  <Button 
                    size="small"
                    className="backdrop-blur-xl bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 hover:border-blue-500/70 text-white transition-all duration-700 ease-out hover:scale-[1.02]"
                    onClick={async () => {
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
                          loadCalendarSchedules()
                        } else {
                          message.error(data.error || '保存失败')
                        }
                      } catch (e) {
                        console.error('保存日程失败', e)
                        message.error('保存失败')
                      }
                    }}
                  >
                    保存
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <GoalManagement
          goals={goals}
          dashboardData={dashboardData}
          showGoalModal={showGoalModal}
          showGoalDeleteConfirmModal={showGoalDeleteConfirmModal}
          editingGoal={editingGoal}
          deletingGoalId={deletingGoalId}
          goalLoading={goalLoading}
          goalForm={goalForm}
          setShowGoalModal={setShowGoalModal}
          setShowGoalDeleteConfirmModal={setShowGoalDeleteConfirmModal}
          setDeletingGoalId={setDeletingGoalId}
          setGoalForm={setGoalForm}
          saveGoal={saveGoal}
          deleteGoal={deleteGoal}
          setEditingGoal={setEditingGoal}
          resetGoalForm={resetGoalForm}
          openEditGoal={openEditGoal}
          loadGoals={loadGoals}
        />

      </div>

      {/* Footer Attribution */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-full px-6 py-2">
          <p className="text-white/80 text-sm">
            你的健身搭子 © 2026
          </p>
        </div>
      </div>


    </div>
  )
}

export default Dashboard