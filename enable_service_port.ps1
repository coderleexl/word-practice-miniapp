# PowerShell script to enable WeChat Developer Tools service port
# Uses Windows UI Automation

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName Microsoft.VisualBasic

# Wait for WeChat DevTools to start
Start-Sleep -Seconds 3

# Find WeChat DevTools window
$process = Get-Process -Name "微信开发者工具" -ErrorAction SilentlyContinue
if (-not $process) {
    $process = Get-Process -Name "wechat_devtools" -ErrorAction SilentlyContinue
}

if ($process) {
    Write-Host "Found WeChat DevTools process: $($process.ProcessName)"

    # Bring window to front
    $hwnd = $process.MainWindowHandle
    if ($hwnd) {
        Add-Type @"
            using System;
            using System.Runtime.InteropServices;
            public class Win32 {
                [DllImport("user32.dll")]
                public static extern bool SetForegroundWindow(IntPtr hWnd);
                [DllImport("user32.dll")]
                public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
            }
"@
        [Win32]::ShowWindow($hwnd, 9) # SW_RESTORE
        [Win32]::SetForegroundWindow($hwnd)
        Start-Sleep -Seconds 1

        # Use keyboard shortcut to open settings
        # Send Alt+S to open Settings menu
        [System.Windows.Forms.SendKeys]::SendWait("%s")
        Start-Sleep -Seconds 1

        # Navigate to Security Settings
        # This might need adjustment based on the actual menu structure
        Write-Host "Please manually enable Service Port in Settings -> Security Settings"
    }
} else {
    Write-Host "WeChat DevTools not found"
}
