import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// 导入reducers
import userReducer from './store/userSlice.ts'
import logReducer from './store/logSlice.ts'

// 配置Redux存储
const store = configureStore({
  reducer: {
    user: userReducer,
    log: logReducer
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </React.StrictMode>,
)
