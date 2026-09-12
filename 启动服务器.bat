@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo   正在启动菁华教育网课平台...
echo.
start "" http://localhost:3000/
node server\server.js
pause
