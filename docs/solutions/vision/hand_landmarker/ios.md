---
title: "iOS 手部关键点检测指南 (Hand landmarks detection guide for iOS)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/ios"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2024-05-14 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# iOS 手部关键点检测指南 (Hand landmarks detection guide for iOS)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/ios)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Hand Landmarker 任务可让您检测图像中手部的关键点 (landmarks)。
本说明向您展示如何将 Hand Landmarker 用于 iOS 应用。本说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/hand_landmarker/ios) 上找到。

有关此任务的功能、模型和配置选项的更多信息，请参阅[概述](../hand_landmarker.md)。

## 代码示例 (Code example)

MediaPipe Tasks 的示例代码提供了 iOS 上 Hand Landmarker 应用的基本实现。该示例使用物理 iOS 设备上的摄像头来检测连续视频数据流中的手部关键点。该应用还可以检测设备图库中图像和视频里的手部关键点。

您可以将此应用作为您自己的 iOS 应用的起点，或在修改现有应用时参考它。Hand Landmarker 示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/hand_landmarker/ios) 上。

### 下载代码 (Download the code)

以下说明向您展示如何使用 [git](https://git-scm.com/) 命令行工具创建示例代码的本地副本。

要下载示例代码：

1. 使用以下命令克隆 git 仓库：

   ```bash
   git clone https://github.com/google-ai-edge/mediapipe-samples
   ```
2. （可选）配置您的 git 实例以使用稀疏签出 (sparse checkout)，这样您就只有 Hand Landmarker 示例应用的文件：

   ```bash
   cd mediapipe-samples
   git sparse-checkout init --cone
   git sparse-checkout set examples/hand_landmarker/ios/
   ```

创建示例代码的本地版本后，您可以在 Xcode 中打开该项目并运行应用。有关说明，请参阅 [iOS 环境配置指南](../../setup_ios.md)。

### 关键组件 (Key components)

以下文件包含 Hand Landmarker 示例应用的关键代码：

* [HandLandmarkerService.swift](https://github.com/googlesamples/mediapipe/blob/main/examples/hand_landmarker/ios/HandLandmarker/Services/HandLandmarkerService.swift): 初始化 Hand Landmarker，处理模型选择，并对输入数据运行推理。
* [CameraViewController.swift](https://github.com/googlesamples/mediapipe/blob/main/examples/hand_landmarker/ios/HandLandmarker/ViewContoller/CameraViewController.swift): 实现实时摄像头画面输入模式的 UI，并将结果可视化。
* [MediaLibraryViewController.swift](https://github.com/googlesamples/mediapipe/blob/main/examples/hand_landmarker/ios/HandLandmarker/ViewContoller/MediaLibraryViewController.swift): 实现静态图像和视频文件输入模式的 UI，并将结果可视化。

## 环境配置 (Setup)

本节介绍专门为使用 Hand Landmarker 配置开发环境和代码项目的关键步骤。有关配置使用 MediaPipe Tasks 的开发环境（包括平台版本要求）的通用信息，请参阅 [iOS 环境配置指南](../../setup_ios.md)。

### 依赖项 (Dependencies)

Hand Landmarker 使用 `MediaPipeTasksVision` 库，可以通过 [Swift Package Manager](https://github.com/swiftlang/swift-package-manager) (SPM) 安装该库。该库兼容 Swift 和 Objective-C 应用，且不需要任何额外的特定语言配置。

要将 `MediaPipeTasksVision` 库添加到您的 Xcode 项目中：

1. 在 Xcode 中打开您的项目，选择 **File > Add Package Dependencies...**。
2. 在右上角的搜索字段中，输入仓库 URL：
   `https://github.com/google-ai-edge/mediapipe`
3. 选择 `mediapipe` 包并选择您的依赖规则（例如，**Up to Next Major Version** 或 `master` 分支）。
4. 点击 **Add Package**，然后选择 `MediaPipeTasksVision` 并将其添加到您的应用程序目标 (target)。

如果您使用 `Package.swift` 文件，请使用以下代码添加 MediaPipe 包和 `MediaPipeTasksVision` 目标依赖项：

```swift
dependencies: [
    .package(
        url: "https://github.com/google-ai-edge/mediapipe",
        branch: "master"
    ),
],
targets: [
    .target(
        name: "MyHandLandmarkerApp",
        dependencies: [
            .product(name: "MediaPipeTasksVision", package: "mediapipe"),
        ]
    ),
]
```

有关配置依赖项的更多信息，请参阅 [iOS 环境配置指南](../../setup_ios.md)。

> **注意:** 以下部分提供了 Swift 和 Objective-C 的代码示例。在适用情况下，相关说明均以 Swift 方法名作为参考。

### 模型 (Model)

MediaPipe Hand Landmarker 任务需要一个与此任务兼容的训练好的模型。有关 Hand Landmarker 可用训练模型的更多信息，请参阅任务概述的[模型部分](../hand_landmarker.md#models)。

选择并下载一个模型，并使用 Xcode 将其添加到您的项目目录中。有关如何将文件添加到 Xcode 项目的说明，请参阅[在 Xcode 项目中管理文件和文件夹](https://developer.apple.com/documentation/xcode/managing-files-and-folders-in-your-xcode-project)。

使用 `BaseOptions.modelAssetPath` 属性指定您的 app bundle 中的模型路径。有关代码示例，请参阅下一节。

## 创建任务 (Create the task)

您可以通过调用其初始化程序之一来创建 Hand Landmarker 任务。`HandLandmarker(options:)` 初始化程序接受配置选项的值。

如果您不需要使用自定义配置选项初始化的 Hand Landmarker，您可以使用 `HandLandmarker(modelPath:)` 初始化程序创建一个使用默认选项的 Hand Landmarker。有关配置选项的更多信息，请参阅[配置概述](#configuration)。

Hand Landmarker 任务支持 3 种输入数据类型：静态图像、视频文件和实时视频数据流。默认情况下，`HandLandmarker(modelPath:)` 初始化适用于静态图像的任务。如果您希望您的任务初始化为处理视频文件或实时视频数据流，请使用 `HandLandmarker(options:)` 来指定视频或实时流运行模式。实时流模式还需要额外的 `handLandmarkerLiveStreamDelegate` 配置选项，该选项使 Hand Landmarker 能够将手部关键点检测结果异步传递给委托。

选择与您的运行模式对应的选项卡，以查看如何创建任务并运行推理。

### Swift

### 图像 (Image)

```swift
import MediaPipeTasksVision

let modelPath = Bundle.main.path(forResource: "hand_landmarker",
                                      ofType: "task")

let options = HandLandmarkerOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .image
options.minHandDetectionConfidence = minHandDetectionConfidence
options.minHandPresenceConfidence = minHandPresenceConfidence
options.minTrackingConfidence = minHandTrackingConfidence
options.numHands = numHands

let handLandmarker = try HandLandmarker(options: options)
```

### 视频 (Video)

```swift
import MediaPipeTasksVision

let modelPath = Bundle.main.path(forResource: "hand_landmarker",
                                      ofType: "task")

let options = HandLandmarkerOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .video
options.minHandDetectionConfidence = minHandDetectionConfidence
options.minHandPresenceConfidence = minHandPresenceConfidence
options.minTrackingConfidence = minHandTrackingConfidence
options.numHands = numHands

let handLandmarker = try HandLandmarker(options: options)
```

### 实时流 (Livestream)

```swift
import MediaPipeTasksVision

// Class that conforms to the `HandLandmarkerLiveStreamDelegate` protocol and
// implements the method that the hand landmarker calls once it finishes
// performing landmarks detection in each input frame.
class HandLandmarkerResultProcessor: NSObject, HandLandmarkerLiveStreamDelegate {

  func handLandmarker(
    _ handLandmarker: HandLandmarker,
    didFinishDetection result: HandLandmarkerResult?,
    timestampInMilliseconds: Int,
    error: Error?) {

    // Process the hand landmarker result or errors here.

  }
}

let modelPath = Bundle.main.path(
  forResource: "hand_landmarker",
  ofType: "task")

let options = HandLandmarkerOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .liveStream
options.minHandDetectionConfidence = minHandDetectionConfidence
options.minHandPresenceConfidence = minHandPresenceConfidence
options.minTrackingConfidence = minHandTrackingConfidence
options.numHands = numHands

// Assign an object of the class to the `handLandmarkerLiveStreamDelegate`
// property.
let processor = HandLandmarkerResultProcessor()
options.handLandmarkerLiveStreamDelegate = processor

let handLandmarker = try HandLandmarker(options: options)
```

### Objective-C

### 图像 (Image)

```objc
@import MediaPipeTasksVision;

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"hand_landmarker"
                                                      ofType:@"task"];

MPPHandLandmarkerOptions *options = [[MPPHandLandmarkerOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeImage;
options.minHandDetectionConfidence = minHandDetectionConfidence;
options.minHandPresenceConfidence = minHandPresenceConfidence;
options.minTrackingConfidence = minHandTrackingConfidence;
options.numHands = numHands;

MPPHandLandmarker *handLandmarker =
  [[MPPHandLandmarker alloc] initWithOptions:options error:nil];
```

### 视频 (Video)

```objc
@import MediaPipeTasksVision;

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"hand_landmarker"
                                                      ofType:@"task"];

MPPHandLandmarkerOptions *options = [[MPPHandLandmarkerOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeVideo;
options.minHandDetectionConfidence = minHandDetectionConfidence;
options.minHandPresenceConfidence = minHandPresenceConfidence;
options.minTrackingConfidence = minHandTrackingConfidence;
options.numHands = numHands;

MPPHandLandmarker *handLandmarker =
  [[MPPHandLandmarker alloc] initWithOptions:options error:nil];
```

### 实时流 (Livestream)

```objc
@import MediaPipeTasksVision;

// Class that conforms to the `MPPHandLandmarkerLiveStreamDelegate` protocol
// and implements the method that the hand landmarker calls once it finishes
// performing landmarks detection in each input frame.

@interface APPHandLandmarkerResultProcessor : NSObject 

@end

@implementation APPHandLandmarkerResultProcessor

-   (void)handLandmarker:(MPPHandLandmarker *)handLandmarker
    didFinishDetectionWithResult:(MPPHandLandmarkerResult *)handLandmarkerResult
         timestampInMilliseconds:(NSInteger)timestampInMilliseconds
                           error:(NSError *)error {

    // Process the hand landmarker result or errors here.

}

@end

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"hand_landmarker"
                                                      ofType:@"task"];

MPPHandLandmarkerOptions *options = [[MPPHandLandmarkerOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeLiveStream;
options.minHandDetectionConfidence = minHandDetectionConfidence;
options.minHandPresenceConfidence = minHandPresenceConfidence;
options.minTrackingConfidence = minHandTrackingConfidence;
options.numHands = numHands;

// Assign an object of the class to the `handLandmarkerLiveStreamDelegate`
// property.
APPHandLandmarkerResultProcessor *processor =
  [APPHandLandmarkerResultProcessor new];
options.handLandmarkerLiveStreamDelegate = processor;

MPPHandLandmarker *handLandmarker =
  [[MPPHandLandmarker alloc] initWithOptions:options error:nil];
```

> **注意:** 如果您使用视频 (video) 模式或实时流 (livestream) 模式，Hand Landmarker 会使用跟踪功能以避免在每一帧上触发手掌检测模型，这有助于降低延迟。

### 配置选项 (Configuration options)

此任务为 iOS 应用提供以下配置选项：

| 选项名称 (Option Name) | 说明 (Description) | 值范围 (Value Range) | 默认值 (Default Value) |
| --- | --- | --- | --- |
| `running_mode` | 设置任务的运行模式。有三种模式：IMAGE：用于单张图像输入的模式。VIDEO：用于视频解码帧的模式。LIVE_STREAM：用于输入数据流（例如来自摄像头的实时流）的模式。在这种模式下，必须调用 `resultListener` 来设置监听器以异步接收结果。在这种模式下，必须将 `handLandmarkerLiveStreamDelegate` 设置为实现 `HandLandmarkerLiveStreamDelegate` 的类的实例，以异步接收手部关键点检测结果。 | {`RunningMode.image, RunningMode.video, RunningMode.liveStream`} | `RunningMode.image` |
| `numHands` | Hand Landmarker 检测器检测到的最大手部数量。 | `Any integer > 0` | `1` |
| `minHandDetectionConfidence` | 在手掌检测模型中，手部检测被视为成功的最低置信度得分。 | `0.0 - 1.0` | `0.5` |
| `minHandPresenceConfidence` | 手部关键点检测模型中手部存在得分的最低置信度得分。在 Video 模式和 Live stream 模式下，如果来自手部关键点模型的手部存在置信度得分低于此阈值，Hand Landmarker 会触发手掌检测模型。否则，轻量级手部跟踪算法将确定手的位置以进行后续的关键点检测。 | `0.0 - 1.0` | `0.5` |
| `minTrackingConfidence` | 手部跟踪被视为成功的最低置信度得分。这是当前帧和上一帧中手部之间的边界框 IoU 阈值。在 Hand Landmarker 的 Video 模式和 Stream 模式下，如果跟踪失败，Hand Landmarker 会触发手部检测。否则，它会跳过手部检测。 | `0.0 - 1.0` | `0.5` |
| `result_listener` | 当 hand landmarker 处于实时流模式时，设置结果监听器以异步接收检测结果。仅在运行模式设置为 `LIVE_STREAM` 时适用。 | N/A | N/A |

当运行模式设置为 livestream 时，Hand Landmarker 需要额外的 `handLandmarkerLiveStreamDelegate` 配置选项，该选项使 Hand Landmarker 能够异步传递手部关键点检测结果。该委托必须实现 `handLandmarker(_:didFinishDetection:timestampInMilliseconds:error:)` 方法，Hand Landmarker 会在处理完每帧上的手部关键点检测结果后调用该方法。

| 选项名称 (Option name) | 说明 (Description) | 值范围 (Value Range) | 默认值 (Default Value) |
| --- | --- | --- | --- |
| `handLandmarkerLiveStreamDelegate` | 使 Hand Landmarker 能够在 livestream 模式下异步接收手部关键点检测的结果。其实例被设置为此属性的类必须实现 `handLandmarker(_:didFinishDetection:timestampInMilliseconds:error:)` 方法。 | 不适用 | 未设置 |

## 准备数据 (Prepare data)

在将输入图像或帧传递给 Hand Landmarker 之前，您需要将其转换为 `MPImage` 对象。`MPImage` 支持不同类型的 iOS 图像格式，并可以在任何运行模式下使用它们进行推理。有关 `MPImage` 的更多信息，请参阅 [MPImage API](/edge/api/mediapipe/swift/vision/Classes/MPImage)。

根据您的用例和应用所需的运行模式选择 iOS 图像格式。`MPImage` 接受 `UIImage`、`CVPixelBuffer` 和 `CMSampleBuffer` iOS 图像格式。

### UIImage

`UIImage` 格式非常适合以下运行模式：

* 图像：来自 app bundle、用户图库或格式化为 `UIImage` 图像的文件系统的图像都可以转换为 `MPImage` 对象。
* 视频：使用 [AVAssetImageGenerator](https://developer.apple.com/documentation/avfoundation/avassetimagegenerator) 将视频帧提取为 [CGImage](https://developer.apple.com/documentation/coregraphics/cgimage) 格式，然后将它们转换为 `UIImage` 图像。

### Swift

```swift
// Load an image on the user's device as an iOS `UIImage` object.

// Convert the `UIImage` object to a MediaPipe's Image object having the default
// orientation `UIImage.Orientation.up`.
let image = try MPImage(uiImage: image)
```

### Objective-C

```objc
// Load an image on the user's device as an iOS `UIImage` object.

// Convert the `UIImage` object to a MediaPipe's Image object having the default
// orientation `UIImageOrientationUp`.
MPImage *image = [[MPPImage alloc] initWithUIImage:image error:nil];
```

该示例使用默认的 [UIImage.Orientation.Up](https://developer.apple.com/documentation/uikit/uiimage/orientation/up) 方向初始化 `MPImage`。您可以使用任何支持的 [UIImage.Orientation](https://developer.apple.com/documentation/uikit/uiimage/orientation) 值来初始化 `MPImage`。Hand Landmarker 不支持 `.upMirrored`、`.downMirrored`、`.leftMirrored`、`.rightMirrored` 等镜像方向。

有关 `UIImage` 的更多信息，请参阅 [UIImage Apple Developer Documentation](https://developer.apple.com/documentation/uikit/uiimage)。

### CVPixelBuffer

`CVPixelBuffer` 格式非常适合生成帧并使用 iOS [CoreImage](https://developer.apple.com/documentation/coreimage) 框架进行处理的应用。

`CVPixelBuffer` 格式非常适合以下运行模式：

* 图像：在使用 iOS 的 `CoreImage` 框架进行某些处理后生成 `CVPixelBuffer` 图像的应用程序，可以被发送到图像运行模式下的 Hand Landmarker。
* 视频：视频帧可以转换为 `CVPixelBuffer` 格式进行处理，然后在视频模式下发送到 Hand Landmarker。
* 实时流 (livestream)：使用 iOS 摄像头生成帧的应用程序在被发送到实时流模式下的 Hand Landmarker 之前，可能会被转换为 `CVPixelBuffer` 格式以进行处理。

### Swift

```swift
// Obtain a CVPixelBuffer.

// Convert the `CVPixelBuffer` object to a MediaPipe's Image object having the default
// orientation `UIImage.Orientation.up`.
let image = try MPImage(pixelBuffer: pixelBuffer)
```

### Objective-C

```objc
// Obtain a CVPixelBuffer.

// Convert the `CVPixelBuffer` object to a MediaPipe's Image object having the
// default orientation `UIImageOrientationUp`.
MPImage *image = [[MPPImage alloc] initWithUIImage:image error:nil];
```

有关 `CVPixelBuffer` 的更多信息，请参阅 [CVPixelBuffer Apple Developer Documentation](https://developer.apple.com/documentation/corevideo/cvpixelbuffer-q2e)。

### CMSampleBuffer

`CMSampleBuffer` 格式存储统一媒体类型的媒体样本，并且非常适合 livestream 运行模式。来自 iOS 摄像头的实时帧由 iOS [AVCaptureVideoDataOutput](https://developer.apple.com/documentation/avfoundation/avcapturevideodataoutput) 以 `CMSampleBuffer` 格式异步传递。

### Swift

```swift
// Obtain a CMSampleBuffer.

// Convert the `CMSampleBuffer` object to a MediaPipe's Image object having the default
// orientation `UIImage.Orientation.up`.
let image = try MPImage(sampleBuffer: sampleBuffer)
```

### Objective-C

```objc
// Obtain a `CMSampleBuffer`.

// Convert the `CMSampleBuffer` object to a MediaPipe's Image object having the
// default orientation `UIImageOrientationUp`.
MPImage *image = [[MPPImage alloc] initWithSampleBuffer:sampleBuffer error:nil];
```

有关 `CMSampleBuffer` 的更多信息，请参阅 [CMSampleBuffer Apple Developer Documentation](https://developer.apple.com/documentation/coremedia/cmsamplebuffer)。

## 运行任务 (Run the task)

要运行 Hand Landmarker，请使用特定于所分配运行模式的 `detect()` 方法：

* 静态图像：`detect(image:)`
* 视频：`detect(videoFrame:timestampInMilliseconds:)`
* 实时流：`detectAsync(image:timestampInMilliseconds:)`

### Swift

### 图像 (Image)

```swift
let result = try handLandmarker.detect(image: image)
```

### 视频 (Video)

```swift
let result = try handLandmarker.detect(
    videoFrame: image,
    timestampInMilliseconds: timestamp)
```

### 实时流 (Livestream)

```swift
try handLandmarker.detectAsync(
  image: image,
  timestampInMilliseconds: timestamp)
```

### Objective-C

### 图像 (Image)

```objc
MPPHandLandmarkerResult *result =
  [handLandmarker detectInImage:image error:nil];
```

### 视频 (Video)

```objc
MPPHandLandmarkerResult *result =
  [handLandmarker detectInVideoFrame:image
             timestampInMilliseconds:timestamp
                               error:nil];
```

### 实时流 (Livestream)

```objc
BOOL success =
  [handLandmarker detectAsyncInImage:image
             timestampInMilliseconds:timestamp
                               error:nil];
```

Hand Landmarker 代码示例更详细地显示了这些模式各自的实现。该示例代码允许用户在处理模式之间切换，这对于您的用例可能并非必要。

请注意以下几点：

* 在视频模式或实时流 (livestream) 模式下运行时，您必须另外向 Hand Landmarker 任务提供输入帧的时间戳 (timestamp)。
* 在图像或视频模式下运行时，Hand Landmarker 任务会阻塞当前线程，直到其完成对输入图像或帧的处理。为避免阻塞当前线程，请使用 iOS [Dispatch](https://developer.apple.com/documentation/dispatch) 或 [NSOperation](https://developer.apple.com/documentation/foundation/nsoperation) 框架在后台线程中执行处理。
* 在实时流 (livestream) 模式下运行时，Hand Landmarker 任务会立即返回并且不会阻塞当前线程。它在处理完每个输入帧后，都会使用 hand landmarker 结果调用 `handLandmarker(_:didFinishDetection:timestampInMilliseconds:error:)` 方法。Hand Landmarker 在专门的串行调度队列 (serial dispatch queue) 上异步调用此方法。为了在用户界面上显示结果，请在处理完结果后将结果分派到主队列 (main queue)。如果在 Hand Landmarker 任务正忙于处理另一个帧时调用 `detectAsync` 函数，Hand Landmarker 将忽略新的输入帧。

## 处理和显示结果 (Handle and display results)

在运行推理后，Hand Landmarker 任务会返回一个 `HandLandmarkerResult`，其中包含图像坐标中的手部关键点、世界坐标中的手部关键点以及检测到的手部的惯用手 (handedness，左手/右手)。

以下显示了此任务的输出数据示例：

`HandLandmarkerResult` 输出包含三个组件。每个组件都是一个数组，其中每个元素包含单个检测到的手部的以下结果：

* 惯用手 (Handedness)

  惯用手表示检测到的手是左手还是右手。
* 关键点 (Landmarks)

  有 21 个手部关键点，每个关键点由 `x`、`y` 和 `z` 坐标组成。`x` 和 `y` 坐标分别由图像宽度和高度归一化到 [0.0, 1.0]。`z` 坐标表示关键点深度，以手腕处的深度为原点。值越小，关键点越靠近相机。`z` 的大小使用与 `x` 大致相同的比例。
* 世界坐标关键点 (World Landmarks)

  21 个手部关键点也以世界坐标呈现。每个关键点由 `x`、`y` 和 `z` 组成，表示以米为单位的真实世界 3D 坐标，原点位于手部的几何中心。

```text
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

下图展示了该任务输出的视图：

![竖起大拇指的手势，并标出了手部的骨骼结构](../../../../assets/misc/gesture-recognizer.png)

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*
