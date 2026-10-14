---
title: "iOS 环境配置指南 (Setup Guide for iOS)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/setup_ios"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-02 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# iOS 环境配置指南 (Setup Guide for iOS)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/setup_ios)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

本页介绍如何配置开发环境,以便在你的 iOS 应用程序中使用 MediaPipe Tasks。

## 受支持的设备和平台

要使用 MediaPipe Tasks 创建 iOS 应用程序,你的开发环境需要满足以下条件:

-   macOS Mojave 10.14.3 或更高版本
-   [Xcode](https://developer.apple.com/support/xcode/) 14.1 或更高版本
-   搭载 iOS 15.0 或更高版本的 iOS 设备或模拟器。另外,iOS 模拟器可以处理不需要设备摄像头的应用。

**注意:** MediaPipe Tasks 仅支持 64 位 iOS 模拟器(arm64 和 x86_64)与设备(arm64)。不支持 32 位架构(i386 和 armv7)。

## 开发者环境配置

在 iOS 应用上运行 MediaPipe 任务之前,你必须在本地机器上已经有 Xcode 项目,或新建一个项目。

在 Xcode 中,可以使用 [Swift Package Manager](https://github.com/swiftlang/swift-package-manager)(SPM)安装 MediaPipe Tasks。

## 示例代码配置

[MediaPipe Examples](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples) 代码库包含 MediaPipe Tasks 的示例 iOS 应用程序。

你可以基于示例代码创建项目、构建项目并运行任务。以下步骤将构建[文本分类器 (Text Classifier)](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_classification/ios)任务。

要导入并构建示例代码项目:

1.  打开终端,克隆 MediaPipe Examples 代码库,并进入包含 `TextClassifier.xcodeproj` 的目录。

    ```
    git clone https://github.com/google-ai-edge/mediapipe-samples
    cd mediapipe-samples/examples/text_classification/ios
    ```
2.  在 Xcode 中打开 `TextClassifier.xcodeproj` 文件。Xcode 会自动解析并下载所需的 Swift 包依赖项。
3.  选择 `TextClassifier` scheme,并从项目窗口的工具栏中选择实体 iOS 设备或模拟器。使用实体 iOS 设备时,请确保它已连接到你的 Mac。
4.  点击项目工具栏中的 `Run` 按钮。

有关在 Xcode 中运行应用的更多说明,请参阅[构建并运行应用](https://developer.apple.com/documentation/xcode/building-and-running-an-app)。

## MediaPipe Tasks 依赖项

MediaPipe Tasks 为视觉、文本和音频提供预构建库。模型文件(`.task` 或 `.tflite`)必须位于使用该模型的 iOS 应用的 bundle 中。

### 在 Xcode 中添加依赖项

要将 MediaPipe Tasks Swift 包添加到你的 Xcode 项目:

1.  在 Xcode 中打开项目后,选择 **File > Add Package Dependencies...**。
2.  在右上角的搜索字段中输入代码库 URL:

    ```
    https://github.com/google-ai-edge/mediapipe
    ```
3.  选择 `mediapipe` 包,并选择你所需的依赖规则(例如 **Up to Next Major Version** 或 `master` 分支)。
4.  点击 **Add Package**。
5.  在"包产品"对话框中,选择你的应用所需的库,并将其添加到应用目标:

    -   **视觉任务**:`MediaPipeTasksVision`
    -   **文本任务**:`MediaPipeTasksText`
    -   **音频任务**:`MediaPipeTasksAudio`

    > **注意:** `MediaPipeTasksCommon` 会作为依赖项自动包含。

### 在 `Package.swift` 中添加依赖项

如果你在开发 Swift 包,请将 MediaPipe 包添加到 `Package.swift` 的依赖项中:

```
dependencies: [
    .package(
        url: "https://github.com/google-ai-edge/mediapipe",
        branch: "master"
    ),
],
targets: [
    .target(
        name: "MyAppTarget",
        dependencies: [
            .product(name: "MediaPipeTasksVision", package: "mediapipe"),
        ]
    ),
]
```

## BaseOptions 配置

BaseOptions 允许对 MediaPipe Task API 进行常规配置。

| 选项名称 | 说明 | 可接受的值 |
| --- | --- | --- |
| `modelAssetPath` | iOS 应用 bundle 中模型文件的模型路径。 | 字符串形式的路径。 |

**注意:** `modelAssetPath` 路径字符串必须使用 iOS 的 `Bundle` 类创建。

## 硬件加速

在 iOS 上,MediaPipe Tasks 仅支持在标准 CPU 处理器上运行模型。

## 问题排查

如需有关 MediaPipe 技术问题的帮助,请访问[讨论组](https://groups.google.com/forum/#!forum/mediapipe)或 [Stack Overflow](https://stackoverflow.com/questions/tagged/mediapipe),获取社区支持。要报告 bug 或提出功能请求,请在 [GitHub 上提交 issue](https://github.com/google/mediapipe/issues)。

如需有关配置 iOS 开发环境的帮助,请访问 [Apple 开发者文档](https://developer.apple.com/tutorials/app-dev-training)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*