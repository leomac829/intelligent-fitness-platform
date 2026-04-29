import express from 'express';
import TrainingDiary from '../models/TrainingDiary';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 获取训练日记列表
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const diaries = await TrainingDiary.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    res.status(200).json({ diaries });
  } catch (error) {
    res.status(500).json({ error: '获取训练日记失败' });
  }
});

// 获取训练日记详情
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { id } = req.params;
    const diary = await TrainingDiary.findByPk(id);

    if (!diary) {
      return res.status(404).json({ error: '训练日记不存在' });
    }

    if (diary.user_id !== req.user.id) {
      return res.status(403).json({ error: '无权访问此训练日记' });
    }

    res.status(200).json({ diary });
  } catch (error) {
    res.status(500).json({ error: '获取训练日记详情失败' });
  }
});

// 创建训练日记
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { date, content, duration, tags } = req.body;

    if (!date || !content) {
      return res.status(400).json({ error: '日期和内容不能为空' });
    }

    // 处理duration字段的空值情况
    const parsedDuration = duration ? parseInt(duration) : undefined;

    const diary = await TrainingDiary.create({
      user_id: req.user.id,
      date,
      content,
      duration: parsedDuration,
      tags
    });

    res.status(201).json({ diary });
  } catch (error) {
    res.status(500).json({ error: '创建训练日记失败' });
  }
});

// 更新训练日记
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { id } = req.params;
    const { date, content, duration, tags } = req.body;

    if (!date || !content) {
      return res.status(400).json({ error: '日期和内容不能为空' });
    }

    // 处理duration字段的空值情况
    const parsedDuration = duration ? parseInt(duration) : undefined;

    const diary = await TrainingDiary.findByPk(id);

    if (!diary) {
      return res.status(404).json({ error: '训练日记不存在' });
    }

    if (diary.user_id !== req.user.id) {
      return res.status(403).json({ error: '无权修改此训练日记' });
    }

    await diary.update({
      date,
      content,
      duration: parsedDuration,
      tags
    });

    res.status(200).json({ diary });
  } catch (error) {
    res.status(500).json({ error: '更新训练日记失败' });
  }
});

// 删除训练日记
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { id } = req.params;
    const diary = await TrainingDiary.findByPk(id);

    if (!diary) {
      return res.status(404).json({ error: '训练日记不存在' });
    }

    if (diary.user_id !== req.user.id) {
      return res.status(403).json({ error: '无权删除此训练日记' });
    }

    await diary.destroy();
    res.status(200).json({ message: '训练日记删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除训练日记失败' });
  }
});

export default router;