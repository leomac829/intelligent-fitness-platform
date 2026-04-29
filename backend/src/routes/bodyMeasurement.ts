import express from 'express';
import BodyMeasurement from '../models/BodyMeasurement';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 创建身体数据记录
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }

  try {
    const { date, weight, bodyFat, muscleMass, chest, waist, hips, biceps, thighs, notes } = req.body;

    // 获取最新的身体数据记录，用于合并数据
    const latestRecord = await BodyMeasurement.findOne({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    // 合并数据：使用新值或保留最新记录中的值
    // 正确解析本地日期字符串（如 2026-04-26），避免时区偏移
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    
    const bodyMeasurement = await BodyMeasurement.create({
      userId: req.user.id,
      date: localDate,
      weight: weight != null ? parseFloat(weight) : (latestRecord?.weight || null),
      bodyFat: bodyFat != null ? parseFloat(bodyFat) : (latestRecord?.bodyFat || null),
      muscleMass: muscleMass != null ? parseFloat(muscleMass) : (latestRecord?.muscleMass || null),
      chest: chest != null ? parseFloat(chest) : (latestRecord?.chest || null),
      waist: waist != null ? parseFloat(waist) : (latestRecord?.waist || null),
      hips: hips != null ? parseFloat(hips) : (latestRecord?.hips || null),
      biceps: biceps != null ? parseFloat(biceps) : (latestRecord?.biceps || null),
      thighs: thighs != null ? parseFloat(thighs) : (latestRecord?.thighs || null),
      notes: notes || (latestRecord?.notes || null)
    } as any);

    res.status(201).json({ bodyMeasurement: bodyMeasurement.toJSON() });
  } catch (error) {
    console.error('创建身体数据记录失败:', error);
    res.status(500).json({ error: '创建身体数据记录失败' });
  }
});

// 获取用户的身体数据记录列表
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }

  try {
    const { page = 1, limit = 10 } = req.query;

    const measurements = await BodyMeasurement.findAndCountAll({
      where: { userId: req.user.id },
      order: [['date', 'DESC']],
      limit: parseInt(limit as string),
      offset: (parseInt(page as string) - 1) * parseInt(limit as string)
    });

    res.status(200).json({
      measurements: measurements.rows,
      total: measurements.count,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });
  } catch (error) {
    console.error('获取身体数据记录失败:', error);
    res.status(500).json({ error: '获取身体数据记录失败' });
  }
});

// 获取身体数据记录详情
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }

  try {
    const measurement = await BodyMeasurement.findByPk(req.params.id);

    if (!measurement) {
      return res.status(404).json({ error: '身体数据记录不存在' });
    }

    // 验证权限
    if (measurement.userId !== req.user.id) {
      return res.status(403).json({ error: '无权限访问' });
    }

    res.status(200).json({ bodyMeasurement: measurement.toJSON() });
  } catch (error) {
    console.error('获取身体数据记录详情失败:', error);
    res.status(500).json({ error: '获取身体数据记录详情失败' });
  }
});

// 更新身体数据记录
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }

  try {
    const measurement = await BodyMeasurement.findByPk(req.params.id);

    if (!measurement) {
      return res.status(404).json({ error: '身体数据记录不存在' });
    }

    // 验证权限
    if (measurement.userId !== req.user.id) {
      return res.status(403).json({ error: '无权限修改' });
    }

    const { date, weight, bodyFat, muscleMass, chest, waist, hips, biceps, thighs, notes } = req.body;

    // 正确解析本地日期字符串（如 2026-04-26），避免时区偏移
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);

    await measurement.update({
      date: localDate,
      weight: parseFloat(weight),
      bodyFat: parseFloat(bodyFat),
      muscleMass: parseFloat(muscleMass),
      chest: chest ? parseFloat(chest) : null,
      waist: waist ? parseFloat(waist) : null,
      hips: hips ? parseFloat(hips) : null,
      biceps: biceps ? parseFloat(biceps) : null,
      thighs: thighs ? parseFloat(thighs) : null,
      notes
    } as any);

    res.status(200).json({ bodyMeasurement: measurement.toJSON() });
  } catch (error) {
    console.error('更新身体数据记录失败:', error);
    res.status(500).json({ error: '更新身体数据记录失败' });
  }
});

// 删除身体数据记录
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }

  try {
    const measurement = await BodyMeasurement.findByPk(req.params.id);

    if (!measurement) {
      return res.status(404).json({ error: '身体数据记录不存在' });
    }

    // 验证权限
    if (measurement.userId !== req.user.id) {
      return res.status(403).json({ error: '无权限删除' });
    }

    await measurement.destroy();
    res.status(200).json({ message: '身体数据记录已删除' });
  } catch (error) {
    console.error('删除身体数据记录失败:', error);
    res.status(500).json({ error: '删除身体数据记录失败' });
  }
});

// 获取身体数据统计
router.get('/stats/summary', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }

  try {
    // 获取历史数据（最近30条）
    const historyData = await BodyMeasurement.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 30
    });
    
    // 反转数组，使其按日期升序排列
    historyData.reverse();
    
    // 聚合所有记录的最新值（从不同日期的记录中获取每个字段的最新非空值）
    const aggregatedLatest: any = {};
    
    if (historyData.length > 0) {
      // 从最新到最旧遍历，保留每个字段的第一个非空值
      for (let i = historyData.length - 1; i >= 0; i--) {
        const record = historyData[i].toJSON();
        
        // 对于每个字段，如果还没有值且当前记录有值，则使用当前值
        if (!aggregatedLatest.weight && record.weight != null) {
          aggregatedLatest.weight = record.weight;
          aggregatedLatest.date = record.date; // 使用有体重值的日期作为主日期
        }
        if (!aggregatedLatest.bodyFat && record.bodyFat != null) {
          aggregatedLatest.bodyFat = record.bodyFat;
        }
        if (!aggregatedLatest.muscleMass && record.muscleMass != null) {
          aggregatedLatest.muscleMass = record.muscleMass;
        }
        if (!aggregatedLatest.chest && record.chest != null) {
          aggregatedLatest.chest = record.chest;
        }
        if (!aggregatedLatest.waist && record.waist != null) {
          aggregatedLatest.waist = record.waist;
        }
        if (!aggregatedLatest.hips && record.hips != null) {
          aggregatedLatest.hips = record.hips;
        }
        if (!aggregatedLatest.biceps && record.biceps != null) {
          aggregatedLatest.biceps = record.biceps;
        }
        if (!aggregatedLatest.thighs && record.thighs != null) {
          aggregatedLatest.thighs = record.thighs;
        }
      }
      
      // 如果没有设置日期，使用最后一条记录的日期
      if (!aggregatedLatest.date) {
        aggregatedLatest.date = historyData[historyData.length - 1].date;
      }
    }

    // 计算BMI
    let bmi = 0;
    if (aggregatedLatest.weight) {
      // 假设身高存储在用户资料中
      // 这里简化处理，使用默认身高170cm
      const height = 1.7; // 单位：米
      bmi = aggregatedLatest.weight / (height * height);
    }

    res.status(200).json({
      latest: Object.keys(aggregatedLatest).length > 0 ? aggregatedLatest : null,
      history: historyData.map(m => ({
        date: m.date,
        weight: m.weight,
        bodyFat: m.bodyFat,
        muscleMass: m.muscleMass
      })),
      bmi
    });
  } catch (error) {
    console.error('获取身体数据统计失败:', error);
    res.status(500).json({ error: '获取身体数据统计失败' });
  }
});

export default router;