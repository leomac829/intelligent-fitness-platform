import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

console.log('测试单个模型导入...');

// 导入数据库配置
import sequelize from './src/config/database';

console.log('Sequelize实例创建成功');

// 测试数据库连接
sequelize.authenticate()
  .then(() => {
    console.log('数据库连接成功');
    
    // 只导入User模型
    console.log('导入User模型...');
    import('./src/models/User')
      .then(User => {
        console.log('User模型导入成功');
        
        // 测试模型同步
        console.log('同步User模型...');
        return sequelize.sync({ alter: true });
      })
      .then(() => {
        console.log('模型同步成功');
        console.log('测试完成！');
        process.exit(0);
      })
      .catch(err => {
        console.error('测试失败:', err);
        process.exit(1);
      });
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
    process.exit(1);
  });
