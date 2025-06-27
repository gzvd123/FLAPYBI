# 🤖 Hướng Dẫn Cài Đặt Android SDK

## Phương Án 1: Android Studio (Dễ nhất)

### Bước 1: Tải Android Studio
1. Truy cập: https://developer.android.com/studio
2. Tải và cài đặt Android Studio
3. Mở Android Studio lần đầu sẽ tự động tải SDK

### Bước 2: Cấu hình Environment Variables
```bash
# Windows (PowerShell as Administrator)
$env:ANDROID_HOME = "C:\Users\[USER]\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\tools;$env:ANDROID_HOME\platform-tools"

# Hoặc set permanent:
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\[USER]\AppData\Local\Android\Sdk", "User")
```

### Bước 3: Kiểm tra cài đặt
```bash
# Test command
adb version
android list targets
```

## Phương Án 2: Command Line Tools Only

### Tải SDK Tools
1. Truy cập: https://developer.android.com/studio#command-tools
2. Tải "Command line tools only"
3. Giải nén vào `C:\Android\sdk`

### Cài đặt SDK
```bash
cd C:\Android\sdk\cmdline-tools\bin
sdkmanager "platform-tools" "platforms;android-30" "build-tools;30.0.3"
```

## Phương Án 3: Sử dụng Chocolatey (Windows)

```bash
# Install Chocolatey first
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Android SDK
choco install android-sdk
```

## ✅ Kiểm Tra Sau Khi Cài

```bash
# Test commands
cordova requirements android
android list targets
adb devices
```

## 🚀 Build APK Sau Khi Setup

```bash
cd FlappyBirdApp
cordova build android
```

APK sẽ được tạo tại:
- `platforms/android/app/build/outputs/apk/debug/app-debug.apk` 