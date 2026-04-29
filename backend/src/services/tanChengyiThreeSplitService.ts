/**
 * 谭成义三分化训练计划生成服务
 * 严格还原抖音@凯圣王 视频《谭成义三分化①——训练计划》全部细节
 */

// ---------- 配置类型定义 ----------
export interface UserTrainingConfig {
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  training_goal?: 'muscle_gain' | 'strength' | 'fat_loss';
  available_equipment?: string[];
  weekly_training_days?: number;
  base_weight?: number;
  progressive_rate?: number;
  plan_weeks?: number;
}

// ---------- 核心数据结构 ----------
export interface TrainingExercise {
  name: string;
  muscle_group: string;
  equipment: string;
  sets: number;
  reps: string;
  rest_time: number;
  priority: number;
  alternative_name?: string;
  alternative_equipment?: string;
  tips?: string;
  week?: number;
  day_type?: string;
  day_index?: number;
  recommended_weight?: number;
}

export interface TrainingDay {
  day_type: string;
  day_type_cn: string;
  exercises: TrainingExercise[];
  day_index: number;
}

// ---------- 视频动作库常量（1:1复刻） ----------
const PUSH_EXERCISES: Omit<TrainingExercise, 'week' | 'day_type' | 'day_index' | 'recommended_weight'>[] = [
  {
    name: '杠铃卧推（平板）',
    muscle_group: '胸大肌中束',
    equipment: '杠铃',
    sets: 4,
    reps: '8-10',
    rest_time: 90,
    priority: 1,
    alternative_name: '哑铃平板卧推',
    alternative_equipment: '哑铃',
    tips: '核心收紧，肩胛骨稳定，呼气发力，避免塌腰（谭指导强调动作标准优先）'
  },
  {
    name: '上斜哑铃卧推',
    muscle_group: '胸上束',
    equipment: '哑铃',
    sets: 3,
    reps: '10-12',
    rest_time: 60,
    priority: 2,
    alternative_name: '上斜杠铃卧推',
    alternative_equipment: '杠铃',
    tips: '上斜角度30-45°，避免过度耸肩，下放时控制离心（谭指导强调离心控制）'
  },
  {
    name: '坐姿肩推（哑铃/史密斯机）',
    muscle_group: '三角肌前束+中束',
    equipment: '哑铃/史密斯机',
    sets: 3,
    reps: '10',
    rest_time: 90,
    priority: 3,
    alternative_name: '站姿肩推',
    alternative_equipment: '杠铃',
    tips: '背部贴紧靠背，避免塌腰借力，推起时手臂不锁死（谭指导强调避免关节锁死）'
  },
  {
    name: '侧平举+前平举超级组',
    muscle_group: '三角肌中束+前束',
    equipment: '哑铃',
    sets: 3,
    reps: '12-15',
    rest_time: 60,
    priority: 4,
    alternative_name: '绳索侧平举+绳索前平举超级组',
    alternative_equipment: '龙门架',
    tips: '小重量控制动作，避免斜方肌代偿，全程感受肩部收缩（谭指导强调孤立发力）'
  },
  {
    name: '绳索下压',
    muscle_group: '三头肌内侧头',
    equipment: '龙门架',
    sets: 3,
    reps: '12-15',
    rest_time: 45,
    priority: 5,
    alternative_name: '窄距俯卧撑',
    alternative_equipment: '自重',
    tips: '大臂贴紧身体，手腕保持中立，避免手肘外展（谭指导强调三头肌孤立）'
  },
  {
    name: '窄距俯卧撑',
    muscle_group: '胸肌中缝+三头肌',
    equipment: '自重',
    sets: 3,
    reps: '力竭',
    rest_time: 60,
    priority: 6,
    alternative_name: '凳上三头肌臂屈伸',
    alternative_equipment: '卧推凳',
    tips: '身体前倾，感受胸肌中缝挤压，下放时手肘贴近身体（谭指导强调动作轨迹）'
  }
];

const PULL_EXERCISES: Omit<TrainingExercise, 'week' | 'day_type' | 'day_index' | 'recommended_weight'>[] = [
  {
    name: '宽握高位下拉（正握）',
    muscle_group: '背阔肌上束',
    equipment: '高位下拉机',
    sets: 4,
    reps: '8-10',
    rest_time: 90,
    priority: 1,
    alternative_name: '单杠宽握引体向上',
    alternative_equipment: '单杠',
    tips: '沉肩后展，手肘向外打开，下拉至胸口位置，避免耸肩（谭指导强调背部主导发力）'
  },
  {
    name: '俯身杠铃划船（反握）',
    muscle_group: '背阔肌中束+菱形肌',
    equipment: '杠铃',
    sets: 3,
    reps: '10',
    rest_time: 90,
    priority: 2,
    alternative_name: '俯身哑铃划船',
    alternative_equipment: '哑铃',
    tips: '背部挺直，膝盖微屈，拉至小腹位置，感受背部挤压（谭指导强调避免弯腰弓背）'
  },
  {
    name: '单臂哑铃划船',
    muscle_group: '背部单侧平衡',
    equipment: '哑铃',
    sets: 3,
    reps: '12/侧',
    rest_time: 60,
    priority: 3,
    alternative_name: '绳索单臂划船',
    alternative_equipment: '龙门架',
    tips: '核心收紧，避免身体扭转，下拉时手肘贴紧身体（谭指导强调单侧发力均衡）'
  },
  {
    name: '坐姿绳索划船（窄握）',
    muscle_group: '背中缝',
    equipment: '龙门架',
    sets: 3,
    reps: '12',
    rest_time: 60,
    priority: 4,
    alternative_name: '坐姿划船机（窄握）',
    alternative_equipment: '划船机',
    tips: '挺胸抬头，挤压肩胛骨，下放时完全伸展背部（谭指导强调背部拉伸）'
  },
  {
    name: '杠铃二头弯举',
    muscle_group: '二头肌长头',
    equipment: '杠铃',
    sets: 3,
    reps: '10',
    rest_time: 60,
    priority: 5,
    alternative_name: '哑铃二头弯举',
    alternative_equipment: '哑铃',
    tips: '大臂固定贴紧身体，只活动手肘，顶峰停顿1秒（谭指导强调顶峰收缩）'
  },
  {
    name: '锤式弯举',
    muscle_group: '二头肌短头+肱桡肌',
    equipment: '哑铃',
    sets: 3,
    reps: '12',
    rest_time: 45,
    priority: 6,
    alternative_name: '绳索锤式弯举',
    alternative_equipment: '龙门架',
    tips: '握姿像握锤子，手臂自然下垂，避免肩部代偿（谭指导强调手臂维度强化）'
  }
];

const LEG_EXERCISES: Omit<TrainingExercise, 'week' | 'day_type' | 'day_index' | 'recommended_weight'>[] = [
  {
    name: '杠铃深蹲（自由重量）',
    muscle_group: '股四头肌+臀大肌',
    equipment: '杠铃',
    sets: 4,
    reps: '8-10',
    rest_time: 120,
    priority: 1,
    alternative_name: '史密斯机深蹲',
    alternative_equipment: '史密斯机',
    tips: '背部挺直，膝盖与脚尖方向一致（不内扣），下蹲至大腿平行地面（谭指导核心强调）'
  },
  {
    name: '硬拉（传统）',
    muscle_group: '腘绳肌+臀大肌+下背部',
    equipment: '杠铃',
    sets: 3,
    reps: '8',
    rest_time: 120,
    priority: 2,
    alternative_name: '罗马尼亚硬拉',
    alternative_equipment: '杠铃',
    tips: '伸髋发力，先抬臀再起身，避免弯腰弓背，杠铃贴近腿部（谭指导强调硬拉安全动作）'
  },
  {
    name: '腿举机',
    muscle_group: '股四头肌',
    equipment: '腿举机',
    sets: 3,
    reps: '12',
    rest_time: 90,
    priority: 3,
    alternative_name: '倒蹬机',
    alternative_equipment: '倒蹬机',
    tips: '脚掌全踩踏板，膝盖不超过脚尖，下放时控制速度（谭指导强调膝盖保护）'
  },
  {
    name: '腿弯举',
    muscle_group: '腘绳肌',
    equipment: '腿弯举机',
    sets: 3,
    reps: '12',
    rest_time: 60,
    priority: 4,
    alternative_name: '俯卧腿弯举',
    alternative_equipment: '俯卧腿弯举机',
    tips: '孤立刺激腘绳肌，平衡大腿前后侧力量，避免小腿代偿（谭指导强调肌群平衡）'
  },
  {
    name: '站姿提踵',
    muscle_group: '腓肠肌+比目鱼肌',
    equipment: '提踵机/台阶',
    sets: 4,
    reps: '15-20',
    rest_time: 45,
    priority: 5,
    alternative_name: '坐姿提踵',
    alternative_equipment: '坐姿提踵机',
    tips: '顶峰停顿1秒，缓慢下放至完全伸展，感受小腿收缩（谭指导重点强调提踵细节）'
  },
  {
    name: '负重臀桥',
    muscle_group: '臀大肌',
    equipment: '杠铃/哑铃',
    sets: 3,
    reps: '12',
    rest_time: 60,
    priority: 6,
    alternative_name: '臀推机',
    alternative_equipment: '臀推机',
    tips: '上背部支撑在卧推凳上，顶髋时夹紧臀部，避免下背部代偿（谭指导强调臀部孤立）'
  }
];

const DAY_TYPE_MAPPING: Record<string, string> = {
  push: '推日（胸+肩+三头）',
  pull: '拉日（背+二头）',
  leg: '腿日（下肢+核心）'
};

// ---------- 核心业务类 ----------
export class TanChengyiThreeSplitPlan {
  private userConfig: Required<UserTrainingConfig>;
  private exerciseLibrary: Record<string, typeof PUSH_EXERCISES>;

  constructor(userConfig: UserTrainingConfig) {
    // 参数校验
    if (!['beginner', 'intermediate', 'advanced'].includes(userConfig.fitness_level)) {
      throw new Error('健身基础仅支持：beginner/intermediate/advanced');
    }
    if (userConfig.training_goal && !['muscle_gain', 'strength', 'fat_loss'].includes(userConfig.training_goal)) {
      throw new Error('训练目标仅支持：muscle_gain/strength/fat_loss');
    }
    if (userConfig.weekly_training_days && ![3, 6].includes(userConfig.weekly_training_days)) {
      throw new Error('每周训练天数仅支持3天或6天');
    }
    if (userConfig.progressive_rate && (userConfig.progressive_rate < 0.05 || userConfig.progressive_rate > 0.1)) {
      throw new Error('渐进超负荷率需在5%-10%之间');
    }

    this.userConfig = {
      fitness_level: userConfig.fitness_level,
      training_goal: userConfig.training_goal || 'muscle_gain',
      available_equipment: userConfig.available_equipment || [
        '杠铃', '哑铃', '史密斯机', '龙门架', '高位下拉机', '腿举机',
        '腿弯举机', '提踵机', '单杠', '自重', '划船机', '臀推机'
      ],
      weekly_training_days: userConfig.weekly_training_days || 3,
      base_weight: userConfig.base_weight || 50.0,
      progressive_rate: userConfig.progressive_rate || 0.05,
      plan_weeks: userConfig.plan_weeks || 4
    };

    this.exerciseLibrary = {
      push: PUSH_EXERCISES,
      pull: PULL_EXERCISES,
      leg: LEG_EXERCISES
    };
  }

  private adjustReps(repsStr: string, delta: number): string {
    if (repsStr === '力竭') return '力竭';
    if (repsStr.includes('-')) {
      const [minReps, maxReps] = repsStr.split('-').map(Number);
      const newMin = Math.max(6, minReps + delta);
      const newMax = Math.max(newMin, maxReps + delta);
      return `${newMin}-${newMax}`;
    }
    return String(Math.max(6, Number(repsStr) + delta));
  }

  private adaptExercise(exerciseDict: typeof PUSH_EXERCISES[0]): TrainingExercise | null {
    const availableEquip = this.userConfig.available_equipment;

    // 器械适配
    const baseEquipList = exerciseDict.equipment.split('/').map(eq => eq.trim());
    const hasBaseEquip = baseEquipList.some(eq => availableEquip.includes(eq));
    const hasAltEquip = exerciseDict.alternative_equipment && availableEquip.includes(exerciseDict.alternative_equipment);

    let useAlternative = false;
    if (!hasBaseEquip) {
      if (!hasAltEquip) return null;
      useAlternative = true;
    }

    const exercise: TrainingExercise = {
      name: useAlternative ? exerciseDict.alternative_name! : exerciseDict.name,
      muscle_group: exerciseDict.muscle_group,
      equipment: useAlternative ? exerciseDict.alternative_equipment! : exerciseDict.equipment,
      sets: exerciseDict.sets,
      reps: exerciseDict.reps,
      rest_time: exerciseDict.rest_time,
      priority: exerciseDict.priority,
      tips: exerciseDict.tips
    };

    // 健身基础适配
    if (this.userConfig.fitness_level === 'beginner') {
      exercise.sets = Math.max(2, exercise.sets - 1);
      exercise.reps = this.adjustReps(exercise.reps, 2);
    } else if (this.userConfig.fitness_level === 'advanced') {
      exercise.sets = Math.min(5, exercise.sets + 1);
      exercise.reps = this.adjustReps(exercise.reps, -2);
    }

    // 训练目标适配
    if (this.userConfig.training_goal === 'strength') {
      exercise.reps = this.adjustReps(exercise.reps, -2);
    } else if (this.userConfig.training_goal === 'fat_loss') {
      exercise.rest_time = Math.max(30, exercise.rest_time - 30);
      exercise.reps = this.adjustReps(exercise.reps, 5);
    }

    return exercise;
  }

  private calculateProgressiveWeight(week: number): number {
    if (week === 1) return this.userConfig.base_weight;
    return Math.round(
      this.userConfig.base_weight * Math.pow(1 + this.userConfig.progressive_rate, week - 1) * 10
    ) / 10;
  }

  generateTrainingDays(): TrainingDay[] {
    const trainingDays: TrainingDay[] = [];
    const baseDays = ['push', 'pull', 'leg'];
    const repeatCount = this.userConfig.weekly_training_days / 3;
    const weeklyDayOrder: string[] = [];
    for (let i = 0; i < repeatCount; i++) {
      weeklyDayOrder.push(...baseDays);
    }

    for (let week = 1; week <= this.userConfig.plan_weeks; week++) {
      for (let dayIndex = 0; dayIndex < weeklyDayOrder.length; dayIndex++) {
        const dayType = weeklyDayOrder[dayIndex];
        const adaptedExercises: TrainingExercise[] = [];

        for (const exDict of this.exerciseLibrary[dayType]) {
          const ex = this.adaptExercise(exDict);
          if (ex) {
            ex.week = week;
            ex.day_type = dayType;
            ex.day_index = dayIndex + 1;
            ex.recommended_weight = this.calculateProgressiveWeight(week);
            adaptedExercises.push(ex);
          }
        }

        adaptedExercises.sort((a, b) => a.priority - b.priority);

        trainingDays.push({
          day_type: dayType,
          day_type_cn: DAY_TYPE_MAPPING[dayType],
          exercises: adaptedExercises,
          day_index: dayIndex + 1
        });
      }
    }

    return trainingDays;
  }

  exportToJson(): Record<string, any>[] {
    const trainingDays = this.generateTrainingDays();
    const jsonData: Record<string, any>[] = [];

    for (const day of trainingDays) {
      jsonData.push({
        周次: day.exercises[0]?.week,
        训练日类型: day.day_type,
        训练日名称: day.day_type_cn,
        本周训练日序号: day.day_index,
        动作列表: day.exercises.map(ex => ({
          动作名称: ex.name,
          训练肌群: ex.muscle_group,
          所需器械: ex.equipment,
          组数: ex.sets,
          次数: ex.reps,
          休息时间秒: ex.rest_time,
          建议重量kg: ex.recommended_weight,
          训练要点: ex.tips
        }))
      });
    }

    return jsonData;
  }
}
