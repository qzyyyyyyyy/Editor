# Trouble — 可视化页面编辑器

一个全栈的可视化页面搭建工具，前端支持拖拽编辑、组件多选、历史撤销/重做、导出图片等能力，后端提供 Express + SQLite 的数据持久化与 JWT 鉴权。采用 pnpm workspace monorepo 架构，前后端共享类型定义。

## 技术栈

### 前端

| 类别        | 技    术                                                           |
| ----------- | -------------------------------------------------------------- |
| 框架        | React 19 + TypeScript 6                                        |
| 构建        | Vite 8                                                         |
| 状态管理    | Zustand 5 + Immer（启用 `enableMapSet` 支持 Set/Map 草稿操作） |
| 路由        | React Router 7                                                 |
| UI 组件库   | Ant Design 6 + @ant-design/icons                               |
| 样式方案    | CSS Modules + Less                                             |
| HTTP 客户端 | axios（拦截器统一处理 JWT 注入与错误解包）                     |
| 代码规范    | ESLint + Prettier                                              |
| 工具库      | lodash-es、classnames                                          |
| 截图导出    | html-to-image                                                  |
| 颜色选择    | react-color                                                    |
| 文本自适应  | react-textarea-autosize                                        |

### 后端

| 类别     | 技术                                              |
| -------- | ------------------------------------------------- |
| 运行时   | Node.js 24（内置 `node:sqlite` 模块，零原生编译） |
| 框架     | Express 4                                         |
| 数据库   | SQLite（WAL 模式 + 外键约束）                     |
| 鉴权     | JWT（jsonwebtoken）+ bcryptjs 密码哈希            |
| 跨域     | cors                                              |
| 开发工具 | tsx（watch 模式热重载）                           |

### 工程

| 类别     | 技术                                                         |
| -------- | ------------------------------------------------------------ |
| 包管理   | pnpm 10 workspace（单一 lock 文件）                          |
| Monorepo | `apps/` + `packages/` 结构                                   |
| 类型共享 | `@trouble/shared` 包（前后端 CanvasItem / API 契约单一来源） |
| 并行开发 | concurrently（一条命令同时起前后端）                         |

## 快速开始

```bash
# 安装依赖
pnpm install

# 数据库迁移（建表 + 种子用户 admin/123456）
pnpm migrate

# 同时启动前后端开发服务
pnpm dev

# 单独启动前端 / 后端
pnpm dev:client
pnpm dev:server

# 类型检查（使用 tsc -b，项目引用模式）
pnpm typecheck

# 构建
pnpm build

# 代码格式化 / ESLint
npx prettier --write "apps/editor/src/**/*.{ts,tsx,less,css}"
pnpm lint
```

启动后：

- 前端：http://localhost:5173/trouble-editor/
- 后端：http://localhost:3000/api/health
- 种子账号：admin / 123456

### 环境变量

前端（`apps/editor/.env`）：

```env
# true → 走远端 HTTP API；false → 走 localStorage（离线模式）
VITE_USE_API=true
```

后端（`apps/server/.env`，参考 `.env.example`）：

```env
PORT=3000
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=604800
DB_PATH=./data/trouble.db
```

## 项目结构

```
trouble/
├── package.json                 # workspace 根（dev / build / typecheck / migrate 脚本）
├── pnpm-workspace.yaml          # 声明 apps/* 和 packages/*
├── tsconfig.base.json           # 公共编译选项
├── eslint.config.js
│
├── packages/
│   └── shared/                  # 前后端共享类型包（@trouble/shared）
│       └── src/
│           ├── canvas.ts        #   CanvasItem / User 数据模型
│           └── api.ts           #   ApiResponse / LoginRequest / LoginResponse 等 API 契约
│
├── apps/
│   ├── editor/                  # 前端应用（@trouble/editor）
│   │   ├── package.json
│   │   ├── vite.config.ts       #   开发代理 /api → localhost:3000
│   │   ├── tsconfig.json        #   项目引用（app / node 双配置）
│   │   ├── .env                 #   VITE_USE_API 环境变量
│   │   └── src/
│   │       ├── main.tsx         #   应用入口
│   │       ├── App.tsx          #   路由定义 + 全局鉴权
│   │       │
│   │       ├── components/      #   全局通用组件
│   │       │   ├── Login.tsx    #     登录/注册页
│   │       │   └── RequireAuth.tsx  # 路由守卫
│   │       │
│   │       ├── services/        #   Service 层（适配器模式）
│   │       │   ├── interfaces.ts      #   ICanvasService / IAuthService 契约接口
│   │       │   ├── http.ts           #   axios 封装（JWT 注入 + 响应解包）
│   │       │   ├── canvasService.ts     #   本地实现（localStorage，离线降级）
│   │       │   ├── remoteCanvasService.ts#   远端实现（HTTP API）
│   │       │   ├── authService.ts       #   本地认证（cookie 会话）
│   │       │   ├── remoteAuthService.ts #   远端认证（JWT + localStorage）
│   │       │   ├── storage.ts          #   存储原语（localStorage + cookie）
│   │       │   ├── types.ts            #   类型兼容桥（re-export @trouble/shared）
│   │       │   └── index.ts            #   出口：环境变量切换实现
│   │       │
│   │       ├── store/           #   状态管理层
│   │       │   ├── editStoreTypes.ts
│   │       │   ├── editStore.ts        #   Barrel file — 聚合导出所有 slice
│   │       │   ├── editStore/          #   编辑器核心 store（按职责拆分）
│   │       │   │   ├── index.ts        #     store 实例
│   │       │   │   ├── getDefaultCanvas.ts
│   │       │   │   ├── selectors.ts
│   │       │   │   └── slices/         #     canvasSlice / cmpSlice / layerSlice / selectionSlice / styleSlice
│   │       │   ├── historySlice.ts     #   历史栈（撤销/重做，最多 100 步）
│   │       │   ├── zoomStore.ts        #   缩放状态
│   │       │   └── hooks.ts           #   自定义 Hook
│   │       │
│   │       ├── pages/
│   │       │   ├── ListPage/           # 画布列表页
│   │       │   ├── PreviewPage/        # 画布预览页（只读）
│   │       │   └── EditPage/           # 编辑器主页面
│   │       │       ├── Header/         #   顶部导航栏
│   │       │       ├── LeftSider/      #   左侧组件面板
│   │       │       ├── Center/         #   中央画布区域
│   │       │       └── RightSider/     #   右侧属性面板
│   │       │
│   │       ├── lib/            #   通用 UI 封装
│   │       └── utils/          #   纯工具函数
│   │
│   └── server/                 # 后端应用（@trouble/server）
│       ├── package.json
│       ├── tsconfig.json
│       ├── .env / .env.example
│       ├── data/               #   SQLite 数据库文件（gitignore）
│       └── src/
│           ├── index.ts        #   入口：启动 HTTP 服务
│           ├── app.ts          #   Express 实例 + 中间件装配
│           ├── config/env.ts   #   环境变量集中读取
│           ├── db/
│           │   ├── index.ts    #   node:sqlite 连接（WAL + 外键）
│           │   ├── schema.sql  #   users / canvases 表结构
│           │   └── migrate.ts  #   幂等建表 + 种子用户
│           ├── services/
│           │   ├── authService.ts   # bcrypt 校验 + JWT 签发
│           │   └── canvasService.ts  # 画布 CRUD（按 user_id 隔离）
│           ├── routes/
│           │   ├── index.ts          # 挂载 /auth（公开）+ /canvases（需 JWT）
│           │   ├── auth.routes.ts    # POST /login / POST /register
│           │   └── canvases.routes.ts# GET 列表 / GET 详情 / POST / PUT / DELETE
│           └── middlewares/
│               ├── auth.ts           # JWT 校验，挂载 userId 到 req
│               └── errorHandler.ts   # 统一错误响应
```

## 核心功能

### 画布编辑

- **组件系统**：文本、图片、图形三种基础组件，支持位置、尺寸、字体、颜色、背景等样式编辑
- **拖拽编辑**：单击选中、Ctrl/Cmd+点击多选、拖拽移动、八方向拉伸调整尺寸
- **双击编辑文本**：文本组件双击进入编辑态，自动高度自适应
- **画布缩放**：支持 50%–200% 缩放，拖拽和位置计算自动按缩放比换算

### 快捷键

| 快捷键               | 功能                     |
| -------------------- | ------------------------ |
| Ctrl/Cmd + A         | 全选组件                 |
| Ctrl/Cmd + Z         | 撤销                     |
| Ctrl/Cmd + Shift + Z | 重做                     |
| Ctrl/Cmd + C         | 复制选中组件             |
| Ctrl/Cmd + V         | 粘贴（支持连续粘贴错位） |
| Backspace / Delete   | 删除选中组件             |
| Ctrl/Cmd + +/-       | 画布缩放                 |

### 右键菜单

- 复制组件 / 删除组件
- 上移一层 / 下移一层 / 置顶 / 置底（单选时可用）
- 菜单通过 Portal 渲染到 body，避免被画布 overflow 裁剪

### 历史记录

- 每次画布操作（增删改、复制粘贴、图层移动）自动记录
- 拖拽/缩放结束时通过引用比较去重，避免"假历史"
- 最多保留 100 步历史
- 撤销后继续操作会丢弃后续重做分支

### 导入与导出

- **导入本地图片**：FileReader 读取为 dataURL 存入组件，按真实尺寸等比缩放到画布
- **导出为图片**：html-to-image 截图画布，2x 清晰度，自动排除选中框等编辑 UI

### 后端 API

| 方法   | 路径                 | 鉴权 | 说明                              |
| ------ | -------------------- | ---- | --------------------------------- |
| POST   | `/api/auth/login`    | -    | 登录，返回 JWT                    |
| POST   | `/api/auth/register` | -    | 注册                              |
| GET    | `/api/canvases`      | JWT  | 画布列表（支持 keyword 模糊搜索） |
| GET    | `/api/canvases/:id`  | JWT  | 画布详情                          |
| POST   | `/api/canvases`      | JWT  | 新建画布                          |
| PUT    | `/api/canvases/:id`  | JWT  | 更新画布                          |
| DELETE | `/api/canvases/:id`  | JWT  | 删除画布                          |

统一响应格式：`{ success: boolean, data?: T, message?: string }`

## 架构设计

### Monorepo 分层

```
┌──────────────────────────────────────────────────────────┐
│  apps/editor (前端)          apps/server (后端)          │
│  React + Zustand            Express + SQLite             │
├──────────────────────────────────────────────────────────┤
│                 packages/shared                           │
│  CanvasItem / User / ApiResponse — 前后端共享单一来源     │
│  后端改字段，前端 tsc -b 编译期报错                       │
└──────────────────────────────────────────────────────────┘
```

### 前端 Service 层：适配器模式

通过环境变量 `VITE_USE_API` 在运行时切换两种实现，两种实现都遵守 `ICanvasService` / `IAuthService` 接口，签名不一致编译期直接报错：

```
┌───────────────────────────────────────────────┐
│  UI 层（pages / components）                   │
│  只渲染、只发请求、只 dispatch                  │
├───────────────────────────────────────────────┤
│  Store 层（store/editStore/）                   │
│  运行时编辑态，不碰存储                         │
├───────────────────────────────────────────────┤
│  Services 层（services/index.ts）               │
│  按 VITE_USE_API 切换实现                       │
│  ┌─────────────────┐  ┌──────────────────────┐│
│  │ canvasService   │  │ remoteCanvasService  ││
│  │ (localStorage)  │  │ (HTTP API + axios)   ││
│  │ 离线降级        │  │ JWT 自动注入         ││
│  └─────────────────┘  └──────────────────────┘│
│  两者 implements ICanvasService                  │
├───────────────────────────────────────────────┤
│  Storage / HTTP 层                              │
│  localStorage / cookie / fetch                 │
└───────────────────────────────────────────────┘
```

依赖方向只能从上往下。切换到后端模式时，store 和 UI 一行都不用改。

### Store 按职责拆分

editStore 拆分为 5 个 slice，每个 slice 只负责一类职责，统一接收 Immer draft 参数：

| Slice          | 职责            | 主要函数                                                                                          |
| -------------- | --------------- | ------------------------------------------------------------------------------------------------- |
| canvasSlice    | 画布管理        | loadCanvas / resetCanvas / clearCanvas / saveCanvas / updateCanvasStyle                           |
| cmpSlice       | 组件增删/剪贴板 | addCmp / delSelectedCmps / duplicateSelectedCmps / copySelectedCmps / pasteCmps                   |
| layerSlice     | 图层顺序        | moveSelectedCmpUp / moveSelectedCmpDown / bringSelectedCmpToFront / sendSelectedCmpToBack         |
| selectionSlice | 选中管理        | setAllCmpsSelected / setCmpsSelected / setCmpSelected                                             |
| styleSlice     | 样式更新        | updateAssemblyCmpsByDistance / updateSelectedCmpStyle / updateSelectedCmpAttr / editAssemblyStyle |

### 选中状态

使用 `Set<number>` 存储选中组件的下标集合，配合 Immer 的 `enableMapSet()` 支持 Set 的 `add/delete/clear` 草稿操作。

### 指针式历史栈

```
canvasChangeHistory: [ S0, S1, S2, S3 ]
                              ↑
                    canvasChangeHistoryIndex = 2
```

- **快照数组 + 索引指针**：撤销/重做只移动指针，不修改数组
- **截断重做分支**：产生新修改时 `slice` 截断指针后面的历史，避免分叉
- **防抖去重**：拖拽/缩放结束时通过 Immer 引用比较判断 canvas 是否真的变化
- **上限淘汰**：超过 100 步时 `shift` 删除最旧记录

### 组件样式分离

每个组件分外层和内层两个 div：

- **外层**：控制 position / top / left / width / height / zIndex（定位与层叠）
- **内层**：控制 fontSize / color / backgroundColor 等视觉样式

选中边框使用 `outline`（不占盒模型空间），避免 border 导致的布局偏移。

### 后端分层：路由 → 服务

后端只有两层（路由 + 服务），不设 controller 层——5 个接口的体量下 controller 层只是纯转发样板，这个取舍本身就是架构判断。

- **路由层**：参数校验、调 service、返回响应
- **服务层**：SQL 增删改查（按 user_id 隔离）、bcrypt 校验、JWT 签发
- **统一错误处理**：所有路由抛出的错误在 errorHandler 中间件收口，返回标准 `{ success, message }`

## 代码规范

| 工具     | 配置文件           | 作用                                                      |
| -------- | ------------------ | --------------------------------------------------------- |
| Prettier | `.prettierrc`      | 统一格式化（无分号、单引号、es5 尾随逗号）                |
| ESLint   | `eslint.config.js` | 代码质量检查（prefer-const、eqeqeq、no-var、unused-vars） |

Prettier 和 ESLint 各干各的：Prettier 管格式，ESLint 管质量，不交叉。
