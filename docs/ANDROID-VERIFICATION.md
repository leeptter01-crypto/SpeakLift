# Android 测试包验证

日期：2026-11-12。

## 文件

- 安装包：`D:\SpeakLift\releases\SpeakLift-0.1.0-preview.apk`
- 包名：`com.speaklift.app`
- 版本：`0.1.0-preview`，versionCode 1
- 最低系统：Android 8.0 / API 26；target SDK 35
- 大小：1,343,011 字节
- SHA-256：`fbd8da0980638466f85b5fbeb61b7eaae3f3f52d6400710113bba5ee0c244267`
- Android Debug 测试签名，APK v2 签名校验通过。不是商店正式发行版。
- 签名证书 SHA-256：`8a3665092c0aede239ca205f9efa5c5d681a5d45cc9ca11a6c990862aaedf3b0`

## 已验证

- Gradle `assembleDebug`、`testDebugUnitTest`、`lintDebug` 均成功。
- 4 项 Android 授权与网址策略单元测试通过。
- 36 项原有学习进度、识别、录音与跟读生命周期测试通过。
- 打包后的 JavaScript 语法检查通过。
- APK 含 12 个网页资产，包括课程、学习进度和录音模块；未包含签名私钥、环境文件或 Git 元数据。
- 清单只申请网络、录音与音频设置权限；未申请相机、通讯录或文件存储权限。
- Android lint 为 0 错误、1 项 JavaScript 启用提醒。该应用需要运行内置课程脚本；已限制本地 HTTPS 源、关闭文件访问/混合内容，并将外部导航交给独立浏览器。

## 尚未验证

电脑未连接 Android 设备，未进行真机安装、原生界面截图、物理麦克风录制、回放或系统语音识别测试。构建成功不等于以上实机功能已通过。当前仍有 [Android 说明](ANDROID.md) 列出的账号、真人朗读和自动评分限制。

## 安装

将 APK 传到安卓手机，在手机文件管理器中打开；仅在必要时为这个文件管理器允许“安装未知应用”。安装后可关闭该安装来源权限。进入跟读时再允许麦克风。

APK 不能在 iPhone 或 Windows 上直接安装；iPhone 目前仍使用原有网页/PWA。APK 与网页版的本地账号和进度相互独立。卸载 APK 会删除本机进度。
