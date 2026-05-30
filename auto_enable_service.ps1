# PowerShell script to automate WeChat Developer Tools
# Uses Windows SendKeys to navigate and enable service port

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName Microsoft.VisualBasic

function Wait-And-SendKeys {
    param(
        [string]$keys,
        [int]$delay = 500
    )
    Start-Sleep -Milliseconds $delay
    [System.Windows.Forms.SendKeys]::SendWait($keys)
}

# Kill existing process
Get-Process -Name "微信开发者工具" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Start WeChat DevTools
Start-Process "D:\微信web开发者工具\微信开发者工具.exe"
Start-Sleep -Seconds 5

# Find and activate window
$process = Get-Process -Name "微信开发者工具" -ErrorAction SilentlyContinue
if ($process -and $process.MainWindowHandle) {
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
    [Win32]::ShowWindow($process.MainWindowHandle, 9)
    [Win32]::SetForegroundWindow($process.MainWindowHandle)
    Start-Sleep -Seconds 1

    # Open Settings (Alt+S or click gear icon)
    # Try keyboard shortcut first
    Wait-And-SendKeys -keys "%{s}" -delay 500
    Start-Sleep -Seconds 1

    # Navigate to Security Settings
    # This might need to be adjusted based on the actual menu
    Wait-And-SendKeys -keys "{DOWN}" -delay 300
    Wait-And-SendKeys -keys "{DOWN}" -delay 300
    Wait-And-SendKeys -keys "{ENTER}" -delay 500

    # Try to find and enable Service Port checkbox
    # Use Tab to navigate to the checkbox
    Wait-And-SendKeys -keys "{TAB}" -delay 300
    Wait-And-SendKeys -keys "{TAB}" -delay 300
    Wait-And-SendKeys -keys " " -delay 500  # Space to toggle checkbox

    Write-Host "Attempted to enable service port. Please verify in the GUI."
} else {
    Write-Host "Could not find WeChat DevTools window"
}
