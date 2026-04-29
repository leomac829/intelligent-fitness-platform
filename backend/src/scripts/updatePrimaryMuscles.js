const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

// 数据库连接
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 54321,
  username: 'postgres',
  password: 'root',
  database: 'fitness_app',
  logging: false
});

async function updatePrimaryMuscles() {
  try {
    console.log('开始更新主要肌群数据...');

    // 读取 exercises.json 文件
    const jsonPath = path.join(__dirname, '..', '..', '..', 'exercises-dataset-main', 'data', 'exercises.json');
    if (!fs.existsSync(jsonPath)) {
      console.error('exercises.json 文件不存在:', jsonPath);
      process.exit(1);
    }

    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    const exercises = JSON.parse(jsonContent);

    console.log(`读取到 ${exercises.length} 条训练动作数据`);

    // 连接数据库
    await sequelize.authenticate();
    console.log('数据库连接成功');

    let updated = 0;
    let notFound = 0;

    // 批量更新
    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];
      const { id, name, muscle_group } = exercise;

      try {
        // 查找并更新数据库记录
        const result = await sequelize.query(
          `UPDATE exercise_library SET primary_muscles = ARRAY[:muscle_group]::varchar[] WHERE name = :name`,
          {
            replacements: {
              name: name,
              muscle_group: muscle_group
            }
          }
        );

        if (result[1] > 0) {
          updated++;
        } else {
          notFound++;
        }

        // 每100条显示一次进度
        if ((i + 1) % 100 === 0) {
          console.log(`已处理 ${i + 1}/${exercises.length} 条...`);
        }

      } catch (error) {
        console.error(`更新 ${name} 时出错:`, error.message);
      }
    }

    console.log(`\n完成！更新了 ${updated} 条，未找到 ${notFound} 条`);
    process.exit(0);

  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

updatePrimaryMuscles();