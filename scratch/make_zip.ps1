$sourceDir = "d:\raj-electric completed pg\New folder\main electric\client"
$zipPath = "d:\raj-electric completed pg\New folder\main electric\RAJA-ELECTRICALS-FRONTEND-HOSTINGER-FINAL.zip"

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Add-Type -AssemblyName System.IO.Compression.FileSystem
$compressionLevel = [System.IO.Compression.CompressionLevel]::Optimal
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')

$items = Get-ChildItem -Path $sourceDir -Force | Where-Object {
    $_.Name -ne 'node_modules' -and
    $_.Name -ne 'dist' -and
    $_.Name -ne '.env' -and
    $_.Name -ne '.env.local' -and
    $_.Name -ne '.env.production' -and
    $_.Name -ne '.env.development' -and
    $_.Name -ne 'test-results' -and
    $_.Name -notlike '*.zip'
}

foreach ($item in $items) {
    if ($item.PSIsContainer) {
        $dirPath = $item.FullName
        $dirName = $item.Name
        $subFiles = Get-ChildItem -Path $dirPath -Recurse -Force | Where-Object { -not $_.PSIsContainer }
        foreach ($subFile in $subFiles) {
            $relPath = $dirName + '/' + $subFile.FullName.Substring($dirPath.Length + 1).Replace('\', '/')
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $subFile.FullName, $relPath, $compressionLevel)
        }
    } else {
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $item.FullName, $item.Name, $compressionLevel)
    }
}

$zip.Dispose()
Write-Host "ZIP created successfully at $zipPath"
