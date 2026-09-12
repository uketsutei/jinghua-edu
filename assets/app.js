/* 菁华教育网课平台 · 交互层
 * 说明：本文件负责全站的公共组件（导航、页脚、购物车、登录态、学习进度、播放器）。
 * 数据保存在浏览器本地（localStorage），刷新页面不会丢失。
 */
(function () {
  "use strict";

  const D = window.JH_DATA;
  if (!D) return;

  const STORE_KEY = "jinghua-edu-v1";

  const DEFAULT_STATE = {
    user: null,
    cart: [],
    owned: ["g-jiexi", "g-jp"],
    progress: {
      "g-jiexi": ["1-1", "1-2", "1-3", "2-1", "2-2"],
      "g-jp": ["1-1", "1-2"]
    },
    notes: {}
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
      const parsed = JSON.parse(raw);
      return Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), parsed);
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  const state = loadState();

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {
      /* 忽略隐私模式下的写入失败 */
    }
  }

  /* ---------- 小工具 ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  function esc(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  }

  const grad = (hue, deg) => `linear-gradient(${deg || 135}deg, ${hue[0]}, ${hue[1]})`;
  const yuan = (n) => "¥" + n.toLocaleString("zh-CN");

  function getCourse(id) {
    return D.courses.find((c) => c.id === id);
  }

  function progressOf(course) {
    const done = (state.progress[course.id] || []).length;
    return {
      done,
      total: course.lessons.length,
      pct: Math.round((done / course.lessons.length) * 100)
    };
  }

  function stars(rating) {
    const full = Math.round(rating);
    return "★".repeat(full) + "☆".repeat(5 - full);
  }

  /* ---------- 提示条 ---------- */
  let toastTimer = null;
  function toast(msg, ok) {
    let el = $("#toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.innerHTML = (ok === false ? "" : '<span class="ok">✓</span>') + "<span>" + esc(msg) + "</span>";
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  /* ---------- 封面片段 ---------- */
  function coverHTML(course, opts) {
    const o = opts || {};
    const badges = [];
    if (o.showBadge !== false) {
      badges.push(`<span class="pill">${esc(course.stage)} · ${esc(course.subject)}</span>`);
      if (course.hot) badges.push('<span class="pill solid">热销</span>');
      if (course.new) badges.push('<span class="pill green">新课</span>');
    }
    return `
      <div class="cover" style="background:${grad(course.hue)}">
        <div class="cover-top">${badges.join("")}</div>
        <span class="glyph">${esc(course.glyph)}</span>
        <div class="cover-bottom">
          <span class="formula">${esc(course.formula)}</span>
          <h3 class="cover-title" data-e="course.${course.id}.title">${esc(o.title || course.title)}</h3>
        </div>
      </div>`;
  }

  /* ---------- 课程卡 ---------- */
  function courseCard(course) {
    const t = D.teachers.find((x) => x.id === course.teacher);
    const off = Math.round((1 - course.price / course.original) * 100);
    return `
      <article class="course-card">
        <a href="course.html?id=${encodeURIComponent(course.id)}" aria-label="${esc(course.title)}">
          ${coverHTML(course)}
        </a>
        <div class="card-body">
          <p class="sub" data-e="course.${course.id}.sub">${esc(course.sub)}</p>
          <div class="card-meta">
            <span class="tag-mini">${course.lessonCount} 课时</span>
            <span class="tag-mini">${course.hours} 小时</span>
            <span class="tag-mini">${esc(course.level)}</span>
          </div>
          <div class="teacher-line">
            <span class="ava" style="background:${grad(t.hue)}">${esc(t.avatar)}</span>
            <span data-e="teacher.${t.id}.name">${esc(t.name)}</span>
            <span class="rate">★ ${course.rating.toFixed(1)}</span>
          </div>
          <div class="card-foot">
            <div class="price">
              <b><span class="cur" data-nofe>¥</span><span data-e="course.${course.id}.price">${course.price}</span></b>
              <s><span class="cur" data-nofe>¥</span><span data-e="course.${course.id}.old">${course.original}</span></s>
              <span class="tag-mini" style="color:#c9564f;border-color:#f6d5d2;background:#fdf4f3">${off}% OFF</span>
            </div>
          </div>
          <button class="btn btn-primary btn-sm btn-block" style="margin-top:14px" data-add="${esc(course.id)}">加入购物车</button>
        </div>
      </article>`;
  }

  /* ---------- 购物车 ---------- */
  function cartCourses() {
    return state.cart.map(getCourse).filter(Boolean);
  }

  function cartTotal() {
    return cartCourses().reduce((s, c) => s + c.price, 0);
  }

  function renderBadge() {
    $$("[data-cart-count]").forEach((el) => {
      const n = state.cart.length;
      el.textContent = n;
      el.classList.toggle("hide", n === 0);
    });
  }

  function renderCart() {
    const body = $("#cartBody");
    const foot = $("#cartFoot");
    if (!body) return;
    const items = cartCourses();
    renderBadge();

    if (!items.length) {
      body.innerHTML = `
        <div class="cart-empty">
          <div class="big">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 4h2.2l2.4 11.6h10.6L21 7.4H6.2"/><circle cx="9.5" cy="19.4" r="1.3"/><circle cx="17.5" cy="19.4" r="1.3"/></svg>
          </div>
          <b>购物车还是空的</b>
          <p style="margin-top:8px;font-size:14px">挑一门课程，开始你的学习计划</p>
          <a class="btn btn-primary" style="margin-top:20px" href="courses.html">浏览全部课程</a>
        </div>`;
      if (foot) foot.innerHTML = "";
      return;
    }

    body.innerHTML = items
      .map(
        (c) => `
      <div class="cart-item">
        <div class="ci-cover" style="background:${grad(c.hue)}">${esc(c.glyph)}</div>
        <div style="min-width:0">
          <h5>${esc(c.title)}</h5>
          <div class="ci-meta">${esc(c.teacherName)} · ${c.lessonCount} 课时</div>
          <button class="ci-del" data-del="${esc(c.id)}">移除</button>
        </div>
        <div class="ci-price">${yuan(c.price)}</div>
      </div>`
      )
      .join("");

    const total = cartTotal();
    const saved = items.reduce((s, c) => s + (c.original - c.price), 0);
    if (foot) {
      foot.innerHTML = `
        <div class="sum-row"><span>课程金额</span><span>${yuan(total + saved)}</span></div>
        <div class="sum-row"><span>限时优惠</span><span style="color:#0e7c66">-${yuan(saved)}</span></div>
        <div class="sum-row total"><span>应付合计</span><b>${yuan(total)}</b></div>
        <button class="btn btn-primary btn-block btn-lg" style="margin-top:14px" id="checkoutBtn">
          ${state.user ? "立即结算" : "登录后结算"}
        </button>
        <p class="safe" style="margin-top:12px">支持 7 天无理由退款 · 课程永久回看</p>`;
    }
  }

  function openCart() {
    renderCart();
    $("#cartDrawer").classList.add("show");
    $("#mask").classList.add("show");
  }

  function closeAll() {
    $$(".drawer").forEach((d) => d.classList.remove("show"));
    $("#mask") && $("#mask").classList.remove("show");
  }

  function addToCart(id, silent) {
    const c = getCourse(id);
    if (!c) return;
    if (state.owned.indexOf(id) > -1) {
      toast("你已拥有这门课程，可在「我的学习」中查看");
      return;
    }
    if (state.cart.indexOf(id) > -1) {
      if (!silent) {
        openCart();
        toast("该课程已在购物车中");
      }
      return;
    }
    state.cart.push(id);
    save();
    renderBadge();
    if (!silent) {
      openCart();
      toast("已加入购物车：" + c.title);
    }
  }

  function checkout() {
    if (!state.user) {
      location.href = "login.html?next=checkout";
      return;
    }
    const bought = cartCourses();
    const total = cartTotal();
    const ids = bought.map((c) => c.id);
    bought.forEach((c) => {
      if (state.owned.indexOf(c.id) === -1) state.owned.push(c.id);
    });
    state.cart = [];
    save();
    renderBadge();
    renderCart();
    closeAll();
    /* 连上后端时把订单写进服务器 */
    if (window.JH_API && JH_API.online && JH_API.token) {
      JH_API.createOrder(ids, total).catch(() => {});
    }
    toast("支付成功，已加入我的课程");
    setTimeout(() => (location.href = "learning.html?welcome=1"), 900);
  }

  /* ---------- 公共外壳 ---------- */
  const ICON_SEARCH = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>';
  const ICON_CART = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"></circle><circle cx="18" cy="20" r="1.4"></circle><path d="M2 3h2.2l2.4 12.2h12.1L21 7H5"></path></svg>';
  const ICON_USER = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="8" r="3.6"></circle><path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4S18.3 16.4 19.5 20"></path></svg>';

  const NAV_ITEMS = [
    { href: "index.html", label: "首页", key: "home" },
    { href: "courses.html", label: "课程中心", key: "courses" },
    { href: "teachers.html", label: "名师团队", key: "teachers" },
    { href: "learning.html", label: "我的学习", key: "learning" }
  ];

  function mountChrome(activeKey) {
    const navRoot = document.createElement("div");
    navRoot.innerHTML = `
      <div class="topbar">
        <div class="wrap">
          <div class="topbar-left">
            <span><i class="dot"></i> 秋季班火热招生中，新课低至 5 折</span>
            <span>客服热线 400-828-1096</span>
          </div>
          <div class="topbar-left">
            <a href="courses.html">免费试听</a>
            <a href="teachers.html">名师答疑</a>
          </div>
        </div>
      </div>
      <nav class="nav">
        <div class="wrap">
          <a class="logo" href="index.html">
            <span class="logo-mark">菁</span>
            <span class="logo-text"><b>菁华教育</b><i>JINGHUA EDU</i></span>
          </a>
          <div class="nav-links">
            ${NAV_ITEMS.map(
              (n) => `<a href="${n.href}" class="${n.key === activeKey ? "active" : ""}">${n.label}</a>`
            ).join("")}
          </div>
          <div class="nav-right">
            <form class="nav-search" id="navSearch">
              ${ICON_SEARCH}
              <input type="text" placeholder="搜索课程、老师" aria-label="搜索课程" />
            </form>
            <button class="icon-btn" id="cartBtn" aria-label="购物车">
              ${ICON_CART}<span class="badge-count hide" data-cart-count>0</span>
            </button>
            <div id="userSlot"></div>
          </div>
        </div>
      </nav>`;
    const host = $("#chromeTop");
    if (host) host.appendChild(navRoot);

    const footRoot = document.createElement("footer");
    footRoot.className = "footer";
    footRoot.innerHTML = `
      <div class="wrap">
        <div class="footer-grid">
          <div class="about">
            <div class="logo">
              <span class="logo-mark">菁</span>
              <span class="logo-text"><b>菁华教育</b><i>JINGHUA EDU</i></span>
            </div>
            <p>专注中高考与留学语言培训的在线学习平台。我们把复杂的知识拆成可执行的步骤，让每一节课都能落到分数上。</p>
          </div>
          <div>
            <h4>课程中心</h4>
            <ul>
              <li><a href="courses.html?stage=高中">高中课程</a></li>
              <li><a href="courses.html?stage=初中">初中课程</a></li>
              <li><a href="courses.html?stage=小学">小学课程</a></li>
              <li><a href="courses.html?stage=留学">留学语言</a></li>
            </ul>
          </div>
          <div>
            <h4>关于我们</h4>
            <ul>
              <li><a href="teachers.html">师资团队</a></li>
              <li><a href="learning.html">学习中心</a></li>
              <li><a href="index.html#reviews">学员评价</a></li>
              <li><a href="index.html#faq">常见问题</a></li>
            </ul>
          </div>
          <div>
            <h4>联系方式</h4>
            <ul>
              <li>电话：400-828-1096</li>
              <li>邮箱：hello@jinghua-edu.cn</li>
              <li>时间：周一至周日 9:00–21:00</li>
              <li>地址：上海市杨浦区大学路 128 号</li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 菁华教育科技（上海）有限公司 · 沪ICP备 2026000000 号</span>
          <span>本站为演示站点，课程与数据均为示例内容</span>
        </div>
      </div>`;
    if (host) host.parentNode.appendChild(footRoot);

    const overlays = document.createElement("div");
    overlays.innerHTML = `
      <div class="mask" id="mask"></div>
      <aside class="drawer" id="cartDrawer" aria-label="购物车">
        <div class="drawer-head">
          <h3>购物车</h3>
          <button class="close" id="cartClose" aria-label="关闭">✕</button>
        </div>
        <div class="drawer-body" id="cartBody"></div>
        <div class="drawer-foot" id="cartFoot"></div>
      </aside>`;
    document.body.appendChild(overlays);

    renderUser();
    renderBadge();
    renderCart();

    $("#mask").addEventListener("click", closeAll);
    $("#cartClose").addEventListener("click", closeAll);
    $("#cartBtn").addEventListener("click", openCart);
    $("#navSearch").addEventListener("submit", (e) => {
      e.preventDefault();
      const q = e.target.querySelector("input").value.trim();
      location.href = "courses.html" + (q ? "?q=" + encodeURIComponent(q) : "");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll();
    });

    document.addEventListener("click", (e) => {
      const add = e.target.closest("[data-add]");
      if (add) {
        e.preventDefault();
        addToCart(add.getAttribute("data-add"));
        return;
      }
      const del = e.target.closest("[data-del]");
      if (del) {
        e.preventDefault();
        state.cart = state.cart.filter((id) => id !== del.getAttribute("data-del"));
        save();
        renderCart();
        return;
      }
      if (e.target.closest("#checkoutBtn")) {
        e.preventDefault();
        checkout();
      }
    });
  }

  function renderUser() {
    const slot = $("#userSlot");
    if (!slot) return;
    if (state.user) {
      slot.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px">
          <a class="user-chip" href="learning.html">
            <span class="ava">${esc(state.user.name.slice(0, 1))}</span>
            <b>${esc(state.user.name)}</b>
          </a>
          <button class="btn btn-sm btn-ghost" id="logoutBtn">退出</button>
        </div>`;
      $("#logoutBtn").addEventListener("click", () => {
        state.user = null;
        save();
        renderUser();
        toast("已退出登录");
      });
    } else {
      slot.innerHTML = `
        <a class="btn btn-sm btn-outline" href="login.html">
          ${ICON_USER} 登录 / 注册
        </a>`;
    }
  }

  /* =========================================================
     页面文字编辑模式
     打开后可以直接点击页面上的文字修改，改完自动保存。
     修改保存在浏览器本地；点「导出修改文件」可以生成一份
     content-overrides.js，放进 assets 文件夹后所有人都会看到修改。
     ========================================================= */
  const LS_CONTENT = "jinghua-edu-content";
  const EDIT_TAGS = new Set([
    "H1", "H2", "H3", "H4", "H5", "H6", "P", "SPAN", "A", "BUTTON", "LI", "DIV",
    "STRONG", "B", "EM", "I", "SMALL", "LABEL", "TD", "TH", "TIME", "BLOCKQUOTE", "FIGCAPTION"
  ]);
  const EDIT_SKIP = "[data-nofe], .drawer, .mask, .edit-bar, #toast, .player-bar, .seek, .jh-edit, script, style, svg, select, option, textarea, input";

  let editing = false;
  let editSpans = [];
  let applying = false;
  let lastApplyAt = 0;
  let serverOverrides = {};

  function pageFile() {
    const p = location.pathname.split("/").pop();
    return p && p.indexOf(".html") > -1 ? p : "index.html";
  }

  function readLocal() {
    try {
      return JSON.parse(localStorage.getItem(LS_CONTENT) || "{}");
    } catch (e) {
      return {};
    }
  }

  let localEdits = readLocal();

  function writeLocal() {
    try {
      localStorage.setItem(LS_CONTENT, JSON.stringify(localEdits));
    } catch (e) {
      /* 隐私模式下忽略 */
    }
  }

  function allEdits() {
    return Object.assign({}, window.JH_OVERRIDES || {}, serverOverrides, localEdits);
  }

  /* —— 文本节点定位 —— */
  function sigChildren(node) {
    const out = [];
    for (let i = 0; i < node.childNodes.length; i++) {
      const c = node.childNodes[i];
      if (c.nodeType === 1 || (c.nodeType === 3 && c.textContent.trim())) out.push(c);
    }
    return out;
  }

  function pathOf(node) {
    const parts = [];
    let n = node;
    while (n && n !== document.body && n.parentNode && n.parentNode.nodeType === 1) {
      parts.unshift(sigChildren(n.parentNode).indexOf(n));
      n = n.parentNode;
    }
    return parts.join(".");
  }

  function resolvePath(path) {
    let n = document.body;
    const parts = String(path).split(".").map(Number);
    for (let i = 0; i < parts.length; i++) {
      n = sigChildren(n)[parts[i]];
      if (!n) return null;
    }
    return n;
  }

  function textsWithin(root) {
    const out = [];
    (function walk(n) {
      for (let i = 0; i < n.childNodes.length; i++) {
        const c = n.childNodes[i];
        if (c.nodeType === 3) {
          if (c.textContent.trim()) out.push(c);
        } else if (c.nodeType === 1) {
          walk(c);
        }
      }
    })(root);
    return out;
  }

  function dataEOwner(node) {
    let n = node.parentNode;
    while (n && n.nodeType === 1) {
      const v = n.getAttribute && n.getAttribute("data-e");
      if (v) return { el: n, key: v };
      n = n.parentNode;
    }
    return null;
  }

  function keyForTextNode(t) {
    const owner = dataEOwner(t);
    if (owner) {
      const idx = textsWithin(owner.el).indexOf(t);
      if (idx > -1) return "e:" + owner.key + ":" + idx;
    }
    return "p:" + pageFile() + ":" + pathOf(t);
  }

  function splitKey(key) {
    const kind = key.slice(0, 2);
    const rest = key.slice(2);
    if (kind === "e:") {
      const cut = rest.lastIndexOf(":");
      return { kind: "e", name: rest.slice(0, cut), idx: Number(rest.slice(cut + 1)) };
    }
    if (kind === "p:") {
      const cut = rest.indexOf(":");
      return { kind: "p", file: rest.slice(0, cut), path: rest.slice(cut + 1) };
    }
    return null;
  }

  const attrSel = (name) => '[data-e="' + String(name).replace(/["\\]/g, "\\$&") + '"]';

  function keyTargets(key) {
    const k = splitKey(key);
    if (!k) return [];
    if (k.kind === "e") return $$(attrSel(k.name));
    if (k.file !== pageFile()) return [];
    const node = resolvePath(k.path);
    return node && node.nodeType === 3 ? [node] : [];
  }

  /* —— 应用修改 —— */
  function applyOverrides() {
    if (editing) return [];
    const map = allEdits();
    const keys = Object.keys(map);
    if (!keys.length) return [];
    applying = true;
    const applied = [];
    keys.forEach((key) => {
      const k = splitKey(key);
      if (!k) return;
      const val = map[key];
      if (k.kind === "e") {
        $$(attrSel(k.name)).forEach((el) => {
          const ts = textsWithin(el);
          if (ts[k.idx]) {
            if (ts[k.idx].textContent !== val) ts[k.idx].textContent = val;
            applied.push(key);
          }
        });
      } else if (k.file === pageFile()) {
        const node = resolvePath(k.path);
        if (node && node.nodeType === 3) {
          if (node.textContent !== val) node.textContent = val;
          applied.push(key);
        }
      }
    });
    applying = false;
    lastApplyAt = Date.now();
    return applied;
  }

  /* —— 进入 / 退出编辑 —— */
  function enterEdit() {
    if (editing) return;
    editing = true;
    const found = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(t) {
        if (!t.textContent.trim()) return NodeFilter.FILTER_REJECT;
        const p = t.parentNode;
        if (!p || p.nodeType !== 1) return NodeFilter.FILTER_REJECT;
        if (!EDIT_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        if (p.isContentEditable) return NodeFilter.FILTER_REJECT;
        if (p.closest(EDIT_SKIP)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let t;
    while ((t = walker.nextNode())) found.push({ node: t, key: keyForTextNode(t) });
    found.forEach((item) => {
      const span = document.createElement("span");
      span.className = "jh-edit";
      span.setAttribute("contenteditable", "true");
      span.setAttribute("spellcheck", "false");
      span.setAttribute("data-key", item.key);
      item.node.parentNode.insertBefore(span, item.node);
      span.appendChild(item.node);
      editSpans.push(span);
    });
    document.body.classList.add("jh-editing");
    $$(".rv").forEach((el) => el.classList.add("in"));
    toast("编辑模式已打开，点击任意文字即可修改", true);
  }

  function exitEdit() {
    if (!editing) return;
    editSpans.forEach((span) => {
      const txt = document.createTextNode(span.textContent);
      if (span.parentNode) span.parentNode.replaceChild(txt, span);
    });
    editSpans = [];
    editing = false;
    document.body.classList.remove("jh-editing");
    applyOverrides();
    toast("修改已保存");
  }

  /* —— 导出 / 导入 —— */
  function download(filename, text) {
    const blob = new Blob(["\ufeff" + text], { type: "text/javascript;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1200);
  }

  function exportOverrides() {
    const data = allEdits();
    const n = Object.keys(data).length;
    if (!n) {
      toast("还没有任何修改", false);
      return;
    }
    const body =
      "/* 菁华教育网课平台 · 页面修改保存文件\n" +
      " * 共 " + n + " 处修改，生成时间：" + new Date().toLocaleString("zh-CN", { hour12: false }) + "\n" +
      " * 使用方法：把本文件放到 assets 文件夹，替换同名文件即可。\n" +
      " */\n" +
      "window.JH_OVERRIDES = " + JSON.stringify(data, null, 2) + ";\n";
    download("content-overrides.js", body);
    toast("已导出，请替换 assets 文件夹里的同名文件");
  }

  function importOverrides(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const txt = String(reader.result);
        const start = txt.indexOf("{");
        const end = txt.lastIndexOf("}");
        if (start < 0 || end < 0) throw new Error("格式不对");
        const obj = JSON.parse(txt.slice(start, end + 1));
        localEdits = Object.assign({}, localEdits, obj);
        writeLocal();
        toast("导入成功，正在刷新");
        setTimeout(() => location.reload(), 700);
      } catch (e) {
        toast("导入失败：文件格式不正确", false);
      }
    };
    reader.readAsText(file);
  }

  /* —— 发布到网站（后端 / GitHub 二选一）—— */
  async function publishEdits() {
    const data = allEdits();
    const count = Object.keys(data).length;
    if (!count) {
      toast("还没有任何修改", false);
      return;
    }
    const btn = $("#epPublish");
    const oldText = btn ? btn.textContent : "";
    if (btn) {
      btn.disabled = true;
      btn.textContent = "发布中…";
    }
    try {
      /* 情况一：连上了后端 —— 写进数据库，所有访客立刻可见 */
      if (window.JH_API && JH_API.online) {
        if (!JH_API.adminKey) {
          $("#epSettings").classList.add("open");
          toast("请先在「发布设置」里填写发布密码", false);
          return;
        }
        const r = await JH_API.putContent(data, JH_API.adminKey);
        serverOverrides = Object.assign({}, data);
        toast("已发布到服务器，共 " + r.count + " 处，所有访客刷新即可看到");
        return;
      }
      /* 情况二：纯静态托管 —— 直接提交到 GitHub，稍后自动生效 */
      const info = window.JH_API ? JH_API.githubInfo() : null;
      if (window.JH_API && info && info.hasToken) {
        const r = await JH_API.githubPublish(data);
        if (r.ok) {
          updateModeLabel();
          toast("已提交到 GitHub" + (r.commit ? "（" + r.commit + "）" : "") + "，约 1 分钟后全站生效");
        }
        else toast("发布失败：" + r.error, false);
        return;
      }
      /* 情况三：都没有 —— 退回导出文件 */
      exportOverrides();
      toast("未连接后端，已改为导出文件", false);
    } catch (e) {
      toast("发布失败：" + e.message, false);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = oldText;
      }
    }
  }

  function updateModeLabel() {
    const el = $("#epMode");
    if (!el) return;
    if (!window.JH_API) {
      el.innerHTML = '<span class="m-dot"></span>模式：本地（未加载后端脚本）';
      return;
    }
    if (!JH_API.checked) {
      el.innerHTML = '<span class="m-dot"></span>模式：正在检测后端…';
      return;
    }
    if (JH_API.online) {
      el.innerHTML =
        '<span class="m-dot ok"></span><b>已连接后端</b>　发布后所有访客立刻可见' +
        (JH_API.base ? "<span class='m-url'>" + esc(JH_API.base) + "</span>" : "");
    } else {
      const gi = JH_API.githubInfo();
      el.innerHTML =
        '<span class="m-dot warn"></span><b>未连接后端</b>　' +
        (gi.hasToken ? "发布时将通过 GitHub 更新网站" : "修改只保存在本机浏览器");
    }
  }

  function maskPhone(p) {
    return String(p || "").replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
  }

  /* —— 启动时连后端：拉内容、恢复登录态与学习记录 —— */
  async function bootCloud() {
    if (!window.JH_API) return;
    const online = await JH_API.check();
    updateModeLabel();
    if (!online) return;
    try {
      const c = await JH_API.getContent();
      serverOverrides = (c && c.overrides) || {};
    } catch (e) {}
    const me = await JH_API.me();
    if (typeof window.JH_AFTER_CLOUD === "function") window.JH_AFTER_CLOUD();
    if (!me) return;
    state.user = { id: me.id, name: me.name, phone: maskPhone(me.phone), cloud: true };
    const enrolled = await JH_API.getEnrollments();
    const pg = await JH_API.getProgress();
    /* 登录后以服务端记录为准 */
    state.owned = enrolled.slice();
    state.progress = pg;
    save();
    renderUser();
    renderBadge();
    if (typeof window.JH_AFTER_CLOUD === "function") window.JH_AFTER_CLOUD();
  }

  /* —— 工具条 —— */
  function mountEditor() {
    if ($("#editBar")) return;
    const bar = document.createElement("div");
    bar.className = "edit-bar";
    bar.id = "editBar";
    bar.innerHTML = `
      <div class="edit-panel" id="editPanel">
        <div class="ep-head">
          <b>修改页面内容</b>
          <button class="ep-close" id="epClose" aria-label="关闭">✕</button>
        </div>
        <div class="ep-mode" id="epMode"><span class="m-dot"></span>模式：正在检测…</div>
        <p class="ep-hint">点「开始编辑文字」，然后直接点页面上的文字修改。改完点「保存并发布到网站」，所有访客就都能看到。</p>
        <button class="btn btn-primary btn-block btn-sm" id="epStart">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L20 8l-4-4L4 16z"/></svg>
          开始编辑文字
        </button>
        <button class="btn btn-gold btn-block btn-sm" style="margin-top:8px" id="epPublish">保存并发布到网站</button>
        <div class="ep-row">
          <button class="btn btn-outline btn-sm" id="epUndoPage">撤销本页</button>
          <button class="btn btn-outline btn-sm" id="epUndoAll">撤销全部</button>
        </div>
        <div class="ep-row">
          <button class="btn btn-outline btn-sm" id="epExport">导出修改</button>
          <button class="btn btn-outline btn-sm" id="epImportBtn">导入修改</button>
        </div>
        <input type="file" id="epImport" accept=".js,.json" hidden />
        <button class="ep-toggle" id="epSettingsBtn">发布设置<span class="caret">▾</span></button>
        <div class="ep-settings" id="epSettings">
          <label>后端地址（留空表示用当前站点）</label>
          <input type="text" id="epApiBase" placeholder="例如 http://localhost:3000" />
          <label>发布密码</label>
          <input type="password" id="epAdminKey" placeholder="默认 jinghua2026" />
          <label>GitHub 令牌（纯静态托管时用于自动上线）</label>
          <input type="password" id="epGhToken" placeholder="github_pat_..." />
          <div class="ep-two">
            <input type="text" id="epGhOwner" placeholder="用户名" />
            <input type="text" id="epGhRepo" placeholder="仓库名" />
          </div>
          <button class="btn btn-primary btn-sm btn-block" id="epSaveSettings">保存设置</button>
          <button class="btn btn-outline btn-sm btn-block" id="epTestConn">测试后端连接</button>
          <p class="ep-note">没接后端时，用 GitHub 令牌可以让静态网站也做到「改完即上线」。</p>
        </div>
      </div>
      <button class="edit-fab" id="editFab" title="修改页面内容">
        <span class="fab-ico">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L20 8l-4-4L4 16z"/></svg>
        </span>
        <span class="fab-txt">修改内容</span>
      </button>`;
    document.body.appendChild(bar);

    const panel = $("#editPanel");
    $("#editFab").addEventListener("click", (e) => {
      e.stopPropagation();
      if (editing) {
        exitEdit();
        return;
      }
      bar.classList.toggle("open");
      if (bar.classList.contains("open")) updateModeLabel();
    });
    $("#epClose").addEventListener("click", () => bar.classList.remove("open"));
    $("#epStart").addEventListener("click", () => {
      bar.classList.remove("open");
      enterEdit();
    });
    $("#epUndoPage").addEventListener("click", () => {
      const here = applyOverrides();
      const own = Object.keys(localEdits).filter(
        (k) => here.indexOf(k) > -1 || k.indexOf("p:" + pageFile() + ":") === 0
      );
      if (!own.length) {
        toast("本页没有修改", false);
        return;
      }
      own.forEach((k) => delete localEdits[k]);
      writeLocal();
      location.reload();
    });
    $("#epUndoAll").addEventListener("click", () => {
      if (!Object.keys(localEdits).length) {
        toast("还没有任何修改", false);
        return;
      }
      localEdits = {};
      writeLocal();
      location.reload();
    });
    $("#epExport").addEventListener("click", exportOverrides);
    $("#epPublish").addEventListener("click", publishEdits);
    $("#epImportBtn").addEventListener("click", () => $("#epImport").click());
    $("#epImport").addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) importOverrides(e.target.files[0]);
    });
    $("#epSettingsBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      $("#epSettings").classList.toggle("open");
    });
    if (window.JH_API) {
      $("#epApiBase").value = JH_API.base || "";
      $("#epAdminKey").value = JH_API.adminKey || "";
      const gi = JH_API.githubInfo();
      $("#epGhOwner").value = gi.owner;
      $("#epGhRepo").value = gi.repo;
    }
    $("#epSaveSettings").addEventListener("click", async () => {
      if (!window.JH_API) return;
      JH_API.setBase($("#epApiBase").value);
      JH_API.setAdminKey($("#epAdminKey").value.trim());
      JH_API.setGithub($("#epGhOwner").value.trim(), $("#epGhRepo").value.trim(), $("#epGhToken").value.trim());
      toast("设置已保存，正在重新检测连接");
      JH_API.checked = false;
      updateModeLabel();
      const online = await JH_API.check();
      if (online) {
        try {
          const c = await JH_API.getContent();
          serverOverrides = (c && c.overrides) || {};
          applyOverrides();
        } catch (e) {}
      }
      updateModeLabel();
    });
    $("#epTestConn").addEventListener("click", async () => {
      if (!window.JH_API) return false;
      JH_API.setBase($("#epApiBase").value);
      toast("正在测试连接…");
      const online = await JH_API.check();
      updateModeLabel();
      toast(online ? "后端连接正常" : "连不上后端：" + (JH_API.lastError || "未知原因"), online ? true : false);
    });
    document.addEventListener("click", (e) => {
      if (!bar.classList.contains("open")) return;
      if (!e.target.closest("#editBar")) bar.classList.remove("open");
    });
  }

  /* —— 编辑态下的交互拦截 —— */
  document.addEventListener(
    "click",
    (e) => {
      if (!editing) return;
      const a = e.target.closest("a");
      if (a) e.preventDefault();
      if (e.target.closest("[data-add], #cartBtn, #checkoutBtn, .big-play, #sorts button, .chip, .tabs button, .chapter-head, .lesson-row, [data-live]")) {
        e.stopPropagation();
      }
    },
    true
  );

  document.addEventListener("input", (e) => {
    const el = e.target;
    if (!el || !el.classList || !el.classList.contains("jh-edit")) return;
    localEdits[el.getAttribute("data-key")] = el.textContent;
    writeLocal();
  });

  document.addEventListener("keydown", (e) => {
    if (editing && e.key === "Enter" && e.target.classList && e.target.classList.contains("jh-edit")) {
      e.preventDefault();
      e.target.blur();
    }
    if (editing && e.key === "Escape") exitEdit();
  });

  window.addEventListener("load", async () => {
    mountEditor();
    await bootCloud();
    applyOverrides();
    mountReveal();
    const obs = new MutationObserver(() => {
      if (applying || editing) return;
      if (Date.now() - lastApplyAt < 200) return;
      setTimeout(applyOverrides, 60);
    });
    obs.observe(document.body, { childList: true, subtree: true });
  });

  /* —— 滚动入场：内容轻轻浮起 —— */
  function mountReveal() {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = $$(
      ".sec-head, .cat-card, .course-card, .teacher-card, .review-card, .live-card, .learn-item, .guarantee"
    );
    if (!targets.length) return;
    const io = new IntersectionObserver(
      (entries, ob) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            ob.unobserve(en.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -36px 0px" }
    );
    targets.forEach((el, i) => {
      if (el.classList.contains("rv")) return;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
        el.classList.add("rv", "in");
        return;
      }
      el.classList.add("rv");
      el.style.transitionDelay = (i % 5) * 70 + "ms";
      io.observe(el);
    });
    /* 双保险：滚动时补齐 + 3 秒后一律显示，确保任何情况下都不会出现空白 */
    let scrollTimer = null;
    const revealVisible = () => {
      $$(".rv:not(.in)").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.96) el.classList.add("in");
      });
    };
    window.addEventListener(
      "scroll",
      () => {
        if (scrollTimer) return;
        scrollTimer = setTimeout(() => {
          scrollTimer = null;
          revealVisible();
        }, 100);
      },
      { passive: true }
    );
    setTimeout(() => $$(".rv").forEach((el) => el.classList.add("in")), 3000);
  }

  /* ---------- 全局暴露 ---------- */
  window.JH = {
    state,
    save,
    $,
    $$,
    esc,
    grad,
    yuan,
    toast,
    getCourse,
    progressOf,
    stars,
    coverHTML,
    courseCard,
    addToCart,
    openCart,
    closeAll,
    renderCart,
    renderBadge,
    renderUser,
    mountChrome,
    checkout,
    applyOverrides,
    enterEdit,
    exitEdit,
    exportOverrides
  };
})();
