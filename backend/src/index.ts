import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import sequelize from './config/database';

// 导入路由
import authRoutes from './routes/auth';
import planRoutes from './routes/plans';
import logRoutes from './routes/logs';
import favoriteRoutes from './routes/favorites';
import commentRoutes from './routes/comments';
import userInteractionRoutes from './routes/user-interactions';
import chatRoutes from './routes/chat';
import workoutRoutes from './routes/workout';
import bodyMeasurementRoutes from './routes/bodyMeasurement';
import diaryRoutes from './routes/diaries';
import goalRoutes from './routes/goals';
import foodNutritionRoutes from './routes/foodNutrition';
import fatlossRoutes from './routes/fatloss';
import trainingExercisesRoutes from './routes/trainingExercises';
import videoLibraryRoutes from './routes/videoLibrary';
import threeSplitPlansRoutes from './routes/threeSplitPlans';
import scheduleRoutes from './routes/schedules';

// 导入模型（确保模型被注册）
import User from './models/User';
import Exercise from './models/Exercise';
import VideoLibrary from './models/VideoLibrary';
import Video from './models/Video';
import ExerciseCategory from './models/ExerciseCategory';
import ExerciseCategoryRelationship from './models/ExerciseCategoryRelationship';
import ExerciseVideo from './models/ExerciseVideo';
import WorkoutPlan from './models/WorkoutPlan';
import WorkoutPlanItem from './models/WorkoutPlanItem';
import TrainingLog from './models/TrainingLog';
import TrainingLogItem from './models/TrainingLogItem';
import UserFavorite from './models/UserFavorite';
import UserNote from './models/UserNote';
import ExerciseComment from './models/ExerciseComment';
import ChatMessage from './models/ChatMessage';
import Workout from './models/Workout';
import WorkoutExercise from './models/WorkoutExercise';
import BodyMeasurement from './models/BodyMeasurement';
import TrainingDiary from './models/TrainingDiary';
import Goal from './models/Goal';
import FoodNutrition from './models/FoodNutrition';
import FatLossPlan from './models/FatLossPlan';
import ThreeSplitPlan from './models/ThreeSplitPlan';
import Schedule from './models/Schedule';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const upload = multer({ storage });

// 中间件
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:3002", "blob:"],
      mediaSrc: ["'self'", "http://localhost:3002"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "http://localhost:3002"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/videos', express.static(path.join(__dirname, '..', 'videos')));
app.use('/covers', express.static(path.join(__dirname, '..', 'covers')));
app.use('/exercises-gifs', express.static(path.join(__dirname, '..', 'public', 'exercises-gifs')));
app.use('/exercises-images', express.static(path.join(__dirname, '..', 'public', 'exercises-images')));

// 注册路由
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api', userInteractionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/body-measurements', bodyMeasurementRoutes);
app.use('/api/diaries', diaryRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/food-nutrition', foodNutritionRoutes);
app.use('/api/fatloss', fatlossRoutes);
app.use('/api/training-exercises', trainingExercisesRoutes);
app.use('/api/video-library', videoLibraryRoutes);
app.use('/api/three-split-plans', threeSplitPlansRoutes);
app.use('/api/schedules', scheduleRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 启动服务器
const startServer = async () => {
  console.log('正在启动服务器...');
  try {
    // 测试数据库连接
    console.log('正在测试数据库连接...');
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 同步数据库模型
    console.log('正在同步数据库模型...');
    await sequelize.sync({ alter: true });
    console.log('数据库模型同步成功');

    // 启动服务器
    console.log(`正在启动服务器，监听端口 ${PORT}...`);
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();
