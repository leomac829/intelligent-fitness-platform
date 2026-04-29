import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import sequelize from './src/config/database';

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
