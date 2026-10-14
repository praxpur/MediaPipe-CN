---
title: "音频分类 (Audio Classification)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/audio/audio_classifier"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-09 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 音频分类 (Audio Classification)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/audio/audio_classifier)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

![波形与鸣叫声匹配的鸟的照片上叠加的鸟鸣声波形图](../../../assets/edge/mediapipe/images/solutions/examples/audio_classifier.png)

MediaPipe 音频分类器(Audio Classifier)任务允许你将音频片段分类到一组定义的类别中,例如吉他音乐、火车鸣笛声或鸟鸣声。类别在模型训练时确定。此任务使用机器学习(ML)模型将音频数据作为独立音频片段或连续数据流进行处理,并输出按概率分数降序排列的潜在类别列表。

[立即体验](https://google-ai-edge.github.io/mediapipe-samples-web/#/audio/audio_classifier)

## 快速入门 (Get Started)

要开始使用此任务,请按照适用于你的目标平台的实现指南之一进行操作。这些平台专属指南会逐步引导你完成此任务的基础实现,包括推荐模型,以及带推荐配置选项的代码示例:

| 平台 (Platform) | 代码示例 (Code Example) | 指南 (Guide) |
|---|---|---|
| Android | [代码示例](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/audio_classifier/android) | [指南](android.md) |
| iOS | [代码示例](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/audio_classifier/ios) | [指南](ios.md) |
| Python | [Colab](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/audio_classifier/python/audio_classification.ipynb) | [指南](python.md) |
| Web | [代码示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/audio-classifier.ts) | [指南](web_js.md) |

这些平台专属指南会逐步引导你完成此任务的基础实现,包括推荐模型,以及带推荐配置选项的代码示例。

## 任务详情 (Task details)

本节介绍此任务的功能、输入、输出和配置选项。

### 功能 (Features)

- **输入音频处理 (Input audio processing)** - 处理包括音频重采样、缓冲、分帧和傅里叶变换。
- **标签映射区域设置 (Label map locale)** - 设置显示名称使用的语言
- **分数阈值 (Score threshold)** - 根据预测分数过滤结果。
- **Top-k 检测 (Top-k detection)** - 过滤检测结果的数量。
- **标签白名单和黑名单 (Label allowlist and denylist)** - 指定要检测的类别。

| 任务输入 (Task inputs) | 任务输出 (Task outputs) |
|---|---|
| 输入可以是以下数据类型之一:<br><ul><li>音频片段 (Audio clips)</li><li>音频数据流 (Audio stream)</li></ul> | 音频分类器输出一个类别列表,包含:<br><ul><li>类别索引 (Category index):类别在模型输出中的索引</li><li>分数 (Score):该类别的置信度分数,通常是 [0,1] 范围内的概率</li><li>类别名称(可选):TFLite 模型元数据中指定的类别名称(如果可用)</li><li>类别显示名称(可选):TFLite 模型元数据中指定的类别显示名称,采用通过显示名称区域设置选项指定的语言(如果可用)</li></ul> |

### 配置选项 (Configurations options)

此任务具有以下配置选项:

| 选项名称 (Option Name) | 描述 (Description) | 取值范围 (Value Range) | 默认值 (Default Value) |
|---|---|---|---|
| `running_mode` | 设置任务的运行模式。音频分类器有两种模式:<br><br>AUDIO_CLIPS:在独立音频片段上运行音频任务的模式。<br><br>AUDIO_STREAM:在音频数据流(如来自麦克风)上运行音频任务的模式。在此模式下,必须调用 resultListener 来设置监听器,以异步接收分类结果。 | {`AUDIO_CLIPS, AUDIO_STREAM`} | `AUDIO_CLIPS` |
| `display_names_locale` | 设置用于显示名称的标签语言(取自任务模型元数据,如果可用)。默认为 `en`(英语)。你可以使用 [TensorFlow Lite Metadata Writer API](https://ai.google.dev/edge/lite/models/metadata_writer_tutorial#audio_classifiers) 为自定义模型的元数据添加本地化标签。 | 区域设置代码 (Locale code) | en |
| `max_results` | 设置要返回的得分最高的分类结果的可选最大数量。如果 < 0,将返回所有可用结果。 | 任意正数 | `-1` |
| `score_threshold` | 设置预测分数阈值,用于覆盖模型元数据中提供的阈值(如果有)。低于此值的结果将被拒绝。 | [0.0, 1.0] | 未设置 |
| `category_allowlist` | 设置可选的白名单类别名称列表。若非空,分类结果中类别名称不在此集合内的将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `category_denylist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |
| `category_denylist` | 设置可选的黑名单类别名称列表。若非空,分类结果中类别名称在此集合内的将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `category_allowlist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |
| `result_callback` | 设置在音频分类器处于音频数据流模式时异步接收分类结果的结果监听器。只能在运行模式设置为 `AUDIO_STREAM` 时使用。 | 不适用 | 未设置 |

> **注意:** `resultListener` 依赖于 `runningMode`。只有在 `runningMode` 设置为 `AUDIO_STREAM` 时才设置 `resultListener`。

> **注意:** 类别白名单与黑名单互斥。

## 模型 (Models)

音频分类器需要一个音频分类模型,并将其下载并存储在你的项目目录中。开始使用此任务进行开发时,请先从适合你的目标平台的默认推荐模型入手。其他可用模型通常在性能、准确率、分辨率、资源需求之间进行权衡,某些情况下还会包含额外的功能。

### Yamnet 模型(推荐)

Yamnet 模型是在 [AudioSet](https://research.google.com/audioset/) 数据集上训练的音频事件分类器,用于预测 AudioSet 数据中定义的音频事件。关于此模型可识别的音频事件,请参见模型的[标签列表](https://storage.googleapis.com/mediapipe-tasks/audio_classifier/yamnet_label_list.txt)。

| 模型名称 (Model name) | 输入形状 (Input shape) | 量化类型 (Quantization type) | 版本 (Versions) |
|---|---|---|---|
| [YamNet](https://storage.googleapis.com/mediapipe-models/audio_classifier/yamnet/float32/latest/yamnet.tflite) | 1 x 15600 | 无 (None,float32) | [最新版](https://storage.googleapis.com/mediapipe-models/audio_classifier/yamnet/float32/latest/yamnet.tflite) |

## 任务基准测试 (Task benchmarks)

以下是基于上述预训练模型的完整流水线(pipeline)的任务基准测试。延迟(latency)结果为 Pixel 6 上使用 CPU / GPU 的平均延迟。

| 模型名称 (Model Name) | CPU 延迟 (CPU Latency) | GPU 延迟 (GPU Latency) |
|---|---|---|
| YamNet | 12.29ms | - |

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*