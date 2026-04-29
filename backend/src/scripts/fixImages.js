const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const sequelize = require('../config/database').default;

async function fixImages() {
  try {
    console.log('开始修复 image_url...');

    const dataPath = path.join(__dirname, '..', '..', '..', 'exercises-dataset-main', 'data', 'exercises.json');
    const exercisesData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`读取到 ${exercisesData.length} 条原始数据`);

    const nameToOriginalId = {};
    exercisesData.forEach((ex) => {
      nameToOriginalId[ex.name] = ex.id;
    });

    const imagesDir = path.join(__dirname, '..', '..', '..', 'exercises-dataset-main', 'images');
    const imageFiles = fs.readdirSync(imagesDir).filter((f) => f.endsWith('.jpg'));
    console.log(`找到 ${imageFiles.length} 个 JPG 文件`);

    const idToImage = {};
    imageFiles.forEach((file) => {
      const match = file.match(/^(\d{4})-/);
      if (match) {
        idToImage[match[1]] = file;
      }
    });

    const [rows] = await sequelize.query('SELECT id, name FROM exercises');
    console.log(`数据库中有 ${rows.length} 条记录`);

    let updated = 0;
    for (const row of rows) {
      const originalId = nameToOriginalId[row.name];
      if (!originalId) continue;

      const imgFile = idToImage[originalId];
      const imageUrl = imgFile ? `/exercises-images/${imgFile}` : null;

      await sequelize.query(
        'UPDATE exercises SET image_url = :imgUrl WHERE id = :id',
        { replacements: { imgUrl: imageUrl, id: row.id } }
      );
      updated++;

      if (updated % 100 === 0) {
        console.log(`已更新 ${updated}/${rows.length} 条...`);
      }
    }

    console.log(`\n完成！更新了 ${updated} 条`);
    process.exit(0);
  } catch (err) {
    console.error('错误:', err);
    process.exit(1);
  }
}

fixImages();
