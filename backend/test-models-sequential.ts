import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import sequelize from './config/database';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

    // 逐个导入模型
    console.log('开始导入模型...');

    // 1. 导入User模型
    console.log('导入User模型...');
    await import('./models/User');
    console.log('User模型导入成功');

    // 2. 导入Exercise模型
    console.log('导入Exercise模型...');
    await import('./models/Exercise');
    console.log('Exercise模型导入成功');

    // 3. 导入ExerciseCategory模型
    console.log('导入ExerciseCategory模型...');
    await import('./models/ExerciseCategory');
    console.log('ExerciseCategory模型导入成功');

    // 4. 导入ExerciseCategoryRelationship模型
    console.log('导入ExerciseCategoryRelationship模型...');
    await import('./models/ExerciseCategoryRelationship');
    console.log('ExerciseCategoryRelationship模型导入成功');

    // 5. 导入WorkoutPlan模型
    console.log('导入WorkoutPlan模型...');
    await import('./models/WorkoutPlan');
    console.log('WorkoutPlan模型导入成功');

    // 6. 导入WorkoutPlanItem模型
    console.log('导入WorkoutPlanItem模型...');
    await import('./models/WorkoutPlanItem');
    console.log('WorkoutPlanItem模型导入成功');

    // 7. 导入TrainingLog模型
    console.log('导入TrainingLog模型...');
    await import('./models/TrainingLog');
    console.log('TrainingLog模型导入成功');

    // 8. 导入TrainingLogItem模型
    console.log('导入TrainingLogItem模型...');
    await import('./models/TrainingLogItem');
    console.log('TrainingLogItem模型导入成功');

    // 9. 导入UserFavorite模型
    console.log('导入UserFavorite模型...');
    await import('./models/UserFavorite');
    console.log('UserFavorite模型导入成功');

    // 10. 导入UserNote模型
    console.log('导入UserNote模型...');
    await import('./models/UserNote');
    console.log('UserNote模型导入成功');

    // 11. 导入ExerciseComment模型
    console.log('导入ExerciseComment模型...');
    await import('./models/ExerciseComment');
    console.log('ExerciseComment模型导入成功');

    console.log('所有模型导入成功');

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
