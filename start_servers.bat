@echo off
echo Starting npm dev server...
start "npm-dev" cmd /c "npm run dev"
echo Starting Python server...
start "py-server" cmd /c "python server/app.py"
echo All servers started. Close this window to stop.
pause
