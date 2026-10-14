---
title: "文本分类 (Text Classification)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/text/text_classifier"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-01 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 文本分类 (Text Classification)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/text/text_classifier)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

![示例 UI:输入一条正面电影评论,输出为五颗星和一个竖大拇指。](../../../assets/edge/mediapipe/images/solutions/examples/text_classifier.png)

MediaPipe 文本分类器任务(Text Classifier)可将文本分类到一组已定义的类别中,例如正面或负面情感。类别在模型训练期间定义。该任务基于机器学习(ML)模型将文本数据作为静态数据处理,并输出一组类别及其可能性分数。

[立即尝试!](https://google-ai-edge.github.io/mediapipe-samples-web/#/text/text_classifier)

## 入门(Get Started)

按照以下针对你所用平台的实现指南之一开始使用此任务:

| 平台 | 代码示例 | 指南 |
| --- | --- | --- |
| Android | [代码示例](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_classification/android) | [指南](text_classifier/android.md) |
| iOS | [代码示例](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_classification/ios) | [指南](text_classifier/ios.md) |
| Python | [Colab](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/text_classification/python/text_classifier.ipynb) | [指南](text_classifier/python.md) |
| Web | [代码示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/text-classifier.ts) | [指南](text_classifier/web_js.md) |

这些平台专属指南会引导你完成此任务的基础实现,包括推荐模型,以及带推荐配置选项的代码示例。

## 任务详情(Task details)

本节介绍此任务的能力、输入、输出与配置选项。

### 特性(Features)

- **输入文本处理(Input text processing)** - 支持对未内置图内分词(graph-internal tokenization)的模型进行图外分词(out-of-graph tokenization)
- **多分类头(Multiple classification heads)** - 每个头可使用自己的类别集
- **标签映射区域设置(Label map locale)** - 设置显示名称所使用的语言
- **分数阈值(Score threshold)** - 基于预测分数过滤结果
- **Top-k 分类结果(Top-k classification results)** - 过滤检测结果的数量
- **标签允许列表与拒绝列表(Label allowlist and denylist)** - 指定要检测的类别

| 任务输入 | 任务输出 |
| --- | --- |
| 文本分类器接受以下输入数据类型:- 字符串(String) | 文本分类器输出一组类别,包含:- 类别索引:类别在模型输出中的索引- 分数:该类别的置信度分数,以 0 到 1 之间的浮点数值表示。- 类别名称(可选):TensorFlow Lite 模型元数据中指定的类别名称(如有)。- 类别显示名称(可选):TensorFlow Lite 模型元数据中指定的类别显示名称,使用显示名称区域设置选项指定的语言(如有)。 |

> **注意:** 此任务支持对提供的 ML 模型进行修改,也支持自定义模型。有关为此任务使用修改后模型或自定义模型的更多信息,请参阅[自定义模型](#custom_models)。

### 配置选项(Configuration options)

此任务具有以下配置选项:

| 选项名 | 说明 | 取值范围 | 默认值 |
| --- | --- | --- | --- |
| `displayNamesLocale` | 设置用于显示名称的标签语言,显示名称由任务模型的元数据提供(如有)。默认为英语 `en`。你可以使用 [TensorFlow Lite Metadata Writer API](https://ai.google.dev/edge/lite/models/metadata_writer_tutorial#natural_language_classifiers) 向自定义模型的元数据中添加本地化标签 | 区域代码 | en |
| `maxResults` | 设置可选返回的最高分分类结果的最大条数。若 < 0,则返回所有可用结果。 | 任意正数 | `-1` |
| `scoreThreshold` | 设置预测分数阈值,用于覆盖模型元数据中提供的阈值(如有)。低于此值的结果将被拒绝。 | 任意浮点数 | 未设置 |
| `categoryAllowlist` | 设置可选的允许类别名称列表。若非空,则类别名称不在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `categoryDenylist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |
| `categoryDenylist` | 设置可选的不允许类别名称列表。若非空,则类别名称在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `categoryAllowlist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |

## 模型(Models)

文本分类器可配合多个 ML 模型使用。开始使用此任务进行开发时,请从目标平台的默认推荐模型入手。其他可用模型通常会在性能、准确率、分辨率与资源需求之间做出权衡,某些情况下还包含额外功能。

预训练模型针对情感分析训练,用于预测输入文本的情感是正面还是负面。这些模型在 [SST-2](https://nlp.stanford.edu/sentiment/index.html)(斯坦福情感树库)数据集上训练,该数据集由标记为正面或负面的电影评论组成。请注意,这些模型仅支持英语。由于它们是在电影评论数据集上训练的,对于其他主题领域的文本,你可能观察到质量下降。

### BERT 分类器模型(推荐)

该模型采用基于 BERT 的架构(具体为 [MobileBERT 模型](https://arxiv.org/abs/2004.02984)),因其高准确率而成为推荐选择。它包含允许任务执行图外 BERT 分词的元数据。

| 模型名 | 输入形状 | 量化类型 | 版本 |
| --- | --- | --- | --- |
| [BERT 分类器](https://storage.googleapis.com/mediapipe-models/text_classifier/bert_classifier/float32/latest/bert_classifier.tflite) | [1x128],[1x128],[1x128] | [动态范围](https://www.tensorflow.org/lite/performance/post_training_quant) | [最新版](https://storage.googleapis.com/mediapipe-models/text_classifier/bert_classifier/float32/latest/bert_classifier.tflite) |

### 平均词嵌入模型(Average word embedding model)

该模型采用平均词嵌入(average word-embedding)架构。与 BERT 分类器相比,该模型以较低的预测准确率为代价,提供更小的模型体积和更低的延迟。通过额外训练来定制此模型也比训练基于 BERT 的分类器更快。该模型包含允许任务执行图外正则表达式分词(regex tokenization)的元数据。

| 模型名 | 输入形状 | 量化类型 | 版本 |
| --- | --- | --- | --- |
| [平均词嵌入](https://storage.googleapis.com/mediapipe-models/text_classifier/average_word_classifier/float32/latest/average_word_classifier.tflite) | 1 x 256 | None (float32) | [最新版](https://storage.googleapis.com/mediapipe-models/text_classifier/average_word_classifier/float32/latest/average_word_classifier.tflite) |

### 任务基准(Task benchmarks)

以下为基于上述预训练模型的整体管线的任务基准。延迟结果为 Pixel 6 上使用 CPU / GPU 的平均延迟。

| 模型名 | CPU 延迟 | GPU 延迟 |
| --- | --- | --- |
| 平均词嵌入 | 0.14ms | - |
| BERT 分类器 | 57.68ms | - |

### 自定义模型(Custom models)

如果你想改进或改变所提供的模型的能力,可以将自定义 ML 模型与此任务一起使用。你可以使用 Model Maker 修改现有模型,或使用 TensorFlow 等工具构建模型。与 MediaPipe 一起使用的自定义模型必须采用 [TensorFlow Lite](https://developers.google.com/edge/lite/models/trained) 格式,并且必须包含描述模型运行参数的特定[元数据](https://developers.google.com/edge/lite/models/metadata)。在构建你自己的模型之前,你应该考虑使用 Model Maker 为此任务修改所提供的模型。

> **注意:** 如果你有兴趣使用自己的数据集创建自定义文本分类器,请参阅[文本分类器定制](text_classifier/customize.md)教程。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*