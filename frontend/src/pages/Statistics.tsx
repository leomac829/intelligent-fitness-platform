import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Typography, Card, Row, Col, Select, Space, Spin } from 'antd'
import { getStats } from '../store/logSlice.ts'
import * as echarts from 'echarts'

const { Title, Text } = Typography
const { Option } = Select

const Statistics: React.FC = () => {
  const dispatch: any = useDispatch()
  const { stats, loading } = useSelector((state: any) => state.log)
  const [period, setPeriod] = useState('month') // week, month, year

  useEffect(() => {
    // 获取统计数据
    dispatch(getStats({ period }))
  }, [dispatch, period])

  useEffect(() => {
    // 渲染图表
    if (stats) {
      renderCharts()
    }
  }, [stats])

  const renderCharts = () => {
    // 训练频率图表
    const frequencyChart = echarts.init(document.getElementById('frequency-chart'))
    // 生成最近7天的数据
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    const frequencyData = Array(7).fill(0)
    // 这里可以根据实际数据填充
    
    frequencyChart.setOption({
      title: {
        text: '训练频率'
      },
      xAxis: {
        type: 'category',
        data: days
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: frequencyData,
        type: 'bar',
        itemStyle: {
          color: '#1890ff'
        }
      }]
    })

    // 训练量趋势图表
    const volumeChart = echarts.init(document.getElementById('volume-chart'))
    // 生成训练量数据
    const volumeData = []
    if (stats?.exerciseStats) {
      // 计算总训练量
      const totalVolume = stats.exerciseStats.reduce((sum: number, stat: any) => sum + (stat.total_weight || 0), 0)
      // 生成趋势数据
      for (let i = 1; i <= 4; i++) {
        volumeData.push(Math.round(totalVolume * (i / 4)))
      }
    }
    
    volumeChart.setOption({
      title: {
        text: '训练量趋势'
      },
      xAxis: {
        type: 'category',
        data: ['第1周', '第2周', '第3周', '第4周']
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: volumeData.length > 0 ? volumeData : [0, 0, 0, 0],
        type: 'line',
        smooth: true,
        itemStyle: {
          color: '#52c41a'
        }
      }]
    })

    // 肌肉群分布图表
    const muscleChart = echarts.init(document.getElementById('muscle-chart'))
    // 模拟肌肉群分布数据
    const muscleData = [
      { value: 30, name: '胸部' },
      { value: 25, name: '背部' },
      { value: 20, name: '腿部' },
      { value: 15, name: '肩部' },
      { value: 10, name: '手臂' }
    ]
    
    muscleChart.setOption({
      title: {
        text: '肌肉群训练分布'
      },
      series: [{
        type: 'pie',
        data: muscleData,
        radius: '60%',
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    })

    // 响应式调整
    window.addEventListener('resize', () => {
      frequencyChart.resize()
      volumeChart.resize()
      muscleChart.resize()
    })
  }

  return (
    <div>
      <Title level={2}>训练统计</Title>
      
      {/* 时间范围选择 */}
      <Card className="mb-6">
        <Space>
          <Text>时间范围：</Text>
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 120 }}
          >
            <Option value="week">周</Option>
            <Option value="month">月</Option>
            <Option value="year">年</Option>
          </Select>
        </Space>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={6}>
          <Card>
            <Text strong>训练次数：</Text>
            <Text className="text-2xl ml-2">{stats?.logCount || 0}</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Text strong>训练总时长：</Text>
            <Text className="text-2xl ml-2">{stats?.totalDuration || 0}分钟</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Text strong>总训练量：</Text>
            <Text className="text-2xl ml-2">
              {stats?.exerciseStats ? 
                stats.exerciseStats.reduce((sum: number, stat: any) => sum + (stat.total_weight || 0), 0)
                : 0
              }kg
            </Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Text strong>平均强度：</Text>
            <Text className="text-2xl ml-2">
              {stats?.exerciseStats && stats.exerciseStats.length > 0 ? 
                Math.round(stats.exerciseStats.reduce((sum: number, stat: any) => sum + (stat.total_weight || 0), 0) / stats.exerciseStats.length)
                : 0
              }
            </Text>
          </Card>
        </Col>
      </Row>

      {/* 图表 */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card>
              <div id="frequency-chart" style={{ height: 300 }}></div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <div id="volume-chart" style={{ height: 300 }}></div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <div id="muscle-chart" style={{ height: 300 }}></div>
            </Card>
          </Col>
        </Row>
      )}

      {/* 训练动作统计 */}
      <Card className="mt-6">
        <Title level={3}>训练动作统计</Title>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">动作</th>
                <th className="p-2 text-left">训练次数</th>
                <th className="p-2 text-left">总次数</th>
                <th className="p-2 text-left">总重量</th>
              </tr>
            </thead>
            <tbody>
              {stats?.exerciseStats?.map((stat: any, index: number) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{stat.exercise?.name}</td>
                  <td className="p-2">{stat.count}</td>
                  <td className="p-2">{stat.total_reps}</td>
                  <td className="p-2">{stat.total_weight}kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default Statistics
