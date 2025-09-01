@echo off
echo 🚀 INICIANDO MONGODB PARA CYNETH
echo.

REM Buscar MongoDB en ubicaciones comunes
set MONGO_PATH=""
if exist "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" set MONGO_PATH="C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
if exist "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" set MONGO_PATH="C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
if exist "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" set MONGO_PATH="C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe"

if %MONGO_PATH%=="" (
    echo ❌ MongoDB no encontrado en ubicaciones comunes
    echo.
    echo 💡 Instala MongoDB desde: https://www.mongodb.com/try/download/community
    echo    O ejecuta manualmente: mongod --dbpath ./data
    pause
    exit /b 1
)

echo 📂 Creando directorio de datos...
if not exist "data" mkdir data

echo 🔌 Iniciando MongoDB...
echo    - Ejecutable: %MONGO_PATH%
echo    - Puerto: 27017
echo    - Datos: ./data
echo.
echo ⚠️  Deja esta ventana abierta mientras usas la aplicación
echo.

%MONGO_PATH% --dbpath ./data --port 27017


