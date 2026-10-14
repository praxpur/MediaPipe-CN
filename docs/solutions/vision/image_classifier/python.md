---
title: "Python 图像分类指南 (Image classification guide for Python)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/image_classifier/python"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Python 图像分类指南 (Image classification guide for Python)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/image_classifier/python)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 图像分类器(Image Classifier)任务可对图像执行分类。您可以使用此任务,识别图像在训练时定义的一组类别中代表的内容。这些说明向您展示如何将图像分类器与 Python 一起使用。

您可以通过查看 [Web 演示](https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_classifier)来了解此任务的实际效果。有关此任务的功能、模型和配置选项的更多信息,请参阅[概览](../image_classifier.md)。

## 代码示例 (Code example)

图像分类器的示例代码提供了此任务在 Python 中的完整实现,供您参考。此代码可帮助您测试此任务,并开始构建自己的图像分类器。您只需使用 Web 浏览器即可查看、运行和编辑图像分类器[示例代码](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/image_classification/python/image_classifier.ipynb)。

如果您要为 Raspberry Pi 实现图像分类器,请参阅 [Raspberry Pi 示例应用](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_classification/raspberry_pi)。

## 环境配置 (Setup)

本节介绍为使用图像分类器配置开发环境和代码项目的关键步骤。有关使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参阅 [Python 环境配置指南](../../../setup_python.md)。

### 软件包 (Packages)

图像分类器任务需要 mediapipe pip 软件包。您可以使用以下命令安装该依赖项:

```
$ python -m pip install mediapipe
```

### 导入 (Imports)

导入以下类以访问图像分类器任务函数:

```python
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
```

### 模型 (Model)

MediaPipe 图像分类器任务需要一个与此任务兼容的已训练模型。有关图像分类器可用已训练模型的更多信息,请参阅任务概览的[模型章节](../image_classifier.md#models)。

选择并下载模型,然后将其存储在本地目录中。您可以使用推荐的 [EfficientNet-Lite0](https://www.kaggle.com/models/tensorflow/efficientnet/tfLite/lite0-int8/2) 模型。

```
model_path = '/absolute/path/to/efficientnet_lite0_int8_2.tflite'
```

在 Model Name 参数中指定模型的路径,如下所示:

```
base_options = BaseOptions(model_asset_path=model_path)
```

## 创建任务 (Create the task)

使用 `create_from_options` 函数创建任务。`create_from_options` 函数接受配置选项,包括运行模式、显示名称语言区域、最大结果数、置信度阈值、类别允许列表和拒绝列表。有关配置选项的更多信息,请参阅[配置概览](#configuration)。

图像分类器任务支持 3 种输入数据类型:静态图像、视频文件和实时视频流。选择与您的输入数据类型对应的标签页,了解如何创建任务并运行推理。

### 图像 (Image)

```
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
ImageClassifier = mp.tasks.vision.ImageClassifier
ImageClassifierOptions = mp.tasks.vision.ImageClassifierOptions
VisionRunningMode = mp.tasks.vision.RunningMode

options = ImageClassifierOptions(
    base_options=BaseOptions(model_asset_path='/path/to/model.tflite'),
    max_results=5,
    running_mode=VisionRunningMode.IMAGE)

with ImageClassifier.create_from_options(options) as classifier:
  # 分类器已初始化。请在此处使用它。
  # ...
```

### 视频 (Video)

```
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
ImageClassifier = mp.tasks.vision.ImageClassifier
ImageClassifierOptions = mp.tasks.vision.ImageClassifierOptions
VisionRunningMode = mp.tasks.vision.RunningMode

options = ImageClassifierOptions(
    base_options=BaseOptions(model_asset_path='/path/to/model.tflite'),
    max_results=5,
    running_mode=VisionRunningMode.VIDEO)

with ImageClassifier.create_from_options(options) as classifier:
  # 分类器已初始化。请在此处使用它。
  # ...
```

### 实时流 (Live stream)

```
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
ImageClassifierResult = mp.tasks.vision.ImageClassifier.ImageClassifierResult
ImageClassifier = mp.tasks.vision.ImageClassifier
ImageClassifierOptions = mp.tasks.vision.ImageClassifierOptions
VisionRunningMode = mp.tasks.vision.RunningMode

def print_result(result: ImageClassifierResult, output_image: mp.Image, timestamp_ms: int):
    print('ImageClassifierResult result: {}'.format(result))

options = ImageClassifierOptions(
    base_options=BaseOptions(model_asset_path='/path/to/model.tflite'),
    running_mode=VisionRunningMode.LIVE_STREAM,
    max_results=5,
    result_callback=print_result)

with ImageClassifier.create_from_options(options) as classifier:
  # 分类器已初始化。请在此处使用它。
  # ...
```

有关创建用于图像的图像分类器的完整示例,请参阅[代码示例](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/image_classification/python/image_classifier.ipynb#scrollTo=Iy4r2_ePylIa)。

### 配置选项 (Configuration options)

此任务为 Python 应用提供以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
| --- | --- | --- | --- |
| `running_mode` | 设置任务的运行模式。共有三种模式:IMAGE:用于单张图像输入的模式。VIDEO:用于视频解码帧的模式。LIVE\_STREAM:用于输入数据实时流的模式,例如来自摄像头的输入。在此模式下,必须调用 resultListener 来设置监听器以异步接收结果。 | {`IMAGE, VIDEO, LIVE_STREAM`} | `IMAGE` |
| `display_names_locale` | 设置任务模型元数据中提供的显示名称所用标签的语言(如果有)。默认为 `en`(英语)。您可以使用 [TensorFlow Lite Metadata Writer API](https://ai.google.dev/edge/lite/models/metadata_writer_tutorial) 向自定义模型的元数据中添加本地化标签 | 语言区域代码 | en |
| `max_results` | 设置要返回的得分最高的分类结果的可选最大数量。如果 < 0,则返回所有可用结果。 | 任意正数 | `-1` |
| `score_threshold` | 设置预测分数阈值,该阈值会覆盖模型元数据中提供的阈值(如果有)。低于此值的结果会被拒绝。 | 任意浮点数 | 未设置 |
| `category_allowlist` | 设置允许的类别名称的可选列表。如果非空,则类别名称不在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `category_denylist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |
| `category_denylist` | 设置不允许的类别名称的可选列表。如果非空,则类别名称在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `category_allowlist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |
| `result_callback` | 设置结果监听器,当图像分类器处于实时流模式时异步接收分类结果。仅当运行模式设置为 `LIVE_STREAM` 时才能使用 | 不适用 | 未设置 |

## 准备数据 (Prepare data)

将您的输入准备为图像文件或 numpy 数组,然后将其转换为 `mediapipe.Image` 对象。如果您的输入是视频文件或来自网络摄像头的实时流,您可以使用 [OpenCV](https://github.com/opencv/opencv) 等外部库将输入帧加载为 numpy 数组。

> **注意:** 图像分类器任务会自动调整大小、填充和归一化输入图像,以匹配其模型的输入要求。

以下示例说明并展示了如何为每种可用数据类型准备要处理的数据:

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

## 运行任务 (Run the task)

您可以调用与运行模式对应的 classify 函数来触发推理。图像分类器 API 将返回输入图像或帧中对象的可能类别。

### 图像 (Image)

```
# 对提供的单张图像执行图像分类。
classification_result = classifier.classify(mp_image)
```

### 视频 (Video)

```
# 计算当前帧的时间戳
frame_timestamp_ms = 1000 * frame_index / video_file_fps

# 对视频帧执行图像分类。
classification_result = classifier.classify_for_video(mp_image, frame_timestamp_ms)
```

### 实时流 (Live stream)

```
# 发送最新帧以执行图像分类。
# 结果将发送到 `ImageClassifierOptions` 中提供的 `result_callback`。
classifier.classify_async(mp_image, frame_timestamp_ms)
```

请注意以下事项:

- 在视频模式或实时流模式下运行时,您还必须向图像分类器任务提供输入帧的时间戳。
- 在图像或视频模式下运行时,图像分类器任务将阻塞当前线程,直到处理完输入图像或帧。
- 在实时流模式下运行时,图像分类器任务不会阻塞当前线程,而是立即返回。每次处理完输入帧后,它都会使用分类结果调用其结果监听器。如果在图像分类器任务忙于处理另一帧时调用 `classifyAsync` 函数,任务会忽略新的输入帧。

有关创建用于图像的图像分类器的完整示例,请参阅[代码示例](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/image_classification/python/image_classifier.ipynb#scrollTo=Iy4r2_ePylIa)。

## 处理并显示结果 (Handle and display results)

运行推理后,图像分类器任务会返回一个 `ImageClassifierResult` 对象,其中包含输入图像或帧中对象的可能类别列表。

以下内容展示了此任务的输出数据示例:

```
ImageClassifierResult:
 Classifications #0 (single classification head):
  head index: 0
  category #0:
   category name: "/m/01bwb9"
   display name: "Passer domesticus"
   score: 0.91406
   index: 671
  category #1:
   category name: "/m/01bwbt"
   display name: "Passer montanus"
   score: 0.00391
   index: 670
```

该结果是通过在以下图像上运行 [Bird Classifier](https://www.kaggle.com/models/google/aiy/tfLite/vision-classifier-birds-v1/3) 获得的:

![一只家麻雀的特写照片](../../../../assets/edge/mediapipe/images/solutions/image-classifier.jpg)

图像分类器示例代码演示了如何显示任务返回的分类结果,详情请参阅[代码示例](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/image_classification/python/image_classifier.ipynb#scrollTo=Iy4r2_ePylIa)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*