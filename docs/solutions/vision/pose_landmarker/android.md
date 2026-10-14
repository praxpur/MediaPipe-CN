---
title: "Android 姿态关键点检测指南 (Pose landmark detection guide for Android)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Android 姿态关键点检测指南 (Pose landmark detection guide for Android)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/android)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Pose Landmarker(姿态关键点检测器)任务可让您检测图像或视频中人体的关键点。您可以使用此任务识别关键身体部位位置、分析姿态,并对动作进行分类。此任务使用适用于单张图像或视频的机器学习 (ML) 模型。任务会输出图像坐标和 3 维世界坐标下的身体姿态关键点。

本说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/pose_landmarker/android) 上获取。有关此任务的功能、模型和配置选项的更多信息,请参阅[概览](../pose_landmarker.md)。

## 代码示例

MediaPipe Tasks 示例代码是一个适用于 Android 的 Pose Landmarker 应用的简单实现。该示例使用实体 Android 设备上的摄像头在连续视频流中检测姿态。该应用还可以检测设备图库中图像和视频中的姿态。

您可以将该应用作为自己 Android 应用的起点,或在修改现有应用时参考它。Pose Landmarker 示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/pose_landmarker) 上。

### 下载代码

以下说明向您展示如何使用 [git](https://git-scm.com/) 命令行工具创建示例代码的本地副本。

要下载示例代码:

1.  使用以下命令克隆 git 仓库:

    ```
    git clone https://github.com/google-ai-edge/mediapipe-samples
    ```

2.  (可选)配置 git 实例使用稀疏检出 (sparse checkout),以便只保留 Pose Landmarker 示例应用所需的文件:

    ```
    cd mediapipe-samples
    git sparse-checkout init --cone
    git sparse-checkout set examples/pose_landmarker/android
    ```

创建示例代码的本地版本后,您可以将项目导入 Android Studio 并运行该应用。有关说明,请参阅 [Android 环境配置指南](../../setup_android.md#example_code)。

### 关键组件

以下文件包含此姿态关键点示例应用的关键代码:

-   [PoseLandmarkerHelper.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/pose_landmarker/android/app/src/main/java/com/google/mediapipe/examples/poselandmarker/PoseLandmarkerHelper.kt) — 初始化姿态关键点检测器,并处理模型与委托 (delegate) 的选择。
-   [CameraFragment.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/pose_landmarker/android/app/src/main/java/com/google/mediapipe/examples/poselandmarker/fragment/CameraFragment.kt) — 处理设备摄像头,并处理图像和视频输入数据。
-   [GalleryFragment.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/pose_landmarker/android/app/src/main/java/com/google/mediapipe/examples/poselandmarker/fragment/GalleryFragment.kt) — 与 `OverlayView` 交互以显示输出图像或视频。
-   [OverlayView.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/pose_landmarker/android/app/src/main/java/com/google/mediapipe/examples/poselandmarker/OverlayView.kt) — 实现检测到的姿态的显示。

## 环境配置

本节介绍为使用 Pose Landmarker 而设置开发环境和代码项目的关键步骤。有关设置开发环境以使用 MediaPipe 任务的一般信息(包括平台版本要求),请参阅 [Android 环境配置指南](../../setup_android.md)。

### 依赖

Pose Landmarker 任务使用 `com.google.mediapipe:tasks-vision` 库。将此依赖添加到 Android 应用的 `build.gradle` 文件中:

```
dependencies {
    implementation 'com.google.mediapipe:tasks-vision:latest.release'
}
```

### 模型

MediaPipe Pose Landmarker 任务需要一个与此任务兼容的已训练模型包。有关 Pose Landmarker 可用已训练模型的更多信息,请参阅任务概览中的[模型部分](../pose_landmarker.md#models)。

选择并下载模型,然后将其存放在项目目录中:

```
<dev-project-root>/src/main/assets
```

在 `ModelAssetPath` 参数中指定模型的路径。在示例代码中,模型定义在 [`PoseLandmarkerHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/pose_landmarker/android/app/src/main/java/com/google/mediapipe/examples/poselandmarker/PoseLandmarkerHelper.kt) 文件中:

```
val modelName = "pose_landmarker_lite.task"
baseOptionsBuilder.setModelAssetPath(modelName)
```

## 创建任务

MediaPipe Pose Landmarker 任务使用 `createFromOptions()` 函数来设置任务。`createFromOptions()` 函数接受配置选项的值。有关配置选项的更多信息,请参阅[配置选项](#configuration_options)。

Pose Landmarker 支持以下输入数据类型:静态图像、视频文件和实时视频流。您需要在创建任务时指定与输入数据类型对应的运行模式。选择与您的输入数据类型对应的标签页,以了解如何创建任务。

### 图像

```
val baseOptionsBuilder = BaseOptions.builder().setModelAssetPath(modelName)
val baseOptions = baseOptionBuilder.build()

val optionsBuilder = 
    poseLandmarker.poseLandmarkerOptions.builder()
        .setBaseOptions(baseOptionsBuilder.build())
        .setMinPoseDetectionConfidence(minPoseDetectionConfidence)
        .setMinTrackingConfidence(minPoseTrackingConfidence)
        .setMinPosePresenceConfidence(minposePresenceConfidence)
        .setNumPoses(maxNumPoses)
        .setRunningMode(RunningMode.IMAGE)

val options = optionsBuilder.build()
poseLandmarker = poseLandmarker.createFromOptions(context, options)
```

### 视频

```
val baseOptionsBuilder = BaseOptions.builder().setModelAssetPath(modelName)
val baseOptions = baseOptionBuilder.build()

val optionsBuilder = 
    poseLandmarker.poseLandmarkerOptions.builder()
        .setBaseOptions(baseOptionsBuilder.build())
        .setMinPoseDetectionConfidence(minPoseDetectionConfidence)
        .setMinTrackingConfidence(minPoseTrackingConfidence)
        .setMinPosePresenceConfidence(minposePresenceConfidence)
        .setNumPoses(maxNumPoses)
        .setRunningMode(RunningMode.VIDEO)

val options = optionsBuilder.build()
poseLandmarker = poseLandmarker.createFromOptions(context, options)
```

### 实时流

```
val baseOptionsBuilder = BaseOptions.builder().setModelAssetPath(modelName)
val baseOptions = baseOptionBuilder.build()

val optionsBuilder = 
    poseLandmarker.poseLandmarkerOptions.builder()
        .setBaseOptions(baseOptionsBuilder.build())
        .setMinPoseDetectionConfidence(minPoseDetectionConfidence)
        .setMinTrackingConfidence(minPoseTrackingConfidence)
        .setMinPosePresenceConfidence(minposePresenceConfidence)
        .setNumPoses(maxNumPoses)
        .setResultListener(this::returnLivestreamResult)
        .setErrorListener(this::returnLivestreamError)
        .setRunningMode(RunningMode.LIVE_STREAM)

val options = optionsBuilder.build()
poseLandmarker = poseLandmarker.createFromOptions(context, options)
```

> **注意:** 如果使用实时流模式,您需要在创建任务时注册结果监听器。任务在处理完摄像头帧后,会以检测结果和输入图像作为参数调用该监听器。

> **注意:** 如果使用视频模式或实时流模式,Pose Landmarker 会使用跟踪,以避免在每一帧上都触发 palm detection 模型,这有助于降低延迟。

Pose Landmarker 示例代码的实现允许用户在处理模式之间切换。这种方法使任务创建代码更加复杂,可能不适合您的用例。您可以在 [`PoseLandmarkerHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/pose_landmarker/android/app/src/main/java/com/google/mediapipe/examples/poselandmarker/PoseLandmarkerHelper.kt) 文件的 `setupPoseLandmarker()` 函数中查看此代码。

### 配置选项

此任务对 Android 应用有以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `runningMode` | 设置任务的运行模式。共有三种模式:<br><br>IMAGE:用于单张图像输入的模式。<br><br>VIDEO:用于视频已解码帧的模式。<br><br>LIVE_STREAM:用于输入数据实时流(如来自摄像头)的模式。在此模式下,必须调用 resultListener 来设置监听器,以异步接收结果。 | {`IMAGE, VIDEO, LIVE_STREAM`} | `IMAGE` |
| `numposes` | Pose Landmarker 可检测的最大姿态数量。 | `Integer > 0` | `1` |
| `minPoseDetectionConfidence` | 姿态检测被视为成功所需的最低置信度分数。 | `Float [0.0,1.0]` | `0.5` |
| `minPosePresenceConfidence` | 姿态关键点检测中姿态存在分数所需的最低置信度分数。 | `Float [0.0,1.0]` | `0.5` |
| `minTrackingConfidence` | 姿态跟踪被视为成功所需的最低置信度分数。 | `Float [0.0,1.0]` | `0.5` |
| `outputSegmentationMasks` | Pose Landmarker 是否输出检测到的姿态的分割掩码。 | `Boolean` | `False` |
| `resultListener` | 设置结果监听器,以便在 Pose Landmarker 处于实时流模式时异步接收关键点检测器结果。只能在运行模式设置为 `LIVE_STREAM` 时使用。 | `ResultListener` | `N/A` |
| `errorListener` | 设置可选的错误监听器。 | `ErrorListener` | `N/A` |

## 准备数据

Pose Landmarker 支持图像、视频文件和实时视频流。任务会处理数据输入的预处理,包括调整大小、旋转和值归一化。

以下代码演示了如何移交数据进行处理。这些示例包含如何处理来自图像、视频文件和实时视频流的数据的详细信息。

### 图像

```
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage

// Convert the input Bitmap object to an MPImage object to run inference
val mpImage = BitmapImageBuilder(image).build()
```

### 视频

```
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage

val argb8888Frame =
    if (frame.config == Bitmap.Config.ARGB_8888) frame
    else frame.copy(Bitmap.Config.ARGB_8888, false)

// Convert the input Bitmap object to an MPImage object to run inference
val mpImage = BitmapImageBuilder(argb8888Frame).build()
```

### 实时流

```
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage

// Convert the input Bitmap object to an MPImage object to run inference
val mpImage = BitmapImageBuilder(rotatedBitmap).build()
```

在 Pose Landmarker 示例代码中,数据准备在 [`PoseLandmarkerHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/pose_landmarker/android/app/src/main/java/com/google/mediapipe/examples/poselandmarker/PoseLandmarkerHelper.kt) 文件中处理。

## 运行任务

根据您处理的数据类型,使用与该数据类型对应的 `poseLandmarker.detect...()` 方法。单个图像使用 `detect()`,视频文件中的帧使用 `detectForVideo()`,视频流使用 `detectAsync()`。对视频流执行检测时,请确保在单独的线程上运行检测,以免阻塞用户交互线程。

以下代码示例展示了如何在这些不同数据模式下运行 Pose Landmarker:

### 图像

```
val result = poseLandmarker.detect(mpImage)
```

### 视频

```
val timestampMs = i * inferenceIntervalMs

poseLandmarker.detectForVideo(mpImage, timestampMs)
    .let { detectionResult ->
        resultList.add(detectionResult)
    }
```

### 实时流

```
val mpImage = BitmapImageBuilder(rotatedBitmap).build()
val frameTime = SystemClock.uptimeMillis()

poseLandmarker.detectAsync(mpImage, frameTime)
```

请注意以下事项:

-   在视频模式或实时流模式下运行时,您必须向 Pose Landmarker 任务提供输入帧的时间戳。
-   在图像模式或视频模式下运行时,Pose Landmarker 任务会阻塞当前线程,直到处理完输入图像或帧。为避免阻塞用户交互,请在后台线程中执行处理。
-   在实时流模式下运行时,Pose Landmarker 任务会立即返回,不会阻塞当前线程。每次处理完输入帧后,它都会以检测结果调用结果监听器。

在 Pose Landmarker 示例代码中,`detect`、`detectForVideo` 和 `detectAsync` 函数定义在 [`PoseLandmarkerHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/pose_landmarker/android/app/src/main/java/com/google/mediapipe/examples/poselandmarker/PoseLandmarkerHelper.kt) 文件中。

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

Pose Landmarker 示例代码演示了如何显示任务返回的结果,有关更多详情,请参阅 [`OverlayView`](https://github.com/googlesamples/mediapipe/blob/main/examples/pose_landmarker/android/app/src/main/java/com/google/mediapipe/examples/poselandmarker/OverlayView.kt) 类。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*