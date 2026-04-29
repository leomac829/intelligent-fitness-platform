import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Input, Button, Alert, Card, Typography, Select, Space } from 'antd'
import { updateProfile, changePassword, clearError } from '../store/userSlice.ts'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography
const { Option } = Select

const Profile: React.FC = () => {
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const dispatch: any = useDispatch()
  const navigate = useNavigate()
  const { user, loading, error } = useSelector((state: any) => state.user)
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        gender: user.gender,
        age: user.age,
        height: user.height,
        weight: user.weight,
        fitness_level: user.fitness_level
      })
    }
  }, [user, form])

  const handleProfileUpdate = async (values: any) => {
    dispatch(clearError())
    const result = await dispatch(updateProfile(values))
    if (updateProfile.fulfilled.match(result)) {
      alert('资料更新成功')
    }
  }

  const handlePasswordChange = async (values: any) => {
    dispatch(clearError())
    const result = await dispatch(changePassword(values))
    if (changePassword.fulfilled.match(result)) {
      alert('密码修改成功')
      passwordForm.resetFields()
    }
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="flex justify-center items-start py-8">
      <Card style={{ width: 500 }}>
        <Title level={3} className="text-center mb-6">个人资料</Title>
        
        {error && (
          <Alert
            message="操作失败"
            description={error}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        <div className="mb-6">
          <Space>
            <Button 
              type={activeTab === 'profile' ? 'primary' : 'default'}
              onClick={() => setActiveTab('profile')}
            >
              基本资料
            </Button>
            <Button 
              type={activeTab === 'password' ? 'primary' : 'default'}
              onClick={() => setActiveTab('password')}
            >
              修改密码
            </Button>
          </Space>
        </div>

        {activeTab === 'profile' && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleProfileUpdate}
          >
            <Form.Item
              name="name"
              label="姓名"
            >
              <Input placeholder="请输入姓名" />
            </Form.Item>

            <Form.Item
              name="gender"
              label="性别"
            >
              <Select placeholder="请选择性别">
                <Option value="male">男</Option>
                <Option value="female">女</Option>
                <Option value="other">其他</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="age"
              label="年龄"
            >
              <Input type="number" placeholder="请输入年龄" />
            </Form.Item>

            <Form.Item
              name="height"
              label="身高 (cm)"
            >
              <Input type="number" placeholder="请输入身高" />
            </Form.Item>

            <Form.Item
              name="weight"
              label="体重 (kg)"
            >
              <Input type="number" placeholder="请输入体重" />
            </Form.Item>

            <Form.Item
              name="fitness_level"
              label="健身水平"
            >
              <Select placeholder="请选择健身水平">
                <Option value="beginner">新手</Option>
                <Option value="intermediate">中级</Option>
                <Option value="advanced">高级</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="w-full" 
                loading={loading}
              >
                保存修改
              </Button>
            </Form.Item>
          </Form>
        )}

        {activeTab === 'password' && (
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordChange}
          >
            <Form.Item
              name="oldPassword"
              label="旧密码"
              rules={[{ required: true, message: '请输入旧密码' }]}
            >
              <Input.Password placeholder="请输入旧密码" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[{ required: true, message: '请输入新密码' }, { min: 6, message: '密码长度至少为6位' }]}
            >
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="w-full" 
                loading={loading}
              >
                修改密码
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  )
}

export default Profile