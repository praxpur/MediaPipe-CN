---
title: "Android 整体关键点检测指南 (Holistic landmark detection guide for Android)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/holistic_landmarker/android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-19 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Android 整体关键点检测指南 (Holistic landmark detection guide for Android)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/holistic_landmarker/android)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Holistic Landmarker(整体关键点检测器)任务可让您组合面部、手部和姿态关键点检测器的组件,在图像或视频中检测人体关键点。该任务以归一化图像坐标和 3 维世界坐标输出整体关键点。

本说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/holistic_landmarker/android) 上获取。有关此任务的功能、模型和配置选项的更多信息,请参阅[概览](../holistic_landmarker.md)。

## 代码示例

MediaPipe Tasks 示例代码是一个适用于 Android 的 Holistic Landmarker 应用的简单实现。该示例使用实体 Android 设备上的摄像头在连续视频流中检测整体关键点。该应用还可以检测设备图库中图像中的关键点。

您可以将该应用作为自己 Android 应用的起点,或在修改现有应用时参考它。Holistic Landmarker 示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/holistic_landmarker) 上。

### 下载代码

以下说明向您展示如何使用 [git](https://git-scm.com/) 命令行工具创建示例代码的本地副本。

要下载示例代码:

1.  使用以下命令克隆 git 仓库:

    ```
    git clone https://github.com/google-ai-edge/mediapipe-samples
    ```

2.  (可选)配置 git 实例使用稀疏检出 (sparse checkout),以便只保留 Holistic Landmarker 示例应用所需的文件:

    ```
    cd mediapipe-samples
    git sparse-checkout init --cone
    git sparse-checkout set examples/holistic_landmarker/android
    ```

### 关键组件

以下文件包含此整体关键点示例应用的关键代码:

-   `HolisticLandmarkerHelper.kt` — 初始化整体关键点检测器,并处理模型与委托 (delegate) 的选择。
-   `CameraFragment.kt` — 处理设备摄像头,并处理图像和视频输入数据。
-   `GalleryFragment.kt` — 与 `OverlayView` 交互以显示输出图像或视频。
-   `OverlayView.kt` — 实现检测到的关键点的显示。

## 环境配置

本节介绍为使用 Holistic Landmarker 而设置开发环境和代码项目的关键步骤。有关设置开发环境以使用 MediaPipe 任务的一般信息(包括平台版本要求),请参阅 [Android 环境配置指南](../../setup_android.md)。

### 依赖

Holistic Landmarker 任务使用 `com.google.mediapipe:tasks-vision` 库。将此依赖添加到 Android 应用的 `build.gradle` 文件中:

```
dependencies {
    implementation 'com.google.mediapipe:tasks-vision:latest.release'
}
```

### 模型

MediaPipe Holistic Landmarker 任务需要一个与此任务兼容的已训练模型包。有关 Holistic Landmarker 可用已训练模型的更多信息,请参阅任务概览中的[模型部分](../holistic_landmarker.md#models)。

选择并下载模型,然后将其存放在项目目录中:

```
<dev-project-root>/src/main/assets
```

在 `ModelAssetPath` 参数中指定模型的路径:

```
val modelName = "holistic_landmarker.task"
baseOptionsBuilder.setModelAssetPath(modelName)
```

## 创建任务

MediaPipe Holistic Landmarker 任务使用 `createFromOptions()` 函数来设置任务。`createFromOptions()` 函数接受配置选项的值。有关配置选项的更多信息,请参阅[配置选项](#configuration_options)。

Holistic Landmarker 支持以下输入数据类型:静态图像、视频文件和实时视频流。您需要在创建任务时指定与输入数据类型对应的运行模式。选择与您的输入数据类型对应的标签页,以了解如何创建任务。

### 图像

```
val baseOptionsBuilder = BaseOptions.builder().setModelAssetPath(modelName)
val optionsBuilder = 
    HolisticLandmarkerOptions.builder()
        .setBaseOptions(baseOptionsBuilder.build())
        .setMinFaceDetectionConfidence(0.5f)
        .setMinPoseDetectionConfidence(0.5f)
        .setMinHandLandmarksConfidence(0.5f)
        .setRunningMode(RunningMode.IMAGE)

val options = optionsBuilder.build()
val holisticLandmarker = HolisticLandmarker.createFromOptions(context, options)
```

### 视频

```
val baseOptionsBuilder = BaseOptions.builder().setModelAssetPath(modelName)
val optionsBuilder = 
    HolisticLandmarkerOptions.builder()
        .setBaseOptions(baseOptionsBuilder.build())
        .setMinFaceDetectionConfidence(0.5f)
        .setMinPoseDetectionConfidence(0.5f)
        .setMinHandLandmarksConfidence(0.5f)
        .setRunningMode(RunningMode.VIDEO)

val options = optionsBuilder.build()
val holisticLandmarker = HolisticLandmarker.createFromOptions(context, options)
```

### 实时流

```
val baseOptionsBuilder = BaseOptions.builder().setModelAssetPath(modelName)
val optionsBuilder = 
    HolisticLandmarkerOptions.builder()
        .setBaseOptions(baseOptionsBuilder.build())
        .setMinFaceDetectionConfidence(0.5f)
        .setMinPoseDetectionConfidence(0.5f)
        .setMinHandLandmarksConfidence(0.5f)
        .setRunningMode(RunningMode.LIVE_STREAM)
        .setResultListener(resultListener)
        .setErrorListener(errorListener)

val options = optionsBuilder.build()
val holisticLandmarker = HolisticLandmarker.createFromOptions(context, options)
```

### 配置选项

此任务对 Android 应用有以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `runningMode` | 设置任务的运行模式。共有三种模式:<br><br>IMAGE:用于单张图像输入的模式。<br><br>VIDEO:用于视频已解码帧的模式。<br><br>LIVE_STREAM:用于输入数据实时流(如来自摄像头)的模式。在此模式下,必须调用 resultListener 来设置监听器,以异步接收结果。 | {`IMAGE, VIDEO, LIVE_STREAM`} | `IMAGE` |
| `minFaceDetectionConfidence` | 面部检测被视为成功所需的最低置信度分数。 | `Float [0.0, 1.0]` | `0.5` |
| `minFaceSuppressionThreshold` | 面部检测被视为重叠所需的最低非极大值抑制阈值。 | `Float [0.0, 1.0]` | `0.3` |
| `minFacePresenceConfidence` | 面部关键点检测中面部存在分数所需的最低置信度分数。 | `Float [0.0, 1.0]` | `0.5` |
| `minPoseDetectionConfidence` | 姿态检测被视为成功所需的最低置信度分数。 | `Float [0.0, 1.0]` | `0.5` |
| `minPoseSuppressionThreshold` | 姿态检测被视为重叠所需的最低非极大值抑制阈值。 | `Float [0.0, 1.0]` | `0.3` |
| `minPosePresenceConfidence` | 姿态关键点检测中姿态存在分数所需的最低置信度分数。 | `Float [0.0, 1.0]` | `0.5` |
| `minHandLandmarksConfidence` | 手部关键点检测中手部存在分数所需的最低置信度分数。 | `Float [0.0, 1.0]` | `0.5` |
| `outputFaceBlendshapes` | 是否输出面部融合变形 (blendshapes) 分类。面部融合变形用于渲染 3 维面部模型。 | `Boolean` | `false` |
| `outputPoseSegmentationMasks` | 是否输出人体姿态的分割掩码。 | `Boolean` | `false` |

## 准备数据

Holistic Landmarker 可以检测主机平台支持的任何格式图像中的整体关键点。该任务还会处理数据输入的预处理,包括调整大小、旋转和值归一化。要在视频中检测关键点,您可以使用该 API 逐帧快速处理,并使用帧的时间戳来确定关键点在视频中出现的时间。

## 运行任务

根据您的运行模式,使用 `detect`、`detectForVideo` 或 `detectAsync` 方法来执行任务。任务返回包含面部、姿态、左手和右手关键点的 `HolisticLandmarkerResult`。

以下代码演示了如何运行任务:

```
// Run holistic landmarker on a single image
val image = MPImage(bitmap)
val result = holisticLandmarker.detect(image)
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*