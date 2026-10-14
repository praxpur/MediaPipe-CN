---
title: "交互式图像分割任务指南 (Interactive Image Segmentation Task Guide)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/interactive_segmenter"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-01 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 交互式图像分割任务指南 (Interactive Image Segmentation Task Guide)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/interactive_segmenter)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

> **注意:** 本页介绍的是 Interactive Segmenter API。如果您在寻找旧的单次(one-shot)API,请参阅下文[旧版 Interactive Segmenter](#legacy)一节。

![并排图像对比,一张是椅子的照片,另一张是相同图像高亮显示同一把椅子,表明模型已检测出该椅子](../../../assets/edge/mediapipe/images/solutions/examples/interactive-segmenter.png)

MediaPipe Interactive Image Segmenter(交互式图像分割器)任务可以将图像划分为两个区域:选中的物体与其余部分。该任务是有状态的(stateful):您先设置一张图像,然后通过提供不同的笔画(stroke,包括点与画笔模式)指示图像中的位置,即可高效地多次执行分割。任务会估计该位置处物体的边界,并返回定义物体区域的图像数据。您可以使用此任务在图像中交互式地选中物体,并利用输出对图像应用效果,例如用颜色叠加层高亮物体,或模糊其周围背景。此任务基于机器学习(ML)模型对图像数据进行处理。

[立即试用!](https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/interactive_segmenter)

## 开始使用

请按照以下适用于目标平台的实现指南之一开始使用此任务。这些平台专属指南将引导您完成此任务的基础实现,包括推荐的模型,以及带有推荐配置选项的代码示例:

| 平台 | 代码示例 | 指南 |
|---|---|---|
| Android | [代码示例](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/interactive_segmentation/android) | [指南](interactive_segmenter/android.md) |
| Python | [Colab](https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/interactive_segmentation/python/interactive_segmenter.ipynb) | [指南](interactive_segmenter/python.md) |
| Web | [代码示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/interactive-segmenter.ts) | [指南](interactive_segmenter/web_js.md) |

## 任务详情

本节介绍此任务的功能、输入、输出及配置选项。

### 功能特性 (Features)

- **输入图像处理** - 处理包括图像旋转、缩放、归一化和色彩空间转换。

| 任务输入 | 任务输出 |
|---|---|
| - 表示图像中感兴趣区域的笔画(点与画笔模式)<br>- 待处理的图像文件 | 交互式图像分割器输出像素值采用 float32 格式的分割掩码。每个像素值表示该像素属于感兴趣区域处物体的置信度水平。 |

### 配置选项

此任务没有任务专属的配置选项。它仅支持所有任务通用的 BaseOptions 配置,允许您指定:

- **模型资源路径 (Model asset path)**: 项目内预训练任务模型的位置。
- **委托 (Delegate)**: 用于运行任务的处理硬件(如 CPU 或 GPU)。

## 模型

交互式图像分割器可与多个 ML 模型配合使用。开始使用此任务进行开发时,请先使用目标平台的默认推荐模型。其他可用模型通常会在性能、准确性、分辨率与资源需求之间进行权衡,某些情况下还会包含额外功能。

### MagicTouch 模型(推荐)

此模型根据图像中感兴趣区域的坐标来识别分割区域。该模型采用卷积神经网络,架构与 [MobileNetV3](https://www.kaggle.com/models?query=mobilenet-v3) 类似,并带有自定义解码器。

| 模型名称 | 输入尺寸 | 量化类型 | 模型卡 | 版本 |
|---|---|---|---|---|
| [MagicTouch](https://storage.googleapis.com/mediapipe-models/interactive_segmenter_v2/magic_touch/int8/latest/interactive_segmentation.task) | 768 x 768 x 3 | Int8 | [info](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20MagicTouch.pdf) | [Latest](https://storage.googleapis.com/mediapipe-models/interactive_segmenter_v2/magic_touch/int8/latest/interactive_segmentation.task) |

## 任务基准测试

以下是基于上述预训练模型,针对完整流水线的任务基准测试结果。延迟结果为 Pixel 10 上使用 CPU / GPU 的平均延迟。

| 模型名称 | CPU 延迟 | GPU 延迟 |
|---|---|---|
| MagicTouch | 208.2ms | 580.6ms |

## 旧版 Interactive Segmenter

旧版 `InteractiveSegmenterLegacy` API 在单步内执行分割(无状态、单次)。它需要在每次调用时同时传入图像与感兴趣区域(Region of Interest,ROI),导致每笔画一次都要重新提取重量级的图像特征。

强烈建议使用 `InteractiveSegmenterLegacy` 的开发者迁移到有状态的 `InteractiveSegmenter` API,以获得大幅提升的交互性能。

### API 对比

| 特性 | 旧版 API (`InteractiveSegmenterLegacy`) | 新 API (`InteractiveSegmenter`) |
|---|---|---|
| **执行模型** | 无状态(单次) | 有状态(`setImage` + `segment`) |
| **图像特征提取** | 在*每次*笔画时重新提取重量级图像特征 | 使用 `setImage` 只编码*一次*图像特征;在笔画之间复用嵌入 |
| **工作流程** | 每次交互时都将图像 + ROI 传给 `segment` | 调用一次 `setImage(image)`,然后为每次笔画调用 `segment(roi)` |
| **状态** | 旧版 / 已弃用 | **推荐** |

### 迁移路径

迁移到交互式分割器 API:

1. **初始化**: 使用所选选项实例化 `InteractiveSegmenter`。
2. **设置图像**: 在加载或更换目标图像时,调用一次 `setImage(image)`。
3. **处理用户交互**: 在用户绘制笔画或点击点时,重复调用 `segment(regionOfInterest)`。
4. **关闭**: 在处理完当前图像会话后,调用 `close()`。

有关完整的平台集成细节,请参阅各平台指南([Android](interactive_segmenter/android.md)、[Python](interactive_segmenter/python.md)、[Web](interactive_segmenter/web_js.md))。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*