---
title: "Python 人脸检测指南 (Face detection guide for Python)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/face_detector/python"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-09 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Python 人脸检测指南 (Face detection guide for Python)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/face_detector/python)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 人脸检测器(Face Detector)任务允许您在图像或视频中检测人脸。您可以使用此任务定位一帧画面中的人脸和面部特征。此任务使用一个机器学习(ML)模型,适用于单张图像或连续的图像流。任务会输出人脸的位置,以及以下面部关键点:左眼、右眼、鼻尖、嘴巴、左耳屏点和右耳屏点。

本说明中描述的代码示例可在 [GitHub](https://github.com/googlesamples/mediapipe/blob/main/examples/face_detector/python/face_detector.ipynb) 上获取。有关此任务的功能、模型和配置选项的更多信息,请参阅[概览](../face_detector.md)。

## 代码示例 (Code example)

人脸检测器的示例代码提供了此任务在 Python 中的完整实现,供您参考。此代码可帮助您测试此任务,并开始构建自己的人脸检测器。您只需使用 Web 浏览器即可查看、运行和编辑[人脸检测器示例代码](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/face_detector/python/face_detector.ipynb)。

如果您要为 Raspberry Pi 实现人脸检测器,请参阅 [Raspberry Pi 示例应用](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_detector/raspberry_pi)。

## 环境配置 (Setup)

本节介绍为使用人脸检测器配置开发环境和代码项目的关键步骤。有关使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参阅 [Python 环境配置指南](../../../setup_python.md)。

### 软件包 (Packages)

MediaPipe 人脸检测器任务需要 mediapipe PyPI 软件包。您可以使用以下命令安装并导入这些依赖项:

```
$ python -m pip install mediapipe
```

### 导入 (Imports)

导入以下类以访问人脸检测器任务函数:

```
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
```

### 模型 (Model)

MediaPipe 人脸检测器任务需要一个与此任务兼容的已训练模型。有关人脸检测器可用已训练模型的更多信息,请参阅任务概览的[模型章节](../face_detector.md#models)。

选择并下载模型,然后将其存储在本地目录中:

```
model_path = '/absolute/path/to/face_detector.task'
```

使用 `BaseOptions` 对象的 `model_asset_path` 参数来指定要使用的模型的路径。代码示例请参阅下一节。

## 创建任务 (Create the task)

MediaPipe 人脸检测器任务使用 `create_from_options` 函数来设置任务。`create_from_options` 函数接受要处理的配置选项的值。有关配置选项的更多信息,请参阅[配置选项](#configuration_options)。

以下代码演示了如何构建和配置此任务。

这些示例还展示了针对图像、视频文件和实时流的任务构造变体。

### 图像 (Image)

```
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
FaceDetector = mp.tasks.vision.FaceDetector
FaceDetectorOptions = mp.tasks.vision.FaceDetectorOptions
VisionRunningMode = mp.tasks.vision.RunningMode

# Create a face detector instance with the image mode:
options = FaceDetectorOptions(
    base_options=BaseOptions(model_asset_path='/path/to/model.task'),
    running_mode=VisionRunningMode.IMAGE)
with FaceDetector.create_from_options(options) as detector:
  # The detector is initialized. Use it here.
  # ...
```

### 视频 (Video)

```
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
FaceDetector = mp.tasks.vision.FaceDetector
FaceDetectorOptions = mp.tasks.vision.FaceDetectorOptions
VisionRunningMode = mp.tasks.vision.RunningMode

# Create a face detector instance with the video mode:
options = FaceDetectorOptions(
    base_options=BaseOptions(model_asset_path='/path/to/model.task'),
    running_mode=VisionRunningMode.VIDEO)
with FaceDetector.create_from_options(options) as detector:
  # The detector is initialized. Use it here.
  # ...
```

### 实时流 (Live stream)

```
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
FaceDetector = mp.tasks.vision.FaceDetector
FaceDetectorOptions = mp.tasks.vision.FaceDetectorOptions
FaceDetectorResult = mp.tasks.vision.FaceDetectorResult
VisionRunningMode = mp.tasks.vision.RunningMode

# Create a face detector instance with the live stream mode:
def print_result(result: FaceDetectorResult, output_image: mp.Image, timestamp_ms: int):
    print('face detector result: {}'.format(result))

options = FaceDetectorOptions(
    base_options=BaseOptions(model_asset_path='/path/to/model.task'),
    running_mode=VisionRunningMode.LIVE_STREAM,
    result_callback=print_result)
with FaceDetector.create_from_options(options) as detector:
  # The detector is initialized. Use it here.
  # ...
```

> **注意:** 如果使用视频模式或实时流模式,人脸检测器会使用追踪来避免每一帧都触发检测模型,这有助于降低延迟。

有关创建用于图像的人脸检测器的完整示例,请参阅[代码示例](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/face_detector/python/face_detector.ipynb#scrollTo=Iy4r2_ePylIa)。

### 配置选项 (Configuration options)

此任务对 Python 应用有以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `running_mode` | 设置任务的运行模式。共有三种模式:<br><br>IMAGE:用于单张图像输入的模式。<br><br>VIDEO:用于视频已解码帧的模式。<br><br>LIVE_STREAM:用于输入数据实时流(例如来自摄像头)的模式。在此模式下,必须调用 resultListener 来设置监听器以异步接收结果。 | `{IMAGE, VIDEO, LIVE_STREAM}` | `IMAGE` |
| `min_detection_confidence` | 人脸检测被认为成功所需的最低置信度分数。 | `Float [0,1]` | `0.5` |
| `min_suppression_threshold` | 人脸检测被认为重叠所需的最低非极大值抑制阈值。 | `Float [0,1]` | `0.3` |
| `result_callback` | 设置结果监听器,在人脸检测器处于实时流模式时异步接收检测结果。仅在运行模式设置为 `LIVE_STREAM` 时才能使用。 | `N/A` | `未设置` |

## 准备数据 (Prepare data)

将您的输入准备为图像文件或 numpy 数组,然后将其转换为 `mediapipe.Image` 对象。如果您的输入是视频文件或来自摄像头的实时流,您可以使用 [OpenCV](https://github.com/opencv/opencv) 等外部库将输入帧加载为 numpy 数组。

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

人脸检测器使用 `detect`、`detect_for_video` 和 `detect_async` 函数来触发推理。对于人脸检测,这包括预处理输入数据并在图像中检测人脸。

以下代码演示了如何使用任务模型执行处理。

### 图像 (Image)

```
# Perform face detection on the provided single image.
# The face detector must be created with the image mode.
face_detector_result = detector.detect(mp_image)
```

### 视频 (Video)

```
# Perform face detection on the provided single image.
# The face detector must be created with the video mode.
face_detector_result = detector.detect_for_video(mp_image, frame_timestamp_ms)
```

### 实时流 (Live stream)

```
# Send live image data to perform face detection.
# The results are accessible via the `result_callback` provided in
# the `FaceDetectorOptions` object.
# The face detector must be created with the live stream mode.
detector.detect_async(mp_image, frame_timestamp_ms)
```

请注意以下事项:

-   在视频模式或实时流模式下运行时,同时向人脸检测器任务提供输入帧的时间戳。
-   在图像或视频模式下运行时,人脸检测器任务会阻塞当前线程,直到处理完输入的图像或帧。
-   在实时流模式下运行时,人脸检测器任务会立即返回,不会阻塞当前线程。它会在每次处理完输入帧后,以检测结果调用结果监听器。如果在该任务正在忙于处理另一帧时调用检测函数,任务将忽略新的输入帧。

有关在图像上运行人脸检测器的完整示例,请参阅[代码示例](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/face_detector/python/face_detector.ipynb#scrollTo=Iy4r2_ePylIa)了解详情。

## 处理并显示结果 (Handle and display results)

人脸检测器每次检测都会返回一个 `FaceDetectorResult` 对象。结果对象包含检测到的人脸的边界框,以及每个检测到的人脸的置信度分数。

以下展示了此任务输出数据的示例:

```
FaceDetectionResult:
  Detections:
    Detection #0:
      BoundingBox:
        origin_x: 126
        origin_y: 100
        width: 463
        height: 463
      Categories:
        Category #0:
          index: 0
          score: 0.9729152917861938
      NormalizedKeypoints:
        NormalizedKeypoint #0:
          x: 0.18298381567001343
          y: 0.2961040139198303
        NormalizedKeypoint #1:
          x: 0.3302789330482483
          y: 0.29289937019348145
        ... (6 keypoints for each face)
    Detection #1:
      BoundingBox:
        origin_x: 616
        origin_y: 193
        width: 430
        height: 430
      Categories:
        Category #0:
          index: 0
          score: 0.9251380562782288
      NormalizedKeypoints:
        NormalizedKeypoint #0:
          x: 0.6151331663131714
          y: 0.3713381886482239
        NormalizedKeypoint #1:
          x: 0.7460576295852661
          y: 0.38825345039367676
        ... (6 keypoints for each face)
```

下图展示了任务输出的可视化效果:

![两个孩子的脸周围带有边界框](../../../../assets/edge/mediapipe/images/solutions/face-detection-output.png)

如需要不带边界框的图像,请参阅[原始图像](https://pixabay.com/photos/brother-sister-girl-family-boy-977170/)。

人脸检测器示例代码演示了如何显示任务返回的结果,详情请参阅[代码示例](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/face_detector/python/face_detector.ipynb#scrollTo=Iy4r2_ePylIa)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*