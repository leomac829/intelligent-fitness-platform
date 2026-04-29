import sequelize from '../config/database';
import FoodNutrition from '../models/FoodNutrition';
import fs from 'fs';
import path from 'path';

interface RawFoodItem {
  foodCode: string;
  foodName: string;
  edible: string;
  water: string;
  energyKCal: string;
  energyKJ: string;
  protein: string;
  fat: string;
  CHO: string;
  dietaryFiber: string;
  cholesterol: string;
  ash: string;
  vitaminA: string;
  carotene: string;
  retinol: string;
  thiamin: string;
  riboflavin: string;
  niacin: string;
  vitaminC: string;
  vitaminETotal: string;
  Ca: string;
  P: string;
  K: string;
  Na: string;
  Mg: string;
  Fe: string;
  Zn: string;
  Se: string;
  Cu: string;
  Mn: string;
  remark: string;
}

// 解析营养值，处理空值、"—"、"Tr"（微量）等情况
function parseNutrientValue(value: string): number | null {
  if (!value || value === '—' || value === 'Tr' || value === '' || value === '未测定') {
    return null;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

// 从文件名提取分类和子分类
// 格式: merged_乳类及其制品-其他.json -> category: 乳类及其制品, subcategory: 其他
function parseCategoryFromFilename(filename: string): { category: string; subcategory: string } {
  const baseName = filename.replace('merged_', '').replace('.json', '');
  const parts = baseName.split('-');
  return {
    category: parts[0] || '未知分类',
    subcategory: parts[1] || '其他'
  };
}

async function importFoodData() {
  try {
    console.log('🔗 正在连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    console.log('📂 正在同步数据表...');
    await sequelize.sync({ alter: true });
    console.log('✅ 数据表同步完成');

    const dataDir = path.join(__dirname, '../../../china-food-composition-data-main/json_data_vision_260419');

    if (!fs.existsSync(dataDir)) {
      console.error(`❌ 数据目录不存在: ${dataDir}`);
      process.exit(1);
    }

    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
    console.log(`📁 找到 ${files.length} 个JSON文件`);

    let totalImported = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const file of files) {
      const filePath = path.join(dataDir, file);
      const { category, subcategory } = parseCategoryFromFilename(file);

      console.log(`\n📦 处理: ${file} (${category} > ${subcategory})`);

      try {
        const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as RawFoodItem[];

        for (const item of rawData) {
          try {
            // 检查是否已存在（通过 food_code）
            const existing = await FoodNutrition.findOne({ where: { food_code: item.foodCode } });

            const foodData = {
              food_code: item.foodCode,
              food_name: item.foodName,
              category,
              subcategory,
              edible: parseNutrientValue(item.edible) ?? 100,
              water: parseNutrientValue(item.water),
              energy_kcal: parseNutrientValue(item.energyKCal),
              energy_kj: parseNutrientValue(item.energyKJ),
              protein: parseNutrientValue(item.protein),
              fat: parseNutrientValue(item.fat),
              carbohydrate: parseNutrientValue(item.CHO),
              dietary_fiber: parseNutrientValue(item.dietaryFiber),
              cholesterol: parseNutrientValue(item.cholesterol),
              ash: parseNutrientValue(item.ash),
              vitamin_a: parseNutrientValue(item.vitaminA),
              carotene: parseNutrientValue(item.carotene),
              retinol: parseNutrientValue(item.retinol),
              thiamin: parseNutrientValue(item.thiamin),
              riboflavin: parseNutrientValue(item.riboflavin),
              niacin: parseNutrientValue(item.niacin),
              vitamin_c: parseNutrientValue(item.vitaminC),
              vitamin_e_total: parseNutrientValue(item.vitaminETotal),
              calcium: parseNutrientValue(item.Ca),
              phosphorus: parseNutrientValue(item.P),
              potassium: parseNutrientValue(item.K),
              sodium: parseNutrientValue(item.Na),
              magnesium: parseNutrientValue(item.Mg),
              iron: parseNutrientValue(item.Fe),
              zinc: parseNutrientValue(item.Zn),
              selenium: parseNutrientValue(item.Se),
              copper: parseNutrientValue(item.Cu),
              manganese: parseNutrientValue(item.Mn),
              remark: item.remark === '—' || item.remark === '' ? null : item.remark
            };

            if (existing) {
              await existing.update(foodData);
              totalSkipped++;
            } else {
              await FoodNutrition.create(foodData);
              totalImported++;
            }
          } catch (error) {
            console.error(`  ❌ 导入失败 [${item.foodCode} ${item.foodName}]:`, error instanceof Error ? error.message : error);
            totalErrors++;
          }
        }

        console.log(`  ✅ 完成: ${rawData.length} 条`);
      } catch (error) {
        console.error(`  ❌ 文件处理失败:`, error instanceof Error ? error.message : error);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 导入统计:');
    console.log(`  ✅ 新增: ${totalImported} 条`);
    console.log(`  🔄 更新: ${totalSkipped} 条`);
    console.log(`  ❌ 失败: ${totalErrors} 条`);
    console.log(`  📦 总计: ${totalImported + totalSkipped + totalErrors} 条`);
    console.log('='.repeat(50));

    // 验证导入结果
    const count = await FoodNutrition.count();
    console.log(`\n🔍 数据库中共有 ${count} 条食品营养数据`);

    // 统计各分类数据量
    const categories = await FoodNutrition.findAll({
      attributes: ['category', 'subcategory'],
      group: ['category', 'subcategory'],
      raw: true
    });

    console.log('\n📋 分类统计:');
    for (const cat of categories) {
      const subCount = await FoodNutrition.count({
        where: { category: cat.category, subcategory: cat.subcategory }
      });
      console.log(`  ${cat.category} > ${cat.subcategory}: ${subCount} 条`);
    }

    console.log('\n✅ 数据导入完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 导入失败:', error);
    process.exit(1);
  }
}

importFoodData();
