---
title: "Python 平台文本分类指南 (Text Classification Guide for Python)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/text/text_classifier/python"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Python 平台文本分类指南 (Text Classification Guide for Python)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/text/text_classifier/python)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 文本分类器任务(Text Classifier)可将文本分类到一组已定义的类别中,例如正面或负面情感。类别由你使用的模型及该模型的训练方式决定。以下说明介绍如何在 Python 中使用文本分类器。

你可以通过查看 [Web 演示](https://google-ai-edge.github.io/mediapipe-samples-web/#/text/text_classifier)来观看此任务的实际运行效果。有关此任务的能力、模型和配置选项的更多信息,请参阅[概览](../text_classifier.md)。

## 代码示例(Code example)

文本分类器的示例代码提供了此任务在 Python 中的完整实现供你参考。该代码帮助你测试此任务,并开始构建你自己的文本分类应用。你只需使用 Web 浏览器即可查看、运行和编辑文本分类器[示例代码](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/text_classification/python/text_classifier.ipynb)。

如果你要为 Raspberry Pi 实现文本分类器,请参阅 [Raspberry Pi 示例应用](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_classification/raspberry_pi)。

## 环境配置(Setup)

本节介绍为使用文本分类器而配置开发环境和代码项目的关键步骤。有关使用 MediaPipe Tasks 配置开发环境的一般信息(包括平台版本要求),请参阅[环境配置指南(Python)](../../setup_python.md)。

### 软件包(Packages)

文本分类器使用 mediapipe pip 包。你可以使用以下命令安装这些依赖项:

```
$ python -m pip install mediapipe
```

### 导入(Imports)

导入以下类以访问文本分类器任务函数:

```
from mediapipe.tasks import python
from mediapipe.tasks.python import text
```

### 模型(Model)

MediaPipe 文本分类器任务需要与此任务兼容的已训练模型。有关文本分类器可用已训练模型的更多信息,请参阅任务概览的[模型章节](../text_classifier.md#models)。

选择并下载模型,然后将其存放在本地目录中:

```
model_path = '/absolute/path/to/text_classifier.tflite'
```

如下所示,通过 `BaseOptions` 对象的 `model_asset_path` 参数指定模型路径:

```
base_options = BaseOptions(model_asset_path=model_path)
```

## 创建任务(Create the task)

MediaPipe 文本分类器任务使用 `create_from_options` 函数来设置任务。`create_from_options` 函数接受配置选项的值来设置分类器选项。你也可以使用 `create_from_model_path` 工厂函数初始化任务。`create_from_model_path` 函数接受已训练模型文件的相对路径或绝对路径。有关配置选项的更多信息,请参阅[配置选项](#configuration_options)。

以下代码演示了如何构建和配置此任务。

```
base_options = python.BaseOptions(model_asset_path=model_path)
options = text.TextClassifierOptions(base_options=base_options)

with python.text.TextClassifier.create_from_options(options) as classifier:
  classification_result = classifier.classify(text)
```

### 配置选项(Configuration options)

此任务针对 Android 应用有以下配置选项:

| 选项名 | 说明 | 取值范围 | 默认值 |
| --- | --- | --- | --- |
| `display_names_locale` | 设置用于显示名称的标签语言,显示名称由任务模型的元数据提供(如有)。默认为英语 `en`。你可以使用 [TensorFlow Lite Metadata Writer API](https://ai.google.dev/edge/lite/models/metadata_writer_tutorial#natural_language_classifiers) 向自定义模型的元数据中添加本地化标签 | 区域代码 | en |
| `max_results` | 设置可选返回的最高分分类结果的最大条数。若 < 0,则返回所有可用结果。 | 任意正数 | `-1` |
| `score_threshold` | 设置预测分数阈值,用于覆盖模型元数据中提供的阈值(如有)。低于此值的结果将被拒绝。 | 任意浮点数 | 未设置 |
| `category_allowlist` | 设置可选的允许类别名称列表。若非空,则类别名称不在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `category_denylist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |
| `category_denylist` | 设置可选的不允许类别名称列表。若非空,则类别名称在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `category_allowlist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |

## 准备数据(Prepare data)

文本分类器处理文本(`str`)数据。任务负责数据输入的预处理,包括分词(tokenization)和张量预处理。

所有预处理都在 `classify` 函数内部完成。无需事先对输入文本进行额外预处理。

```
input_text = 'The input text to be classified.'
```

## 运行任务(Run the task)

文本分类器使用 `classify` 函数触发推理。对于文本分类,这意味着返回输入文本可能对应的类别。

以下代码演示了如何使用任务模型执行处理。

```
with python.text.TextClassifier.create_from_options(options) as classifier:
  classification_result = classifier.classify(text)
```

## 处理并显示结果(Handle and display results)

文本分类器输出一个 `TextClassifierResult` 对象,其中包含输入文本可能对应的类别列表。类别由你使用的模型定义,因此如果你需要不同的类别,请选择不同的模型,或重新训练现有模型。

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

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*