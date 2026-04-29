const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg');
const ffprobePath = require('@ffprobe-installer/ffprobe');
const path = require('path');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegPath.path);
ffmpeg.setFfprobePath(ffprobePath.path);

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 54321,
  database: 'fitness_app',
  username: 'postgres',
  password: 'root',
  logging: console.log
});

const ExerciseVideo = sequelize.define('ExerciseVideo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  exercise_id: { type: DataTypes.UUID },
  filename: { type: DataTypes.STRING },
  path: { type: DataTypes.STRING },
  cover_image: { type: DataTypes.STRING },
  size: { type: DataTypes.INTEGER }
}, {
  tableName: 'exercise_videos',
  timestamps: true,
  underscored: true
});

async function regenerateCovers() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    const videosWithoutCover = await ExerciseVideo.findAll({
      where: {
        cover_image: null,
        path: { [Sequelize.Op.ne]: null }
      }
    });

    console.log(`\n📋 找到 ${videosWithoutCover.length} 个缺少封面的视频\n`);

    if (videosWithoutCover.length === 0) {
      console.log('所有视频都有封面，无需处理');
      process.exit(0);
    }

    let successCount = 0;
    let failCount = 0;

    for (const video of videosWithoutCover) {
      const videoFullPath = path.join(__dirname, video.path);
      const exerciseId = video.exercise_id;

      console.log(`🎬 处理: ${video.filename}`);
      console.log(`   路径: ${videoFullPath}`);

      if (!fs.existsSync(videoFullPath)) {
        console.log(`   ⚠️ 视频文件不存在，跳过`);
        continue;
      }

      const coversDir = path.join(__dirname, 'covers', exerciseId);
      if (!fs.existsSync(coversDir)) {
        fs.mkdirSync(coversDir, { recursive: true });
      }

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const coverFilename = `cover-regen-${uniqueSuffix}.jpg`;
      const coverPath = `/covers/${exerciseId}/${coverFilename}`;
      const coverFullPath = path.join(coversDir, coverFilename);

      try {
        await new Promise((resolve, reject) => {
          ffmpeg(videoFullPath)
            .screenshots({
              timestamps: ['00:00:01'],
              filename: coverFilename,
              folder: coversDir,
              size: '320x180'
            })
            .on('end', () => resolve())
            .on('error', (err) => reject(err));
        });

        if (fs.existsSync(coverFullPath)) {
          const stats = fs.statSync(coverFullPath);
          console.log(`   ✅ 封面生成成功: ${coverFilename} (${(stats.size / 1024).toFixed(1)}KB)`);
          await video.update({ cover_image: coverPath });
          successCount++;
        } else {
          console.log(`   ❌ 封面文件未生成`);
          failCount++;
        }
      } catch (err) {
        console.log(`   ❌ 封面生成失败: ${err.message}`);
        failCount++;
      }

      console.log('');
    }

    console.log(`\n========== 处理完成 ==========`);
    console.log(`成功: ${successCount} 个`);
    console.log(`失败: ${failCount} 个`);

    process.exit(0);
  } catch (error) {
    console.error('❌ 执行失败:', error);
    process.exit(1);
  }
}

regenerateCovers();
