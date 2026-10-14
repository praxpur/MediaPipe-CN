---
title: "iOS 整体关键点检测指南 (Holistic landmark detection guide for iOS)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/holistic_landmarker/ios"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-08 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# iOS 整体关键点检测指南 (Holistic landmark detection guide for iOS)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/holistic_landmarker/ios)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Holistic Landmarker(整体关键点检测器)任务可让您组合面部、手部和姿态关键点检测器的组件,在图像或视频中检测人体关键点。该任务以归一化图像坐标和 3 维世界坐标输出整体关键点。

以下说明向您展示如何在 iOS 应用中使用 Holistic Landmarker。有关此任务的功能、模型和配置选项的更多信息,请参阅[概览](../holistic_landmarker.md)。

## 代码示例

MediaPipe Tasks 示例代码是一个适用于 iOS 的 Holistic Landmarker 应用的简单实现。该示例使用实体 iOS 设备上的摄像头在连续视频流中检测整体关键点。该应用还可以检测设备图库中图像中的关键点。

您可以将该应用作为自己 iOS 应用的起点,或在修改现有应用时参考它。Holistic Landmarker 示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/holistic_landmarker/ios) 上。

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
    git sparse-checkout set examples/holistic_landmarker/ios
    ```

创建示例代码的本地版本后,您可以在 Xcode 中打开项目并运行该应用。有关说明,请参阅 [iOS 环境配置指南](../../setup_ios.md)。

## 环境配置

本节介绍为使用 Holistic Landmarker 而设置开发环境和代码项目的关键步骤。有关设置开发环境以使用 MediaPipe 任务的一般信息(包括平台版本要求),请参阅 [iOS 环境配置指南](../../setup_ios.md)。

### 依赖

Holistic Landmarker 使用 `MediaPipeTasksVision` 库,该库可以通过 [Swift Package Manager](https://github.com/swiftlang/swift-package-manager) (SPM) 安装。该任务同时兼容 Swift 和 Objective-C 应用。

要将 `MediaPipeTasksVision` 库添加到您的 Xcode 项目:

1.  在 Xcode 中打开项目后,选择 **File > Add Package Dependencies...**。
2.  在右上角的搜索字段中输入仓库 URL:`https://github.com/google-ai-edge/mediapipe`
3.  选择 `mediapipe` 包,并选择您的依赖规则(例如 **Up to Next Major Version** 或 `master` 分支)。
4.  点击 **Add Package**,然后选择 `MediaPipeTasksVision`,并将其添加到您的应用目标 (target) 中。

如果您使用 `Package.swift` 文件,请使用以下代码添加 MediaPipe 包和 `MediaPipeTasksVision` 目标依赖:

```
dependencies: [
    .package(
        url: "https://github.com/google-ai-edge/mediapipe",
        branch: "master"
    ),
],
targets: [
    .target(
        name: "MyHolisticLandmarkerApp",
        dependencies: [
            .product(name: "MediaPipeTasksVision", package: "mediapipe"),
        ]
    ),
]
```

有关配置依赖的更多信息,请参阅 [iOS 环境配置指南](../../setup_ios.md)。

### 模型

MediaPipe Holistic Landmarker 任务需要一个与此任务兼容的已训练模型包。有关 Holistic Landmarker 可用已训练模型的更多信息,请参阅任务概览中的[模型部分](../holistic_landmarker.md#models)。

选择并下载模型,并将其作为资源添加到您的 Xcode 项目中,确保选中 "Copy items if needed"。

使用 `MPPBaseOptions` 对象来指定要使用的模型包的路径。

## 创建任务

您可以通过其某个初始化器来创建 Holistic Landmarker 任务。`MPPHolisticLandmarker(options:)` 初始化器接受配置选项的值。

以下代码演示了如何在 Swift 中构建和配置此任务:

```
import MediaPipeTasksVision

let modelPath = Bundle.main.path(
  forResource: "holistic_landmarker",
  ofType: "task"
)!

let options = HolisticLandmarkerOptions()
options.runningMode = .image
options.minFaceDetectionConfidence = 0.5
options.minPoseDetectionConfidence = 0.5
options.minHandLandmarksConfidence = 0.5
options.baseOptions.modelAssetPath = modelPath

let holisticLandmarker = try HolisticLandmarker(options: options)
```

### 配置选项

此任务对 iOS 应用有以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `runningMode` | 设置任务的运行模式。共有三种模式:<br><br>IMAGE:用于单张图像输入的模式。<br><br>VIDEO:用于视频已解码帧的模式。<br><br>LIVE_STREAM:用于输入数据实时流(如来自摄像头)的模式。在此模式下,必须将 `holisticLandmarkerLiveStreamDelegate` 设置为实现了 `HolisticLandmarkerLiveStreamDelegate` 的类的实例,以异步接收整体关键点检测的结果。 | {`RunningMode.image, RunningMode.video, RunningMode.liveStream`} | `RunningMode.image` |
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

您需要先将输入图像或帧转换为 `MPPImage` 对象,然后才能将其传递给 Holistic Landmarker。`MPPImage` 支持多种 iOS 图像格式和旋转属性。

## 运行任务

要运行任务,请使用 `detect` 方法(用于单张图像)或 `detect(videoFrame:timestampInMilliseconds:)` 方法(用于视频):

```
// Run holistic landmarks detection on the input image
let result = try holisticLandmarker.detect(image: mppImage)
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*