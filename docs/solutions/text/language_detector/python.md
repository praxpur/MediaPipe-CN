---
title: "Python 平台语言检测指南 (Language Detection Guide for Python)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/text/language_detector/python"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-09-02 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Python 平台语言检测指南 (Language Detection Guide for Python)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/text/language_detector/python)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 语言检测器任务(Language Detector)可识别一段文本的语言。以下说明介绍如何在 Python 中使用语言检测器。本说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/language_detector/python) 上获取。

你可以通过查看[演示](https://google-ai-edge.github.io/mediapipe-samples-web/#/text/language_detector)来观看此任务的实际运行效果。有关此任务的能力、模型和配置选项的更多信息,请参阅[概览](../language_detector.md)。

## 代码示例(Code example)

语言检测器的示例代码提供了此任务在 Python 中的完整实现供你参考。该代码帮助你测试此任务,并开始构建你自己的语言检测功能。你只需使用 Web 浏览器即可查看、运行和编辑语言检测器[示例代码](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/language_detector/python/%5BMediaPipe_Python_Tasks%5D_Language_Detector.ipynb)。

## 环境配置(Setup)

本节介绍为使用语言检测器而配置开发环境和代码项目的关键步骤。有关使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参阅[环境配置指南(Python)](../../setup_python.md)。

### 软件包(Packages)

语言检测器使用 mediapipe pip 包。你可以使用以下命令安装依赖项:

```
$ python -m pip install mediapipe
```

### 导入(Imports)

导入以下类以访问语言检测器任务函数:

```
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import text
```

### 模型(Model)

MediaPipe 语言检测器任务需要与此任务兼容的已训练模型。有关语言检测器可用已训练模型的更多信息,请参阅任务概览的[模型](../language_detector.md#models)章节。

选择并下载模型,然后将其存放在你的项目目录中:

```
model_path = '/absolute/path/to/language_detector.tflite'
```

如下所示,通过 `BaseOptions` 对象的 `model_asset_path` 参数指定模型路径:

```
base_options = BaseOptions(model_asset_path=model_path)
```

## 创建任务(Create the task)

MediaPipe 语言检测器任务使用 `create_from_options` 函数来设置任务。`create_from_options` 函数接受配置选项的值来设置检测器选项。你也可以使用 `create_from_model_path` 工厂函数初始化任务。`create_from_model_path` 函数接受已训练模型文件的相对路径或绝对路径。有关配置任务的更多信息,请参阅[配置选项](#configuration_options)。

以下代码演示了如何构建和配置此任务。

```
base_options = python.BaseOptions(model_asset_path=model_path)
options = text.LanguageDetectorOptions(base_options=base_options)
```

### 配置选项(Configuration options)

此任务针对 Python 应用有以下配置选项:

| 选项名 | 说明 | 取值范围 | 默认值 |
| --- | --- | --- | --- |
| `max_results` | 设置可选返回的最高分语言预测的最大条数。若该值小于零,则返回所有可用结果。 | 任意正数 | `-1` |
| `score_threshold` | 设置预测分数阈值,用于覆盖模型元数据中提供的阈值(如有)。低于此值的结果将被拒绝。 | 任意浮点数 | 未设置 |
| `category_allowlist` | 设置可选的允许语言代码列表。若非空,则语言代码不在此集合中的语言预测将被过滤掉。此选项与 `category_denylist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |
| `category_denylist` | 设置可选的不允许语言代码列表。若非空,则语言代码在此集合中的语言预测将被过滤掉。此选项与 `category_allowlist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |

## 准备数据(Prepare data)

语言检测器处理文本(`str`)数据。任务负责数据输入的预处理,包括分词(tokenization)和张量预处理。所有预处理都在 `detect` 函数内部完成。无需事先对输入文本进行额外预处理。

```
input_text = 'The input text to be classified.'
```

## 运行任务(Run the task)

语言检测器使用 `detect` 函数触发推理。对于语言检测,这意味着返回输入文本可能对应的语言。

以下代码演示了如何使用任务模型执行处理。

```
with python.text.LanguageDetector.create_from_options(options) as detector:
  detection_result = detector.detect(input_text)
```

## 处理并显示结果(Handle and display results)

语言检测器输出一个 `LanguageDetectorResult`,其中包含一组语言预测及这些预测对应的概率。以下展示此任务输出数据的示例:

```
LanguageDetectorResult:
  LanguagePrediction #0:
    language_code: "fr"
    probability: 0.999781
```

该结果是通过将模型运行于输入文本 `"Il y a beaucoup de bouches qui parlent et fort peu de têtes qui pensent."` 上得到的。

处理并可视化此任务结果所需代码的示例,请参阅 [Python 示例应用](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/language_detector/python/%5BMediaPipe_Python_Tasks%5D_Language_Detector.ipynb)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*