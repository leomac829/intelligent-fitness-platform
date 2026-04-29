import express from 'express';
import ExerciseComment from '../models/ExerciseComment';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 添加评论
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { exercise_id, content, rating } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: '未认证' });
    }

    const comment = await ExerciseComment.create({ user_id, exercise_id, content, rating });
    res.status(201).json({ comment });
  } catch (error) {
    res.status(500).json({ error: '添加评论失败' });
  }
});

// 获取动作评论列表
router.get('/', async (req, res) => {
  try {
    const { exercise_id } = req.query;

    if (!exercise_id) {
      return res.status(400).json({ error: '缺少动作ID' });
    }

    const comments = await ExerciseComment.findAll({ 
      where: { exercise_id: exercise_id as string },
      include: ['user']
    });
    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({ error: '获取评论列表失败' });
  }
});

// 删除评论
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: '未认证' });
    }

    const comment = await ExerciseComment.findOne({ where: { id, user_id } });
    if (!comment) {
      return res.status(404).json({ error: '评论不存在' });
    }

    await comment.destroy();
    res.status(200).json({ message: '删除评论成功' });
  } catch (error) {
    res.status(500).json({ error: '删除评论失败' });
  }
});

export default router;