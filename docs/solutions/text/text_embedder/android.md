---
title: "Android 文本嵌入指南 (Text Embedding Guide for Android)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/text/text_embedder/android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Android 文本嵌入指南 (Text Embedding Guide for Android)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/text/text_embedder/android)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 文本嵌入器(Text Embedder)任务可以为文本数据创建数值表示,以捕获其语义含义。本指南介绍如何在 Android 应用中使用文本嵌入器。

有关此任务的功能、模型和配置选项的更多信息,请参见[概述](text_embedder.md)。

## 代码示例 (Code example)

MediaPipe Tasks 示例代码是一个简单的 Android 文本嵌入器应用实现。该示例评估两段文本之间的语义相似度,需要一台实体 Android 设备或 Android 模拟器。

你可以将该应用作为自己 Android 应用的起点,也可以在修改现有应用时参考它。文本嵌入器示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_embedder/android) 上。

### 下载代码 (Download the code)

以下说明介绍如何使用 [git](https://git-scm.com/) 命令行工具创建示例代码的本地副本。

要下载示例代码,请执行以下操作:

1.  使用以下命令克隆 git 仓库:

    git clone https://github.com/google-ai-edge/mediapipe-samples

2.  可选:配置你的 git 实例使用稀疏检出(sparse checkout),这样你只需获取文本嵌入器示例应用的文件:

    cd mediapipe-samples
    git sparse-checkout init --cone
    git sparse-checkout set examples/text\_embedder/android

创建示例代码的本地版本后,你可以将项目导入 Android Studio 并运行该应用。相关说明请参见 [Android 环境配置指南](../../setup_android.md#example_code)。

### 关键组件 (Key components)

以下文件包含此文本嵌入器示例应用的关键代码:

-   [TextEmbedderHelper.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/text_embedder/android/app/src/main/java/com/google/mediapipe/examples/textembedder/TextEmbedderHelper.kt):初始化文本嵌入器,并处理模型与委托(delegate)的选择。
-   [MainActivity.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/text_embedder/android/app/src/main/java/com/google/mediapipe/examples/textembedder/MainActivity.kt):实现应用逻辑并组装用户界面组件。

## 环境配置 (Setup)

本节介绍为使用文本嵌入器而配置开发环境和代码项目的关键步骤。关于使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参见 [Android 环境配置指南](../../setup_android.md)。

### 依赖 (Dependencies)

文本嵌入器使用 `com.google.mediapipe:tasks-text` 库。将此依赖添加到 Android 应用开发项目的 `build.gradle` 文件中。你可以使用以下代码导入所需的依赖:

```
dependencies {
    implementation 'com.google.mediapipe:tasks-text:latest.release'
}
```

### 模型 (Model)

MediaPipe 文本嵌入器任务需要一个与该任务兼容的训练好的模型。关于文本嵌入器可用训练模型的更多信息,请参见任务概述的[模型部分](../text_embedder.md#models)。

选择并下载模型,然后将其存放在项目目录中:

```
<dev-project-root>/src/main/assets
```

> **注意:** Android 构建系统会自动检查项目目录中的文件资源。

在 `ModelAssetPath` 参数中指定模型的路径。在示例代码中,模型定义在 [TextEmbedderHelper.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/text_embedder/android/app/src/main/java/com/google/mediapipe/examples/textembedder/TextEmbedderHelper.kt) 文件的 `setupTextEmbedder()` 函数中:

使用 `BaseOptions.Builder.setModelAssetPath()` 函数指定模型使用的路径。下一节中的代码示例会提及此方法。

## 创建任务 (Create the task)

你可以使用某个 `createFrom...()` 函数来创建任务。`createFromOptions()` 函数接受配置选项来设置嵌入器选项。你也可以使用 `createFromFile()` 工厂函数初始化任务。`createFromFile()` 函数接受训练模型文件的相对或绝对路径。关于配置选项的更多信息,请参见[配置选项](#configuration_options)。

以下代码演示如何构建和配置此任务:

```
val baseOptions = baseOptionsBuilder.build()
val optionsBuilder =
    TextEmbedderOptions.builder().setBaseOptions(baseOptions)
val options = optionsBuilder.build()
textEmbedder = TextEmbedder.createFromOptions(context, options)
```

示例代码在 [TextEmbedderHelper.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/text_embedder/android/app/src/main/java/com/google/mediapipe/examples/textembedder/TextEmbedderHelper.kt) 文件的 `setupTextEmbedder()` 函数中设置文本嵌入器选项。

### 配置选项 (Configuration options)

该任务为 Android 应用提供以下配置选项:

| 选项名称 (Option Name) | 描述 (Description) | 取值范围 (Value Range) | 默认值 (Default Value) |
|---|---|---|---|
| `l2_normalize` | 是否使用 L2 范数对返回的特征向量进行归一化。仅当模型本身不包含原生的 L2_NORMALIZATION TFLite 算子时,才使用此选项。大多数情况下模型已包含该算子,L2 归一化已通过 TFLite 推理完成,无需使用此选项。 | `Boolean` | `False` |
| `quantize` | 返回的嵌入是否应通过标量量化转换为字节。嵌入被默认假定为单位范数,因此任何维度的值都保证处于 [-1.0, 1.0] 范围内。若情况并非如此,请使用 `l2_normalize` 选项。 | `Boolean` | `False` |

### 文本格式上下文 (Text formatting context,仅限 EmbeddingGemma)

使用高级的 EmbeddingGemma 模型时,输入文本需要根据嵌入任务按特定模板进行格式化。你可以通过构建 `TextFormatContext` 并使用 `embed` 函数将其传入来配置此格式化行为。

```
// 构建格式上下文
val formatContext = TextFormatContext.builder()
    .setTaskType(TextFormatContext.EmbeddingType.SEMANTIC_SIMILARITY)
    .build()

// 将格式上下文传给推理方法
val embeddingResult = textEmbedder.embed(inputText, formatContext)
```

## 准备数据 (Prepare data)

文本嵌入器处理文本(`String`)数据。任务负责数据输入预处理,包括分词(tokenization)和张量预处理。所有预处理都在 `embed()` 函数内完成,无需预先对输入文本进行额外预处理。

```
val inputText = "The input text to be embedded."
```

## 运行任务 (Run the task)

文本嵌入器使用 `embed` 函数触发推理。对于文本嵌入,这意味返回输入文本的嵌入向量。

以下代码演示如何利用任务模型执行处理:

```
textEmbedder?.let {
    val firstEmbed =
        it.embed(firstText).embeddingResult().embeddings().first()
    val secondEmbed =
        it.embed(secondText).embeddingResult().embeddings().first()
    ...
}
```

在示例代码中,`embed` 函数在 [TextEmbedderHelper.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/text_embedder/android/app/src/main/java/com/google/mediapipe/examples/textembedder/TextEmbedderHelper.kt) 文件中被调用。

## 处理并显示结果 (Handle and display results)

运行推理后,文本嵌入器任务会返回一个 `TextEmbedderResult` 对象,其中包含输入文本的嵌入列表(浮点或标量量化形式)。

以下是此任务输出数据的示例:

```
TextEmbedderResult:
  Embedding #0 (sole embedding head):
    float_embedding: {0.2345f, 0.1234f, ..., 0.6789f}
    head_index: 0
```

你可以使用 `TextEmbedder.cosineSimilarity` 函数比较两个嵌入的语义相似度。参见以下代码示例:

```
val similarity = TextEmbedder.cosineSimilarity(firstEmbed, secondEmbed)
```

在示例代码中,`TextEmbedder.cosineSimilarity()` 函数在 [TextEmbedderHelper.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/text_embedder/android/app/src/main/java/com/google/mediapipe/examples/textembedder/TextEmbedderHelper.kt) 文件中被调用。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*