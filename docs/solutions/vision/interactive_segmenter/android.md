---
title: "Android 交互式图像分割指南 (Interactive Image Segmentation Guide for Android)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/interactive_segmenter/android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Android 交互式图像分割指南 (Interactive Image Segmentation Guide for Android)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/interactive_segmenter/android)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Interactive Image Segmenter(交互式图像分割器)任务接收指示图像中位置的笔画,估计该位置处物体的边界,并返回该物体的分割结果作为图像数据。以下说明介绍如何在 Android 应用中使用交互式图像分割器。这些说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/interactive_segmentation/android) 上获取。有关此任务的功能、模型和配置选项的更多信息,请参阅[概述](../interactive_segmenter.md)。

## 代码示例 (Code example)

MediaPipe Tasks 代码示例是 Android 平台交互式图像分割器应用的基础实现。该示例可处理从设备相册中选出的图像。

您可以将该应用作为自己 Android 应用的起点,也可以在修改现有应用时参考它。交互式图像分割器示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/interactive_segmentation/android) 上。

### 下载代码

以下说明介绍如何使用 [git](https://git-scm.com/) 命令行工具创建示例代码的本地副本。

要下载示例代码:

1. 使用以下命令克隆 git 仓库:

   ```bash
   git clone https://github.com/google-ai-edge/mediapipe-samples
   ```
2. 可选地,配置您的 git 实例使用稀疏检出(sparse checkout),以便只保留交互式图像分割器示例应用所需的文件:

   ```bash
   cd mediapipe-samples
   git sparse-checkout init --cone
   git sparse-checkout set examples/interactive_segmentation/android
   ```

创建示例代码的本地版本后,您可以将项目导入 Android Studio 并运行应用。有关说明,请参阅 [Android 环境配置指南](../../../setup_android.md#example_code)。

### 关键组件

以下文件包含此图像分割示例应用的关键代码:

- [InteractiveSegmentationHelper.kt](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/interactive_segmentation/android/app/src/main/java/com/mediapipe/example/interactivesegmentation/InteractiveSegmentationHelper.kt)
  - 初始化交互式图像分割器任务,并处理模型与委托的选择。
- [OverlayView.kt](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/interactive_segmentation/android/app/src/main/java/com/mediapipe/example/interactivesegmentation/OverlayView.kt)
  - 处理并格式化分割结果。

## 环境配置 (Setup)

本节介绍为使用交互式图像分割器配置开发环境和代码项目的关键步骤。有关使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参阅 [Android 环境配置指南](../../../setup_android.md)。

### 依赖项

交互式图像分割器使用 `com.google.mediapipe:tasks-vision` 库。将此依赖项添加到 Android 应用开发项目的 `build.gradle` 文件中。使用以下代码导入所需依赖项:

```gradle
dependencies {
    ...
    implementation 'com.google.mediapipe:tasks-vision:latest.release'
}
```

### 模型

MediaPipe 交互式图像分割器任务需要一个与此任务兼容的训练好的模型。有关交互式图像分割器可用训练模型的更多信息,请参阅任务概述的[模型部分](../interactive_segmenter.md#models)。

选择并下载模型,然后将其存放在项目目录中:

```
<dev-project-root>/src/main/assets
```

**注意:** 推荐此位置,因为 Android 构建系统会自动检查此目录中的文件资源。

使用 `BaseOptions.Builder.setModelAssetPath()` 方法指定模型使用的路径。下一节的代码示例中演示了此方法。

在交互式图像分割器[示例代码](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/interactive_segmentation/android)中,模型在 [`InteractiveSegmentationHelper`](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/interactive_segmentation/android/app/src/main/java/com/mediapipe/example/interactivesegmentation/InteractiveSegmentationHelper.kt) 类的 `setupInteractiveSegmenter()` 函数中定义。

## 创建任务

您可以使用 `createFromOptions` 函数创建任务。`createFromOptions` 函数接受配置选项。有关配置选项的更多信息,请参阅[配置选项](#configuration_options)。

```java
BaseOptions baseOptions = BaseOptions.builder()
    .setModelAssetPath("interactive_segmentation.task")
    .build();

InteractiveSegmenterOptions options = InteractiveSegmenterOptions.builder()
    .setBaseOptions(baseOptions)
    .build();

InteractiveSegmenter interactiveSegmenter =
    InteractiveSegmenter.createFromOptions(context, options);
```

关于设置此任务的更详细示例,请参阅 [`InteractiveSegmentationHelper`](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/interactive_segmentation/android/app/src/main/java/com/mediapipe/example/interactivesegmentation/InteractiveSegmentationHelper.kt) 类的 `setupInteractiveSegmenter()` 函数。

### 配置选项

此任务没有任务专属的配置选项。它仅支持所有任务通用的 `BaseOptions` 配置,允许您指定:

- **模型资源路径 (Model asset path)**: 项目内预训练任务模型的位置。
- **委托 (Delegate)**: 用于运行任务的处理硬件(如 CPU 或 GPU)。

## 准备数据

交互式图像分割器处理图像,任务负责数据输入预处理,包括缩放、旋转与数值归一化。在将输入图像传递给任务之前,您需要将其转换为 `com.google.mediapipe.framework.image.MPImage` 对象。

```java
import com.google.mediapipe.framework.image.BitmapImageBuilder;
import com.google.mediapipe.framework.image.MPImage;

// 使用 BitmapFactory 将用户设备上的图像加载为 Bitmap 对象。

// 将 Android Bitmap 对象转换为 MediaPipe Image 对象。
MPImage mpImage = new BitmapImageBuilder(bitmap).build();
```

在交互式图像分割器示例代码中,数据准备工作由 [`InteractiveSegmentationHelper`](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/interactive_segmentation/android/app/src/main/java/com/mediapipe/example/interactivesegmentation/InteractiveSegmentationHelper.kt) 类中的 `segment()` 函数处理。

## 运行任务

调用 `segment` 函数来执行预测并生成分割掩码。交互式图像分割器任务返回单个掩码,表示输入图像中已识别的分割区域。

```java
import com.google.mediapipe.tasks.components.containers.NormalizedKeypoint;
import com.google.mediapipe.tasks.vision.interactivesegmenter.Stroke;
import java.util.Arrays;
import java.util.List;

// 设置要分割的图像。
interactiveSegmenter.setImage(mpImage);

// 使用笔画对提供的图像执行图像分割。
List<Stroke> strokes = Arrays.asList(
    Stroke.builder()
        .setBrushMode(Stroke.BrushMode.POSITIVE)
        .setPoints(Arrays.asList(
            NormalizedKeypoint.create(0.2f, 0.5f),
            NormalizedKeypoint.create(0.5f, 0.5f)
        ))
        .setCompleted(true)
        .build()
);

MPImage mask = interactiveSegmenter.segment(strokes);
```

在交互式图像分割器示例代码中,`segment` 函数定义在 [`InteractiveSegmentationHelper.kt`](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/interactive_segmentation/android/app/src/main/java/com/mediapipe/example/interactivesegmentation/InteractiveSegmentationHelper.kt) 文件中。

## 处理并显示结果

运行推理后,交互式图像分割器任务返回一个包含分割结果的 `MPImage` 对象。输出的内容是置信度掩码。

以下小节进一步说明此任务的输出数据:

### 置信度掩码

交互式分割器的输出是单通道置信度掩码,针对图像的每个像素包含 `[0.0, 1.0]` 范围内的浮点值,尺寸与输入图像一致。数值越高,表示该图像像素属于感兴趣区域处物体的置信度越高。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*