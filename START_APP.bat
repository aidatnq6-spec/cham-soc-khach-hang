@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Dang cai thu vien...
  call npm.cmd ci
  if errorlevel 1 goto error
)
echo Mo trinh duyet tai http://localhost:4173 sau khi hien Ready.
call npm.cmd run dev
if errorlevel 1 goto error
exit /b 0
:error
echo Khong khoi dong duoc. Kiem tra Node.js va file .env.local. Xem README.md.
pause
exit /b 1
