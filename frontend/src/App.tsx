import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// 导入页面组件
import Dashboard from './pages/Dashboard.tsx'
import VideoLibrary from './pages/VideoLibrary.tsx'
import ExerciseDetail from './pages/ExerciseDetail.tsx'
import TrainingLogs from './pages/TrainingLogs.tsx'
import LogDetail from './pages/LogDetail.tsx'
import Statistics from './pages/Statistics.tsx'
import Profile from './pages/Profile.tsx'
import FatLossPlan from './pages/FatLossPlan.tsx'
import TrainingExercises from './pages/TrainingExercises.tsx'
import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import TanChengyiThreeSplit from './pages/TanChengyiThreeSplit.tsx'

// 导入管理端页面组件
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx'
import { UserManagement } from './pages/admin/UserManagement.tsx'
import { VideoManagement } from './pages/admin/VideoManagement.tsx'

// 导入Redux actions
import { getUserProfile } from './store/userSlice.ts'

function App() {
  const dispatch = useDispatch()
  const { token } = useSelector((state: any) => state.user)

  // 检查用户登录状态
  useEffect(() => {
    if (token) {
      dispatch(getUserProfile() as any)
    }
  }, [dispatch, token])

  // 检查是否登录
  const isAuthenticated = !!token

  return (
    <div>
      <Routes>
        {/* 公共路由 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 受保护路由 */}
        {isAuthenticated ? (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/video-library" element={<VideoLibrary />} />
            <Route path="/exercises/:id" element={<ExerciseDetail />} />
            <Route path="/logs" element={<TrainingLogs />} />
            <Route path="/logs/:id" element={<LogDetail />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/fatloss" element={<FatLossPlan />} />
            <Route path="/training-exercises" element={<TrainingExercises />} />
            <Route path="/tanchengyi" element={<TanChengyiThreeSplit />} />
            
            {/* 管理端路由 */}
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<Navigate to="/admin/users" replace />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="exercises" element={<VideoManagement />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </div>
  )
}

export default App
