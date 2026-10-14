---
title: "Python 文本嵌入指南 (Text embedding guide for Python)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/text/text_embedder/python"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Python 文本嵌入指南 (Text embedding guide for Python)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/text/text_embedder/python)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 文本嵌入器(Text Embedder)任务可以对文本数据创建数值表示,以捕获其语义含义。以下说明介绍如何在 Python 中使用文本嵌入器。

关于此任务的功能、模型和配置选项的更多信息,请参见[概述](../text_embedder.md)。

## 代码示例 (Code example)

文本嵌入器示例代码提供了此任务在 Python 中的完整实现,供你参考。此代码可帮助你测试此任务,并开始构建自己的文本嵌入器。你可以仅使用网页浏览器通过 Google Colab 查看、运行和编辑文本嵌入器[示例代码](https://colab.sandbox.google.com/github/googlesamples/mediapipe/blob/main/examples/text_embedder/python/text_embedder.ipynb)。你也可以在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_embedder/python) 上查看此示例的源代码。

## 环境配置 (Setup)

本节介绍为使用文本嵌入器而配置开发环境和代码项目的关键步骤。关于使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参见 [Python 环境配置指南](../../setup_python.md)。

### 软件包 (Packages)

文本嵌入器使用 mediapipe pip 包。你可以使用以下命令安装该依赖:

```
$ python -m pip install mediapipe
```

### 导入 (Imports)

导入以下类以访问文本嵌入器任务函数:

```
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import text
```

### 模型 (Model)

MediaPipe 文本嵌入器任务需要一个与该任务兼容的训练好的模型。关于文本嵌入器可用训练模型的更多信息,请参见任务概述的[模型部分](../text_embedder.md#models)。

选择并下载模型,然后将其存放在本地目录中。你可以使用推荐的 [UniversalSentenceEncoder](https://storage.googleapis.com/mediapipe-tasks/text_embedder/universal_sentence_encoder.tflite) 模型。

```
model_path = '/absolute/path/to/universal_sentence_encoder.tflite'
```

在 `model_asset_path` 参数中指定模型的路径,如下所示:

```
base_options = BaseOptions(model_asset_path=model_path)
```

## 创建任务 (Create the task)

MediaPipe 文本嵌入器任务使用 `create_from_options` 函数来配置任务。`create_from_options` 函数接受配置选项的值来设置嵌入器选项。你也可以使用 `create_from_model_path` 工厂函数初始化任务。`create_from_model_path` 函数接受训练模型文件的相对或绝对路径。关于配置选项的更多信息,请参见[配置选项](#configuration_options)。

以下代码演示如何构建和配置此任务。

```
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
TextEmbedder = mp.tasks.text.TextEmbedder
TextEmbedderOptions = mp.tasks.text.TextEmbedderOptions

# 用于创建文本嵌入器实例:
options = TextEmbedderOptions(
    base_options=BaseOptions(model_asset_path=model_path),
    quantize=True)
text_embedder = TextEmbedder.create_from_options(options)
```

### 配置选项 (Configuration options)

此任务为 Python 应用提供以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `l2_normalize` | 是否使用 L2 范数对返回的特征向量进行归一化。仅在模型本身不包含原生 L2_NORMALIZATION TFLite Op 时才使用此选项。大多数情况下模型已经满足此条件,并通过 TFLite 推理实现 L2 归一化,无需此选项。 | `Boolean` | `False` |
| `quantize` | 返回的嵌入是否应通过标量量化(scalar quantization)量化为字节。嵌入被隐式假定为单位范数,因此任何维度都保证取值在 [-1.0, 1.0] 范围内。如果情况并非如此,请使用 l2_normalize 选项。 | `Boolean` | `False` |

### 文本格式化上下文 (仅限 EmbeddingGemma 使用)(Text formatting context (EmbeddingGemma only))

当使用高级 EmbeddingGemma 模型时,输入文本需要根据嵌入任务使用特定模板进行格式化。你可以在调用 `embed` 时传入 `TextEmbeddingFormatContext` 来配置此格式化行为。

```
import mediapipe as mp

TextEmbeddingFormatContext = mp.tasks.text.TextEmbeddingFormatContext
TextEmbeddingType = mp.tasks.text.TextEmbeddingType

# 定义格式上下文
format_context = TextEmbeddingFormatContext(
    task_type=TextEmbeddingType.SEMANTIC_SIMILARITY
)

# 将上下文传递给推理方法
embedding_result = text_embedder.embed(input_text, format_context)
```

## 准备数据 (Prepare data)

文本嵌入器处理文本(`str`)数据。该任务负责数据输入的预处理,包括分词和张量预处理。

所有预处理都在 `embed` 函数内完成。无需事先对输入文本进行额外预处理。

```
input_text = "The input text to be embedded."
```

## 运行任务 (Run the task)

文本嵌入器使用 `embed` 函数触发推理。对于文本嵌入,这意味着返回输入文本的嵌入向量。

以下代码演示如何使用任务模型执行处理。

```
# 对提供的输入文本执行文本嵌入。
embedding_result = text_embedder.embed(input_text)
```

## 处理并显示结果 (Handle and display results)

文本嵌入器输出一个 `TextEmbedderResult`,其中包含输入文本的嵌入列表(浮点或标量量化形式)。

以下是该任务输出数据的示例:

```
TextEmbedderResult:
  Embedding #0 (sole embedding head):
    float_embedding: {0.2345f, 0.1234f, ..., 0.6789f}
    head_index: 0
```

你可以使用 `TextEmbedder.cosine_similarity` 函数比较两个嵌入之间的语义相似度。参见以下代码示例。

```
# 计算余弦相似度。
similarity = TextEmbedder.cosine_similarity(
  embedding_result.embeddings[0],
  other_embedding_result.embeddings[0])
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*