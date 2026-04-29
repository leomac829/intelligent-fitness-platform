const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// 数据库配置
const sequelize = new Sequelize({
  database: 'fitness_app',
  username: 'postgres',
  password: 'root',
  host: 'localhost',
  port: 54321,
  dialect: 'postgres',
  logging: false
});

async function cleanup() {
  try {
    console.log('🧹 开始清理乱码视频数据...\n');

    // 1. 删除videos目录下的所有乱码文件
    const videosDir = path.join(__dirname, '../videos');
    if (fs.existsSync(videosDir)) {
      const dirs = fs.readdirSync(videosDir);
      for (const dir of dirs) {
        const dirPath = path.join(videosDir, dir);
        if (fs.statSync(dirPath).isDirectory()) {
          const files = fs.readdirSync(dirPath);
          for (const file of files) {
            const filePath = path.join(dirPath, file);
            console.log(`🗑️ 删除文件: ${dir}/${file}`);
            fs.unlinkSync(filePath);
          }
          console.log(`\n`);
        }
      }
    }

    // 2. 清空数据库中的视频记录
    await sequelize.query('DELETE FROM exercise_videos');
    console.log('✅ 已清空 exercise_videos 表\n');

    console.log('✨ 清理完成！请重新上传视频。\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ 清理失败:', error);
    process.exit(1);
  }
}

cleanup();
