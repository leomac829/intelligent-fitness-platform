import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

interface UserState {
  user: any | null
  token: string | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null
}

// 注册异步action
export const registerUser = createAsyncThunk(
  'user/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/register', userData)
      localStorage.setItem('token', response.data.token)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data.error)
    }
  }
)

// 登录异步action
export const loginUser = createAsyncThunk(
  'user/login',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/login', userData)
      localStorage.setItem('token', response.data.token)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data.error)
    }
  }
)

// 获取用户资料异步action
export const getUserProfile = createAsyncThunk(
  'user/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data.user
    } catch (error: any) {
      return rejectWithValue(error.response.data.error)
    }
  }
)

// 更新用户资料异步action
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData: any, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put('/api/auth/profile', userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data.user
    } catch (error: any) {
      return rejectWithValue(error.response.data.error)
    }
  }
)

// 修改密码异步action
export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (passwordData: any, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put('/api/auth/password', passwordData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data.error)
    }
  }
)

// 退出登录
export const logoutUser = createAsyncThunk(
  'user/logout',
  async () => {
    localStorage.removeItem('token')
    return null
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // 注册
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
    // 登录
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
    // 获取用户资料
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
    // 更新用户资料
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
    // 修改密码
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
    // 退出登录
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
      })
  }
})

export const { clearError } = userSlice.actions
export default userSlice.reducer
