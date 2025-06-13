# Windows 安装脚本：安装 Java 8、Maven、Node.js 22 和 MySQL 5.7

if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "请以管理员身份运行 PowerShell"
    exit 1
}

if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Output "安装 Chocolatey..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
}

choco install -y openjdk8 maven nodejs --version=22.0.0 mysql --version=5.7

cd frontend
npm install
cd ..

Write-Output "依赖安装完成 ✅"
Write-Output "请根据 README.md 配置数据库后执行 ./start-all.sh 启动项目"

