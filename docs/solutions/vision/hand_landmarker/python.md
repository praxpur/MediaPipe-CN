---
title: "Python 手部关键点检测指南 (Hand landmarks detection guide for Python)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/python"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2024-05-14 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Python 手部关键点检测指南 (Hand landmarks detection guide for Python)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/python)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Hand Landmarker 任务可让您检测图像中手部的关键点 (landmarks)。
本说明向您展示如何将 Hand Landmarker 用于 Python。本说明中描述的代码示例可在 [GitHub](https://github.com/googlesamples/mediapipe/blob/main/examples/hand_landmarker/python/hand_landmarker.ipynb) 上找到。

有关此任务的功能、模型和配置选项的更多信息，请参阅[概述](../hand_landmarker.md)。

## 代码示例 (Code example)

Hand Landmarker 的示例代码为您提供了在 Python 中完整实现此任务的参考。这段代码可以帮助您测试该任务并开始构建您自己的手部关键点检测器。您只需使用 Web 浏览器即可查看、运行和编辑 [Hand Landmarker 示例代码](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/hand_landmarker/python/hand_landmarker.ipynb)。

如果您要在 Raspberry Pi 上实现 Hand Landmarker，请参阅 [Raspberry Pi 示例应用](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/hand_landmarker/raspberry_pi)。

## 环境配置 (Setup)

本节介绍专门为使用 Hand Landmarker 配置开发环境和代码项目的关键步骤。有关配置使用 MediaPipe Tasks 的开发环境（包括平台版本要求）的通用信息，请参阅 [Python 环境配置指南](../../setup_python.md)。

### 包 (Packages)

MediaPipe Hand Landmarker 任务需要 mediapipe PyPI 包。您可以使用以下命令安装并导入这些依赖项：

```bash
$ python -m pip install mediapipe
```

### 导入 (Imports)

导入以下类以访问 Hand Landmarker 任务函数：

```python
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
```

### 模型 (Model)

MediaPipe Hand Landmarker 任务需要一个与此任务兼容的训练好的模型。有关 Hand Landmarker 可用训练模型的更多信息，请参阅任务概述的[模型部分](../hand_landmarker.md#models)。

选择并下载模型，然后将其存储在本地目录中：

```python
model_path = '/absolute/path/to/gesture_recognizer.task'
```

使用 `BaseOptions` 对象的 `model_asset_path` 参数来指定要使用的模型路径。有关代码示例，请参阅下一节。

## 创建任务 (Create the task)

MediaPipe Hand Landmarker 任务使用 `create_from_options` 函数来设置任务。`create_from_options` 函数接受要处理的配置选项的值。有关配置选项的更多信息，请参阅[配置选项](#configuration_options)。

以下代码演示了如何构建和配置此任务。

这些示例还展示了针对图像、视频文件和实时流 (live stream) 的任务构建变体。

### 图像 (Image)

```python
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
HandLandmarker = mp.tasks.vision.HandLandmarker
HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

# Create a hand landmarker instance with the image mode:
options = HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path='/path/to/model.task'),
    running_mode=VisionRunningMode.IMAGE)
with HandLandmarker.create_from_options(options) as landmarker:
  # The landmarker is initialized. Use it here.
  # ...
```

### 视频 (Video)

```python
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
HandLandmarker = mp.tasks.vision.HandLandmarker
HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

# Create a hand landmarker instance with the video mode:
options = HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path='/path/to/model.task'),
    running_mode=VisionRunningMode.VIDEO)
with HandLandmarker.create_from_options(options) as landmarker:
  # The landmarker is initialized. Use it here.
  # ...
```

### 实时流 (Live stream)

```python
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
HandLandmarker = mp.tasks.vision.HandLandmarker
HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
HandLandmarkerResult = mp.tasks.vision.HandLandmarkerResult
VisionRunningMode = mp.tasks.vision.RunningMode

# Create a hand landmarker instance with the live stream mode:
def print_result(result: HandLandmarkerResult, output_image: mp.Image, timestamp_ms: int):
    print('hand landmarker result: {}'.format(result))

options = HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path='/path/to/model.task'),
    running_mode=VisionRunningMode.LIVE_STREAM,
    result_callback=print_result)
with HandLandmarker.create_from_options(options) as landmarker:
  # The landmarker is initialized. Use it here.
  # ...
```

> **注意:** 如果您使用视频 (video) 模式或实时流 (live stream) 模式，Hand Landmarker 会使用跟踪功能以避免在每一帧上触发手掌检测模型，这有助于降低延迟。

有关创建用于图像的 Hand Landmarker 的完整示例，请参阅[代码示例](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/hand_landmarker/python/hand_landmarker.ipynb#scrollTo=_JVO3rvPD4RN&line=11&uniqifier=1)。

### 配置选项 (Configuration options)

此任务为 Python 应用程序提供以下配置选项：

| 选项名称 (Option Name) | 说明 (Description) | 值范围 (Value Range) | 默认值 (Default Value) |
| --- | --- | --- | --- |
| `running_mode` | 设置任务的运行模式。有三种模式：IMAGE：用于单张图像输入的模式。VIDEO：用于视频解码帧的模式。LIVE_STREAM：用于输入数据流（例如来自摄像头的实时流）的模式。在这种模式下，必须调用 `resultListener` 来设置监听器以异步接收结果。 | {`IMAGE, VIDEO, LIVE_STREAM`} | `IMAGE` |
| `num_hands` | Hand landmark detector 检测到的最大手部数量。 | `Any integer > 0` | `1` |
| `min_hand_detection_confidence` | 在手掌检测模型中，手部检测被视为成功的最低置信度得分。 | `0.0 - 1.0` | `0.5` |
| `min_hand_presence_confidence` | 手部关键点检测模型中手部存在得分的最低置信度得分。在 Video 模式和 Live stream 模式下，如果来自手部关键点模型的手部存在置信度得分低于此阈值，Hand Landmarker 会触发手掌检测模型。否则，轻量级手部跟踪算法将确定手的位置以进行后续的关键点检测。 | `0.0 - 1.0` | `0.5` |
| `min_tracking_confidence` | 手部跟踪被视为成功的最低置信度得分。这是当前帧和上一帧中手部之间的边界框 IoU 阈值。在 Hand Landmarker 的 Video 模式和 Stream 模式下，如果跟踪失败，Hand Landmarker 会触发手部检测。否则，它会跳过手部检测。 | `0.0 - 1.0` | `0.5` |
| `result_callback` | 当 hand landmarker 处于实时流模式时，设置结果监听器以异步接收检测结果。仅在运行模式设置为 `LIVE_STREAM` 时适用。 | N/A | N/A |

## 准备数据 (Prepare data)

将输入准备为图像文件或 numpy 数组，然后将其转换为 `mediapipe.Image` 对象。如果您的输入是视频文件或网络摄像头的实时流，您可以使用外部库（如 [OpenCV](https://github.com/opencv/opencv)）将输入帧加载为 numpy 数组。

### 图像 (Image)

```python
import mediapipe as mp

# Load the input image from an image file.
mp_image = mp.Image.create_from_file('/path/to/image')

# Load the input image from a numpy array.
mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=numpy_image)
```

### 视频 (Video)

```python
import mediapipe as mp

# Use OpenCV’s VideoCapture to load the input video.

# Load the frame rate of the video using OpenCV’s CV_CAP_PROP_FPS
# You’ll need it to calculate the timestamp for each frame.

# Loop through each frame in the video using VideoCapture#read()

# Convert the frame received from OpenCV to a MediaPipe’s Image object.
mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=numpy_frame_from_opencv)
```

### 实时流 (Live stream)

```python
import mediapipe as mp

# Use OpenCV’s VideoCapture to start capturing from the webcam.

# Create a loop to read the latest frame from the camera using VideoCapture#read()

# Convert the frame received from OpenCV to a MediaPipe’s Image object.
mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=numpy_frame_from_opencv)
```

## 运行任务 (Run the task)

Hand Landmarker 使用 `detect`、`detect_for_video` 和 `detect_async` 函数来触发推理。对于手部关键点检测，这涉及预处理输入数据、检测图像中的手部以及检测手部关键点。

以下代码演示了如何使用任务模型执行处理。

### 图像 (Image)

```python
# Perform hand landmarks detection on the provided single image.
# The hand landmarker must be created with the image mode.
hand_landmarker_result = landmarker.detect(mp_image)
```

### 视频 (Video)

```python
# Perform hand landmarks detection on the provided single image.
# The hand landmarker must be created with the video mode.
hand_landmarker_result = landmarker.detect_for_video(mp_image, frame_timestamp_ms)
```

### 实时流 (Live stream)

```python
# Send live image data to perform hand landmarks detection.
# The results are accessible via the `result_callback` provided in
# the `HandLandmarkerOptions` object.
# The hand landmarker must be created with the live stream mode.
landmarker.detect_async(mp_image, frame_timestamp_ms)
```

请注意以下几点：

* 在视频模式或实时流模式下运行时，您还必须向 Hand Landmarker 任务提供输入帧的时间戳 (timestamp)。
* 在图像或视频模型下运行时，Hand Landmarker 任务会阻塞当前线程，直到其完成对输入图像或帧的处理。
* 在实时流模式下运行时，Hand Landmarker 任务不会阻塞当前线程，而是立即返回。每当它完成对输入帧的处理时，都会使用检测结果调用其结果监听器。如果在 Hand Landmarker 任务正忙于处理另一个帧时调用检测函数，该任务将忽略新的输入帧。

有关在图像上运行 Hand Landmarker 的完整示例，请参阅[代码示例](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/hand_landmarker/python/hand_landmarker.ipynb#scrollTo=_JVO3rvPD4RN&line=11&uniqifier=1)以了解详情。

## 处理和显示结果 (Handle and display results)

Hand Landmarker 每次检测运行都会生成一个手部关键点检测结果对象。结果对象包含图像坐标中的手部关键点、世界坐标中的手部关键点以及检测到的手部的惯用手 (handedness，左手/右手)。

以下显示了此任务的输出数据示例：

`HandLandmarkerResult` 输出包含三个组件。每个组件都是一个数组，其中每个元素包含单个检测到的手部的以下结果：

* 惯用手 (Handedness)

  惯用手表示检测到的手是左手还是右手。
* 关键点 (Landmarks)

  有 21 个手部关键点，每个关键点由 `x`、`y` 和 `z` 坐标组成。`x` 和 `y` 坐标分别由图像宽度和高度归一化到 [0.0, 1.0]。`z` 坐标表示关键点深度，以手腕处的深度为原点。值越小，关键点越靠近相机。`z` 的大小使用与 `x` 大致相同的比例。
* 世界坐标关键点 (World Landmarks)

  21 个手部关键点也以世界坐标呈现。每个关键点由 `x`、`y` 和 `z` 组成，表示以米为单位的真实世界 3D 坐标，原点位于手部的几何中心。

```text
HandLandmarkerResult:
  Handedness:
    Categories #0:
      index        : 0
      score        : 0.98396
      categoryName : Left
  Landmarks:
    Landmark #0:
      x            : 0.638852
      y            : 0.671197
      z            : -3.41E-7
    Landmark #1:
      x            : 0.634599
      y            : 0.536441
      z            : -0.06984
    ... (21 landmarks for a hand)
  WorldLandmarks:
    Landmark #0:
      x            : 0.067485
      y            : 0.031084
      z            : 0.055223
    Landmark #1:
      x            : 0.063209
      y            : -0.00382
      z            : 0.020920
    ... (21 world landmarks for a hand)
```

下图展示了该任务输出的视图：

![竖起大拇指的手势，并标出了手部的骨骼结构](../../../../assets/misc/gesture-recognizer.png)

Hand Landmarker 示例代码演示了如何显示从任务返回的结果，请参阅[代码示例](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/hand_landmarker/python/hand_landmarker.ipynb#scrollTo=_JVO3rvPD4RN&line=11&uniqifier=1)以了解详情。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*
