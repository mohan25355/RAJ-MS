$zipPath = "d:\raj-electric completed pg\New folder\main electric\RAJA-ELECTRICALS-FRONTEND-HOSTINGER-FINAL.zip"
$testDir = "d:\raj-electric completed pg\New folder\main electric\scratch\test_extract"

if (Test-Path $testDir) { Remove-Item -Recurse -Force $testDir }
New-Item -ItemType Directory -Path $testDir | Out-Null

Expand-Archive -Path $zipPath -DestinationPath $testDir

Write-Host "=== FIRST-LEVEL ZIP CONTENTS ==="
Get-ChildItem -Path $testDir | Format-Table Name, Length, Mode

Write-Host "=== CHECKING REQUIRED VITE FILES AT ROOT ==="
$reqFiles = @("package.json", "vite.config.js", "index.html", "src", "public")
foreach ($f in $reqFiles) {
    $p = Join-Path $testDir $f
    if (Test-Path $p) {
        Write-Host "FOUND REQUIRED: $f"
    } else {
        Write-Host "MISSING REQUIRED: $f"
    }
}

Write-Host "=== CHECKING FOR FORBIDDEN ITEMS ==="
$forbiddenNames = @(".env", "node_modules", "dist", "client", ".git")
foreach ($fn in $forbiddenNames) {
    $p = Join-Path $testDir $fn
    if (Test-Path $p) {
        Write-Host "FORBIDDEN ITEM PRESENT: $fn"
    } else {
        Write-Host "OK (Absent): $fn"
    }
}
