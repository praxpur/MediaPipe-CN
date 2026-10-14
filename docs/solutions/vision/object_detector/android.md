---
title: "物体检测 (Object Detector) - Android"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/object_detector/android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2024-04-03 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 物体检测 (Object Detector) - Android

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/object_detector/android)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

物体检测 (Object Detector) 任务允许您检测多种类别物体的存在和位置。例如，物体检测可以定位图像中的狗。这些说明向您展示了如何在 Android 上使用物体检测任务。这些说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/object_detection/android) 上找到。您可以通过查看此 [Web 演示](https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/object_detector) 来看看此任务的实际效果。有关此任务的功能、模型和配置选项的更多信息，请参阅[概述](../object_detector.md)。

## 代码示例 (Code example)

MediaPipe Tasks 示例代码是适用于 Android 的物体检测应用程序的简单实现。该示例使用物理 Android 设备上的摄像头持续检测物体，也可以使用设备图库中的图像和视频进行静态物体检测。

您可以将此应用作为您自己 Android 应用的起点，或者在修改现有应用时参考它。物体检测示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/object_detection/android) 上。

### 下载代码 (Download the code)

以下说明向您展示如何使用 [git](https://git-scm.com/) 命令行工具创建示例代码的本地副本。

下载示例代码的步骤：

1. 使用以下命令克隆 git 仓库：

   ```
   git clone https://github.com/google-ai-edge/mediapipe-samples
   ```
2. 此外，您可以配置您的 git 实例使用稀疏检出 (sparse checkout)，这样您就只有物体检测示例应用的文件：

   ```
   cd mediapipe-samples
   git sparse-checkout init --cone
   git sparse-checkout set examples/object_detection/android
   ```

创建示例代码的本地版本后，您可以将项目导入 Android Studio 并运行该应用。有关说明，请参阅 [Android 环境配置指南](../../setup_android.md#example_code)。

### 关键组件 (Key components)

以下文件包含物体检测示例应用的关键代码：

* [ObjectDetectorHelper.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/object_detection/android/app/src/main/java/com/google/mediapipe/examples/objectdetection/ObjectDetectorHelper.kt) - 初始化物体检测并处理模型和委托的选择。
* [MainActivity.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/object_detection/android/app/src/main/java/com/google/mediapipe/examples/objectdetection/MainActivity.kt) - 实现应用程序并组装用户界面组件。
* [OverlayView.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/object_detection/android/app/src/main/java/com/google/mediapipe/examples/objectdetection/OverlayView.kt) - 处理并显示结果。

## 设置 (Setup)

本节介绍设置开发环境和代码项目以使用物体检测的关键步骤。有关设置使用 MediaPipe 任务的开发环境的一般信息，包括平台版本要求，请参阅 [Android 环境配置指南](../../setup_android.md)。

### 依赖项 (Dependencies)

物体检测使用 `com.google.mediapipe:tasks-vision` 库。将此依赖项添加到 Android 应用开发项目的 `build.gradle` 文件中。使用以下代码导入所需的依赖项：

```
dependencies {
    implementation 'com.google.mediapipe:tasks-vision:latest.release'
}
```

### 模型 (Model)

MediaPipe 物体检测任务需要一个与此任务兼容的训练好的模型。有关物体检测可用预训练模型的更多信息，请参阅任务概述的[模型](../object_detector.md#models)部分。

选择并下载模型，然后将其存储在您的项目目录中：

```
<dev-project-root>/src/main/assets
```

> **注意：** 建议使用此位置，因为 Android 构建系统会自动检查该目录以查找文件资源。

使用 `BaseOptions.Builder.setModelAssetPath()` 方法指定模型所使用的路径。有关代码示例，请参阅下一节。

## 创建任务 (Create the task)

您可以使用 `createFromOptions` 函数创建任务。`createFromOptions` 函数接受配置选项，包括运行模式、显示名称的语言区域、最大结果数量、置信度阈值、类别白名单和黑名单。如果未指定配置选项，将使用默认值。有关配置选项的更多信息，请参阅[配置选项概述](#configuration_options)。

物体检测任务支持 3 种输入数据类型：静态图像、视频文件和实时视频流。创建任务时，必须指定与您的输入数据类型对应的运行模式。选择与您的输入数据类型对应的选项卡以查看如何创建任务和运行推理。

### 图像 (Image)

```
ObjectDetectorOptions options =
  ObjectDetectorOptions.builder()
    .setBaseOptions(BaseOptions.builder().setModelAssetPath(‘model.tflite’).build())
    .setRunningMode(RunningMode.IMAGE)
    .setMaxResults(5)
    .build();
objectDetector = ObjectDetector.createFromOptions(context, options);
```

### 视频 (Video)

```
ObjectDetectorOptions options =
  ObjectDetectorOptions.builder()
    .setBaseOptions(BaseOptions.builder().setModelAssetPath(‘model.tflite’).build())
    .setRunningMode(RunningMode.VIDEO)
    .setMaxResults(5)
    .build();
objectDetector = ObjectDetector.createFromOptions(context, options);
```

### 实时流 (Live stream)

```
ObjectDetectorOptions options =
  ObjectDetectorOptions.builder()
    .setBaseOptions(BaseOptions.builder().setModelAssetPath(‘model.tflite’).build())
    .setRunningMode(RunningMode.LIVE_STREAM)
    .setMaxResults(5)
    .setResultListener((result, inputImage) -> {
      // Process the detection result here.
    })
    .setErrorListener((result, inputImage) -> {
      // Process the classification errors here.
    })
   .build();
objectDetector = ObjectDetector.createFromOptions(context, options);
```

> **注意：** 如果您使用实时流模式，请确保在创建任务时注册一个结果监听器。每次任务完成处理视频帧时，都会以检测结果和输入图像作为参数来调用该监听器。

物体检测示例代码实现允许用户在处理模式之间切换。这种方法使任务创建代码更加复杂，可能不适合您的用例。您可以在 [`ObjectDetectorHelper`](https://github.com/googlesamples/mediapipe/blob/main/examples/object_detection/android/app/src/main/java/com/google/mediapipe/examples/objectdetection/ObjectDetectorHelper.kt#L63-L136) 类的 `setupObjectDetector()` 函数中查看此代码。

### 配置选项 (Configuration options)

此任务具有针对 Android 应用的以下配置选项：

| 选项名称 | 描述 | 值范围 | 默认值 |
| --- | --- | --- | --- |
| `runningMode` | 设置任务的运行模式。有三种模式：<br> `IMAGE`：单张图像输入的模式。<br> `VIDEO`：视频解码帧的模式。<br> `LIVE_STREAM`：输入数据（例如来自相机）的实时流模式。在此模式下，必须调用 `resultListener` 来设置异步接收结果的监听器。 | {`IMAGE`, `VIDEO`, `LIVE_STREAM`} | `IMAGE` |
| `displayNamesLocales` | 设置模型元数据中提供的显示名称的标签语言（如果可用）。默认为 `en`（英语）。您可以使用 [TensorFlow Lite Metadata Writer API](https://ai.google.dev/edge/lite/models/metadata_writer_tutorial) 向自定义模型的元数据中添加本地化标签。 | 区域代码 | `en` |
| `maxResults` | 设置要返回的可选最高得分检测结果的最大数量。 | 任意正数 | -1（返回所有结果） |
| `scoreThreshold` | 设置覆盖模型元数据中提供（如果有）的预测分数阈值。低于此值的结果将被拒绝。 | 任意浮点数 | 未设置 |
| `categoryAllowlist` | 设置允许的类别名称的可选列表。如果非空，则类别名称不在此集合中的检测结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `categoryDenylist` 互斥，同时使用两者将导致错误。 | 任意字符串 | 未设置 |
| `categoryDenylist` | 设置不允许的类别名称的可选列表。如果非空，则类别名称在此集合中的检测结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `categoryAllowlist` 互斥，同时使用两者将导致错误。 | 任意字符串 | 未设置 |
| `resultListener` | 当物体检测处于实时流模式时，设置结果监听器以异步接收检测结果。只能在 `runningMode` 设置为 `LIVE_STREAM` 时使用此选项。 | 不适用 | 未设置 |

## 准备数据 (Prepare data)

您需要将输入图像或帧转换为 `com.google.mediapipe.framework.image.MPImage` 对象，然后再将其传递给物体检测。

以下示例解释并展示了如何为每种可用数据类型准备数据以进行处理：

### 图像 (Image)

```
import com.google.mediapipe.framework.image.BitmapImageBuilder;
import com.google.mediapipe.framework.image.MPImage;

// Load an image on the user’s device as a Bitmap object using BitmapFactory.

// Convert an Android’s Bitmap object to a MediaPipe’s Image object.
Image mpImage = new BitmapImageBuilder(bitmap).build();
```

### 视频 (Video)

```
import com.google.mediapipe.framework.image.BitmapImageBuilder;
import com.google.mediapipe.framework.image.MPImage;

// Load a video file on the user's device using MediaMetadataRetriever

// From the video’s metadata, load the METADATA_KEY_DURATION and
// METADATA_KEY_VIDEO_FRAME_COUNT values. Use these values
// to calculate the timestamp of each frame later.

// Loop through the video and load each frame as a Bitmap object.

// Convert the Android’s Bitmap object to a MediaPipe’s Image object.
Image mpImage = new BitmapImageBuilder(frame).build();
```

### 实时流 (Live stream)

```
import com.google.mediapipe.framework.image.MediaImageBuilder;
import com.google.mediapipe.framework.image.MPImage;

// Create a CameraX’s ImageAnalysis to continuously receive frames
// from the device’s camera. Configure it to output frames in RGBA_8888
// format to match with what is required by the model.

// For each Android’s ImageProxy object received from the ImageAnalysis,
// extract the encapsulated Android’s Image object and convert it to
// a MediaPipe’s Image object.
android.media.Image mediaImage = imageProxy.getImage()
MPImage mpImage = new MediaImageBuilder(mediaImage).build();
```

在物体检测示例代码中，数据准备在 [`ObjectDetectorHelper`](https://github.com/googlesamples/mediapipe/blob/main/examples/object_detection/android/app/src/main/java/com/google/mediapipe/examples/objectdetection/ObjectDetectorHelper.kt) 类的 `detectImage()`、`detectVideoFile()` 和 `detectLivestreamFrame()` 函数中处理。

> **注意：** 对于实时视频流，请确保追踪提供视频流的相机的[视场旋转 (viewed rotation)](https://github.com/googlesamples/mediapipe/blob/main/examples/object_detection/android/app/src/main/java/com/google/mediapipe/examples/objectdetection/ObjectDetectorHelper.kt#L261-L273)，并在生成输出可视化时考虑到该旋转，使其与查看到的流匹配。

## 运行任务 (Run the task)

根据您正在处理的数据类型，使用特定于该数据类型的 `ObjectDetector.detect...()` 方法。对单张图像使用 `detect()`，对视频文件中的帧使用 `detectForVideo()`，对视频流使用 `detectAsync()`。当您在视频流上执行检测时，请确保在单独的线程上运行检测以避免阻塞用户界面线程。

以下代码示例展示了如何在这些不同数据模式下运行物体检测的简单示例：

### 图像 (Image)

```
ObjectDetectorResult detectionResult = objectDetector.detect(image);
```

### 视频 (Video)

```
// Calculate the timestamp in milliseconds of the current frame.
long frame_timestamp_ms = 1000 * video_duration * frame_index / frame_count;

// Run inference on the frame.
ObjectDetectorResult detectionResult =
    objectDetector.detectForVideo(image, frameTimestampMs);
```

### 实时流 (Live stream)

```
// Run inference on the frame. The detection results will be available
// via the `resultListener` provided in the `ObjectDetectorOptions` when
// the object detector was created.
objectDetector.detectAsync(image, frameTimestampMs);
```

物体检测代码示例更详细地展示了每种模式的实现：[`detect()`](https://github.com/googlesamples/mediapipe/blob/main/examples/object_detection/android/app/src/main/java/com/google/mediapipe/examples/objectdetection/ObjectDetectorHelper.kt#L335)、[`detectVideoFile()`](https://github.com/googlesamples/mediapipe/blob/main/examples/object_detection/android/app/src/main/java/com/google/mediapipe/examples/objectdetection/ObjectDetectorHelper.kt#L205) 和 [`detectAsync()`](https://github.com/googlesamples/mediapipe/blob/main/examples/object_detection/android/app/src/main/java/com/google/mediapipe/examples/objectdetection/ObjectDetectorHelper.kt#L286)。示例代码允许用户在可能并非您的用例所需的处理模式之间进行切换。

请注意以下事项：

* 在视频模式或实时流模式下运行时，您还必须为物体检测任务提供输入帧的时间戳。
* 在图像或视频模式下运行时，物体检测任务会阻塞当前线程，直到完成输入图像或帧的处理。为了避免阻塞当前线程，请在后台线程中执行处理。
* 在实时流模式下运行时，物体检测任务不会阻塞当前线程，而是立即返回。每次完成对输入帧的处理时，它都会使用检测结果调用其结果监听器。如果在物体检测任务忙于处理另一个帧时调用 `detect` 函数，则新的输入帧将被忽略。

## 处理和显示结果 (Handle and display results)

在运行推理后，物体检测任务会返回一个 `ObjectDetectorResult` 对象，它描述了在输入图像中找到的物体。

以下显示了此任务输出数据的示例：

```
ObjectDetectorResult:
 Detection #0:
  Box: (x: 355, y: 133, w: 190, h: 206)
  Categories:
   index       : 17
   score       : 0.73828
   class name  : dog
 Detection #1:
  Box: (x: 103, y: 15, w: 138, h: 369)
  Categories:
   index       : 17
   score       : 0.73047
   class name  : dog
```

以下图像显示了任务输出的可视化：

![Two dogs that are highlighted with bounding boxes](../../../../assets/misc/object-detection-output.png)

物体检测示例代码演示了如何显示任务返回的检测结果，有关更多详细信息，请参阅 [`OverlayView`](https://github.com/googlesamples/mediapipe/blob/main/examples/object_detection/android/app/src/main/java/com/google/mediapipe/examples/objectdetection/OverlayView.kt) 类。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*