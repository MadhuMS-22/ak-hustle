Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Hustel Competition - Reset & Test" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting data reset and servers..." -ForegroundColor Yellow
Write-Host ""

# Start the Node.js script
node reset-and-test.js

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
