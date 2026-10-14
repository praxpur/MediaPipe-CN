---
title: "文本校对器 Python 指南 (Text proofreading guide for Python)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/text/text_proofreader/python"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 文本校对器 Python 指南 (Text proofreading guide for Python)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/text/text_proofreader/python)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Text Proofreader(文本校对器)任务允许您识别文本中的拼写、语法和样式错误，并在保持原意的同时生成校对后的版本。本指南将向您展示如何在 Python 中使用 Text Proofreader。

有关此任务的功能、模型和配置选项的更多信息，请参阅[概述 (Overview)](../text_proofreader.md)。

## 代码示例 (Code example)

Text Proofreader 的示例代码在 Python 中提供了此任务的完整实现，供您参考。此代码可帮助您测试此任务并开始构建自己的文本校对器 (text proofreader)。您可以在 GitHub 上查看此示例的[源代码](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/text_proofreader/python/text_proofreader.ipynb)。

## 环境配置指南 (Setup)

本节介绍了设置开发环境和代码项目以专门使用 Text Proofreader 的关键步骤。有关设置开发环境以使用 MediaPipe Tasks(任务 API)的一般信息(包括平台版本要求)，请参阅 [Python 环境配置指南 (Setup guide for Python)](../../setup_python.md)。

### 包 (Packages)

Text Proofreader 使用 `mediapipe` pip 包。您可以使用以下命令安装该依赖项：

```bash
$ python -m pip install mediapipe
```

### 导入 (Imports)

导入以下类以访问 Text Proofreader 任务函数：

```python
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import text
```

### 模型 (Model)

MediaPipe Text Proofreader 任务需要一个与此任务兼容的训练好的模型。有关 Text Proofreader 可用的训练模型的更多信息，请参阅任务概述的[模型 (Models)](../text_proofreader.md#models)部分。

选择并下载一个模型，然后将其存储在本地目录中。

```python
model_path = '/absolute/path/to/proofreader.litertlm'
```

在 `model_asset_path` 参数中指定模型的路径，如下所示：

```python
base_options = python.BaseOptions(model_asset_path=model_path)
```

## 创建任务 (Create the task)

MediaPipe Text Proofreader 任务使用 `create_from_options` 函数来设置该任务。`create_from_options` 函数接受配置选项的值。您还可以使用 `create_from_model_path` 工厂函数来初始化任务。`create_from_model_path` 函数接受已训练模型文件的相对或绝对路径。

有关配置选项的更多信息，请参阅[配置选项 (Configuration options)](#configuration_options)。

以下代码演示了如何构建和配置此任务。

```python
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
TextProofreader = mp.tasks.text.TextProofreader
TextProofreaderOptions = mp.tasks.text.TextProofreaderOptions
TextProofreaderResult = mp.tasks.text.TextProofreaderResult
TextProofreaderCorrection = mp.tasks.text.TextProofreaderCorrection
TextProofreaderCorrectionType = mp.tasks.text.TextProofreaderCorrectionType

# Build the configuration options
options = TextProofreaderOptions(
    base_options=BaseOptions(model_asset_path=model_path),
    max_num_tokens=4096
)

text_proofreader = TextProofreader.create_from_options(options)
```

### 配置选项 (Configuration options)

此任务具有以下适用于 Python 应用程序的配置选项：

| 选项名称 (Option Name) | 描述 (Description) | 取值范围 / 类型 (Value Range / Type) | 默认值 (Default Value) |
| --- | --- | --- | --- |
| `max_num_tokens` | 文本校对器 (proofread) 任务的最大令牌 (tokens) 数。如果设置，当输入和输出超过此值时，校对后的输出将被截断。如果未设置(或等于 0)，则默认限制由模型容量决定(8k)。 | `Integer` | `None` |

## 准备数据 (Prepare data)

Text Proofreader 使用文本 (`str`) 数据。该任务处理数据输入预处理，包括标记化 (tokenization) 和张量 (tensor) 预处理。您无需事先对输入文本进行任何额外的预处理。

```python
input_text = "The long input text to be proofread goes here..."
```

## 运行任务 (Run the task)

Text Proofreader 使用 `proofread` 函数进行同步执行，并使用 `proofread_async` 进行异步流式执行以生成校对后的文本。

### 同步执行 (Synchronous Execution)

以下代码演示了如何同步执行处理。

```python
# Perform text proofreading on the provided input text.
proofreading_result = text_proofreader.proofread(input_text)
```

### 异步流式执行 (Asynchronous Streaming Execution)

对于逐块 (chunk by chunk) 生成部分文本的异步流式执行，请使用 `proofread_async`。您必须提供一个回调 (callback) 函数来处理这些传入的结果。

```python
from typing import Optional

def result_callback(
    result: Optional[mp.tasks.text.TextProofreaderResult],
    error: Optional[str]
):
    if error:
        print(f"Error: {error}")
        return

    if result and result.proofread_text:
        # Result contains the partial chunk string
        print(result.proofread_text, end="")

    if result and result.done:
        print("\nFinished stream!")
        # Access corrections here if needed:
        # print(result.corrections)

# Perform streaming text proofreading on the provided input text.
text_proofreader.proofread_async(input_text, result_callback)
```

## 处理和显示结果 (Handle and display results)

Text Proofreader 输出一个 `TextProofreaderResult`，其中包含已完成或部分的校对文本、一个 `TextProofreaderCorrection` 对象列表，以及一个指示完成状态的布尔标志。每个 `TextProofreaderCorrection` 指定一个 `TextProofreaderCorrectionType`(例如 `SAME`、`INSERTION` 或 `DELETION`)以及关联的文本字符串。

对于流式任务，Python `TextProofreaderResult` 将包更新映射到填充在 `proofread_text` 属性中的新附加的令牌块 (token chunk)，并通过 `done` 属性指示完成。

以下显示了此任务的输出数据示例：

```python
# Print the output proofread text
print("Proofread Text:", proofreading_result.proofread_text)

# Iterate over granular corrections to understand the diff
for correction in proofreading_result.corrections:
    print(f"[{correction.type.name}] {correction.text}")
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*