# 🏋 智能健身管理平台 (Intelligent Fitness Management Platform)

一个基于 React + Node.js 全栈开发的智能健身管理平台，提供个性化的训练计划生成、饮食方案定制、身体数据追踪及 AI 健身助手等功能。

## ✨ 功能特性

### 🔐 用户认证模块
- 用户登录/注册（账号密码）
- 个人资料管理 & 头像上传
- 修改密码

### 📊 主仪表盘模块
- **首页概览**：体重/体脂/围度趋势、训练日历、目标进度
- **日程管理**：创建/查看/删除训练日程
- **目标管理**：体重目标/训练目标/热量目标/目标类型分布

### 🏋 训练管理模块
- **训练动作库**：搜索/筛选/详情查看/分页浏览，包含动画演示
- **训练日记**：查看/创建/详情记录训练感受与心得
- **三分化训练计划**：个性化配置/智能生成/按周切换，支持渐进式超负荷

### 🥗 饮食管理模块
- **减脂饮食计划**：BMR/TDEE 计算、智能食谱生成、食物替换推荐

### 🛠 辅助功能模块
- **视频库**：健身视频浏览/播放/搜索
- **AI 健身助手**：智能对话/历史记录/快捷问题

### 🛡 管理后台模块
- 用户管理
- 视频库管理

## 🛠 技术栈

### 前端
| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.2 | UI 框架 |
| TypeScript | 5.2 | 类型安全 |
| Ant Design | 5.11 | UI 组件库 |
| Redux Toolkit | 1.9.7 | 状态管理 |
| ECharts | 5.4.3 | 数据可视化 |
| Video.js | 8.3 | 视频播放 |
| React Router | 6.20 | 路由管理 |
| Vite | 5.0 | 构建工具 |
| Tailwind CSS | 3.3 | 原子化 CSS |

### 后端
| 技术 | 版本 | 说明 |
|------|------|------|
| Node.js | - | 运行时环境 |
| Express | 4.18 | Web 框架 |
| TypeScript | 5.3 | 类型安全 |
| Sequelize | 6.35 | ORM 框架 |
| PostgreSQL | - | 关系型数据库 |
| JWT | 9.0 | 身份认证 |
| Bcrypt | 5.1 | 密码加密 |
| Multer | 2.1 | 文件上传 |
| FFmpeg | - | 视频处理 |
| Helmet | 7.1 | 安全中间件 |
| Morgan | 1.10 | 日志中间件 |

## 📦 项目结构

```
fitness-platform/
├── frontend/                 # 前端项目 (React + Vite)
│   ├── src/
│   │   ├── pages/           # 页面组件
│   │   ├── store/           # Redux 状态管理
│   │   ├── App.tsx          # 应用根组件
│   │   └── main.tsx         # 应用入口
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                  # 后端项目 (Express + Sequelize)
│   ├── src/
│   │   ├── config/          # 配置文件
│   │   ├── middleware/      # 中间件 (Auth等)
│   │   ├── models/          # 数据库模型 (19张业务表)
│   │   ├── routes/          # API 路由
│   │   ├── scripts/         # 数据脚本
│   │   ├── services/        # 业务逻辑
│   │   └── index.ts         # 主入口
│   ├── public/              # 静态资源 (GIF/图片)
│   ├── database.sql         # 数据库初始化脚本
│   ├── package.json
│   └── tsconfig.json
│
└── docs/                    # 项目文档
```

## 🚀 快速开始

### 前置要求

- Node.js >= 16
- PostgreSQL >= 12
- npm 或 yarn

### 1. 克隆项目

```bash
git clone https://github.com/your-username/intelligent-fitness-platform.git
cd intelligent-fitness-platform
```

### 2. 后端配置

```bash
cd backend

# 安装依赖
npm install

# 复制环境变量配置
cp .env.example .env

# 编辑 .env 文件，配置数据库连接
# DATABASE_URL=postgres://username:password@localhost:5432/fitness_app
# JWT_SECRET=your_secret_key
# JWT_EXPIRES_IN=86400

# 初始化数据库
psql -U your_username -d fitness_app -f database.sql

# 启动开发服务器 (端口 3002)
npm run dev
```

### 3. 前端配置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器 (端口 8888)
npm run dev
```

### 4. 访问应用

- 前端: http://localhost:8888
- 后端 API: http://localhost:3002

## 📡 API 接口

### 认证接口
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| GET | `/api/auth/profile` | 获取用户资料 |
| PUT | `/api/auth/profile` | 更新用户资料 |

### 训练管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/exercises` | 获取动作库列表 |
| POST | `/api/logs` | 创建训练记录 |
| GET | `/api/diaries` | 获取训练日记 |
| POST | `/api/three-split-plans` | 生成三分化计划 |

### 饮食管理
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/fatloss/generate` | 生成减脂饮食计划 |
| GET | `/api/food-nutrition` | 获取食物营养数据 |

### 身体数据 & 目标
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/body-measurements` | 记录身体数据 |
| GET | `/api/body-measurements/stats/summary` | 获取身体数据统计 |
| POST | `/api/goals` | 创建目标 |
| GET | `/api/goals` | 获取目标列表 |

### AI 助手
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/chat/messages` | 发送聊天消息 |
| GET | `/api/chat/messages` | 获取聊天记录 |

## 💾 数据库设计

系统使用 PostgreSQL 数据库，主键类型为 UUID，支持 JSONB/ARRAY 高级数据类型。

### 核心数据表
| 表名 | 说明 |
|------|------|
| `Users` | 用户信息 |
| `Exercises` | 训练动作库 |
| `ExerciseCategories` | 动作分类 |
| `TrainingLogs` | 训练记录 |
| `TrainingLogItems` | 训练记录明细 |
| `TrainingDiaries` | 训练日记 |
| `BodyMeasurements` | 身体测量数据 |
| `Goals` | 健身目标 |
| `FatLossPlans` | 减脂饮食计划 |
| `FoodNutrition` | 食物营养数据 |
| `WorkoutPlans` | 训练计划 |
| `Schedules` | 训练日程 |
| `ChatMessages` | AI 对话记录 |
| `Videos` | 视频资源 |
| `VideoLibrary` | 视频库 |

数据库连接池最大连接数: 5

## 🏗 系统架构

```
前端应用层 (React SPA, 端口 8888)
        ↓ HTTP/JSON
通信层 (Vite Proxy /api/* → localhost:3002)
        ↓
后端 API 服务层 (Express, 端口 3002)
  ├── 中间件: CORS → Helmet → Morgan → JSON → JWT
  └── ORM: Sequelize 6
        ↓
PostgreSQL 数据库层 (19张业务表, UUID主键)
```

## 📝 构建与部署

### 开发环境
```bash
# 前端
cd frontend && npm run dev

# 后端
cd backend && npm run dev
```

### 生产环境
```bash
# 前端构建
cd frontend && npm run build

# 后端编译
cd backend && npm run build && npm start
```

## 📄 License

MIT License

## 🙏 致谢

- 训练动作 GIF 来源于公开数据集
- 食物营养数据基于中国食物成分表

---

**项目状态**: 开发完成，核心功能已实现，可投入使用。
