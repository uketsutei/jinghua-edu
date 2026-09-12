/* =========================================================
   菁华教育网课平台 · 后端服务
   ---------------------------------------------------------
   · 零依赖：只用 Node 自带的 http / sqlite，无需 npm install
   · 同时提供 网站静态页面 + 后端接口
   · 数据保存在 server/data/jinghua.db（SQLite）
   · 启动：node server/server.js   默认端口 3000
   ========================================================= */

"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");

const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(__dirname, "data");
const PORT = Number(process.env.PORT || 3000);
const ADMIN_KEY = process.env.JH_ADMIN_KEY || "jinghua2026";

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, "jinghua.db"));

/* ---------------- 数据库初始化 ---------------- */
db.exec(`
CREATE TABLE IF NOT EXISTS content (
  key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT UNIQUE NOT NULL, name TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS codes (
  phone TEXT PRIMARY KEY, code TEXT NOT NULL, expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS enrollments (
  user_id INTEGER NOT NULL, course_id TEXT NOT NULL, created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, course_id)
);
CREATE TABLE IF NOT EXISTS progress (
  user_id INTEGER NOT NULL, course_id TEXT NOT NULL, lesson_id TEXT NOT NULL,
  done_at TEXT NOT NULL, PRIMARY KEY (user_id, course_id, lesson_id)
);
CREATE TABLE IF NOT EXISTS notes (
  user_id INTEGER NOT NULL, course_id TEXT NOT NULL, lesson_id TEXT NOT NULL,
  text TEXT NOT NULL, updated_at TEXT NOT NULL,
  PRIMARY KEY (user_id, course_id, lesson_id)
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
  course_ids TEXT NOT NULL, amount INTEGER NOT NULL, status TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT, course_id TEXT NOT NULL,
  name TEXT NOT NULL, text TEXT NOT NULL, stars INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT NOT NULL, at TEXT NOT NULL
);
`);

const now = () => new Date().toISOString();

/* ---------------- 工具 ---------------- */
function json(res, code, data) {
  const body = JSON.stringify(data);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > 2 * 1024 * 1024) {
        reject(new Error("请求体过大"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(new Error("请求内容不是合法 JSON"));
      }
    });
    req.on("error", reject);
  });
}

function isAdmin(req) {
  const key = String(req.headers["x-admin-key"] || "");
  if (!key || key.length !== ADMIN_KEY.length) return false;
  return crypto.timingSafeEqual(Buffer.from(key), Buffer.from(ADMIN_KEY));
}

function currentUser(req) {
  const auth = String(req.headers["authorization"] || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const row = db.prepare("SELECT user_id FROM sessions WHERE token = ?").get(token);
  if (!row) return null;
  return db.prepare("SELECT id, phone, name FROM users WHERE id = ?").get(row.user_id) || null;
}

function requireUser(req, res) {
  const u = currentUser(req);
  if (!u) {
    json(res, 401, { error: "请先登录" });
    return null;
  }
  return u;
}

/* ---------------- 接口 ---------------- */
async function api(req, res, url) {
  const p = url.pathname;
  const method = req.method;

  /* 健康检查：前端靠它判断后端是否在线 */
  if (p === "/api/health" && method === "GET") {
    return json(res, 200, { ok: true, name: "jinghua-edu", version: "1.0.0", time: now() });
  }

  /* 全站内容：页面直接编辑的结果 */
  if (p === "/api/content" && method === "GET") {
    const rows = db.prepare("SELECT key, value, updated_at FROM content").all();
    const overrides = {};
    let updatedAt = null;
    rows.forEach((r) => {
      overrides[r.key] = r.value;
      if (!updatedAt || r.updated_at > updatedAt) updatedAt = r.updated_at;
    });
    return json(res, 200, { overrides, count: rows.length, updatedAt });
  }

  if (p === "/api/content" && method === "PUT") {
    if (!isAdmin(req)) return json(res, 403, { error: "编辑密码不正确" });
    const body = await readBody(req);
    const overrides = body.overrides || {};
    const keys = Object.keys(overrides);
    const del = db.prepare("DELETE FROM content");
    const put = db.prepare(
      "INSERT INTO content (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
    );
    db.exec("BEGIN");
    try {
      del.run();
      keys.forEach((k) => put.run(k, String(overrides[k]), now()));
      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
      return json(res, 500, { error: "保存失败：" + e.message });
    }
    console.log("[内容] 已保存 " + keys.length + " 处修改");
    return json(res, 200, { ok: true, count: keys.length, updatedAt: now() });
  }

  /* 登录：演示环境验证码直接返回，正式上线换成短信服务 */
  if (p === "/api/auth/code" && method === "POST") {
    const body = await readBody(req);
    const phone = String(body.phone || "").trim();
    if (!/^1\d{10}$/.test(phone)) return json(res, 400, { error: "手机号格式不正确" });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    db.prepare(
      "INSERT INTO codes (phone, code, expires_at) VALUES (?, ?, ?) ON CONFLICT(phone) DO UPDATE SET code = excluded.code, expires_at = excluded.expires_at"
    ).run(phone, code, Date.now() + 10 * 60 * 1000);
    console.log("[验证码] " + phone + " -> " + code);
    return json(res, 200, { ok: true, devCode: code, tip: "演示环境：验证码直接返回" });
  }

  if (p === "/api/auth/login" && method === "POST") {
    const body = await readBody(req);
    const phone = String(body.phone || "").trim();
    const code = String(body.code || "").trim();
    const name = String(body.name || "").trim() || "同学";
    if (!/^1\d{10}$/.test(phone)) return json(res, 400, { error: "手机号格式不正确" });
    const row = db.prepare("SELECT code, expires_at FROM codes WHERE phone = ?").get(phone);
    if (!row || row.code !== code || row.expires_at < Date.now()) {
      return json(res, 400, { error: "验证码不正确或已过期" });
    }
    let user = db.prepare("SELECT id, phone, name FROM users WHERE phone = ?").get(phone);
    if (!user) {
      db.prepare("INSERT INTO users (phone, name, created_at) VALUES (?, ?, ?)").run(phone, name, now());
      user = db.prepare("SELECT id, phone, name FROM users WHERE phone = ?").get(phone);
    }
    const token = crypto.randomBytes(24).toString("hex");
    db.prepare("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)").run(token, user.id, now());
    db.prepare("DELETE FROM codes WHERE phone = ?").run(phone);
    return json(res, 200, { ok: true, token, user: { id: user.id, phone: user.phone, name: user.name } });
  }

  if (p === "/api/auth/me" && method === "GET") {
    const u = currentUser(req);
    return u ? json(res, 200, { ok: true, user: u }) : json(res, 401, { error: "未登录" });
  }

  if (p === "/api/auth/logout" && method === "POST") {
    const auth = String(req.headers["authorization"] || "");
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (token) db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return json(res, 200, { ok: true });
  }

  /* 下单 / 报名 */
  if (p === "/api/orders" && method === "POST") {
    const u = requireUser(req, res);
    if (!u) return;
    const body = await readBody(req);
    const ids = Array.isArray(body.courseIds) ? body.courseIds : [];
    const amount = Number(body.amount || 0);
    if (!ids.length) return json(res, 400, { error: "订单里没有课程" });
    db.prepare(
      "INSERT INTO orders (user_id, course_ids, amount, status, created_at) VALUES (?, ?, ?, 'paid', ?)"
    ).run(u.id, JSON.stringify(ids), amount, now());
    const ins = db.prepare(
      "INSERT INTO enrollments (user_id, course_id, created_at) VALUES (?, ?, ?) ON CONFLICT(user_id, course_id) DO NOTHING"
    );
    ids.forEach((id) => ins.run(u.id, String(id), now()));
    return json(res, 200, { ok: true, enrolled: ids });
  }

  if (p === "/api/enrollments" && method === "GET") {
    const u = requireUser(req, res);
    if (!u) return;
    const rows = db
      .prepare("SELECT course_id, created_at FROM enrollments WHERE user_id = ? ORDER BY created_at DESC")
      .all(u.id);
    return json(res, 200, { ok: true, courses: rows.map((r) => r.course_id) });
  }

  /* 学习进度 */
  if (p === "/api/progress" && method === "GET") {
    const u = requireUser(req, res);
    if (!u) return;
    const rows = db.prepare("SELECT course_id, lesson_id FROM progress WHERE user_id = ?").all(u.id);
    const map = {};
    rows.forEach((r) => (map[r.course_id] = map[r.course_id] || []).push(r.lesson_id));
    return json(res, 200, { ok: true, progress: map });
  }

  if (p === "/api/progress" && method === "POST") {
    const u = requireUser(req, res);
    if (!u) return;
    const body = await readBody(req);
    const courseId = body.courseId;
    const lessonId = body.lessonId;
    if (!courseId || !lessonId) return json(res, 400, { error: "缺少参数" });
    db.prepare(
      "INSERT INTO progress (user_id, course_id, lesson_id, done_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, course_id, lesson_id) DO NOTHING"
    ).run(u.id, String(courseId), String(lessonId), now());
    return json(res, 200, { ok: true });
  }

  /* 课堂笔记 */
  if (p === "/api/notes" && method === "GET") {
    const u = requireUser(req, res);
    if (!u) return;
    const rows = db
      .prepare("SELECT course_id, lesson_id, text, updated_at FROM notes WHERE user_id = ?")
      .all(u.id);
    return json(res, 200, { ok: true, notes: rows });
  }

  if (p === "/api/notes" && method === "POST") {
    const u = requireUser(req, res);
    if (!u) return;
    const body = await readBody(req);
    const courseId = body.courseId;
    const lessonId = body.lessonId;
    if (!courseId || !lessonId) return json(res, 400, { error: "缺少参数" });
    db.prepare(
      "INSERT INTO notes (user_id, course_id, lesson_id, text, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id, course_id, lesson_id) DO UPDATE SET text = excluded.text, updated_at = excluded.updated_at"
    ).run(u.id, String(courseId), String(lessonId), String(body.text || ""), now());
    return json(res, 200, { ok: true });
  }

  /* 课程评价 */
  if (p === "/api/comments" && method === "GET") {
    const courseId = url.searchParams.get("course");
    const rows = courseId
      ? db
          .prepare("SELECT name, text, stars, created_at FROM comments WHERE course_id = ? ORDER BY id DESC LIMIT 50")
          .all(courseId)
      : db.prepare("SELECT course_id, name, text, stars, created_at FROM comments ORDER BY id DESC LIMIT 50").all();
    return json(res, 200, { ok: true, comments: rows });
  }

  if (p === "/api/comments" && method === "POST") {
    const body = await readBody(req);
    const courseId = body.courseId;
    const text = String(body.text || "").trim();
    if (!courseId || !text) return json(res, 400, { error: "请填写评价内容" });
    db.prepare("INSERT INTO comments (course_id, name, text, stars, created_at) VALUES (?, ?, ?, ?, ?)").run(
      String(courseId),
      String(body.name || "匿名学员").slice(0, 20),
      text.slice(0, 500),
      Math.max(1, Math.min(5, Number(body.stars) || 5)),
      now()
    );
    return json(res, 200, { ok: true });
  }

  /* 站点统计 */
  if (p === "/api/stats" && method === "GET") {
    const g = (sql) => (db.prepare(sql).get() || {}).n || 0;
    return json(res, 200, {
      ok: true,
      students: g("SELECT COUNT(*) n FROM users"),
      enrollments: g("SELECT COUNT(*) n FROM enrollments"),
      orders: g("SELECT COUNT(*) n FROM orders"),
      revenue: g("SELECT COALESCE(SUM(amount),0) n FROM orders"),
      lessonsDone: g("SELECT COUNT(*) n FROM progress"),
      comments: g("SELECT COUNT(*) n FROM comments"),
      contentEdits: g("SELECT COUNT(*) n FROM content"),
    });
  }

  return json(res, 404, { error: "接口不存在: " + p });
}

/* ---------------- 静态文件 ---------------- */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
};

function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel === "/" || rel === "") rel = "/index.html";
  const filePath = path.join(ROOT, rel);
  if (!filePath.startsWith(ROOT)) return json(res, 403, { error: "禁止访问" });
  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      return res.end("<h1 style='font-family:sans-serif'>404 · 页面不存在</h1><p><a href='/'>返回首页</a></p>");
    }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

/* ---------------- 主服务 ---------------- */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://" + (req.headers.host || "localhost"));

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Admin-Key");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (url.pathname.startsWith("/api/")) {
    try {
      return await api(req, res, url);
    } catch (e) {
      console.error("[接口错误]", url.pathname, e.message);
      return json(res, 400, { error: e.message });
    }
  }

  if (req.method === "GET" && (url.pathname === "/" || url.pathname.endsWith(".html"))) {
    try {
      db.prepare("INSERT INTO visits (path, at) VALUES (?, ?)").run(url.pathname, now());
    } catch (e) {}
  }
  return serveStatic(req, res, url);
});

server.listen(PORT, () => {
  console.log("");
  console.log("  菁华教育网课平台 · 后端已启动");
  console.log("  -----------------------------------------");
  console.log("  网站首页：  http://localhost:" + PORT + "/");
  console.log("  接口自检：  http://localhost:" + PORT + "/api/health");
  console.log("  数据文件：  " + path.join(DATA_DIR, "jinghua.db"));
  console.log("  网页编辑密码：" + ADMIN_KEY + "   （可用环境变量 JH_ADMIN_KEY 修改）");
  console.log("  -----------------------------------------");
  console.log("  按 Ctrl + C 停止服务");
  console.log("");
});
