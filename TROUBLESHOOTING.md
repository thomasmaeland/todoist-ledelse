# DNS Resolution Error - Troubleshooting Guide

## Problem
Your Next.js dev server cannot connect to Supabase:
```
Error: getaddrinfo ENOTFOUND uroyxgafjijzfdsacta.supabase.co
```

This means Node.js cannot resolve the Supabase domain name to an IP address.

## Root Causes (in order of likelihood)

### 1. **Firewall or Antivirus Blocking** (Most Common)
Your Windows Defender, antivirus, or firewall is blocking outbound HTTPS connections to Supabase.

**Quick Fix:**
- Temporarily disable Windows Defender
- Or check your antivirus whitelist settings
- Or check Windows Firewall → Outbound Rules

### 2. **ISP DNS Not Working Properly**
Your internet service provider's DNS servers aren't resolving Supabase's domain.

**Quick Fix:**
- Run: `fix-dns.ps1` (requires Admin - right-click PowerShell and "Run as Administrator")
- This changes DNS to Google's public DNS (8.8.8.8)

### 3. **Corporate/Network Proxy**
If on a corporate network or with network restrictions:
- Your network may require a proxy to connect to external services
- Check with your IT department

### 4. **Network Connectivity Issue**
Your internet connection may be unstable.

**Quick Fix:**
- Try your phone's hotspot to test if it's your network
- Restart your router/modem

## Step-by-Step Solutions

### Solution 1: Restart Dev Server (Quickest)
1. Close VS Code completely
2. Right-click `restart-dev-server.bat` → Run as Administrator
3. Wait for it to install dependencies and start dev server

### Solution 2: Change DNS to Google (Recommended)
1. Right-click PowerShell → "Run as Administrator"
2. Copy and run this one line:
   ```powershell
   Set-DnsClientServerAddress -InterfaceIndex (Get-NetAdapter -Physical | Where-Object {$_.Status -eq "Up"} | Select-Object -First 1).InterfaceIndex -ServerAddresses ("8.8.8.8", "8.8.4.4")
   ```
3. Wait 30 seconds
4. Restart your dev server

### Solution 3: Temporarily Disable Windows Defender
1. Windows Key → "Windows Security"
2. Click "Virus & threat protection"
3. Click "Manage settings"
4. Toggle "Real-time protection" OFF
5. Restart dev server
6. If it works, re-enable after testing

### Solution 4: Check Firewall
1. Windows Key → "Windows Defender Firewall"
2. Click "Allow an app through firewall"
3. Look for Node.js or npm
4. If not listed, click "Allow another app" and browse to `C:\Program Files\nodejs\node.exe`
5. Make sure it's allowed on both Private and Public networks

### Solution 5: Run Network Diagnostic
```bash
cd C:\Users\thoma\todoist-ledelse
node network-diagnostic.js
```

This will test:
- DNS resolution
- Alternative DNS servers
- HTTPS connectivity
- And suggest what's actually blocking

## Testing Success

Once fixed, you should see:
```
✓ DNS resolution successful: [ '1.2.3.4' ]
✓ HTTPS connection successful (status: 404)
```

The 404 is expected (Supabase root returns 404) - we just need the connection to work.

## If Still Not Working

1. **Try a different network** (mobile hotspot, cafe WiFi)
   - If it works elsewhere, it's your ISP/network/firewall
   
2. **Restart your computer**
   - Sometimes DNS cache gets stuck

3. **Contact your ISP**
   - If it works on mobile but not home internet

4. **Check Supabase status**
   - Visit status.supabase.com to verify the service is up

## Environment Variables Location
Your Supabase credentials are in: `.env.local`
- If you modify this file, restart the dev server for changes to take effect

## Still Stuck?

The `network-diagnostic.js` script will pinpoint exactly what's blocking the connection.
