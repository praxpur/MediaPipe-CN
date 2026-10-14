---
title: "Python 图像嵌入指南 (Image embedding guide for Python)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/image_embedder/python"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-09 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Python 图像嵌入指南 (Image embedding guide for Python)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/image_embedder/python)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 图像嵌入器(Image Embedder)任务可将图像数据转换为数值表示形式,以完成与 ML 相关的图像处理任务,例如比较两张图像的相似度。这些说明向您展示如何将图像嵌入器与 Python 一起使用。

有关此任务的功能、模型和配置选项的更多信息,请参阅[概览](../image_embedder.md)。

## 代码示例 (Code example)

图像嵌入器的示例代码提供了此任务在 Python 中的完整实现,供您参考。此代码可帮助您测试此任务,并开始构建自己的图像嵌入器。您只需使用 Web 浏览器即可通过 Google Colab 查看、运行和编辑图像嵌入器[示例代码](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/image_embedder/python/image_embedder.ipynb)。您也可以在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_embedder/python) 上查看此示例的源代码。

## 环境配置 (Setup)

本节介绍为使用图像嵌入器配置开发环境和代码项目的关键步骤。有关使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参阅 [Python 环境配置指南](../../../setup_python.md)。

### 软件包 (Packages)

图像嵌入器任务需要 mediapipe pip 软件包。您可以使用以下命令安装该依赖项:

```
$ python -m pip install mediapipe
```

### 导入 (Imports)

导入以下类以访问图像嵌入器任务函数:

```
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
```

### 模型 (Model)

MediaPipe 图像嵌入器任务需要一个与此任务兼容的已训练模型。有关图像嵌入器可用已训练模型的更多信息,请参阅任务概览的[模型章节](../image_embedder.md#models)。

选择并下载模型,然后将其存储在本地目录中。您可以使用推荐的 [MobileNetV3](https://storage.googleapis.com/mediapipe-tasks/image_embedder/mobilenet_v3_small_075_224_embedder.tflite) 模型。

```
model_path = '/absolute/path/to/mobilenet_v3_small_075_224_embedder.tflite'
```

在 `model_asset_path` 参数中指定模型的路径,如下所示:

```
base_options = BaseOptions(model_asset_path=model_path)
```

## 创建任务 (Create the task)

您可以使用 `create_from_options` 函数创建任务。`create_from_options` 函数接受配置选项来设置嵌入器选项。有关配置选项的更多信息,请参阅[配置概览](#configuration)。

图像嵌入器任务支持 3 种输入数据类型:静态图像、视频文件和实时视频流。选择与您的输入数据类型对应的标签页,了解如何创建任务并运行推理。

### 图像 (Image)

```
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
ImageEmbedder = mp.tasks.vision.ImageEmbedder
ImageEmbedderOptions = mp.tasks.vision.ImageEmbedderOptions
VisionRunningMode = mp.tasks.vision.RunningMode

options = ImageEmbedderOptions(
    base_options=BaseOptions(model_asset_path='/path/to/model.tflite'),
    quantize=True,
    running_mode=VisionRunningMode.IMAGE)

with ImageEmbedder.create_from_options(options) as embedder:
  # 嵌入器已初始化。请在此处使用它。
  # ...
```

### 视频 (Video)

```
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
ImageEmbedder = mp.tasks.vision.ImageEmbedder
ImageEmbedderOptions = mp.tasks.vision.ImageEmbedderOptions
VisionRunningMode = mp.tasks.vision.RunningMode

options = ImageEmbedderOptions(
    base_options=BaseOptions(model_asset_path='/path/to/model.tflite'),
    quantize=True,
    running_mode=VisionRunningMode.VIDEO)

with ImageEmbedder.create_from_options(options) as embedder:
  # 嵌入器已初始化。请在此处使用它。
  # ...
```

### 实时流 (Live stream)

```
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
ImageEmbedderResult = mp.tasks.vision.ImageEmbedder.ImageEmbedderResult
ImageEmbedder = mp.tasks.vision.ImageEmbedder
ImageEmbedderOptions = mp.tasks.vision.ImageEmbedderOptions
VisionRunningMode = mp.tasks.vision.RunningMode

def print_result(result: ImageEmbedderResult, output_image: mp.Image, timestamp_ms: int):
    print('ImageEmbedderResult result: {}'.format(result))

options = ImageEmbedderOptions(
    base_options=BaseOptions(model_asset_path='/path/to/model.tflite'),
    running_mode=VisionRunningMode.LIVE_STREAM,
    quantize=True,
    result_callback=print_result)

with ImageEmbedder.create_from_options(options) as embedder:
  # 嵌入器已初始化。请在此处使用它。
  # ...
```

### 配置选项 (Configuration options)

此任务为 Python 应用提供以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
| --- | --- | --- | --- |
| `running_mode` | 设置任务的运行模式。共有三种模式:IMAGE:用于单张图像输入的模式。VIDEO:用于视频解码帧的模式。LIVE\_STREAM:用于输入数据实时流(例如来自摄像头)的模式。在此模式下,必须调用 resultListener 来设置监听器以异步接收结果。 | {`IMAGE, VIDEO, LIVE_STREAM`} | `IMAGE` |
| `l2_normalize` | 是否使用 L2 范数对返回的特征向量进行归一化。仅当模型尚未包含原生的 L2\_NORMALIZATION TFLite Op 时才使用此选项。在大多数情况下,模型已经包含该 Op,因此通过 TFLite 推理即可实现 L2 归一化,无需此选项。 | `Boolean` | `False` |
| `quantize` | 返回的嵌入是否通过标量量化量化为字节。嵌入被隐式假定为单位范数,因此任何维度都保证值在 [-1.0, 1.0] 范围内。如果不是这种情况,请使用 l2\_normalize 选项。 | `Boolean` | `False` |
| `result_callback` | 设置结果监听器,当图像嵌入器处于实时流模式时异步接收嵌入结果。仅当运行模式设置为 `LIVE_STREAM` 时才能使用 | 不适用 | 未设置 |

## 准备数据 (Prepare data)

将您的输入准备为图像文件或 numpy 数组,然后将其转换为 `mediapipe.Image` 对象。如果您的输入是视频文件或来自网络摄像头的实时流,您可以使用 [OpenCV](https://github.com/opencv/opencv) 等外部库将输入帧加载为 numpy 数组。

### 图像 (Image)

```
import mediapipe as mp

# 从图像文件加载输入图像。
mp_image = mp.Image.create_from_file('/path/to/image')

# 从 numpy 数组加载输入图像。
mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=numpy_image)
```

### 视频 (Video)

```
import mediapipe as mp

# 使用 OpenCV 的 VideoCapture 加载输入视频。

# 使用 OpenCV 的 CV_CAP_PROP_FPS 加载视频的帧率
# 您需要用它来计算每帧的时间戳。

# 使用 VideoCapture#read() 遍历视频中的每一帧

# 将从 OpenCV 接收的帧转换为 MediaPipe 的 Image 对象。
mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=numpy_frame_from_opencv)
```

### 实时流 (Live stream)

```
import mediapipe as mp

# 使用 OpenCV 的 VideoCapture 开始从网络摄像头捕获。

# 创建一个循环,使用 VideoCapture#read() 读取摄像头的最新帧

# 将从 OpenCV 接收的帧转换为 MediaPipe 的 Image 对象。
mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=numpy_frame_from_opencv)
```

> **注意:** 图像嵌入器任务会自动调整大小、填充和归一化输入图像,以匹配其模型的输入要求。

## 运行任务 (Run the task)

您可以调用与运行模式对应的 embed 函数来触发推理。图像嵌入器 API 将返回输入图像或帧的嵌入向量。

### 图像 (Image)

```
# 对提供的单张图像执行图像嵌入。
embedding_result = embedder.embed(mp_image)
```

### 视频 (Video)

```
# 计算当前帧的时间戳
frame_timestamp_ms = 1000 * frame_index / video_file_fps

# 对视频帧执行图像嵌入。
embedding_result = embedder.embed_for_video(mp_image, frame_timestamp_ms)
```

### 实时流 (Live stream)

```
# 发送最新帧以执行图像嵌入。
# 结果将发送到 `ImageEmbedderOptions` 中提供的 `result_callback`。
embedder.embed_async(mp_image, frame_timestamp_ms)
```

请注意以下事项:

- 在视频模式或实时流模式下运行时,您还必须向图像嵌入器任务提供输入帧的时间戳。
- 在图像或视频模式下运行时,图像嵌入器任务将阻塞当前线程,直到处理完输入图像或帧。
- 在实时流模式下运行时,图像嵌入器任务不会阻塞当前线程,而是立即返回。每次处理完输入帧后,它都会使用嵌入结果调用其结果监听器。如果在图像嵌入器任务忙于处理另一帧时调用 `embedAsync` 函数,任务会忽略新的输入帧。

## 处理并显示结果 (Handle and display results)

运行推理后,图像嵌入器任务会返回一个 `ImageEmbedderResult` 对象,其中包含输入图像或帧中对象的可能类别列表。

以下内容展示了此任务的输出数据示例:

```
ImageEmbedderResult:
  Embedding #0 (sole embedding head):
    float_embedding: {0.0, 0.0, ..., 0.0, 1.0, 0.0, 0.0, 2.0}
    head_index: 0
```

该结果是通过嵌入以下图像获得的:

![一只异国猫的中景照片](../../../../assets/edge/mediapipe/images/solutions/image-embedder.jpg)

您可以使用 `ImageEmbedder.cosine_similarity` 函数比较两个嵌入的相似度。请参见以下代码示例。

```
# 计算余弦相似度。
similarity = ImageEmbedder.cosine_similarity(
  embedding_result.embeddings[0],
  other_embedding_result.embeddings[0])
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*