import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import sequelize from './config/database';
import { DataTypes, Model } from 'sequelize';

// 加载环境变量
dotenv.config();

// 定义一个简单的User模型，不使用bcrypt
interface UserAttributes {
  id?: string;
  username: string;
  email: string;
  password: string;
  name?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  height?: number;
  weight?: number;
  fitness_level?: 'beginner' | 'intermediate' | 'advanced';
  created_at?: Date;
  updated_at?: Date;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: string;
  public username!: string;
  public email!: string;
  public password!: string;
  public name?: string;
  public gender?: 'male' | 'female' | 'other';
  public age?: number;
  public height?: number;
  public weight?: number;
  public fitness_level?: 'beginner' | 'intermediate' | 'advanced';
  public created_at!: Date;
  public updated_at!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100)
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other')
    },
    age: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1
      }
    },
    height: {
      type: DataTypes.DECIMAL(5, 2),
      validate: {
        min: 1
      }
    },
    weight: {
      type: DataTypes.DECIMAL(5, 2),
      validate: {
        min: 1
      }
    },
    fitness_level: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced')
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// 导入其他模型
import Exercise from './models/Exercise';
import ExerciseCategory from './models/ExerciseCategory';
import ExerciseCategoryRelationship from './models/ExerciseCategoryRelationship';
import WorkoutPlan from './models/WorkoutPlan';
import WorkoutPlanItem from './models/WorkoutPlanItem';
import TrainingLog from './models/TrainingLog';
import TrainingLogItem from './models/TrainingLogItem';
import UserFavorite from './models/UserFavorite';
import UserNote from './models/UserNote';
import ExerciseComment from './models/ExerciseComment';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 注册路由
import authRoutes from './routes/auth';
import exerciseRoutes from './routes/exercises';
import planRoutes from './routes/plans';
import logRoutes from './routes/logs';
import favoriteRoutes from './routes/favorites';
import commentRoutes from './routes/comments';
import userInteractionRoutes from './routes/user-interactions';

app.use('/api/auth', authRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api', userInteractionRoutes);

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
