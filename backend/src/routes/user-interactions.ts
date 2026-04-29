import express from 'express';
import UserFavorite from '../models/UserFavorite';
import UserNote from '../models/UserNote';
import ExerciseComment from '../models/ExerciseComment';
import Exercise from '../models/Exercise';
import User from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 收藏相关路由

// 添加收藏
router.post('/favorites', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { exercise_id } = req.body;

    // 检查动作是否存在
    const exercise = await Exercise.findByPk(exercise_id);
    if (!exercise) {
      return res.status(404).json({ error: '动作不存在' });
    }

    // 检查是否已收藏
    const existingFavorite = await UserFavorite.findOne({
      where: {
        user_id: req.user.id,
        exercise_id
      }
    });

    if (existingFavorite) {
      return res.status(400).json({ error: '已收藏此动作' });
    }

    const favorite = await UserFavorite.create({
      user_id: req.user.id,
      exercise_id
    });

    res.status(201).json({ favorite });
  } catch (error) {
    res.status(500).json({ error: '添加收藏失败' });
  }
});

// 取消收藏
router.delete('/favorites/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { id } = req.params;
    const favorite = await UserFavorite.findByPk(id);

    if (!favorite) {
      return res.status(404).json({ error: '收藏不存在' });
    }

    // 检查权限
    if (favorite.user_id !== req.user.id) {
      return res.status(403).json({ error: '无权限取消此收藏' });
    }

    await favorite.destroy();
    res.status(200).json({ message: '取消收藏成功' });
  } catch (error) {
    res.status(500).json({ error: '取消收藏失败' });
  }
});

// 获取收藏列表
router.get('/favorites', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const favorites = await UserFavorite.findAll({
      where: { user_id: req.user.id },
      include: [Exercise]
    });

    res.status(200).json({ favorites });
  } catch (error) {
    res.status(500).json({ error: '获取收藏列表失败' });
  }
});

// 笔记相关路由

// 添加笔记
router.post('/notes', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { exercise_id, content } = req.body;

    // 检查动作是否存在
    const exercise = await Exercise.findByPk(exercise_id);
    if (!exercise) {
      return res.status(404).json({ error: '动作不存在' });
    }

    const note = await UserNote.create({
      user_id: req.user.id,
      exercise_id,
      content
    });

    res.status(201).json({ note });
  } catch (error) {
    res.status(500).json({ error: '添加笔记失败' });
  }
});

// 更新笔记
router.put('/notes/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { id } = req.params;
    const { content } = req.body;

    const note = await UserNote.findByPk(id);
    if (!note) {
      return res.status(404).json({ error: '笔记不存在' });
    }

    // 检查权限
    if (note.user_id !== req.user.id) {
      return res.status(403).json({ error: '无权限修改此笔记' });
    }

    await note.update({ content });
    res.status(200).json({ note });
  } catch (error) {
    res.status(500).json({ error: '更新笔记失败' });
  }
});

// 删除笔记
router.delete('/notes/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { id } = req.params;
    const note = await UserNote.findByPk(id);

    if (!note) {
      return res.status(404).json({ error: '笔记不存在' });
    }

    // 检查权限
    if (note.user_id !== req.user.id) {
      return res.status(403).json({ error: '无权限删除此笔记' });
    }

    await note.destroy();
    res.status(200).json({ message: '删除笔记成功' });
  } catch (error) {
    res.status(500).json({ error: '删除笔记失败' });
  }
});

// 获取用户笔记
router.get('/notes', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { exercise_id } = req.query;
    const where: any = { user_id: req.user.id };

    if (exercise_id) {
      where.exercise_id = exercise_id;
    }

    const notes = await UserNote.findAll({ where, include: [Exercise] });
    res.status(200).json({ notes });
  } catch (error) {
    res.status(500).json({ error: '获取笔记失败' });
  }
});

// 评论相关路由

// 添加评论
router.post('/comments', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { exercise_id, content, rating } = req.body;

    // 检查动作是否存在
    const exercise = await Exercise.findByPk(exercise_id);
    if (!exercise) {
      return res.status(404).json({ error: '动作不存在' });
    }

    const comment = await ExerciseComment.create({
      user_id: req.user.id,
      exercise_id,
      content,
      rating
    });

    res.status(201).json({ comment });
  } catch (error) {
    res.status(500).json({ error: '添加评论失败' });
  }
});

// 更新评论
router.put('/comments/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { id } = req.params;
    const { content, rating } = req.body;

    const comment = await ExerciseComment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: '评论不存在' });
    }

    // 检查权限
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ error: '无权限修改此评论' });
    }

    await comment.update({ content, rating });
    res.status(200).json({ comment });
  } catch (error) {
    res.status(500).json({ error: '更新评论失败' });
  }
});

// 删除评论
router.delete('/comments/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { id } = req.params;
    const comment = await ExerciseComment.findByPk(id);

    if (!comment) {
      return res.status(404).json({ error: '评论不存在' });
    }

    // 检查权限
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ error: '无权限删除此评论' });
    }

    await comment.destroy();
    res.status(200).json({ message: '删除评论成功' });
  } catch (error) {
    res.status(500).json({ error: '删除评论失败' });
  }
});

// 获取动作评论
router.get('/comments', async (req, res) => {
  try {
    const { exercise_id } = req.query;

    if (!exercise_id) {
      return res.status(400).json({ error: '缺少动作ID' });
    }

    const comments = await ExerciseComment.findAll({
      where: { exercise_id: exercise_id as string },
      include: [User],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({ error: '获取评论失败' });
  }
});

export default router;
