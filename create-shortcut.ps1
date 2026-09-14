$wsh = New-Object -ComObject WScript.Shell

# Obter diretórios da Área de Trabalho
$desktopPaths = @(
    [Environment]::GetFolderPath("Desktop"),
    "$env:USERPROFILE\OneDrive\Área de Trabalho",
    "$env:USERPROFILE\Desktop"
) | Select-Object -Unique | Where-Object { Test-Path $_ }

$projectDir = "c:\Projetos\SudoLu"
$targetBat = "$projectDir\iniciar-sudolu.bat"
$iconPath = "$projectDir\sudolu.ico"

foreach ($desktop in $desktopPaths) {
    $shortcutPath = Join-Path $desktop "SudoLu.lnk"
    $shortcut = $wsh.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $targetBat
    $shortcut.WorkingDirectory = $projectDir
    $shortcut.Description = "SudoLu - Sudoku para PC"
    $shortcut.IconLocation = "$iconPath,0"
    $shortcut.Save()
    Write-Output "Atalho criado com sucesso em: $shortcutPath"
}
