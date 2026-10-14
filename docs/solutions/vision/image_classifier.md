---
title: "图像分类 (Image classification task guide)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/image_classifier"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-02 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 图像分类任务指南 (Image classification task guide)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/image_classifier)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

![一只动物被正确标记为火烈鸟,置信度为 95%](../../../assets/edge/mediapipe/images/solutions/examples/image_classifier.png)

MediaPipe Image Classifier(图像分类器)任务可让您对图像执行分类。您可以使用此任务识别图像在训练时定义的类别集合中表示的内容。此任务以静态数据或连续数据流的形式,使用机器学习 (ML) 模型处理图像数据,并输出一个按概率分数降序排列的潜在类别列表。

[立即试用!](https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_classifier)

## 开始使用

通过为目标平台实施指南开始使用此任务。这些平台专属指南将引导您完成此任务的基本实现,使用推荐的模型,并提供带有推荐配置选项的代码示例:

| 平台 | 代码示例 | 指南 |
|---|---|---|
| Android | [代码示例](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_classification/android) | [指南](android.md) |
| iOS | [代码示例](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_classification/ios) | [指南](ios.md) |
| Python | [Colab](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/image_classification/python/image_classifier.ipynb) | [指南](python.md) |
| Web | [代码示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/image-classifier.ts) | [指南](web_js.md) |

> **注意:** 如果您有兴趣使用自己的数据集创建自定义图像分类器,请参阅[图像分类器定制](customize.md)教程。

## 任务详情

本节介绍此任务的功能、输入、输出和配置选项。

### 特性

-   **输入图像处理** — 处理包括图像旋转、调整大小、归一化和色彩空间转换。
-   **感兴趣区域 (Region of interest)** — 对图像的某个区域而非整张图像执行分类。
-   **标签映射语言环境 (Label map locale)** — 设置用于显示名称的语言。
-   **分数阈值** — 根据预测分数过滤结果。
-   **Top-k 分类** — 限制分类结果的数量。
-   **标签允许列表与拒绝列表** — 指定要分类的类别。

| 任务输入 | 任务输出 |
|---|---|
| 输入可以是以下数据类型之一:<br><br>- 静态图片<br><br>- 已解码的视频帧<br><br>- 实时视频流 | Image Classifier 输出一个类别列表,其中包含:<br><br>- 类别索引:该类别在模型输出中的索引<br><br>- 分数:该类别的置信度分数,通常是 \[0,1\] 范围内的概率<br><br>- 类别名称(可选):如果可用,为 TFLite 模型元数据中指定的类别名称<br><br>- 类别显示名称(可选):如果可用,为 TFLite 模型元数据中指定的类别显示名称,语言由显示名称语言环境选项指定 |

> **注意:** 此任务支持修改提供的 ML 模型以及自定义模型。有关对此任务使用修改后或自定义模型的更多信息,请参阅[自定义模型](#custom_models)。

### 配置选项

此任务有以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `running_mode` | 设置任务的运行模式。共有三种模式:<br><br>IMAGE:用于单张图像输入的模式。<br><br>VIDEO:用于视频已解码帧的模式。<br><br>LIVE_STREAM:用于输入数据实时流(如来自摄像头)的模式。在此模式下,必须调用 resultListener 来设置监听器,以异步接收结果。 | {`IMAGE, VIDEO, LIVE_STREAM`} | `IMAGE` |
| `display_names_locale` | 设置标签的语言,用于显示任务模型元数据中提供的显示名称(如果有)。默认为 `en`(英语)。您可以使用 [TensorFlow Lite Metadata Writer API](https://ai.google.dev/edge/lite/models/metadata_writer_tutorial) 向自定义模型的元数据中添加本地化标签。 | 语言环境代码 | en |
| `max_results` | 设置要返回的最高分分类结果的可选最大数量。如果 < 0,将返回所有可用结果。 | 任意正数 | `-1` |
| `score_threshold` | 设置预测分数阈值,覆盖模型元数据中提供的阈值(如果有)。低于此值的结果将被拒绝。 | 任意浮点数 | 未设置 |
| `category_allowlist` | 设置允许的类别名称的可选列表。如果不为空,类别名称不在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `category_denylist` 互斥,同时使用两者会报错。 | 任意字符串 | 未设置 |
| `category_denylist` | 设置不允许的类别名称的可选列表。如果不为空,类别名称在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `category_allowlist` 互斥,同时使用两者会报错。 | 任意字符串 | 未设置 |
| `result_callback` | 设置结果监听器,以便在 Image Classifier 处于实时流模式时异步接收分类结果。只能在运行模式设置为 `LIVE_STREAM` 时使用。 | N/A | 未设置 |

> **注意:** `resultListener` 依赖于 `runningMode`。仅当 `runningMode` 设置为 `LIVE_STREAM` 时才需设置 `resultListener`。

> **注意:** 类别允许列表与拒绝列表是互斥的。

## 模型

Image Classifier 需要一个图像分类模型,下载后存储在您的项目目录中。开始使用此任务进行开发时,请从目标平台的默认推荐模型入手。其他可用模型通常在性能、准确率、分辨率和资源需求之间进行权衡,有些情况下还会包含附加功能。

### EfficientNet-Lite0 模型(推荐)

EfficientNet-Lite0 模型使用 EfficientNet 架构,并使用 [ImageNet](https://www.image-net.org) 训练,可识别 1,000 个类别,如树木、动物、食物、车辆、人等。请参阅受支持标签的[完整列表](https://storage.googleapis.com/mediapipe-tasks/image_classifier/labels.txt)。EfficientNet-Lite0 提供 int8 和 float 32 两种模型。推荐此模型是因为它在延迟和准确率之间取得了平衡。对于许多用例,它都足够准确且足够轻量。

| 模型名称 | 输入形状 | 量化类型 | 版本 |
|---|---|---|---|
| [EfficientNet-Lite0 (int8)](https://storage.googleapis.com/mediapipe-models/image_classifier/efficientnet_lite0/int8/latest/efficientnet_lite0.tflite) | 224 x 224 | int8 | [最新](https://storage.googleapis.com/mediapipe-models/image_classifier/efficientnet_lite0/int8/latest/efficientnet_lite0.tflite) |
| [EfficientNet-Lite0 (float 32)](https://storage.googleapis.com/mediapipe-models/image_classifier/efficientnet_lite0/float32/latest/efficientnet_lite0.tflite) | 224 x 224 | None (float32) | [最新](https://storage.googleapis.com/mediapipe-models/image_classifier/efficientnet_lite0/float32/latest/efficientnet_lite0.tflite) |

### EfficientNet-Lite2 模型

EfficientNet-Lite2 模型使用 EfficientNet 架构,并使用 [ImageNet](https://www.image-net.org) 训练,可识别 1,000 个类别,如树木、动物、食物、车辆、人等。请参阅受支持标签的[完整列表](https://storage.googleapis.com/mediapipe-tasks/image_classifier/labels.txt)。EfficientNet-Lite2 提供 int8 和 float 32 两种模型。此模型通常比 EfficientNet-Lite0 更准确,但也更慢、更消耗内存。此模型适用于准确率优先于速度或大小的用例。

| 模型名称 | 输入形状 | 量化类型 | 版本 |
|---|---|---|---|
| [EfficientNet-Lite2 (int8)](https://storage.googleapis.com/mediapipe-models/image_classifier/efficientnet_lite2/float32/latest/efficientnet_lite2.tflite) | 224 x 224 | int8 | [最新](https://storage.googleapis.com/mediapipe-models/image_classifier/efficientnet_lite2/float32/latest/efficientnet_lite2.tflite) |
| [EfficientNet-Lite2 (float 32)](https://storage.googleapis.com/mediapipe-models/image_classifier/efficientnet_lite2/float32/latest/efficientnet_lite2.tflite) | 224 x 224 | None (float32) | [最新](https://storage.googleapis.com/mediapipe-models/image_classifier/efficientnet_lite2/float32/latest/efficientnet_lite2.tflite) |

### 任务基准测试

以下为基于上述预训练模型的完整管线的任务基准测试。延迟结果为 Pixel 6 上使用 CPU / GPU 的平均延迟。

| 模型名称 | CPU 延迟 | GPU 延迟 |
|---|---|---|
| EfficientNet-Lite0 (float 32) | 23.52ms | 18.90ms |
| EfficientNet-Lite0 (int8) | 10.08ms | - |
| EfficientNet-Lite2 (float 32) | 44.17ms | 22.20ms |
| EfficientNet-Lite2 (int8) | 19.43ms | - |

### 自定义模型

如果您想改进或改变所提供模型的能力,可以将自定义 ML 模型与此任务一起使用。您可以使用 Model Maker 修改现有模型,或使用 TensorFlow 等工具构建模型。与 MediaPipe 一起使用的自定义模型必须是 [TensorFlow Lite](https://developers.google.com/edge/litert/migration) 格式,并且必须包含描述模型运行参数的特定[元数据](https://developers.google.com/edge/litert/conversion/tensorflow/metadata)。在构建自己的模型之前,您应该考虑使用 Model Maker 为此任务修改所提供的模型。

如果您有兴趣使用自己的数据集创建自定义图像分类器,请从[图像分类器定制](customize.md)教程开始。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*