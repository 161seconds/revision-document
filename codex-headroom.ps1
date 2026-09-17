param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $CodexArgs
)

$ErrorActionPreference = 'Stop'
$env:HEADROOM_BEACON = 'off'
headroom wrap codex --code-memory none -- @CodexArgs
