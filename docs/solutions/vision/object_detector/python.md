---
title: "物体检测 (Object Detector) - Python"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/object_detector/python"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2024-04-03 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 物体检测 (Object Detector) - Python

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/object_detector/python)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 物体检测 (Object Detector) 任务允许您检测多种类别物体的存在和位置。这些说明向您展示如何使用 Python 中的物体检测任务。这些说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/object_detection/python) 上找到。

您可以通过查看 [Web 演示](https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/object_detector) 来看看此任务的实际效果。有关此任务的功能、模型和配置选项的更多信息，请参阅[概述](../object_detector.md)。

## 代码示例 (Code example)

物体检测器的示例代码提供了一个用 Python 实现此任务的完整实现供您参考。此代码可帮助您测试此任务并开始构建自己的文本分类应用。您可以仅使用 Web 浏览器查看、运行和编辑[物体检测示例代码](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/object_detection/python/object_detector.ipynb)。

如果您要针对 Raspberry Pi 实现物体检测器，请参考 [Raspberry Pi 示例应用](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/object_detection/raspberry_pi)。

## 设置 (Setup)

本节介绍了特定于使用物体检测器设置开发环境和代码项目的关键步骤。有关设置用于使用 MediaPipe 任务的开发环境（包括平台版本要求）的一般信息，请参阅 [Python 环境配置指南](../../setup_python.md)。

### 依赖包 (Packages)

物体检测器任务需要 mediapipe pip 包。您可以使用以下命令安装所需的包：

```
$ python -m pip install mediapipe
```

### 导入 (Imports)

导入以下类以访问物体检测器任务函数：

```
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
```

### 模型 (Model)

MediaPipe 物体检测任务需要一个与此任务兼容的训练好的模型。有关物体检测可用预训练模型的更多信息，请参阅任务概述的[模型](../object_detector.md#models)部分。

选择并下载一个模型，然后将其存储在本地目录中：

```
model_path = '/absolute/path/to/lite-model_efficientdet_lite0_detection_metadata_1.tflite'
```

使用 `BaseOptions` 对象的 `model_asset_path` 参数来指定要使用的模型的路径。有关代码示例，请参阅下一节。

## 创建任务 (Create the task)

使用 `create_from_options` 函数来创建任务。`create_from_options` 函数接受配置选项，包括运行模式、显示名称语言区域、最大结果数、置信度阈值、类别白名单和黑名单。如果您没有设置某个配置选项，任务将使用默认值。有关配置选项的更多信息，请参阅[配置选项](#configuration)部分。

物体检测任务支持几种输入数据类型：静态图像、视频文件和实时视频流。选择与您的输入数据类型相对应的选项卡，以查看如何创建任务并运行推理。

### 图像 (Image)

```
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
ObjectDetector = mp.tasks.vision.ObjectDetector
ObjectDetectorOptions = mp.tasks.vision.ObjectDetectorOptions
VisionRunningMode = mp.tasks.vision.RunningMode

options = ObjectDetectorOptions(
    base_options=BaseOptions(model_asset_path='/path/to/model.tflite'),
    max_results=5,
    running_mode=VisionRunningMode.IMAGE)

with ObjectDetector.create_from_options(options) as detector:
  # The detector is initialized. Use it here.
  # ...
```

### 视频 (Video)

```
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
ObjectDetector = mp.tasks.vision.ObjectDetector
ObjectDetectorOptions = mp.tasks.vision.ObjectDetectorOptions
VisionRunningMode = mp.tasks.vision.RunningMode

options = ObjectDetectorOptions(
    base_options=BaseOptions(model_asset_path='/path/to/model.tflite'),
    max_results=5,
    running_mode=VisionRunningMode.VIDEO)

with ObjectDetector.create_from_options(options) as detector:
  # The detector is initialized. Use it here.
  # ...
```

### 实时流 (Live stream)

```
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
DetectionResult = mp.tasks.components.containers.detections.DetectionResult
ObjectDetector = mp.tasks.vision.ObjectDetector
ObjectDetectorOptions = mp.tasks.vision.ObjectDetectorOptions
VisionRunningMode = mp.tasks.vision.RunningMode

def print_result(result: DetectionResult, output_image: mp.Image, timestamp_ms: int):
    print('detection result: {}'.format(result))

options = ObjectDetectorOptions(
    base_options=BaseOptions(model_asset_path='/path/to/model.tflite'),
    running_mode=VisionRunningMode.LIVE_STREAM,
    max_results=5,
    result_callback=print_result)

with ObjectDetector.create_from_options(options) as detector:
  # The detector is initialized. Use it here.
  # ...
```

有关在图像中使用物体检测器任务的完整创建示例，请参阅[代码示例](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/object_detection/python/object_detector.ipynb#scrollTo=Yl_Oiye4mUuo&line=2&uniqifier=1)。

### 配置选项 (Configuration options)

此任务具有针对 Python 应用程序的以下配置选项：

| 选项名称 | 描述 | 值范围 | 默认值 |
| --- | --- | --- | --- |
| `running_mode` | 设置任务的运行模式。有三种模式：<br> `IMAGE`：单张图像输入的模式。<br> `VIDEO`：视频解码帧的模式。<br> `LIVE_STREAM`：输入数据（例如来自相机）的实时流模式。在此模式下，必须调用 `resultListener` 来设置异步接收结果的监听器。 | {`IMAGE`, `VIDEO`, `LIVE_STREAM`} | `IMAGE` |
| `display_names` | 设置模型元数据中提供的显示名称的标签语言（如果可用）。默认为 `en`（英语）。您可以使用 [TensorFlow Lite Metadata Writer API](https://ai.google.dev/edge/lite/models/metadata_writer_tutorial) 向自定义模型的元数据中添加本地化标签。 | 区域代码 | `en` |
| `max_results` | 设置要返回的可选最高得分检测结果的最大数量。 | 任意正数 | -1（返回所有结果） |
| `score_threshold` | 设置覆盖模型元数据中提供（如果有）的预测分数阈值。低于此值的结果将被拒绝。 | 任意浮点数 | 未设置 |
| `category_allowlist` | 设置允许的类别名称的可选列表。如果非空，则类别名称不在此集合中的检测结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `category_denylist` 互斥，同时使用两者将导致错误。 | 任意字符串 | 未设置 |
| `category_denylist` | 设置不允许的类别名称的可选列表。如果非空，则类别名称在此集合中的检测结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `category_allowlist` 互斥，同时使用两者将导致错误。 | 任意字符串 | 未设置 |

## 准备数据 (Prepare data)

将您的输入准备为图像文件或 NumPy 数组，然后将其转换为 `mediapipe.Image` 对象。如果您的输入是视频文件或网络摄像头的实时流，您可以使用诸如 [OpenCV](https://github.com/opencv/opencv) 等外部库将输入帧加载为 NumPy 数组。

> **注意：** 物体检测任务会自动调整输入图像的大小、填充和归一化，以匹配其模型的输入要求。

以下示例解释并展示了如何为每种可用数据类型准备数据以进行处理：

### 图像 (Image)

```
import mediapipe as mp

# Load the input image from an image file.
mp_image = mp.Image.create_from_file('/path/to/image')

# Load the input image from a numpy array.
mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=numpy_image)
```

### 视频 (Video)

```
import mediapipe as mp

# Use OpenCV’s VideoCapture to load the input video.

# Load the frame rate of the video using OpenCV’s CV_CAP_PROP_FPS
# You’ll need it to calculate the timestamp for each frame.

# Loop through each frame in the video using VideoCapture#read()

# Convert the frame received from OpenCV to a MediaPipe’s Image object.
mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=numpy_frame_from_opencv)
```

### 实时流 (Live stream)

```
import mediapipe as mp

# Use OpenCV’s VideoCapture to start capturing from the webcam.

# Create a loop to read the latest frame from the camera using VideoCapture#read()

# Convert the frame received from OpenCV to a MediaPipe’s Image object.
mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=numpy_frame_from_opencv)
```

## 运行任务 (Run the task)

您可以调用其中的一个检测函数来触发推理。物体检测器任务将返回在输入图像或帧中检测到的物体。

### 图像 (Image)

```
# Perform object detection on the provided single image.
detection_result = detector.detect(mp_image)
```

### 视频 (Video)

```
# Calculate the timestamp of the current frame
frame_timestamp_ms = 1000 * frame_index / video_file_fps

# Perform object detection on the video frame.
detection_result = detector.detect_for_video(mp_image, frame_timestamp_ms)
```

### 实时流 (Live stream)

```
# Send the latest frame to perform object detection.
# Results are sent to the `result_callback` provided in the `ObjectDetectorOptions`.
detector.detect_async(mp_image, frame_timestamp_ms)
```

有关在图像上运行物体检测器的完整示例，请参阅[代码示例](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/object_detection/python/object_detector.ipynb#scrollTo=Yl_Oiye4mUuo&line=2&uniqifier=1)了解详情。

请注意以下事项：

* 在视频模式或实时流模式下运行时，您还必须为物体检测任务提供输入帧的时间戳。
* 在图像或视频模式下运行时，物体检测任务会阻塞当前线程，直到完成输入图像或帧的处理。
* 在实时流模式下运行时，物体检测任务不会阻塞当前线程，而是立即返回。每次完成对输入帧的处理时，它都会使用检测结果调用其结果监听器。如果在物体检测任务忙于处理另一个帧时调用 `detect` 函数，则新的输入帧将被忽略。

## 处理和显示结果 (Handle and display results)

在运行推理后，物体检测任务会返回一个 `ObjectDetectionResult` 对象，它描述了在输入图像中找到的物体。

以下显示了此任务输出数据的示例：

```
ObjectDetectorResult:
 Detection #0:
  Box: (x: 355, y: 133, w: 190, h: 206)
  Categories:
   index       : 17
   score       : 0.73828
   class name  : dog
 Detection #1:
  Box: (x: 103, y: 15, w: 138, h: 369)
  Categories:
   index       : 17
   score       : 0.73047
   class name  : dog
```

以下图像显示了任务输出的可视化：

![Two dogs that are highlighted with bounding boxes](../../../../assets/misc/object-detection-output.png)

物体检测示例代码演示了如何显示任务返回的检测结果，有关详细信息，请参阅[代码示例](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/object_detection/python/object_detector.ipynb#scrollTo=Yl_Oiye4mUuo&line=2&uniqifier=1)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*