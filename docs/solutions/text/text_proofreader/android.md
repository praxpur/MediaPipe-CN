---
title: "Android 文本校对指南 (Text proofreading guide for Android)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/text/text_proofreader/android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-12 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Android 文本校对指南 (Text proofreading guide for Android)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/text/text_proofreader/android)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 文本校对器(Text Proofreader)任务可以识别文本中的拼写、语法和文体错误,并在保持原意不变的前提下生成修正后的版本。以下说明介绍如何在 Android 应用中使用文本校对器。

关于此任务的功能、模型和配置选项的更多信息,请参见[概述](../text_proofreader.md)。

## 代码示例 (Code example)

文本校对器 Android 示例应用在实体 Android 设备或模拟器上演示该 API。

你可以将该应用作为自己 Android 应用的起点,也可以在修改现有应用时参考它。文本校对器示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_proofreader/android) 上。

## 环境配置 (Setup)

本节介绍为使用文本校对器而配置开发环境和代码项目的关键步骤。关于使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参见 [Android 环境配置指南](../../setup_android.md)。

## 依赖 (Dependencies)

文本校对器使用 `com.google.mediapipe:tasks-text` 库。将此依赖添加到 Android 应用开发项目的 `build.gradle` 文件中。你可以使用以下代码导入所需的依赖:

```
dependencies {
    implementation 'com.google.mediapipe:tasks-text:latest.release'
}
```

### 模型 (Model)

MediaPipe 文本校对器任务需要一个与该任务兼容的训练好的模型。关于文本校对器可用训练模型的更多信息,请参见任务概述的[模型部分](../text_proofreader.md#models)。

选择并下载模型,然后将其存放在项目目录中:

```
<dev-project-root>/src/main/assets
```

> **注意:** Android 构建系统会自动检查项目目录中的文件资源。

在选项对象中指定模型的路径。使用 `setModelPath()` 函数指定模型使用的路径。下一节中的代码示例会提及此方法。

## 创建任务 (Create the task)

你可以使用 `createFromOptions()` 函数创建任务。`createFromOptions()` 函数接受配置选项来设置校对器选项。关于配置选项的更多信息,请参见[配置选项](#configuration_options)。

以下代码演示如何构建和配置此任务。

```
// 配置选项
TextProofreaderOptions options = TextProofreaderOptions.builder()
    .setModelPath("path/to/proofreader/model")
    .build();

// 从选项创建任务
// 注意:'context' 是 Android Context
TextProofreader proofreader = TextProofreader.createFromOptions(context, options);
```

### 配置选项 (Configuration options)

此任务为 Android 应用提供以下配置选项:

| 选项名称 | 说明 | 取值范围 / 类型 | 默认值 |
|---|---|---|---|
| `setModelAssetFileDescriptor` | 包含缓存模型文件的文件描述符(必须至少提供这些选项之一)。 | `ParcelFileDescriptor` | `-1` |
| `setModelPath` | 校对器模型的绝对本地路径(必须至少提供这些选项之一)。 | `String` | `""` |
| `setMaxNumTokens` | 最大上下文长度(以 token 计)的可选限制。若大于模型的内置容量,则以模型的限制为准。 | `Integer` | `Model default (8k)` |

## 准备数据 (Prepare data)

文本校对器处理文本(`String`)数据。该任务负责数据输入的预处理,包括分词和张量预处理。你无需事先对输入文本进行任何额外预处理。

```
String inputText = "Some input text for the proofreading task";
```

## 运行任务 (Run the task)

要对输入文本运行校对推理,你可以使用同步方式——它会阻塞执行线程直到返回修正后的文本;也可以使用流式方式——它会立即返回并通过回调接口流式输出结果内容。

### 方式 A:同步校对 (Option A: Synchronous Proofreading)

当你希望等待整段文本被一并修正并返回时,请使用同步方式。

```
import com.google.mediapipe.tasks.text.textproofreader.TextProofreaderResult;

String textToProofread = "Here is a long block of text with typos...";

// 运行校对器(阻塞当前线程直到完成)
TextProofreaderResult result = proofreader.proofread(textToProofread);
String correctedText = result.getProofreadText();
System.out.println("Proofread text: " + correctedText);
```

### 方式 B:流式校对 (Option B: Streaming Proofreading)

流式方式推荐用于较长的生成任务或保持 UI 响应性。这里提供一个回调,以便在计算过程中接收校对文本的分块内容。

```
import com.google.mediapipe.tasks.text.textproofreader.TextProofreaderStreamingResult;

String textToProofread = "Here is a long block of text with typos...";

// 开始校对并立即返回。反复调用回调。
proofreader.proofreadStreaming(textToProofread, new TextProofreader.ProofreaderResultCallback() {
     @Override
     public void onNext(TextProofreaderStreamingResult result) {
         // 追加下一个流式分块
         String chunk = result.getChunk();

         // 例如:runOnUiThread(() -> resultTextView.append(chunk));

         // 当流式输出完成时处理修正列表。
         if (result.isDone() && result.getCorrections() != null) {
             // 处理修正列表…
         }
     }

     @Override
     public void onError(Throwable throwable) {
         // 处理校对错误
         System.err.println("Proofreading failed: " + throwable.getMessage());
     }

     @Override
     public void onDone() {
         // 校对完成时触发
         System.out.println("Proofreading finished!");
     }
});
```

## 处理并显示结果 (Handle and display results)

执行推理时:

-   对于同步校对,它会返回一个包含最终校对文本的 `TextProofreaderResult`。
-   对于流式校对,它会向回调接口反复输出 `TextProofreaderStreamingResult` 分块。

```
// TextProofreaderResult:
// 返回整个校对后的文本
String fullProofreadText = result.getProofreadText();

// 你还可以获取修正列表,以便在 UI 中高亮差异
List<TextProofreaderResult.Correction> corrections = result.getCorrections();
for (TextProofreaderResult.Correction correction : corrections) {
   // 类型为 INSERTION、DELETION 或 SAME
   TextProofreaderResult.CorrectionType type = correction.getType();
   String segment = correction.getText();
}

// TextProofreaderStreamingResult:
// 返回新生成的校对文本分块
String nextChunk = result.getChunk();
// 返回流式迭代是否完成
boolean isComplete = result.isDone();
```

## 清理 (Clean up)

为释放内存和 C++ 资源,你必须在不再使用校对器时显式关闭它。

```
@Override
protected void onDestroy() {
    super.onDestroy();
    if (proofreader != null) {
        proofreader.close(); // 清理原生句柄
    }
}
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*