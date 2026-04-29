import express from 'express';
import { Op, Sequelize } from 'sequelize';
import TrainingLog from '../models/TrainingLog';
import TrainingLogItem from '../models/TrainingLogItem';
import Exercise from '../models/Exercise';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 获取训练记录列表
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { start_date, end_date } = req.query;
    const where: any = { user_id: req.user.id };

    if (start_date) {
      where.date = { [Op.gte]: start_date };
    }

    if (end_date) {
      where.date = { ...where.date, [Op.lte]: end_date };
    }

    const logs = await TrainingLog.findAll({ where, order: [['date', 'DESC']] });
    res.status(200).json({ logs });
  } catch (error) {
    res.status(500).json({ error: '获取训练记录失败' });
  }
});

// 获取训练记录详情
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { id } = req.params;
    const log = await TrainingLog.findByPk(id, {
      include: [{
        model: TrainingLogItem,
        include: [Exercise]
      }]
    });

    if (!log) {
      return res.status(404).json({ error: '训练记录不存在' });
    }

    // 检查权限
    if (log.user_id !== req.user.id) {
      return res.status(403).json({ error: '无权限查看此记录' });
    }

    res.status(200).json({ log });
  } catch (error) {
    res.status(500).json({ error: '获取训练记录详情失败' });
  }
});

// 创建训练记录
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { date, notes, duration, items } = req.body;

    const log = await TrainingLog.create({
      user_id: req.user.id,
      date,
      notes,
      duration
    });

    // 添加训练项
    if (items && items.length > 0) {
      for (const item of items) {
        for (let i = 1; i <= item.sets; i++) {
          await TrainingLogItem.create({
            log_id: log.id,
            exercise_id: item.exercise_id,
            set_number: i,
            reps: item.reps,
            weight: item.weight
          });
        }
      }
    }

    res.status(201).json({ log });
  } catch (error) {
    res.status(500).json({ error: '创建训练记录失败' });
  }
});

// 更新训练记录
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { id } = req.params;
    const { date, notes, duration, items } = req.body;

    const log = await TrainingLog.findByPk(id);
    if (!log) {
      return res.status(404).json({ error: '训练记录不存在' });
    }

    // 检查权限
    if (log.user_id !== req.user.id) {
      return res.status(403).json({ error: '无权限修改此记录' });
    }

    await log.update({
      date,
      notes,
      duration
    });

    // 更新训练项
    if (items) {
      // 删除旧的训练项
      await TrainingLogItem.destroy({ where: { log_id: id } });
      // 创建新的训练项
      for (const item of items) {
        for (let i = 1; i <= item.sets; i++) {
          await TrainingLogItem.create({
            log_id: log.id,
            exercise_id: item.exercise_id,
            set_number: i,
            reps: item.reps,
            weight: item.weight
          });
        }
      }
    }

    res.status(200).json({ log });
  } catch (error) {
    res.status(500).json({ error: '更新训练记录失败' });
  }
});

// 删除训练记录
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { id } = req.params;
    const log = await TrainingLog.findByPk(id);

    if (!log) {
      return res.status(404).json({ error: '训练记录不存在' });
    }

    // 检查权限
    if (log.user_id !== req.user.id) {
      return res.status(403).json({ error: '无权限删除此记录' });
    }

    await log.destroy();
    res.status(200).json({ message: '训练记录删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除训练记录失败' });
  }
});

// 获取训练统计数据
router.get('/stats', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { period } = req.query; // period: week, month, year
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // 获取训练次数
    const logCount = await TrainingLog.count({
      where: {
        user_id: req.user.id,
        date: { [Op.gte]: startDate }
      }
    });

    // 获取训练总时长
    const totalDuration = await TrainingLog.sum('duration', {
      where: {
        user_id: req.user.id,
        date: { [Op.gte]: startDate }
      }
    });

    // 获取训练动作分布
    const exerciseStats = await TrainingLogItem.findAll({
      attributes: [
        'exercise_id',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('reps')), 'total_reps'],
        [Sequelize.fn('SUM', Sequelize.col('weight')), 'total_weight']
      ],
      include: [
        {
          model: TrainingLog,
          where: {
            user_id: req.user.id,
            date: { [Op.gte]: startDate }
          }
        },
        Exercise
      ],
      group: ['exercise_id']
    });

    res.status(200).json({
      logCount,
      totalDuration,
      exerciseStats
    });
  } catch (error) {
    res.status(500).json({ error: '获取训练统计数据失败' });
  }
});

export default router;
