---
title: "Android 面部关键点检测指南 (Face landmark detection guide for Android)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2024-05-14 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Android 面部关键点检测指南 (Face landmark detection guide for Android)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/android)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Face Landmarker 任务可让您检测图像和视频中的面部关键点 (face landmarks) 和面部表情。您可以使用此任务来识别人的面部表情、应用面部滤镜和特效，以及创建虚拟形象。此任务使用可处理单张图像或连续图像数据流的机器学习 (ML) 模型。该任务输出 3D 面部关键点、混合形状得分 (blendshape scores，表示面部表情的系数) 以实时推断详细的面部表面，以及变换矩阵 (transformation matrices) 以执行渲染特效所需的变换。

本说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_landmarker/android) 上找到。
有关此任务的功能、模型和配置选项的更多信息，请参阅[概述](../face_landmarker.md)。

## 代码示例 (Code example)

MediaPipe Tasks 的示例代码提供了 Android 上 Face Landmarker 应用的简单实现。该示例使用物理 Android 设备上的摄像头来检测连续视频数据流中的面部。该应用还可以检测设备图库中图像和视频里的面部。

您可以将此应用作为您自己的 Android 应用的起点，或在修改现有应用时参考它。Face Landmarker 示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_landmarker) 上。

### 下载代码 (Download the code)

以下说明向您展示如何使用 [git](https://git-scm.com/) 命令行工具创建示例代码的本地副本。

要下载示例代码：

1. 使用以下命令克隆 git 仓库：

   ```bash
   git clone https://github.com/google-ai-edge/mediapipe-samples
   ```
2. （可选）配置您的 git 实例以使用稀疏签出 (sparse checkout)，这样您就只有 Face Landmarker 示例应用的文件：

   ```bash
   cd mediapipe-samples
   git sparse-checkout init --cone
   git sparse-checkout set examples/face_landmarker/android
   ```

创建示例代码的本地版本后，您可以将项目导入 Android Studio 并运行该应用。有关说明，请参阅 [Android 环境配置指南](../../setup_android.md#example_code)。

### 关键组件 (Key components)

以下文件包含此面部关键点检测示例应用的关键代码：

* [FaceLandmarkerHelper.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/face_landmarker/android/app/src/main/java/com/google/mediapipe/examples/facelandmarker/FaceLandmarkerHelper.kt) - 初始化 face landmarker 并处理模型和委托 (delegate) 选择。
* [CameraFragment.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/face_landmarker/android/app/src/main/java/com/google/mediapipe/examples/facelandmarker/fragment/CameraFragment.kt) - 处理设备摄像头并处理图像和视频输入数据。
* [GalleryFragment.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/face_landmarker/android/app/src/main/java/com/google/mediapipe/examples/facelandmarker/fragment/GalleryFragment.kt) - 与 `OverlayView` 交互以显示输出图像或视频。
* [OverlayView.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/face_landmarker/android/app/src/main/java/com/google/mediapipe/examples/facelandmarker/OverlayView.kt) - 为检测到的面部实现带有面部网格 (face mesh) 的显示。

## 环境配置 (Setup)

本节介绍专门为使用 Face Landmarker 配置开发环境和代码项目的关键步骤。有关配置使用 MediaPipe Tasks 的开发环境（包括平台版本要求）的通用信息，请参阅 [Android 环境配置指南](../../setup_android.md)。

### 依赖项 (Dependencies)

Face Landmarker 任务使用 `com.google.mediapipe:tasks-vision` 库。将此依赖项添加到 Android 应用的 `build.gradle` 文件中：

```groovy
dependencies {
    implementation 'com.google.mediapipe:tasks-vision:latest.release'
}
```

### 模型 (Model)

MediaPipe Face Landmarker 任务需要一个与此任务兼容的训练好的模型包。有关 Face Landmarker 的可用训练模型的更多信息，请参阅任务概述的[模型部分](../face_landmarker.md#models)。

选择并下载模型，并将其存储在项目目录中：

```
<dev-project-root>/src/main/assets
```

在 `ModelAssetPath` 参数中指定模型的路径。在示例代码中，模型定义在 [`FaceLandmarkerHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/face_landmarker/android/app/src/main/java/com/google/mediapipe/examples/facelandmarker/FaceLandmarkerHelper.kt) 文件中：

```kotlin
baseOptionsBuilder.setModelAssetPath(MP_FACE_LANDMARKER_TASK)
```

## 创建任务 (Create the task)

MediaPipe Face Landmarker 任务使用 `createFromOptions()` 函数来设置任务。`createFromOptions()` 函数接受配置选项的值。有关配置选项的更多信息，请参阅[配置选项](#configuration_options)。

Face Landmarker 支持以下输入数据类型：静态图像、视频文件和实时视频数据流。在创建任务时，您需要指定与输入数据类型相对应的运行模式 (running mode)。选择与您的输入数据类型对应的选项卡，以查看如何创建任务并运行推理。

### 图像 (Image)

```kotlin
val baseOptionsBuilder = BaseOptions.builder().setModelAssetPath(MP_FACE_LANDMARKER_TASK)
val baseOptions = baseOptionBuilder.build()

val optionsBuilder = 
    FaceLandmarker.FaceLandmarkerOptions.builder()
        .setBaseOptions(baseOptionsBuilder.build())
        .setMinFaceDetectionConfidence(minFaceDetectionConfidence)
        .setMinTrackingConfidence(minFaceTrackingConfidence)
        .setMinFacePresenceConfidence(minFacePresenceConfidence)
        .setNumFaces(maxNumFaces)
        .setRunningMode(RunningMode.IMAGE)

val options = optionsBuilder.build()
FaceLandmarker = FaceLandmarker.createFromOptions(context, options)
```

### 视频 (Video)

```kotlin
val baseOptionsBuilder = BaseOptions.builder().setModelAssetPath(MP_FACE_LANDMARKER_TASK)
val baseOptions = baseOptionBuilder.build()

val optionsBuilder = 
    FaceLandmarker.FaceLandmarkerOptions.builder()
        .setBaseOptions(baseOptionsBuilder.build())
        .setMinFaceDetectionConfidence(minFaceDetectionConfidence)
        .setMinTrackingConfidence(minFaceTrackingConfidence)
        .setMinFacePresenceConfidence(minFacePresenceConfidence)
        .setNumFaces(maxNumFaces)
        .setRunningMode(RunningMode.VIDEO)

val options = optionsBuilder.build()
FaceLandmarker = FaceLandmarker.createFromOptions(context, options)
```

### 实时流 (Live stream)

```kotlin
val baseOptionsBuilder = BaseOptions.builder().setModelAssetPath(MP_FACE_LANDMARKER_TASK)
val baseOptions = baseOptionBuilder.build()

val optionsBuilder = 
    FaceLandmarker.FaceLandmarkerOptions.builder()
        .setBaseOptions(baseOptionsBuilder.build())
        .setMinFaceDetectionConfidence(minFaceDetectionConfidence)
        .setMinTrackingConfidence(minFaceTrackingConfidence)
        .setMinFacePresenceConfidence(minFacePresenceConfidence)
        .setNumFaces(maxNumFaces)
        .setResultListener(this::returnLivestreamResult)
        .setErrorListener(this::returnLivestreamError)
        .setRunningMode(RunningMode.LIVE_STREAM)

val options = optionsBuilder.build()
FaceLandmarker = FaceLandmarker.createFromOptions(context, options)
```

> **注意:** 如果您使用 live stream 模式，则在创建任务时需要注册一个结果监听器 (result listener)。每当任务完成一个摄像头帧的处理时，它都会调用该监听器，并将检测结果 (detection result) 和输入图像作为参数。

> **注意:** 如果您使用 video 模式或 live stream 模式，Face Landmarker 会使用跟踪功能以避免在每一帧上触发检测模型，这有助于降低延迟。

Face Landmarker 示例代码实现允许用户在处理模式之间切换。这种方法使任务创建代码更加复杂，可能不适合您的用例。您可以在 [`FaceLandmarkerHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/face_landmarker/android/app/src/main/java/com/google/mediapipe/examples/facelandmarker/FaceLandmarkerHelper.kt) 文件的 `setupFaceLandmarker()` 函数中看到此代码。

### 配置选项 (Configuration options)

此任务为 Android 应用提供以下配置选项：

| 选项名称 (Option Name) | 说明 (Description) | 值范围 (Value Range) | 默认值 (Default Value) |
| --- | --- | --- | --- |
| `runningMode` | 设置任务的运行模式。有三种模式：IMAGE：用于单张图像输入的模式。VIDEO：用于视频解码帧的模式。LIVE_STREAM：用于输入数据流（例如来自摄像头的实时流）的模式。在这种模式下，必须调用 `resultListener` 来设置监听器，以异步接收结果。 | {`IMAGE, VIDEO, LIVE_STREAM`} | `IMAGE` |
| `numFaces` | `FaceLandmarker` 可以检测到的最大面部数量。仅当 `num_faces` 设置为 1 时才应用平滑处理。 | `Integer > 0` | `1` |
| `minFaceDetectionConfidence` | 面部检测被视为成功的最低置信度得分。 | `Float [0.0,1.0]` | `0.5` |
| `minFacePresenceConfidence` | 面部关键点检测中面部存在得分的最低置信度得分。 | `Float [0.0,1.0]` | `0.5` |
| `minTrackingConfidence` | 面部跟踪被视为成功的最低置信度得分。 | `Float [0.0,1.0]` | `0.5` |
| `outputFaceBlendshapes` | Face Landmarker 是否输出面部混合形状 (face blendshapes)。面部混合形状用于渲染 3D 面部模型。<br>**注意:** `*Left` 和 `*Right` 混合形状对应于主体的面部，而不是观察者的方向。传入水平镜像的图像将反转这些输出。 | `Boolean` | `False` |
| `outputFacialTransformationMatrixes` | FaceLandmarker 是否输出面部变换矩阵。FaceLandmarker 使用矩阵将面部关键点从规范的面部模型变换到检测到的面部，以便用户可以将特效应用在检测到的关键点上。 | `Boolean` | `False` |
| `resultListener` | 当 FaceLandmarker 处于实时流模式时，设置结果监听器以异步接收 landmarker 结果。只能在运行模式设置为 `LIVE_STREAM` 时使用。 | `ResultListener` | `N/A` |
| `errorListener` | 设置一个可选的错误监听器。 | `ErrorListener` | `N/A` |

## 准备数据 (Prepare data)

Face Landmarker 适用于图像、视频文件和实时视频数据流。该任务会处理数据输入的预处理，包括缩放、旋转和值归一化。

以下代码演示了如何提交数据以进行处理。这些示例包含了如何处理来自图像、视频文件和实时视频数据流的数据的详细信息。

### 图像 (Image)

```kotlin
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage

// Convert the input Bitmap object to an MPImage object to run inference
val mpImage = BitmapImageBuilder(image).build()
```

### 视频 (Video)

```kotlin
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage

val argb8888Frame =
    if (frame.config == Bitmap.Config.ARGB_8888) frame
    else frame.copy(Bitmap.Config.ARGB_8888, false)

// Convert the input Bitmap object to an MPImage object to run inference
val mpImage = BitmapImageBuilder(argb8888Frame).build()
```

### 实时流 (Live stream)

```kotlin
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage

// Convert the input Bitmap object to an MPImage object to run inference
val mpImage = BitmapImageBuilder(rotatedBitmap).build()
```

在 Face Landmarker 示例代码中，数据准备工作是在 [`FaceLandmarkerHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/face_landmarker/android/app/src/main/java/com/google/mediapipe/examples/facelandmarker/FaceLandmarkerHelper.kt) 文件中处理的。

## 运行任务 (Run the task)

根据您处理的数据类型，使用特定于该数据类型的 `FaceLandmarker.detect...()` 方法。对于单个图像使用 `detect()`，对于视频文件中的帧使用 `detectForVideo()`，对于视频流使用 `detectAsync()`。当您在视频流上执行检测时，请确保在单独的线程上运行检测，以避免阻塞用户界面线程。

以下代码示例显示了如何在这些不同的数据模式下运行 Face Landmarker 的简单示例：

### 图像 (Image)

```kotlin
val result = FaceLandmarker.detect(mpImage)
```

### 视频 (Video)

```kotlin
val timestampMs = i * inferenceIntervalMs

FaceLandmarker.detectForVideo(mpImage, timestampMs)
    .let { detectionResult ->
        resultList.add(detectionResult)
    }
```

### 实时流 (Live stream)

```kotlin
val mpImage = BitmapImageBuilder(rotatedBitmap).build()
val frameTime = SystemClock.uptimeMillis()

FaceLandmarker.detectAsync(mpImage, frameTime)
```

请注意以下几点：

* 在 video 模式或 live stream 模式下运行时，您必须向 Face Landmarker 任务提供输入帧的时间戳 (timestamp)。
* 在 image 模式或 video 模式下运行时，Face Landmarker 任务会阻塞当前线程，直到其完成对输入图像或帧的处理。为避免阻塞用户界面，请在后台线程中执行处理工作。
* 在 live stream 模式下运行时，Face Landmarker 任务会立即返回并且不会阻塞当前线程。每当它完成对输入帧的处理时，都会使用检测结果调用结果监听器。

在 Face Landmarker 示例代码中，`detect`、`detectForVideo` 和 `detectAsync` 函数定义在 [`FaceLandmarkerHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/face_landmarker/android/app/src/main/java/com/google/mediapipe/examples/facelandmarker/FaceLandmarkerHelper.kt) 文件中。

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

Face Landmarker 示例代码演示了如何显示任务返回的结果，请参阅 [`OverlayView`](https://github.com/googlesamples/mediapipe/blob/main/examples/face_landmarker/android/app/src/main/java/com/google/mediapipe/examples/facelandmarker/OverlayView.kt) 类以了解更多详细信息。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*
