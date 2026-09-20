# DNS Fix Script - Run as Administrator
# This script tests DNS and optionally changes to Google DNS

Write-Host "DNS Troubleshooting Script`n" -ForegroundColor Cyan

# Test current DNS
Write-Host "1. Testing DNS resolution with current settings..." -ForegroundColor Yellow
try {
    $result = Resolve-DnsName -Name "uroyxgafjijzfdsacta.supabase.co" -ErrorAction Stop
    Write-Host "✓ DNS resolution successful!" -ForegroundColor Green
    Write-Host "  IP Address: $($result.IPAddress)"
    exit 0
} catch {
    Write-Host "✗ DNS resolution failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. This could be caused by:" -ForegroundColor Yellow
Write-Host "   • ISP DNS blocking"
Write-Host "   • Firewall/Antivirus blocking"
Write-Host "   • Corporate proxy/network restrictions"
Write-Host "   • Network connectivity issues"

Write-Host "`n3. Quick fixes to try:" -ForegroundColor Yellow
Write-Host "   a) Restart your router/modem"
Write-Host "   b) Disable Windows Defender temporarily"
Write-Host "   c) Check if you're behind a corporate firewall"
Write-Host "   d) Try mobile hotspot to test connectivity"

Write-Host "`n4. Would you like to change DNS to Google's (8.8.8.8)?" -ForegroundColor Cyan
Write-Host "   Note: This requires Administrator privileges`n"

$response = Read-Host "Change DNS to Google? (y/n)"
if ($response -eq 'y') {
    Write-Host "Changing DNS servers..." -ForegroundColor Yellow
    $interfaces = Get-NetAdapter -Physical | Where-Object {$_.Status -eq "Up"}

    foreach ($interface in $interfaces) {
        Write-Host "  Setting DNS for: $($interface.Name)"
        Set-DnsClientServerAddress -InterfaceIndex $interface.InterfaceIndex `
            -ServerAddresses ("8.8.8.8", "8.8.4.4") -ErrorAction Continue
    }

    Write-Host "✓ DNS changed to Google (8.8.8.8, 8.8.4.4)" -ForegroundColor Green

    Write-Host "`nTesting DNS again..." -ForegroundColor Yellow
    try {
        $result = Resolve-DnsName -Name "uroyxgafjijzfdsacta.supabase.co" -ErrorAction Stop
        Write-Host "✓ DNS resolution now works!" -ForegroundColor Green
        Write-Host "  IP Address: $($result.IPAddress)"
    } catch {
        Write-Host "✗ Still failing even with Google DNS" -ForegroundColor Red
        Write-Host "  This suggests a firewall or antivirus blocking issue"
    }
}

Read-Host "`nPress Enter to exit"
