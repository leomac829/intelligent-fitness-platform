const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');
const iconv = require('iconv-lite');
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: 54321,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'fitness_app',
  logging: false
});

async function importTranslations() {
  try {
    console.log('开始导入训练动作中文翻译...');

    const exercises = await sequelize.query(`SELECT name FROM exercise_library`, { type: sequelize.QueryTypes.SELECT });
    const dbNames = new Set(exercises.map(e => e.name.trim()));
    console.log(`数据库中有 ${dbNames.size} 条训练动作`);

    console.log('清空现有数据...');
    await sequelize.query(`UPDATE exercise_library SET name_zh = NULL WHERE name_zh IS NOT NULL`);

    const csvPath = path.join(__dirname, '..', '..', '..', '训练动作中文翻译.csv');
    if (!fs.existsSync(csvPath)) {
      console.error('CSV 文件不存在:', csvPath);
      process.exit(1);
    }

    const rawBuffer = fs.readFileSync(csvPath);
    const content = iconv.decode(rawBuffer, 'gbk');

    const lines = content.split(/\r?\n/).filter(line => line.trim());

    console.log(`CSV 读取到 ${lines.length} 条翻译数据`);

    // 先检查 CSV 中的英文名能否匹配
    let matched = 0;
    let unmatched = 0;
    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 2) {
        const enName = parts[0].trim();
        if (dbNames.has(enName)) {
          matched++;
        } else {
          unmatched++;
        }
      }
    }
    console.log(`英文名匹配: ${matched}, 不匹配: ${unmatched}`);

    // 显示一些不匹配的例子
    if (unmatched > 0) {
      let count = 0;
      for (let i = 0; i < lines.length && count < 5; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 2) {
          const enName = parts[0].trim();
          if (!dbNames.has(enName)) {
            console.log(`  不匹配: "${enName}"`);
            count++;
          }
        }
      }
    }

    // 重新匹配并更新
    await sequelize.query(`UPDATE exercise_library SET name_zh = NULL WHERE name_zh IS NOT NULL`);

    let updated = 0;
    let notFound = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',');
      if (parts.length < 2) continue;

      const englishName = parts[0].trim();
      const chineseName = parts[1].trim();

      if (!englishName || !chineseName) continue;

      try {
        const result = await sequelize.query(
          `UPDATE exercise_library SET name_zh = :name_zh WHERE name = :name`,
          {
            replacements: {
              name: englishName,
              name_zh: chineseName
            }
          }
        );

        if (result[1] > 0) {
          updated++;
        } else {
          notFound++;
        }
      } catch (error) {
        console.error(`更新 ${englishName} 时出错:`, error.message);
      }
    }

    console.log(`\n完成！更新了 ${updated} 条，未找到 ${notFound} 条`);
    process.exit(0);
  } catch (err) {
    console.error('错误:', err);
    process.exit(1);
  }
}

importTranslations();
