---
title: "Android 图像分类指南 (Image classification guide for Android)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/image_classifier/android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Android 图像分类指南 (Image classification guide for Android)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/image_classifier/android)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Image Classifier(图像分类器)任务可让您对图像进行分类。您可以使用此任务识别图像在训练时定义的一组类别中所代表的含义。以下说明向您展示如何在 Android 应用中使用 Image Classifier。本说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_classification/android) 上获取。

您可以通过查看 [Web 演示](https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_classifier)来了解此任务的实际效果。有关此任务的功能、模型和配置选项的更多信息,请参阅[概览](../image_classifier.md)。

## 代码示例

MediaPipe Tasks 示例代码是一个适用于 Android 的 Image Classifier 应用的简单实现。该示例使用实体 Android 设备上的摄像头对物体进行持续分类,也可以使用设备图库中的图像和视频对物体进行静态分类。

您可以将该应用作为自己 Android 应用的起点,或在修改现有应用时参考它。Image Classifier 示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_classification/android) 上。

### 下载代码

以下说明向您展示如何使用 [git](https://git-scm.com/) 命令行工具创建示例代码的本地副本。

要下载示例代码:

1.  使用以下命令克隆 git 仓库:

    ```
    git clone https://github.com/google-ai-edge/mediapipe-samples
    ```

2.  (可选)配置 git 实例使用稀疏检出 (sparse checkout),以便只保留 Image Classifier 示例应用所需的文件:

    ```
    cd mediapipe-samples
    git sparse-checkout init --cone
    git sparse-checkout set examples/image_classification/android
    ```

创建示例代码的本地版本后,您可以将项目导入 Android Studio 并运行该应用。有关说明,请参阅 [Android 环境配置指南](../../setup_android.md#example_code)。

### 关键组件

以下文件包含此图像分类示例应用的关键代码:

-   [ImageClassifierHelper.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/image_classification/android/app/src/main/java/com/google/mediapipe/examples/imageclassification/ImageClassifierHelper.kt) — 初始化图像分类器,并处理模型与委托 (delegate) 的选择。
-   [MainActivity.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/image_classification/android/app/src/main/java/com/google/mediapipe/examples/imageclassification/MainActivity.kt) — 实现应用,包括调用 `ImageClassificationHelper` 和 `ClassificationResultsAdapter`。
-   [ClassificationResultsAdapter.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/image_classification/android/app/src/main/java/com/google/mediapipe/examples/imageclassification/fragments/ClassificationResultsAdapter.kt) — 处理和格式化结果。

## 环境配置

本节介绍为使用 Image Classifier 而设置开发环境和代码项目的关键步骤。有关设置开发环境以使用 MediaPipe 任务的一般信息(包括平台版本要求),请参阅 [Android 环境配置指南](../../setup_android.md)。

### 依赖

Image Classifier 使用 `com.google.mediapipe:tasks-vision` 库。将此依赖添加到 Android 应用开发项目的 `build.gradle` 文件中。使用以下代码导入所需依赖:

```
dependencies {
    ...
    implementation 'com.google.mediapipe:tasks-vision:latest.release'
}
```

### 模型

MediaPipe Image Classifier 任务需要一个与此任务兼容的已训练模型。有关 Image Classifier 可用已训练模型的更多信息,请参阅任务概览中的[模型部分](../image_classifier.md#models)。

选择并下载模型,然后将其存放在项目目录中:

```
<dev-project-root>/src/main/assets
```

> **注意:** 建议使用此位置,因为 Android 构建系统会自动检查此目录中的文件资源。

使用 `BaseOptions.Builder.setModelAssetPath()` 方法来指定模型使用的路径。下一节中的代码示例会用到此方法。

在 Image Classifier [示例代码](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_classification/android)中,模型定义在 [`ImageClassifierHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/image_classification/android/app/src/main/java/com/google/mediapipe/examples/imageclassification/ImageClassifierHelper.kt#L88-L95) 文件中。

## 创建任务

您可以使用 `createFromOptions` 函数创建任务。`createFromOptions` 函数接受配置选项,包括运行模式、显示名称的语言区域 (locale)、最大结果数、置信度阈值以及类别允许列表或拒绝列表。有关配置选项的更多信息,请参阅[配置概览](#configuration)。

Image Classifier 任务支持 3 种输入数据类型:静态图像、视频文件和实时视频流。您需要在创建任务时指定与输入数据类型对应的运行模式。选择与您的输入数据类型对应的标签页,以了解如何创建任务并运行推理。

### 图像

```
ImageClassifierOptions options =
  ImageClassifierOptions.builder()
    .setBaseOptions(
      BaseOptions.builder().setModelAssetPath("model.tflite").build())
    .setRunningMode(RunningMode.IMAGE)
    .setMaxResults(5)
    .build();
imageClassifier = ImageClassifier.createFromOptions(context, options);
```

### 视频

```
ImageClassifierOptions options =
  ImageClassifierOptions.builder()
    .setBaseOptions(
      BaseOptions.builder().setModelAssetPath("model.tflite").build())
    .setRunningMode(RunningMode.VIDEO)
    .setMaxResults(5)
    .build();
imageClassifier = ImageClassifier.createFromOptions(context, options);
```

### 实时流

```
ImageClassifierOptions options =
  ImageClassifierOptions.builder()
    .setBaseOptions(
      BaseOptions.builder().setModelAssetPath("model.tflite").build())
    .setRunningMode(RunningMode.LIVE_STREAM)
    .setMaxResults(5)
    .setResultListener((result, inputImage) -> {
         // Process the classification result here.
    })
    .setErrorListener((result, inputImage) -> {
         // Process the classification errors here.
    })
    .build()
imageClassifier = ImageClassifier.createFromOptions(context, options)
```

> **注意:** 如果使用实时流模式,请务必在创建任务时注册结果监听器。每当任务处理完一帧视频时,都会以分类结果和输入图像作为参数调用该监听器。

Image Classifier 示例代码实现允许用户在处理模式之间切换。这种方法使任务创建代码更加复杂,可能不适合您的用例。您可以在 [`ImageClassifierHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/image_classification/android/app/src/main/java/com/google/mediapipe/examples/imageclassification/ImageClassifierHelper.kt#L112-L125) 文件的 `setupImageClassifier()` 函数中查看此代码。

### 配置选项

此任务对 Android 应用有以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `runningMode` | 设置任务的运行模式。共有三种模式:<br><br>IMAGE:用于单张图像输入的模式。<br><br>VIDEO:用于视频已解码帧的模式。<br><br>LIVE_STREAM:用于输入数据实时流(如来自摄像头)的模式。在此模式下,必须调用 resultListener 来设置监听器,以异步接收结果。 | {`IMAGE, VIDEO, LIVE_STREAM`} | `IMAGE` |
| `displayNamesLocale` | 设置任务模型元数据中提供的显示名称所使用的标签语言(如果可用)。默认值为 `en`(英语)。您可以使用 [TensorFlow Lite Metadata Writer API](https://ai.google.dev/edge/lite/models/metadata_writer_tutorial) 将本地化标签添加到自定义模型的元数据中。 | 区域代码 (Locale code) | `en` |
| `maxResults` | 设置可选的、要返回的最高分分类结果的最大数量。如果 < 0,将返回所有可用结果。 | 任意正数 | `-1` |
| `scoreThreshold` | 设置预测分数阈值,该阈值会覆盖模型元数据中提供的阈值(如果有)。低于此值的结果将被拒绝。 | 任意浮点数 (Any float) | 未设置 |
| `categoryAllowlist` | 设置可选的允许类别名称列表。如果非空,则类别名称不在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `categoryDenylist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |
| `categoryDenylist` | 设置不允许的类别名称的可选列表。如果非空,则类别名称在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `categoryAllowlist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |
| `resultListener` | 设置结果监听器,以便在 Image Classifier 处于实时流模式时异步接收分类结果。只能在运行模式设置为 `LIVE_STREAM` 时使用。 | N/A | 未设置 |
| `errorListener` | 设置可选的错误监听器。 | N/A | 未设置 |

## 准备数据

Image Classifier 适用于图像、视频文件和实时视频流。该任务会处理数据输入的预处理,包括调整大小、旋转和值归一化。

您需要先将输入图像或帧转换为 `com.google.mediapipe.framework.image.MPImage` 对象,然后才能将其传递给 Image Classifier。

### 图像

```
import com.google.mediapipe.framework.image.BitmapImageBuilder;
import com.google.mediapipe.framework.image.MPImage;

// Load an image on the user’s device as a Bitmap object using BitmapFactory.

// Convert an Android’s Bitmap object to a MediaPipe’s Image object.
Image mpImage = new BitmapImageBuilder(bitmap).build();
```

### 视频

```
import com.google.mediapipe.framework.image.BitmapImageBuilder;
import com.google.mediapipe.framework.image.MPImage;

// Load a video file on the user's device using MediaMetadataRetriever

// From the video’s metadata, load the METADATA_KEY_DURATION and
// METADATA_KEY_VIDEO_FRAME_COUNT value. You’ll need them
// to calculate the timestamp of each frame later.

// Loop through the video and load each frame as a Bitmap object.

// Convert the Android’s Bitmap object to a MediaPipe’s Image object.
Image mpImage = new BitmapImageBuilder(frame).build();
```

### 实时流

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
Image mpImage = new MediaImageBuilder(mediaImage).build();
```

在 Image Classifier 示例代码中,数据准备在 [`ImageClassifierHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/image_classification/android/app/src/main/java/com/google/mediapipe/examples/imageclassification/ImageClassifierHelper.kt#L154-L184) 文件中处理。

## 运行任务

您可以调用与运行模式对应的 `classify` 函数来触发推理。Image Classifier API 会返回输入图像或帧中物体的可能类别。

### 图像

```
ImageClassifierResult classifierResult = imageClassifier.classify(image);
```

### 视频

```
// Calculate the timestamp in milliseconds of the current frame.
long frame_timestamp_ms = 1000 * video_duration * frame_index / frame_count;

// Run inference on the frame.
ImageClassifierResult classifierResult =
    imageClassifier.classifyForVideo(image, frameTimestampMs);
```

### 实时流

```
// Run inference on the frame. The classifications results will be available 
// via the `resultListener` provided in the `ImageClassifierOptions` when 
// the image classifier was created.
imageClassifier.classifyAsync(image, frameTimestampMs);
```

请注意以下事项:

-   在视频模式或实时流模式下运行时,您必须向 Image Classifier 任务提供输入帧的时间戳。
-   在图像模式或视频模式下运行时,Image Classifier 任务会阻塞当前线程,直到处理完输入图像或帧。为避免阻塞用户界面,请在后台线程中执行处理。
-   在实时流模式下运行时,Image Classifier 任务不会阻塞当前线程,而是立即返回。每次处理完输入帧后,它都会以检测结果调用其结果监听器。如果在 Image Classifier 任务正忙于处理另一帧时调用 `classifyAsync` 函数,任务会忽略新的输入帧。

在 Image Classifier 示例代码中,`classify` 函数定义在 [`ImageClassifierHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/image_classification/android/app/src/main/java/com/google/mediapipe/examples/imageclassification/ImageClassifierHelper.kt) 文件中。

## 处理并显示结果

运行推理后,Image Classifier 任务会返回一个 `ImageClassifierResult` 对象,其中包含输入图像或帧中物体可能类别的列表。

以下是此任务输出数据的示例:

```
ImageClassifierResult:
 Classifications #0 (single classification head):
  head index: 0
  category #0:
   category name: "/m/01bwb9"
   display name: "Passer domesticus"
   score: 0.91406
   index: 671
  category #1:
   category name: "/m/01bwbt"
   display name: "Passer montanus"
   score: 0.00391
   index: 670
```

此结果是通过在以下图像上运行[鸟类分类器](https://www.kaggle.com/models/google/aiy/tfLite/vision-classifier-birds-v1/3)获得的:

![家麻雀的特写照片](../../../../assets/edge/mediapipe/images/solutions/image-classifier.jpg)

在 Image Classifier 示例代码中,[`ClassificationResultsAdapter.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/image_classification/android/app/src/main/java/com/google/mediapipe/examples/imageclassification/fragments/ClassificationResultsAdapter.kt#L35-L45) 文件中的 `ClassificationResultsAdapter` 类负责处理结果:

```
fun updateResults(imageClassifierResult: ImageClassifierResult? = null) {
    categories = MutableList(adapterSize) { null }
    if (imageClassifierResult != null) {
        val sortedCategories = imageClassifierResult.classificationResult()
            .classifications()[0].categories().sortedBy { it.index() }
        val min = kotlin.math.min(sortedCategories.size, categories.size)
        for (i in 0 until min) {
            categories[i] = sortedCategories[i]
        }
    }
}
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*