# Firecrawl Extension Uninstaller for Claude SEO (Windows)
$ErrorActionPreference = 'Stop'

Write-Host "Removing Firecrawl extension..." -ForegroundColor Yellow

$SkillDir = "$env:USERPROFILE\.claude\skills\seo-firecrawl"
$McpConfigFile = "$env:USERPROFILE\.claude.json"

if (Test-Path $SkillDir) {
    Remove-Item -Recurse -Force $SkillDir
    Write-Host "v Removed skill files" -ForegroundColor Green
}

if (Test-Path $McpConfigFile) {
    $settings = Get-Content $McpConfigFile -Raw | ConvertFrom-Json
    if ($settings.mcpServers.'firecrawl-mcp') {
        $settings.mcpServers.PSObject.Properties.Remove('firecrawl-mcp')
        # Write atomically: stage to a temp file in the same directory, then
        # swap it into place, so a crash mid-write never leaves
        # ~/.claude.json truncated or half-written (it is shared with
        # Claude Code and other installers).
        # -Depth 100 (not the ConvertTo-Json default of 2, or the previous
        # 10) so an existing ~/.claude.json with deeply nested config
        # round-trips intact.
        $TempConfigFile = Join-Path (Split-Path -Parent $McpConfigFile) ".claude.json.$([guid]::NewGuid().ToString('N')).tmp"
        $jsonText = $settings | ConvertTo-Json -Depth 100
# Write without a byte-order mark: on Windows PowerShell 5.1, Set-Content -Encoding UTF8
# emits a BOM and Node's JSON.parse rejects it, which would make ~/.claude.json unreadable.
[System.IO.File]::WriteAllText($TempConfigFile, $jsonText, (New-Object System.Text.UTF8Encoding $false))
        Move-Item -Path $TempConfigFile -Destination $McpConfigFile -Force
        Write-Host "v Removed MCP server from ~/.claude.json" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "v Firecrawl extension uninstalled." -ForegroundColor Green
Write-Host "  Core Claude SEO skills are unchanged."
