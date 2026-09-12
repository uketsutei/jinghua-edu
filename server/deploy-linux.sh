#!/usr/bin/env bash
# =========================================================
# 菁华教育网课平台 · Linux 服务器一键部署脚本
# 适用：Ubuntu / Debian / CentOS / 腾讯云·阿里云轻量应用服务器
# 用法：把整个项目文件夹上传到服务器，然后执行
#     sudo bash server/deploy-linux.sh 你的编辑密码
# =========================================================
set -e

APP_DIR="${APP_DIR:-/opt/jinghua-edu}"
PORT="${PORT:-3000}"
ADMIN_KEY="${1:-${JH_ADMIN_KEY:-}}"
NODE_VER="v22.14.0"
NODE_DIST="node-${NODE_VER}-linux-x64"
NODE_MIRROR="https://npmmirror.com/mirrors/node"

if [ "$(id -u)" -ne 0 ]; then
  echo "请用 root 运行：sudo bash server/deploy-linux.sh 你的编辑密码"
  exit 1
fi

if [ -z "$ADMIN_KEY" ]; then
  echo "请提供网页编辑密码，例如："
  echo "  sudo bash server/deploy-linux.sh JinghuaEdu2026"
  exit 1
fi

SRC_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo ""
echo "==> 1/5 安装 Node.js ${NODE_VER}（走国内镜像，通常 1 分钟内）"
if [ ! -x /opt/node/bin/node ]; then
  cd /tmp
  curl -fsSL -o node.tar.xz "${NODE_MIRROR}/${NODE_VER}/${NODE_DIST}.tar.xz"
  tar -xf node.tar.xz
  rm -rf /opt/node
  mv "${NODE_DIST}" /opt/node
  ln -sf /opt/node/bin/node /usr/local/bin/node
  ln -sf /opt/node/bin/npm /usr/local/bin/npm
  rm -f node.tar.xz
else
  echo "    Node 已存在，跳过安装"
fi
echo "    Node 版本：$(node -v)"

echo "==> 2/5 复制项目到 ${APP_DIR}"
mkdir -p "${APP_DIR}"
if [ "${SRC_DIR}" != "${APP_DIR}" ]; then
  if [ -d "${APP_DIR}/server/data" ]; then
    cp -a "${APP_DIR}/server/data" /tmp/jinghua-data-backup
  fi
  rm -rf "${APP_DIR:?}/"*
  cp -a "${SRC_DIR}/." "${APP_DIR}/"
  rm -rf "${APP_DIR}/.git"
  if [ -d /tmp/jinghua-data-backup ]; then
    mkdir -p "${APP_DIR}/server/data"
    cp -a /tmp/jinghua-data-backup/. "${APP_DIR}/server/data/"
    rm -rf /tmp/jinghua-data-backup
  fi
fi

echo "==> 3/5 生成 systemd 开机自启服务"
cat > /etc/systemd/system/jinghua-edu.service <<EOF
[Unit]
Description=Jinghua Edu Online Course Platform
After=network.target

[Service]
Type=simple
WorkingDirectory=${APP_DIR}
Environment=PORT=${PORT}
Environment=JH_ADMIN_KEY=${ADMIN_KEY}
Environment=NODE_ENV=production
ExecStart=/opt/node/bin/node --experimental-sqlite server/server.js
Restart=always
RestartSec=3
StandardOutput=append:/var/log/jinghua-edu.log
StandardError=append:/var/log/jinghua-edu.log

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable jinghua-edu >/dev/null 2>&1 || true
systemctl restart jinghua-edu

echo "==> 4/5 放行端口（本机防火墙）"
if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q "Status: active"; then
  ufw allow "${PORT}/tcp" >/dev/null 2>&1 || true
  echo "    已放行 ufw ${PORT}"
elif command -v firewall-cmd >/dev/null 2>&1; then
  firewall-cmd --permanent --add-port="${PORT}/tcp" >/dev/null 2>&1 || true
  firewall-cmd --reload >/dev/null 2>&1 || true
  echo "    已放行 firewalld ${PORT}"
else
  echo "    本机防火墙未启用，跳过（云控制台的安全组仍需放行 ${PORT}）"
fi

echo "==> 5/5 等待服务启动并自检"
sleep 3
if command -v curl >/dev/null 2>&1; then
  HEALTH="$(curl -fsS "http://127.0.0.1:${PORT}/api/health" || true)"
  if [ -n "${HEALTH}" ]; then
    echo "    自检通过：${HEALTH}"
  else
    echo "    自检失败，最近日志："
    tail -n 30 /var/log/jinghua-edu.log 2>/dev/null || journalctl -u jinghua-edu -n 30 --no-pager
    exit 1
  fi
fi

IP="$(curl -fsS --max-time 5 https://ipinfo.io/ip 2>/dev/null || hostname -I | awk '{print $1}')"
echo ""
echo "========================================================="
echo "  部署完成！"
echo "---------------------------------------------------------"
echo "  网站地址：   http://${IP}:${PORT}/"
echo "  接口自检：   http://${IP}:${PORT}/api/health"
echo "  网页编辑密码：${ADMIN_KEY}"
echo "  数据文件：   ${APP_DIR}/server/data/jinghua.db"
echo "  运行日志：   /var/log/jinghua-edu.log"
echo "---------------------------------------------------------"
echo "  常用命令："
echo "    systemctl status jinghua-edu    查看状态"
echo "    systemctl restart jinghua-edu   重启"
echo "    tail -f /var/log/jinghua-edu.log 看日志"
echo "========================================================="
echo ""
echo "  注意：还需要在云厂商控制台的「防火墙 / 安全组」里"
echo "        放行 TCP ${PORT} 端口，外网才能访问。"
echo ""
