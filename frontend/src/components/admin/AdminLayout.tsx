import React from 'react'
import { Menu, Layout } from 'antd'
import { DashboardOutlined, UserOutlined, FileTextOutlined, HomeOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const { Sider, Content } = Layout

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()

  // 处理菜单项点击
  const handleMenuClick = (key: string) => {
    navigate(key)
  }

  // 菜单项配置
  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: '控制台'
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: '用户管理'
    },
    {
      key: '/admin/exercises',
      icon: <FileTextOutlined />,
      label: '视频库管理'
    },
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '返回前台'
    }
  ]

  return (
    <div className="h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/GG.jpg')`,
        }}
      />
      <div className="bg-black/30 absolute inset-0" />

      <style>{`
        /* Table Styles */
        .ant-table {
          background: transparent !important;
        }
        
        .ant-table-container {
          background: transparent !important;
        }
        
        .ant-table-content {
          background: transparent !important;
        }
        
        .ant-table-thead > tr > th {
          background: rgba(255, 255, 255, 0.1) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
          color: white !important;
        }
        
        .ant-table-tbody > tr > td {
          background: transparent !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: white !important;
        }
        
        .ant-table-tbody > tr:hover > td {
          background: rgba(255, 255, 255, 0.05) !important;
        }
        
        /* Pagination Styles */
        .ant-pagination {
          background: transparent !important;
        }
        
        .ant-pagination-item {
          background: rgba(255, 255, 255, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          color: white !important;
        }
        
        .ant-pagination-item:hover {
          background: rgba(255, 255, 255, 0.2) !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
        }
        
        .ant-pagination-item-active {
          background: rgba(255, 255, 255, 0.3) !important;
          border-color: rgba(255, 255, 255, 0.4) !important;
        }
        
        .ant-pagination-prev, 
        .ant-pagination-next {
          background: rgba(255, 255, 255, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          color: white !important;
        }
        
        .ant-pagination-prev:hover, 
        .ant-pagination-next:hover {
          background: rgba(255, 255, 255, 0.2) !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
        }
        
        /* Select Styles for Pagination */
        .ant-select-selector {
          background: rgba(255, 255, 255, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
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
      `}</style>

      <div className="relative z-10 p-6 grid grid-cols-12 gap-6 h-screen">
        {/* 侧边栏 */}
        <div className="col-span-3">
          <div className="h-full p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white">管理后台</h2>
            </div>
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              onSelect={(item) => handleMenuClick(item.key as string)}
              style={{ 
                background: 'transparent',
                height: '100%',
                borderRight: 0
              }}
              items={menuItems.map(item => ({
                ...item,
                style: {
                  margin: '4px 8px',
                  borderRadius: '8px'
                },
                className: 'text-white/80 hover:text-white hover:bg-white/10'
              }))}
            />
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="col-span-9 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  )
}
