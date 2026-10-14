---
title: "Android 平台语言检测指南 (Language Detection Guide for Android)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/text/language_detector/android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-09-02 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Android 平台语言检测指南 (Language Detection Guide for Android)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/text/language_detector/android)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 语言检测器任务(Language Detector)可识别一段文本的语言。以下说明介绍如何在 Android 应用中使用语言检测器。本说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/language_detector/android) 上获取。

你可以通过查看[演示](https://google-ai-edge.github.io/mediapipe-samples-web/#/text/language_detector)来观看此任务的实际运行效果。有关此任务的能力、模型和配置选项的更多信息,请参阅[概览](../language_detector.md)。

## 代码示例(Code example)

语言检测器的示例代码提供了此任务的简单实现供你参考。该代码帮助你测试此任务,并开始构建你自己的语言检测功能。你可以在 GitHub 上浏览[语言检测器示例代码](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/language_detector/android)。

### 下载代码

以下说明介绍如何使用 [git](https://git-scm.com/) 版本控制命令行工具创建示例代码的本地副本。

下载示例代码:

1. 使用以下命令克隆 git 仓库:

   ```
   git clone https://github.com/google-ai-edge/mediapipe-samples
   ```

2. 可选:配置你的 git 实例使用稀疏检出(sparse checkout),这样你只拥有语言检测器示例应用所需的文件:

   ```
   cd mediapipe-samples
   git sparse-checkout init --cone
   git sparse-checkout set examples/languagedetector/android
   ```

如需了解如何使用 Android Studio 设置并运行示例,请参阅[环境配置指南(Android)](../../setup_android.md#example_code)中的示例代码设置说明。

### 关键组件

以下文件包含文本分类示例应用的关键代码:

- [LanguageDetectorHelper.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/language_detector/android/app/src/main/java/com/google/mediapipe/examples/languagedetector/LanguageDetectorHelper.kt) - 初始化语言检测器并处理模型选择。
- [ResultsAdapter.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/language_detector/android/app/src/main/java/com/google/mediapipe/examples/languagedetector/ResultsAdapter.kt) - 处理并格式化检测结果。
- [MainActivity.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/language_detector/android/app/src/main/java/com/google/mediapipe/examples/languagedetector/MainActivity.kt) - 实现应用,包括调用 `LanguageDetectorHelper` 和 `ResultsAdapter`。

## 环境配置(Setup)

本节介绍针对语言检测器配置开发环境和代码项目的关键步骤。有关使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参阅[环境配置指南(Android)](../../setup_android.md)。

### 依赖项(Dependencies)

语言检测器使用 `com.google.mediapipe:tasks-text` 库。将此依赖项添加到你的 Android 应用开发项目的 `build.gradle` 文件中。你可以使用以下代码导入所需依赖项:

```
dependencies {
    implementation 'com.google.mediapipe:tasks-text:latest.release'
}
```

### 模型(Model)

MediaPipe 语言检测器任务需要与此任务兼容的已训练模型。有关语言检测器可用已训练模型的更多信息,请参阅任务概览的[模型章节](../language_detector.md#models)。

选择并下载模型,然后将其存放在你的项目目录中:

```
<dev-project-root>/src/main/assets
```

在 `ModelName` 参数中指定模型的路径。

## 创建任务(Create the task)

你可以使用 `createFrom...()` 系列函数之一创建任务。`createFromOptions()` 函数接受语言检测器的配置选项。你也可以使用 `createFromFile()` 工厂函数初始化任务。`createFromFile()` 函数接受已训练模型文件的相对路径或绝对路径。有关配置任务的更多信息,请参阅[配置选项](#configuration_options)。

以下代码演示了如何创建和配置此任务。

```
// For creating a language detector instance:
LanguageDetectorOptions options =
       LanguageDetectorOptions.builder()
       .setBaseOptions(
          BaseOptions.builder()
            .setModelAssetPath(modelPath)
            .build()
          )
       .build();
LanguageDetector languageDetector = LanguageDetector.createFromOptions(context, options);
```

你可以在代码示例 [LanguageDetectorHelper](https://github.com/googlesamples/mediapipe/blob/main/examples/language_detector/android/app/src/main/java/com/google/mediapipe/examples/languagedetector/LanguageDetectorHelper.kt) 类的 `initDetector()` 函数中查看如何创建任务的示例。

### 配置选项(Configuration options)

此任务针对 Android 应用有以下配置选项:

| 选项名 | 说明 | 取值范围 | 默认值 |
| --- | --- | --- | --- |
| `maxResults` | 设置可选返回的最高分语言预测的最大条数。若该值小于零,则返回所有可用结果。 | 任意正数 | `-1` |
| `scoreThreshold` | 设置预测分数阈值,用于覆盖模型元数据中提供的阈值(如有)。低于此值的结果将被拒绝。 | 任意浮点数 | 未设置 |
| `categoryAllowlist` | 设置可选的允许语言代码列表。若非空,则语言代码不在此集合中的语言预测将被过滤掉。此选项与 `categoryDenylist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |
| `categoryDenylist` | 设置可选的不允许语言代码列表。若非空,则语言代码在此集合中的语言预测将被过滤掉。此选项与 `categoryAllowlist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |

## 准备数据(Prepare data)

语言检测器处理文本(`String`)数据。任务负责数据输入的预处理,包括分词(tokenization)和张量预处理。所有预处理都在 `detect()` 函数内部完成。无需事先对输入文本进行额外预处理。

```
String inputText = "Some input text for the language detector";
```

## 运行任务(Run the task)

语言检测器使用 `LanguageDetector.detect()` 方法处理输入文本并预测文本的语言。你应该使用单独的执行线程来执行检测,以避免阻塞应用的 Android 用户界面线程。

以下代码演示了如何使用单独的执行线程配合任务模型执行处理。

```
// Predict the language of the input text.
fun classify(text: String) {
    executor = ScheduledThreadPoolExecutor(1)

    executor.execute {
        val results = languageDetector.detect(text)
        listener.onResult(results)
    }
}
```

你可以在代码示例 [LanguageDetectorHelper](https://github.com/googlesamples/mediapipe/blob/main/examples/language_detector/android/app/src/main/java/com/google/mediapipe/examples/languagedetector/LanguageDetectorHelper.kt) 类的 `detect()` 函数中查看如何运行任务的示例。

## 处理并显示结果(Handle and display results)

语言检测器输出一个 `LanguageDetectorResult`,其中包含一组语言预测及这些预测对应的概率。语言类别在模型中定义,有关你所使用模型的详细信息,请参阅任务概览的[模型章节](../language_detector.md#models)。

以下展示此任务输出数据的示例:

```
LanguageDetectorResult:
  LanguagePrediction #0:
    language_code: "fr"
    probability: 0.999781
```

该结果是通过将模型运行于输入文本 `"Il y a beaucoup de bouches qui parlent et fort peu de têtes qui pensent."` 上得到的。

你可以在代码示例 [ResultsAdapter](https://github.com/googlesamples/mediapipe/blob/main/examples/language_detector/android/app/src/main/java/com/google/mediapipe/examples/languagedetector/ResultsAdapter.kt) 类及其 `ViewHolder` 内部类中查看如何显示结果的示例。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*