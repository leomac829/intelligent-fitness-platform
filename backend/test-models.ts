import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

console.log('正在测试数据库模型同步...');

// 导入数据库配置
import sequelize from './src/config/database';

console.log('Sequelize实例创建成功');

// 测试数据库连接
sequelize.authenticate()
  .then(() => {
    console.log('数据库连接成功');
    
    // 逐个导入模型并测试
    console.log('开始测试模型...');
    
    // 导入所有模型
    console.log('导入所有模型...');
    
    // 导入User模型
    console.log('导入User模型...');
    import('./src/models/User').then(User => {
      console.log('User模型导入成功');
      
      // 导入Exercise模型
      console.log('导入Exercise模型...');
      return import('./src/models/Exercise');
    }).then(Exercise => {
      console.log('Exercise模型导入成功');
      
      // 导入ExerciseCategory模型
      console.log('导入ExerciseCategory模型...');
      return import('./src/models/ExerciseCategory');
    }).then(ExerciseCategory => {
      console.log('ExerciseCategory模型导入成功');
      
      // 导入ExerciseCategoryRelationship模型
      console.log('导入ExerciseCategoryRelationship模型...');
      return import('./src/models/ExerciseCategoryRelationship');
    }).then(ExerciseCategoryRelationship => {
      console.log('ExerciseCategoryRelationship模型导入成功');
      
      // 导入WorkoutPlan模型
      console.log('导入WorkoutPlan模型...');
      return import('./src/models/WorkoutPlan');
    }).then(WorkoutPlan => {
      console.log('WorkoutPlan模型导入成功');
      
      // 导入WorkoutPlanItem模型
      console.log('导入WorkoutPlanItem模型...');
      return import('./src/models/WorkoutPlanItem');
    }).then(WorkoutPlanItem => {
      console.log('WorkoutPlanItem模型导入成功');
      
      // 导入TrainingLog模型
      console.log('导入TrainingLog模型...');
      return import('./src/models/TrainingLog');
    }).then(TrainingLog => {
      console.log('TrainingLog模型导入成功');
      
      // 导入TrainingLogItem模型
      console.log('导入TrainingLogItem模型...');
      return import('./src/models/TrainingLogItem');
    }).then(TrainingLogItem => {
      console.log('TrainingLogItem模型导入成功');
      
      // 导入UserFavorite模型
      console.log('导入UserFavorite模型...');
      return import('./src/models/UserFavorite');
    }).then(UserFavorite => {
      console.log('UserFavorite模型导入成功');
      
      // 导入UserNote模型
      console.log('导入UserNote模型...');
      return import('./src/models/UserNote');
    }).then(UserNote => {
      console.log('UserNote模型导入成功');
      
      // 导入ExerciseComment模型
      console.log('导入ExerciseComment模型...');
      return import('./src/models/ExerciseComment');
    }).then(ExerciseComment => {
      console.log('ExerciseComment模型导入成功');
      console.log('所有模型导入成功');
      
      // 测试模型同步
      console.log('开始同步数据库模型...');
      return sequelize.sync({ alter: true });
    }).then(() => {
      console.log('数据库模型同步成功');
      process.exit(0);
    }).catch(err => {
      console.error('模型导入或同步失败:', err);
      process.exit(1);
    });
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
    process.exit(1);
  });
