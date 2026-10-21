// ============================================================
//  待办清单 TodoList（前端）
// ============================================================
//  用 fetch 请求后端接口，数据由服务器统一管理。
//
//  接口一览（和 server.js 对应）：
//    GET    /api/todos      获取所有待办
//    POST   /api/todos      新增一条待办
//    PATCH  /api/todos/:id  切换完成状态
//    DELETE /api/todos/:id  删除一条待办
// ============================================================

// ---------- 1. 选中页面上的元素 ----------
const input = document.querySelector("#todoInput");
const addBtn = document.querySelector("#addBtn");
const list = document.querySelector("#list");


// ---------- 2. 渲染函数：把数据"画"到页面上 ----------
function renderList(todos) {
    list.innerHTML = "";   // 先清空，避免重复

    for (let i = 0; i < todos.length; i++) {
        const item = todos[i];

        const li = document.createElement("li");
        li.textContent = item.content;

        if (item.done) {
            li.classList.add("完成");   // "完成" 是 CSS 类名，保持不变
        }

        // 双击这条 = 请求后端切换完成状态
        li.addEventListener("dblclick", async function () {
            await fetch("/api/todos/" + item.id, { method: "PATCH" });
            loadList();   // 状态变了，重新从后端拿一遍
        });

        // 造一个"删除"按钮
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "删除";
        deleteBtn.addEventListener("click", async function (e) {
            e.stopPropagation();   // 挡住冒泡，别误触"双击"

            await fetch("/api/todos/" + item.id, { method: "DELETE" });
            loadList();
        });

        li.appendChild(deleteBtn);
        list.appendChild(li);
    }
}


// ---------- 3. 从后端加载数据 ----------
async function loadList() {
    const res = await fetch("/api/todos");
    const todos = await res.json();
    renderList(todos);
}


// ---------- 4. 添加功能：读输入 → 发请求 → 重新加载 ----------
addBtn.addEventListener("click", async function () {
    const newContent = input.value.trim();

    if (newContent === "") {
        alert("请输入内容！");
        return;
    }

    // 向后端发 POST 请求，把新内容塞进请求体（键名用英文 content）
    await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
    });

    input.value = "";   // 清空输入框
    loadList();         // 重新加载
});


// ---------- 5. 按回车也能添加 ----------
input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        addBtn.click();
    }
});


// 页面打开时，先从后端加载一次数据
loadList();
