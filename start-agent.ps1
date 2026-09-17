param(
    [ValidateSet("codex", "antigravity", "claude")]
    [string]$Agent = "codex",

    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$AgentArgs
)

$ErrorActionPreference = 'Stop'

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  KHỞI ĐỘNG AI AGENT (CODEX & ANTIGRAVITY)" -ForegroundColor Green
Write-Host "  [1] Headroom: Nén Context & Input (Wrap Proxy)   " -ForegroundColor Yellow
Write-Host "  [2] RTK:      Nén Output Lệnh Terminal (Hook)   " -ForegroundColor Yellow
Write-Host "  [3] Caveman:  Nén Lời Văn Phản Hồi (AGENTS.md)  " -ForegroundColor Yellow
Write-Host "  [4] Ponytail: Nén Code Sinh Ra (Rules/YAGNI)    " -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

# Tắt telemetry nền
$env:HEADROOM_BEACON = 'off'
$env:RTK_TELEMETRY_DISABLED = '1'

if ($Agent -eq "codex") {
    # Khởi động Codex bọc qua Headroom
    headroom wrap codex --code-memory none -- @AgentArgs
} elseif ($Agent -eq "antigravity") {
    # Bật Headroom proxy ngầm cho Antigravity nếu chưa chạy
    Write-Host "Bật Headroom proxy trên cổng 8787..." -ForegroundColor Green
    headroom proxy --port 8787
} else {
    headroom wrap $Agent -- @AgentArgs
}
