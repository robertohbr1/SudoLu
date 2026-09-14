@echo off
setlocal
title SudoLu - Sudoku para PC
cd /d "%~dp0"

:: Verifica se o servidor SudoLu ja esta ativo na porta 5173
curl -s -m 1 http://localhost:5173 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ===================================================
    echo    SudoLu ja esta em execucao!
    echo    Abrindo a janela no navegador padrao...
    echo ===================================================
    start http://localhost:5173
    timeout /t 2 >nul
    exit /b 0
)

echo ===================================================
echo             Iniciando o SudoLu...
echo ===================================================
echo.
echo  O servidor local esta sendo iniciado.
echo  O seu navegador padrao sera aberto automaticamente
echo  em http://localhost:5173 em instantes.
echo.
echo  Para fechar o jogo, encerre esta janela.
echo ===================================================
echo.

npm run dev -- --open
