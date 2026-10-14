---
title: "Python 面部关键点检测指南 (Face landmark detection guide for Python)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/python"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2024-05-14 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Python 面部关键点检测指南 (Face landmark detection guide for Python)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/python)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Face Landmarker 任务可让您检测图像和视频中的面部关键点 (face landmarks) 和面部表情。您可以使用此任务来识别人的面部表情并应用面部滤镜和特效，以创建虚拟形象。此任务使用可处理单张图像或连续图像数据流的机器学习 (ML) 模型。该任务输出 3D 面部关键点、混合形状得分 (blendshape scores，表示面部表情的系数) 以实时推断详细的面部表面，以及变换矩阵 (transformation matrices) 以执行渲染特效所需的变换。

本说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_landmarker/python) 上找到。
有关此任务的功能、模型和配置选项的更多信息，请参阅[概述](../face_landmarker.md)。

## 代码示例 (Code example)

Face Landmarker 的示例代码为您提供了在 Python 中完整实现此任务的参考。这段代码可以帮助您测试该任务并开始构建您自己的面部关键点检测器。您只需使用 Web 浏览器即可查看、运行和编辑 [Face Landmarker 示例代码](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/face_landmarker/python/%5BMediaPipe_Python_Tasks%5D_Face_Landmarker.ipynb)。

如果您要在 Raspberry Pi 上实现 Face Landmarker，请参阅 [Raspberry Pi 示例应用](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_landmarker/raspberry_pi)。

## 环境配置 (Setup)

本节介绍专门为使用 Face Landmarker 配置开发环境和代码项目的关键步骤。有关配置使用 MediaPipe Tasks 的开发环境（包括平台版本要求）的通用信息，请参阅 [Python 环境配置指南](../../setup_python.md)。

### 包 (Packages)

MediaPipe Face Landmarker 任务需要 mediapipe PyPI 包。您可以使用以下命令安装并导入这些依赖项：

```bash
$ python -m pip install mediapipe
```

### 导入 (Imports)

导入以下类以访问 Face Landmarker 任务函数：

```python
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
```

### 模型 (Model)

MediaPipe Face Landmarker 任务需要一个与此任务兼容的训练好的模型。有关 Face Landmarker 可用训练模型的更多信息，请参阅任务概述的[模型部分](../face_landmarker.md#models)。

选择并下载模型，然后将其存储在本地目录中：

```python
model_path = '/absolute/path/to/face_landmarker.task'
```

使用 `BaseOptions` 对象的 `model_asset_path` 参数来指定要使用的模型路径。有关代码示例，请参阅下一节。

## 创建任务 (Create the task)

MediaPipe Face Landmarker 任务使用 `create_from_options` 函数来设置任务。`create_from_options` 函数接受要处理的配置选项的值。有关配置选项的更多信息，请参阅[配置选项](#configuration_options)。

以下代码演示了如何构建和配置此任务。

这些示例还展示了针对图像、视频文件和实时流 (live stream) 的任务构建变体。

### 图像 (Image)

```python
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
FaceLandmarker = mp.tasks.vision.FaceLandmarker
FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

options = FaceLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=model_path),
    running_mode=VisionRunningMode.IMAGE)

with FaceLandmarker.create_from_options(options) as landmarker:
  # The landmarker is initialized. Use it here.
  # ...
```

### 视频 (Video)

```python
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
FaceLandmarker = mp.tasks.vision.FaceLandmarker
FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

# Create a face landmarker instance with the video mode:
options = FaceLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=model_path),
    running_mode=VisionRunningMode.VIDEO)

with FaceLandmarker.create_from_options(options) as landmarker:
  # The landmarker is initialized. Use it here.
  # ...
```

### 实时流 (Live stream)

```python
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
FaceLandmarker = mp.tasks.vision.FaceLandmarker
FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
FaceLandmarkerResult = mp.tasks.vision.FaceLandmarkerResult
VisionRunningMode = mp.tasks.vision.RunningMode

# Create a face landmarker instance with the live stream mode:
def print_result(result: FaceLandmarkerResult, output_image: mp.Image, timestamp_ms: int):
    print('face landmarker result: {}'.format(result))

options = FaceLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=model_path),
    running_mode=VisionRunningMode.LIVE_STREAM,
    result_callback=print_result)

with FaceLandmarker.create_from_options(options) as landmarker:
  # The landmarker is initialized. Use it here.
  # ...
```

> **注意:** 如果您使用视频 (video) 模式或实时流 (live stream) 模式，Face Landmarker 会使用跟踪功能以避免在每一帧上触发模型，这有助于降低延迟。

有关创建用于图像的 Face Landmarker 的完整示例，请参阅[代码示例](https://github.com/googlesamples/mediapipe/blob/main/examples/face_landmarker/python/%5BMediaPipe_Python_Tasks%5D_Face_Landmarker.ipynb)。

### 配置选项 (Configuration options)

此任务为 Python 应用程序提供以下配置选项：

| 选项名称 (Option Name) | 说明 (Description) | 值范围 (Value Range) | 默认值 (Default Value) |
| --- | --- | --- | --- |
| `running_mode` | 设置任务的运行模式。有三种模式：IMAGE：用于单张图像输入的模式。VIDEO：用于视频解码帧的模式。LIVE_STREAM：用于输入数据流（例如来自摄像头的实时流）的模式。在这种模式下，必须调用 `resultListener` 来设置监听器，以异步接收结果。 | {`IMAGE, VIDEO, LIVE_STREAM`} | `IMAGE` |
| `num_faces` | `FaceLandmarker` 可以检测到的最大面部数量。仅当 `num_faces` 设置为 1 时才应用平滑处理。 | `Integer > 0` | `1` |
| `min_face_detection_confidence` | 面部检测被视为成功的最低置信度得分。 | `Float [0.0,1.0]` | `0.5` |
| `min_face_presence_confidence` | 面部关键点检测中面部存在得分的最低置信度得分。 | `Float [0.0,1.0]` | `0.5` |
| `min_tracking_confidence` | 面部跟踪被视为成功的最低置信度得分。 | `Float [0.0,1.0]` | `0.5` |
| `output_face_blendshapes` | Face Landmarker 是否输出面部混合形状 (face blendshapes)。面部混合形状用于渲染 3D 面部模型。<br>**注意:** `*Left` 和 `*Right` 混合形状对应于主体的面部，而不是观察者的方向。传入水平镜像的图像将反转这些输出。 | `Boolean` | `False` |
| `output_facial_transformation_matrixes` | FaceLandmarker 是否输出面部变换矩阵。FaceLandmarker 使用矩阵将面部关键点从规范的面部模型变换到检测到的面部，以便用户可以将特效应用在检测到的关键点上。 | `Boolean` | `False` |
| `result_callback` | 当 FaceLandmarker 处于实时流模式时，设置结果监听器以异步接收 landmarker 结果。只能在运行模式设置为 `LIVE_STREAM` 时使用。 | `ResultListener` | `N/A` |

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

Face Landmarker 使用 `detect`、`detect_for_video` 和 `detect_async` 函数来触发推理。对于面部关键点检测，这涉及预处理输入数据和检测图像中的面部。

以下代码演示了如何使用任务模型执行处理。

### 图像 (Image)

```python
# Perform face landmarking on the provided single image.
# The face landmarker must be created with the image mode.
face_landmarker_result = landmarker.detect(mp_image)
```

### 视频 (Video)

```python
# Perform face landmarking on the provided single image.
# The face landmarker must be created with the video mode.
face_landmarker_result = landmarker.detect_for_video(mp_image, frame_timestamp_ms)
```

### 实时流 (Live stream)

```python
# Send live image data to perform face landmarking.
# The results are accessible via the `result_callback` provided in
# the `FaceLandmarkerOptions` object.
# The face landmarker must be created with the live stream mode.
landmarker.detect_async(mp_image, frame_timestamp_ms)
```

请注意以下几点：

* 在视频模式或实时流模式下运行时，还要向 Face Landmarker 任务提供输入帧的时间戳 (timestamp)。
* 在图像或视频模型下运行时，Face Landmarker 任务会阻塞当前线程，直到其完成对输入图像或帧的处理。
* 在实时流模式下运行时，Face Landmarker 任务会立即返回并且不会阻塞当前线程。每当它完成对输入帧的处理时，都会使用检测结果调用结果监听器。如果在 Face Landmarker 任务正忙于处理另一个帧时调用检测函数，该任务将忽略新的输入帧。

有关在图像上运行 Face Landmarker 的完整示例，请参阅[代码示例](https://github.com/googlesamples/mediapipe/blob/main/examples/face_landmarker/python/%5BMediaPipe_Python_Tasks%5D_Face_Landmarker.ipynb)以了解详情。

## 处理和显示结果 (Handle and display results)

Face Landmarker 每次检测运行都会返回一个 `FaceLandmarkerResult` 对象。结果对象包含每个检测到的面部的面部网格 (face mesh)，以及每个面部关键点的坐标。结果对象还可以选择包含混合形状 (blendshapes)，它表示面部表情，以及用于将面部特效应用到检测到的关键点上的面部变换矩阵。

以下显示了此任务的输出数据示例：

```text
FaceLandmarkerResult:
  face_landmarks:
    NormalizedLandmark #0:
      x: 0.5971359014511108
      y: 0.485361784696579
      z: -0.038440968841314316
    NormalizedLandmark #1:
      x: 0.3302789330482483
      y: 0.29289937019348145
      z: -0.09489090740680695
    ... (478 landmarks for each face)
  face_blendshapes:
    browDownLeft: 0.8296722769737244
    browDownRight: 0.8096957206726074
    browInnerUp: 0.00035583582939580083
    browOuterUpLeft: 0.00035752105759456754
    ... (52 blendshapes for each face)
  facial_transformation_matrixes:
    [9.99158978e-01, -1.23036895e-02, 3.91213447e-02, -3.70770246e-01]
    [1.66496094e-02,  9.93480563e-01, -1.12779640e-01, 2.27719707e+01]
    ...
```

> **注意:** `*Left` 和 `*Right` 混合形状对应于主体的面部，而不是观察者的方向。传入水平镜像的图像将反转这些输出。

下图展示了该任务输出的视图：

![勾勒出面部形状和尺寸的男子面部特征网格](../../../../assets/misc/face_landmarker_output.png)

Face Landmarker 示例代码演示了如何显示从任务返回的结果，请参阅[代码示例](https://github.com/googlesamples/mediapipe/blob/main/examples/face_landmarker/python/%5BMediaPipe_Python_Tasks%5D_Face_Landmarker.ipynb)以了解详情。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*
