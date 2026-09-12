/* =========================================================
   菁华教育网课平台 · 后端对接层
   ---------------------------------------------------------
   页面会自动探测后端：
     · 探测到后端（/api/health 正常）→ 内容、登录、订单、进度、笔记全部走服务端
     · 没探测到（例如纯静态托管）→ 自动退回浏览器本地存储，功能不中断
   后端地址可在网页右下角「修改内容 → 发布设置」里填写。
   ========================================================= */
(function () {
  "use strict";

  const TOKEN_KEY = "jinghua-edu-token";
  const ADMIN_KEY = "jinghua-edu-admin-key";
  const BASE_KEY = "jinghua-edu-api-base";

  function ls(key) {
    try {
      return localStorage.getItem(key) || "";
    } catch (e) {
      return "";
    }
  }
  function lsSet(key, val) {
    try {
      if (val) localStorage.setItem(key, val);
      else localStorage.removeItem(key);
    } catch (e) {}
  }

  const api = {
    online: false,
    checked: false,
    lastError: "",

    get base() {
      return (ls(BASE_KEY) || window.JH_API_BASE || "").replace(/\/+$/, "");
    },
    setBase(v) {
      lsSet(BASE_KEY, String(v || "").trim().replace(/\/+$/, ""));
    },
    get token() {
      return ls(TOKEN_KEY);
    },
    setToken(v) {
      lsSet(TOKEN_KEY, v);
    },
    get adminKey() {
      return ls(ADMIN_KEY);
    },
    setAdminKey(v) {
      lsSet(ADMIN_KEY, v);
    },

    async request(path, options) {
      const opts = options || {};
      const headers = Object.assign({}, opts.headers || {});
      if (opts.body !== undefined && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
      if (this.token && !headers["Authorization"]) {
        headers["Authorization"] = "Bearer " + this.token;
      }
      const res = await fetch(this.base + path, {
        method: opts.method || "GET",
        headers: headers,
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
        cache: "no-store",
      });
      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        data = { error: "服务端返回了无法解析的内容（HTTP " + res.status + "）" };
      }
      if (!res.ok) {
        const err = new Error((data && data.error) || "请求失败 HTTP " + res.status);
        err.status = res.status;
        err.data = data;
        throw err;
      }
      return data;
    },

    /* 探测后端是否在线 */
    async check(timeoutMs) {
      const ctrl = typeof AbortController === "function" ? new AbortController() : null;
      const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs || 3500) : null;
      try {
        const res = await fetch(this.base + "/api/health", {
          cache: "no-store",
          signal: ctrl ? ctrl.signal : undefined,
        });
        const data = res.ok ? await res.json() : null;
        this.online = !!(res.ok && data && data.ok);
        this.lastError = this.online ? "" : "HTTP " + res.status;
      } catch (e) {
        this.online = false;
        this.lastError = e.name === "AbortError" ? "连接超时" : e.message;
      } finally {
        if (timer) clearTimeout(timer);
        this.checked = true;
      }
      return this.online;
    },

    /* 站点内容 */
    getContent() {
      return this.request("/api/content");
    },
    putContent(overrides, adminKey) {
      return this.request("/api/content", {
        method: "PUT",
        headers: { "X-Admin-Key": adminKey || this.adminKey },
        body: { overrides: overrides },
      });
    },

    /* 登录 */
    sendCode(phone) {
      return this.request("/api/auth/code", { method: "POST", body: { phone: phone } });
    },
    async login(phone, code, name) {
      const r = await this.request("/api/auth/login", {
        method: "POST",
        body: { phone: phone, code: code, name: name },
      });
      if (r.token) this.setToken(r.token);
      return r;
    },
    async logout() {
      try {
        await this.request("/api/auth/logout", { method: "POST" });
      } catch (e) {}
      this.setToken("");
    },
    async me() {
      if (!this.token) return null;
      try {
        const r = await this.request("/api/auth/me");
        return r.user || null;
      } catch (e) {
        if (e.status === 401) this.setToken("");
        return null;
      }
    },

    /* 订单 / 报名 / 进度 / 笔记 / 评价 */
    createOrder(courseIds, amount) {
      return this.request("/api/orders", { method: "POST", body: { courseIds: courseIds, amount: amount } });
    },
    async getEnrollments() {
      try {
        const r = await this.request("/api/enrollments");
        return r.courses || [];
      } catch (e) {
        return [];
      }
    },
    async getProgress() {
      try {
        const r = await this.request("/api/progress");
        return r.progress || {};
      } catch (e) {
        return {};
      }
    },
    postProgress(courseId, lessonId) {
      return this.request("/api/progress", { method: "POST", body: { courseId: courseId, lessonId: lessonId } });
    },
    async getNotes() {
      try {
        const r = await this.request("/api/notes");
        return r.notes || [];
      } catch (e) {
        return [];
      }
    },
    postNote(courseId, lessonId, text) {
      return this.request("/api/notes", {
        method: "POST",
        body: { courseId: courseId, lessonId: lessonId, text: text },
      });
    },
    async getComments(courseId) {
      try {
        const r = await this.request("/api/comments?course=" + encodeURIComponent(courseId));
        return r.comments || [];
      } catch (e) {
        return [];
      }
    },
    postComment(courseId, name, text, stars) {
      return this.request("/api/comments", {
        method: "POST",
        body: { courseId: courseId, name: name, text: text, stars: stars },
      });
    },
    getStats() {
      return this.request("/api/stats");
    },
  };

  /* ---------- 直传 GitHub：让静态托管的网站也能「改完即上线」 ---------- */
  const GH_OWNER = "uketsutei";
  const GH_REPO = "jinghua-edu";
  const GH_FILE = "assets/content-overrides.js";

  function utf8ToBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin);
  }

  api.githubPublish = async function (overrides, opts) {
    const o = opts || {};
    const owner = o.owner || ls("jinghua-edu-gh-owner") || GH_OWNER;
    const repo = o.repo || ls("jinghua-edu-gh-repo") || GH_REPO;
    const token = o.token || ls("jinghua-edu-gh-token");
    if (!token) return { ok: false, error: "还没有填写 GitHub 令牌" };
    const apiUrl = "https://api.github.com/repos/" + owner + "/" + repo + "/contents/" + GH_FILE;
    const headers = {
      Authorization: "token " + token,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    };
    let sha = null;
    try {
      const g = await fetch(apiUrl + "?ref=main", { headers: headers, cache: "no-store" });
      if (g.ok) sha = (await g.json()).sha;
    } catch (e) {}
    const text =
      "/* 菁华教育网课平台 · 内容修改文件（由网页端自动生成）\n" +
      " * 生成时间：" + new Date().toLocaleString("zh-CN", { hour12: false }) + "\n" +
      " * 共 " + Object.keys(overrides).length + " 处修改\n" +
      " */\n" +
      "window.JH_OVERRIDES = " + JSON.stringify(overrides, null, 2) + ";\n";
    const body = {
      message: "网页端更新内容（" + Object.keys(overrides).length + " 处）",
      content: utf8ToBase64(text),
      branch: "main",
    };
    if (sha) body.sha = sha;
    try {
      const p = await fetch(apiUrl, { method: "PUT", headers: headers, body: JSON.stringify(body) });
      const d = await p.json().catch(() => ({}));
      if (!p.ok) return { ok: false, error: d.message || "GitHub 返回 HTTP " + p.status };
      return { ok: true, commit: d.commit && d.commit.sha ? d.commit.sha.slice(0, 7) : "" };
    } catch (e) {
      return { ok: false, error: "网络错误：" + e.message };
    }
  };

  api.setGithub = function (owner, repo, token) {
    lsSet("jinghua-edu-gh-owner", owner);
    lsSet("jinghua-edu-gh-repo", repo);
    lsSet("jinghua-edu-gh-token", token);
  };
  api.githubInfo = function () {
    return {
      owner: ls("jinghua-edu-gh-owner") || GH_OWNER,
      repo: ls("jinghua-edu-gh-repo") || GH_REPO,
      hasToken: !!ls("jinghua-edu-gh-token"),
    };
  };

  window.JH_API = api;
})();
