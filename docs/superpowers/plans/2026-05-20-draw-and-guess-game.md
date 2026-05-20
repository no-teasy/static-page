# 数字对弈 (Number Duel) 原创多人联机网页游戏 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一款原创的"数字对弈"网页策略游戏——两位玩家在 6×6 棋盘上轮流放置数字，通过大小压制吞噬对手棋子，最终棋盘上数字总和更高者获胜。

**Architecture:** 前端使用纯 HTML/CSS/JS 实现，后端使用 Node.js + WebSocket (ws 库) 实现实时对战同步。房间制架构——玩家创建/加入房间后 1v1 对战。无数据库，游戏状态全内存管理。

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (ES6+), Node.js, ws (WebSocket 库), express (静态文件托管)

---

## 游戏设计

### 为什么选择「数字对弈」

| 维度 | 评分 | 说明 |
|------|------|------|
| 原创性 | ★★★★★ | 市面无同类游戏，融合数字策略+领土控制+连锁反应 |
| 好玩度 | ★★★★★ | 连锁吞噬极具爽感，冻结博弈增加深度 |
| 益智度 | ★★★★★ | 数学思维+空间策略+风险评估+手牌管理 |
| 双人适配 | ★★★★★ | 天然 1v1 对战，2 人即可开玩 |
| 实现难度 | ★★★☆☆ | 无 Canvas 绘图，纯 DOM 操作，实现简洁 |

### 核心规则

1. **棋盘**：6×6 方格（36 格），初始全空
2. **玩家**：红方 vs 蓝方
3. **手牌**：每人持有 4 张数字牌（1-9 随机），打出 1 张后自动补 1 张
4. **落子**：从手牌中选 1 个数字，放到棋盘任意空格上
5. **吞噬**：落子后，检查上下左右相邻格——若相邻格是对手的数字且**严格小于**你放置的数字，则该格被吞噬（变为你的颜色）
6. **冻结**：若你放置的数字与相邻对手数字**相等**，双方均被冻结（金色边框，永久免疫吞噬）
7. **连锁吞噬**：被吞噬的格子若又相邻其他更小的对手数字，继续吞噬，最多连锁 3 层
8. **终局**：棋盘填满时游戏结束，计算棋盘上己方所有数字之和，高分者胜

### 策略深度

- **大数风险**：放 9 可以吞噬很多，但也可能被对手的 9 冻结或被后续大数反噬
- **冻结博弈**：放相同数字可创造"城墙"阻挡对手，但也浪费了自己的数字
- **手牌管理**：何时用大牌抢地盘，何时用小牌占位，何时留牌等关键时机
- **连锁预判**：一步落子可能触发连锁吞噬 3 层，需要提前计算
- **领地控制**：角落和边缘的数字更安全（相邻格少，不易被吞噬）

---

## 文件结构

```
/workspace/game/
├── server.js              # WebSocket 服务器 + Express 静态托管 + 游戏逻辑
├── package.json           # 项目依赖
├── public/
│   ├── index.html         # 主页面（大厅 + 房间 + 游戏 单页应用）
│   ├── style.css          # 全局样式
│   ├── js/
│   │   ├── app.js         # 应用入口、视图切换、UI 交互
│   │   ├── ws-client.js   # WebSocket 客户端封装
│   │   ├── board.js       # 棋盘渲染与交互
│   │   └── game.js        # 客户端游戏状态管理
│   └── assets/
│       └── favicon.svg    # 网站图标
```

---

## 详细任务分解

### Task 1: 项目初始化与基础架构

**Files:**
- Create: `game/package.json`
- Create: `game/server.js`
- Create: `game/public/index.html`
- Create: `game/public/style.css`

- [ ] **Step 1: 创建项目目录和 package.json**

```json
{
  "name": "number-duel",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ws": "^8.16.0"
  }
}
```

- [ ] **Step 2: 创建 Express + WebSocket 服务器**

`server.js` 核心结构：
- Express 托管 `public/` 静态文件
- WebSocket 服务器挂载在同一 HTTP 服务器上
- 基础连接/断开事件处理
- 端口 3000

- [ ] **Step 3: 创建 HTML 骨架**

`index.html` 包含三个视图区域（默认隐藏，JS 控制显示）：
- `#lobby` — 大厅：输入昵称、创建房间、加入房间
- `#room` — 房间等待：显示双方玩家、准备状态
- `#game` — 游戏主界面：棋盘 + 手牌 + 信息面板

- [ ] **Step 4: 创建基础 CSS 样式**

全局样式：CSS 变量、字体、布局、三个视图容器样式、响应式基础。

- [ ] **Step 5: 安装依赖并验证服务器启动**

Run: `cd /workspace/game && npm install && node server.js`
Expected: 服务器在 3000 端口启动，访问 http://localhost:3000 能看到页面

---

### Task 2: WebSocket 通信层

**Files:**
- Create: `game/public/js/ws-client.js`
- Modify: `game/server.js`

- [ ] **Step 1: 定义消息协议**

所有消息使用 JSON 格式，结构为 `{ type: string, payload: any }`：

| type | 方向 | payload | 说明 |
|------|------|---------|------|
| `create_room` | C→S | `{ playerName }` | 创建房间 |
| `join_room` | C→S | `{ roomCode, playerName }` | 加入房间 |
| `room_created` | S→C | `{ roomCode, playerId, color }` | 房间创建成功（红方） |
| `room_joined` | S→C | `{ roomCode, playerId, color, players }` | 加入成功（蓝方） |
| `room_error` | S→C | `{ message }` | 错误提示 |
| `player_joined` | S→C | `{ player }` | 对手加入通知 |
| `player_left` | S→C | `{ playerId }` | 对手离开通知 |
| `start_game` | C→S | `{}` | 双方就绪后开始 |
| `game_started` | S→C | `{ board, hands, currentPlayer }` | 游戏开始 |
| `place_number` | C→S | `{ number, row, col }` | 放置数字 |
| `place_result` | S→C | `{ board, hands, captures, freezes, scores, currentPlayer }` | 放置结果 |
| `invalid_move` | S→C | `{ reason }` | 无效操作提示 |
| `game_over` | S→C | `{ winner, scores, board }` | 游戏结束 |
| `opponent_disconnected` | S→C | `{}` | 对手断线 |
| `rematch_request` | C→S | `{}` | 请求再来一局 |
| `rematch_accepted` | S→C | `{}` | 对方同意再来一局 |

- [ ] **Step 2: 实现客户端 WebSocket 封装**

`ws-client.js` 功能：
- `connect()` — 建立连接
- `send(type, payload)` — 发送消息
- `on(type, callback)` — 注册消息监听
- `off(type, callback)` — 取消监听
- 自动重连逻辑（最多 3 次，间隔 2 秒）
- 连接状态管理

- [ ] **Step 3: 实现服务端房间管理**

在 `server.js` 中实现：
- `rooms` Map：`roomCode → { players[], gameState, ... }`
- `players` Map：`ws → { id, name, roomCode, color }`
- 创建房间：生成 4 位房间号，创建者为红方
- 加入房间：校验房间号、是否已有 2 人
- 离开房间：通知对手
- 广播：`broadcast(roomCode, type, payload)` 向房间内所有人发送

- [ ] **Step 4: 验证通信**

手动测试：创建房间、加入房间、收到消息。

---

### Task 3: 大厅与房间界面

**Files:**
- Modify: `game/public/index.html`
- Modify: `game/public/style.css`
- Create: `game/public/js/app.js`

- [ ] **Step 1: 实现大厅视图**

大厅界面包含：
- 游戏名称 "数字对弈" + 简要规则说明
- 昵称输入框
- "创建房间"按钮
- "加入房间"输入框 + 按钮
- 规则卡片：吞噬、冻结、连锁三条核心规则图示

- [ ] **Step 2: 实现房间等待视图**

房间等待界面包含：
- 房间号显示（大字，方便分享）
- 双方玩家卡片（红方 / 蓝方，显示昵称和颜色标识）
- 等待对手加入的提示动画
- 双方就绪后自动开始

- [ ] **Step 3: 实现视图切换逻辑**

`app.js` 管理：
- `showView(viewName)` — 切换 lobby / room / game 视图
- 绑定 WebSocket 事件到视图更新
- 对手加入/离开时实时更新

- [ ] **Step 4: 样式美化**

- 大厅：居中卡片式布局，深色主题，数字元素装饰
- 房间：红蓝双方对称布局，房间号突出显示
- 过渡动画：视图切换淡入淡出

---

### Task 4: 棋盘渲染与交互

**Files:**
- Create: `game/public/js/board.js`
- Modify: `game/public/style.css`

- [ ] **Step 1: 实现棋盘 DOM 渲染**

`board.js` 功能：
- 生成 6×6 网格 DOM（CSS Grid）
- 每个格子有 data-row 和 data-col 属性
- 格子状态：空 / 红方数字 / 蓝方数字 / 冻结
- 渲染函数：`renderBoard(boardData)` 接收服务端棋盘数据并更新 DOM

- [ ] **Step 2: 实现格子样式**

CSS 样式：
- 空格：浅灰色背景，hover 时高亮
- 红方数字：红色背景渐变，白色数字
- 蓝方数字：蓝色背景渐变，白色数字
- 冻结格子：金色边框 + 微光动画
- 数字字体：大号粗体，居中显示
- 吞噬动画：格子变色 + 缩放弹跳
- 连锁动画：依次延迟播放吞噬效果

- [ ] **Step 3: 实现手牌区域**

- 显示当前玩家的 4 张手牌
- 点击手牌选中（高亮边框）
- 选中手牌后，点击棋盘空格放置
- 仅轮到自己时可操作
- 对手手牌显示为背面（仅显示数量）

- [ ] **Step 4: 实现落子交互流程**

1. 点击手牌 → 选中（高亮）
2. 点击棋盘空格 → 发送 `place_number` 到服务端
3. 收到 `place_result` → 播放动画 + 更新棋盘 + 更新手牌
4. 非自己回合时手牌和棋盘不可点击

- [ ] **Step 5: 实现信息面板**

- 当前回合指示（红方/蓝方回合）
- 双方实时分数
- 剩余空格数
- 最近操作日志（"红方在 (2,3) 放置 7，吞噬蓝方 4！"）

---

### Task 5: 服务端游戏逻辑

**Files:**
- Modify: `game/server.js`

- [ ] **Step 1: 实现游戏状态数据结构**

```javascript
const gameState = {
  board: Array(6).fill(null).map(() => Array(6).fill(null)),
  // 每格: null | { value: 1-9, owner: 'red'|'blue', frozen: false }
  hands: {
    red: [3, 7, 2, 5],
    blue: [4, 1, 8, 6]
  },
  currentPlayer: 'red',
  scores: { red: 0, blue: 0 },
  deck: [...],  // 剩余数字池
  moveHistory: []
};
```

- [ ] **Step 2: 实现数字池与发牌逻辑**

- 数字池：1-9 各 4 张，共 36 张（恰好填满 6×6）
- 洗牌：Fisher-Yates 算法
- 初始发牌：每人 4 张
- 补牌：打出 1 张后从池中抽 1 张，池空则不补

- [ ] **Step 3: 实现落子与吞噬逻辑**

```javascript
function placeNumber(gameState, player, number, row, col) {
  // 1. 校验：格子是否为空、数字是否在手牌中、是否轮到该玩家
  // 2. 放置数字到棋盘
  // 3. 检查相邻格吞噬
  // 4. 执行连锁吞噬（最多 3 层）
  // 5. 检查冻结
  // 6. 从手牌移除该数字
  // 7. 补牌
  // 8. 切换当前玩家
  // 9. 检查游戏是否结束
  // 10. 返回结果（含动画数据）
}
```

吞噬逻辑伪代码：
```
function checkCaptures(board, row, col, placedValue, owner):
  captured = []
  for each adjacent cell (r, c):
    cell = board[r][c]
    if cell exists AND cell.owner !== owner AND cell.value < placedValue AND !cell.frozen:
      captured.push({ r, c })
      // 连锁：检查被吞噬格子的相邻格
      for each adjacent cell (r2, c2) of (r, c):
        cell2 = board[r2][c2]
        if cell2 exists AND cell2.owner !== owner AND cell2.value < placedValue AND !cell2.frozen:
          captured.push({ r: r2, c: c2 })
          // 第三层连锁...
  return captured
```

冻结逻辑：
```
function checkFreezes(board, row, col, placedValue, owner):
  freezes = []
  for each adjacent cell (r, c):
    cell = board[r][c]
    if cell exists AND cell.owner !== owner AND cell.value === placedValue AND !cell.frozen:
      freezes.push({ r, c })
      board[r][c].frozen = true
  if freezes.length > 0:
    board[row][col].frozen = true
  return freezes
```

- [ ] **Step 4: 实现计分逻辑**

```javascript
function calculateScores(board) {
  let red = 0, blue = 0;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const cell = board[r][c];
      if (cell) {
        if (cell.owner === 'red') red += cell.value;
        else blue += cell.value;
      }
    }
  }
  return { red, blue };
}
```

- [ ] **Step 5: 实现游戏结束判定**

- 棋盘填满（36 格全占）→ 游戏结束
- 计算最终分数，广播 `game_over`
- 处理再来一局请求

- [ ] **Step 6: 实现落子消息处理**

服务端收到 `place_number` 后：
1. 校验合法性
2. 执行 `placeNumber()`
3. 广播 `place_result`（含吞噬/冻结动画数据）
4. 若游戏结束，广播 `game_over`

---

### Task 6: 客户端游戏状态管理

**Files:**
- Create: `game/public/js/game.js`
- Modify: `game/public/js/app.js`
- Modify: `game/public/js/board.js`

- [ ] **Step 1: 实现客户端游戏状态**

`game.js` 管理：
- 当前棋盘状态
- 己方手牌
- 当前回合
- 双方分数
- 操作历史

- [ ] **Step 2: 实现动画系统**

动画效果：
- **落子动画**：数字从手牌飞到棋盘格子，缩放弹入
- **吞噬动画**：被吞噬的格子闪烁 → 变色 → 弹跳
- **连锁动画**：按层级依次延迟播放（0ms, 300ms, 600ms）
- **冻结动画**：金色边框从四周合拢 + 冰晶粒子效果
- **得分动画**：分数变化时数字弹跳 + 飘出 "+N"

- [ ] **Step 3: 实现游戏结束界面**

- 模态框显示最终结果
- 胜者：大字 "胜利！" + 分数
- 败者："惜败" + 分数
- 平局："势均力敌！"
- "再来一局"按钮
- "返回大厅"按钮

- [ ] **Step 4: 实现断线处理**

- 对手断线时显示提示
- 等待 30 秒，若对手重连则继续
- 超时则判断线方负

---

### Task 7: 完善与优化

**Files:**
- Modify: `game/server.js`
- Modify: `game/public/style.css`
- Create: `game/public/assets/favicon.svg`

- [ ] **Step 1: 断线重连**

- 客户端：WebSocket 断开后自动重连
- 服务端：玩家断线后保留 30 秒
- 重连后恢复当前游戏状态（重发完整棋盘数据）

- [ ] **Step 2: 移动端适配**

- 棋盘自适应屏幕宽度
- 手牌区域横向滚动
- 触摸优化：点击反馈
- 信息面板折叠/展开

- [ ] **Step 3: 创建 favicon**

数字 "VS" 图标 SVG，红蓝配色。

- [ ] **Step 4: 全流程测试**

- 创建房间 → 加入房间 → 游戏开始 → 落子 → 吞噬 → 冻结 → 连锁 → 游戏结束 → 再来一局
- 多浏览器同时测试
- 移动端测试

---

## 技术要点

### 实时通信
- WebSocket 全双工通信，低延迟
- 所有游戏逻辑在服务端执行，客户端仅做展示
- 防作弊：落子校验在服务端，客户端无法伪造操作

### 棋盘渲染
- CSS Grid 布局，6×6 网格
- DOM 操作而非 Canvas，便于动画和交互
- CSS transitions/animations 实现流畅动画

### 状态管理
- 服务端为唯一权威状态源
- 客户端维护展示用状态副本
- 每次操作后服务端推送完整状态，客户端重新渲染

### 安全考虑
- 落子合法性在服务端校验
- 手牌数据仅发送给对应玩家
- 对手手牌仅显示数量，不显示具体数字
