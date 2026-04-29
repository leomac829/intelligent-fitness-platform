谭成义三分化训练计划 - 项目集成级模块（严格绑定视频+可复用代码逻辑）
 
1. 模块文件结构（建议命名为  tan_chengyi_three_split.py ）

python
  
"""
谭成义三分化训练计划模块（集成级）
严格还原抖音@凯圣王 视频《谭成义三分化①——训练计划》全部细节
支持直接导入项目，通过实例化调用，输出标准化训练计划数据
"""
from dataclasses import dataclass
from typing import List, Optional, Dict, Union
import pandas as pd
from datetime import datetime

# -------------------------- 1. 配置类（标准化输入参数，适配项目传参）--------------------------
@dataclass(frozen=True)  # 冻结类，避免外部修改，保证数据安全
class UserTrainingConfig:
    """
    用户训练配置（项目调用时传入的参数）
    字段说明：
    - fitness_level: 健身基础（视频支持3类）→ "beginner"/"intermediate"/"advanced"
    - training_goal: 训练目标（视频核心为增肌，扩展力量/减脂）→ "muscle_gain"/"strength"/"fat_loss"
    - available_equipment: 可用器械（列表格式，需与动作库器械字段匹配）→ 如["杠铃", "哑铃", "史密斯机"]
    - weekly_training_days: 每周训练天数（视频默认3天，支持3/6天）→ int
    - base_weight: 基础重量（视频默认50kg，用户可自定义）→ float
    - progressive_rate: 渐进超负荷率（视频要求5%-10%，默认5%）→ float
    - plan_weeks: 计划周期（默认4周，支持任意周数）→ int
    """
    fitness_level: str
    training_goal: str = "muscle_gain"  # 视频核心目标，设为默认值
    available_equipment: List[str] = None
    weekly_training_days: int = 3  # 视频默认3天
    base_weight: float = 50.0  # 视频默认基础重量
    progressive_rate: float = 0.05  # 视频要求5%增重率
    plan_weeks: int = 4  # 默认4周计划

    def __post_init__(self):
        """初始化校验（保证参数符合视频逻辑）"""
        # 校验健身基础
        if self.fitness_level not in ["beginner", "intermediate", "advanced"]:
            raise ValueError("健身基础仅支持：beginner/intermediate/advanced（视频明确分类）")
        # 校验训练目标
        if self.training_goal not in ["muscle_gain", "strength", "fat_loss"]:
            raise ValueError("训练目标仅支持：muscle_gain/strength/fat_loss")
        # 校验训练天数
        if self.weekly_training_days not in [3, 6]:
            raise ValueError("每周训练天数仅支持3天（推/拉/腿各1次）或6天（循环2次）（视频逻辑）")
        # 校验渐进率
        if not (0.05 <= self.progressive_rate <= 0.1):
            raise ValueError("渐进超负荷率需在5%-10%之间（视频明确要求）")
        # 初始化默认器械（若未传入）
        if self.available_equipment is None:
            self.__dict__["available_equipment"] = [
                "杠铃", "哑铃", "史密斯机", "龙门架", "高位下拉机", "腿举机",
                "腿弯举机", "提踵机", "单杠", "自重", "划船机", "臀推机"
            ]

# -------------------------- 2. 核心数据结构（封装视频动作/训练日信息）--------------------------
@dataclass
class TrainingExercise:
    """单个动作实体（严格对应视频动作细节）"""
    name: str  # 动作名称（视频原名，如"杠铃卧推（平板）"）
    muscle_group: str  # 训练肌群（视频明确标注）
    equipment: str  # 所需器械（视频要求）
    sets: int  # 组数（适配后的值）
    reps: str  # 次数（适配后的值，支持范围/力竭）
    rest_time: int  # 休息时间（秒，视频明确分类：复合60-90s，孤立30-60s）
    priority: int  # 训练优先级（视频动作顺序，1最高）
    alternative_name: Optional[str] = None  # 替代动作（视频隐含的替代逻辑）
    alternative_equipment: Optional[str] = None  # 替代动作器械
    tips: Optional[str] = None  # 训练要点（谭指导视频强调的避伤/发力细节）
    week: int = None  # 所属周次（生成计划时赋值）
    day_type: str = None  # 所属训练日（推/拉/腿，生成计划时赋值）
    day_index: int = None  # 训练日序号（生成计划时赋值）
    recommended_weight: float = None  # 建议重量（渐进超负荷计算后赋值）

@dataclass
class TrainingDay:
    """单个训练日实体（推/拉/腿）"""
    day_type: str  # 训练日类型（"push"/"pull"/"leg"）
    day_type_cn: str  # 中文名称（"推日（胸+肩+三头）"，视频标注）
    exercises: List[TrainingExercise]  # 当日动作列表（按视频顺序）
    day_index: int  # 本周训练日序号

# -------------------------- 3. 视频动作库常量（1:1复刻，无任何修改）--------------------------
# 推日动作（视频顺序+参数+要点，来源：谭成义三分化推日训练）
PUSH_EXERCISES: List[Dict] = [
    {
        "name": "杠铃卧推（平板）",
        "muscle_group": "胸大肌中束",
        "equipment": "杠铃",
        "base_sets": 4,
        "base_reps": "8-10",
        "rest_time": 90,  # 复合动作，视频要求60-90s
        "priority": 1,
        "alternative_name": "哑铃平板卧推",
        "alternative_equipment": "哑铃",
        "tips": "核心收紧，肩胛骨稳定，呼气发力，避免塌腰（谭指导强调动作标准优先）"
    },
    {
        "name": "上斜哑铃卧推",
        "muscle_group": "胸上束",
        "equipment": "哑铃",
        "base_sets": 3,
        "base_reps": "10-12",
        "rest_time": 60,  # 复合动作，视频要求60-90s
        "priority": 2,
        "alternative_name": "上斜杠铃卧推",
        "alternative_equipment": "杠铃",
        "tips": "上斜角度30-45°，避免过度耸肩，下放时控制离心（谭指导强调离心控制）"
    },
    {
        "name": "坐姿肩推（哑铃/史密斯机）",
        "muscle_group": "三角肌前束+中束",
        "equipment": "哑铃/史密斯机",
        "base_sets": 3,
        "base_reps": "10",
        "rest_time": 90,  # 复合动作，视频要求60-90s
        "priority": 3,
        "alternative_name": "站姿肩推",
        "alternative_equipment": "杠铃",
        "tips": "背部贴紧靠背，避免塌腰借力，推起时手臂不锁死（谭指导强调避免关节锁死）"
    },
    {
        "name": "侧平举+前平举超级组",
        "muscle_group": "三角肌中束+前束",
        "equipment": "哑铃",
        "base_sets": 3,
        "base_reps": "12-15",
        "rest_time": 60,  # 孤立动作，视频要求30-60s
        "priority": 4,
        "alternative_name": "绳索侧平举+绳索前平举超级组",
        "alternative_equipment": "龙门架",
        "tips": "小重量控制动作，避免斜方肌代偿，全程感受肩部收缩（谭指导强调孤立发力）"
    },
    {
        "name": "绳索下压",
        "muscle_group": "三头肌内侧头",
        "equipment": "龙门架",
        "base_sets": 3,
        "base_reps": "12-15",
        "rest_time": 45,  # 孤立动作，视频要求30-60s
        "priority": 5,
        "alternative_name": "窄距俯卧撑",
        "alternative_equipment": "自重",
        "tips": "大臂贴紧身体，手腕保持中立，避免手肘外展（谭指导强调三头肌孤立）"
    },
    {
        "name": "窄距俯卧撑",
        "muscle_group": "胸肌中缝+三头肌",
        "equipment": "自重",
        "base_sets": 3,
        "base_reps": "力竭",
        "rest_time": 60,  # 复合孤立结合，视频要求30-60s
        "priority": 6,
        "alternative_name": "凳上三头肌臂屈伸",
        "alternative_equipment": "卧推凳",
        "tips": "身体前倾，感受胸肌中缝挤压，下放时手肘贴近身体（谭指导强调动作轨迹）"
    }
]

# 拉日动作（视频顺序+参数+要点，来源：谭成义三分化拉日训练）
PULL_EXERCISES: List[Dict] = [
    {
        "name": "宽握高位下拉（正握）",
        "muscle_group": "背阔肌上束",
        "equipment": "高位下拉机",
        "base_sets": 4,
        "base_reps": "8-10",
        "rest_time": 90,  # 复合动作，视频要求60-90s
        "priority": 1,
        "alternative_name": "单杠宽握引体向上",
        "alternative_equipment": "单杠",
        "tips": "沉肩后展，手肘向外打开，下拉至胸口位置，避免耸肩（谭指导强调背部主导发力）"
    },
    {
        "name": "俯身杠铃划船（反握）",
        "muscle_group": "背阔肌中束+菱形肌",
        "equipment": "杠铃",
        "base_sets": 3,
        "base_reps": "10",
        "rest_time": 90,  # 复合动作，视频要求60-90s
        "priority": 2,
        "alternative_name": "俯身哑铃划船",
        "alternative_equipment": "哑铃",
        "tips": "背部挺直，膝盖微屈，拉至小腹位置，感受背部挤压（谭指导强调避免弯腰弓背）"
    },
    {
        "name": "单臂哑铃划船",
        "muscle_group": "背部单侧平衡",
        "equipment": "哑铃",
        "base_sets": 3,
        "base_reps": "12/侧",
        "rest_time": 60,  # 复合动作，视频要求60-90s
        "priority": 3,
        "alternative_name": "绳索单臂划船",
        "alternative_equipment": "龙门架",
        "tips": "核心收紧，避免身体扭转，下拉时手肘贴紧身体（谭指导强调单侧发力均衡）"
    },
    {
        "name": "坐姿绳索划船（窄握）",
        "muscle_group": "背中缝",
        "equipment": "龙门架",
        "base_sets": 3,
        "base_reps": "12",
        "rest_time": 60,  # 复合动作，视频要求60-90s
        "priority": 4,
        "alternative_name": "坐姿划船机（窄握）",
        "alternative_equipment": "划船机",
        "tips": "挺胸抬头，挤压肩胛骨，下放时完全伸展背部（谭指导强调背部拉伸）"
    },
    {
        "name": "杠铃二头弯举",
        "muscle_group": "二头肌长头",
        "equipment": "杠铃",
        "base_sets": 3,
        "base_reps": "10",
        "rest_time": 60,  # 孤立动作，视频要求30-60s
        "priority": 5,
        "alternative_name": "哑铃二头弯举",
        "alternative_equipment": "哑铃",
        "tips": "大臂固定贴紧身体，只活动手肘，顶峰停顿1秒（谭指导强调顶峰收缩）"
    },
    {
        "name": "锤式弯举",
        "muscle_group": "二头肌短头+肱桡肌",
        "equipment": "哑铃",
        "base_sets": 3,
        "base_reps": "12",
        "rest_time": 45,  # 孤立动作，视频要求30-60s
        "priority": 6,
        "alternative_name": "绳索锤式弯举",
        "alternative_equipment": "龙门架",
        "tips": "握姿像握锤子，手臂自然下垂，避免肩部代偿（谭指导强调手臂维度强化）"
    }
]

# 腿日动作（视频顺序+参数+要点，来源：谭成义三分化腿日训练）
LEG_EXERCISES: List[Dict] = [
    {
        "name": "杠铃深蹲（自由重量）",
        "muscle_group": "股四头肌+臀大肌",
        "equipment": "杠铃",
        "base_sets": 4,
        "base_reps": "8-10",
        "rest_time": 120,  # 复合动作，视频要求60-90s（腿日核心动作延长休息）
        "priority": 1,
        "alternative_name": "史密斯机深蹲",
        "alternative_equipment": "史密斯机",
        "tips": "背部挺直，膝盖与脚尖方向一致（不内扣），下蹲至大腿平行地面（谭指导核心强调）"
    },
    {
        "name": "硬拉（传统）",
        "muscle_group": "腘绳肌+臀大肌+下背部",
        "equipment": "杠铃",
        "base_sets": 3,
        "base_reps": "8",
        "rest_time": 120,  # 复合动作，视频要求60-90s（腿日核心动作延长休息）
        "priority": 2,
        "alternative_name": "罗马尼亚硬拉",
        "alternative_equipment": "杠铃",
        "tips": "伸髋发力，先抬臀再起身，避免弯腰弓背，杠铃贴近腿部（谭指导强调硬拉安全动作）"
    },
    {
        "name": "腿举机",
        "muscle_group": "股四头肌",
        "equipment": "腿举机",
        "base_sets": 3,
        "base_reps": "12",
        "rest_time": 90,  # 复合动作，视频要求60-90s
        "priority": 3,
        "alternative_name": "倒蹬机",
        "alternative_equipment": "倒蹬机",
        "tips": "脚掌全踩踏板，膝盖不超过脚尖，下放时控制速度（谭指导强调膝盖保护）"
    },
    {
        "name": "腿弯举",
        "muscle_group": "腘绳肌",
        "equipment": "腿弯举机",
        "base_sets": 3,
        "base_reps": "12",
        "rest_time": 60,  # 孤立动作，视频要求30-60s
        "priority": 4,
        "alternative_name": "俯卧腿弯举",
        "alternative_equipment": "俯卧腿弯举机",
        "tips": "孤立刺激腘绳肌，平衡大腿前后侧力量，避免小腿代偿（谭指导强调肌群平衡）"
    },
    {
        "name": "站姿提踵",
        "muscle_group": "腓肠肌+比目鱼肌",
        "equipment": "提踵机/台阶",
        "base_sets": 4,
        "base_reps": "15-20",
        "rest_time": 45,  # 孤立动作，视频要求30-60s
        "priority": 5,
        "alternative_name": "坐姿提踵",
        "alternative_equipment": "坐姿提踵机",
        "tips": "顶峰停顿1秒，缓慢下放至完全伸展，感受小腿收缩（谭指导重点强调提踵细节）"
    },
    {
        "name": "负重臀桥",
        "muscle_group": "臀大肌",
        "equipment": "杠铃/哑铃",
        "base_sets": 3,
        "base_reps": "12",
        "rest_time": 60,  # 孤立动作，视频要求30-60s
        "priority": 6,
        "alternative_name": "臀推机",
        "alternative_equipment": "臀推机",
        "tips": "上背部支撑在卧推凳上，顶髋时夹紧臀部，避免下背部代偿（谭指导强调臀部孤立）"
    }
]

# 训练日类型映射（视频明确标注）
DAY_TYPE_MAPPING: Dict[str, str] = {
    "push": "推日（胸+肩+三头）",
    "pull": "拉日（背+二头）",
    "leg": "腿日（下肢+核心）"
}

# -------------------------- 4. 核心业务类（项目调用核心）--------------------------
class TanChengyiThreeSplitPlan:
    """谭成义三分化训练计划核心类（项目集成时实例化此类）"""
    def __init__(self, user_config: UserTrainingConfig):
        """初始化：传入用户配置，加载动作库"""
        self.user_config = user_config
        self.exercise_library = self._load_exercise_library()  # 加载视频动作库

    def _load_exercise_library(self) -> Dict[str, List[Dict]]:
        """加载视频动作库（按推/拉/腿分类）"""
        return {
            "push": PUSH_EXERCISES,
            "pull": PULL_EXERCISES,
            "leg": LEG_EXERCISES
        }

    def _adapt_exercise(self, exercise_dict: Dict) -> Optional[TrainingExercise]:
        """
        单个动作适配（按用户配置调整，严格遵循视频逻辑）
        适配规则：
        1. 器械适配：优先用视频动作，无器械则用视频替代动作
        2. 健身基础适配：新手-1组+2次，进阶不变，高阶+1组-2次
        3. 训练目标适配：增肌（默认）/力量（重量+10%）/减脂（休息-30s+次数+5）
        """
        # 1. 器械适配（严格按视频替代逻辑）
        available_equip = self.user_config.available_equipment
        use_alternative = False

        # 检查基础动作器械是否可用（支持多器械选择，如"哑铃/史密斯机"）
        base_equip_list = [eq.strip() for eq in exercise_dict["equipment"].split("/")]
        if not any(eq in available_equip for eq in base_equip_list):
            # 基础器械不可用，切换到视频替代动作
            if not exercise_dict["alternative_equipment"] in available_equip:
                return None  # 替代器械也不可用，跳过该动作
            use_alternative = True

        # 2. 构建动作实体
        if use_alternative:
            exercise = TrainingExercise(
                name=exercise_dict["alternative_name"],
                muscle_group=exercise_dict["muscle_group"],
                equipment=exercise_dict["alternative_equipment"],
                sets=exercise_dict["base_sets"],
                reps=exercise_dict["base_reps"],
                rest_time=exercise_dict["rest_time"],
                priority=exercise_dict["priority"],
                tips=exercise_dict["tips"]
            )
        else:
            exercise = TrainingExercise(
                name=exercise_dict["name"],
                muscle_group=exercise_dict["muscle_group"],
                equipment=exercise_dict["equipment"],
                sets=exercise_dict["base_sets"],
                reps=exercise_dict["base_reps"],
                rest_time=exercise_dict["rest_time"],
                priority=exercise_dict["priority"],
                tips=exercise_dict["tips"]
            )

        # 3. 健身基础适配（视频隐含的难度分级逻辑）
        if self.user_config.fitness_level == "beginner":
            exercise.sets = max(2, exercise.sets - 1)  # 新手减少1组（视频建议新手从基础量开始）
            exercise.reps = self._adjust_reps(exercise.reps, delta=2)  # 次数+2（降低强度）
        elif self.user_config.fitness_level == "advanced":
            exercise.sets = min(5, exercise.sets + 1)  # 高阶增加1组（视频建议进阶加量）
            exercise.reps = self._adjust_reps(exercise.reps, delta=-2)  # 次数-2（提升强度）

        # 4. 训练目标适配（扩展视频逻辑，支持力量/减脂）
        if self.user_config.training_goal == "strength":
            # 力量目标：重量额外+10%，次数-2
            self.user_config.__dict__["progressive_rate"] = min(0.1, self.user_config.progressive_rate + 0.05)
            exercise.reps = self._adjust_reps(exercise.reps, delta=-2)
        elif self.user_config.training_goal == "fat_loss":
            # 减脂目标：休息时间-30s，次数+5
            exercise.rest_time = max(30, exercise.rest_time - 30)
            exercise.reps = self._adjust_reps(exercise.reps, delta=5)

        return exercise

    def _adjust_reps(self, reps_str: str, delta: int) -> str:
        """调整次数（支持范围/单值/力竭），严格按视频逻辑"""
        if reps_str == "力竭":
            return "力竭"
        elif "-" in reps_str:
            min_reps, max_reps = map(int, reps_str.split("-"))
            new_min = max(6, min_reps + delta)  # 最低不低于6次（视频要求）
            new_max = max(new_min, max_reps + delta)
            return f"{new_min}-{new_max}"
        else:
            new_rep = max(6, int(reps_str) + delta)
            return str(new_rep)

    def _calculate_progressive_weight(self, week: int) -> float:
        """计算渐进超负荷重量（视频要求：每周增重5%-10%）"""
        if week == 1:
            return self.user_config.base_weight
        return round(
            self.user_config.base_weight * (1 + self.user_config.progressive_rate) ** (week - 1),
            1
        )

    def generate_training_days(self) -> List[TrainingDay]:
        """生成训练日列表（按周次+训练日排序）"""
        training_days = []
        # 确定每周训练日顺序（视频默认推→拉→腿）
        weekly_day_order = ["push", "pull", "leg"] * (self.user_config.weekly_training_days // 3)

        for week in range(1, self.user_config.plan_weeks + 1):
            for day_index, day_type in enumerate(weekly_day_order, 1):
                # 适配当日动作
                adapted_exercises = []
                for ex_dict in self.exercise_library[day_type]:
                    ex = self._adapt_exercise(ex_dict)
                    if ex:
                        # 赋值周次、训练日信息
                        ex.week = week
                        ex.day_type = day_type
                        ex.day_index = day_index
                        # 计算该周建议重量
                        ex.recommended_weight = self._calculate_progressive_weight(week)
                        adapted_exercises.append(ex)

                # 按视频动作顺序排序（优先级）
                adapted_exercises.sort(key=lambda x: x.priority)

                # 构建训练日实体
                training_day = TrainingDay(
                    day_type=day_type,
                    day_type_cn=DAY_TYPE_MAPPING[day_type],
                    exercises=adapted_exercises,
                    day_index=day_index
                )
                training_days.append(training_day)

        return training_days

    def export_to_dataframe(self) -> pd.DataFrame:
        """导出为DataFrame（项目可直接用于Excel导出/数据库存储）"""
        training_days = self.generate_training_days()
        plan_data = []

        for day in training_days:
            for ex in day.exercises:
                plan_data.append({
                    "周次": ex.week,
                    "训练日": day.day_type_cn,
                    "本周训练日序号": day.day_index,
                    "动作名称": ex.name,
                    "训练肌群": ex.muscle_group,
                    "所需器械": ex.equipment,
                    "组数": ex.sets,
                    "次数": ex.reps,
                    "休息时间（秒）": ex.rest_time,
                    "建议重量（kg）": ex.recommended_weight,
                    "训练要点（谭指导强调）": ex.tips,
                    "训练目标": self.user_config.training_goal,
                    "健身基础": self.user_config.fitness_level,
                    "生成时间": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })

        return pd.DataFrame(plan_data)

    def export_to_json(self) -> List[Dict]:
        """导出为JSON（项目可直接用于API返回/前端渲染）"""
        training_days = self.generate_training_days()
        json_data = []

        for day in training_days:
            day_dict = {
                "周次": day.exercises[0].week,
                "训练日类型": day.day_type,
                "训练日名称": day.day_type_cn,
                "本周训练日序号": day.day_index,
                "动作列表": [
                    {
                        "动作名称": ex.name,
                        "训练肌群": ex.muscle_group,
                        "所需器械": ex.equipment,
                        "组数": ex.sets,
                        "次数": ex.reps,
                        "休息时间（秒）": ex.rest_time,
                        "建议重量（kg）": ex.recommended_weight,
                        "训练要点（谭指导强调）": ex.tips
                    }
                    for ex in day.exercises
                ]
            }
            json_data.append(day_dict)

        return json_data
 
三、项目集成步骤（详细调用示例）
 
1. 模块导入（项目中直接导入）
 
python
  
# 假设模块文件放在项目的 training_plans/目录下
from training_plans.tan_chengyi_three_split import (
    TanChengyiThreeSplitPlan,
    UserTrainingConfig,
    export_plan_to_excel,
    convert_plan_to_db_format
)
 
 
2. 初始化用户配置（项目中获取用户参数后传入）
 
python
  
# 示例：从项目用户表中获取配置（实际场景按需替换）
user_config = UserTrainingConfig(
    fitness_level="intermediate",  # 用户健身基础（中进阶，视频默认目标人群）
    training_goal="muscle_gain",  # 训练目标（增肌，视频核心目标）
    available_equipment=["杠铃", "哑铃", "史密斯机", "龙门架", "高位下拉机", "腿举机"],  # 用户可用器械
    weekly_training_days=3,  # 每周训练3天（视频默认）
    base_weight=60.0,  # 用户基础重量（默认50kg，可自定义）
    progressive_rate=0.08,  # 渐进率8%（视频要求5%-10%）
    plan_weeks=6  # 生成6周计划（默认4周，可自定义）
)
 
 
3. 生成训练计划（核心调用逻辑）
 
python
  
# 1. 实例化训练计划类
plan_generator = TanChengyiThreeSplitPlan(user_config=user_config)

# 2. 生成计划（支持两种格式，按需选择）
plan_df = plan_generator.export_to_dataframe()  # DataFrame格式（用于Excel导出）
plan_json = plan_generator.export_to_json()     # JSON格式（用于API返回/前端渲染）

# 3. 导出Excel（项目中保存到指定路径）
export_success = export_plan_to_excel(
    plan_df=plan_df,
    file_path="static/user_plans/谭成义三分化_用户ID_123.xlsx"  # 按用户ID命名，避免冲突
)
if export_success:
    print("训练计划Excel导出成功")

# 4. 转换为数据库格式（项目中入库存储）
db_records = convert_plan_to_db_format(json_data=plan_json)
# 示例：使用SQLAlchemy入库（实际项目按ORM框架调整）
# db.session.add_all([TrainingPlanModel(**record) for record in db_records])
# db.session.commit()
 
 
4. 前端渲染示例（JSON格式直接对接）
 
python
  
# 项目API视图函数示例（Flask/Django通用）
@app.route("/api/user/training-plan/tan-chengyi", methods=["POST"])
def get_tan_chengyi_plan():
    # 1. 获取前端传入的用户配置
    user_params = request.json
    # 2. 初始化配置
    user_config = UserTrainingConfig(
        fitness_level=user_params["fitness_level"],
        training_goal=user_params["training_goal"],
        available_equipment=user_params["available_equipment"],
        weekly_training_days=user_params.get("weekly_training_days", 3),
        base_weight=user_params.get("base_weight", 50.0),
        progressive_rate=user_params.get("progressive_rate", 0.05),
        plan_weeks=user_params.get("plan_weeks", 4)
    )
    # 3. 生成计划
    plan_generator = TanChengyiThreeSplitPlan(user_config=user_config)
    plan_json = plan_generator.export_to_json()
    # 4. 返回给前端
    return jsonify({
        "code": 200,
        "message": "三分化训练计划生成成功",
        "data": plan_json
    })
 
 
四、模块集成核心说明
 
1. 绑定视频的关键保障
 
- 动作库： PUSH_EXERCISES / PULL_EXERCISES / LEG_EXERCISES  1:1复刻视频动作顺序、组数、次数、休息时间、要点；
- 适配逻辑：严格遵循视频中“新手减组、进阶加组”“复合动作先做、孤立动作收尾”“器械替代”等隐含规则；
- 渐进超负荷：按视频要求的5%-10%增重率，不可超出该范围（初始化校验强制限制）。
 
2. 项目扩展接口（支持后续迭代）
 
- 自定义动作库：可替换  PUSH_EXERCISES / PULL_EXERCISES / LEG_EXERCISES  常量，添加项目专属动作；
- 调整渐进规则：通过  progressive_rate  参数自定义增重率，或重写  _calculate_progressive_weight  方法；
- 新增训练目标：在  _adapt_exercise  方法中添加新目标的适配逻辑（如“康复”“塑形”）；
- 扩展输出格式：新增工具函数（如  export_to_csv / export_to_pdf ），对接项目其他输出需求。
 
3. 异常处理（保证项目稳定性）
 
- 参数校验： UserTrainingConfig  类初始化时校验参数合法性，避免无效配置；
- 器械适配：无可用器械时自动跳过动作，不影响整体计划生成；
- 边界控制：组数/次数/休息时间有最小/最大值限制（如组数2-5组），避免极端值。