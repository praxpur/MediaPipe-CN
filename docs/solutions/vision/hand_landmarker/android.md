---
title: "Android 手部关键点检测指南 (Hand landmarks detection guide for Android)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Android 手部关键点检测指南 (Hand landmarks detection guide for Android)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/android)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Hand Landmarker(手部关键点检测器)任务可让您检测图像中手部的关键点。本说明向您展示如何在 Android 应用中使用 Hand Landmarker。本说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/hand_landmarker/android) 上获取。

有关此任务的功能、模型和配置选项的更多信息,请参阅[概览](../hand_landmarker.md)。

## 代码示例

MediaPipe Tasks 示例代码是一个适用于 Android 的 Hand Landmarker 应用的简单实现。该示例使用物理 Android 设备上的摄像头在连续视频流中检测手部关键点,也可以使用设备图库中的图像和视频静态检测手部关键点。

您可以将该应用作为自己 Android 应用的起点,或在修改现有应用时参考它。Hand Landmarker 示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/hand_landmarker) 上。

### 下载代码

以下说明向您展示如何使用 [git](https://git-scm.com/) 命令行工具创建示例代码的本地副本。

要下载示例代码:

1.  使用以下命令克隆 git 仓库:

    ```
    git clone https://github.com/google-ai-edge/mediapipe-samples
    ```

2.  (可选)配置 git 实例使用稀疏检出 (sparse checkout),以便只保留 Hand Landmarker 示例应用所需的文件:

    ```
    cd mediapipe-samples
    git sparse-checkout init --cone
    git sparse-checkout set examples/hand_landmarker/android
    ```

创建示例代码的本地版本后,您可以将项目导入 Android Studio 并运行该应用。有关说明,请参阅 [Android 环境配置指南](../../setup_android.md#example_code)。

### 关键组件

以下文件包含此手部关键点检测示例应用的关键代码:

-   [HandLandmarkerHelper.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/hand_landmarker/android/app/src/main/java/com/google/mediapipe/examples/handlandmarker/HandLandmarkerHelper.kt) — 初始化手部关键点检测器,并处理模型和委托 (delegate) 的选择。
-   [MainActivity.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/hand_landmarker/android/app/src/main/java/com/google/mediapipe/examples/handlandmarker/MainActivity.kt) — 实现应用,包括调用 `HandLandmarkerHelper`。

## 环境配置

本节介绍为使用 Hand Landmarker 而设置开发环境和代码项目的关键步骤。有关设置开发环境以使用 MediaPipe 任务的一般信息(包括平台版本要求),请参阅 [Android 环境配置指南](../../setup_android.md)。

### 依赖

Hand Landmarker 任务使用 `com.google.mediapipe:tasks-vision` 库。将此依赖添加到 Android 应用的 `build.gradle` 文件中:

```
dependencies {
    implementation 'com.google.mediapipe:tasks-vision:latest.release'
}
```

### 模型

MediaPipe Hand Landmarker 任务需要一个与此任务兼容的已训练模型包。有关 Hand Landmarker 可用已训练模型的更多信息,请参阅任务概览中的[模型部分](../hand_landmarker.md#models)。

选择并下载模型,然后将其存放在项目目录中:

```
<dev-project-root>/src/main/assets
```

在 `ModelAssetPath` 参数中指定模型的路径。在示例代码中,模型定义在 [`HandLandmarkerHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/hand_landmarker/android/app/src/main/java/com/google/mediapipe/examples/handlandmarker/HandLandmarkerHelper.kt#L84) 文件中:

```
baseOptionBuilder.setModelAssetPath(MP_HAND_LANDMARKER_TASK)
```

## 创建任务

MediaPipe Hand Landmarker 任务使用 `createFromOptions()` 函数来设置任务。`createFromOptions()` 函数接受配置选项的值。有关配置选项的更多信息,请参阅[配置选项](#configuration_options)。

Hand Landmarker 支持 3 种输入数据类型:静态图像、视频文件和实时视频流。您需要在创建任务时指定与输入数据类型对应的运行模式。选择与您的输入数据类型对应的标签页,以了解如何创建任务并运行推理。

### 图像

```
val baseOptionsBuilder = BaseOptions.builder().setModelAssetPath(MP_HAND_LANDMARKER_TASK)
val baseOptions = baseOptionBuilder.build()

val optionsBuilder =
    HandLandmarker.HandLandmarkerOptions.builder()
        .setBaseOptions(baseOptions)
        .setMinHandDetectionConfidence(minHandDetectionConfidence)
        .setMinTrackingConfidence(minHandTrackingConfidence)
        .setMinHandPresenceConfidence(minHandPresenceConfidence)
        .setNumHands(maxNumHands)
        .setRunningMode(RunningMode.IMAGE)

val options = optionsBuilder.build()

handLandmarker =
    HandLandmarker.createFromOptions(context, options)
```

### 视频

```
val baseOptionsBuilder = BaseOptions.builder().setModelAssetPath(MP_HAND_LANDMARKER_TASK)
val baseOptions = baseOptionBuilder.build()

val optionsBuilder =
    HandLandmarker.HandLandmarkerOptions.builder()
        .setBaseOptions(baseOptions)
        .setMinHandDetectionConfidence(minHandDetectionConfidence)
        .setMinTrackingConfidence(minHandTrackingConfidence)
        .setMinHandPresenceConfidence(minHandPresenceConfidence)
        .setNumHands(maxNumHands)
        .setRunningMode(RunningMode.VIDEO)

val options = optionsBuilder.build()

handLandmarker =
    HandLandmarker.createFromOptions(context, options)
```

### 实时流

```
val baseOptionsBuilder = BaseOptions.builder().setModelAssetPath(MP_HAND_LANDMARKER_TASK)
val baseOptions = baseOptionBuilder.build()

val optionsBuilder =
    HandLandmarker.HandLandmarkerOptions.builder()
        .setBaseOptions(baseOptions)
        .setMinHandDetectionConfidence(minHandDetectionConfidence)
        .setMinTrackingConfidence(minHandTrackingConfidence)
        .setMinHandPresenceConfidence(minHandPresenceConfidence)
        .setNumHands(maxNumHands)
        .setResultListener(this::returnLivestreamResult)
        .setErrorListener(this::returnLivestreamError)
        .setRunningMode(RunningMode.VIDEO)

val options = optionsBuilder.build()

handLandmarker =
    HandLandmarker.createFromOptions(context, options)
```

> **注意:** 如果使用实时流模式,您需要在创建任务时注册结果监听器。任务在处理完视频帧后,会以检测结果和输入图像作为参数调用该监听器。

> **注意:** 如果使用视频模式或实时流模式,Hand Landmarker 会使用跟踪,以避免在每一帧上都触发手掌检测模型,这有助于降低延迟。

Hand Landmarker 示例代码的实现允许用户在处理模式之间切换。这种方法使任务创建代码更加复杂,可能不适合您的用例。您可以在 [`HandLandmarkerHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/hand_landmarker/android/app/src/main/java/com/google/mediapipe/examples/handlandmarker/HandLandmarkerHelper.kt#L70-L143) 文件的 `setupHandLandmarker()` 函数中查看此代码。

### 配置选项

此任务对 Android 应用有以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `runningMode` | 设置任务的运行模式。共有三种模式:<br><br>IMAGE:用于单张图像输入的模式。<br><br>VIDEO:用于视频已解码帧的模式。<br><br>LIVE_STREAM:用于输入数据实时流(如来自摄像头)的模式。在此模式下,必须调用 resultListener 来设置监听器,以异步接收结果。 | {`IMAGE, VIDEO, LIVE_STREAM`} | `IMAGE` |
| `numHands` | Hand landmark detector(手部关键点检测器)检测到的最大手数。 | `任意整数 > 0` | `1` |
| `minHandDetectionConfidence` | 手掌检测模型中认为手部检测成功所需的最低置信度分数。 | `0.0 - 1.0` | `0.5` |
| `minHandPresenceConfidence` | 手部关键点检测模型中手部存在分数所需的最低置信度分数。在视频模式和实时流模式下,如果手部关键点模型的手部存在置信度分数低于此阈值,Hand Landmarker 将触发手掌检测模型。否则,一个轻量级的手部跟踪算法会确定手部的位置,用于后续的关键点检测。 | `0.0 - 1.0` | `0.5` |
| `minTrackingConfidence` | 认为手部跟踪成功所需的最低置信度分数。这是当前帧与上一帧手部之间边界框的 IoU 阈值。在 Hand Landmarker 的视频模式和数据流模式下,如果跟踪失败,Hand Landmarker 将触发手部检测。否则,它会跳过手部检测。 | `0.0 - 1.0` | `0.5` |
| `resultListener` | 设置结果监听器,以便在手部关键点检测器处于实时流模式时异步接收检测结果。仅在运行模式设置为 `LIVE_STREAM` 时适用。 | 不适用 | 不适用 |
| `errorListener` | 设置可选的错误监听器。 | 不适用 | 不适用 |

## 准备数据

Hand Landmarker 支持图像、视频文件和实时视频流。任务会处理数据输入的预处理,包括调整大小、旋转和值归一化。

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

在 Hand Landmarker 示例代码中,数据准备在 [`HandLandmarkerHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/hand_landmarker/android/app/src/main/java/com/google/mediapipe/examples/handlandmarker/HandLandmarkerHelper.kt#L159-L214) 文件中处理。

## 运行任务

根据您处理的数据类型,使用与该数据类型对应的 `HandLandmarker.detect...()` 方法。单个图像使用 `detect()`,视频文件中的帧使用 `detectForVideo()`,视频流使用 `detectAsync()`。对视频流执行检测时,请确保在单独的线程上运行检测,以免阻塞用户交互线程。

以下代码示例展示了如何在这些不同数据模式下运行 Hand Landmarker:

### 图像

```
val result = handLandmarker?.detect(mpImage)
```

### 视频

```
val timestampMs = i * inferenceIntervalMs

handLandmarker?.detectForVideo(mpImage, timestampMs)
    ?.let { detectionResult ->
        resultList.add(detectionResult)
    }
```

### 实时流

```
val mpImage = BitmapImageBuilder(rotatedBitmap).build()
val frameTime = SystemClock.uptimeMillis()

handLandmarker?.detectAsync(mpImage, frameTime)
```

请注意以下事项:

-   在视频模式或实时流模式下运行时,您必须向 Hand Landmarker 任务提供输入帧的时间戳。
-   在图像模式或视频模式下运行时,Hand Landmarker 任务会阻塞当前线程,直到处理完输入图像或帧。为避免阻塞用户交互,请在后台线程中执行处理。
-   在实时流模式下运行时,Hand Landmarker 任务不会阻塞当前线程,而是立即返回。每次处理完输入帧后,它都会以检测结果调用结果监听器。如果在 Hand Landmarker 任务忙于处理另一帧时调用检测函数,任务将忽略新的输入帧。

在 Hand Landmarker 示例代码中,`detect`、`detectForVideo` 和 `detectAsync` 函数定义在 [`HandLandmarkerHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/hand_landmarker/android/app/src/main/java/com/google/mediapipe/examples/handlandmarker/HandLandmarkerHelper.kt#L159-L214) 文件中。

## 处理并显示结果

Hand Landmarker 每次检测运行都会生成一个手部关键点检测器结果对象。结果对象包含图像坐标下的手部关键点、世界坐标下的手部关键点,以及检测到手部的手性(左手/右手)。

以下是此任务输出数据的示例:

`HandLandmarkerResult` 输出包含三个组成部分。每个组成部分都是一个数组,其中每个元素包含单只检测到手部的以下结果:

-   手性 (Handedness) — 表示检测到的手是左手还是右手。
-   关键点 (Landmarks) — 共有 21 个手部关键点,每个由 `x`、`y` 和 `z` 坐标组成。`x` 和 `y` 坐标分别按图像宽度和高度归一化至 [0.0, 1.0]。`z` 坐标表示关键点的深度,以手腕处深度为原点。值越小,关键点离摄像头越近。`z` 的大小使用与 `x` 大致相同的比例。
-   世界关键点 (World Landmarks) — 这 21 个手部关键点也以世界坐标呈现。每个关键点由 `x`、`y` 和 `z` 组成,表示以手部几何中心为原点的、以米为单位的真实世界 3 维坐标。

```
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

下图展示了任务输出的可视化:

![一只竖起大拇指的手,其手部骨骼结构已被勾勒出来](../../../../assets/edge/mediapipe/images/solutions/gesture-recognizer.png)

Hand Landmarker 示例代码演示了如何显示任务返回的结果,有关更多详情,请参阅 [`OverlayView`](https://github.com/googlesamples/mediapipe/blob/main/examples/hand_landmarker/android/app/src/main/java/com/google/mediapipe/examples/handlandmarker/OverlayView.kt) 类。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*