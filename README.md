# 向日葵之谜 (Sunflower Mystery)

一个基于太阳、向日葵和眼泪的创意解谜游戏。

## 游戏灵感

太阳让向日葵流眼泪，流泪的地方长出新的向日葵。向日葵生长在破旧的墙壁上，墙壁是一个可以旋转的3D背景，上面有一些随机生成的角落需要被向日葵覆盖。

## 游戏玩法

1. **目标**：让向日葵覆盖墙壁上所有的红色角落标记
2. **操作方式**：
   - 🖱️ 鼠标拖拽 - 旋转墙壁以改变视角
   - 🌻 点击向日葵 - 让向日葵流泪，泪水落在墙上会生长出新的向日葵
   - 🎯 策略性地放置向日葵，让它们覆盖所有角落
3. **胜利条件**：当所有角落都被向日葵覆盖（绿色标记）时，游戏胜利

## 如何运行

### 方法1：直接在浏览器中打开

1. 克隆或下载此仓库
2. 直接在浏览器中打开 `index.html` 文件
3. 开始游戏！

### 方法2：使用本地服务器

```bash
# 使用 Python 3
python3 -m http.server 8080

# 或使用 Python 2
python -m SimpleHTTPServer 8080

# 或使用 Node.js 的 http-server
npx http-server -p 8080
```

然后在浏览器中访问 `http://localhost:8080`

## 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式和动画
- **JavaScript (Canvas 2D API)** - 游戏逻辑和渲染
- **无需构建工具** - 可直接在浏览器中运行

## 游戏特性

- ✨ 美丽的2D渲染效果，模拟3D墙壁
- 🧱 逼真的破旧砖墙纹理
- ☀️ 动态旋转的太阳
- 💧 流畅的泪滴动画效果
- 🌻 可爱的向日葵设计
- 🎮 直观的鼠标交互
- 🏆 完整的胜利条件和重新开始功能

## 游戏截图

![游戏初始状态](https://github.com/user-attachments/assets/72a5eff8-e13a-4354-9652-378a84302b58)

![游戏进行中](https://github.com/user-attachments/assets/ccd012d6-d9d5-45d4-b423-c57177fbd3eb)

## 文件结构

```
Sunflower_Myst/
├── index.html      # 主页面
├── style.css       # 样式文件
├── game.js         # 游戏逻辑
├── README.md       # 项目文档
└── LICENSE         # 许可证
```

## 浏览器支持

- Chrome/Edge (推荐)
- Firefox
- Safari
- 支持 HTML5 Canvas 的现代浏览器

## 开发者

AI Generated Game - 一个由灵感驱动的梦幻游戏项目

## 许可证

见 LICENSE 文件

