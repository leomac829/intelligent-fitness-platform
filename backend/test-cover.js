const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg');
const ffprobePath = require('@ffprobe-installer/ffprobe');
const path = require('path');

// 设置ffmpeg路径
ffmpeg.setFfmpegPath(ffmpegPath.path);
ffmpeg.setFfprobePath(ffprobePath.path);

// 测试视频路径
const testVideo = path.join(__dirname, 'videos/9b1bc15b-9859-43c9-a9c1-f588e343c290/video-1776386980112-546132156.mp4');
const outputDir = path.join(__dirname, 'covers/test');
const fs = require('fs');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🧪 开始测试封面生成功能...\n');
console.log(`📹 测试视频: ${testVideo}`);
console.log(`📁 输出目录: ${outputDir}\n`);

// 生成封面
ffmpeg(testVideo)
  .screenshots({
    timestamps: ['00:00:01'],
    filename: 'test-cover.jpg',
    folder: outputDir,
    size: '320x180'
  })
  .on('end', () => {
    const coverPath = path.join(outputDir, 'test-cover.jpg');
    if (fs.existsSync(coverPath)) {
      const stats = fs.statSync(coverPath);
      console.log(`✅ 封面生成成功！`);
      console.log(`   文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`   文件路径: ${coverPath}`);
      console.log('\n🎉 封面功能测试通过！');
    } else {
      console.log('❌ 文件未找到（异常）');
    }
    process.exit(0);
  })
  .on('error', (err) => {
    console.error('❌ 封面生成失败:', err.message);
    console.error('\n错误详情:', err);
    process.exit(1);
  });
