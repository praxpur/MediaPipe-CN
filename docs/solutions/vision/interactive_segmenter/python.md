---
title: "Python 交互式图像分割指南 (Interactive Image Segmentation Guide for Python)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/interactive_segmenter/python"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Python 交互式图像分割指南 (Interactive Image Segmentation Guide for Python)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/interactive_segmenter/python)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Interactive Image Segmenter(交互式图像分割器)任务接收指示图像中位置的笔画,估计该位置处物体的边界,并返回该物体的分割结果作为图像数据。以下说明介绍如何在 Python 语言中使用交互式图像分割器。有关此任务的功能、模型和配置选项的更多信息,请参阅[概述](../interactive_segmenter.md)。

## 代码示例 (Code example)

交互式图像分割器的示例代码提供了此任务在 Python 中的完整实现,供您参考。此代码可帮助您测试此任务,并开始构建自己的交互式图像分割应用。您可以仅使用网络浏览器查看、运行、编辑和下载交互式图像分割器[示例代码](https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/interactive_segmentation/python/interactive_segmenter.ipynb)。

## 环境配置 (Setup)

本节介绍为使用交互式图像分割器而专门配置开发环境和代码项目的关键步骤。有关使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参阅 [Python 环境配置指南](../../../setup_python.md)。您可以在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/interactive_segmentation/python) 上查看此示例的源代码。

### 软件包 (Packages)

MediaPipe 交互式图像分割器任务需要 `mediapipe` 软件包。您可以使用以下命令安装所需的依赖项:

```
$ python -m pip install mediapipe
```

### 导入 (Imports)

导入以下类以访问交互式图像分割器任务函数:

```
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
```

### 模型

MediaPipe 交互式图像分割器任务需要一个与此任务兼容的训练好的模型。有关交互式图像分割器可用训练模型的更多信息,请参阅任务概述的[模型](../interactive_segmenter.md#models)部分。

选择并下载模型,然后将其存放在项目目录中:

```
model_path = 'interactive_segmentation.task'
```

如下例所示,在 `model_asset_path` 参数中指定模型的路径:

```
base_options = BaseOptions(model_asset_path=model_path)
```

## 创建任务

MediaPipe 交互式图像分割器任务使用 `create_from_options` 函数来设置任务。`create_from_options` 函数接受要处理的配置选项值。有关配置选项的更多信息,请参阅[配置选项](#configuration_options)。以下代码演示如何构建和配置此任务。

```
BaseOptions = mp.tasks.BaseOptions
InteractiveSegmenter = mp.tasks.vision.InteractiveSegmenter
InteractiveSegmenterOptions = mp.tasks.vision.InteractiveSegmenterOptions

# 创建图像分割器实例:
options = InteractiveSegmenterOptions(
    base_options=BaseOptions(model_asset_path='interactive_segmentation.task'))
with InteractiveSegmenter.create_from_options(options) as segmenter:
# segmenter 已初始化,可以开始使用
```

### 配置选项

此任务没有任务专属的配置选项。它仅支持所有任务通用的 `BaseOptions` 配置,允许您指定:

- **模型资源路径 (Model asset path)**: 项目内预训练任务模型的位置。
- **委托 (Delegate)**: 用于运行任务的处理硬件(如 CPU 或 GPU)。

## 准备数据

将输入准备为图像文件或 numpy 数组,然后将其转换为 `mediapipe.Image` 对象。

```
# 从图像文件加载输入图像。
mp_image = mp.Image.create_from_file('/path/to/image')

# 从 numpy 数组加载输入图像。
mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=numpy_image)
```

有关交互式图像分割器数据准备方式的代码示例,请参阅[代码示例](https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/interactive_segmentation/python/interactive_segmenter.ipynb)。

## 运行任务

交互式图像分割器使用 `set_image` 和 `segment` 函数触发推理。`set_image` 函数负责预处理输入数据并运行分割模型。`segment` 函数接收笔画,将模型原始输出后处理为分割掩码。

以下代码示例演示如何用任务模型执行处理。

```
BrushMode = mp.tasks.vision.BrushMode
StrokePoint = mp.tasks.vision.StrokePoint
Stroke = mp.tasks.vision.Stroke

# 设置要分割的图像。
segmenter.set_image(mp_image)

# 使用笔画对提供的图像执行图像分割。
strokes = [Stroke(brush_mode=BrushMode.POSITIVE, points=[StrokePoint(0.5, 0.5)], is_completed=True)]
segmented_mask = segmenter.segment(strokes)
```

有关运行交互式图像分割器推理的更完整示例,请参阅[代码示例](https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/interactive_segmentation/python/interactive_segmenter.ipynb)。

## 处理并显示结果

交互式图像分割器的输出结果是 `Image` 数据,表示像素属于感兴趣区域处物体的置信度分数。

以下小节进一步说明此任务的输出数据:

### 置信度掩码

交互式分割器的输出是单通道置信度掩码,针对图像的每个像素包含 `[0.0, 1.0]` 范围内的浮点值,尺寸与输入图像一致。数值越高,表示该图像像素属于感兴趣区域处物体的置信度越高。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*