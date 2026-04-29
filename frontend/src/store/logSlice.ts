import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

interface LogState {
  logs: any[]
  log: any | null
  stats: any | null
  loading: boolean
  error: string | null
}

const initialState: LogState = {
  logs: [],
  log: null,
  stats: null,
  loading: false,
  error: null
}

// 获取训练记录列表异步action
export const getLogs = createAsyncThunk(
  'log/getLogs',
  async (params: any, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/logs', {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data.logs
    } catch (error: any) {
      return rejectWithValue(error.response.data.error)
    }
  }
)

// 获取训练记录详情异步action
export const getLogDetail = createAsyncThunk(
  'log/getLogDetail',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/logs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data.log
    } catch (error: any) {
      return rejectWithValue(error.response.data.error)
    }
  }
)

// 创建训练记录异步action
export const createLog = createAsyncThunk(
  'log/createLog',
  async (logData: any, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('/api/logs', logData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data.log
    } catch (error: any) {
      return rejectWithValue(error.response.data.error)
    }
  }
)

// 更新训练记录异步action
export const updateLog = createAsyncThunk(
  'log/updateLog',
  async ({ id, logData }: { id: string; logData: any }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`/api/logs/${id}`, logData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data.log
    } catch (error: any) {
      return rejectWithValue(error.response.data.error)
    }
  }
)

// 删除训练记录异步action
export const deleteLog = createAsyncThunk(
  'log/deleteLog',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/logs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return id
    } catch (error: any) {
      return rejectWithValue(error.response.data.error)
    }
  }
)

// 获取训练统计数据异步action
export const getStats = createAsyncThunk(
  'log/getStats',
  async (params: any, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/logs/stats', {
        params,
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

const logSlice = createSlice({
  name: 'log',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearLog: (state) => {
      state.log = null
    },
    clearStats: (state) => {
      state.stats = null
    }
  },
  extraReducers: (builder) => {
    // 获取训练记录列表
    builder
      .addCase(getLogs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getLogs.fulfilled, (state, action) => {
        state.loading = false
        state.logs = action.payload
      })
      .addCase(getLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
    // 获取训练记录详情
    builder
      .addCase(getLogDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getLogDetail.fulfilled, (state, action) => {
        state.loading = false
        state.log = action.payload
      })
      .addCase(getLogDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
    // 创建训练记录
    builder
      .addCase(createLog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createLog.fulfilled, (state, action) => {
        state.loading = false
        state.logs.unshift(action.payload)
      })
      .addCase(createLog.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
    // 更新训练记录
    builder
      .addCase(updateLog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateLog.fulfilled, (state, action) => {
        state.loading = false
        const index = state.logs.findIndex(log => log.id === action.payload.id)
        if (index !== -1) {
          state.logs[index] = action.payload
        }
        if (state.log && state.log.id === action.payload.id) {
          state.log = action.payload
        }
      })
      .addCase(updateLog.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
    // 删除训练记录
    builder
      .addCase(deleteLog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteLog.fulfilled, (state, action) => {
        state.loading = false
        state.logs = state.logs.filter(log => log.id !== action.payload)
      })
      .addCase(deleteLog.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
    // 获取训练统计数据
    builder
      .addCase(getStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(getStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError, clearLog, clearStats } = logSlice.actions
export default logSlice.reducer
