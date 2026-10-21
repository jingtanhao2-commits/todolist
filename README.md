# 待办清单 TodoList

一个简单的前后端待办清单练习项目，数据存在 SQLite 里，重启不丢。

## 技术栈

- 后端：Node.js + Express + SQLite（用 Node 自带的 `node:sqlite`，无需额外装数据库）
- 前端：原生 HTML / CSS / JavaScript

## 怎么运行

1. 安装依赖：
   ```
   npm install
   ```
2. 启动服务器：
   ```
   npm start
   ```
3. 浏览器打开 http://localhost:3000

## 数据存在哪

数据存在 `todo.db`（SQLite 单文件）里，重启服务器不丢。

## 目录结构

- `server.js` —— 后端服务器（接口 + 数据库）
- `index.html` / `script.js` / `style.css` —— 前端页面
- `package.json` —— 项目配置
