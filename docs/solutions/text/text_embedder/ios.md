---
title: "iOS 文本嵌入指南 (Text embedding guide for iOS)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/text/text_embedder/ios"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-08 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# iOS 文本嵌入指南 (Text embedding guide for iOS)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/text/text_embedder/ios)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

文本嵌入器(Text Embedder)任务可以对文本数据创建数值表示,以捕获其语义含义。以下说明介绍如何在 iOS 应用中使用文本嵌入器。

你可以通过查看此 [Web 演示](https://google-ai-edge.github.io/mediapipe-samples-web/#/text/text_embedder)来了解该任务的实际效果。关于此任务的功能、模型和配置选项的更多信息,请参见[概述](../text_embedder.md)。

## 代码示例 (Code example)

文本嵌入器示例代码提供了一个集成此任务的 iOS 应用的基本实现。该示例评估两段文本之间的语义相似度,需要一台实体 iOS 设备或 iOS 模拟器。

你可以将该应用作为自己 iOS 应用的起点,也可以在修改现有应用时参考它。你可以参阅 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_embedder/ios) 上的文本嵌入器示例代码。

### 下载代码 (Download the code)

以下说明介绍如何使用 [git](https://git-scm.com) 命令行工具创建示例代码的本地副本。

要下载示例代码:

1.  使用以下命令克隆 git 仓库:

    ```
    git clone https://github.com/google-ai-edge/mediapipe-samples
    ```

2.  可选:配置你的 git 实例使用稀疏检出(sparse checkout),这样你只需获取文本嵌入器示例应用的文件:

    ```
    cd mediapipe-samples
    git sparse-checkout init --cone
    git sparse-checkout set examples/text_embedder/ios/
    ```

创建示例代码的本地版本后,你可以使用 Xcode 打开项目并运行应用。相关说明请参见 [iOS 环境配置指南](../../setup_ios.md)。

### 关键组件 (Key components)

以下文件包含文本嵌入器示例应用的关键代码:

-   [TextEmbedderService.swift](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/text_embedder/ios/TextEmbedder/Services/TextEmbedderService.swift):初始化文本嵌入器,并对输入数据运行推理。
-   [ViewController.swift](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/text_embedder/ios/TextEmbedder/ViewController.swift):实现用户界面并格式化结果。

## 环境配置 (Setup)

本节介绍为使用文本嵌入器而配置开发环境和代码项目的关键步骤。关于使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参见 [iOS 环境配置指南](../../setup_ios.md)。

### 依赖 (Dependencies)

文本嵌入器使用 `MediaPipeTasksText` 库,该库可通过 [Swift Package Manager](https://github.com/swiftlang/swift-package-manager)(SPM)安装。该库同时兼容 Swift 和 Objective-C 应用,无需额外的语言特定配置。

要将 `MediaPipeTasksText` 库添加到 Xcode 项目:

1.  在 Xcode 中打开项目后,选择 **File > Add Package Dependencies...**。
2.  在右上角的搜索字段中输入仓库 URL:`https://github.com/google-ai-edge/mediapipe`。
3.  选择 `mediapipe` 包并选择你的依赖规则(例如,**Up to Next Major Version** 或 `master` 分支)。
4.  点击 **Add Package**,然后选择 `MediaPipeTasksText` 并将其添加到你的应用目标。

如果使用 `Package.swift` 文件,请使用以下代码添加 MediaPipe 包和 `MediaPipeTasksText` 目标依赖:

```
dependencies: [
    .package(
        url: "https://github.com/google-ai-edge/mediapipe",
        branch: "master"
    ),
],
targets: [
    .target(
        name: "MyTextEmbedderApp",
        dependencies: [
            .product(name: "MediaPipeTasksText", package: "mediapipe"),
        ]
    ),
]
```

关于配置依赖的更多信息,请参阅 [iOS 环境配置指南](../../setup_ios.md)。

> **注意:** 以下各节提供 Swift 和 Objective-C 两种代码示例。适用时,说明文字会引用 Swift 方法名。

### 模型 (Model)

MediaPipe 文本嵌入器任务需要一个与该任务兼容的训练好的模型。关于文本嵌入器可用训练模型的更多信息,请参见任务概述的[模型部分](../text_embedder.md#models)。

选择并下载模型,然后使用 Xcode 将其添加到项目目录。关于如何将文件添加到 Xcode 项目的说明,请参阅 [Managing files and folders in your Xcode project](https://developer.apple.com/documentation/xcode/managing-files-and-folders-in-your-xcode-project)。

使用 `BaseOptions.modelAssetPath` 属性指定应用包中模型的路径。代码示例请参见下一节。

## 创建任务 (Create the task)

你可以通过调用某个初始化器(initializer)来创建文本嵌入器任务。`TextEmbedder(options:)` 初始化器接受配置选项的值。

如果不需要以自定义配置选项初始化文本嵌入器,可以使用 `TextEmbedder(modelPath:)` 初始化器以默认选项创建文本嵌入器。关于配置选项的更多信息,请参见[配置概述](#configuration)。

以下代码演示如何构建和配置此任务。

### Swift

```
import MediaPipeTasksText

let modelPath = Bundle.main.path(forResource: "model",
                                      ofType: "tflite")

let options = TextEmbedderOptions()
options.baseOptions.modelAssetPath = modelPath
options.quantize = true

let textEmbedder = try TextEmbedder(options: options)
```

### Objective-C

```
@import MediaPipeTasksText;

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"model"
                                                      ofType:@"tflite"];

MPPTextEmbedderOptions *options = [[MPPTextEmbedderOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.quantize = YES;

MPPTextEmbedder *textEmbedder =
      [[MPPTextEmbedder alloc] initWithOptions:options error:nil];
```

### 配置选项 (Configuration options)

该任务为 iOS 应用提供以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `l2_normalize` | 是否使用 L2 范数对返回的特征向量进行归一化。仅在模型本身不包含原生 L2_NORMALIZATION TFLite Op 时才使用此选项。大多数情况下模型已经满足此条件,并通过 TFLite 推理实现 L2 归一化,无需此选项。 | `Boolean` | `False` |
| `quantize` | 返回的嵌入是否应通过标量量化(scalar quantization)量化为字节。嵌入被隐式假定为单位范数,因此任何维度都保证取值在 [-1.0, 1.0] 范围内。如果情况并非如此,请使用 l2_normalize 选项。 | `Boolean` | `False` |

### 文本格式化上下文 (仅限 EmbeddingGemma)(Text formatting context (EmbeddingGemma only))

当使用高级 EmbeddingGemma 模型时,输入文本需要根据嵌入任务使用特定模板进行格式化。你可以通过在与输入文本一起传入 `TextFormatContext` 结构体来配置此格式化行为。

### Swift

```
var formatContext = TextFormatContext(taskType: .semanticSimilarity)
let result = try textEmbedder.embed(text: text, formatContext: formatContext)
```

### Objective-C

```
MPPTextFormatContext *formatContext = [[MPPTextFormatContext alloc] init];
formatContext.taskType = MPPTextFormatContextEmbeddingTypeSemanticSimilarity;

MPPTextEmbedderResult *result = [textEmbedder embedText:text
                                          formatContext:formatContext
                                                  error:nil];
```

## 运行任务 (Run the task)

要嵌入输入文本并获取其嵌入向量,可以使用 `TextEmbedder` 的 `embed(text:)` 方法。

### Swift

```
let result = try textEmbedder.embed(text: text)
```

### Objective-C

```
MPPTextEmbedderResult *result = [textEmbedder embedText:text
                                                  error:nil];
```

> **注意:** 该任务会阻塞当前线程,直到完成对文本的推理。为避免阻塞当前线程,请使用 iOS 的 [Dispatch](https://developer.apple.com/documentation/dispatch) 或 [NSOperation](https://developer.apple.com/documentation/foundation/nsoperation) 框架在后台线程中执行处理。如果你的应用使用 Swift 编写,还可以使用 [Swift Concurrency](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/) 进行后台线程执行。

在示例代码中,`embed(text:)` 方法在 [TextEmbedderService.swift](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/text_embedder/ios/TextEmbedder/Services/TextEmbedderService.swift) 文件中调用。

## 处理并显示结果 (Handle and display results)

完成推理后,文本嵌入器任务会返回一个 `TextEmbedderResult` 对象,其中包含输入文本的嵌入列表(浮点或标量量化形式)。

以下是该任务输出数据的示例:

```
TextEmbedderResult:
  Embedding #0 (sole embedding head):
    float_embedding: {0.2345f, 0.1234f, ..., 0.6789f}
    head_index: 0
```

你可以使用 `TextEmbedder.cosineSimilarity` 方法比较两个嵌入之间的语义相似度。

### Swift

```
let similarity = try TextEmbedder.cosineSimilarity(
  embedding1: result.embeddingResult.embeddings[0],
  embedding2: otherResult.embeddingResult.embeddings[0])
```

### Objective-C

```
NSNumber *similarity = [MPPTextEmbedder
      cosineSimilarityBetweenEmbedding1:result.embeddingResult.embeddings[0]
                          andEmbedding2:otherResult.embeddingResult.embeddings[0]
                                  error:nil];
```

在示例代码中,`TextEmbedder.cosineSimilarity` 方法在 [TextEmbedderService.swift](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/text_embedder/ios/TextEmbedder/Services/TextEmbedderService.swift) 文件中调用。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*