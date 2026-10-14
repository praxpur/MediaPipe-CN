---
title: "Python 整体关键点检测指南 (Holistic landmark detection guide for Python)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/holistic_landmarker/python"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-19 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Python 整体关键点检测指南 (Holistic landmark detection guide for Python)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/holistic_landmarker/python)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Holistic Landmarker(整体关键点检测器)任务可让您组合面部、手部和姿态关键点检测器的组件,在图像或视频中检测人体关键点。该任务以归一化图像坐标和 3 维世界坐标输出整体关键点。

本说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/holistic_landmarker/python) 上获取。有关此任务的功能、模型和配置选项的更多信息,请参阅[概览](../holistic_landmarker.md)。

## 代码示例

Holistic Landmarker 示例代码提供了此任务在 Python 中的完整实现,供您参考。此代码可帮助您测试此任务,并开始构建自己的整体关键点检测器。您可以查看并运行 [Holistic Landmarker 示例代码](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/holistic_landmarker/python)。

## 环境配置

本节介绍为使用 Holistic Landmarker 而设置开发环境和代码项目的关键步骤。有关设置开发环境以使用 MediaPipe 任务的一般信息(包括平台版本要求),请参阅 [Python 环境配置指南](../../setup_python.md)。

### 软件包

MediaPipe Holistic Landmarker 任务需要 mediapipe PyPI 软件包。您可以通过以下方式安装并导入这些依赖:

```
$ python -m pip install mediapipe
```

### 导入

导入以下类以访问 Holistic Landmarker 任务函数:

```
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
```

### 模型

MediaPipe Holistic Landmarker 任务需要一个与此任务兼容的已训练模型包。有关 Holistic Landmarker 可用已训练模型的更多信息,请参阅任务概览中的[模型部分](../holistic_landmarker.md#models)。

选择并下载模型,然后将其存放在本地目录中:

```
model_path = '/absolute/path/to/holistic_landmarker.task'
```

使用 `BaseOptions` 对象的 `model_asset_path` 参数来指定要使用的模型路径。

## 创建任务

MediaPipe Holistic Landmarker 任务使用 `create_from_options` 函数来设置任务。`create_from_options` 函数接受要处理的配置选项的值。有关更多信息,请参阅[配置选项](#configuration_options)。

以下代码演示了如何构建和配置此任务。

### 图像

```
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
HolisticLandmarker = mp.tasks.vision.HolisticLandmarker
HolisticLandmarkerOptions = mp.tasks.vision.HolisticLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

options = HolisticLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=model_path),
    running_mode=VisionRunningMode.IMAGE,
    min_face_detection_confidence=0.5,
    min_pose_detection_confidence=0.5,
    min_hand_landmarks_confidence=0.5)

with HolisticLandmarker.create_from_options(options) as landmarker:
  # The landmarker is initialized. Use it here.
  # ...
```

### 视频

```
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
HolisticLandmarker = mp.tasks.vision.HolisticLandmarker
HolisticLandmarkerOptions = mp.tasks.vision.HolisticLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

options = HolisticLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=model_path),
    running_mode=VisionRunningMode.VIDEO,
    min_face_detection_confidence=0.5,
    min_pose_detection_confidence=0.5,
    min_hand_landmarks_confidence=0.5)

with HolisticLandmarker.create_from_options(options) as landmarker:
  # The landmarker is initialized. Use it here.
  # ...
```

### 实时流

```
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
HolisticLandmarker = mp.tasks.vision.HolisticLandmarker
HolisticLandmarkerOptions = mp.tasks.vision.HolisticLandmarkerOptions
HolisticLandmarkerResult = mp.tasks.vision.HolisticLandmarkerResult
VisionRunningMode = mp.tasks.vision.RunningMode

def print_result(result: HolisticLandmarkerResult, output_image: mp.Image,
                 timestamp_ms: int):
    print('holistic landmarker result: {}'.format(result))

options = HolisticLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=model_path),
    running_mode=VisionRunningMode.LIVE_STREAM,
    min_face_detection_confidence=0.5,
    min_pose_detection_confidence=0.5,
    min_hand_landmarks_confidence=0.5,
    result_callback=print_result)

with HolisticLandmarker.create_from_options(options) as landmarker:
  # The landmarker is initialized. Use it here.
  # ...
```

### 配置选项

此任务对 Python 应用有以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `running_mode` | 设置任务的运行模式。共有三种模式:<br><br>IMAGE:用于单张图像输入的模式。<br><br>VIDEO:用于视频已解码帧的模式。<br><br>LIVE_STREAM:用于输入数据实时流(如来自摄像头)的模式。 | {`IMAGE, VIDEO, LIVE_STREAM`} | `IMAGE` |
| `min_face_detection_confidence` | 面部检测被视为成功所需的最低置信度分数。 | `Float [0.0, 1.0]` | `0.5` |
| `min_face_suppression_threshold` | 面部检测被视为重叠所需的最低非极大值抑制阈值。 | `Float [0.0, 1.0]` | `0.3` |
| `min_face_landmarks_confidence` | 面部关键点检测中面部存在分数所需的最低置信度分数。 | `Float [0.0, 1.0]` | `0.5` |
| `min_pose_detection_confidence` | 姿态检测被视为成功所需的最低置信度分数。 | `Float [0.0, 1.0]` | `0.5` |
| `min_pose_suppression_threshold` | 姿态检测被视为重叠所需的最低非极大值抑制阈值。 | `Float [0.0, 1.0]` | `0.3` |
| `min_pose_landmarks_confidence` | 姿态关键点检测中姿态存在分数所需的最低置信度分数。 | `Float [0.0, 1.0]` | `0.5` |
| `min_hand_landmarks_confidence` | 手部关键点检测中手部存在分数所需的最低置信度分数。 | `Float [0.0, 1.0]` | `0.5` |
| `output_face_blendshapes` | 是否输出面部融合变形 (blendshapes) 分类。面部融合变形用于渲染 3 维面部模型。 | `Boolean` | `false` |
| `output_segmentation_mask` | 是否输出人体姿态的分割掩码。 | `Boolean` | `false` |

## 准备数据

Holistic Landmarker 可以检测主机平台支持的任何格式图像中的整体关键点。该任务还会处理数据输入的预处理,包括调整大小、旋转和值归一化。要在视频中检测关键点,您可以使用该 API 逐帧快速处理,并使用帧的时间戳来确定关键点在视频中出现的时间。

## 运行任务

根据运行模式,使用 `detect`、`detect_for_video` 或 `detect_async` 方法运行关键点检测器。

```
# Load the input image
mp_image = mp.Image.create_from_file('path/to/image.jpg')

# Detect holistic landmarks
result = landmarker.detect(mp_image)
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*