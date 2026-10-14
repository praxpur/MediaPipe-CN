---
title: "Python 姿态关键点检测指南 (Pose landmark detection guide for Python)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/python"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Python 姿态关键点检测指南 (Pose landmark detection guide for Python)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/python)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Pose Landmarker(姿态关键点检测器)任务可让您检测图像或视频中人体的关键点。您可以使用此任务识别关键身体部位位置、分析姿态,并对动作进行分类。此任务使用适用于单张图像或视频的机器学习 (ML) 模型。任务会输出图像坐标和 3 维世界坐标下的身体姿态关键点。

本说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/pose_landmarker/python) 上获取。有关此任务的功能、模型和配置选项的更多信息,请参阅[概览](../pose_landmarker.md)。

## 代码示例

Pose Landmarker 的示例代码提供了此任务在 Python 中的完整实现,供您参考。此代码可帮助您测试此任务,并开始构建自己的姿态关键点检测器。您只需使用 Web 浏览器即可查看、运行和编辑 [Pose Landmarker 示例代码](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/pose_landmarker/python/%5BMediaPipe_Python_Tasks%5D_Pose_Landmarker.ipynb)。

如果您要在 Raspberry Pi 上实现 Pose Landmarker,请参阅 [Raspberry Pi 示例应用](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/pose_landmarker/raspberry_pi)。

## 环境配置

本节介绍为使用 Pose Landmarker 而设置开发环境和代码项目的关键步骤。有关设置开发环境以使用 MediaPipe 任务的一般信息(包括平台版本要求),请参阅 [Python 环境配置指南](../../setup_python.md)。

### 软件包

MediaPipe Pose Landmarker 任务需要 mediapipe PyPI 软件包。您可以通过以下命令安装并导入这些依赖:

```
$ python -m pip install mediapipe
```

### 导入

导入以下类以访问 Pose Landmarker 任务函数:

```
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
```

### 模型

MediaPipe Pose Landmarker 任务需要一个与此任务兼容的已训练模型。有关 Pose Landmarker 可用已训练模型的更多信息,请参阅任务概览中的[模型部分](../pose_landmarker.md#models)。

选择并下载模型,然后将其存储在本地目录中:

```
model_path = '/absolute/path/to/pose_landmarker.task'
```

使用 `BaseOptions` 对象的 `model_asset_path` 参数指定要使用的模型路径。代码示例请参见下一节。

## 创建任务

MediaPipe Pose Landmarker 任务使用 `create_from_options` 函数来设置任务。`create_from_options` 函数接受要处理的配置选项的值。有关更多信息,请参阅[配置选项](#configuration_options)。

以下代码演示了如何构建和配置此任务。

这些示例还展示了针对图像、视频文件和实时流的任务构建变体。

### 图像

```python
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
PoseLandmarker = mp.tasks.vision.PoseLandmarker
PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

options = PoseLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=model_path),
    running_mode=VisionRunningMode.IMAGE)

with PoseLandmarker.create_from_options(options) as landmarker:
  # The landmarker is initialized. Use it here.
  # ...
```

### 视频

```python
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
PoseLandmarker = mp.tasks.vision.PoseLandmarker
PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

# Create a pose landmarker instance with the video mode:
options = PoseLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=model_path),
    running_mode=VisionRunningMode.VIDEO)

with PoseLandmarker.create_from_options(options) as landmarker:
  # The landmarker is initialized. Use it here.
  # ...
```

### 实时流

```python
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
PoseLandmarker = mp.tasks.vision.PoseLandmarker
PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
PoseLandmarkerResult = mp.tasks.vision.PoseLandmarkerResult
VisionRunningMode = mp.tasks.vision.RunningMode

# Create a pose landmarker instance with the live stream mode:
def print_result(result: PoseLandmarkerResult, output_image: mp.Image, timestamp_ms: int):
    print('pose landmarker result: {}'.format(result))

options = PoseLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=model_path),
    running_mode=VisionRunningMode.LIVE_STREAM,
    result_callback=print_result)

with PoseLandmarker.create_from_options(options) as landmarker:
  # The landmarker is initialized. Use it here.
  # ...
```

> **注意:** 如果使用视频模式或实时流模式,Pose Landmarker 会使用跟踪,以避免在每一帧上都触发模型,这有助于降低延迟。

有关创建用于图像的 Pose Landmarker 的完整示例,请参阅[代码示例](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/pose_landmarker/python)。

### 配置选项

此任务对 Python 应用有以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `running_mode` | 设置任务的运行模式。共有三种模式:<br><br>IMAGE:用于单张图像输入的模式。<br><br>VIDEO:用于视频已解码帧的模式。<br><br>LIVE_STREAM:用于输入数据实时流(如来自摄像头)的模式。在此模式下,必须调用 resultListener 来设置监听器,以异步接收结果。 | {`IMAGE, VIDEO, LIVE_STREAM`} | `IMAGE` |
| `num_poses` | Pose Landmarker 可检测的最大姿态数量。 | `Integer > 0` | `1` |
| `min_pose_detection_confidence` | 姿态检测被视为成功所需的最低置信度分数。 | `Float [0.0,1.0]` | `0.5` |
| `min_pose_presence_confidence` | 姿态关键点检测中姿态存在分数所需的最低置信度分数。 | `Float [0.0,1.0]` | `0.5` |
| `min_tracking_confidence` | 姿态跟踪被视为成功所需的最低置信度分数。 | `Float [0.0,1.0]` | `0.5` |
| `output_segmentation_masks` | Pose Landmarker 是否输出检测到的姿态的分割掩码。 | `Boolean` | `False` |
| `result_callback` | 设置结果监听器,以便在 Pose Landmarker 处于实时流模式时异步接收关键点检测器结果。只能在运行模式设置为 `LIVE_STREAM` 时使用。 | `ResultListener` | `N/A` |

## 准备数据

将您的输入准备为图像文件或 numpy 数组,然后将其转换为 `mediapipe.Image` 对象。如果您的输入是视频文件或来自网络摄像头的实时流,您可以使用 [OpenCV](https://github.com/opencv/opencv) 等外部库将输入帧加载为 numpy 数组。

### 图像

```python
import mediapipe as mp

# Load the input image from an image file.
mp_image = mp.Image.create_from_file('/path/to/image')

# Load the input image from a numpy array.
mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=numpy_image)
```

### 视频

```python
import mediapipe as mp

# Use OpenCV's VideoCapture to load the input video.

# Load the frame rate of the video using OpenCV's CV_CAP_PROP_FPS
# You'll need it to calculate the timestamp for each frame.

# Loop through each frame in the video using VideoCapture#read()

# Convert the frame received from OpenCV to a MediaPipe's Image object.
mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=numpy_frame_from_opencv)
```

### 实时流

```python
import mediapipe as mp

# Use OpenCV's VideoCapture to start capturing from the webcam.

# Create a loop to read the latest frame from the camera using VideoCapture#read()

# Convert the frame received from OpenCV to a MediaPipe's Image object.
mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=numpy_frame_from_opencv)
```

## 运行任务

Pose Landmarker 使用 `detect`、`detect_for_video` 和 `detect_async` 函数触发推理。对于姿态关键点检测,这涉及预处理输入数据并在图像中检测姿态。

以下代码演示了如何使用任务模型执行处理。

### 图像

```python
# Perform pose landmarking on the provided single image.
# The pose landmarker must be created with the image mode.
pose_landmarker_result = landmarker.detect(mp_image)
```

### 视频

```python
# Perform pose landmarking on the provided single image.
# The pose landmarker must be created with the video mode.
pose_landmarker_result = landmarker.detect_for_video(mp_image, frame_timestamp_ms)
```

### 实时流

```python
# Send live image data to perform pose landmarking.
# The results are accessible via the `result_callback` provided in
# the `PoseLandmarkerOptions` object.
# The pose landmarker must be created with the live stream mode.
landmarker.detect_async(mp_image, frame_timestamp_ms)
```

请注意以下事项:

-   在视频模式或实时流模式下运行时,还要向 Pose Landmarker 任务提供输入帧的时间戳。
-   在图像模式或视频模式下运行时,Pose Landmarker 任务会阻塞当前线程,直到处理完输入图像或帧。
-   在实时流模式下运行时,Pose Landmarker 任务会立即返回,不会阻塞当前线程。每次处理完输入帧后,它都会以检测结果调用结果监听器。如果在 Pose Landmarker 任务正忙于处理另一帧时调用检测函数,任务会忽略新的输入帧。

有关在图像上运行 Pose Landmarker 的完整示例,请参阅[代码示例](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/pose_landmarker/python)了解详情。

## 处理并显示结果

Pose Landmarker 每次检测运行都会返回一个 `poseLandmarkerResult` 对象。结果对象包含每个姿态关键点的坐标。

以下是此任务输出数据的示例:

```
PoseLandmarkerResult:
  Landmarks:
    Landmark #0:
      x            : 0.638852
      y            : 0.671197
      z            : 0.129959
      visibility   : 0.9999997615814209
      presence     : 0.9999984502792358
    Landmark #1:
      x            : 0.634599
      y            : 0.536441
      z            : -0.06984
      visibility   : 0.999909
      presence     : 0.999958
    ... (每个姿态 33 个关键点)
  WorldLandmarks:
    Landmark #0:
      x            : 0.067485
      y            : 0.031084
      z            : 0.055223
      visibility   : 0.9999997615814209
      presence     : 0.9999984502792358
    Landmark #1:
      x            : 0.063209
      y            : -0.00382
      z            : 0.020920
      visibility   : 0.999976
      presence     : 0.999998
    ... (每个姿态 33 个世界关键点)
  SegmentationMasks:
    ... (如下图)
```

输出包含每个关键点的归一化坐标 (`Landmarks`) 和世界坐标 (`WorldLandmarks`)。

输出包含以下归一化坐标 (`Landmarks`):

-   `x` 和 `y`:关键点坐标,分别按图像宽度 (`x`) 和高度 (`y`) 归一化至 0.0 到 1.0 之间。
-   `z`:关键点深度,以臀部中点为深度原点。值越小,关键点离摄像头越近。`z` 的大小使用与 `x` 大致相同的比例。
-   `visibility`:关键点在图像中可见的可能性。

输出包含以下世界坐标 (`WorldLandmarks`):

-   `x`、`y` 和 `z`:以米为单位的真实世界 3 维坐标,以臀部中点为原点。
-   `visibility`:关键点在图像中可见的可能性。

下图展示了任务输出的可视化:

![一位处于冥想姿态的女性。她的姿态被一个线框高亮,指示她四肢和躯干的位置](../../../../assets/edge/mediapipe/images/solutions/examples/pose_detector.png)

可选的分割掩码表示每个像素属于某个检测到的人的可能性。下图是任务输出的分割掩码:

![前一图像的分割掩码,勾勒出女性的轮廓](../../../../assets/edge/mediapipe/images/solutions/examples/pose_detector_mask.png)

Pose Landmarker 示例代码演示了如何显示任务返回的结果,请参阅[代码示例](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/pose_landmarker/python)了解详情。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*