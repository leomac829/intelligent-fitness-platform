import { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Input, Select, message, Radio, Card, Divider, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile, updateProfile } from '../store/userSlice';

const { Option } = Select;

let lastInitializedUserId: string | null = null;

interface UserInfo {
  sex: 'male' | 'female';
  weight: string;
  height: string;
  age: string;
}

interface WorkoutInfo {
  duration: string;
  intensity: 'beginner' | 'intermediate' | 'advanced';
}

interface FatLossGoal {
  currentWeight: string;
  targetWeight: string;
}

interface MacroDistribution {
  carbs: number;
  protein: number;
  fat: number;
}

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

interface FatLossResult {
  bmr: number;
  tdee: number;
  dailyCalories: number;
  macros: MacroDistribution;
  weeklyWeightLoss: number;
  totalWeeks: number;
  recipes: RecipePlan[];
}

const FatLossPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);

  const [userInfo, setUserInfo] = useState<UserInfo>({
    sex: 'male',
    weight: '',
    height: '',
    age: ''
  });

  const [workoutInfo, setWorkoutInfo] = useState<WorkoutInfo>({
    duration: '',
    intensity: 'beginner'
  });

  const [goal, setGoal] = useState<FatLossGoal>({
    currentWeight: '',
    targetWeight: ''
  });

  const [ratioType, setRatioType] = useState<'532' | '442'>('532');
  const [result, setResult] = useState<FatLossResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null);
  const [activePlanIdx, setActivePlanIdx] = useState(0);

  const [hasInitialized, setHasInitialized] = useState(false);
  const hasRequestedProfile = useRef(false);
  const [replacingItem, setReplacingItem] = useState<{ mealIdx: number; itemIdx: number } | null>(null);

  const loadLatestPlan = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3002/api/fatloss/latest', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.data) {
        const p = data.data;
        setRatioType((p.ratio_type as any) || '532');
        setResult({
          bmr: parseFloat(p.bmr),
          tdee: parseFloat(p.tdee),
          dailyCalories: parseFloat(p.daily_calories),
          macros: typeof p.macros === 'string' ? JSON.parse(p.macros) : p.macros,
          weeklyWeightLoss: parseFloat(p.weekly_loss),
          totalWeeks: p.total_weeks,
          recipes: typeof p.recipes === 'string' ? JSON.parse(p.recipes) : p.recipes,
        });
        setSavedPlanId(p.id || null);
        setUserInfo({
          sex: p.sex || 'male',
          weight: p.weight ? String(p.weight) : '',
          height: p.height ? String(p.height) : '',
          age: p.age ? String(p.age) : '',
        });
        setWorkoutInfo({
          duration: p.workout_duration ? String(p.workout_duration) : '',
          intensity: (p.workout_intensity as any) || 'beginner',
        });
        setGoal({
          currentWeight: p.weight ? String(p.weight) : '',
          targetWeight: p.target_weight ? String(p.target_weight) : '',
        });
      }
    } catch (e) {
      console.error('加载历史计划失败:', e);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      if (!hasRequestedProfile.current) {
        hasRequestedProfile.current = true;
        dispatch(getUserProfile() as any);
      }
      return;
    }

    loadLatestPlan();

    if (lastInitializedUserId === user.id) return;
    lastInitializedUserId = user.id;
    setHasInitialized(true);

    setUserInfo({
      sex: user.gender === 'other' ? 'male' : (user.gender || 'male'),
      weight: user.weight ? String(user.weight) : '',
      height: user.height ? String(user.height) : '',
      age: user.age ? String(user.age) : ''
    });
    setWorkoutInfo({
      duration: user.workout_duration ? String(user.workout_duration) : '',
      intensity: (user.fitness_level as any) || 'beginner'
    });
    setGoal({
      currentWeight: user.weight ? String(user.weight) : '',
      targetWeight: user.target_weight ? String(user.target_weight) : ''
    });
  }, [user, dispatch]);

  const saveUserProfile = useCallback(async () => {
    try {
      const updates: any = {};
      updates.gender = userInfo.sex;
      updates.weight = parseFloat(userInfo.weight) || undefined;
      updates.height = parseFloat(userInfo.height) || undefined;
      updates.age = parseInt(userInfo.age) || undefined;
      updates.fitness_level = workoutInfo.intensity;
      updates.workout_duration = parseInt(workoutInfo.duration) || undefined;
      updates.target_weight = parseFloat(goal.targetWeight) || undefined;

      const hasUpdates = updates.gender || updates.weight || updates.height || updates.age || updates.fitness_level || updates.workout_duration || updates.target_weight;
      if (!hasUpdates) return;

      await dispatch(updateProfile(updates) as any);
    } catch (e) {
      console.error('保存用户资料失败:', e);
    }
  }, [userInfo, workoutInfo, goal, dispatch]);

  const replaceFood = useCallback(async (mealIdx: number, itemIdx: number, item: any) => {
    try {
      if (!savedPlanId) {
        message.warning('没有保存的计划，请重新生成');
        return;
      }

      const foodName = typeof item.food_name === 'string' && item.food_name.trim() ? item.food_name : '';
      const category = typeof item.category === 'string' && item.category.trim() ? item.category : '';

      if (!foodName || !category || !item.grams) {
        console.error('替换食物 - 食物数据不完整:', item);
        message.warning('食物数据异常，无法替换');
        return;
      }

      setReplacingItem({ mealIdx, itemIdx });
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:3002/api/fatloss/replace-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: savedPlanId,
          recipeIndex: activePlanIdx,
          mealIndex: mealIdx,
          itemIndex: itemIdx,
          macroKey: 'carbohydrate',
          targetGrams: item.grams,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(prev => {
          if (!prev) return prev;
          const newRecipes = [...prev.recipes];
          const recipe = { ...newRecipes[activePlanIdx] };
          const meals = [...recipe.meals];
          const meal = { ...meals[mealIdx] };
          const items = [...meal.items];
          items[itemIdx] = data.data.newItem;
          meal.items = items;
          meal.totalEnergy = data.data.updatedMeal.totalEnergy;
          meal.totalProtein = data.data.updatedMeal.totalProtein;
          meal.totalFat = data.data.updatedMeal.totalFat;
          meal.totalCarbs = data.data.updatedMeal.totalCarbs;
          meals[mealIdx] = meal;
          recipe.meals = meals;
          recipe.totalEnergy = data.data.updatedRecipe.totalEnergy;
          recipe.totalProtein = data.data.updatedRecipe.totalProtein;
          recipe.totalFat = data.data.updatedRecipe.totalFat;
          recipe.totalCarbs = data.data.updatedRecipe.totalCarbs;
          newRecipes[activePlanIdx] = recipe;
          return { ...prev, recipes: newRecipes };
        });
        message.success(`已替换为：${data.data.newItem.food_name}`);
      } else {
        message.error(data.error || '替换失败');
      }
    } catch (e) {
      console.error('替换食物失败:', e);
      message.error('替换失败，请重试');
    } finally {
      setReplacingItem(null);
    }
  }, [savedPlanId, activePlanIdx]);

  const calculatePlan = async () => {
    if (!userInfo.weight || !userInfo.height || !userInfo.age) {
      message.error('请填写完整的个人信息');
      return;
    }
    if (!workoutInfo.duration) {
      message.error('请填写训练时长');
      return;
    }
    if (!goal.currentWeight || !goal.targetWeight) {
      message.error('请填写体重信息');
      return;
    }

    setLoading(true);

    try {
      await saveUserProfile();

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3002/api/fatloss/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sex: userInfo.sex,
          weight: parseFloat(userInfo.weight),
          height: parseFloat(userInfo.height),
          age: parseInt(userInfo.age),
          workoutDuration: parseInt(workoutInfo.duration),
          workoutIntensity: workoutInfo.intensity,
          targetWeight: parseFloat(goal.targetWeight),
          ratioType,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setSavedPlanId(data.data.planId || null);
        setResult({
          bmr: data.data.bmr,
          tdee: data.data.tdee,
          dailyCalories: data.data.dailyCalories,
          macros: data.data.macros,
          weeklyWeightLoss: data.data.fatLossPeriod.weeklyLoss,
          totalWeeks: data.data.fatLossPeriod.totalWeeks,
          recipes: data.data.recipes,
        });
        setActivePlanIdx(0);
        message.success('减脂计划生成成功！');
      } else {
        message.error(data.error || '生成失败');
      }
    } catch (error) {
      console.error('计算减脂计划失败:', error);
      message.error('网络请求失败，请检查后端服务是否启动');
    } finally {
      setLoading(false);
    }
  };

  const regenerateRecipes = async () => {
    if (!result) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3002/api/fatloss/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sex: userInfo.sex,
          weight: parseFloat(userInfo.weight),
          height: parseFloat(userInfo.height),
          age: parseInt(userInfo.age),
          workoutDuration: parseInt(workoutInfo.duration),
          workoutIntensity: workoutInfo.intensity,
          targetWeight: parseFloat(goal.targetWeight),
          ratioType,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setResult({
          bmr: data.data.bmr,
          tdee: data.data.tdee,
          dailyCalories: data.data.dailyCalories,
          macros: data.data.macros,
          weeklyWeightLoss: data.data.fatLossPeriod.weeklyLoss,
          totalWeeks: data.data.fatLossPeriod.totalWeeks,
          recipes: data.data.recipes,
        });
        setActivePlanIdx(0);
        message.success('食谱已重新生成');
      } else {
        message.error(data.error || '重新生成失败');
      }
    } catch (error) {
      console.error('重新生成食谱失败:', error);
      message.error('网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  const switchPlan = (direction: 'prev' | 'next') => {
    if (!result || !result.recipes) return;
    const len = result.recipes.length;
    if (len <= 1) return;
    setActivePlanIdx(prev => {
      if (direction === 'prev') return prev <= 0 ? len - 1 : prev - 1;
      return prev >= len - 1 ? 0 : prev + 1;
    });
  };

  const activeRecipe = result?.recipes?.[activePlanIdx];
  const hasMeals = activeRecipe && activeRecipe.meals && activeRecipe.meals.length > 0;
  const totalPlans = result?.recipes?.length || 0;

  return (
    <div className="h-full p-6" style={{ height: '100%' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white"
            onClick={() => navigate('/dashboard')}
          >
            ← 返回
          </Button>
          <h1 className="text-2xl font-bold text-white">减脂饮食计划</h1>
        </div>
        <Tag color="blue" className="text-base px-4 py-1">智能计算</Tag>
      </div>

      {/* 三栏布局: 左侧2列 个人信息, 中间3列 热量分析, 右侧4列 推荐食谱 */}
      <div className="grid grid-cols-9 gap-4" style={{ height: 'calc(100vh - 120px)' }}>

        {/* ===== 左侧 2列: 个人信息表单（独立卡片） ===== */}
        <div className="col-span-2 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
          <Card
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex-shrink-0"
            title={<span className="text-white text-base">📊 个人信息</span>}
            bodyStyle={{ padding: '12px' }}
          >
            <div className="space-y-3">
              <div>
                <label className="block text-white/80 text-xs mb-1">性别</label>
                <Radio.Group
                  value={userInfo.sex}
                  onChange={(e) => setUserInfo({ ...userInfo, sex: e.target.value })}
                  size="small"
                  buttonStyle="solid"
                  className="fatloss-radio-group"
                >
                  <Radio.Button value="male">男</Radio.Button>
                  <Radio.Button value="female">女</Radio.Button>
                </Radio.Group>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <Input
                  type="number"
                  size="small"
                  value={userInfo.weight}
                  onChange={(e) => setUserInfo({ ...userInfo, weight: e.target.value })}
                  placeholder="体重 kg"
                  style={{ backgroundColor: 'rgba(15, 23, 42, 0.60)', borderColor: 'rgba(148, 163, 184, 0.40)', color: '#f1f5f9', borderRadius: 8 }}
                />
                <Input
                  type="number"
                  size="small"
                  value={userInfo.height}
                  onChange={(e) => setUserInfo({ ...userInfo, height: e.target.value })}
                  placeholder="身高 cm"
                  style={{ backgroundColor: 'rgba(15, 23, 42, 0.60)', borderColor: 'rgba(148, 163, 184, 0.40)', color: '#f1f5f9', borderRadius: 8 }}
                />
                <Input
                  type="number"
                  size="small"
                  value={userInfo.age}
                  onChange={(e) => setUserInfo({ ...userInfo, age: e.target.value })}
                  placeholder="年龄"
                  style={{ backgroundColor: 'rgba(15, 23, 42, 0.60)', borderColor: 'rgba(148, 163, 184, 0.40)', color: '#f1f5f9', borderRadius: 8 }}
                />
              </div>
            </div>
          </Card>

          <Card
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex-shrink-0"
            title={<span className="text-white text-base">🏋️ 训练信息</span>}
            bodyStyle={{ padding: '12px' }}
          >
            <div className="space-y-3">
              <div>
                <label className="block text-white/80 text-xs mb-1">训练时长 (分钟/天)</label>
                <Input
                  type="number"
                  size="small"
                  value={workoutInfo.duration}
                  onChange={(e) => setWorkoutInfo({ ...workoutInfo, duration: e.target.value })}
                  placeholder="60"
                  style={{ backgroundColor: 'rgba(15, 23, 42, 0.60)', borderColor: 'rgba(148, 163, 184, 0.40)', color: '#f1f5f9', borderRadius: 8 }}
                />
              </div>
              <div>
                <label className="block text-white/80 text-xs mb-1">训练强度</label>
                <Select
                  value={workoutInfo.intensity}
                  onChange={(value) => setWorkoutInfo({ ...workoutInfo, intensity: value })}
                  size="small"
                  style={{ backgroundColor: 'rgba(15, 23, 42, 0.60)', borderColor: 'rgba(148, 163, 184, 0.40)', color: '#f1f5f9', borderRadius: 8, width: '100%' }}
                  dropdownClassName="bg-slate-800"
                >
                  <Option value="beginner">新手 (5 kcal/分钟)</Option>
                  <Option value="intermediate">爱好者 (8 kcal/分钟)</Option>
                  <Option value="advanced">资深 (10 kcal/分钟)</Option>
                </Select>
              </div>
            </div>
          </Card>

          <Card
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex-shrink-0"
            title={<span className="text-white text-base">🎯 减脂目标</span>}
            bodyStyle={{ padding: '12px' }}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="block text-white/80 text-xs mb-1">当前体重 (kg)</label>
                  <Input
                    type="number"
                    size="small"
                    value={goal.currentWeight}
                    onChange={(e) => setGoal({ ...goal, currentWeight: e.target.value })}
                    placeholder="70"
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.60)', borderColor: 'rgba(148, 163, 184, 0.40)', color: '#f1f5f9', borderRadius: 8 }}
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-xs mb-1">目标体重 (kg)</label>
                  <Input
                    type="number"
                    size="small"
                    value={goal.targetWeight}
                    onChange={(e) => setGoal({ ...goal, targetWeight: e.target.value })}
                    placeholder="60"
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.60)', borderColor: 'rgba(148, 163, 184, 0.40)', color: '#f1f5f9', borderRadius: 8 }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/80 text-xs mb-1">营养素模式</label>
                <Radio.Group
                  value={ratioType}
                  onChange={(e) => setRatioType(e.target.value)}
                  size="small"
                  buttonStyle="solid"
                  className="fatloss-radio-group"
                >
                  <Radio.Button value="532">碳水50% 蛋白30% 脂肪20%</Radio.Button>
                  <Radio.Button value="442">碳水40% 蛋白40% 脂肪20%</Radio.Button>
                </Radio.Group>
              </div>
              <Button
                type="primary"
                block
                size="middle"
                loading={loading}
                onClick={calculatePlan}
                className="bg-gradient-to-r from-blue-500 to-purple-500 border-none"
              >
                🚀 生成减脂计划
              </Button>
            </div>
          </Card>
        </div>

        {/* ===== 中间 3列: 热量分析（独立卡片） ===== */}
        <div className="col-span-3 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
          {result ? (
            <>
              <Card
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex-shrink-0"
                title={<span className="text-white text-base">🔥 热量分析</span>}
                bodyStyle={{ padding: '12px' }}
              >
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-white/60 text-xs mb-1">基础代谢</div>
                    <div className="text-lg font-bold text-blue-400">{result.bmr}</div>
                    <div className="text-white/40 text-xs">kcal/天</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-white/60 text-xs mb-1">总消耗</div>
                    <div className="text-lg font-bold text-orange-400">{result.tdee}</div>
                    <div className="text-white/40 text-xs">kcal/天</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-white/60 text-xs mb-1">建议摄入</div>
                    <div className="text-lg font-bold text-green-400">{result.dailyCalories}</div>
                    <div className="text-white/40 text-xs">kcal/天</div>
                  </div>
                </div>
              </Card>

              <Card
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex-shrink-0"
                title={<span className="text-white text-base">🥗 三大营养素</span>}
                bodyStyle={{ padding: '12px' }}
              >
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-center">
                    <div className="text-blue-300 text-xs mb-1">碳水</div>
                    <div className="text-xl font-bold text-blue-400">{result.macros.carbs}g</div>
                    <div className="text-white/40 text-xs">{((result.macros.carbs * 4 / result.dailyCalories) * 100).toFixed(0)}%</div>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
                    <div className="text-green-300 text-xs mb-1">蛋白质</div>
                    <div className="text-xl font-bold text-green-400">{result.macros.protein}g</div>
                    <div className="text-white/40 text-xs">{((result.macros.protein * 4 / result.dailyCalories) * 100).toFixed(0)}%</div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center">
                    <div className="text-yellow-300 text-xs mb-1">脂肪</div>
                    <div className="text-xl font-bold text-yellow-400">{result.macros.fat}g</div>
                    <div className="text-white/40 text-xs">{((result.macros.fat * 9 / result.dailyCalories) * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </Card>

              <Card
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex-shrink-0"
                title={<span className="text-white text-base">📅 减脂周期</span>}
                bodyStyle={{ padding: '12px' }}
              >
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 text-center">
                    <div className="text-purple-300 text-xs mb-1">每周需减</div>
                    <div className="text-lg font-bold text-purple-400">{result.weeklyWeightLoss}kg</div>
                  </div>
                  <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-3 text-center">
                    <div className="text-pink-300 text-xs mb-1">预计周期</div>
                    <div className="text-lg font-bold text-pink-400">{result.totalWeeks}周</div>
                    <div className="text-white/40 text-xs">{(result.totalWeeks / 4).toFixed(1)}个月</div>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-white text-lg mb-2">填写左侧信息</h3>
                <p className="text-white/60 text-sm">生成你的专属减脂饮食计划</p>
              </div>
            </div>
          )}
        </div>

        {/* ===== 右侧 4列: 推荐食谱 ===== */}
        <div className="col-span-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          {hasMeals ? (
            <>
              <Card
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex-shrink-0"
                title={
                  <div className="flex items-center justify-between">
                    <span className="text-white text-base">🍽️ {activeRecipe.name}</span>
                    <div className="flex items-center gap-1">
                      <Button size="small" className="bg-white/10 hover:bg-white/20 border-white/20 text-white h-6 px-2" onClick={() => switchPlan('prev')}>‹</Button>
                      <span className="text-white/60 text-xs">{activePlanIdx + 1}/{totalPlans}</span>
                      <Button size="small" className="bg-white/10 hover:bg-white/20 border-white/20 text-white h-6 px-2" onClick={() => switchPlan('next')}>›</Button>
                      <Divider type="vertical" className="border-white/20" />
                      <Button size="small" className="bg-white/10 hover:bg-white/20 border-white/20 text-white h-6 px-2" onClick={regenerateRecipes} loading={loading}>换一批</Button>
                    </div>
                  </div>
                }
                bodyStyle={{ padding: '12px 16px' }}
              >
                <div className="flex justify-between text-xs text-white/50 mb-2">
                  <span>总热量: {activeRecipe.totalEnergy.toFixed(1)}kcal</span>
                  <span>蛋白质 {activeRecipe.totalProtein.toFixed(1)}g | 脂肪 {activeRecipe.totalFat.toFixed(1)}g | 碳水 {activeRecipe.totalCarbs.toFixed(1)}g</span>
                </div>
              </Card>

              {(activeRecipe.meals || []).map((meal) => (
                <Card
                  key={meal.meal}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex-shrink-0"
                  title={
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-base">{meal.meal === '早餐' ? '🌅' : meal.meal === '午餐' ? '☀️' : '🌙'} {meal.meal}</span>
                        <span className="text-white/40 text-xs">{meal.time}</span>
                      </div>
                      <div className="text-orange-400 text-sm">{meal.totalEnergy.toFixed(1)} kcal</div>
                    </div>
                  }
                  bodyStyle={{ padding: '12px 16px' }}
                >
                  <div className="space-y-1.5">
                    {(meal.items || []).map((item, itemIndex) => {
                      const mealIndex = (activeRecipe.meals || []).findIndex(m => m.meal === meal.meal);
                      const isReplacing = replacingItem?.mealIdx === mealIndex && replacingItem?.itemIdx === itemIndex;
                      return (
                        <div
                          key={itemIndex}
                          className="flex items-center justify-between text-sm cursor-pointer hover:bg-white/10 rounded-lg px-2 py-1 -mx-2 transition-colors group"
                          onClick={() => replaceFood(mealIndex, itemIndex, item)}
                          title="点击替换同分类食物"
                        >
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-500/20 text-blue-300">
                              {item.subcategory || item.category}
                            </span>
                            <span className="text-white text-sm">{item.food_name}</span>
                            {isReplacing && (
                              <span className="text-xs text-blue-300 animate-pulse">替换中...</span>
                            )}
                          </div>
                          <div className="text-white/70 text-xs flex items-center gap-2">
                            <span>{item.grams}g · {item.energy_kcal.toFixed(1)}kcal</span>
                            <span className="opacity-0 group-hover:opacity-100 text-blue-300 text-xs">🔄</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Divider className="border-white/10 my-2" />
                  <div className="flex justify-between text-xs text-white/50">
                    <span>蛋白质: {meal.totalProtein.toFixed(1)}g</span>
                    <span>脂肪: {meal.totalFat.toFixed(1)}g</span>
                    <span>碳水: {meal.totalCarbs.toFixed(1)}g</span>
                  </div>
                </Card>
              ))}
            </>
          ) : result ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-5xl mb-4">🍽️</div>
                <h3 className="text-white text-lg mb-2">暂无食谱</h3>
                <p className="text-white/60 text-sm">生成计划后显示三餐推荐</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-5xl mb-4">⏳</div>
                <h3 className="text-white text-lg mb-2">等待生成</h3>
                <p className="text-white/60 text-sm">填写信息并生成计划</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FatLossPlanPage;
