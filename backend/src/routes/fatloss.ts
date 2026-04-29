import express, { Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {
  calculateBMR,
  calculateTDEE,
  distributeMacros,
  calculateFatLossPeriod,
  adjustCarbIntake,
  generateRecipes,
  replaceFood,
} from '../services/fatlossService';
import FatLossPlan from '../models/FatLossPlan';

const router = express.Router();

router.post('/calculate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: '未登录' });
    }
    const { sex, weight, height, age, workoutDuration, workoutIntensity, targetWeight, ratioType } = req.body;

    if (!sex || !weight || !height || !age || !workoutDuration || !workoutIntensity || !targetWeight) {
      return res.status(400).json({ error: '请填写完整的个人信息和训练信息' });
    }

    const bmr = calculateBMR(sex, weight, height, age);
    const tdee = calculateTDEE(bmr, workoutDuration, workoutIntensity);
    const dailyCalories = Math.max(tdee - 400, bmr);
    const macros = distributeMacros(dailyCalories, ratioType || '532');
    const fatLossPeriod = calculateFatLossPeriod(weight, targetWeight);
    const recipes = await generateRecipes(macros, dailyCalories, 3);

    const savedPlan = await FatLossPlan.create({
      user_id: userId,
      sex,
      weight,
      height,
      age,
      workout_duration: workoutDuration,
      workout_intensity: workoutIntensity,
      target_weight: targetWeight,
      ratio_type: ratioType || '532',
      bmr,
      tdee,
      daily_calories: dailyCalories,
      macros,
      weekly_loss: fatLossPeriod.weeklyLoss,
      total_months: fatLossPeriod.totalMonths,
      total_weeks: fatLossPeriod.totalWeeks,
      recipes,
    });

    res.json({
      success: true,
      data: {
        planId: savedPlan.id,
        bmr,
        tdee,
        dailyCalories,
        macros,
        fatLossPeriod,
        recipes,
      },
    });
  } catch (error) {
    console.error('计算减脂计划失败:', error);
    res.status(500).json({ error: '计算失败，请稍后重试' });
  }
});

router.get('/latest', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const plan = await FatLossPlan.findOne({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      raw: true,
    });
    if (plan) {
      res.json({ success: true, data: plan });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (error) {
    console.error('获取减脂计划失败:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

router.post('/adjust-carbs', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { currentCarb, actualWeeklyLoss, targetWeeklyLoss } = req.body;

    if (currentCarb === undefined || actualWeeklyLoss === undefined || targetWeeklyLoss === undefined) {
      return res.status(400).json({ error: '请提供完整的调整参数' });
    }

    const adjustedCarb = adjustCarbIntake(currentCarb, actualWeeklyLoss, targetWeeklyLoss);

    res.json({
      success: true,
      data: { adjustedCarb },
    });
  } catch (error) {
    console.error('调整碳水摄入失败:', error);
    res.status(500).json({ error: '调整失败，请稍后重试' });
  }
});

router.post('/replace-food', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: '未登录' });
    }

    const { planId, recipeIndex, mealIndex, itemIndex, macroKey, targetGrams } = req.body;

    if (!planId || recipeIndex === undefined || mealIndex === undefined || itemIndex === undefined) {
      console.error('替换食物参数错误:', { planId, recipeIndex, mealIndex, itemIndex });
      return res.status(400).json({ error: '请提供完整的替换参数' });
    }

    const plan = await FatLossPlan.findOne({
      where: { id: planId, user_id: userId },
    });
    if (!plan) {
      console.error('计划不存在或无权限:', planId, 'userId:', userId);
      return res.status(404).json({ error: '计划不存在' });
    }

    const planData = plan.toJSON();
    const recipes = typeof planData.recipes === 'string' ? JSON.parse(planData.recipes) : planData.recipes;
    if (!recipes || !Array.isArray(recipes)) {
      console.error('食谱数据格式错误');
      return res.status(400).json({ error: '食谱数据格式错误' });
    }

    const recipe = recipes[recipeIndex];
    if (!recipe || !recipe.meals || !recipe.meals[mealIndex] || !recipe.meals[mealIndex].items[itemIndex]) {
      console.error('食物项不存在:', { recipeIndex, mealIndex, itemIndex });
      return res.status(400).json({ error: '食物项不存在' });
    }

    const oldItem = recipe.meals[mealIndex].items[itemIndex];
    const newItem = await replaceFood(oldItem, macroKey, targetGrams);

    // 更新食物项
    recipe.meals[mealIndex].items[itemIndex] = newItem;

    // 重新计算餐营养素总和
    const meal = recipe.meals[mealIndex];
    meal.totalEnergy = parseFloat(meal.items.reduce((s: number, i: any) => s + i.energy_kcal, 0).toFixed(1));
    meal.totalProtein = parseFloat(meal.items.reduce((s: number, i: any) => s + i.protein, 0).toFixed(1));
    meal.totalFat = parseFloat(meal.items.reduce((s: number, i: any) => s + i.fat, 0).toFixed(1));
    meal.totalCarbs = parseFloat(meal.items.reduce((s: number, i: any) => s + i.carbohydrate, 0).toFixed(1));

    // 重新计算方案总和
    recipe.totalEnergy = parseFloat(recipe.meals.reduce((s: number, m: any) => s + m.totalEnergy, 0).toFixed(1));
    recipe.totalProtein = parseFloat(recipe.meals.reduce((s: number, m: any) => s + m.totalProtein, 0).toFixed(1));
    recipe.totalFat = parseFloat(recipe.meals.reduce((s: number, m: any) => s + m.totalFat, 0).toFixed(1));
    recipe.totalCarbs = parseFloat(recipe.meals.reduce((s: number, m: any) => s + m.totalCarbs, 0).toFixed(1));

    // 保存更新后的计划
    await plan.update({ recipes });

    res.json({
      success: true,
      data: {
        newItem,
        updatedMeal: meal,
        updatedRecipe: recipe,
        updatedPlan: plan.recipes,
      },
    });
  } catch (error) {
    console.error('替换食物失败:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : '替换失败，请稍后重试' });
  }
});

export default router;
