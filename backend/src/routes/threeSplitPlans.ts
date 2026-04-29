import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { TanChengyiThreeSplitPlan, UserTrainingConfig } from '../services/tanChengyiThreeSplitService';
import ThreeSplitPlan from '../models/ThreeSplitPlan';

const router = express.Router();

// 生成并保存三分化训练计划（自动保存）
router.post('/generate', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const config: UserTrainingConfig = req.body;

    // 参数校验
    if (!config.fitness_level) {
      return res.status(400).json({ error: '健身基础为必填项' });
    }

    // 生成计划
    const planGenerator = new TanChengyiThreeSplitPlan(config);
    const planData = planGenerator.exportToJson();

    // 保存之前先删除用户旧计划
    await ThreeSplitPlan.destroy({
      where: { user_id: req.user.id }
    });

    // 保存到数据库
    const savedPlan = await ThreeSplitPlan.create({
      user_id: req.user.id,
      config,
      plan_data: planData
    });

    res.status(200).json({
      success: true,
      message: '训练计划生成成功',
      data: {
        id: savedPlan.id,
        config,
        planData
      }
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || '生成训练计划失败' });
  }
});

// 获取用户最新的三分化训练计划
router.get('/latest', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const plan = await ThreeSplitPlan.findOne({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    if (!plan) {
      return res.status(200).json({ success: true, data: null });
    }

    res.status(200).json({
      success: true,
      data: {
        id: plan.id,
        config: plan.config,
        planData: plan.plan_data
      }
    });
  } catch (error) {
    res.status(500).json({ error: '获取训练计划失败' });
  }
});

// 保存训练计划到数据库
router.post('/save', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { config, planData } = req.body;

    // 先删除旧计划，再保存新计划（保持一个用户一个计划）
    await ThreeSplitPlan.destroy({
      where: { user_id: req.user.id }
    });

    const savedPlan = await ThreeSplitPlan.create({
      user_id: req.user.id,
      config,
      plan_data: planData
    });

    res.status(200).json({
      success: true,
      message: '训练计划保存成功',
      data: { id: savedPlan.id }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || '保存训练计划失败' });
  }
});

export default router;
