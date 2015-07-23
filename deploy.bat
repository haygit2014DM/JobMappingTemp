PowerShell.exe -Command "& {Start-Process PowerShell.exe -ArgumentList '-ExecutionPolicy Bypass -NoExit -File "scripts/PowerShell/deploy.ps1" %*' -Verb RunAs}"
PAUSE