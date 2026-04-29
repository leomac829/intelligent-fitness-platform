import express from 'express';
import Workout from '../models/Workout';
import WorkoutExercise from '../models/WorkoutExercise';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 创建训练记录
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }

  try {
    const { date, duration, calories, notes, exercises } = req.body;

    // 创建训练记录
    const workout = await Workout.create({
      userId: req.user.id,
      date: new Date(date),
      duration: parseInt(duration),
      calories: parseFloat(calories),
      notes
    } as any);

    // 创建训练动作记录
    if (exercises && Array.isArray(exercises)) {
      for (const exercise of exercises) {
        await WorkoutExercise.create({
          workoutId: workout.id,
          exerciseName: exercise.exerciseName,
          sets: parseInt(exercise.sets),
          reps: parseInt(exercise.reps),
          weight: parseFloat(exercise.weight),
          restTime: parseInt(exercise.restTime) || 60
        } as any);
      }
    }

    // 重新获取训练记录（包含动作）
    const workoutExercises = await WorkoutExercise.findAll({
      where: { workoutId: workout.id }
    });

    res.status(201).json({ 
      workout: {
        ...workout.toJSON(),
        exercises: workoutExercises
      }
    });
  } catch (error) {
    console.error('创建训练记录失败:', error);
    res.status(500).json({ error: '创建训练记录失败' });
  }
});

// 获取用户的训练记录列表
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }

  try {
    const { page = 1, limit = 10 } = req.query;

    const workouts = await Workout.findAndCountAll({
      where: { userId: req.user.id },
      order: [['date', 'DESC']],
      limit: parseInt(limit as string),
      offset: (parseInt(page as string) - 1) * parseInt(limit as string)
    });

    // 获取每个训练记录的动作
    const workoutsWithExercises = await Promise.all(
      workouts.rows.map(async (workout) => {
        const exercises = await WorkoutExercise.findAll({
          where: { workoutId: workout.id }
        });
        return {
          ...workout.toJSON(),
          exercises
        };
      })
    );

    res.status(200).json({
      workouts: workoutsWithExercises,
      total: workouts.count,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });
  } catch (error) {
    console.error('获取训练记录失败:', error);
    res.status(500).json({ error: '获取训练记录失败' });
  }
});

// 获取训练记录详情
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }

  try {
    const workout = await Workout.findByPk(req.params.id);

    if (!workout) {
      return res.status(404).json({ error: '训练记录不存在' });
    }

    // 验证权限
    if (workout.userId !== req.user.id) {
      return res.status(403).json({ error: '无权限访问' });
    }

    // 获取训练动作
    const exercises = await WorkoutExercise.findAll({
      where: { workoutId: workout.id }
    });

    res.status(200).json({ 
      workout: {
        ...workout.toJSON(),
        exercises
      }
    });
  } catch (error) {
    console.error('获取训练记录详情失败:', error);
    res.status(500).json({ error: '获取训练记录详情失败' });
  }
});

// 更新训练记录
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }

  try {
    const workout = await Workout.findByPk(req.params.id);

    if (!workout) {
      return res.status(404).json({ error: '训练记录不存在' });
    }

    // 验证权限
    if (workout.userId !== req.user.id) {
      return res.status(403).json({ error: '无权限修改' });
    }

    const { date, duration, calories, notes, exercises } = req.body;

    // 更新训练记录
    await workout.update({
      date: new Date(date),
      duration: parseInt(duration),
      calories: parseFloat(calories),
      notes
    } as any);

    // 更新训练动作记录
    if (exercises && Array.isArray(exercises)) {
      // 删除旧的动作记录
      await WorkoutExercise.destroy({ where: { workoutId: workout.id } });

      // 创建新的动作记录
      for (const exercise of exercises) {
        await WorkoutExercise.create({
          workoutId: workout.id,
          exerciseName: exercise.exerciseName,
          sets: parseInt(exercise.sets),
          reps: parseInt(exercise.reps),
          weight: parseFloat(exercise.weight),
          restTime: parseInt(exercise.restTime) || 60
        } as any);
      }
    }

    // 重新获取训练记录（包含动作）
    const workoutExercises = await WorkoutExercise.findAll({
      where: { workoutId: workout.id }
    });

    res.status(200).json({ 
      workout: {
        ...workout.toJSON(),
        exercises: workoutExercises
      }
    });
  } catch (error) {
    console.error('更新训练记录失败:', error);
    res.status(500).json({ error: '更新训练记录失败' });
  }
});

// 删除训练记录
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }

  try {
    const workout = await Workout.findByPk(req.params.id);

    if (!workout) {
      return res.status(404).json({ error: '训练记录不存在' });
    }

    // 验证权限
    if (workout.userId !== req.user.id) {
      return res.status(403).json({ error: '无权限删除' });
    }

    await workout.destroy();
    res.status(200).json({ message: '训练记录已删除' });
  } catch (error) {
    console.error('删除训练记录失败:', error);
    res.status(500).json({ error: '删除训练记录失败' });
  }
});

// 获取训练统计数据
router.get('/stats/summary', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }

  try {
    // 计算总训练次数
    const totalWorkouts = await Workout.count({ where: { userId: req.user.id } });

    // 计算总训练时长
    const totalDuration = await Workout.sum('duration', { where: { userId: req.user.id } });

    // 计算总消耗热量
    const totalCalories = await Workout.sum('calories', { where: { userId: req.user.id } });

    // 计算平均每次训练时长
    const avgDuration = totalWorkouts > 0 ? (totalDuration as number) / totalWorkouts : 0;

    // 计算平均每次消耗热量
    const avgCalories = totalWorkouts > 0 ? (totalCalories as number) / totalWorkouts : 0;

    res.status(200).json({
      totalWorkouts,
      totalDuration: totalDuration as number || 0,
      totalCalories: totalCalories as number || 0,
      avgDuration,
      avgCalories
    });
  } catch (error) {
    console.error('获取训练统计失败:', error);
    res.status(500).json({ error: '获取训练统计失败' });
  }
});

export default router;