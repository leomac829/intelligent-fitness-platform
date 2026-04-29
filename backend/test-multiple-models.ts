import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

console.log('测试多个模型导入...');

// 导入数据库配置
import sequelize from './src/config/database';

console.log('Sequelize实例创建成功');

// 测试数据库连接
sequelize.authenticate()
  .then(() => {
    console.log('数据库连接成功');
    
    // 导入User模型
    console.log('导入User模型...');
    return import('./src/models/User');
  })
  .then(User => {
    console.log('User模型导入成功');
    
    // 导入Exercise模型
    console.log('导入Exercise模型...');
    return import('./src/models/Exercise');
  })
  .then(Exercise => {
    console.log('Exercise模型导入成功');
    
    // 导入ExerciseCategory模型
    console.log('导入ExerciseCategory模型...');
    return import('./src/models/ExerciseCategory');
  })
  .then(ExerciseCategory => {
    console.log('ExerciseCategory模型导入成功');
    
    // 导入ExerciseCategoryRelationship模型
    console.log('导入ExerciseCategoryRelationship模型...');
    return import('./src/models/ExerciseCategoryRelationship');
  })
  .then(ExerciseCategoryRelationship => {
    console.log('ExerciseCategoryRelationship模型导入成功');
    
    // 导入WorkoutPlan模型
    console.log('导入WorkoutPlan模型...');
    return import('./src/models/WorkoutPlan');
  })
  .then(WorkoutPlan => {
    console.log('WorkoutPlan模型导入成功');
    
    // 导入WorkoutPlanItem模型
    console.log('导入WorkoutPlanItem模型...');
    return import('./src/models/WorkoutPlanItem');
  })
  .then(WorkoutPlanItem => {
    console.log('WorkoutPlanItem模型导入成功');
    
    // 导入TrainingLog模型
    console.log('导入TrainingLog模型...');
    return import('./src/models/TrainingLog');
  })
  .then(TrainingLog => {
    console.log('TrainingLog模型导入成功');
    
    // 导入TrainingLogItem模型
    console.log('导入TrainingLogItem模型...');
    return import('./src/models/TrainingLogItem');
  })
  .then(TrainingLogItem => {
    console.log('TrainingLogItem模型导入成功');
    
    // 导入UserFavorite模型
    console.log('导入UserFavorite模型...');
    return import('./src/models/UserFavorite');
  })
  .then(UserFavorite => {
    console.log('UserFavorite模型导入成功');
    
    // 导入UserNote模型
    console.log('导入UserNote模型...');
    return import('./src/models/UserNote');
  })
  .then(UserNote => {
    console.log('UserNote模型导入成功');
    
    // 导入ExerciseComment模型
    console.log('导入ExerciseComment模型...');
    return import('./src/models/ExerciseComment');
  })
  .then(ExerciseComment => {
    console.log('ExerciseComment模型导入成功');
    
    // 测试模型同步
    console.log('同步模型...');
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
