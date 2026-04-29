# 专业健身Web应用技术架构文档

## 1. 项目概述

本项目是一款专业健身类Web应用，包含器械动作教学库、健身计划模板参考、训练记录与统计、智能推荐系统等核心功能模块，旨在为用户提供专业、个性化的健身指导和管理服务。

## 2. 技术栈选择

### 2.1 前端技术
- **框架**: React 18 + TypeScript
- **状态管理**: Redux Toolkit
- **UI组件库**: Ant Design
- **路由**: React Router v6
- **HTTP客户端**: Axios
- **图表库**: ECharts
- **视频播放器**: Video.js
- **样式方案**: Tailwind CSS
- **构建工具**: Vite

### 2.2 后端技术
- **语言**: Node.js + TypeScript
- **框架**: Express
- **数据库**: PostgreSQL
- **ORM**: Sequelize
- **认证**: JWT
- **文件存储**: AWS S3
- **缓存**: Redis

### 2.3 其他工具
- **版本控制**: Git
- **CI/CD**: GitHub Actions
- **API文档**: Swagger

## 3. 系统架构

### 3.1 整体架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    前端应用      │────>│    API网关      │────>│    后端服务      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         ↑                        ↑                        ↑
         │                        │                        │
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    静态资源      │     │    认证服务      │     │    数据库        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 3.2 模块划分

1. **前端模块**
   - 用户认证模块
   - 动作教学库模块
   - 训练计划模块
   - 训练记录模块
   - 数据统计模块
   - 智能推荐模块

2. **后端模块**
   - 用户管理模块
   - 动作库管理模块
   - 训练计划管理模块
   - 训练记录管理模块
   - 数据分析模块
   - 推荐系统模块

## 4. 数据库设计

### 4.1 核心数据表

1. **users** - 用户表
   - id: UUID (主键)
   - username: VARCHAR(50) (唯一)
   - email: VARCHAR(100) (唯一)
   - password: VARCHAR(255) (加密)
   - name: VARCHAR(100)
   - gender: ENUM('male', 'female', 'other')
   - age: INT
   - height: DECIMAL(5,2) (单位: cm)
   - weight: DECIMAL(5,2) (单位: kg)
   - fitness_level: ENUM('beginner', 'intermediate', 'advanced')
   - created_at: TIMESTAMP
   - updated_at: TIMESTAMP

2. **exercises** - 动作表
   - id: UUID (主键)
   - name: VARCHAR(100)
   - description: TEXT
   - difficulty: ENUM('beginner', 'intermediate', 'advanced')
   - equipment: VARCHAR(100)
   - primary_muscles: JSONB (主要肌肉群)
   - secondary_muscles: JSONB (次要肌肉群)
   - image_url: VARCHAR(255) (动作示范图)
   - video_url: VARCHAR(255) (教学视频)
   - tips: TEXT (动作技巧)
   - created_at: TIMESTAMP
   - updated_at: TIMESTAMP

3. **exercise_categories** - 动作分类表
   - id: UUID (主键)
   - name: VARCHAR(50)
   - description: TEXT
   - created_at: TIMESTAMP

4. **exercise_category_relationships** - 动作分类关系表
   - id: UUID (主键)
   - exercise_id: UUID (外键)
   - category_id: UUID (外键)

5. **workout_plans** - 训练计划表
   - id: UUID (主键)
   - name: VARCHAR(100)
   - description: TEXT
   - goal: ENUM('muscle_gain', 'fat_loss', 'shaping', 'rehabilitation')
   - level: ENUM('beginner', 'intermediate', 'advanced')
   - duration: INT (持续时间，单位: 周)
   - created_by: UUID (外键，用户ID)
   - is_public: BOOLEAN (是否公开)
   - created_at: TIMESTAMP
   - updated_at: TIMESTAMP

6. **workout_plan_items** - 训练计划项表
   - id: UUID (主键)
   - plan_id: UUID (外键)
   - day: INT (训练日)
   - exercise_id: UUID (外键)
   - sets: INT (组数)
   - reps: INT (次数)
   - weight: DECIMAL(5,2) (重量，单位: kg)
   - rest_time: INT (休息时间，单位: 秒)

7. **training_logs** - 训练日志表
   - id: UUID (主键)
   - user_id: UUID (外键)
   - date: DATE (训练日期)
   - notes: TEXT (训练笔记)
   - duration: INT (训练时长，单位: 分钟)
   - created_at: TIMESTAMP

8. **training_log_items** - 训练日志项表
   - id: UUID (主键)
   - log_id: UUID (外键)
   - exercise_id: UUID (外键)
   - set_number: INT (组号)
   - reps: INT (次数)
   - weight: DECIMAL(5,2) (重量，单位: kg)
   - completed_at: TIMESTAMP

9. **user_favorites** - 用户收藏表
   - id: UUID (主键)
   - user_id: UUID (外键)
   - exercise_id: UUID (外键)
   - created_at: TIMESTAMP

10. **user_notes** - 用户笔记表
    - id: UUID (主键)
    - user_id: UUID (外键)
    - exercise_id: UUID (外键)
    - content: TEXT
    - created_at: TIMESTAMP
    - updated_at: TIMESTAMP

11. **exercise_comments** - 动作评论表
    - id: UUID (主键)
    - user_id: UUID (外键)
    - exercise_id: UUID (外键)
    - content: TEXT
    - rating: INT (评分，1-5)
    - created_at: TIMESTAMP
    - updated_at: TIMESTAMP

## 5. API接口设计

### 5.1 用户相关接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户资料
- `PUT /api/auth/profile` - 更新用户资料
- `PUT /api/auth/password` - 修改密码

### 5.2 动作库相关接口
- `GET /api/exercises` - 获取动作列表（支持筛选）
- `GET /api/exercises/:id` - 获取动作详情
- `POST /api/exercises` - 创建动作（管理员）
- `PUT /api/exercises/:id` - 更新动作（管理员）
- `DELETE /api/exercises/:id` - 删除动作（管理员）
- `GET /api/exercises/categories` - 获取动作分类

### 5.3 训练计划相关接口
- `GET /api/plans` - 获取计划列表（支持筛选）
- `GET /api/plans/:id` - 获取计划详情
- `POST /api/plans` - 创建计划
- `PUT /api/plans/:id` - 更新计划
- `DELETE /api/plans/:id` - 删除计划
- `GET /api/plans/user` - 获取用户创建的计划

### 5.4 训练记录相关接口
- `GET /api/logs` - 获取训练记录列表
- `GET /api/logs/:id` - 获取训练记录详情
- `POST /api/logs` - 创建训练记录
- `PUT /api/logs/:id` - 更新训练记录
- `DELETE /api/logs/:id` - 删除训练记录
- `GET /api/logs/stats` - 获取训练统计数据

### 5.5 用户交互相关接口
- `POST /api/favorites` - 收藏动作
- `DELETE /api/favorites/:id` - 取消收藏
- `GET /api/favorites` - 获取收藏列表
- `POST /api/notes` - 添加笔记
- `PUT /api/notes/:id` - 更新笔记
- `DELETE /api/notes/:id` - 删除笔记
- `POST /api/comments` - 添加评论
- `PUT /api/comments/:id` - 更新评论
- `DELETE /api/comments/:id` - 删除评论

## 6. 前端页面设计

### 6.1 主要页面
1. **首页** - 展示推荐动作、热门计划和用户训练概览
2. **动作库页面** - 动作列表、筛选和详情展示
3. **训练计划页面** - 计划模板浏览、自定义和管理
4. **训练记录页面** - 日志记录、数据统计和分析
5. **个人中心页面** - 用户资料管理、收藏和笔记管理

### 6.2 响应式设计
- 桌面端: 多列布局，充分利用屏幕空间
- 平板端: 适当调整布局，保持核心功能可见
- 移动端: 单列布局，优化触控操作，关键功能优先

## 7. 性能优化策略

1. **前端优化**
   - 组件懒加载
   - 图片懒加载
   - 视频预加载策略
   - 缓存静态资源
   - 代码分割

2. **后端优化**
   - 数据库索引优化
   - 缓存热点数据
   - 批量处理请求
   - 异步处理非关键任务

3. **视频处理**
   - 多分辨率视频支持
   - 视频压缩
   - CDN加速

## 8. 安全措施

1. **认证与授权**
   - JWT token认证
   - 密码加密存储
   - 权限控制

2. **数据安全**
   - 输入验证
   - 防止SQL注入
   - 防止XSS攻击
   - 数据备份策略

3. **API安全**
   - 请求限流
   - CORS配置
   - API密钥管理

## 9. 扩展性考虑

1. **微服务架构** - 未来可将核心功能拆分为独立服务
2. **插件系统** - 支持第三方插件集成
3. **多语言支持** - 国际化设计
4. **API版本控制** - 确保向后兼容

## 10. 开发计划

1. **阶段一**: 基础架构搭建
   - 前端项目初始化
   - 后端服务搭建
   - 数据库设计与迁移

2. **阶段二**: 核心功能开发
   - 用户认证系统
   - 动作库管理
   - 训练计划管理
   - 训练记录系统

3. **阶段三**: 高级功能实现
   - 数据统计与可视化
   - 智能推荐系统
   - 视频教学功能

4. **阶段四**: 测试与优化
   - 功能测试
   - 性能优化
   - 安全测试

5. **阶段五**: 部署与上线
   - 生产环境部署
   - CI/CD配置
   - 监控系统搭建
