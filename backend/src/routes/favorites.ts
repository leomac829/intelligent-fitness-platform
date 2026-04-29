import express from 'express';
import UserFavorite from '../models/UserFavorite';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 添加收藏
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { exercise_id } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: '未认证' });
    }

    // 检查是否已经收藏
    const existingFavorite = await UserFavorite.findOne({ where: { user_id, exercise_id } });
    if (existingFavorite) {
      return res.status(400).json({ error: '已经收藏过该动作' });
    }

    const favorite = await UserFavorite.create({ user_id, exercise_id });
    res.status(201).json({ favorite });
  } catch (error) {
    res.status(500).json({ error: '添加收藏失败' });
  }
});

// 获取用户收藏列表
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: '未认证' });
    }

    const favorites = await UserFavorite.findAll({ where: { user_id } });
    res.status(200).json({ favorites });
  } catch (error) {
    res.status(500).json({ error: '获取收藏列表失败' });
  }
});

// 删除收藏
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: '未认证' });
    }

    const favorite = await UserFavorite.findOne({ where: { id, user_id } });
    if (!favorite) {
      return res.status(404).json({ error: '收藏不存在' });
    }

    await favorite.destroy();
    res.status(200).json({ message: '取消收藏成功' });
  } catch (error) {
    res.status(500).json({ error: '取消收藏失败' });
  }
});

export default router;