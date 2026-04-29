import sequelize from '../config/database';
import FoodNutrition from '../models/FoodNutrition';
import { Op } from 'sequelize';

// ============ 核心计算函数 ============

export function calculateBMR(
  sex: 'male' | 'female',
  weight: number,
  height: number,
  age: number
): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export function calculateTDEE(
  bmr: number,
  workoutDuration: number,
  workoutIntensity: 'beginner' | 'intermediate' | 'advanced'
): number {
  const coefficients = { beginner: 5, intermediate: 8, advanced: 10 };
  const workoutCalories = workoutDuration * coefficients[workoutIntensity];
  return Math.round(bmr + workoutCalories);
}

export function distributeMacros(
  tdee: number,
  ratioType: '532' | '442'
): { carbs: number; protein: number; fat: number } {
  const ratios = ratioType === '532'
    ? { carbs: 0.5, protein: 0.3, fat: 0.2 }
    : { carbs: 0.4, protein: 0.4, fat: 0.2 };

  return {
    carbs: Math.round((tdee * ratios.carbs) / 4),
    protein: Math.round((tdee * ratios.protein) / 4),
    fat: Math.round((tdee * ratios.fat) / 9),
  };
}

export function calculateFatLossPeriod(
  currentWeight: number,
  targetWeight: number
): { weeklyLoss: number; totalMonths: number; totalWeeks: number } {
  const weightToLose = currentWeight - targetWeight;
  const monthlyLossRate = 0.04;
  const monthlyWeightLoss = currentWeight * monthlyLossRate;
  const totalMonths = Math.ceil(weightToLose / monthlyWeightLoss);
  const totalWeeks = Math.ceil(totalMonths * 4.33);
  const weeklyLoss = weightToLose / totalWeeks;

  return {
    weeklyLoss: parseFloat(weeklyLoss.toFixed(2)),
    totalMonths,
    totalWeeks,
  };
}

export function adjustCarbIntake(
  currentCarb: number,
  actualWeeklyLoss: number,
  targetWeeklyLoss: number
): number {
  if (actualWeeklyLoss < targetWeeklyLoss) {
    return Math.max(50, currentCarb - 15);
  }
  return currentCarb;
}

// ============ 食谱推荐引擎（全新：按份量 + 营养素校验） ============

interface RecipeItem {
  food_id: string;
  food_name: string;
  category: string;
  subcategory: string;
  grams: number;
  energy_kcal: number;
  protein: number;
  fat: number;
  carbohydrate: number;
}

/** 食物项带原始数据引用，用于重新计算 */
interface RecipeItemWithFood extends RecipeItem {
  _food: any;
}

interface MealPlan {
  meal: string;
  time: string;
  ratio: number;
  items: RecipeItem[];
  totalEnergy: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
}

interface RecipePlan {
  id: number;
  name: string;
  meals: MealPlan[];
  totalEnergy: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
}

async function getRandomFoods(
  categories: string[],
  limit: number = 30
): Promise<any[]> {
  try {
    const foods = await FoodNutrition.findAll({
      where: {
        category: { [Op.in]: categories },
        energy_kcal: { [Op.gt]: 0 },
      },
      order: sequelize.random(),
      limit,
      raw: true,
    });
    return foods;
  } catch (error) {
    console.error('获取食材失败:', error);
    return [];
  }
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 创建食物条目
 * @param food 食物数据（数据库记录）
 * @param grams 份量（克）
 */
function makeItem(food: any, grams: number): RecipeItem {
  return {
    food_id: food.food_code || food.id,
    food_name: food.food_name,
    category: food.category,
    subcategory: food.subcategory,
    grams,
    energy_kcal: parseFloat(((food.energy_kcal || 0) * grams / 100).toFixed(1)),
    protein: parseFloat(((food.protein || 0) * grams / 100).toFixed(1)),
    fat: parseFloat(((food.fat || 0) * grams / 100).toFixed(1)),
    carbohydrate: parseFloat(((food.carbohydrate || 0) * grams / 100).toFixed(1)),
  };
}

/** 累加营养素 */
function sumNutrients(items: RecipeItem[]) {
  return {
    totalEnergy: items.reduce((s, i) => s + i.energy_kcal, 0),
    totalProtein: items.reduce((s, i) => s + i.protein, 0),
    totalFat: items.reduce((s, i) => s + i.fat, 0),
    totalCarbs: items.reduce((s, i) => s + i.carbohydrate, 0),
  };
}

/** 缩放单个食物份量（返回新的 RecipeItem） */
function scaleItem(item: RecipeItem, newGrams: number): RecipeItem {
  if (item.grams === 0) return { ...item, grams: newGrams, energy_kcal: 0, protein: 0, fat: 0, carbohydrate: 0 };
  const factor = newGrams / item.grams;
  return {
    ...item,
    grams: newGrams,
    energy_kcal: parseFloat((item.energy_kcal * factor).toFixed(1)),
    protein: parseFloat((item.protein * factor).toFixed(1)),
    fat: parseFloat((item.fat * factor).toFixed(1)),
    carbohydrate: parseFloat((item.carbohydrate * factor).toFixed(1)),
  };
}

/**
 * 营养素控制策略（全新逻辑）：
 * 
 * 核心思路：给每种食物分配合理份量 → 汇总三大营养素 → 与目标对比 → 微调
 * 
 * 1. 主食：200g（提供碳水主力）
 * 2. 蛋白质：蛋100g + 奶200g（早餐）/ 肉150g×2（午晚）
 * 3. 脂肪：核算主食+蛋白质自带脂肪，不足则加油脂类补足
 * 4. 蔬菜：填补剩余热量
 * 5. 最后校验：如果碳水/蛋白质总量偏差 > 20%，按比例调整主食/蛋白质份量
 */
function buildMealWithTarget(
  mealType: 'breakfast' | 'lunch' | 'dinner',
  targetKcal: number,
  targetCarbs: number,
  targetProtein: number,
  targetFat: number,
  staples: any[],
  proteins: any[],
  vegetables: any[],
  dairy: any[],
  eggs: any[],
  fatSources: any[]
): RecipeItem[] {
  const items: RecipeItem[] = [];
  const usedNames = new Set<string>();

  // ========== Step 1: 给每种食物分配合理份量 ==========
  if (mealType === 'breakfast') {
    // 早餐：主食 + 蛋 + 奶
    if (staples.length > 0) {
      const food = pickRandom(staples);
      items.push(makeItem(food, 150));
      usedNames.add(food.food_name);
    }
    if (eggs.length > 0) {
      const food = pickRandom(eggs);
      items.push(makeItem(food, 100));
      usedNames.add(food.food_name);
    }
    if (dairy.length > 0) {
      const food = pickRandom(dairy);
      items.push(makeItem(food, 200));
      usedNames.add(food.food_name);
    }
  } else if (mealType === 'lunch') {
    // 午餐：主食 + 2种蛋白质
    if (staples.length > 0) {
      const food = pickRandom(staples);
      items.push(makeItem(food, 200));
      usedNames.add(food.food_name);
    }
    const available = proteins.filter(f => !usedNames.has(f.food_name));
    for (let i = 0; i < 2 && available.length > 0; i++) {
      const idx = Math.floor(Math.random() * available.length);
      const food = available.splice(idx, 1)[0];
      items.push(makeItem(food, 120));
      usedNames.add(food.food_name);
    }
  } else {
    // 晚餐：少量主食 + 1种蛋白质
    if (staples.length > 0 && Math.random() > 0.4) {
      const food = pickRandom(staples);
      items.push(makeItem(food, 100));
      usedNames.add(food.food_name);
    }
    if (proteins.length > 0) {
      const food = pickRandom(proteins);
      items.push(makeItem(food, 120));
      usedNames.add(food.food_name);
    }
  }

  // ========== Step 2: 营养素校验与微调 ==========
  let current = sumNutrients(items);

  // --- 2a. 碳水偏差 > 20% → 调整主食份量 ---
  const carbRatio = targetCarbs > 0 ? current.totalCarbs / targetCarbs : 1;
  if (carbRatio < 0.80 || carbRatio > 1.5) {
    // 找到主食项，按比例调整
    const stapleItemIdx = items.findIndex(i => {
      return i.category === '谷物类及其制品' || i.category === '薯类淀粉及其制品';
    });
    if (stapleItemIdx >= 0 && items[stapleItemIdx].grams > 0) {
      const scaleFactor = targetCarbs / Math.max(current.totalCarbs, 1);
      const newGrams = Math.max(50, Math.min(350, Math.round(items[stapleItemIdx].grams * scaleFactor)));
      items[stapleItemIdx] = scaleItem(items[stapleItemIdx], newGrams);
      current = sumNutrients(items);
    }
  }

  // --- 2b. 蛋白质偏差 > 20% → 调整蛋白质份量 ---
  const proteinRatio = targetProtein > 0 ? current.totalProtein / targetProtein : 1;
  if (proteinRatio < 0.80 || proteinRatio > 1.5) {
    const proteinIdxs = items.map((_, i) => i).filter(i => {
      const cat = items[i].category;
      return cat?.includes('肉') || cat?.includes('蛋') || cat?.includes('豆') || cat?.includes('乳');
    });
    if (proteinIdxs.length > 0) {
      const scaleFactor = targetProtein / Math.max(current.totalProtein, 1);
      for (const idx of proteinIdxs) {
        const newGrams = Math.max(30, Math.min(300, Math.round(items[idx].grams * scaleFactor)));
        items[idx] = scaleItem(items[idx], newGrams);
      }
      current = sumNutrients(items);
    }
  }

  // ========== Step 3: 脂肪补齐 ==========
  if (current.totalFat < targetFat * 0.80 && fatSources.length > 0) {
    const fatNeeded = targetFat * 0.90 - current.totalFat;
    if (fatNeeded > 1) {
      // 根据油脂类食物的脂肪含量，计算需要的份量
      // 取平均脂肪密度 ~50g/100g（坚果和油的混合）
      const avgFatDensity = 50;
      const fatGrams = Math.min(30, Math.max(5, Math.round((fatNeeded / avgFatDensity) * 100)));
      const fatFood = pickRandom(fatSources);
      items.push(makeItem(fatFood, fatGrams));
      current = sumNutrients(items);
    }
  }

  // ========== Step 4: 蔬菜填补剩余热量 ==========
  const remainingKcal = Math.max(0, targetKcal - current.totalEnergy);
  if (remainingKcal > 15 && vegetables.length > 0) {
    const vegCount = mealType === 'dinner' ? 2 : 1;
    const usedVegNames = new Set<string>();
    for (let v = 0; v < vegCount; v++) {
      let food: any;
      let attempts = 0;
      do {
        food = pickRandom(vegetables);
        attempts++;
      } while (usedVegNames.has(food.food_name) && attempts < 10);
      usedVegNames.add(food.food_name);

      const kcalPerVeg = remainingKcal / vegCount;
      const energyDensity = food.energy_kcal || 20; // 蔬菜默认20kcal/100g
      const vegGrams = Math.min(400, Math.max(50, Math.round((kcalPerVeg / energyDensity) * 100)));
      items.push(makeItem(food, vegGrams));
    }
  }

  return items;
}

export async function generateRecipes(
  targetMacros: { carbs: number; protein: number; fat: number },
  dailyCalories: number,
  planCount: number = 3
): Promise<RecipePlan[]> {
  const stapleCategories = ['谷物类及其制品', '薯类淀粉及其制品'];
  const proteinCategories = ['畜禽肉类及其制品', '鱼虾蟹贝类', '蛋类及其制品', '大豆类及其制品'];
  const vegetableCategories = ['蔬菜类及其制品'];
  const dairyCategories = ['乳类及其制品'];
  const eggCategories = ['蛋类及其制品'];
  const fatSourceCategories = ['油脂及其制品', '坚果及籽类'];

  const [staples, proteins, vegetables, dairy, eggs, fatSources] = await Promise.all([
    getRandomFoods(stapleCategories, 30),
    getRandomFoods(proteinCategories, 30),
    getRandomFoods(vegetableCategories, 30),
    getRandomFoods(dairyCategories, 15),
    getRandomFoods(eggCategories, 15),
    getRandomFoods(fatSourceCategories, 15),
  ]);

  const mealDefs = [
    { meal: '早餐', time: '07:00-08:00', ratio: 0.30 },
    { meal: '午餐', time: '12:00-13:00', ratio: 0.40 },
    { meal: '晚餐', time: '18:00-19:00', ratio: 0.30 },
  ];

  const plans: RecipePlan[] = [];

  for (let planIdx = 0; planIdx < planCount; planIdx++) {
    const meals: MealPlan[] = [];

    for (const def of mealDefs) {
      const mealKcal = dailyCalories * def.ratio;
      const mealCarbs = targetMacros.carbs * def.ratio;
      const mealProtein = targetMacros.protein * def.ratio;
      const mealFat = targetMacros.fat * def.ratio;

      const mealType = def.meal === '早餐' ? 'breakfast' : def.meal === '午餐' ? 'lunch' : 'dinner';

      const items = buildMealWithTarget(
        mealType,
        mealKcal,
        mealCarbs,
        mealProtein,
        mealFat,
        staples, proteins, vegetables, dairy, eggs, fatSources
      );

      const totals = sumNutrients(items);
      meals.push({
        meal: def.meal,
        time: def.time,
        ratio: def.ratio,
        items,
        ...totals,
      });
    }

    const totalEnergy = meals.reduce((s, m) => s + m.totalEnergy, 0);
    const totalProtein = meals.reduce((s, m) => s + m.totalProtein, 0);
    const totalFat = meals.reduce((s, m) => s + m.totalFat, 0);
    const totalCarbs = meals.reduce((s, m) => s + m.totalCarbs, 0);

    plans.push({
      id: planIdx + 1,
      name: `方案 ${planIdx + 1}`,
      meals,
      totalEnergy: parseFloat(totalEnergy.toFixed(1)),
      totalProtein: parseFloat(totalProtein.toFixed(1)),
      totalFat: parseFloat(totalFat.toFixed(1)),
      totalCarbs: parseFloat(totalCarbs.toFixed(1)),
    });
  }

  return plans;
}

/**
 * 替换食物：从同分类中随机选一个不同的食物，保持相同份量
 */
export async function replaceFood(
  oldItem: RecipeItem,
  macroKey?: string,
  targetGrams?: number
): Promise<RecipeItem> {
  try {
    if (!oldItem || !oldItem.category || !oldItem.food_name || typeof oldItem.food_name !== 'string') {
      console.error('替换食物 - 原食物数据不完整:', JSON.stringify(oldItem));
      throw new Error('原食物数据无效');
    }

    const foodName = oldItem.food_name.trim();
    const foodCategory = oldItem.category.trim();

    if (!foodName || !foodCategory) {
      throw new Error('食物名称或分类为空');
    }

    console.log('替换食物 - 原食物:', foodName, '分类:', foodCategory, '克数:', oldItem.grams);

    const alternatives = await FoodNutrition.findAll({
      where: {
        category: foodCategory,
        food_name: { [Op.ne]: foodName },
        energy_kcal: { [Op.gt]: 0 },
      },
      order: sequelize.random(),
      limit: 1,
      raw: true,
    });

    console.log('替换食物 - 找到候选:', alternatives.length);

    if (alternatives.length === 0) {
      throw new Error(`未找到"${foodCategory}"类别下的其他食物`);
    }

    const newFood = alternatives[0];
    console.log('替换食物 - 新食物:', newFood.food_name);
    return makeItem(newFood, oldItem.grams);
  } catch (error) {
    const msg = error instanceof Error ? error.message : '未知错误';
    console.error('替换食物失败:', msg);
    throw new Error(msg);
  }
}
