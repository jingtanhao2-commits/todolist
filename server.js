// ============================================================
//  待办清单 后端服务器（Node.js + Express + SQLite）
// ============================================================
//  职责：接收前端的请求，管理待办数据，返回 JSON。
//
//  数据存在 SQLite 数据库（todo.db 文件）里，重启不丢。
//  数据库列名用英文（id / content / done），
//  返回给前端的 JSON 键也用英文（id / content / done），
//  前端按同样的英文键读取。
// ============================================================

const express = require("express");
// Node 22.5 起自带 SQLite，不用额外装依赖
const { DatabaseSync } = require("node:sqlite");

const app = express();

// ---------- 打开数据库（文件不存在就自动创建） ----------
// todo.db 是一个单文件，数据都记在这个文件里
const db = new DatabaseSync("todo.db");

// ---------- 建表：只建一次，已存在就跳过 ----------
// 表名 todos，相当于"待办登记表"，有三列：
//   id      每条待办的唯一编号（自动 +1）
//   content 要做什么（文字内容）
//   done    做完了没（0 = 没完成，1 = 完成了）
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT    NOT NULL,
    done    INTEGER NOT NULL DEFAULT 0
  )
`);

// 让 Express 能读懂前端发来的 JSON 格式的请求体
app.use(express.json());

// 让 Express 把当前文件夹当成"静态网站"托管出去
app.use(express.static(__dirname));

// 把数据库里的一行，转成接口返回的对象 { id, content, done }
function toTodo(row) {
  return { id: row.id, content: row.content, done: row.done === 1 };
}


// ---------- 接口 1：获取所有待办 ----------
// 前端访问 GET /api/todos，就把整张表查出来返回
app.get("/api/todos", function (req, res) {
  const rows = db.prepare("SELECT * FROM todos ORDER BY id").all();
  res.json(rows.map(toTodo));
});


// ---------- 接口 2：新增一条待办 ----------
// 前端访问 POST /api/todos，并在请求体里带上 { content: "..." }
app.post("/api/todos", function (req, res) {
  const content = (req.body.content || "").trim();

  // 防止存进空内容
  if (content === "") {
    return res.status(400).json({ error: "内容不能为空" });
  }

  // ? 是占位符，后面的 content 会填进去，防 SQL 注入
  const result = db
    .prepare("INSERT INTO todos (content, done) VALUES (?, 0)")
    .run(content);

  // lastInsertRowid = 数据库自动分配给这条新记录的唯一编号
  const newTodo = { id: Number(result.lastInsertRowid), content: content, done: false };
  res.status(201).json(newTodo);
});


// ---------- 接口 3：切换完成状态 ----------
// 前端访问 PATCH /api/todos/3，就把 id 为 3 的那条"完成"取反
app.patch("/api/todos/:id", function (req, res) {
  const id = Number(req.params.id);

  // 先查这条待办还在不在
  const row = db.prepare("SELECT * FROM todos WHERE id = ?").get(id);

  if (!row) {
    return res.status(404).json({ error: "找不到这条待办" });
  }

  // 取反：0 变 1，1 变 0
  const newDone = row.done === 1 ? 0 : 1;
  db.prepare("UPDATE todos SET done = ? WHERE id = ?").run(newDone, id);

  res.json({ id: id, content: row.content, done: newDone === 1 });
});


// ---------- 接口 4：删除一条待办 ----------
// 前端访问 DELETE /api/todos/3，就把 id 为 3 的那条删掉
app.delete("/api/todos/:id", function (req, res) {
  const id = Number(req.params.id);

  const result = db.prepare("DELETE FROM todos WHERE id = ?").run(id);

  // changes = 实际删掉了多少行，0 行说明没找到这条
  if (result.changes === 0) {
    return res.status(404).json({ error: "找不到这条待办" });
  }

  res.json({ success: true });
});


// ---------- 启动服务器 ----------
const PORT = 3000;
app.listen(PORT, function () {
  console.log("✅ 服务器已启动：http://localhost:" + PORT);
});
