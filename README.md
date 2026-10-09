关于本项目：这是一个学习性质的个人项目，初期在本地开发完成，现已迁移到 Git 进行版本管理。后续迭代会以提交记录的方式持续更新。

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
| 代码规范 | ESLint + Prettier |
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

# 代码格式化
npx prettier --write "src/**/*.{ts,tsx,less,css}"

# ESLint 检查
pnpm lint
```

> 类型检查使用 `tsc -b`（项目引用模式），而非 `tsc --noEmit`。

## 项目结构

```
src/
├── main.tsx                      # 应用入口
├── App.tsx                       # 路由定义 + 全局鉴权
│
├── components/                   # 全局通用组件
│   ├── Login.tsx                 # 登录/注册页
│   └── RequireAuth.tsx          # 路由守卫（未登录重定向）
│
├── services/                     # 业务语义层（storage → services → store）
│   ├── types.ts                 #   Service 层类型（User、CanvasItem）
│   ├── storage.ts               #   存储原语（localStorage + cookie 读写）
│   ├── canvasService.ts         #   画布 CRUD（getCanvasList / getCanvasById / saveCanvas / del）
│   └── authService.ts           #   认证业务（login / logout / register）
│
├── store/                        # 状态管理层
│   ├── editStoreTypes.ts        #   类型定义（ICanvas、ICmp、Style、EditStoreState）
│   ├── editStore.ts              #   Barrel file — 聚合导出所有 slice
│   ├── editStore/                #   编辑器核心 store（按职责拆分）
│   │   ├── index.ts              #     store 实例（Zustand + Immer create）
│   │   ├── getDefaultCanvas.ts   #     默认画布配置
│   │   ├── selectors.ts          #     选择器（selectedCmpIndexSelector）
│   │   └── slices/               #     各职责 slice
│   │       ├── canvasSlice.ts    #       画布管理（load / reset / clear / save / title / style）
│   │       ├── cmpSlice.ts       #       组件增删 / 剪贴板（add / del / duplicate / copy / paste）
│   │       ├── layerSlice.ts     #       图层顺序（moveUp / moveDown / front / back）
│   │       ├── selectionSlice.ts #       选中管理（selectAll / setCmps / setCmp）
│   │       └── styleSlice.ts     #       样式更新（byDistance / selectedStyle / selectedAttr / assemblyStyle）
│   ├── historySlice.ts          #   历史栈（撤销/重做，最多 100 步）
│   ├── zoomStore.ts             #   缩放状态
│   └── hooks.ts                 #   自定义 Hook（useCanvasId / useCanvasType）
│
├── pages/
│   ├── ListPage/                # 画布列表页（新建/编辑/删除）
│   │
│   ├── PreviewPage/             # 画布预览页（只读展示）
│   │
│   └── EditPage/                # 编辑器主页面
│       ├── index.tsx            #   页面骨架：URL id → 加载画布 → 布局
│       │
│       ├── Header/              #   顶部导航栏（保存、预览、导出图片、撤销/重做）
│       │
│       ├── LeftSider/           #   左侧组件面板
│       │   ├── index.tsx       #     面板切换入口（文本/图片/图形/导入）
│       │   ├── TextSider.tsx    #     文本素材区
│       │   ├── ImgSider.tsx     #     图片素材区（本地 assets）
│       │   ├── GraphSider.tsx   #     图形素材区
│       │   └── ImportSider.tsx  #     导入本地图片（FileReader → dataURL）
│       │
│       ├── Center/              #   中央画布区域
│       │   ├── index.tsx        #     画布容器 + 快捷键监听
│       │   ├── Canvas/           #     画布渲染层（transform: scale 缩放）
│       │   ├── Cmp/              #     单个组件（选中态、拖拽、点击多选）
│       │   ├── EditBox/          #     选中包围盒（拖拽移动、双击编辑文本）
│       │   │   └── StretchDots/ #     八方向拉伸点
│       │   ├── Menu/             #     右键菜单（Portal 渲染）
│       │   └── Zoom/             #     缩放控制器
│       │
│       └── RightSider/          #   右侧属性面板
│           ├── index.tsx        #     面板切换（画布属性/组件属性/多选属性）
│           ├── EditCanvas.tsx   #     画布属性（标题、尺寸、背景）
│           ├── EditCmp.tsx      #     单组件属性（位置、尺寸、字体、颜色等）
│           └── EditMultiCmps.tsx#     多选对齐操作
│
├── lib/                         # 通用 UI 封装
│   ├── Item/                    #   属性面板表单项容器
│   └── InputColor/              #   颜色选择器（react-color 封装）
│
└── utils/                       # 纯工具函数（无业务依赖）
    ├── const.ts                 #   常量（组件类型标识、默认样式）
    ├── cookies.ts               #   cookies 封装
    ├── exportImage.ts           #   画布导出为 PNG（接收 ICanvas 参数，不依赖 store）
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
- 拖拽/缩放结束时通过引用比较去重，避免"假历史"
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

### 分层架构：services → store

```
┌─────────────────────────────────────────────────────┐
│  UI 层（pages / components）                         │
│  只渲染、只发请求、只 dispatch                        │
├─────────────────────────────────────────────────────┤
│  Store 层（store/editStore/）                        │
│  运行时编辑态：拖拽位置、选中集合、历史栈             │
│  只管"内存里这一刻的状态"，不碰 storage               │
├─────────────────────────────────────────────────────┤
│  Services 层（services/）                            │
│  业务语义封装：getCanvasList(keyword) / login()      │
│  对外接口形态和真实后端 API 一致，方便后续迁移        │
├─────────────────────────────────────────────────────┤
│  Storage 层（services/storage.ts）                   │
│  纯读写原语：localStorage.getItem / document.cookie   │
│  不包含任何业务逻辑                                  │
└─────────────────────────────────────────────────────┘
```

依赖方向只能从上往下，绝不允许反向。utils 层不依赖任何上层。

**迁移到真后端时**：只需把 services 层内部实现从 localStorage 换成 `fetch('/api/...')`，store 和 UI 一行都不用改。

### Store 按职责拆分

editStore 拆分为 5 个 slice，每个 slice 只负责一类职责，统一接收 Immer draft 参数：

| Slice | 职责 | 主要函数 |
|-------|------|---------|
| canvasSlice | 画布管理 | loadCanvas / resetCanvas / clearCanvas / saveCanvas / updateCanvasStyle |
| cmpSlice | 组件增删/剪贴板 | addCmp / delSelectedCmps / duplicateSelectedCmps / copySelectedCmps / pasteCmps |
| layerSlice | 图层顺序 | moveSelectedCmpUp / moveSelectedCmpDown / bringSelectedCmpToFront / sendSelectedCmpToBack |
| selectionSlice | 选中管理 | setAllCmpsSelected / setCmpsSelected / setCmpSelected |
| styleSlice | 样式更新 | updateAssemblyCmpsByDistance / updateSelectedCmpStyle / updateSelectedCmpAttr / editAssemblyStyle |

`editStore.ts` 作为 barrel file 聚合导出所有 slice，调用方只需 `from "@/store/editStore"` 即可导入任何 action。

### 选中状态

使用 `Set<number>` 存储选中组件的下标集合，配合 Immer 的 `enableMapSet()` 支持 Set 的 `add/delete/clear` 草稿操作。单选时 `Set.size === 1`，多选时遍历集合操作所有选中组件。

### 指针式历史栈

```
canvasChangeHistory: [ S0, S1, S2, S3 ]
                              ↑
                    canvasChangeHistoryIndex = 2
```

- **快照数组 + 索引指针**：撤销/重做只移动指针，不修改数组
- **截断重做分支**：产生新修改时 `slice` 截断指针后面的历史，避免分叉
- **防抖去重**：拖拽/缩放结束时通过 Immer 引用比较判断 canvas 是否真的变化，跳过单击等噪声操作
- **上限淘汰**：超过 100 步时 `shift` 删除最旧记录，指针同步前移

### 组件样式分离

每个组件分外层和内层两个 div：
- **外层**：控制 position / top / left / width / height / zIndex（定位与层叠）
- **内层**：控制 fontSize / color / backgroundColor 等视觉样式

选中边框使用 `outline`（不占盒模型空间），避免 border 导致的布局偏移。

### utils 层无反向依赖

utils 层是纯工具函数，不依赖 store。例如 `exportImage.ts` 接收 `ICanvas` 参数而非直接 import store，避免循环依赖。

## 代码规范

| 工具 | 配置文件 | 作用 |
|------|---------|------|
| Prettier | `.prettierrc` | 统一格式化（无分号、单引号、es5 尾随逗号） |
| ESLint | `eslint.config.js` | 代码质量检查（prefer-const、eqeqeq、no-var、unused-vars） |

Prettier 和 ESLint 各干各的：Prettier 管格式，ESLint 管质量，不交叉。
