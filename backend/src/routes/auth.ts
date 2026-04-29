import express from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 确保uploads目录存在
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 配置multer
const storage = multer.diskStorage({
  destination: (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadsDir);
  },
  filename: (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name, gender, age, height, weight, fitness_level } = req.body;

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ error: '邮箱已被注册' });
    }

    // 创建新用户
    const user = await User.create({
      username,
      email,
      password: 'temp',
      name,
      gender,
      age: age ? parseInt(age) : undefined,
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      fitness_level
    } as any);

    // 设置密码（加密）
    await user.setPassword(password);
    await user.save();

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as any,
      { expiresIn: '24h' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as any,
      { expiresIn: '24h' }
    );

    res.status(200).json({ user, token });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// 获取用户资料
router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }
  
  try {
    // 重新从数据库中获取最新的用户信息
    const updatedUser = await User.findByPk(req.user.id);
    if (!updatedUser) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('获取用户资料失败:', error);
    res.status(500).json({ error: '获取用户资料失败' });
  }
});

// 更新用户资料
router.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }

  try {
    const { username, email, name, avatar, gender, age, height, weight, fitness_level, workout_duration, target_weight } = req.body;

    // 重新从数据库中获取最新的用户信息
    const updatedUser = await User.findByPk(req.user.id);
    if (!updatedUser) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 更新用户资料
    await updatedUser.update({
      username,
      email,
      name,
      avatar,
      gender,
      age: age ? parseInt(age) : undefined,
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      fitness_level,
      workout_duration: workout_duration ? parseInt(workout_duration) : undefined,
      target_weight: target_weight ? parseFloat(target_weight) : undefined,
    } as any);

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('更新资料失败:', error);
    res.status(500).json({ error: '更新资料失败' });
  }
});

// 修改密码
router.put('/password', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }

  try {
    const { oldPassword, newPassword } = req.body;

    // 验证旧密码
    const isValidPassword = await req.user.validatePassword(oldPassword);
    if (!isValidPassword) {
      return res.status(401).json({ error: '旧密码错误' });
    }

    // 设置新密码
    await req.user.setPassword(newPassword);
    await req.user.save();

    res.status(200).json({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ error: '修改密码失败' });
  }
});

// 上传头像
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的文件' });
    }

    // 构建头像URL
    const avatarUrl = `/uploads/${req.file.filename}`;

    // 直接更新数据库中的用户头像
    await User.update({ avatar: avatarUrl }, { where: { id: req.user.id } });

    // 重新从数据库中获取最新的用户信息
    const updatedUser = await User.findByPk(req.user.id);
    if (!updatedUser) {
      return res.status(404).json({ error: '用户不存在' });
    }

    console.log('头像更新成功:', updatedUser.avatar);
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('上传头像失败:', error);
    res.status(500).json({ error: '上传头像失败' });
  }
});

// ========== 管理员用户管理 API ==========

// 获取所有用户列表（管理员）
router.get('/users', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }

  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'name', 'gender', 'age', 'fitness_level', 'avatar', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// 管理员编辑用户信息
router.put('/users/:id', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }

  try {
    const { id } = req.params;
    const { username, email, name, gender, age, fitness_level, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 更新用户信息
    const updateData: any = {
      username,
      email,
      name,
      gender,
      age: age ? parseInt(age) : undefined,
      fitness_level
    };

    // 如果提供了新密码，则更新密码
    if (password && password.trim()) {
      await user.setPassword(password);
    }

    await user.update(updateData);

    // 返回更新后的用户信息（不包含密码）
    const updatedUser = await User.findByPk(id, {
      attributes: ['id', 'username', 'email', 'name', 'gender', 'age', 'fitness_level', 'avatar', 'created_at']
    });

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('编辑用户失败:', error);
    res.status(500).json({ error: '编辑用户失败' });
  }
});

// 管理员删除用户
router.delete('/users/:id', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }

  try {
    const { id } = req.params;

    // 不能删除自己
    if (id === req.user.id) {
      return res.status(400).json({ error: '不能删除自己的账号' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    await user.destroy();

    res.status(200).json({ message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ error: '删除用户失败' });
  }
});

export default router;