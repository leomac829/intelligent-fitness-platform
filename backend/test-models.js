const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('正在测试数据库模型同步...');

// 只导入Sequelize和配置，不导入模型
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log
});

console.log('Sequelize实例创建成功');

// 测试数据库连接
sequelize.authenticate()
  .then(() => {
    console.log('数据库连接成功');
    
    // 逐个导入模型并测试
    console.log('开始测试模型...');
    
    // 导入User模型
    console.log('导入User模型...');
    const User = require('./src/models/User');
    console.log('User模型导入成功');
    
    // 导入Exercise模型
    console.log('导入Exercise模型...');
    const Exercise = require('./src/models/Exercise');
    console.log('Exercise模型导入成功');
    
    // 导入ExerciseCategory模型
    console.log('导入ExerciseCategory模型...');
    const ExerciseCategory = require('./src/models/ExerciseCategory');
    console.log('ExerciseCategory模型导入成功');
    
    // 导入ExerciseCategoryRelationship模型
    console.log('导入ExerciseCategoryRelationship模型...');
    const ExerciseCategoryRelationship = require('./src/models/ExerciseCategoryRelationship');
    console.log('ExerciseCategoryRelationship模型导入成功');
    
    // 导入WorkoutPlan模型
    console.log('导入WorkoutPlan模型...');
    const WorkoutPlan = require('./src/models/WorkoutPlan');
    console.log('WorkoutPlan模型导入成功');
    
    // 导入WorkoutPlanItem模型
    console.log('导入WorkoutPlanItem模型...');
    const WorkoutPlanItem = require('./src/models/WorkoutPlanItem');
    console.log('WorkoutPlanItem模型导入成功');
    
    // 导入TrainingLog模型
    console.log('导入TrainingLog模型...');
    const TrainingLog = require('./src/models/TrainingLog');
    console.log('TrainingLog模型导入成功');
    
    // 导入TrainingLogItem模型
    console.log('导入TrainingLogItem模型...');
    const TrainingLogItem = require('./src/models/TrainingLogItem');
    console.log('TrainingLogItem模型导入成功');
    
    // 导入UserFavorite模型
    console.log('导入UserFavorite模型...');
    const UserFavorite = require('./src/models/UserFavorite');
    console.log('UserFavorite模型导入成功');
    
    // 导入UserNote模型
    console.log('导入UserNote模型...');
    const UserNote = require('./src/models/UserNote');
    console.log('UserNote模型导入成功');
    
    // 导入ExerciseComment模型
    console.log('导入ExerciseComment模型...');
    const ExerciseComment = require('./src/models/ExerciseComment');
    console.log('ExerciseComment模型导入成功');
    
    console.log('所有模型导入成功');
    
    // 测试模型同步
    console.log('开始同步数据库模型...');
    sequelize.sync({ alter: true })
      .then(() => {
        console.log('数据库模型同步成功');
        process.exit(0);
      })
      .catch(err => {
        console.error('数据库模型同步失败:', err);
        process.exit(1);
      });
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
    process.exit(1);
  });
