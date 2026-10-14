---
title: "文本摘要器 Python 指南 (Text summarization guide for Python)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/text/text_summarizer/python"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 文本摘要器 Python 指南 (Text summarization guide for Python)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/text/text_summarizer/python)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Text Summarizer(文本摘要器)任务允许您识别文本中最重要的信息，并在保持原始上下文含义的同时生成较短的版本。本指南将向您展示如何在 Python 中使用 Text Summarizer。

有关此任务的功能、模型和配置选项的更多信息，请参阅[概述 (Overview)](../text_summarizer.md)。

## 代码示例 (Code example)

Text Summarizer 的示例代码在 Python 中提供了此任务的完整实现，供您参考。此代码可帮助您测试此任务并开始构建自己的文本摘要器 (text summarizer)。您可以在 GitHub 上查看此示例的[源代码](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/text_summarizer/python/text_summarizer.ipynb)。

## 环境配置指南 (Setup)

本节介绍了设置开发环境和代码项目以专门使用 Text Summarizer 的关键步骤。有关设置开发环境以使用 MediaPipe Tasks(任务 API)的一般信息(包括平台版本要求)，请参阅 [Python 环境配置指南 (Setup guide for Python)](../../setup_python.md)。

### 包 (Packages)

Text Summarizer 使用 `mediapipe` pip 包。您可以使用以下命令安装该依赖项：

```bash
$ python -m pip install mediapipe
```

### 导入 (Imports)

导入以下类以访问 Text Summarizer 任务函数：

```python
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import text
```

### 模型 (Model)

MediaPipe Text Summarizer 任务需要一个与此任务兼容的训练好的模型。有关 Text Summarizer 可用的训练模型的更多信息，请参阅任务概述的[模型 (Models)](../text_summarizer.md#models)部分。

选择并下载一个模型，然后将其存储在本地目录中。

```python
model_path = '/absolute/path/to/summarizer.litertlm'
```

使用 `model_asset_path` 参数指定模型的路径，如下所示：

```python
base_options = python.BaseOptions(model_asset_path=model_path)
```

## 创建任务 (Create the task)

MediaPipe Text Summarizer 任务使用 `create_from_options` 函数来设置该任务。`create_from_options` 函数接受配置选项的值来设置摘要器 (summarizer) 选项。您还可以使用 `create_from_model_path` 工厂函数来初始化任务。`create_from_model_path` 函数接受已训练模型文件的相对或绝对路径。

有关配置选项的更多信息，请参阅[配置选项 (Configuration options)](#configuration_options)。

以下代码演示了如何构建和配置此任务。

```python
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
TextSummarizer = mp.tasks.text.TextSummarizer
TextSummarizerOptions = mp.tasks.text.TextSummarizerOptions
TextSummarizerMode = mp.tasks.text.TextSummarizerMode

# Build the configuration options
options = TextSummarizerOptions(
    base_options=BaseOptions(model_asset_path=model_path),
    mode=TextSummarizerMode.TLDR
)

text_summarizer = TextSummarizer.create_from_options(options)
```

### 配置选项 (Configuration options)

此任务具有以下适用于 Python 应用程序的配置选项：

| 选项名称 (Option Name) | 描述 (Description) | 取值范围 (Value Range) | 默认值 (Default Value) |
| --- | --- | --- | --- |
| `mode` | 文本摘要器 (text summarizer) 任务的摘要模式。可以是简短的摘要段落或要点的项目符号列表。 | `TextSummarizerMode.TLDR`、`TextSummarizerMode.KEYPOINTS` | `TextSummarizerMode.KEYPOINTS` |
| `max_num_tokens` | 摘要 (summarization) 任务的最大令牌 (tokens) 数。如果设置，当输入和输出超过此值时，摘要将被截断。如果未设置，则默认限制由模型容量决定。 | `Integer` | `None` (模型容量 8k) |

## 准备数据 (Prepare data)

Text Summarizer 接受文本 (`str`) 数据，并且不需要任何准备工作。

```python
input_text = "The extremely long input text to be summarized goes here..."
```

## 运行任务 (Run the task)

Text Summarizer 使用 `summarize` 函数进行同步执行，并使用 `summarize_async` 进行异步流式执行，以逐个令牌 (token by token) 生成摘要。

### 同步执行 (Synchronous Execution)

以下代码演示了如何同步执行处理。

```python
# Perform text summarization on the provided input text.
summarization_result = text_summarizer.summarize(input_text)
```

### 异步流式执行 (Asynchronous Streaming Execution)

要执行异步流式处理以逐块 (chunk by chunk) 生成部分文本，请使用 `summarize_async`。流式引擎利用回调 (callback) 来中继增量更新，将流中的 `.summary` 和 `.done` 字段映射到输出结果中。

您必须提供一个回调 (callback) 函数来处理这些传入的结果。

```python
from typing import Optional

def result_callback(result: Optional[mp.tasks.text.TextSummarizerResult], error: Optional[str]):
    if error:
        print(f"Error: {error}")
        return

    if result and result.summary:
        # Result contains the partial chunk string
        print(result.summary, end="")

    if result and result.done:
        print("\nFinished stream!")

# Perform streaming text summarization on the provided input text.
text_summarizer.summarize_async(input_text, result_callback)
```

## 处理和显示结果 (Handle and display results)

Text Summarizer 输出一个 `TextSummarizerResult`，其中包含已完成或部分的摘要以及一个指示完成状态的布尔标志。

对于流式任务，Python `TextSummarizerResult` 将包更新映射到填充在 `summary` 属性中的新附加的令牌块 (token chunk)，并通过 `done` 属性指示完成。

以下显示了此任务的输出数据示例：

```python
# TextSummarizerResult:
#   summary: "This is a short summary of the text."
#   done: True

# Print the output summary text
print("Summary:", summarization_result.summary)
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*