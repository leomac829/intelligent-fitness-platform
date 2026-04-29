import express from 'express';
import ChatMessage from '../models/ChatMessage';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 获取用户的聊天消息
router.get('/messages', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }

  try {
    const messages = await ChatMessage.findAll({
      where: { userId: req.user.id },
      order: [['timestamp', 'ASC']]
    });

    res.status(200).json({ messages });
  } catch (error) {
    console.error('获取聊天消息失败:', error);
    res.status(500).json({ error: '获取聊天消息失败' });
  }
});

// 保存聊天消息
router.post('/messages', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }

  try {
    const { role, content } = req.body;

    if (!role || !content) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const message = await ChatMessage.create({
      userId: req.user.id,
      role,
      content,
      timestamp: new Date()
    });

    res.status(201).json({ message });
  } catch (error) {
    console.error('保存聊天消息失败:', error);
    res.status(500).json({ error: '保存聊天消息失败' });
  }
});

// 清空聊天消息
router.delete('/messages', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }

  try {
    await ChatMessage.destroy({
      where: { userId: req.user.id }
    });

    res.status(200).json({ message: '聊天消息已清空' });
  } catch (error) {
    console.error('清空聊天消息失败:', error);
    res.status(500).json({ error: '清空聊天消息失败' });
  }
});

export default router;