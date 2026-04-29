import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Typography, Card, Row, Col, Button, Space, Spin, Table } from 'antd'
import { DownloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getLogDetail } from '../store/logSlice.ts'

const { Title, Text } = Typography

const LogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const dispatch: any = useDispatch()
  const { log, loading } = useSelector((state: any) => state.log)

  useEffect(() => {
    if (id) {
      dispatch(getLogDetail(id as string))
    }
  }, [dispatch, id])

  if (loading || !log) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  // 按动作分组训练项
  const groupedItems: any = {}
  log.training_log_items?.forEach((item: any) => {
    const exerciseId = item.exercise_id
    if (!groupedItems[exerciseId]) {
      groupedItems[exerciseId] = {
        exercise: item.exercise,
        sets: []
      }
    }
    groupedItems[exerciseId].sets.push({
      set_number: item.set_number,
      reps: item.reps,
      weight: item.weight
    })
  })

  // 训练项表格列定义
  const columns = [
    {
      title: '组数',
      dataIndex: 'set_number',
      key: 'set_number'
    },
    {
      title: '次数',
      dataIndex: 'reps',
      key: 'reps'
    },
    {
      title: '重量',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight: number) => `${weight}kg`
    }
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>训练记录详情</Title>
        <Space>
          <Button icon={<DownloadOutlined />}>导出</Button>
          <Button icon={<EditOutlined />}>编辑</Button>
          <Button icon={<DeleteOutlined />} danger>删除</Button>
        </Space>
      </div>

      {/* 记录信息 */}
      <Card className="mb-6">
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Text strong>训练日期：</Text>
            <Text>{new Date(log.date).toLocaleDateString()}</Text>
          </Col>
          <Col span={6}>
            <Text strong>训练时长：</Text>
            <Text>{log.duration}分钟</Text>
          </Col>
          <Col span={12}>
            <Text strong>训练笔记：</Text>
            <Text>{log.notes || '无'}</Text>
          </Col>
        </Row>
      </Card>

      {/* 训练内容 */}
      <Title level={3}>训练内容</Title>
      {Object.values(groupedItems).map((group: any, index) => (
        <Card key={index} className="mb-4">
          <Title level={4}>{group.exercise.name}</Title>
          <Table
            dataSource={group.sets}
            columns={columns}
            rowKey="set_number"
            pagination={false}
          />
        </Card>
      ))}
    </div>
  )
}

export default LogDetail
