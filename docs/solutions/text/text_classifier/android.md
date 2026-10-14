---
title: "Android 平台文本分类指南 (Text Classification Guide for Android)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/text/text_classifier/android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Android 平台文本分类指南 (Text Classification Guide for Android)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/text/text_classifier/android)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 文本分类器任务(Text Classifier)可将文本分类到一组已定义的类别中,例如正面或负面情感。类别由你使用的模型及该模型的训练方式决定。以下说明介绍如何在 Android 应用中使用文本分类器。

你可以通过查看[演示](https://google-ai-edge.github.io/mediapipe-samples-web/#/text/text_classifier)来观看此任务的实际运行效果。有关此任务的能力、模型和配置选项的更多信息,请参阅[概览](../text_classifier.md)。

## 代码示例(Code example)

文本分类器的示例代码提供了此任务的简单实现供你参考。该代码帮助你测试此任务,并开始构建你自己的文本分类应用。你可以在 GitHub 上浏览[文本分类器示例代码](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_classification/android)。

### 下载代码

以下说明介绍如何使用 [git](https://git-scm.com/) 版本控制命令行工具创建示例代码的本地副本。

下载示例代码:

1. 使用以下命令克隆 git 仓库:

   ```
   git clone https://github.com/google-ai-edge/mediapipe-samples
   ```

2. 可选:配置你的 git 实例使用稀疏检出,这样你只拥有文本分类器示例应用所需的文件:

   ```
   cd mediapipe-samples
   git sparse-checkout init --cone
   git sparse-checkout set examples/text_classification/android
   ```

如需了解如何使用 Android Studio 设置并运行示例,请参阅[环境配置指南(Android)](../../setup_android.md#example_code)中的示例代码设置说明。

### 关键组件

以下文件包含文本分类示例应用的关键代码:

- [TextClassifierHelper.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/text_classification/android/app/src/main/java/com/google/mediapipe/examples/textclassifier/TextClassifierHelper.kt) - 初始化文本分类器并处理模型选择。
- [MainActivity.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/text_classification/android/app/src/main/java/com/google/mediapipe/examples/textclassifier/MainActivity.kt) - 实现应用,包括调用 `TextClassifierHelper` 和 `ResultsAdapter`。
- [ResultsAdapter.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/text_classification/android/app/src/main/java/com/google/mediapipe/examples/textclassifier/ResultsAdapter.kt) - 处理并格式化结果。

## 环境配置(Setup)

本节介绍针对文本分类器配置开发环境和代码项目的关键步骤。有关使用 MediaPipe Tasks 配置开发环境的一般信息(包括平台版本要求),请参阅[环境配置指南(Android)](../../setup_android.md)。

### 依赖项(Dependencies)

文本分类器使用 `com.google.mediapipe:tasks-text` 库。将此依赖项添加到你的 Android 应用开发项目的 `build.gradle` 文件中。你可以使用以下代码导入所需依赖项:

```
dependencies {
    implementation 'com.google.mediapipe:tasks-text:latest.release'
}
```

### 模型(Model)

MediaPipe 文本分类器任务需要与此任务兼容的已训练模型。有关文本分类器可用已训练模型的更多信息,请参阅任务概览的[模型章节](../text_classifier.md#models)。

选择并下载模型,然后将其存放在你的项目 `assets` 目录中:

```
<dev-project-root>/src/main/assets
```

> **注意:** 推荐使用此位置,因为 Android 构建系统会自动检查此目录中的文件资源。

使用 `BaseOptions.Builder.setModelAssetPath()` 方法指定要使用的模型路径。代码示例请参阅下一节。

## 创建任务(Create the task)

使用文本分类器的 `TextClassifier.createFrom...()` 系列函数之一来准备运行推理。你可以使用 `createFromFile()` 函数并传入已训练模型文件的相对路径或绝对路径。下面的代码示例演示了 `TextClassifier.createFromOptions()` 函数的用法。有关可用配置选项的更多信息,请参阅[配置选项](#configuration_options)。

以下代码演示了如何构建和配置此任务。

```
// no directory path required if model file is in src/main/assets:
String currentModel = "text_classifier_model.tflite";

fun initClassifier() {
    val baseOptionsBuilder = BaseOptions.builder()
        .setModelAssetPath(currentModel)
    try {
        val baseOptions = baseOptionsBuilder.build()
        val optionsBuilder = TextClassifier.TextClassifierOptions.builder()
            .setBaseOptions(baseOptions)
        val options = optionsBuilder.build()
        textClassifier = TextClassifier.createFromOptions(context, options)
    } catch (e: IllegalStateException) { // exception handling
    }
}
```

你可以在代码示例 [TextClassifierHelper](https://github.com/googlesamples/mediapipe/blob/main/examples/text_classification/android/app/src/main/java/com/google/mediapipe/examples/textclassifier/TextClassifierHelper.kt#L38-L58) 类的 `initClassifier()` 函数中查看如何创建任务的示例。

### 配置选项(Configuration options)

此任务针对 Android 应用有以下配置选项:

| 选项名 | 说明 | 取值范围 | 默认值 |
| --- | --- | --- | --- |
| `displayNamesLocale` | 设置用于显示名称的标签语言,显示名称由任务模型的元数据提供(如有)。默认为英语 `en`。你可以使用 [TensorFlow Lite Metadata Writer API](https://ai.google.dev/edge/lite/models/metadata_writer_tutorial#natural_language_classifiers) 向自定义模型的元数据中添加本地化标签 | 区域代码 | en |
| `maxResults` | 设置可选返回的最高分分类结果的最大条数。若 < 0,则返回所有可用结果。 | 任意正数 | `-1` |
| `scoreThreshold` | 设置预测分数阈值,用于覆盖模型元数据中提供的阈值(如有)。低于此值的结果将被拒绝。 | 任意浮点数 | 未设置 |
| `categoryAllowlist` | 设置可选的允许类别名称列表。若非空,则类别名称不在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `categoryDenylist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |
| `categoryDenylist` | 设置可选的不允许类别名称列表。若非空,则类别名称在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `categoryAllowlist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |

## 准备数据(Prepare data)

文本分类器处理文本(`String`)数据。任务负责数据输入的预处理,包括分词(tokenization)和张量预处理。

所有预处理都在 `classify()` 函数内部完成。无需事先对输入文本进行额外预处理。

```
String inputText = "The input text to be classified.";
```

## 运行任务(Run the task)

文本分类器使用 `TextClassifier.classify()` 函数运行推理。请使用单独的执行线程来执行分类,以避免阻塞应用的 Android 用户界面线程。

以下代码演示了如何使用单独的执行线程配合任务模型执行处理。

```
    fun classify(text: String) {
        executor = ScheduledThreadPoolExecutor(1)

        executor.execute {
            val results = textClassifier.classify(text)
            listener.onResult(results)
        }
    }
```

你可以在代码示例 [TextClassifierHelper](https://github.com/googlesamples/mediapipe/blob/main/examples/text_classification/android/app/src/main/java/com/google/mediapipe/examples/textclassifier/TextClassifierHelper.kt#L61-L75) 类的 `classify()` 函数中查看如何运行任务的示例。

## 处理并显示结果(Handle and display results)

文本分类器输出一个 `TextClassifierResult`,其中包含输入文本可能对应的类别列表。类别由你使用的模型定义,因此如果你需要不同的类别,请选择不同的模型,或重新训练现有模型。

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

你可以在代码示例 [ResultsAdapter](https://github.com/googlesamples/mediapipe/blob/main/examples/text_classification/android/app/src/main/java/com/google/mediapipe/examples/textclassifier/ResultsAdapter.kt#L30-L50) 类及其 `ViewHolder` 内部类中查看如何显示结果的示例。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*