import { useState } from 'react'
import { Layout, Menu, Button, Typography, Card } from 'antd'
import { UserOutlined, VideoCameraOutlined, DashboardOutlined } from '@ant-design/icons'
import { Link, Outlet } from 'react-router-dom'

const { Title } = Typography

export function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false)

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
          
          /* Input Styles */
          .ant-input {
            background-color: rgba(255, 255, 255, 0.05) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
            color: white !important;
          }
          
          .ant-input::placeholder {
            color: rgba(255, 255, 255, 0.4) !important;
          }
          
          /* Table Styles */
          .ant-table {
            background-color: rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 12px !important;
          }
          
          .ant-table-thead > tr > th {
            background-color: rgba(255, 255, 255, 0.15) !important;
            color: white !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
          }
          
          .ant-table-tbody > tr > td {
            background-color: transparent !important;
            color: white !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          }
          
          .ant-table-tbody > tr:hover > td {
            background-color: rgba(255, 255, 255, 0.1) !important;
          }
          
          /* Modal Styles */
          .ant-modal-content {
            background-color: rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 12px !important;
            color: white !important;
          }
          
          .ant-modal-header {
            background-color: rgba(255, 255, 255, 0.15) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
          }
          
          .ant-modal-title {
            color: white !important;
          }
          
          .ant-modal-footer {
            background-color: rgba(255, 255, 255, 0.1) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.2) !important;
          }
          
          .ant-btn-primary {
            background-color: rgba(255, 255, 255, 0.2) !important;
            border-color: rgba(255, 255, 255, 0.3) !important;
            color: white !important;
          }
          
          .ant-btn-primary:hover {
            background-color: rgba(255, 255, 255, 0.3) !important;
            border-color: rgba(255, 255, 255, 0.4) !important;
          }
          
          .ant-btn-default {
            background-color: rgba(255, 255, 255, 0.1) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
            color: white !important;
          }
          
          .ant-btn-default:hover {
            background-color: rgba(255, 255, 255, 0.2) !important;
            border-color: rgba(255, 255, 255, 0.3) !important;
          }
        `}</style>
        {/* Left Sidebar Card */}
        <Card className="col-span-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 pb-6 max-h-[calc(100vh-4rem)] overflow-y-auto flex flex-col custom-scrollbar">
          <div className="space-y-6">
            {/* Logo */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">管理后台</h1>
              <p className="text-white/60 text-sm">专业健身管理</p>
            </div>

            {/* Main Navigation */}
            <div>
              <h4 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-3">主菜单</h4>
              <nav className="space-y-2">
                {/* Users Button */}
                <Button
                  className={`w-full justify-start text-base text-white/80 hover:bg-white/20 hover:text-white transition-all duration-700 ease-out hover:scale-[1.02] h-11 border border-white/20 bg-white/20 text-white`}
                  onClick={() => {
                    window.location.href = '/admin/users'
                  }}
                >
                  <UserOutlined className="mr-3 h-5 w-5" />
                  用户管理
                </Button>
                
                {/* Exercises Button */}
                <Button
                  className={`w-full justify-start text-base text-white/80 hover:bg-white/20 hover:text-white transition-all duration-700 ease-out hover:scale-[1.02] h-11 border border-white/20 bg-white/10`}
                  onClick={() => {
                    window.location.href = '/admin/exercises'
                  }}
                >
                  <VideoCameraOutlined className="mr-3 h-5 w-5" />
                  视频库管理
                </Button>
              </nav>
            </div>
          </div>

          <div className="flex-shrink-0 space-y-4 pt-4 border-t border-white/10">
            <div className="space-y-2">
              <Button
                variant="text"
                className="w-full justify-start text-base text-white/80 hover:bg-white/20 hover:text-white transition-all duration-700 ease-out hover:scale-[1.02] h-11 bg-white/10 border border-white/20"
                onClick={() => {
                  localStorage.removeItem('token')
                  window.location.href = '/login'
                }}
              >
                退出登录
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Content Area */}
        <div className="col-span-10 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
