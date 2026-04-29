import express from 'express';
import { Op } from 'sequelize';
import FoodNutrition from '../models/FoodNutrition';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 获取分类列表
router.get('/categories', async (req, res) => {
  try {
    const categories = await FoodNutrition.findAll({
      attributes: ['category', 'subcategory'],
      group: ['category', 'subcategory'],
      order: [['category', 'ASC'], ['subcategory', 'ASC']],
      raw: true
    });

    // 按 category 分组
    const grouped = categories.reduce((acc: Record<string, string[]>, curr: any) => {
      if (!acc[curr.category]) {
        acc[curr.category] = [];
      }
      acc[curr.category].push(curr.subcategory);
      return acc;
    }, {});

    res.status(200).json({ categories: grouped });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({ error: '获取分类列表失败' });
  }
});

// 搜索食品（支持关键词、分类、营养范围筛选）
router.get('/search', async (req, res) => {
  try {
    const { keyword, category, subcategory, minCalories, maxCalories, minProtein, maxProtein, minFat, maxFat, minCarbs, maxCarbs, limit = 50 } = req.query;
    const where: any = {};

    if (keyword) {
      where.food_name = { [Op.iLike]: `%${keyword}%` };
    }

    if (category && category !== '全部') {
      where.category = category;
    }

    if (subcategory && subcategory !== '全部') {
      where.subcategory = subcategory;
    }

    if (minCalories) where.energy_kcal = { ...where.energy_kcal, [Op.gte]: minCalories };
    if (maxCalories) where.energy_kcal = { ...where.energy_kcal, [Op.lte]: maxCalories };
    if (minProtein) where.protein = { ...where.protein, [Op.gte]: minProtein };
    if (maxProtein) where.protein = { ...where.protein, [Op.lte]: maxProtein };
    if (minFat) where.fat = { ...where.fat, [Op.gte]: minFat };
    if (maxFat) where.fat = { ...where.fat, [Op.lte]: maxFat };
    if (minCarbs) where.carbohydrate = { ...where.carbohydrate, [Op.gte]: minCarbs };
    if (maxCarbs) where.carbohydrate = { ...where.carbohydrate, [Op.lte]: maxCarbs };

    const foods = await FoodNutrition.findAll({
      where,
      limit: parseInt(limit as string),
      order: [['food_name', 'ASC']]
    });

    res.status(200).json({ foods });
  } catch (error) {
    console.error('搜索食品失败:', error);
    res.status(500).json({ error: '搜索食品失败' });
  }
});

// 获取食品列表（分页）
router.get('/', async (req, res) => {
  try {
    const { category, subcategory, page = 1, limit = 20 } = req.query;
    const where: any = {};

    if (category && category !== '全部') {
      where.category = category;
    }

    if (subcategory && subcategory !== '全部') {
      where.subcategory = subcategory;
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const { count, rows } = await FoodNutrition.findAndCountAll({
      where,
      limit: parseInt(limit as string),
      offset,
      order: [['food_name', 'ASC']]
    });

    res.status(200).json({
      foods: rows,
      pagination: {
        total: count,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(count / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('获取食品列表失败:', error);
    res.status(500).json({ error: '获取食品列表失败' });
  }
});

// 获取食品详情
router.get('/:id', async (req, res) => {
  try {
    const food = await FoodNutrition.findByPk(req.params.id);

    if (!food) {
      return res.status(404).json({ error: '食品不存在' });
    }

    res.status(200).json({ food });
  } catch (error) {
    console.error('获取食品详情失败:', error);
    res.status(500).json({ error: '获取食品详情失败' });
  }
});

// 批量获取食品营养（用于饮食计划生成）
router.post('/batch', async (req, res) => {
  try {
    const { food_ids } = req.body;

    if (!food_ids || !Array.isArray(food_ids) || food_ids.length === 0) {
      return res.status(400).json({ error: '请提供食品ID列表' });
    }

    const foods = await FoodNutrition.findAll({
      where: { id: { [Op.in]: food_ids } }
    });

    res.status(200).json({ foods });
  } catch (error) {
    console.error('批量获取食品失败:', error);
    res.status(500).json({ error: '批量获取食品失败' });
  }
});

// 按关键词精确搜索（用于饮食计划生成时的食材匹配）
router.get('/search/exact', async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: '请提供搜索关键词' });
    }

    const foods = await FoodNutrition.findAll({
      where: {
        [Op.or]: [
          { food_name: { [Op.iLike]: `${keyword}` } },
          { food_name: { [Op.iLike]: `${keyword}%` } }
        ]
      },
      limit: 10,
      order: [['food_name', 'ASC']]
    });

    res.status(200).json({ foods });
  } catch (error) {
    console.error('精确搜索失败:', error);
    res.status(500).json({ error: '精确搜索失败' });
  }
});

export default router;
