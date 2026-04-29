import { useState, useEffect, useRef, useCallback } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

const { Option } = Select

interface User {
  id: string
  username: string
  email: string
  name: string
  gender: string
  age: number
  fitness_level: string
  created_at: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [addForm] = Form.useForm()
  const [editForm] = Form.useForm()
  
  // 防抖控制：防止重复点击打开模态框
  const isOpeningRef = useRef(false)
  // 防抖控制：防止模态框关闭过程中被重新打开
  const isClosingRef = useRef(false)

  // 组件加载时获取用户数据
  useEffect(() => {
    loadUsers()
  }, [])

  // 加载用户数据（从后端API获取）
  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3002/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        message.error('获取用户列表失败')
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
      message.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 打开添加用户模态框（带防抖和事件冒泡阻止）
  const handleAddUser = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // 防抖：如果正在打开或关闭过程中，忽略点击
    if (isOpeningRef.current || isClosingRef.current) {
      return
    }
    
    isOpeningRef.current = true
    
    addForm.resetFields()
    setCurrentUser(null)
    
    // 使用setTimeout确保状态更新完成后再允许下次操作
    setTimeout(() => {
      setAddModalVisible(true)
      setTimeout(() => {
        isOpeningRef.current = false
      }, 300)
    }, 0)
  }, [addForm])

  const handleEditUser = (user: User) => {
    setCurrentUser(user)
    editForm.setFieldsValue(user)
    setEditModalVisible(true)
  }

  // 删除用户（调用后端API）
  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:3002/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        message.success('用户删除成功')
        loadUsers() // 刷新用户列表
      } else {
        const data = await response.json()
        message.error(data.error || '删除用户失败')
      }
    } catch (error) {
      console.error('删除用户失败:', error)
      message.error('删除用户失败')
    }
  }

  // 保存添加用户（调用后端注册API）
  const handleSaveAddUser = async (values: any) => {
    // 防止重复提交
    if (isClosingRef.current) return
    
    isClosingRef.current = true
    
    try {
      const response = await fetch('http://localhost:3002/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(values)
      })

      if (response.ok) {
        message.success('用户添加成功')
        loadUsers() // 刷新用户列表
        setAddModalVisible(false)
      } else {
        const data = await response.json()
        message.error(data.error || '添加用户失败')
      }
    } catch (error) {
      console.error('添加用户失败:', error)
      message.error('添加用户失败')
    } finally {
      // 延迟重置状态，防止立即重新打开
      setTimeout(() => {
        isClosingRef.current = false
      }, 500)
    }
  }

  // 保存编辑用户（调用后端API）
  const handleSaveEditUser = async (values: any) => {
    // 防止重复提交
    if (isClosingRef.current) return
    
    isClosingRef.current = true
    
    if (currentUser) {
      try {
        const response = await fetch(`http://localhost:3002/api/auth/users/${currentUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(values)
        })

        if (response.ok) {
          message.success('用户更新成功')
          loadUsers() // 刷新用户列表
          setEditModalVisible(false)
        } else {
          const data = await response.json()
          message.error(data.error || '更新用户失败')
        }
      } catch (error) {
        console.error('更新用户失败:', error)
        message.error('更新用户失败')
      } finally {
        // 延迟重置状态，防止立即重新打开
        setTimeout(() => {
          isClosingRef.current = false
        }, 500)
      }
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: string) => {
        switch (gender) {
          case 'male': return '男'
          case 'female': return '女'
          case 'other': return '其他'
          default: return '-'
        }
      }
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age'
    },
    {
      title: '健身水平',
      dataIndex: 'fitness_level',
      key: 'fitness_level',
      render: (level: string) => {
        switch (level) {
          case 'beginner': return '初学者'
          case 'intermediate': return '中级'
          case 'advanced': return '高级'
          default: return '-'
        }
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: User) => (
        <div className="flex space-x-2">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditUser(record)}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white"
          />
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{
              className: 'bg-red-500/80 hover:bg-red-600 border-red-400 text-white'
            }}
            cancelButtonProps={{
              className: 'bg-white/10 hover:bg-white/20 border-white/30 text-white'
            }}
            styles={{
              body: {
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)'
              },
              content: {
                color: '#fff'
              },
              actions: {
                border: 'none'
              }
            }}
          >
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-white"
            />
          </Popconfirm>
        </div>
      )
    }
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">用户管理</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={(e) => handleAddUser(e)}
          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white"
        >
          添加用户
        </Button>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl p-4">
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true
          }}
          className="text-white"
          style={{
            backgroundColor: 'transparent'
          }}
        />
      </div>

      {/* 添加用户模态框 */}
      <Modal
        title="添加用户"
        open={addModalVisible}
        onCancel={() => {
          // 防止重复关闭
          if (isClosingRef.current) return
          
          isClosingRef.current = true
          setAddModalVisible(false)
          
          // 确保模态框完全关闭后，才允许重新打开
          setTimeout(() => {
            isClosingRef.current = false
          }, 500)
        }}
        onOk={() => addForm.submit()}
        className="text-white"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)'
        }}
        destroyOnClose={true}
        maskClosable={false}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleSaveAddUser}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input 
              placeholder="请输入用户名" 
              className="bg-white/10 border border-white/20 text-white placeholder-gray-400"
            />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入有效的邮箱地址' }]}
          >
            <Input 
              placeholder="请输入邮箱" 
              className="bg-white/10 border border-white/20 text-white placeholder-gray-400"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password 
              placeholder="请输入密码" 
              className="bg-white/10 border border-white/20 text-white placeholder-gray-400"
            />
          </Form.Item>
          <Form.Item
            name="name"
            label="姓名"
          >
            <Input 
              placeholder="请输入姓名" 
              className="bg-white/10 border border-white/20 text-white placeholder-gray-400"
            />
          </Form.Item>
          <Form.Item
            name="gender"
            label="性别"
          >
            <Select 
              placeholder="请选择性别"
              className="bg-white/10 border border-white/20 text-white"
            >
              <Option value="male">男</Option>
              <Option value="female">女</Option>
              <Option value="other">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="age"
            label="年龄"
          >
            <Input 
              type="number" 
              placeholder="请输入年龄" 
              className="bg-white/10 border border-white/20 text-white placeholder-gray-400"
            />
          </Form.Item>
          <Form.Item
            name="fitness_level"
            label="健身水平"
          >
            <Select 
              placeholder="请选择健身水平"
              className="bg-white/10 border border-white/20 text-white"
            >
              <Option value="beginner">初学者</Option>
              <Option value="intermediate">中级</Option>
              <Option value="advanced">高级</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑用户模态框 */}
      <Modal
        title="编辑用户"
        open={editModalVisible}
        onCancel={() => {
          // 防止重复关闭
          if (isClosingRef.current) return
          
          isClosingRef.current = true
          setEditModalVisible(false)
          
          // 确保模态框完全关闭后，才允许重新打开
          setTimeout(() => {
            isClosingRef.current = false
          }, 500)
        }}
        onOk={() => editForm.submit()}
        className="text-white"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)'
        }}
        destroyOnClose={true}
        maskClosable={false}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleSaveEditUser}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input 
              placeholder="请输入用户名" 
              className="bg-white/10 border border-white/20 text-white placeholder-gray-400"
            />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入有效的邮箱地址' }]}
          >
            <Input 
              placeholder="请输入邮箱" 
              className="bg-white/10 border border-white/20 text-white placeholder-gray-400"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: false, message: '请输入密码' }]}
          >
            <Input.Password 
              placeholder="请输入密码（可选）" 
              className="bg-white/10 border border-white/20 text-white placeholder-gray-400"
            />
          </Form.Item>
          <Form.Item
            name="name"
            label="姓名"
          >
            <Input 
              placeholder="请输入姓名" 
              className="bg-white/10 border border-white/20 text-white placeholder-gray-400"
            />
          </Form.Item>
          <Form.Item
            name="gender"
            label="性别"
          >
            <Select 
              placeholder="请选择性别"
              className="bg-white/10 border border-white/20 text-white"
            >
              <Option value="male">男</Option>
              <Option value="female">女</Option>
              <Option value="other">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="age"
            label="年龄"
          >
            <Input 
              type="number" 
              placeholder="请输入年龄" 
              className="bg-white/10 border border-white/20 text-white placeholder-gray-400"
            />
          </Form.Item>
          <Form.Item
            name="fitness_level"
            label="健身水平"
          >
            <Select 
              placeholder="请选择健身水平"
              className="bg-white/10 border border-white/20 text-white"
            >
              <Option value="beginner">初学者</Option>
              <Option value="intermediate">中级</Option>
              <Option value="advanced">高级</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
