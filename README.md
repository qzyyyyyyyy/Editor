关于本项目 ：这是一个学习性质的个人项目，初期在本地开发完成，现已迁移到 Git 进行版本管理。后续迭代会以提交记录的方式持续更新。
# Trouble — 可视化页面编辑器

一个纯前端的可视化页面搭建工具，用户可以通过拖拽、编辑、组合组件来搭建移动端页面，支持画布缩放、组件多选、历史撤销/重做、导出图片等能力。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript 6 |
| 构建 | Vite 8 |
| 状态管理 | Zustand 5 + Immer（启用 `enableMapSet` 支持 Set/Map 草稿操作） |
| 路由 | React Router 7 |
| UI 组件库 | Ant Design 6 + @ant-design/icons |
| 样式方案 | CSS Modules + Less |
| 工具库 | lodash-es、classnames |
| 截图导出 | html-to-image |
| 颜色选择 | react-color |
| 文本自适应 | react-textarea-autosize |
| 数据持久化 | localStorage + cookies |

## 快速开始

```bash
# 安装依赖（项目使用 pnpm）
pnpm install

# 启动开发服务器
pnpm dev

# 类型检查 + 构建
pnpm build

# 预览构建产物
pnpm preview
```

> 类型检查使用 `tsc -b`（项目引用模式），而非 `tsc --noEmit`。

## 项目结构

```
src/
├── main.tsx                      # 应用入口
├── App.tsx                       # 路由定义 + 全局鉴权
│
├── components/                   # 全局通用组件
│   ├── Login.tsx                 # 登录页
│   └── RequireAuth.tsx          # 路由守卫（未登录重定向）
│
├── pages/
│   ├── ListPage/                 # 画布列表页（新建/编辑/删除）
│   │
│   ├── PreviewPage/             # 画布预览页（只读展示）
│   │
│   └── EditPage/                # 编辑器主页面
│       ├── index.tsx            # 页面骨架：URL id → 加载画布 → 布局
│       ├── index.module.less
│       │
│       ├── Header/              # 顶部导航栏
│       │   └── index.tsx       #   保存、预览、导出图片、撤销/重做
│       │
│       ├── LeftSider/           # 左侧组件面板
│       │   ├── index.tsx       #   面板切换入口（文本/图片/图形/导入）
│       │   ├── TextSider.tsx    #   文本素材区
│       │   ├── ImgSider.tsx     #   图片素材区（本地 assets）
│       │   ├── GraphSider.tsx   #   图形素材区
│       │   └── ImportSider.tsx  #   导入本地图片（FileReader → dataURL）
│       │
│       ├── Center/              # 中央画布区域
│       │   ├── index.tsx        #   画布容器 + 快捷键监听
│       │   ├── Canvas/
│       │   │   └── index.tsx   #   画布渲染层（transform: scale 缩放）
│       │   ├── Cmp/
│       │   │   ├── index.tsx    #   单个组件（选中态、拖拽、点击多选）
│       │   │   └── CmpDetail.tsx#   Text/Img 渲染组件
│       │   ├── EditBox/
│       │   │   ├── index.tsx    #   选中包围盒（拖拽移动、双击编辑文本）
│       │   │   └── StretchDots/ #   八方向拉伸点
│       │   ├── Menu/
│       │   │   └── index.tsx   #   右键菜单（复制/删除/图层操作，Portal 渲染）
│       │   └── Zoom/
│       │       └── index.tsx   #   缩放控制器
│       │
│       └── RightSider/          # 右侧属性面板
│           ├── index.tsx       #   面板切换（画布属性/组件属性/多选属性）
│           ├── EditCanvas.tsx  #   画布属性（标题、尺寸、背景）
│           ├── EditCmp.tsx     #   单组件属性（位置、尺寸、字体、颜色等）
│           └── EditMultiCmps.tsx#   多选对齐操作
│
├── store/                       # 状态管理（三层分离：storage → request → store）
│   ├── editStore.ts             #   编辑器核心 store（画布数据、组件增删改、
│   │                             #   选中、复制/粘贴、图层操作、保存/加载）
│   ├── editStoreTypes.ts        #   类型定义（ICanvas、ICmp、Style、EditStoreState）
│   ├── historySlice.ts         #   历史记录（撤销/重做，最多 100 步）
│   ├── zoomStore.ts             #   缩放状态
│   └── hooks.ts                #   通用 hooks（useCanvasId 等）
│
├── request/                     # 数据请求层（storage → request → store）
│   ├── list.ts                  #   画布列表 CRUD（读写 localStorage）
│   ├── user.ts                 #   用户相关
│   └── register.ts             #   注册相关
│
├── lib/                         # 通用 UI 封装
│   ├── Item/                    #   属性面板表单项容器
│   └── InputColor/              #   颜色选择器（react-color 封装）
│
└── utils/                       # 工具函数
    ├── const.ts                 #   常量（组件类型标识、面板标识、默认样式）
    ├── storage.ts               #   localStorage 封装（画布列表读写）
    ├── cookies.ts               #   cookies 封装
    ├── exportImage.ts           #   画布导出为 PNG（html-to-image）
    └── index.ts                 #   通用工具（getOnlyKey 等）
```

## 核心功能

### 画布编辑

- **组件系统**：文本、图片、图形三种基础组件，支持位置、尺寸、字体、颜色、背景等样式编辑
- **拖拽编辑**：单击选中、Ctrl/Cmd+点击多选、拖拽移动、八方向拉伸调整尺寸
- **双击编辑文本**：文本组件双击进入编辑态，自动高度自适应
- **画布缩放**：支持 50%–200% 缩放，拖拽和位置计算自动按缩放比换算

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl/Cmd + A | 全选组件 |
| Ctrl/Cmd + Z | 撤销 |
| Ctrl/Cmd + Shift + Z | 重做 |
| Ctrl/Cmd + C | 复制选中组件 |
| Ctrl/Cmd + V | 粘贴（支持连续粘贴错位） |
| Backspace / Delete | 删除选中组件 |
| Ctrl/Cmd + +/- | 画布缩放 |

### 右键菜单

- 复制组件 / 删除组件
- 上移一层 / 下移一层 / 置顶 / 置底（单选时可用）
- 菜单通过 Portal 渲染到 body，避免被画布 overflow 裁剪

### 历史记录

- 每次画布操作（增删改、复制粘贴、图层移动）自动记录
- 最多保留 100 步历史
- 撤销后继续操作会丢弃后续重做分支

### 导入与导出

- **导入本地图片**：FileReader 读取为 dataURL 存入组件，按真实尺寸等比缩放到画布
- **导出为图片**：html-to-image 截图画布，2x 清晰度，自动排除选中框等编辑 UI

### 数据持久化

- 画布数据以 JSON 字符串存入 localStorage（`__canvas_list__` 键）
- 加载时与默认画布合并，兼容脏数据和字段缺失
- 画布 ID 通过 URL 参数跟踪（`?id=xxx&type=xxx`）

## 架构设计

### 状态管理三层分离

```
storage（localStorage 读写）
    ↓
request（数据请求层，封装 storage）
    ↓
store（Zustand 全局状态，组件订阅）
```

- `utils/storage.ts` 负责 localStorage 底层读写
- `request/list.ts` 封装画布列表的 CRUD 逻辑
- `store/editStore.ts` 管理运行时编辑状态，不直接操作 storage

### 选中状态

使用 `Set<number>` 存储选中组件的下标集合，配合 Immer 的 `enableMapSet()` 支持 Set 的 `add/delete/clear` 操作。单选时 Set.size === 1，多选时遍历集合操作所有选中组件。

### 组件样式分离

每个组件分外层和内层两个 div：
- **外层**：控制 position / top / left / width / height / zIndex（定位与层叠）
- **内层**：控制 fontSize / color / backgroundColor 等视觉样式

选中边框使用 `outline`（不占盒模型空间），避免 border 导致的布局偏移。
