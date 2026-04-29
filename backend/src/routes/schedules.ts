import express from 'express';
import { Op } from 'sequelize';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Schedule from '../models/Schedule';

const router = express.Router();

// 获取用户某月的所有日程
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { year, month } = req.query;
    const where: any = { user_id: req.user.id };

    if (year && month) {
      const startDate = `${year}-${String(Number(month) + 1).padStart(2, '0')}-01`;
      const endDate = new Date(Number(year), Number(month) + 1, 0);
      const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      where.date = {
        [Op.between]: [startDate, endDateStr]
      };
    }

    const schedules = await Schedule.findAll({
      where,
      order: [['date', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: schedules.map(s => ({
        id: s.id,
        date: typeof s.date === 'string' ? s.date : (s.date as any).toISOString?.().split('T')[0] || String(s.date),
        body_parts: s.body_parts
      }))
    });
  } catch (error) {
    res.status(500).json({ error: '获取日程失败' });
  }
});

// 创建或更新某天的日程
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { date, body_parts } = req.body;

    if (!date || !body_parts || !Array.isArray(body_parts)) {
      return res.status(400).json({ error: '日期和训练部位不能为空' });
    }

    // 查找是否已存在该日期的日程
    const existing = await Schedule.findOne({
      where: { user_id: req.user.id, date }
    });

    if (existing) {
      // 更新
      existing.body_parts = body_parts;
      await existing.save();
      return res.status(200).json({
        success: true,
        message: '日程更新成功',
        data: { id: existing.id, date: existing.date, body_parts: existing.body_parts }
      });
    } else {
      // 创建
      const schedule = await Schedule.create({
        user_id: req.user.id,
        date,
        body_parts
      });
      return res.status(201).json({
        success: true,
        message: '日程创建成功',
        data: { id: schedule.id, date: schedule.date, body_parts: schedule.body_parts }
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || '保存日程失败' });
  }
});

// 删除某天日程
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const schedule = await Schedule.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!schedule) {
      return res.status(404).json({ error: '日程不存在' });
    }

    await schedule.destroy();
    res.status(200).json({ success: true, message: '日程删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除日程失败' });
  }
});

export default router;
