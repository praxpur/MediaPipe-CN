---
title: "文本摘要器 Android 指南 (Text summarization guide for Android)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/text/text_summarizer/android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 文本摘要器 Android 指南 (Text summarization guide for Android)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/text/text_summarizer/android)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Text Summarizer(文本摘要器)任务允许您识别文本中最重要的信息，并在保持原始上下文含义的同时生成较短的版本。本指南将向您展示如何在 Android 应用中使用 Text Summarizer。

有关此任务的功能、模型和配置选项的更多信息，请参阅[概述 (Overview)](../text_summarizer.md)。

## 代码示例 (Code example)

Text Summarizer Android 示例应用演示了在物理 Android 设备或模拟器上的 API 实现。

您可以将此应用作为您自己 Android 应用的起点，或者在修改现有应用时参考它。Text Summarizer 示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_summarizer/android) 上。

## 环境配置指南 (Setup)

本节介绍了设置开发环境和代码项目以专门使用 Text Summarizer 的关键步骤。有关设置开发环境以使用 MediaPipe Tasks(任务 API)的一般信息(包括平台版本要求)，请参阅 [Android 环境配置指南 (Setup guide for Android)](../../setup_android.md)。

### 依赖项 (Dependencies)

Text Summarizer 使用 `com.google.mediapipe:tasks-text` 库。将此依赖项添加到您的 Android 应用开发项目的 `build.gradle` 文件中。您可以使用以下代码导入所需的依赖项：

```groovy
dependencies {
    implementation 'com.google.mediapipe:tasks-text:latest.release'
}
```

### 模型 (Model)

MediaPipe Text Summarizer 任务需要一个与此任务兼容的训练好的模型。有关 Text Summarizer 可用的训练模型的更多信息，请参阅任务概述的[模型 (Models)](../text_summarizer.md#models)部分。

选择并下载模型，然后将其存储在您的项目目录中：

```
<dev-project-root>/src/main/assets
```

> **注意:** Android 构建系统会自动检查项目目录中的文件资源。

使用路径或文件描述符在选项 (options) 对象中指定模型。使用 `setModelPath()` 函数指定模型使用的路径，或使用 `setModelAssetFileDescriptor()` 函数指定模型资产的文件描述符。

## 创建任务 (Create the task)

您可以使用 `createFromOptions()` 函数来创建任务。`createFromOptions()` 函数接受配置选项 (configuration options) 来设置任务选项。有关配置选项的更多信息，请参阅[配置选项 (Configuration options)](#configuration_options)。

以下代码演示了如何构建和配置此任务。

### 模型路径 (Model Path)

```java
// Configure the options using model path
TextSummarizerOptions options = TextSummarizerOptions.builder()
    .setModelPath("path/to/your/model.litertlm")
    .setMode(TextSummarizerOptions.Mode.TLDR)
    .build();
```

### 文件描述符 (File Descriptor)

```java
// Configure the options using file descriptor
// Note: 'parcelFileDescriptor' is the ParcelFileDescriptor of
// the model asset
TextSummarizerOptions options = TextSummarizerOptions.builder()
    .setModelAssetFileDescriptor(parcelFileDescriptor)
    .setMode(TextSummarizerOptions.Mode.TLDR)
    .build();
```

从选项创建引擎：

```java
// Create the engine from options
// Note: 'context' is the Android Context
TextSummarizer summarizer = TextSummarizer.createFromOptions(context, options);
```

### 配置选项 (Configuration options)

此任务具有以下适用于 Android 应用的配置选项：

| 选项名称 (Option Name) | 描述 (Description) | 取值范围 (Value Range) | 默认值 (Default Value) |
| --- | --- | --- | --- |
| `setMode` | 文本摘要器 (text summarizer) 任务的摘要模式。可以是简短的摘要段落或要点的项目符号列表。 | `TextSummarizerOptions.Mode.TLDR`、`TextSummarizerOptions.Mode.KEYPOINTS` | `TextSummarizerOptions.Mode.KEYPOINTS` |
| `setMaxNumTokens` | 摘要 (summarization) 任务的最大令牌 (tokens) 数。如果设置，当输入和输出超过此值时，摘要将被截断。如果未设置，则默认限制由模型容量决定。 | `Integer` | `Model default (8k)` |
| `setModelPath` | 指向 Android 应用资产 (assets) 文件夹中模型资产文件的模型路径。 | 作为字符串 (string) 的文件路径 | 未设置 |
| `setModelAssetFileDescriptor` | 模型资产文件的文件描述符整数。 | 指定文件描述符的整数 | 未设置 |

## 准备数据 (Prepare data)

Text Summarizer 接受文本 (`String`) 数据，并且不需要任何准备工作。

```java
String inputText = "Some input text for the summarization task";
```

## 运行任务 (Run the task)

要摘要文本，您可以使用同步方法(阻塞执行线程直到返回摘要)或流式方法(立即返回并通过回调接口流式传输结果内容)。

### 选项 A：同步摘要 (Option A: Synchronous Summarization)

当您希望等待生成并一次性返回完整的文本摘要时，请使用同步方法。

```java
import android.util.Log;
import com.google.mediapipe.tasks.text.textsummarizer.TextSummarizerResult;

String textToSummarize = "Here is a long meeting transcript or block of text...";

// Run summarization (blocks current thread until done)
TextSummarizerResult result = summarizer.summarize(textToSummarize);
String summary = result.getSummary();
Log.i("TextSummarizer", "Summary: " + summary);
```

### 选项 B：流式摘要 (Option B: Streaming Summarization)

对于较长的生成任务或保持 UI 响应性，建议使用流式方法。此处提供了一个回调，以便在计算摘要文本时接收其部分片段 (chunks)。

```java
import android.util.Log;
import com.google.mediapipe.tasks.text.textsummarizer.TextSummarizerStreamingResult;

String textToSummarize = "Here is a long meeting transcript or block of text...";
// Starts summarization and returns immediately. Iteratively invokes callback.
summarizer.summarizeStreaming(textToSummarize, new TextSummarizer.SummarizationResultCallback() {
     @Override
     public void onNext(TextSummarizerStreamingResult result) {
         // Appends the next stream chunk
         String chunk = result.getChunk();

         // e.g., runOnUiThread(() -> resultTextView.append(chunk));
     }

     @Override
     public void onError(Throwable throwable) {
         // Handle summarization error
         Log.e("TextSummarizer", "Summarization failed: " + throwable.getMessage());
     }

     @Override
     public void onDone() {
         // Fired when summarization completes
         Log.i("TextSummarizer", "Summarization finished!");
     }
});
```

## 处理和显示结果 (Handle and display results)

在任务执行时：

* 对于同步摘要，任务返回一个 `TextSummarizerResult`，其中包含最终的摘要文本。
* 对于流式摘要，任务会向回调接口重复输出 `TextSummarizerStreamingResult` 块 (chunks)。

## 清理 (Clean up)

为了释放内存和 C++ 资源，您必须在完成使用后显式关闭该任务。

```java
@Override
protected void onDestroy() {
    super.onDestroy();
    if (summarizer != null) {
        summarizer.close(); // Cleans up underlying handle
    }
}
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*