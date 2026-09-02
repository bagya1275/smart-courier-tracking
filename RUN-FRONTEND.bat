@echo off
cd /d "%~dp0frontend"
echo Opening Smart Courier frontend on http://localhost:3000
python -m http.server 3000
