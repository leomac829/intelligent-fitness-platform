const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('正在测试数据库连接...');
console.log('数据库URL:', process.env.DATABASE_URL);

try {
  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: console.log
  });

  console.log('Sequelize实例创建成功');

  sequelize.authenticate()
    .then(() => {
      console.log('数据库连接成功');
      process.exit(0);
    })
    .catch(err => {
      console.error('数据库连接失败:', err);
      process.exit(1);
    });
} catch (error) {
  console.error('创建Sequelize实例失败:', error);
  process.exit(1);
}
