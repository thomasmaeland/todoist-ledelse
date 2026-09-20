@echo off
echo Stopping Node.js processes...
taskkill /F /IM node.exe 2>nul

echo Clearing .next cache...
if exist .next (
  rmdir /S /Q .next
  echo ✓ Cache cleared
)

echo.
echo Reinstalling dependencies...
call npm install

echo.
echo Starting dev server...
call npm run dev

pause
