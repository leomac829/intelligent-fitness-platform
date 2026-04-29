-- 专业健身Web应用数据库初始化脚本

-- 创建数据库
CREATE DATABASE fitness_app;

-- 连接到数据库
\c fitness_app;

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    age INT CHECK (age > 0),
    height DECIMAL(5,2) CHECK (height > 0),
    weight DECIMAL(5,2) CHECK (weight > 0),
    fitness_level VARCHAR(20) CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 动作表
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    equipment VARCHAR(100),
    primary_muscles JSONB,
    secondary_muscles JSONB,
    image_url VARCHAR(255),
    video_url VARCHAR(255),
    tips TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 动作分类表
CREATE TABLE exercise_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 动作分类关系表
CREATE TABLE exercise_category_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES exercise_categories(id) ON DELETE CASCADE,
    UNIQUE (exercise_id, category_id)
);

-- 训练计划表
CREATE TABLE workout_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    goal VARCHAR(20) CHECK (goal IN ('muscle_gain', 'fat_loss', 'shaping', 'rehabilitation')),
    level VARCHAR(20) CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    duration INT CHECK (duration > 0),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 训练计划项表
CREATE TABLE workout_plan_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    day INT CHECK (day > 0),
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    sets INT CHECK (sets > 0),
    reps INT CHECK (reps > 0),
    weight DECIMAL(5,2) CHECK (weight > 0),
    rest_time INT CHECK (rest_time >= 0)
);

-- 训练日志表
CREATE TABLE training_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    notes TEXT,
    duration INT CHECK (duration > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 训练日志项表
CREATE TABLE training_log_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_id UUID NOT NULL REFERENCES training_logs(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    set_number INT CHECK (set_number > 0),
    reps INT CHECK (reps > 0),
    weight DECIMAL(5,2) CHECK (weight > 0),
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户收藏表
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, exercise_id)
);

-- 用户笔记表
CREATE TABLE user_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 动作评论表
CREATE TABLE exercise_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 身体数据表
CREATE TABLE body_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    body_fat DECIMAL(5,2),
    muscle_mass DECIMAL(5,2),
    chest DECIMAL(5,2),
    waist DECIMAL(5,2),
    hips DECIMAL(5,2),
    biceps DECIMAL(5,2),
    thighs DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_exercises_name ON exercises(name);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX idx_exercises_equipment ON exercises(equipment);
CREATE INDEX idx_workout_plans_goal ON workout_plans(goal);
CREATE INDEX idx_workout_plans_level ON workout_plans(level);
CREATE INDEX idx_workout_plans_created_by ON workout_plans(created_by);
CREATE INDEX idx_training_logs_user_id ON training_logs(user_id);
CREATE INDEX idx_training_logs_date ON training_logs(date);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_exercise_id ON user_favorites(exercise_id);
CREATE INDEX idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX idx_user_notes_exercise_id ON user_notes(exercise_id);
CREATE INDEX idx_exercise_comments_exercise_id ON exercise_comments(exercise_id);
CREATE INDEX idx_exercise_comments_user_id ON exercise_comments(user_id);
CREATE INDEX idx_body_measurements_user_id ON body_measurements(user_id);
CREATE INDEX idx_body_measurements_date ON body_measurements(date);

-- 插入示例数据

-- 插入动作分类
INSERT INTO exercise_categories (name, description) VALUES
('胸部', '胸部训练动作'),
('背部', '背部训练动作'),
('腿部', '腿部训练动作'),
('肩部', '肩部训练动作'),
('手臂', '手臂训练动作'),
('核心', '核心训练动作'),
('有氧', '有氧运动动作');

-- 插入示例动作
INSERT INTO exercises (name, description, difficulty, equipment, primary_muscles, secondary_muscles, image_url, video_url, tips) VALUES
('卧推', '卧推是一种基础的胸部训练动作，主要锻炼胸大肌。', 'intermediate', '杠铃', '{"胸大肌", "三角肌前束", "肱三头肌"}', '{"前锯肌", "胸小肌"}', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=barbell%20bench%20press%20exercise%20demonstration&image_size=landscape_16_9', 'https://example.com/videos/bench-press.mp4', '保持核心收紧，控制杠铃下降速度，推起时不要锁定肘关节。'),
('深蹲', '深蹲是一种全身性的训练动作，主要锻炼股四头肌、臀大肌和核心肌群。', 'intermediate', '杠铃', '{"股四头肌", "臀大肌", "腘绳肌"}', '{"核心肌群", "小腿肌群"}', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=barbell%20squat%20exercise%20demonstration&image_size=landscape_16_9', 'https://example.com/videos/squat.mp4', '保持背部挺直，膝盖不要内扣，蹲至大腿与地面平行。'),
('硬拉', '硬拉是一种复合训练动作，主要锻炼背部、臀部和腿部肌群。', 'advanced', '杠铃', '{"腘绳肌", "臀大肌", "下背部"}', '{"核心肌群", "上背部"}', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=deadlift%20exercise%20demonstration&image_size=landscape_16_9', 'https://example.com/videos/deadlift.mp4', '保持背部挺直，用腿部力量提起杠铃，不要弯腰。'),
('引体向上', '引体向上是一种有效的背部训练动作，主要锻炼背阔肌。', 'intermediate', '单杠', '{"背阔肌", "大圆肌", "肱二头肌"}', '{"菱形肌", "三角肌后束"}', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pull%20up%20exercise%20demonstration&image_size=landscape_16_9', 'https://example.com/videos/pull-up.mp4', '保持身体稳定，用背部力量拉动身体，不要摇晃。'),
('肩部推举', '肩部推举是一种肩部训练动作，主要锻炼三角肌前束和中束。', 'intermediate', '杠铃', '{"三角肌前束", "三角肌中束", "肱三头肌"}', '{"斜方肌", "核心肌群"}', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shoulder%20press%20exercise%20demonstration&image_size=landscape_16_9', 'https://example.com/videos/shoulder-press.mp4', '保持核心收紧，控制杠铃下降速度，推起时不要锁定肘关节。');

-- 关联动作和分类
INSERT INTO exercise_category_relationships (exercise_id, category_id) VALUES
((SELECT id FROM exercises WHERE name = '卧推'), (SELECT id FROM exercise_categories WHERE name = '胸部')),
((SELECT id FROM exercises WHERE name = '深蹲'), (SELECT id FROM exercise_categories WHERE name = '腿部')),
((SELECT id FROM exercises WHERE name = '硬拉'), (SELECT id FROM exercise_categories WHERE name = '背部')),
((SELECT id FROM exercises WHERE name = '硬拉'), (SELECT id FROM exercise_categories WHERE name = '腿部')),
((SELECT id FROM exercises WHERE name = '引体向上'), (SELECT id FROM exercise_categories WHERE name = '背部')),
((SELECT id FROM exercises WHERE name = '肩部推举'), (SELECT id FROM exercise_categories WHERE name = '肩部'));

-- 插入示例训练计划
INSERT INTO workout_plans (name, description, goal, level, duration, created_by, is_public) VALUES
('初学者增肌计划', '适合健身新手的基础增肌训练计划，每周3次训练。', 'muscle_gain', 'beginner', 8, NULL, TRUE),
('中级减脂计划', '适合有一定基础的健身者，通过高强度训练和有氧结合达到减脂效果。', 'fat_loss', 'intermediate', 12, NULL, TRUE),
('高级塑形计划', '适合有丰富训练经验的健身者，针对身体各部位进行精细化训练。', 'shaping', 'advanced', 16, NULL, TRUE);

-- 为初学者增肌计划添加训练项
INSERT INTO workout_plan_items (plan_id, day, exercise_id, sets, reps, weight, rest_time) VALUES
((SELECT id FROM workout_plans WHERE name = '初学者增肌计划'), 1, (SELECT id FROM exercises WHERE name = '卧推'), 3, 12, 20.0, 90),
((SELECT id FROM workout_plans WHERE name = '初学者增肌计划'), 1, (SELECT id FROM exercises WHERE name = '深蹲'), 3, 12, 30.0, 90),
((SELECT id FROM workout_plans WHERE name = '初学者增肌计划'), 2, (SELECT id FROM exercises WHERE name = '引体向上'), 3, 8, 0.0, 90),
((SELECT id FROM workout_plans WHERE name = '初学者增肌计划'), 2, (SELECT id FROM exercises WHERE name = '肩部推举'), 3, 12, 15.0, 90),
((SELECT id FROM workout_plans WHERE name = '初学者增肌计划'), 3, (SELECT id FROM exercises WHERE name = '硬拉'), 3, 8, 40.0, 120);
