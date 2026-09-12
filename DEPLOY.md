# 把后端放到公网 · 部署指南

后端起在你自己电脑上，只有你能访问。要让别人也能用（登录、下单、看进度），
需要把它放到一台 24 小时开机的服务器上。下面三种方式，**推荐从方式一开始**。

---

## 方式一：Render 一键部署（免费，最省事，约 3 分钟）

### 步骤

1. 打开这个链接：

   **https://render.com/deploy?repo=https://github.com/uketsutei/jinghua-edu**

2. 点 **Sign in with GitHub**（用你已有的 GitHub 账号授权，不用另外注册）

3. 页面会自动读取仓库里的 `render.yaml`，把所有配置填好。
   只需要在 `JH_ADMIN_KEY` 那一栏填一个**你自己想的编辑密码**（别用默认的）

4. 点 **Apply / Deploy**，等 2～3 分钟构建完成

5. 部署成功后你会拿到一个网址，形如：

   `https://jinghua-edu-xxxx.onrender.com`

6. 打开这个网址，应该能看到完整网站；再打开
   `https://你的地址/api/health`，显示 `{"ok":true,...}` 就说明后端活了

### 接到你的线上网站

打开 https://uketsutei.github.io/jinghua-edu/ → 右下角「✏️ 修改内容」→「发布设置」→
在**后端地址**里填 `https://jinghua-edu-xxxx.onrender.com` → 保存。

之后编辑内容点「保存并发布到网站」就会**立刻**对所有访客生效。

### 免费版的三个注意事项

| 事项 | 说明 |
| --- | --- |
| 会自动休眠 | 15 分钟没人访问会睡，下一个人打开要等约 30 秒唤醒 |
| 数据不持久 | 免费实例重装/重启后，数据库会被重置（页面内容因为存在 GitHub 上不受影响，丢的是用户和订单数据） |
| 服务器在新加坡 | 国内访问速度一般，做演示够用 |

> 想正式招生收费，建议用方式二，数据不会丢、国内访问也快。

---

## 方式二：国内云服务器（推荐用于正式运营）

腾讯云、阿里云的「轻量应用服务器」最低约 ¥60～100/年，国内访问快，数据永久保存。

1. 买一台最便宜的轻量服务器，系统选 **Ubuntu 22.04**
2. 在服务器的防火墙里放行 **3000** 端口（或之后用 Nginx 转到 80）
3. 把整个项目文件夹上传上去（或用 `git clone`）
4. 装 Node：

   ```
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

5. 启动（用 nohup 让它后台常驻）：

   ```
   cd 项目目录
   JH_ADMIN_KEY=你的密码 PORT=3000 nohup node server/server.js > jinghua.log 2>&1 &
   ```

6. 访问 `http://服务器IP:3000/` 即可

想要更正规（用域名 + https），可以再配一层 Nginx 反向代理，需要的话告诉我。

---

## 方式三：Railway / Fly.io

项目里已经有 `Dockerfile`，这两个平台都能直接识别：

- **Railway**：https://railway.app → New Project → Deploy from GitHub repo → 选 `jinghua-edu`
- **Fly.io**：装好 flyctl 后，在项目目录执行 `fly launch` 即可

环境变量记得设置 `JH_ADMIN_KEY`。

---

## 部署完的检查清单

1. `https://你的地址/api/health` 返回 `{"ok":true,...}`
2. 打开网站首页，右下角「修改内容」面板顶部显示 **已连接后端**
3. 用手机号 + 验证码登录 → 能看到「我的学习」
4. 买一门课 → 订单写进数据库（`/api/stats` 里 orders 数字会涨）
5. 改一处文字 → 点「保存并发布到网站」→ 换一台设备刷新确认能看到

## 安全提醒

- **一定要改掉默认编辑密码**（默认 `jinghua2026`），通过环境变量 `JH_ADMIN_KEY` 设置
- 验证码目前是演示模式：接口会把验证码直接返回给前端，方便你测试。
  正式上线前要接真实短信服务（阿里云短信 / 腾讯云短信），否则任何人都能注册
- 数据库文件在 `server/data/jinghua.db`，定期把它下载下来备份
