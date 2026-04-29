import express from 'express';
import Goal from '../models/Goal';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 获取用户的所有目标
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const goals = await Goal.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    res.status(200).json({ goals });
  } catch (error) {
    res.status(500).json({ error: '获取目标失败' });
  }
});

// 获取目标详情
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { id } = req.params;
    const goal = await Goal.findByPk(id);

    if (!goal) {
      return res.status(404).json({ error: '目标不存在' });
    }

    if (goal.user_id !== req.user.id) {
      return res.status(403).json({ error: '无权访问此目标' });
    }

    res.status(200).json({ goal });
  } catch (error) {
    res.status(500).json({ error: '获取目标详情失败' });
  }
});

// 创建目标
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { type, target_value, start_value, current_value, start_date, end_date } = req.body;

    // 类型转换和验证
    const numTargetValue = parseFloat(target_value);
    const numStartValue = parseFloat(start_value);

    if (!type || isNaN(numTargetValue) || isNaN(numStartValue) || !start_date) {
      return res.status(400).json({ error: '缺少必要参数或参数格式错误' });
    }

    // 查找是否已存在同类型的目标
    const existingGoal = await Goal.findOne({
      where: {
        user_id: req.user.id,
        type
      },
      order: [['created_at', 'DESC']]
    });

    let goal;
    if (existingGoal) {
      // 已存在则更新
      await existingGoal.update({
        target_value: numTargetValue,
        start_value: numStartValue,
        current_value: current_value !== undefined ? parseFloat(current_value) : numStartValue,
        start_date,
        end_date,
        status: 'in_progress'
      });
      goal = existingGoal;
    } else {
      // 不存在则创建
      goal = await Goal.create({
        user_id: req.user.id,
        type,
        target_value: numTargetValue,
        start_value: numStartValue,
        current_value: current_value !== undefined ? parseFloat(current_value) : numStartValue,
        status: 'in_progress',
        start_date,
        end_date
      });
    }

    res.status(existingGoal ? 200 : 201).json({ goal });
  } catch (error) {
    res.status(500).json({ error: '创建目标失败' });
  }
});

// 更新目标
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { id } = req.params;
    const { target_value, current_value, status, end_date } = req.body;

    const goal = await Goal.findByPk(id);

    if (!goal) {
      return res.status(404).json({ error: '目标不存在' });
    }

    if (goal.user_id !== req.user.id) {
      return res.status(403).json({ error: '无权修改此目标' });
    }

    await goal.update({
      target_value: target_value || goal.target_value,
      current_value: current_value || goal.current_value,
      status: status || goal.status,
      end_date: end_date || goal.end_date
    });

    res.status(200).json({ goal });
  } catch (error) {
    res.status(500).json({ error: '更新目标失败' });
  }
});

// 删除目标
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { id } = req.params;
    const goal = await Goal.findByPk(id);

    if (!goal) {
      return res.status(404).json({ error: '目标不存在' });
    }

    if (goal.user_id !== req.user.id) {
      return res.status(403).json({ error: '无权删除此目标' });
    }

    await goal.destroy();
    res.status(200).json({ message: '目标删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除目标失败' });
  }
});

// 更新目标进度
router.patch('/:id/progress', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { id } = req.params;
    const { current_value } = req.body;

    if (current_value === undefined) {
      return res.status(400).json({ error: '缺少current_value参数' });
    }

    const goal = await Goal.findByPk(id);

    if (!goal) {
      return res.status(404).json({ error: '目标不存在' });
    }

    if (goal.user_id !== req.user.id) {
      return res.status(403).json({ error: '无权修改此目标' });
    }

    // 更新当前值
    await goal.update({ current_value });

    // 检查是否完成目标
    let status = goal.status;
    if (goal.type === 'weight') {
      // 体重目标：区分减脂/增肌场景
      if (goal.target_value < goal.start_value) {
        // 减脂场景：如果当前体重达到或低于目标体重
        if (current_value <= goal.target_value) {
          status = 'completed';
        }
      } else if (goal.target_value > goal.start_value) {
        // 增肌场景：如果当前体重达到或超过目标体重
        if (current_value >= goal.target_value) {
          status = 'completed';
        }
      }
    } else if (goal.type === 'training') {
      // 训练目标：如果当前值达到或超过目标值
      if (current_value >= goal.target_value) {
        status = 'completed';
      }
    } else {
      // 热量目标：如果当前值达到或超过目标值
      if (current_value >= goal.target_value) {
        status = 'completed';
      }
    }

    if (status !== goal.status) {
      await goal.update({ status });
    }

    res.status(200).json({ goal });
  } catch (error) {
    res.status(500).json({ error: '更新目标进度失败' });
  }
});

export default router;