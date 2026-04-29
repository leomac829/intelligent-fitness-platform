import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, Card, Button, Form, Select, InputNumber, message, Spin } from 'antd'
import { LeftOutlined, RocketOutlined, SaveOutlined, EyeOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select

const TanChengyiPlanConfig: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)

  // 处理生成计划
  const handleGenerate = async (values: any) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        message.error('请先登录')
        navigate('/login')
        return
      }

      // 构建请求数据
      const requestData = {
        fitness_level: values.fitness_level,
        training_goal: values.training_goal,
        weekly_training_days: values.weekly_training_days,
        base_weight: values.base_weight,
        progressive_rate: values.progressive_rate / 100,
        plan_weeks: values.plan_weeks
      }

      const response = await fetch('http://localhost:3002/api/three-split-plans/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        const data = await response.json()
        message.success('训练计划生成成功')
        // 跳转到预览页面
        navigate('/tanchengyi-preview', { state: { planData: data.data, config: values } })
      } else {
        const error = await response.json()
        message.error(error.error || '生成训练计划失败')
      }
    } catch (error) {
      message.error('生成训练计划失败')
    } finally {
      setLoading(false)
    }
  }

  // 处理预览（不保存）
  const handlePreview = async (values: any) => {
    setPreviewLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        message.error('请先登录')
        navigate('/login')
        return
      }

      const requestData = {
        fitness_level: values.fitness_level,
        training_goal: values.training_goal,
        weekly_training_days: values.weekly_training_days,
        base_weight: values.base_weight,
        progressive_rate: values.progressive_rate / 100,
        plan_weeks: values.plan_weeks
      }

      const response = await fetch('http://localhost:3002/api/three-split-plans/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        const data = await response.json()
        message.success('预览数据加载成功')
        navigate('/tanchengyi-preview', { state: { planData: data.data, config: values } })
      } else {
        const error = await response.json()
        message.error(error.error || '预览失败')
      }
    } catch (error) {
      message.error('预览失败')
    } finally {
      setPreviewLoading(false)
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

      <div className="relative z-10 p-6 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
        <style>{`
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
          .ant-input,
          .ant-input-textarea,
          .ant-select-selector,
          .ant-input-number {
            background-color: rgba(255, 255, 255, 0.05) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
            color: white !important;
          }
          .ant-input::placeholder,
          .ant-input-textarea::placeholder {
            color: rgba(255, 255, 255, 0.4) !important;
          }
          .ant-input:focus,
          .ant-input-textarea:focus,
          .ant-select-selector:focus-within,
          .ant-input-number:focus,
          .ant-input-number-focused {
            border-color: rgba(255, 255, 255, 0.4) !important;
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1) !important;
          }
          .ant-input-number-input {
            color: white !important;
          }
          .ant-input-number-handler-wrap button {
            background-color: rgba(255, 255, 255, 0.1) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
          }
          .ant-input-number-handler-wrap button:hover {
            background-color: rgba(255, 255, 255, 0.2) !important;
          }
          .ant-form-item-label > label {
            color: rgba(255, 255, 255, 0.8) !important;
          }
          .ant-form-item-explain-error {
            color: #ff4d4f !important;
          }
        `}</style>

        <div className="flex items-center mb-6">
          <Button
            icon={<LeftOutlined />}
            onClick={() => navigate('/plans')}
            className="mr-4 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white"
          >
            返回
          </Button>
          <Title level={2} style={{ color: 'white' }}>谭成义三分化训练计划</Title>
        </div>

        <div className="mb-6 p-4 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20">
          <Text style={{ color: 'white', fontSize: '16px' }}>
            🎯 本计划基于抖音@凯圣王《谭成义三分化》视频内容，包含推/拉/腿三个训练日的完整动作库
          </Text>
        </div>

        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 transition-all duration-700 ease-out hover:scale-[1.01] hover:bg-white/15">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleGenerate}
            initialValues={{
              fitness_level: 'intermediate',
              training_goal: 'muscle_gain',
              weekly_training_days: 3,
              base_weight: 50,
              progressive_rate: 5,
              plan_weeks: 4
            }}
          >
            <Form.Item
              name="fitness_level"
              label="健身基础"
              rules={[{ required: true, message: '请选择健身基础' }]}
            >
              <Select placeholder="请选择健身基础" className="bg-white/5 border border-white/20 text-white">
                <Option value="beginner">新手</Option>
                <Option value="intermediate">中级</Option>
                <Option value="advanced">高级</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="training_goal"
              label="训练目标"
              rules={[{ required: true, message: '请选择训练目标' }]}
            >
              <Select placeholder="请选择训练目标" className="bg-white/5 border border-white/20 text-white">
                <Option value="muscle_gain">增肌</Option>
                <Option value="strength">力量</Option>
                <Option value="fat_loss">减脂</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="weekly_training_days"
              label="每周训练天数"
              rules={[{ required: true, message: '请选择每周训练天数' }]}
            >
              <Select placeholder="请选择每周训练天数" className="bg-white/5 border border-white/20 text-white">
                <Option value={3}>3天（推/拉/腿各1次）</Option>
                <Option value={6}>6天（推/拉/腿各2次）</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="base_weight"
              label="基础重量（kg）"
              rules={[{ required: true, message: '请输入基础重量' }]}
            >
              <InputNumber
                min={10}
                max={200}
                placeholder="请输入基础重量"
                className="bg-white/5 border border-white/20 text-white w-full"
              />
            </Form.Item>

            <Form.Item
              name="progressive_rate"
              label="渐进超负荷率（%）"
              rules={[{ required: true, message: '请输入渐进超负荷率' }]}
            >
              <InputNumber
                min={5}
                max={10}
                placeholder="请输入渐进超负荷率（5-10）"
                className="bg-white/5 border border-white/20 text-white w-full"
              />
            </Form.Item>

            <Form.Item
              name="plan_weeks"
              label="计划周期（周）"
              rules={[{ required: true, message: '请输入计划周期' }]}
            >
              <InputNumber
                min={1}
                max={52}
                placeholder="请输入计划周期"
                className="bg-white/5 border border-white/20 text-white w-full"
              />
            </Form.Item>
          </Form>
        </Card>

        <div className="flex justify-end space-x-4 mt-6">
          <Button
            onClick={() => navigate('/plans')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white"
          >
            取消
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={() => form.validateFields().then(handlePreview)}
            loading={previewLoading}
            className="bg-purple-500/30 hover:bg-purple-500/50 border border-purple-500/50 hover:border-purple-500/70 text-white"
          >
            预览
          </Button>
          <Button
            icon={<RocketOutlined />}
            onClick={() => form.submit()}
            loading={loading}
            className="bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 hover:border-blue-500/70 text-white"
          >
            生成计划
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TanChengyiPlanConfig
