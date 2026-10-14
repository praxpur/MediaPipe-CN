---
title: "手势识别 Android 指南 (Gesture recognition guide for Android)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer/android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 手势识别 Android 指南 (Gesture recognition guide for Android)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer/android)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 手势识别器 (Gesture Recognizer) 任务可让您实时识别手势，并提供识别出的手势结果和检测到的手部关键点 (landmarks)。这些说明向您展示如何将手势识别器与 Android 应用一起使用。本说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/gesture_recognizer/android) 上获得。

您可以通过查看 [Web 演示](https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/gesture_recognizer) 来了解此任务的实际运行情况。有关此任务的功能、模型和配置选项的更多信息，请参阅[总览 (Overview)](../gesture_recognizer.md)。

## 代码示例 (Code example)

MediaPipe Tasks 示例代码是一个 Android 手势识别器应用的简单实现。该示例使用物理 Android 设备上的摄像头持续检测手势，还可以使用设备图库中的图像和视频静态地检测手势。

您可以将该应用作为您自己的 Android 应用的起点，或者在修改现有应用时参考它。手势识别器示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/gesture_recognizer/android) 上。

### 下载代码 (Download the code)

以下说明向您展示如何使用 [git](https://git-scm.com/) 命令行工具创建示例代码的本地副本。

要下载示例代码：

1.  使用以下命令克隆 git 仓库：

    ```bash
    git clone https://github.com/google-ai-edge/mediapipe-samples
    ```

2.  （可选）配置您的 git 实例使用稀疏检出 (sparse checkout)，以便只保留手势识别器示例应用的文件：

    ```bash
    cd mediapipe-samples
    git sparse-checkout init --cone
    git sparse-checkout set examples/gesture_recognizer/android
    ```

创建示例代码的本地版本后，您可以将项目导入 Android Studio 并运行该应用。有关说明，请参阅 [Android 环境配置指南 (Setup Guide for Android)](../../setup_android.md#example_code)。

### 核心组件 (Key components)

以下文件包含此手势识别示例应用程序的核心代码：

*   [GestureRecognizerHelper.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/gesture_recognizer/android/app/src/main/java/com/google/mediapipe/examples/gesturerecognizer/GestureRecognizerHelper.kt) - 初始化手势识别器并处理模型和委托 (delegate) 的选择。
*   [MainActivity.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/gesture_recognizer/android/app/src/main/java/com/google/mediapipe/examples/gesturerecognizer/MainActivity.kt) - 实现应用程序，包括调用 `GestureRecognizerHelper` 和 `GestureRecognizerResultsAdapter`。
*   [GestureRecognizerResultsAdapter.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/gesture_recognizer/android/app/src/main/java/com/google/mediapipe/examples/gesturerecognizer/fragment/GestureRecognizerResultsAdapter.kt) - 处理和格式化结果。

## 环境配置 (Setup)

本节描述了专为使用手势识别器而设置开发环境和代码项目的关键步骤。有关设置 MediaPipe 任务开发环境（包括平台版本要求）的一般信息，请参阅 [Android 环境配置指南 (Setup guide for Android)](../../setup_android.md)。

### 依赖项 (Dependencies)

手势识别器任务使用 `com.google.mediapipe:tasks-vision` 库。将此依赖项添加到 Android 应用的 `build.gradle` 文件中：

```gradle
dependencies {
    implementation 'com.google.mediapipe:tasks-vision:latest.release'
}
```

### 模型 (Model)

MediaPipe 手势识别器任务需要一个与该任务兼容的已训练的模型包。有关手势识别器可用预训练模型的更多信息，请参阅任务总览中的[模型部分 (Models section)](../gesture_recognizer.md#models)。

选择并下载模型，然后将其存储在您的项目目录中：

```
<dev-project-root>/src/main/assets
```

在 `ModelAssetPath` 参数中指定模型的路径。在示例代码中，模型是在 [`GestureRecognizerHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/gesture_recognizer/android/app/src/main/java/com/google/mediapipe/examples/gesturerecognizer/GestureRecognizerHelper.kt#L76) 文件中定义的：

```kotlin
baseOptionBuilder.setModelAssetPath(MP_RECOGNIZER_TASK)
```

## 创建任务 (Create the task)

MediaPipe 手势识别器任务使用 `createFromOptions()` 函数来设置任务。`createFromOptions()` 函数接受配置选项的值。有关配置选项的更多信息，请参阅[配置选项 (Configuration options)](#configuration_options)。

手势识别器支持 3 种输入数据类型：静态图像、视频文件和实时视频流。您需要在创建任务时指定与输入数据类型相对应的运行模式。选择与您的输入数据类型相对应的选项卡，以查看如何创建任务和运行推理。

### 图像 (Image)

```kotlin
val baseOptionsBuilder = BaseOptions.builder().setModelAssetPath(MP_RECOGNIZER_TASK)
val baseOptions = baseOptionBuilder.build()

val optionsBuilder =
    GestureRecognizer.GestureRecognizerOptions.builder()
        .setBaseOptions(baseOptions)
        .setMinHandDetectionConfidence(minHandDetectionConfidence)
        .setMinTrackingConfidence(minHandTrackingConfidence)
        .setMinHandPresenceConfidence(minHandPresenceConfidence)
        .setRunningMode(RunningMode.IMAGE)

val options = optionsBuilder.build()
gestureRecognizer =
    GestureRecognizer.createFromOptions(context, options)
```

### 视频 (Video)

```kotlin
val baseOptionsBuilder = BaseOptions.builder().setModelAssetPath(MP_RECOGNIZER_TASK)
val baseOptions = baseOptionBuilder.build()

val optionsBuilder =
    GestureRecognizer.GestureRecognizerOptions.builder()
        .setBaseOptions(baseOptions)
        .setMinHandDetectionConfidence(minHandDetectionConfidence)
        .setMinTrackingConfidence(minHandTrackingConfidence)
        .setMinHandPresenceConfidence(minHandPresenceConfidence)
        .setRunningMode(RunningMode.VIDEO)

val options = optionsBuilder.build()
gestureRecognizer =
    GestureRecognizer.createFromOptions(context, options)
```

### 实时流 (Live stream)

```kotlin
val baseOptionsBuilder = BaseOptions.builder().setModelAssetPath(MP_RECOGNIZER_TASK)
val baseOptions = baseOptionBuilder.build()

val optionsBuilder =
    GestureRecognizer.GestureRecognizerOptions.builder()
        .setBaseOptions(baseOptions)
        .setMinHandDetectionConfidence(minHandDetectionConfidence)
        .setMinTrackingConfidence(minHandTrackingConfidence)
        .setMinHandPresenceConfidence(minHandPresenceConfidence)
        .setResultListener(this::returnLivestreamResult)
        .setErrorListener(this::returnLivestreamError)
        .setRunningMode(RunningMode.LIVE_STREAM)

val options = optionsBuilder.build()
gestureRecognizer =
    GestureRecognizer.createFromOptions(context, options)
```

> **注意：** 如果使用实时流模式 (live stream mode)，您需要在创建任务时注册一个结果侦听器 (result listener)。每当任务完成对视频帧的处理时，都会以检测结果和输入图像作为参数调用该侦听器。

> **注意：** 如果使用视频模式或实时流模式，手势识别器会使用跟踪算法，以避免在每一帧上触发手掌检测模型，这有助于降低手势识别器的延迟。

手势识别器示例代码的实现允许用户在处理模式之间进行切换。这种方法使得任务创建代码更加复杂，并且可能不适用于您的特定用例。您可以在 [`GestureRecognizerHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/gesture_recognizer/android/app/src/main/java/com/google/mediapipe/examples/gesturerecognizer/GestureRecognizerHelper.kt#L79-L95) 文件的 `setupGestureRecognizer()` 函数中看到此代码。

### 配置选项 (Configuration options)

此任务具有针对 Android 应用的以下配置选项：

| 选项名称 | 描述 | 取值范围 | 默认值 |
| --- | --- | --- | --- |
| `runningMode` | 设置任务的运行模式。共有三种模式：<br> `IMAGE`：用于单张图像输入的模式。<br> `VIDEO`：用于视频解码帧的模式。<br> `LIVE_STREAM`：用于输入数据实时流（例如来自摄像头）的模式。在此模式下，必须调用 `resultListener` 来设置侦听器以异步接收结果。 | {`IMAGE`, `VIDEO`, `LIVE_STREAM`} | `IMAGE` |
| `numHands` | `GestureRecognizer` 可以检测到的最大手部数量。 | `任何整数 > 0` | `1` |
| `minHandDetectionConfidence` | 在手掌检测模型中，手部检测被认为成功的最低置信度分数。 | `0.0 - 1.0` | `0.5` |
| `minHandPresenceConfidence` | 手部关键点检测模型中手部存在分数的最低置信度分数。在手势识别器的视频模式和实时流模式下，如果手部关键点模型的手部存在置信度分数低于此阈值，则会触发手掌检测模型。否则，使用轻量级手部跟踪算法来确定随后进行关键点检测的手部位置。 | `0.0 - 1.0` | `0.5` |
| `minTrackingConfidence` | 手部跟踪被认为成功的最低置信度分数。这是当前帧和上一帧中手部之间的边界框 IoU 阈值。在手势识别器的视频模式和流模式下，如果跟踪失败，手势识别器会触发手部检测。否则，跳过手部检测。 | `0.0 - 1.0` | `0.5` |
| `cannedGesturesClassifierOptions` | 用于配置预制手势分类器行为的选项。预制手势有 `["None", "Closed_Fist", "Open_Palm", "Pointing_Up", "Thumb_Down", "Thumb_Up", "Victory", "ILoveYou"]`<br> - Display names locale（显示名称区域设置）：如果有的话，通过 TFLite 模型元数据指定的用于显示名称的区域设置。<br> - Max results（最大结果数）：要返回的得分最高的分类结果的最大数量。如果 < 0，将返回所有可用结果。<br> - Score threshold（分数阈值）：结果被拒绝的分数下限。如果设置为 0，将返回所有可用结果。<br> - Category allowlist（类别允许列表）：类别名称的允许列表。如果非空，类别不在此集合中的分类结果将被过滤掉。与拒绝列表互斥。<br> - Category denylist（类别拒绝列表）：类别名称的拒绝列表。如果非空，类别在此集合中的分类结果将被过滤掉。与允许列表互斥。 | * Display names locale：`任意字符串` <br> * Max results：`任意整数` <br> * Score threshold：`0.0-1.0` <br> * Category allowlist：`字符串向量 (vector of strings)` <br> * Category denylist：`字符串向量 (vector of strings)` | * Display names locale：`"en"` <br> * Max results：`-1` <br> * Score threshold：`0` <br> * Category allowlist：空 <br> * Category denylist：空 |
| `customGesturesClassifierOptions` | 用于配置自定义手势分类器行为的选项。<br> - Display names locale（显示名称区域设置）：如果有的话，通过 TFLite 模型元数据指定的用于显示名称的区域设置。<br> - Max results（最大结果数）：要返回的得分最高的分类结果的最大数量。如果 < 0，将返回所有可用结果。<br> - Score threshold（分数阈值）：结果被拒绝的分数下限。如果设置为 0，将返回所有可用结果。<br> - Category allowlist（类别允许列表）：类别名称的允许列表。如果非空，类别不在此集合中的分类结果将被过滤掉。与拒绝列表互斥。<br> - Category denylist（类别拒绝列表）：类别名称的拒绝列表。如果非空，类别在此集合中的分类结果将被过滤掉。与允许列表互斥。 | * Display names locale：`任意字符串` <br> * Max results：`任意整数` <br> * Score threshold：`0.0-1.0` <br> * Category allowlist：`字符串向量 (vector of strings)` <br> * Category denylist：`字符串向量 (vector of strings)` | * Display names locale：`"en"` <br> * Max results：`-1` <br> * Score threshold：`0` <br> * Category allowlist：空 <br> * Category denylist：空 |
| `resultListener` | 设置结果侦听器，以便在手势识别器处于实时流模式时异步接收分类结果。仅在运行模式设置为 `LIVE_STREAM` 时使用。 | `ResultListener` | N/A |
| `errorListener` | 设置一个可选的错误侦听器 (error listener)。 | `ErrorListener` | N/A |

## 准备数据 (Prepare data)

手势识别器可处理图像、视频文件和实时流视频。任务处理数据输入预处理，包括调整大小、旋转和值归一化 (value normalization)。

以下代码演示了如何交接数据进行处理。这些示例包含如何处理来自图像、视频文件和实时视频流的数据的详细信息。

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

在手势识别器示例代码中，数据准备在 [`GestureRecognizerHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/gesture_recognizer/android/app/src/main/java/com/google/mediapipe/examples/gesturerecognizer/GestureRecognizerHelper.kt#L123-L154) 文件中处理。

## 运行任务 (Run the task)

手势识别器使用 `recognize`、`recognizeForVideo` 和 `recognizeAsync` 函数来触发推理 (inferences)。对于手势识别，这涉及预处理输入数据、检测图像中的手部、检测手部关键点以及从关键点中识别手势。

以下代码演示了如何使用任务模型执行处理。这些示例包含如何处理来自图像、视频文件和实时视频流的数据的详细信息。

### 图像 (Image)

```kotlin
val result = gestureRecognizer?.recognize(mpImage)
```

### 视频 (Video)

```kotlin
val timestampMs = i * inferenceIntervalMs

gestureRecognizer?.recognizeForVideo(mpImage, timestampMs)
    ?.let { recognizerResult ->
        resultList.add(recognizerResult)
    }
```

### 实时流 (Live stream)

```kotlin
val mpImage = BitmapImageBuilder(rotatedBitmap).build()
val frameTime = SystemClock.uptimeMillis()

gestureRecognizer?.recognizeAsync(mpImage, frameTime)
```

请注意以下事项：

*   在视频模式或实时流模式下运行时，您还必须将输入帧的时间戳 (timestamp) 提供给手势识别器任务。
*   在图像或视频模式下运行时，手势识别器任务将阻塞当前线程，直到完成对输入图像或帧的处理。为了避免阻塞用户界面，请在后台线程中执行处理。
*   在实时流模式下运行时，手势识别器任务不会阻塞当前线程，而是立即返回。每次完成输入帧的处理后，它将使用识别结果调用其结果侦听器。如果在手势识别器任务正忙于处理另一个帧时调用识别函数，任务将忽略新的输入帧。

在手势识别器示例代码中，`recognize`、`recognizeForVideo` 和 `recognizeAsync` 函数定义在 [`GestureRecognizerHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/gesture_recognizer/android/app/src/main/java/com/google/mediapipe/examples/gesturerecognizer/fragment/GestureRecognizerResultsAdapter.kt) 文件中。

## 处理和显示结果 (Handle and display results)

手势识别器会为每次识别运行生成一个手势检测结果对象。结果对象包含图像坐标中的手部关键点、世界坐标中的手部关键点、惯用手（左手/右手）以及检测到的手部的手势类别。

以下显示了此任务的输出数据示例：

产生的 `GestureRecognizerResult` 包含四个组件，每个组件都是一个数组，其中每个元素包含单只检测到的手部的检测结果。

*   Handedness（惯用手）

    惯用手代表检测到的手是左手还是右手。
*   Gestures（手势）

    检测到的手部被识别出的手势类别。
*   Landmarks（关键点）

    共有 21 个手部关键点，每个关键点由 `x`、`y` 和 `z` 坐标组成。`x` 和 `y` 坐标分别由图像宽度和高度归一化到 [0.0, 1.0]。`z` 坐标代表关键点深度，以手腕处的深度作为原点。值越小，关键点离相机越近。`z` 的大小比例与 `x` 大致相同。
*   World Landmarks（世界坐标关键点）

    这 21 个手部关键点也以世界坐标呈现。每个关键点由 `x`、`y` 和 `z` 组成，表示以手部几何中心为原点、单位为米的真实世界 3D 坐标。

```
GestureRecognizerResult:
  Handedness:
    Categories #0:
      index        : 0
      score        : 0.98396
      categoryName : Left
  Gestures:
    Categories #0:
      score        : 0.76893
      categoryName : Thumb_Up
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

下图显示了任务输出的可视化：

![呈现比出大拇指朝上手势的手，并在手上映射出骨骼结构](../../../../assets/misc/android/gesture-recognizer.png)

在手势识别器示例代码中，处理结果的代码位于 [`GestureRecognizerResultsAdapter.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/gesture_recognizer/android/app/src/main/java/com/google/mediapipe/examples/gesturerecognizer/fragment/GestureRecognizerResultsAdapter.kt#L37-L48) 文件中的 `GestureRecognizerResultsAdapter` 类中。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*
