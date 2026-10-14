---
title: "Android 版图像嵌入指南 (Image embedding guide for Android)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/image_embedder/android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Android 版图像嵌入指南 (Image embedding guide for Android)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/image_embedder/android)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Image Embedder(图像嵌入器)任务可让您将图像数据转换为数值表示,以完成与 ML 相关的图像处理任务,例如比较两张图像的相似度。这些说明介绍如何在 Android 应用中搭配使用 Image Embedder。

有关此任务的功能、模型和配置选项的更多信息,请参阅[概览](../image_embedder.md)。

## 代码示例

MediaPipe Tasks 示例代码是一个适用于 Android 的 Image Embedder 应用的简单实现。该示例使用实体 Android 设备上的摄像头持续对图像进行嵌入,也可以对存储在设备上的图像文件运行嵌入器。

您可以将该应用作为自己 Android 应用的起点,或在修改现有应用时参考它。Image Embedder 示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_embedder/android) 上。

### 下载代码

以下说明向您展示如何使用 [git](https://git-scm.com/) 命令行工具创建示例代码的本地副本。

要下载示例代码:

1.  使用以下命令克隆 git 仓库:

    ```
    git clone https://github.com/google-ai-edge/mediapipe-samples
    ```

2.  (可选)配置 git 实例使用稀疏检出 (sparse checkout),以便只保留 Image Embedder 示例应用所需的文件:

    ```
    cd mediapipe-samples
    git sparse-checkout init --cone
    git sparse-checkout set examples/image_embedder/android
    ```

创建示例代码的本地版本后,您可以将项目导入 Android Studio 并运行应用。有关说明,请参阅 [Android 环境配置指南](../../setup_android.md#example_code)。

### 关键组件

以下文件包含此图像嵌入示例应用的关键代码:

-   [ImageEmbedderHelper.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/image_embedder/android/app/src/main/java/com/google/mediapipe/examples/imageembedder/ImageEmbedderHelper.kt):初始化图像嵌入器,并处理模型与委托 (delegate) 的选择。
-   [MainActivity.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/image_embedder/android/app/src/main/java/com/google/mediapipe/examples/imageembedder/MainActivity.kt):实现应用并组装用户界面组件。

## 环境配置

本节介绍为使用 Image Embedder 而设置开发环境和代码项目的关键步骤。有关设置开发环境以使用 MediaPipe 任务的一般信息(包括平台版本要求),请参阅 [Android 环境配置指南](../../setup_android.md)。

### 依赖

Image Embedder 使用 `com.google.mediapipe:tasks-vision` 库。将此依赖添加到 Android 应用开发项目的 `build.gradle` 文件中。使用以下代码导入所需依赖:

```
dependencies {
    ...
    implementation 'com.google.mediapipe:tasks-vision:latest.release'
}
```

### 模型

MediaPipe Image Embedder 任务需要一个与此任务兼容的已训练模型。有关 Image Embedder 可用已训练模型的更多信息,请参阅任务概览中的[模型部分](../image_embedder.md#models)。

选择并下载模型,然后将其存放在项目目录中:

```
<dev-project-root>/src/main/assets
```

> **注意:** 推荐使用此位置,因为 Android 构建系统会自动检查此目录中的文件资源。

在 `ModelAssetPath` 参数中指定模型的路径。在示例代码中,模型定义在 [ImageEmbedderHelper.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/image_embedder/android/app/src/main/java/com/google/mediapipe/examples/imageembedder/ImageEmbedderHelper.kt) 文件的 `setupImageEmbedder()` 函数中:

使用 `BaseOptions.Builder.setModelAssetPath()` 方法指定模型使用的路径。下一节的代码示例中引用了此方法。

## 创建任务

您可以使用 `createFromOptions` 函数创建任务。`createFromOptions` 函数接受配置选项来设置嵌入器选项。有关配置选项的更多信息,请参阅[配置概览](#configuration)。

Image Embedder 任务支持 3 种输入数据类型:静态图像、视频文件和实时视频流。您需要在创建任务时指定与输入数据类型对应的运行模式。选择与您的输入数据类型对应的标签页,以了解如何创建任务并运行推理。

### 图像

```
ImageEmbedderOptions options =
  ImageEmbedderOptions.builder()
    .setBaseOptions(
      BaseOptions.builder().setModelAssetPath("model.tflite").build())
    .setQuantize(true)
    .setRunningMode(RunningMode.IMAGE)
    .build();
imageEmbedder = ImageEmbedder.createFromOptions(context, options);
```

### 视频

```
ImageEmbedderOptions options =
  ImageEmbedderOptions.builder()
    .setBaseOptions(
      BaseOptions.builder().setModelAssetPath("model.tflite").build())
    .setQuantize(true)
    .setRunningMode(RunningMode.VIDEO)
    .build();
imageEmbedder = ImageEmbedder.createFromOptions(context, options);
```

### 实时流

```
ImageEmbedderOptions options =
  ImageEmbedderOptions.builder()
    .setBaseOptions(
      BaseOptions.builder().setModelAssetPath("model.tflite").build())
    .setQuantize(true)
    .setRunningMode(RunningMode.LIVE_STREAM)
    .setResultListener((result, inputImage) -> {
         // 在此处处理嵌入结果。
    })
    .build();
imageEmbedder = ImageEmbedder.createFromOptions(context, options);
```

> **注意:** 如果您使用实时流模式,则在创建任务时需要注册结果监听器 (result listener)。每当任务处理完一帧视频后,都会以嵌入结果和输入图像作为参数调用该监听器。

示例代码的实现允许用户在处理模式之间切换。这种方法使任务创建代码更复杂,可能不适合您的使用场景。您可以在 [ImageEmbedderHelper.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/image_embedder/android/app/src/main/java/com/google/mediapipe/examples/imageembedder/ImageEmbedderHelper.kt#L41) 文件的 `setupImageEmbedder()` 函数中查看此代码。

### 配置选项

此任务对 Android 应用有以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `runningMode` | 设置任务的运行模式。共有三种模式:<br><br>IMAGE:用于单张图像输入的模式。<br><br>VIDEO:用于视频已解码帧的模式。<br><br>LIVE_STREAM:用于输入数据实时流(如来自摄像头)的模式。在此模式下,必须调用 resultListener 来设置监听器,以异步接收结果。 | {`IMAGE, VIDEO, LIVE_STREAM`} | `IMAGE` |
| `l2_normalize` | 是否使用 L2 范数对返回的特征向量进行归一化。仅当模型尚不包含原生的 L2_NORMALIZATION TFLite Op 时才使用此选项。大多数情况下模型已包含该 Op,因此 L2 归一化已通过 TFLite 推理实现,无需此选项。 | `Boolean` | `False` |
| `quantize` | 返回的嵌入是否应通过标量量化量化为字节。嵌入被隐式假定为单位范数,因此任何维度都保证值在 \[-1.0, 1.0\] 范围内。如果并非如此,请使用 l2_normalize 选项。 | `Boolean` | `False` |
| `resultListener` | 设置结果监听器,以便在 Image Embedder 处于实时流模式时异步接收嵌入结果。只能在运行模式设置为 `LIVE_STREAM` 时使用。 | N/A | 未设置 |
| `errorListener` | 设置可选的错误监听器。 | N/A | 未设置 |

## 准备数据

Image Embedder 可以处理图像、视频文件和实时视频流。该任务会处理数据输入的预处理,包括调整大小、旋转和值归一化。

您需要先将输入图像或帧转换为 `com.google.mediapipe.framework.image.MPImage` 对象,然后再将其传递给 Image Embedder 任务。

### 图像

```
import com.google.mediapipe.framework.image.BitmapImageBuilder;
import com.google.mediapipe.framework.image.MPImage;

// 使用 BitmapFactory 将用户设备上的图像加载为 Bitmap 对象。

// 将 Android 的 Bitmap 对象转换为 MediaPipe 的 Image 对象。
Image mpImage = new BitmapImageBuilder(bitmap).build();
```

### 视频

```
import com.google.mediapipe.framework.image.BitmapImageBuilder;
import com.google.mediapipe.framework.image.MPImage;

// 使用 MediaMetadataRetriever 加载用户设备上的视频文件。

// 从视频元数据中加载 METADATA_KEY_DURATION 和
// METADATA_KEY_VIDEO_FRAME_COUNT 值。稍后您将需要它们
// 来计算每一帧的时间戳。

// 循环遍历视频,并将每一帧加载为 Bitmap 对象。

// 将 Android 的 Bitmap 对象转换为 MediaPipe 的 Image 对象。
Image mpImage = new BitmapImageBuilder(frame).build();
```

### 实时流

```
import com.google.mediapipe.framework.image.MediaImageBuilder;
import com.google.mediapipe.framework.image.MPImage;

// 创建 CameraX 的 ImageAnalysis,以持续接收
// 来自设备摄像头的帧。将其配置为以 RGBA_8888
// 格式输出帧,以匹配模型的输入要求。

// 对于从 ImageAnalysis 接收到的每个 Android 的 ImageProxy 对象,
// 提取其封装的 Android 的 Image 对象,并将其转换为
// MediaPipe 的 Image 对象。
android.media.Image mediaImage = imageProxy.getImage()
Image mpImage = new MediaImageBuilder(mediaImage).build();
```

在示例代码中,数据准备由 [ImageEmbedderHelper.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/image_embedder/android/app/src/main/java/com/google/mediapipe/examples/imageembedder/ImageEmbedderHelper.kt) 文件处理。

## 运行任务

您可以根据运行模式调用 `embed` 函数来触发推理。Image Embedder API 会返回输入图像或帧的嵌入向量。

### 图像

```
ImageEmbedderResult embedderResult = imageEmbedder.embed(image);
```

### 视频

```
// 计算当前帧的时间戳(以毫秒为单位)。
long frame_timestamp_ms = 1000 * video_duration * frame_index / frame_count;

// 在帧上运行推理。
ImageEmbedderResult embedderResult =
    imageEmbedder.embedForVideo(image, frameTimestampMs);
```

### 实时流

```
// 在帧上运行推理。嵌入结果将通过
// 创建图像嵌入器时在 `ImageEmbedderOptions` 中提供的
// `resultListener` 获取。
imageEmbedder.embedAsync(image, frameTimestampMs);
```

请注意以下事项:

-   在视频模式或实时流模式下运行时,您还必须向 Image Embedder 任务提供输入帧的时间戳。
-   在图像模式或视频模式下运行时,Image Embedder 任务会阻塞当前线程,直到处理完输入图像或帧。为避免阻塞当前线程,请在后台线程中执行处理。
-   在实时流模式下运行时,Image Embedder 任务不会阻塞当前线程,而是立即返回。每当处理完一个输入帧时,它都会用检测结果调用其结果监听器。如果在 Image Embedder 任务正在处理另一个帧时调用 `embedAsync` 函数,任务会忽略新的输入帧。

在示例代码中,`embed` 函数定义在 [ImageEmbedderHelper.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/image_embedder/android/app/src/main/java/com/google/mediapipe/examples/imageembedder/ImageEmbedderHelper.kt#L90) 文件中。

## 处理并显示结果

运行推理后,Image Embedder 任务会返回一个 `ImageEmbedderResult` 对象,其中包含输入图像的嵌入列表(浮点形式或标量量化形式)。

以下展示了此任务输出数据的示例:

```
ImageEmbedderResult:
  Embedding #0 (sole embedding head):
    float_embedding: {0.0, 0.0, ..., 0.0, 1.0, 0.0, 0.0, 2.0}
    head_index: 0
```

此结果通过嵌入以下图像获得:

![一张异域猫的中景照片](../../../../assets/edge/mediapipe/images/solutions/image-embedder.jpg)

您可以使用 `ImageEmbedder.cosineSimilarity` 函数比较两个嵌入的相似度。请参见以下代码示例。

```
// 计算余弦相似度。
double similarity = ImageEmbedder.cosineSimilarity(
  result.embeddingResult().embeddings().get(0),
  otherResult.embeddingResult().embeddings().get(0));
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*