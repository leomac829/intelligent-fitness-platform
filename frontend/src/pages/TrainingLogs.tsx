import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Typography, Card, Button, Space, Spin, List, Avatar, DatePicker, Input, Modal, Form, Select, message } from 'antd'
import { CalendarOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getLogs, createLog } from '../store/logSlice.ts'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

const TrainingLogs: React.FC = () => {
  const dispatch: any = useDispatch()
  const { logs, loading } = useSelector((state: any) => state.log)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [logForm] = Form.useForm()
  const [logItems, setLogItems] = useState<any[]>([{ exercise_id: '', sets: 3, reps: 10, weight: 0 }])
  const [exercises, setExercises] = useState<any[]>([])

  useEffect(() => {
    // 获取训练记录
    dispatch(getLogs({}))
    // 获取动作列表
    fetch('http://localhost:3002/api/training-exercises/data')
      .then(res => res.json())
      .then(data => setExercises(data.exercises || []))
      .catch(err => console.error('加载动作列表失败:', err))
  }, [dispatch])

  const handleAddItem = () => {
    setLogItems([...logItems, { exercise_id: '', sets: 3, reps: 10, weight: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...logItems]
    newItems.splice(index, 1)
    setLogItems(newItems)
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...logItems]
    newItems[index][field] = value
    setLogItems(newItems)
  }

  const handleSubmit = async (values: any) => {
    const logData = {
      ...values,
      items: logItems
    }
    const result = await dispatch(createLog(logData))
    if (createLog.fulfilled.match(result)) {
      message.success('训练记录创建成功')
      setIsModalOpen(false)
      logForm.resetFields()
      setLogItems([{ exercise_id: '', sets: 3, reps: 10, weight: 0 }])
      dispatch(getLogs({}))
    } else {
      message.error('训练记录创建失败')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>训练记录</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          添加训练记录
        </Button>
      </div>

      {/* 训练记录列表 */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={logs}
          renderItem={(log: any) => (
            <List.Item
              actions={[
                <Button type="link" key="view" href={`/logs/${log.id}`}>
                  查看详情
                </Button>,
                <Button type="link" key="edit" icon={<EditOutlined />}>
                  编辑
                </Button>,
                <Button type="link" key="delete" icon={<DeleteOutlined />} danger>
                  删除
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<CalendarOutlined />} />}
                title={new Date(log.date).toLocaleDateString()}
                description={
                  <div>
                    <Text>训练时长：{log.duration}分钟</Text>
                    <Text className="ml-4">训练项：{log.training_log_items?.length || 0}项</Text>
                    {log.notes && (
                      <Text className="block mt-2" type="secondary">{log.notes}</Text>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}

      {/* 添加训练记录模态框 */}
      <Modal
        title="添加训练记录"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          logForm.resetFields()
          setLogItems([{ exercise_id: '', sets: 3, reps: 10, weight: 0 }])
        }}
        footer={null}
      >
        <Form form={logForm} onFinish={handleSubmit}>
          <Form.Item
            name="date"
            label="训练日期"
            rules={[{ required: true, message: '请选择训练日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="duration"
            label="训练时长（分钟）"
            rules={[{ required: true, message: '请输入训练时长' }]}
          >
            <Input type="number" placeholder="请输入训练时长" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="训练笔记"
          >
            <TextArea rows={4} placeholder="请输入训练笔记" />
          </Form.Item>

          <Form.Item label="训练项">
            {logItems.map((item, index) => (
              <Card key={index} className="mb-4">
                <div className="flex justify-between items-center mb-4">
                  <Text strong>训练项 {index + 1}</Text>
                  {index > 0 && (
                    <Button danger onClick={() => handleRemoveItem(index)}>删除</Button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Text>动作：</Text>
                    <Select
                      style={{ width: '100%' }}
                      value={item.exercise_id}
                      onChange={(value) => handleItemChange(index, 'exercise_id', value)}
                      placeholder="选择动作"
                    >
                      {exercises.map((exercise: any) => (
                        <Option key={exercise.id} value={exercise.id}>{exercise.name_zh}</Option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Text>组数：</Text>
                    <Input
                      type="number"
                      value={item.sets}
                      onChange={(e) => handleItemChange(index, 'sets', parseInt(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <Text>次数：</Text>
                    <Input
                      type="number"
                      value={item.reps}
                      onChange={(e) => handleItemChange(index, 'reps', parseInt(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <Text>重量（kg）：</Text>
                    <Input
                      type="number"
                      value={item.weight}
                      onChange={(e) => handleItemChange(index, 'weight', parseFloat(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </Card>
            ))}
            <Button type="dashed" onClick={handleAddItem} style={{ width: '100%' }}>
              添加训练项
            </Button>
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => {
                setIsModalOpen(false)
                logForm.resetFields()
                setLogItems([{ exercise_id: '', sets: 3, reps: 10, weight: 0 }])
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TrainingLogs
