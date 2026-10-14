---
title: "Android 人脸检测指南 (Face detection guide for Android)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/face_detector/android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Android 人脸检测指南 (Face detection guide for Android)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/face_detector/android)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 人脸检测器(Face Detector)任务允许您在图像或视频中检测人脸。您可以使用此任务定位一帧画面中的人脸和面部特征。此任务使用一个机器学习(ML)模型,适用于单张图像或连续的图像流。任务会输出人脸的位置,以及以下面部关键点:左眼、右眼、鼻尖、嘴巴、左耳屏点和右耳屏点。

本说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_detector/android) 上获取。有关此任务的功能、模型和配置选项的更多信息,请参阅[概览](../face_detector.md)。

## 代码示例 (Code example)

MediaPipe Tasks 示例代码是 Android 人脸检测器应用的一个简单实现。该示例使用物理 Android 设备上的摄像头,在连续的视频流中检测人脸。该应用还可以检测设备相册中图像和视频里的人脸。

您可以将该应用作为自己 Android 应用的起点,也可以在修改现有应用时参考它。人脸检测器示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_detector) 上。

### 下载代码 (Download the code)

以下说明介绍如何使用 [git](https://git-scm.com/) 命令行工具创建示例代码的本地副本。

要下载示例代码:

1.  使用以下命令克隆 git 代码库:

    ```
    git clone https://github.com/google-ai-edge/mediapipe-samples
    ```

2.  或者,配置您的 git 实例使用稀疏检出,以便只保留人脸检测器示例应用所需的文件:

    ```
    cd mediapipe-samples
    git sparse-checkout init --cone
    git sparse-checkout set examples/face_detector/android
    ```

创建示例代码的本地版本后,您可以将项目导入 Android Studio 并运行应用。有关说明,请参阅 [Android 环境配置指南](../../../setup_android.md#example_code)。

### 关键组件 (Key components)

以下文件包含此人脸检测示例应用的关键代码:

-   [FaceDetectorHelper.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/face_detector/android/app/src/main/java/com/google/mediapipe/examples/facedetection/FaceDetectorHelper.kt) — 初始化人脸检测器,并处理模型和委托的选择。
-   [CameraFragment.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/face_detector/android/app/src/main/java/com/google/mediapipe/examples/facedetection/fragments/CameraFragment.kt) — 处理设备摄像头,并处理图像和视频输入数据。
-   [GalleryFragment.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/face_detector/android/app/src/main/java/com/google/mediapipe/examples/facedetection/fragments/GalleryFragment.kt) — 与 `OverlayView` 交互以显示输出图像或视频。
-   [OverlayView.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/face_detector/android/app/src/main/java/com/google/mediapipe/examples/facedetection/OverlayView.kt) — 实现显示检测到人脸的边界框。

## 环境配置 (Setup)

本节介绍为使用人脸检测器配置开发环境和代码项目的关键步骤。有关使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参阅 [Android 环境配置指南](../../../setup_android.md)。

### 依赖项 (Dependencies)

人脸检测器任务使用 `com.google.mediapipe:tasks-vision` 库。将此依赖项添加到 Android 应用的 `build.gradle` 文件中:

```
dependencies {
    implementation 'com.google.mediapipe:tasks-vision:latest.release'
}
```

### 模型 (Model)

MediaPipe 人脸检测器任务需要一个与此任务兼容的已训练模型包。有关人脸检测器可用已训练模型的更多信息,请参阅任务概览的[模型章节](../face_detector.md#models)。

选择并下载模型,并将其存储在项目目录中:

```
<dev-project-root>/src/main/assets
```

在 `ModelAssetPath` 参数中指定模型的路径。在示例代码中,模型在 [`FaceDetectorHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/face_detector/android/app/src/main/java/com/google/mediapipe/examples/facedetection/FaceDetectorHelper.kt) 文件中定义:

```
val modelName = "face_detection_short_range.tflite"
baseOptionsBuilder.setModelAssetPath(modelName)
```

## 创建任务 (Create the task)

MediaPipe 人脸检测器任务使用 `createFromOptions()` 函数来设置任务。`createFromOptions()` 函数接受配置选项的值。有关配置选项的更多信息,请参阅[配置选项](#configuration_options)。

人脸检测器支持以下输入数据类型:静态图像、视频文件和实时视频流。创建任务时,您需要指定与输入数据类型对应的运行模式。选择与您的输入数据类型对应的选项卡,查看如何创建任务并运行推理。

### 图像 (Image)

```
val baseOptionsBuilder = BaseOptions.builder().setModelAssetPath(modelName)
val baseOptions = baseOptionBuilder.build()

val optionsBuilder =
    FaceDetector.FaceDetectorOptions.builder()
        .setBaseOptions(baseOptionsBuilder.build())
        .setMinDetectionConfidence(threshold)
        .setRunningMode(RunningMode.IMAGE)

val options = optionsBuilder.build()

FaceDetector =
    FaceDetector.createFromOptions(context, options)
```

### 视频 (Video)

```
val baseOptionsBuilder = BaseOptions.builder().setModelAssetPath(modelName)
val baseOptions = baseOptionBuilder.build()

val optionsBuilder =
    FaceDetector.FaceDetectorOptions.builder()
        .setBaseOptions(baseOptionsBuilder.build())
        .setMinDetectionConfidence(threshold)
        .setRunningMode(RunningMode.VIDEO)

val options = optionsBuilder.build()

FaceDetector =
    FaceDetector.createFromOptions(context, options)
```

### 实时流 (Live stream)

```
val baseOptionsBuilder = BaseOptions.builder().setModelAssetPath(modelName)
val baseOptions = baseOptionBuilder.build()

val optionsBuilder =
    FaceDetector.FaceDetectorOptions.builder()
        .setBaseOptions(baseOptionsBuilder.build())
        .setMinDetectionConfidence(threshold)
        .setResultListener(this::returnLivestreamResult)
        .setErrorListener(this::returnLivestreamError)
        .setRunningMode(RunningMode.LIVE_STREAM)

val options = optionsBuilder.build()

FaceDetector =
    FaceDetector.createFromOptions(context, options)
```

> **注意:** 如果使用实时流模式,您需要在创建任务时注册一个结果监听器。任务在处理完一帧视频后,会以检测结果和输入图像作为参数调用该监听器。

> **注意:** 如果使用视频模式或实时流模式,人脸检测器会使用追踪来避免每一帧都触发手掌检测模型,这有助于降低延迟。

人脸检测器示例代码的实现允许用户在处理模式之间切换。这种方法会使任务创建代码更加复杂,可能不适用于您的用例。您可以在 [`FaceDetectorHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/face_detector/android/app/src/main/java/com/google/mediapipe/examples/facedetection/FaceDetectorHelper.kt) 文件的 `setupFaceDetector()` 函数中看到此代码。

### 配置选项 (Configuration options)

此任务对 Android 应用有以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `runningMode` | 设置任务的运行模式。共有三种模式:<br><br>IMAGE:用于单张图像输入的模式。<br><br>VIDEO:用于视频已解码帧的模式。<br><br>LIVE_STREAM:用于输入数据实时流(例如来自摄像头)的模式。在此模式下,必须调用 resultListener 来设置监听器以异步接收结果。 | `{IMAGE, VIDEO, LIVE_STREAM}` | `IMAGE` |
| `minDetectionConfidence` | 人脸检测被认为成功所需的最低置信度分数。 | `Float [0,1]` | `0.5` |
| `minSuppressionThreshold` | 人脸检测被认为重叠所需的最低非极大值抑制阈值。 | `Float [0,1]` | `0.3` |
| `resultListener` | 设置结果监听器,在人脸检测器处于实时流模式时异步接收检测结果。仅在运行模式设置为 `LIVE_STREAM` 时才能使用。 | `N/A` | `未设置` |
| `errorListener` | 设置可选的错误监听器。 | `N/A` | `未设置` |

## 准备数据 (Prepare data)

人脸检测器适用于图像、视频文件和实时视频流。任务会处理数据输入的预处理,包括缩放、旋转和值归一化。

以下代码演示了如何移交数据进行处理。这些示例包括如何处理来自图像、视频文件和实时视频流的数据。

### 图像 (Image)

```
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage

// Convert the input Bitmap object to an MPImage object to run inference
val mpImage = BitmapImageBuilder(image).build()
```

### 视频 (Video)

```
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage

val argb8888Frame =
    if (frame.config == Bitmap.Config.ARGB_8888) frame
    else frame.copy(Bitmap.Config.ARGB_8888, false)

// Convert the input Bitmap object to an MPImage object to run inference
val mpImage = BitmapImageBuilder(argb8888Frame).build()
```

### 实时流 (Live stream)

```
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage

// Convert the input Bitmap object to an MPImage object to run inference
val mpImage = BitmapImageBuilder(rotatedBitmap).build()
```

在人脸检测器示例代码中,数据准备由 [`FaceDetectorHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/face_detector/android/app/src/main/java/com/google/mediapipe/examples/facedetection/FaceDetectorHelper.kt) 文件处理。

## 运行任务 (Run the task)

根据您处理的数据类型,使用 `faceDetector.detect...()` 方法中与该数据类型对应的方法。对单张图像使用 `detect()`,对视频文件中的帧使用 `detectForVideo()`,对视频流使用 `detectAsync()`。在视频流上执行检测时,请务必在单独的线程上运行检测,以避免阻塞用户界面线程。

以下代码示例展示了如何在不同的数据模式下运行人脸检测器:

### 图像 (Image)

```
val result = faceDetector.detect(mpImage)
```

### 视频 (Video)

```
val timestampMs = i * inferenceIntervalMs

faceDetector.detectForVideo(mpImage, timestampMs)
    .let { detectionResult ->
        resultList.add(detectionResult)
    }
```

### 实时流 (Live stream)

```
val mpImage = BitmapImageBuilder(rotatedBitmap).build()
val frameTime = SystemClock.uptimeMillis()

faceDetector.detectAsync(mpImage, frameTime)
```

请注意以下事项:

-   在视频模式或实时流模式下运行时,您必须向人脸检测器任务提供输入帧的时间戳。
-   在图像或视频模式下运行时,人脸检测器任务会阻塞当前线程,直到处理完输入的图像或帧。为避免阻塞用户界面,请在后台线程中执行处理。
-   在实时流模式下运行时,人脸检测器任务会立即返回,不会阻塞当前线程。它会在每次处理完输入帧后,以检测结果调用结果监听器。如果在该任务正在忙于处理另一帧时调用检测函数,任务将忽略新的输入帧。

在人脸检测器示例代码中,`detect`、`detectForVideo` 和 `detectAsync` 函数在 [`FaceDetectorHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/face_detector/android/app/src/main/java/com/google/mediapipe/examples/facedetection/FaceDetectorHelper.kt) 文件中定义。

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

人脸检测器示例代码演示了如何显示任务返回的结果,更多详情请参阅 [`OverlayView`](https://github.com/googlesamples/mediapipe/blob/main/examples/face_detector/android/app/src/main/java/com/google/mediapipe/examples/facedetection/OverlayView.kt) 类。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*