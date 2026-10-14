---
title: "文本摘要器 iOS 指南 (Text summarization guide for iOS)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/text/text_summarizer/ios"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-08 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 文本摘要器 iOS 指南 (Text summarization guide for iOS)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/text/text_summarizer/ios)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Text Summarizer(文本摘要器)任务允许您识别文本中最重要的信息，并在保持原始上下文含义的同时生成较短的版本。本指南将向您展示如何在 iOS 应用中使用 Text Summarizer。

有关此任务的功能、模型和配置选项的更多信息，请参阅[概述 (Overview)](../text_summarizer.md)。

## 代码示例 (Code example)

Text Summarizer iOS 示例应用演示了在物理 iOS 设备或模拟器上的 API 实现。

您可以将此应用作为您自己 iOS 应用的起点，或者在修改现有应用时参考它。您可以参考 GitHub 上的 Text Summarizer [示例代码](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_summarizer/ios)。

## 环境配置指南 (Setup)

本节介绍了设置开发环境和代码项目以在 iOS 上使用 Text Summarizer 的关键步骤。有关设置开发环境以使用 MediaPipe Tasks(任务 API)的一般信息(包括平台版本要求)，请参阅 [iOS 环境配置指南 (Setup guide for iOS)](../../setup_ios.md)。

### 依赖项 (Dependencies)

Text Summarizer 使用 `MediaPipeTasksText` 库，可以通过 [Swift Package Manager](https://github.com/swiftlang/swift-package-manager) (SPM) 安装。该库与 Swift 应用兼容，并且不需要任何额外的特定语言设置。

要将 `MediaPipeTasksText` 库添加到您的 Xcode 项目中：

1. 在 Xcode 中打开您的项目，选择 **File > Add Package Dependencies...**。
2. 在右上角的搜索字段中，输入仓库 URL：
   `https://github.com/google-ai-edge/mediapipe`
3. 选择 `mediapipe` 包并选择您的依赖项规则(例如，**Up to Next Major Version** 或 `master` 分支)。
4. 点击 **Add Package**，然后选择 `MediaPipeTasksText` 并将其添加到您的应用程序目标中。

如果您使用 `Package.swift` 文件，请使用以下代码添加 MediaPipe 包和 `MediaPipeTasksText` 目标依赖项：

```swift
dependencies: [
    .package(
        url: "https://github.com/google-ai-edge/mediapipe",
        branch: "master"
    ),
],
targets: [
    .target(
        name: "MyTextSummarizerApp",
        dependencies: [
            .product(name: "MediaPipeTasksText", package: "mediapipe"),
        ]
    ),
]
```

有关配置依赖项的更多信息，请参阅 [iOS 环境配置指南](../../setup_ios.md)。

### 模型 (Model)

MediaPipe Text Summarizer 任务需要一个与此任务兼容的训练好的模型。有关 Text Summarizer 可用的训练模型的更多信息，请参阅任务概述的[模型 (Models)](../text_summarizer.md#models)部分。

选择并下载一个 LiteRT 模型，然后使用 Xcode 将其添加到您的项目目录中。有关如何向 Xcode 项目添加文件的说明，请参阅[在 Xcode 项目中管理文件和文件夹 (Managing files and folders in your Xcode project)](https://developer.apple.com/documentation/xcode/managing-files-and-folders-in-your-xcode-project)。

使用 `BaseOptions.modelAssetPath` 属性来指定模型在您的应用包中的路径。

## 创建任务 (Create the task)

您可以通过调用 Text Summarizer 的初始化方法之一来创建该任务。`TextSummarizer(options:)` 初始化方法接受配置选项的值。

以下代码演示了如何构建和配置此任务。

```swift
import MediaPipeTasksText

guard let modelPath = Bundle.main.path(forResource: "summarizer",
                                       ofType: "litertlm") else { return }

let options = TextSummarizerOptions()
options.baseOptions.modelAssetPath = modelPath
options.mode = .tldr

let textSummarizer = try TextSummarizer(options: options)
```

### 配置选项 (Configuration options)

此任务具有以下适用于 iOS 应用的配置选项：

| 选项名称 (Option Name) | 描述 (Description) | 取值范围 (Value Range) | 默认值 (Default Value) |
| --- | --- | --- | --- |
| `mode` | 文本摘要器 (text summarizer) 任务的摘要模式。可以是简短的摘要段落或要点的项目符号列表。 | `.tldr`、`.keyPoints` | `.keyPoints` |
| `maxTokens` | 摘要 (summarization) 任务的最大令牌 (tokens) 数。如果设置，当输入和输出超过此值时，摘要将被截断。如果未设置，则默认限制由模型容量决定。 | `Integer` | `0` (模型容量 8k) |

## 运行任务 (Run the task)

要对输入文本运行摘要推理 (inference)，您可以使用 `TextSummarizer` 的 `summarize(text:)` 方法进行阻塞式推理，或使用 `summarizeStreaming(text:completion:)` 方法进行异步回调。

### 同步 (Synchronous)

```swift
let result = try textSummarizer.summarize(text: text)
```

### 异步回调 (Streaming (Asynchronous callbacks))

```swift
try textSummarizer.summarizeStreaming(text: text) { streamResult, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let streamResult = streamResult else { return }
    print(streamResult.chunk)

    if streamResult.done {
        print("Completed summarizing!")
    }
}
```

## 处理和显示结果 (Handle and display results)

在同步运行推理 (inference) 时，Text Summarizer 会返回一个实例，使用 `summary` 属性包含完整的字符串。

```swift
let finalOutput = result.summary
```

在流式模式下运行时，回调会不断输出 `TextSummarizerStreamResult`，其中包含 `.chunk`(下一个部分文本)，以及一个决定流式完成状态的 `.done` 布尔值。

## 清理 (Clean Up)

完成任务后，不要忘记显式关闭摘要器 (summarizer) 引擎实例。

```swift
try textSummarizer.close()
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*