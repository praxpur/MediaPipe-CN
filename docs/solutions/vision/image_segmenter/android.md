---
title: "图像分割器 (Image Segmenter) - Android"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter/android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2024-04-03 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 图像分割器 (Image Segmenter) - Android

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter/android)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 图像分割器 (Image Segmenter) 任务允许您根据预定义的类别将图像划分为多个区域，以便应用背景模糊等视觉效果。这些说明向您展示了如何在 Android 应用中使用图像分割器。这些说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/android) 上找到。有关此任务的功能、模型和配置选项的更多信息，请参阅[概述](../image_segmenter.md)。

## 代码示例 (Code example)

MediaPipe Tasks 代码示例包含两个适用于 Android 的图像分割器应用的简单实现：

* [Image Segmenter with a category mask](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/android/category_mask)
* [Image Segmenter with a confidence mask](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/android/confidence_mask)

这些示例使用物理 Android 设备上的摄像头对实时相机视频流执行图像分割，或者您也可以从设备图库中选择图像和视频。您可以将这些应用作为您自己 Android 应用的起点，或者在修改现有应用时参考它们。图像分割器示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/android) 上。

以下部分以 [Image Segmenter with a category mask](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/android/category_mask) 应用为例。

### 下载代码 (Download the code)

以下说明向您展示如何使用 [git](https://git-scm.com/) 命令行工具创建示例代码的本地副本。

下载示例代码的步骤：

1. 使用以下命令克隆 git 仓库：

   ```
   git clone https://github.com/google-ai-edge/mediapipe-samples
   ```
2. 此外，您可以配置您的 git 实例使用稀疏检出 (sparse checkout)，这样您就只有图像分割器示例应用的文件：

   ```
   cd mediapipe-samples
   git sparse-checkout init --cone
   git sparse-checkout set examples/image_segmentation/android
   ```

创建示例代码的本地版本后，您可以将项目导入 Android Studio 并运行该应用。有关说明，请参阅 [Android 环境配置指南](../../setup_android.md#example_code)。

### 关键组件 (Key components)

以下文件包含此图像分割示例应用的关键代码：

* [ImageSegmenterHelper.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/image_segmentation/android/category_mask/app/src/main/java/com/google/mediapipe/examples/imagesegmenter/ImageSegmenterHelper.kt) - 初始化图像分割器任务并处理模型和委托的选择。
* [CameraFragment.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/image_segmentation/android/category_mask/app/src/main/java/com/google/mediapipe/examples/imagesegmenter/fragments/CameraFragment.kt) - 提供摄像头的用户界面和控制代码。
* [GalleryFragment.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/image_segmentation/android/category_mask/app/src/main/java/com/google/mediapipe/examples/imagesegmenter/fragments/GalleryFragment.kt) - 提供用于选择图像和视频文件的用户界面和控制代码。
* [OverlayView.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/image_segmentation/android/category_mask/app/src/main/java/com/google/mediapipe/examples/imagesegmenter/OverlayView.kt) - 处理并格式化分割结果。

## 设置 (Setup)

本节介绍设置开发环境和代码项目以使用图像分割器的关键步骤。有关设置使用 MediaPipe 任务的开发环境的一般信息，包括平台版本要求，请参阅 [Android 环境配置指南](../../setup_android.md)。

### 依赖项 (Dependencies)

图像分割器使用 `com.google.mediapipe:tasks-vision` 库。将此依赖项添加到 Android 应用开发项目的 `build.gradle` 文件中。使用以下代码导入所需的依赖项：

```
dependencies {
    ...
    implementation 'com.google.mediapipe:tasks-vision:latest.release'
}
```

### 模型 (Model)

MediaPipe 图像分割器任务需要一个与此任务兼容的训练好的模型。有关图像分割器可用预训练模型的更多信息，请参阅任务概述的[模型部分](../image_segmenter.md#models)。

选择并下载模型，然后将其存储在您的项目目录中：

```
<dev-project-root>/src/main/assets
```

> **注意：** 建议使用此位置，因为 Android 构建系统会自动检查该目录以查找文件资源。

使用 `BaseOptions.Builder.setModelAssetPath()` 方法指定模型所使用的路径。下一节中的代码示例提到了此方法。

在图像分割器[示例代码](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/android/category_mask)中，模型在 [`ImageSegmenterHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/image_segmentation/android/category_mask/app/src/main/java/com/google/mediapipe/examples/imagesegmenter/ImageSegmenterHelper.kt) 类的 `setupImageSegmenter()` 函数中定义。

## 创建任务 (Create the task)

您可以使用 `createFromOptions` 函数创建任务。`createFromOptions` 函数接受包括掩码输出类型在内的配置选项。有关任务配置的更多信息，请参阅[配置选项](#configuration_options)。

图像分割器任务支持以下输入数据类型：静态图像、视频文件和实时视频流。创建任务时，必须指定与您的输入数据类型对应的运行模式。选择对应输入数据类型的选项卡以查看如何创建该任务。

### 图像 (Image)

```
ImageSegmenterOptions options =
  ImageSegmenterOptions.builder()
    .setBaseOptions(
      BaseOptions.builder().setModelAssetPath("model.tflite").build())
    .setRunningMode(RunningMode.IMAGE)
    .setOutputCategoryMask(true)
    .setOutputConfidenceMasks(false)
    .build();
imagesegmenter = ImageSegmenter.createFromOptions(context, options);
```

### 视频 (Video)

```
ImageSegmenterOptions options =
  ImageSegmenterOptions.builder()
    .setBaseOptions(
      BaseOptions.builder().setModelAssetPath("model.tflite").build())
    .setRunningMode(RunningMode.VIDEO)
    .setOutputCategoryMask(true)
    .setOutputConfidenceMasks(false)
    .build();
imagesegmenter = ImageSegmenter.createFromOptions(context, options);
```

### 实时流 (Live stream)

```
ImageSegmenterOptions options =
  ImageSegmenterOptions.builder()
    .setBaseOptions(
      BaseOptions.builder().setModelAssetPath("model.tflite").build())
    .setRunningMode(RunningMode.LIVE_STREAM)
    .setOutputCategoryMask(true)
    .setOutputConfidenceMasks(false)
    .setResultListener((result, inputImage) -> {
         // Process the segmentation result here.
    })
    .setErrorListener((result, inputImage) -> {
         // Process the segmentation errors here.
    })
    .build()
imagesegmenter = ImageSegmenter.createFromOptions(context, options)
```

> **注意：** 如果您使用实时流模式，请确保在创建任务时注册一个结果监听器。每次任务完成处理视频帧时，都会以分割结果和输入图像作为参数来调用该监听器。

图像分割器示例代码实现允许用户在处理模式之间切换。这种方法使任务创建代码更加复杂，可能不适合您的用例。您可以在 [`ImageSegmenterHelper`](https://github.com/googlesamples/mediapipe/blob/main/examples/image_segmentation/android/category_mask/app/src/main/java/com/google/mediapipe/examples/imagesegmenter/ImageSegmenterHelper.kt) 类的 `setupImageSegmenter()` 函数中查看此代码。

### 配置选项 (Configuration options)

此任务具有针对 Android 应用的以下配置选项：

| 选项名称 | 描述 | 值范围 | 默认值 |
| --- | --- | --- | --- |
| `runningMode` | 设置任务的运行模式。有三种模式：<br> `IMAGE`：单张图像输入的模式。<br> `VIDEO`：视频解码帧的模式。<br> `LIVE_STREAM`：输入数据（例如来自相机）的实时流模式。在此模式下，必须调用 `resultListener` 来设置异步接收结果的监听器。 | {`IMAGE`, `VIDEO`, `LIVE_STREAM`} | `IMAGE` |
| `outputCategoryMask` | 如果设置为 `True`，则输出包含作为 uint8 图像的分割掩码，其中每个像素值指示获胜类别值。 | {`True`, `False`} | `False` |
| `outputConfidenceMasks` | 如果设置为 `True`，则输出包含作为浮点值图像的分割掩码，其中每个浮点值代表该类别的置信度得分映射。 | {`True`, `False`} | `True` |
| `displayNamesLocale` | 设置模型元数据中提供的显示名称的标签语言（如果可用）。默认为 `en`（英语）。您可以使用 [TensorFlow Lite Metadata Writer API](https://www.tensorflow.org/lite/models/convert/metadata_writer_tutorial) 向自定义模型的元数据中添加本地化标签。 | 区域代码 | `en` |
| `resultListener` | 当图像分割器处于 `LIVE_STREAM` 模式时，设置结果监听器以异步接收分割结果。只能在运行模式设置为 `LIVE_STREAM` 时使用。 | N/A | N/A |
| `errorListener` | 设置一个可选的错误监听器。 | N/A | 未设置 |

## 准备数据 (Prepare data)

图像分割器支持图像、视频文件和实时流视频。任务处理数据输入的预处理，包括调整大小、旋转和数值归一化。

您需要将输入图像或帧转换为 `com.google.mediapipe.framework.image.MPImage` 对象，然后再将其传递给图像分割器。

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
// METADATA_KEY_VIDEO_FRAME_COUNT value. You’ll need them
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
Image mpImage = new MediaImageBuilder(mediaImage).build();
```

在图像分割器示例代码中，数据准备在 [`ImageSegmenterHelper`](https://github.com/googlesamples/mediapipe/blob/main/examples/image_segmentation/android/category_mask/app/src/main/java/com/google/mediapipe/examples/imagesegmenter/ImageSegmenterHelper.kt) 类的 `segmentLiveStreamFrame()` 函数中处理。

## 运行任务 (Run the task)

您可以根据您使用的运行模式调用不同的 `segment` 函数。图像分割器函数会返回输入图像或帧中识别到的分割区域。

### 图像 (Image)

```
ImageSegmenterResult segmenterResult = imagesegmenter.segment(image);
```

### 视频 (Video)

```
// Calculate the timestamp in milliseconds of the current frame.
long frame_timestamp_ms = 1000 * video_duration * frame_index / frame_count;

// Run inference on the frame.
ImageSegmenterResult segmenterResult =
    imagesegmenter.segmentForVideo(image, frameTimestampMs);
```

### 实时流 (Live stream)

```
// Run inference on the frame. The segmentations results will be available via
// the `resultListener` provided in the `ImageSegmenterOptions` when the image
// segmenter was created.
imagesegmenter.segmentAsync(image, frameTimestampMs);
```

请注意以下事项：

* 在视频模式或实时流模式下运行时，您还必须为图像分割器任务提供输入帧的时间戳。
* 在图像或视频模式下运行时，图像分割器任务会阻塞当前线程，直到完成输入图像或帧的处理。为了避免阻塞用户界面，请在后台线程中执行处理。
* 在实时流模式下运行时，图像分割器任务不会阻塞当前线程，而是立即返回。每次完成对输入帧的处理时，它都会使用检测结果调用其结果监听器。如果在图像分割器任务忙于处理另一个帧时调用 `segmentAsync` 函数，则任务会忽略新的输入帧。

在图像分割器示例代码中，`segment` 函数在 [`ImageSegmenterHelper.kt`](https://github.com/googlesamples/mediapipe/blob/main/examples/image_segmentation/android/category_mask/app/src/main/java/com/google/mediapipe/examples/imagesegmenter/ImageSegmenterHelper.kt) 文件中定义。

## 处理和显示结果 (Handle and display results)

在运行推理后，图像分割器任务会返回一个包含分割任务结果的 `ImageSegmenterResult` 对象。输出内容取决于您在[配置](#configuration_options)任务时设置的 `outputType`。

以下部分展示了此任务输出数据的示例：

### 类别置信度 (Category confidence)

以下图像展示了类别置信度掩码的任务输出可视化结果。置信度掩码输出包含介于 `[0, 1]` 之间的浮点值。

![Two girls riding a horse and one girl walking beside the horse](../../../../assets/misc/image-segmenter-example-input.jpg)
![The image mask that outlines the shape of the girls and horse from the previous photograph. The left half of the image's outline is captured, but the right half of the image is not](../../../../assets/misc/image-segmenter-confidence-output.png)

**原始图像和类别置信度掩码输出。来源图像来自 [Pascal VOC 2012](https://www.kaggle.com/datasets/huanghanchina/pascal-voc-2012) 数据集。**

> **注意：** 在第二张输出图像中，浮点输出值缩放到 `[0, 255]` 范围内的值，并转换为 uint8 数据类型。

### 类别值 (Category value)

以下图像展示了类别值掩码的任务输出可视化结果。类别掩码范围为 `[0, 255]`，每个像素值代表模型输出的获胜类别索引。获胜类别索引在模型可以识别的类别中具有最高得分。

![Two girls riding a horse and one girl walking beside the horse](../../../../assets/misc/image-segmenter-example-input.jpg)
![The image mask that outlines the shape of the girls and horse from the previous image. The shape of all three girls and the horse are masked accurately](../../../../assets/misc/image-segmenter-category-output.jpg)

**原始图像和类别掩码输出。来源图像来自 [Pascal VOC 2012](https://www.kaggle.com/datasets/huanghanchina/pascal-voc-2012) 数据集。**

> **注意：** 在第二张输出图像中，像素值乘以 10 以增加对比度并改善可视化效果。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*