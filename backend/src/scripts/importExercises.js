const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const sequelize = require('../../dist/config/database').default;
const crypto = require('crypto');

async function importExercises() {
  try {
    console.log('开始导入训练动作...');

    const dataPath = path.join(__dirname, '..', '..', '..', 'exercises-dataset-main', 'data', 'exercises.json');
    const exercisesData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`读取到 ${exercisesData.length} 条原始数据`);

    // 建立 originalId -> gif 映射
    const videosDir = path.join(__dirname, '..', '..', '..', 'exercises-dataset-main', 'videos');
    const gifFiles = fs.readdirSync(videosDir).filter((f) => f.endsWith('.gif'));
    const idToGif = {};
    gifFiles.forEach((file) => {
      const match = file.match(/^(\d{4})-/);
      if (match) idToGif[match[1]] = file;
    });

    // 建立 originalId -> image 映射
    const imagesDir = path.join(__dirname, '..', '..', '..', 'exercises-dataset-main', 'images');
    const imageFiles = fs.readdirSync(imagesDir).filter((f) => f.endsWith('.jpg'));
    const idToImage = {};
    imageFiles.forEach((file) => {
      const match = file.match(/^(\d{4})-/);
      if (match) idToImage[match[1]] = file;
    });

    // 清空旧数据
    await sequelize.query('DELETE FROM exercise_library');
    console.log('已清空旧数据');

    // 批量插入
    let inserted = 0;
    for (const ex of exercisesData) {
      const gifFile = idToGif[ex.id];
      const imgFile = idToImage[ex.id];

      // 生成 UUID
      const newId = crypto.randomUUID();

      await sequelize.query(
        `INSERT INTO exercise_library (id, name, equipment, category, target, instructions, muscle_group, secondary_muscles, image_url, gif_url, created_at)
         VALUES (:id, :name, :equipment, :category, :target, :instructions, :muscle_group, :secondary_muscles, :image_url, :gif_url, :created_at)`,
        {
          replacements: {
            id: newId,
            name: ex.name,
            equipment: ex.equipment || '',
            category: ex.category || '',
            target: ex.target || '',
            instructions: ex.instructions?.en || '',
            muscle_group: ex.muscle_group || '',
            secondary_muscles: JSON.stringify(ex.secondary_muscles || []),
            image_url: imgFile ? `/exercises-images/${imgFile}` : null,
            gif_url: gifFile ? `/exercises-gifs/${gifFile}` : null,
            created_at: ex.created_at || new Date()
          }
        }
      );
      inserted++;
      if (inserted % 200 === 0) {
        console.log(`已导入 ${inserted}/${exercisesData.length} 条...`);
      }
    }

    console.log(`\n完成！导入 ${inserted} 条`);
    process.exit(0);
  } catch (err) {
    console.error('错误:', err);
    process.exit(1);
  }
}

importExercises();
