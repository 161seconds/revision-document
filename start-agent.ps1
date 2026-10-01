param(
    [ValidateSet("codex", "antigravity", "claude")]
    [string]$Agent = "codex",

    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$AgentArgs
)

$ErrorActionPreference = 'Stop'

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  KHOI DONG AI AGENT (CODEX & ANTIGRAVITY)" -ForegroundColor Green
Write-Host "  [1] Headroom: Nen Context & Input (Wrap Proxy)   " -ForegroundColor Yellow
Write-Host "  [2] RTK:      Nen Output Lenh Terminal (Hook)   " -ForegroundColor Yellow
Write-Host "  [3] Caveman:  Nen Van Phong Phan Hoi (AGENTS.md)" -ForegroundColor Yellow
Write-Host "  [4] Ponytail: Nen Code Sinh Ra (Rules/YAGNI)    " -ForegroundColor Yellow
Write-Host "  [5] ECC:      Chuan Hoa Quy Trinh & Skills (TDD)" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

# Tat telemetry nen
$env:HEADROOM_BEACON = 'off'
$env:RTK_TELEMETRY_DISABLED = '1'

if ($Agent -eq "codex") {
    # Khoi dong Codex boc qua Headroom
    headroom wrap codex --code-memory none -- @AgentArgs
} elseif ($Agent -eq "antigravity") {
    # Bat Headroom proxy ngam cho Antigravity neu chua chay
    Write-Host "Bat Headroom proxy tren cong 8787..." -ForegroundColor Green
    headroom proxy --port 8787
} else {
    headroom wrap $Agent -- @AgentArgs
}
