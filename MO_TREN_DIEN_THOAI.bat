@echo off
cd /d "%~dp0"
echo.
echo Dang mo phan mem cho dien thoai trong cung mang Wi-Fi...
echo.
echo Dia chi co the truy cap:
powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.PrefixOrigin -ne 'WellKnown' } | ForEach-Object { '  http://' + $_.IPAddress + ':4173' }"
echo.
echo Luu y:
echo - Dien thoai va may tinh phai dung cung Wi-Fi.
echo - Neu khong vao duoc, hay cho phep Node.js qua Windows Firewall.
echo - Neu Firebase bao loi domain, them IP may tinh vao Firebase Authentication ^> Settings ^> Authorized domains.
echo.
call START_APP.bat
