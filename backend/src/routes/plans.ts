import express from 'express';
import WorkoutPlan from '../models/WorkoutPlan';
import WorkoutPlanItem from '../models/WorkoutPlanItem';
import Exercise from '../models/Exercise';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 获取计划列表（支持筛选）
router.get('/', async (req, res) => {
  try {
    const { goal, level, is_public } = req.query;
    const where: any = {};

    if (goal) {
      where.goal = goal;
    }

    if (level) {
      where.level = level;
    }

    if (is_public) {
      where.is_public = is_public === 'true';
    } else {
      // 默认只显示公开计划
      where.is_public = true;
    }

    const plans = await WorkoutPlan.findAll({ where });
    res.status(200).json({ plans });
  } catch (error) {
    res.status(500).json({ error: '获取计划列表失败' });
  }
});

// 获取用户创建的计划 - 必须放在 /:id 路由之前
router.get('/user', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const plans = await WorkoutPlan.findAll({ where: { created_by: req.user.id } });
    res.status(200).json({ plans });
  } catch (error) {
    res.status(500).json({ error: '获取用户计划失败' });
  }
});

// 获取计划详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await WorkoutPlan.findByPk(id, {
      include: [{
        model: WorkoutPlanItem,
        include: [Exercise]
      }]
    });

    if (!plan) {
      return res.status(404).json({ error: '计划不存在' });
    }

    res.status(200).json({ plan });
  } catch (error) {
    res.status(500).json({ error: '获取计划详情失败' });
  }
});

// 创建计划
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { name, description, goal, level, duration, is_public, items } = req.body;

    const plan = await WorkoutPlan.create({
      name,
      description,
      goal,
      level,
      duration,
      created_by: req.user.id,
      is_public
    });

    // 添加计划项
    if (items && items.length > 0) {
      for (const item of items) {
        await WorkoutPlanItem.create({
          plan_id: plan.id,
          day: item.day,
          exercise_id: item.exercise_id,
          sets: item.sets,
          reps: item.reps,
          weight: item.weight,
          rest_time: item.rest_time
        });
      }
    }

    res.status(201).json({ plan });
  } catch (error) {
    res.status(500).json({ error: '创建计划失败' });
  }
});

// 更新计划
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { id } = req.params;
    const { name, description, goal, level, duration, is_public, items } = req.body;

    const plan = await WorkoutPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({ error: '计划不存在' });
    }

    // 检查权限
    if (plan.created_by !== req.user.id) {
      return res.status(403).json({ error: '无权限修改此计划' });
    }

    await plan.update({
      name,
      description,
      goal,
      level,
      duration,
      is_public
    });

    // 更新计划项
    if (items) {
      // 删除旧的计划项
      await WorkoutPlanItem.destroy({ where: { plan_id: id } });
      // 创建新的计划项
      for (const item of items) {
        await WorkoutPlanItem.create({
          plan_id: plan.id,
          day: item.day,
          exercise_id: item.exercise_id,
          sets: item.sets,
          reps: item.reps,
          weight: item.weight,
          rest_time: item.rest_time
        });
      }
    }

    res.status(200).json({ plan });
  } catch (error) {
    res.status(500).json({ error: '更新计划失败' });
  }
});

// 删除计划
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { id } = req.params;
    const plan = await WorkoutPlan.findByPk(id);

    if (!plan) {
      return res.status(404).json({ error: '计划不存在' });
    }

    // 检查权限
    if (plan.created_by !== req.user.id) {
      return res.status(403).json({ error: '无权限删除此计划' });
    }

    await plan.destroy();
    res.status(200).json({ message: '计划删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除计划失败' });
  }
});

export default router;
