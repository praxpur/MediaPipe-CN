---
title: "iOS 平台文本分类指南 (Text Classification Guide for iOS)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/text/text_classifier/ios"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-08 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# iOS 平台文本分类指南 (Text Classification Guide for iOS)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/text/text_classifier/ios)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

文本分类器任务(Text Classifier)可将文本分类到一组已定义的类别中,例如正面或负面情感。类别基于你使用的模型及该模型的训练方式决定。以下说明介绍如何在 iOS 应用中使用文本分类器。本说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_classification/ios) 上获取。

你可以通过查看此 [Web 演示](https://google-ai-edge.github.io/mediapipe-samples-web/#/text/text_classifier)来观看此任务的实际运行效果。有关此任务的能力、模型和配置选项的更多信息,请参阅[概览](../text_classifier.md)。

## 代码示例(Code example)

MediaPipe Tasks 示例代码是文本分类器 iOS 应用的基础实现。

你可以将此应用作为自己的 iOS 应用的起点,或在修改现有应用时参考它。你可以参阅 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_classification/ios) 上的文本分类器示例代码。

### 下载代码

以下说明介绍如何使用 [git](https://git-scm.com) 命令行工具创建示例代码的本地副本。

下载示例代码:

1. 使用以下命令克隆 git 仓库:

   ```
   git clone https://github.com/google-ai-edge/mediapipe-samples
   ```

2. 可选:配置你的 git 实例使用稀疏检出,这样你只拥有文本分类器示例应用所需的文件:

   ```
   cd mediapipe-samples
   git sparse-checkout init --cone
   git sparse-checkout set examples/text_classification/ios/
   ```

创建示例代码的本地版本后,你可以在 Xcode 中打开项目并运行应用。操作说明请参阅[环境配置指南(iOS)](../../setup_ios.md)。

### 关键组件

以下文件包含文本分类器示例应用的关键代码:

- [TextClassifierHelper.swift](https://github.com/googlesamples/mediapipe/blob/main/examples/text_classification/ios/TextClassifier/Helper/TextClassifierHelper.swift):初始化文本分类器并处理模型选择。
- [ViewController.swift](https://github.com/googlesamples/mediapipe/blob/main/examples/text_classification/ios/TextClassifier/ViewController.swift):实现 UI 并格式化结果。

## 环境配置(Setup)

本节介绍为使用文本分类器而配置开发环境和代码项目的关键步骤。有关使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参阅[环境配置指南(iOS)](../../setup_ios.md)。

### 依赖项(Dependencies)

文本分类器使用 `MediaPipeTasksText` 库,该库可通过 [Swift Package Manager](https://github.com/swiftlang/swift-package-manager)(SPM)安装。该库同时兼容 Swift 和 Objective-C 应用,无需任何额外的语言特定设置。

要将 `MediaPipeTasksText` 库添加到你的 Xcode 项目:

1. 在 Xcode 中打开项目后,选择 **File > Add Package Dependencies...**。
2. 在右上角的搜索字段中输入仓库 URL:`https://github.com/google-ai-edge/mediapipe`。
3. 选择 `mediapipe` 包并选择你的依赖规则(例如 **Up to Next Major Version** 或 `master` 分支)。
4. 点击 **Add Package**,然后选择 `MediaPipeTasksText` 并将其添加到你的应用 target。

如果你使用 `Package.swift` 文件,请使用以下代码添加 MediaPipe 包和 `MediaPipeTasksText` target 依赖:

```
dependencies: [
    .package(
        url: "https://github.com/google-ai-edge/mediapipe",
        branch: "master"
    ),
],
targets: [
    .target(
        name: "MyTextClassifierApp",
        dependencies: [
            .product(name: "MediaPipeTasksText", package: "mediapipe"),
        ]
    ),
]
```

有关配置依赖项的更多信息,请参阅[环境配置指南(iOS)](../../setup_ios.md)。

> **注意:** 以下各节提供 Swift 和 Objective-C 两种代码示例。在适用情况下,说明文字引用 Swift 方法名。

### 模型(Model)

MediaPipe 文本分类器任务需要与此任务兼容的已训练模型。有关文本分类器可用已训练模型的更多信息,请参阅任务概览的[模型章节](../text_classifier.md#models)。

选择一个模型并下载,然后使用 Xcode 将其添加到你的项目目录中。有关如何向 Xcode 项目添加文件的操作说明,请参阅[管理 Xcode 项目中的文件和文件夹](https://developer.apple.com/documentation/xcode/managing-files-and-folders-in-your-xcode-project)。

使用 `BaseOptions.modelAssetPath` 属性指定应用 bundle 中模型的路径。代码示例请参阅下一节。

## 创建任务(Create the task)

你可以通过调用文本分类器的一个初始化器来创建任务。`TextClassifier(options:)` 初始化器会设置配置选项的值。

如果你不需要使用自定义配置选项初始化的文本分类器,可以使用 `TextClassifier(modelPath:)` 初始化器以默认选项创建文本分类器。有关配置选项的更多信息,请参阅[配置概览](#configuration)。

以下代码演示了如何构建和配置此任务。

### Swift

```
import MediaPipeTasksText

let modelPath = Bundle.main.path(forResource: "model",
                                      ofType: "tflite")

let options = TextClassifierOptions()
options.baseOptions.modelAssetPath = modelPath
options.scoreThreshold = 0.6

let textClassifier = try TextClassifier(options: options)
```

### Objective-C

```
@import MediaPipeTasksText;

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"model"
                                                      ofType:@"tflite"];

MPPTextClassifierOptions *options = [[MPPTextClassifierOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.scoreThreshold = 0.6;

MPPTextClassifier *textClassifier =
      [[MPPTextClassifier alloc] initWithOptions:options error:nil];
```

### 配置选项(Configuration options)

此任务针对 iOS 应用有以下配置选项:

| 选项名 | 说明 | 取值范围 | 默认值 |
| --- | --- | --- | --- |
| `displayNamesLocale` | 设置用于显示名称的标签语言,显示名称由任务模型的元数据提供(如有)。默认为英语 `en`。你可以使用 [TensorFlow Lite Metadata Writer API](https://ai.google.dev/edge/lite/models/metadata_writer_tutorial#natural_language_classifiers) 向自定义模型的元数据中添加本地化标签 | 区域代码 | en |
| `maxResults` | 设置可选返回的最高分分类结果的最大条数。若 < 0,则返回所有可用结果。 | 任意正数 | `-1` |
| `scoreThreshold` | 设置预测分数阈值,用于覆盖模型元数据中提供的阈值(如有)。低于此值的结果将被拒绝。 | 任意浮点数 | 未设置 |
| `categoryAllowlist` | 设置可选的允许类别名称列表。若非空,则类别名称不在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `categoryDenylist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |
| `categoryDenylist` | 设置可选的不允许类别名称列表。若非空,则类别名称在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `categoryAllowlist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |

## 准备数据(Prepare data)

文本分类器处理文本数据。任务负责数据输入的预处理,包括分词(tokenization)和张量预处理。

所有预处理都在 `classify(text:)` 函数内部完成。无需事先对输入文本进行额外预处理。

### Swift

```
let text = "The input text to be classified."
```

### Objective-C

```
NSString *text = @"The input text to be classified.";
```

## 运行任务(Run the task)

运行文本分类器时,请使用 `classify(text:)` 方法。文本分类器返回输入文本可能对应的类别。

### Swift

```
let result = try textClassifier.classify(text: text)
```

### Objective-C

```
MPPTextClassifierResult *result = [textClassifier classifyText:text
                                                          error:nil];
```

> **注意:** 该任务会阻塞当前线程,直到完成对文本的推理。为避免阻塞当前线程,请使用 iOS [Dispatch](https://developer.apple.com/documentation/dispatch) 或 [NSOperation](https://developer.apple.com/documentation/foundation/nsoperation) 框架在后台线程中执行处理。

## 处理并显示结果(Handle and display results)

运行推理后,文本分类器任务返回一个 `TextClassifierResult` 对象,其中包含输入文本可能对应的类别列表。类别由你使用的模型定义,因此如果你需要不同的类别,请选择不同的模型,或重新训练现有模型。

以下展示此任务输出数据的示例:

```
TextClassificationResult:
  Classification #0 (single classification head):
    ClassificationEntry #0:
      Category #0:
        category name: "positive"
        score: 0.8904
        index: 0
      Category #1:
        category name: "negative"
        score: 0.1096
        index: 1
```

该结果是通过将 [BERT 分类器](https://storage.googleapis.com/mediapipe-assets/bert_text_classifier.tflite)运行于输入文本 `"an imperfect but overall entertaining mystery"` 上得到的。

示例代码中的 [ViewController.swift](https://github.com/googlesamples/mediapipe/blob/main/examples/text_classification/ios/TextClassifier/ViewController.swift) 文件演示了如何显示任务返回的检测结果。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*