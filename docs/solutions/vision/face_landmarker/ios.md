---
title: "iOS 面部关键点检测指南 (Face landmark detection guide for iOS)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/ios"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2024-05-14 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# iOS 面部关键点检测指南 (Face landmark detection guide for iOS)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/ios)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Face Landmarker 任务可让您检测图像和视频中的面部关键点 (face landmarks) 和面部表情。您可以使用此任务来识别人的面部表情、应用面部滤镜和特效，以及创建虚拟形象。此任务使用可处理单张图像、视频或连续图像数据流的机器学习 (ML) 模型。该任务输出 3D 面部关键点、混合形状得分 (blendshape scores，表示面部表情的系数) 以实时推断详细的面部表面，以及变换矩阵 (transformation matrices) 以执行渲染特效所需的变换。

本说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_landmarker/ios) 上找到。
您可以通过查看此 [Web 演示](https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/face_landmarker) 了解该任务的实际运行情况。
有关此任务的功能、模型和配置选项的更多信息，请参阅[概述](../face_landmarker.md)。

## 代码示例 (Code example)

MediaPipe Tasks 的示例代码提供了 iOS 上 Face Landmarker 应用的基本实现。该示例使用物理 iOS 设备上的摄像头来检测连续视频数据流中的面部关键点。该应用还可以检测设备图库中图像和视频里的面部关键点。

您可以将此应用作为您自己的 iOS 应用的起点，或在修改现有应用时参考它。Face Landmarker 示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_landmarker) 上。

### 下载代码 (Download the code)

以下说明向您展示如何使用 [git](https://git-scm.com/) 命令行工具创建示例代码的本地副本。

要下载示例代码：

1. 使用以下命令克隆 git 仓库：

   ```bash
   git clone https://github.com/google-ai-edge/mediapipe-samples
   ```
2. （可选）配置您的 git 实例以使用稀疏签出 (sparse checkout)，这样您就只有 Face Landmarker 示例应用的文件：

   ```bash
   cd mediapipe-samples
   git sparse-checkout init --cone
   git sparse-checkout set examples/face_landmarker/ios
   ```

创建示例代码的本地版本后，您可以在 Xcode 中打开该项目并运行应用。有关说明，请参阅 [iOS 环境配置指南](../../setup_ios.md)。

### 关键组件 (Key components)

以下文件包含 Face Landmarker 示例应用的关键代码：

* [FaceLandmarkerService.swift](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/face_landmarker/ios/FaceLandmarker/Services/FaceLandmarkerService.swift): 初始化 Face Landmarker，处理模型选择，并对输入数据运行推理。
* [CameraViewController.swift](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/face_landmarker/ios/FaceLandmarker/ViewContoller/CameraViewController.swift): 实现实时摄像头画面输入模式的 UI，并将结果可视化。
* [MediaLibraryViewController.swift](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/face_landmarker/ios/FaceLandmarker/ViewContoller/MediaLibraryViewController.swift): 实现静态图像和视频文件输入模式的 UI，并将结果可视化。

## 环境配置 (Setup)

本节介绍专门为使用 Face Landmarker 配置开发环境和代码项目的关键步骤。有关配置使用 MediaPipe Tasks 的开发环境（包括平台版本要求）的通用信息，请参阅 [iOS 环境配置指南](../../setup_ios.md)。

### 依赖项 (Dependencies)

Face Landmarker 使用 `MediaPipeTasksVision` 库，可以通过 [Swift Package Manager](https://github.com/swiftlang/swift-package-manager) (SPM) 安装该库。该库兼容 Swift 和 Objective-C 应用，且不需要任何额外的特定语言配置。

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
        name: "MyFaceLandmarkerApp",
        dependencies: [
            .product(name: "MediaPipeTasksVision", package: "mediapipe"),
        ]
    ),
]
```

有关配置依赖项的更多信息，请参阅 [iOS 环境配置指南](../../setup_ios.md)。

> **注意:** 以下部分提供了 Swift 和 Objective-C 的代码示例。在适用情况下，相关说明均以 Swift 方法名作为参考。

### 模型 (Model)

MediaPipe Face Landmarker 任务需要一个与此任务兼容的训练好的模型包。有关 Face Landmarker 的可用训练模型的更多信息，请参阅任务概述的[模型部分](../face_landmarker.md#models)。

选择并下载一个模型，并使用 Xcode 将其添加到您的项目目录中。有关如何将文件添加到 Xcode 项目的说明，请参阅[在 Xcode 项目中管理文件和文件夹](https://developer.apple.com/documentation/xcode/managing-files-and-folders-in-your-xcode-project)。

使用 `BaseOptions.modelAssetPath` 属性指定您的 app bundle 中的模型路径。有关代码示例，请参阅下一节。

## 创建任务 (Create the task)

您可以通过调用其初始化程序之一来创建 Face Landmarker 任务。`FaceLandmarker(options:)` 初始化程序接受配置选项的值。

如果您不需要使用自定义配置选项初始化的 Face Landmarker，您可以使用 `FaceLandmarker(modelPath:)` 初始化程序创建一个使用默认选项的 Face Landmarker。有关配置选项的更多信息，请参阅[配置概述](#configuration)。

Face Landmarker 任务支持 3 种输入数据类型：静态图像、视频文件和实时视频数据流。默认情况下，`FaceLandmarker(modelPath:)` 初始化适用于静态图像的任务。如果您希望您的任务初始化为处理视频文件或实时视频数据流，请使用 `FaceLandmarker(options:)` 来指定视频或实时流运行模式。实时流模式还需要额外的 `faceLandmarkerLiveStreamDelegate` 配置选项，该选项使 Face Landmarker 能够将面部关键点结果异步传递给委托。

选择与您的运行模式对应的选项卡，以查看如何创建任务并运行推理。

### Swift

### 图像 (Image)

```swift
import MediaPipeTasksVision

let modelPath = Bundle.main.path(
  forResource: "face_landmarker",
  ofType: "task")

let options = FaceLandmarkerOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .image
options.minFaceDetectionConfidence = minFaceDetectionConfidence
options.minFacePresenceConfidence = minFacePresenceConfidence
options.minTrackingConfidence = minTrackingConfidence
options.numFaces = numFaces

let faceLandmarker = try FaceLandmarker(options: options)
```

### 视频 (Video)

```swift
import MediaPipeTasksVision

let modelPath = Bundle.main.path(
  forResource: "face_landmarker",
  ofType: "task")

let options = FaceLandmarkerOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .video
options.minFaceDetectionConfidence = minFaceDetectionConfidence
options.minFacePresenceConfidence = minFacePresenceConfidence
options.minTrackingConfidence = minTrackingConfidence
options.numFaces = numFaces

let faceLandmarker = try FaceLandmarker(options: options)
```

### 实时流 (Livestream)

```swift
import MediaPipeTasksVision

// Class that conforms to the `FaceLandmarkerLiveStreamDelegate` protocol and
// implements the method that the face landmarker calls once it finishes
// performing face landmark detection in each input frame.
class FaceLandmarkerResultProcessor: NSObject, FaceLandmarkerLiveStreamDelegate {

  func faceLandmarker(
    _ faceLandmarker: FaceLandmarker,
    didFinishDetection result: FaceLandmarkerResult?,
    timestampInMilliseconds: Int,
    error: Error?) {

    // Process the face landmarker result or errors here.

  }
}

let modelPath = Bundle.main.path(
  forResource: "face_landmarker",
  ofType: "task")

let options = FaceLandmarkerOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .liveStream
options.minFaceDetectionConfidence = minFaceDetectionConfidence
options.minFacePresenceConfidence = minFacePresenceConfidence
options.minTrackingConfidence = minTrackingConfidence
options.numFaces = numFaces

// Assign an object of the class to the `faceLandmarkerLiveStreamDelegate`
// property.
let processor = FaceLandmarkerResultProcessor()
options.faceLandmarkerLiveStreamDelegate = processor

let faceLandmarker = try FaceLandmarker(options: options)
```

### Objective-C

### 图像 (Image)

```objc
@import MediaPipeTasksVision;

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"face_landmarker"
                                                      ofType:@"task"];

MPPFaceLandmarkerOptions *options = [[MPPFaceLandmarkerOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeImage;
options.minFaceDetectionConfidence = minFaceDetectionConfidence;
options.minFacePresenceConfidence = minFacePresenceConfidence;
options.minTrackingConfidence = minTrackingConfidence;
options.numFaces = numFaces;

MPPFaceLandmarker *faceLandmarker =
  [[MPPFaceLandmarker alloc] initWithOptions:options error:nil];
```

### 视频 (Video)

```objc
@import MediaPipeTasksVision;

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"face_landmarker"
                                                      ofType:@"task"];

MPPFaceLandmarkerOptions *options = [[MPPFaceLandmarkerOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeVideo;
options.minFaceDetectionConfidence = minFaceDetectionConfidence;
options.minFacePresenceConfidence = minFacePresenceConfidence;
options.minTrackingConfidence = minTrackingConfidence;
options.numFaces = numFaces;

MPPFaceLandmarker *faceLandmarker =
  [[MPPFaceLandmarker alloc] initWithOptions:options error:nil];
```

### 实时流 (Livestream)

```objc
@import MediaPipeTasksVision;

// Class that conforms to the `MPPFaceLandmarkerLiveStreamDelegate` protocol
// and implements the method that the face landmarker calls once it finishes
// performing face landmark detection in each input frame.
@interface APPFaceLandmarkerResultProcessor : NSObject 

@end

@implementation APPFaceLandmarkerResultProcessor

-   (void)faceLandmarker:(MPPFaceLandmarker *)faceLandmarker
    didFinishDetectionWithResult:(MPPFaceLandmarkerResult *)faceLandmarkerResult
         timestampInMilliseconds:(NSInteger)timestampInMilliseconds
                           error:(NSError *)error {

    // Process the face landmarker result or errors here.

}

@end

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"face_landmarker"
                                                      ofType:@"task"];

MPPFaceLandmarkerOptions *options = [[MPPFaceLandmarkerOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeLiveStream;
options.minFaceDetectionConfidence = minFaceDetectionConfidence;
options.minFacePresenceConfidence = minFacePresenceConfidence;
options.minTrackingConfidence = minTrackingConfidence;
options.numFaces = numFaces;

// Assign an object of the class to the `faceLandmarkerLiveStreamDelegate`
// property.
APPFaceLandmarkerResultProcessor *processor = [APPFaceLandmarkerResultProcessor new];
options.faceLandmarkerLiveStreamDelegate = processor;

MPPFaceLandmarker *faceLandmarker =
  [[MPPFaceLandmarker alloc] initWithOptions:options error:nil];
```

> **注意:** 如果您使用 video 模式或 live stream 模式，Face Landmarker 会使用跟踪功能以避免在每一帧上触发检测模型，这有助于降低延迟。

### 配置选项 (Configuration options)

此任务为 iOS 应用提供以下配置选项：

| 选项名称 (Option name) | 说明 (Description) | 值范围 (Value Range) | 默认值 (Default Value) |
| --- | --- | --- | --- |
| `runningMode` | 设置任务的运行模式。Face Landmarker 有三种模式：IMAGE：用于单张图像输入的模式。VIDEO：用于视频解码帧的模式。LIVE_STREAM：用于输入数据流（例如来自摄像头的实时流）的模式。在这种模式下，必须将 `faceLandmarkerLiveStreamDelegate` 设置为实现 `FaceLandmarkerLiveStreamDelegate` 的类的实例，以异步接收执行面部关键点检测的结果。 | {RunningMode.image, RunningMode.video, RunningMode.liveStream} | {RunningMode.image} |
| `numFaces` | Face Landmarker 可以检测到的最大面部数量。仅当 numFaces 设置为 1 时才应用平滑处理。 | Integer > 0 | 1 |
| `minFaceDetectionConfidence` | 面部检测被视为成功的最低置信度得分。 | Float [0.0,1.0] | 0.5 |
| `minFacePresenceConfidence` | 面部关键点检测中面部存在得分的最低置信度得分。 | Float [0.0,1.0] | 0.5 |
| `minTrackingConfidence` | 面部跟踪被视为成功的最低置信度得分。 | Float [0.0,1.0] | 0.5 |
| `outputFaceBlendshapes` | FaceLandmarker 是否输出面部混合形状 (face blendshapes)。面部混合形状用于渲染 3D 面部模型。<br>**注意:** `*Left` 和 `*Right` 混合形状对应于主体的面部，而不是观察者的方向。传入水平镜像的图像将反转这些输出。 | Bool | false |
| `outputFacialTransformationMatrixes` | FaceLandmarker 是否输出面部变换矩阵。FaceLandmarker 使用矩阵将面部关键点从规范的面部模型变换到检测到的面部，以便用户可以将特效应用在检测到的关键点上。 | Bool | false |

当运行模式设置为 `LIVE_STREAM` 时，Face Landmarker 需要额外的 `faceLandmarkerLiveStreamDelegate` 配置选项，该选项使 Face Landmarker 能够异步传递面部关键点检测结果。该委托必须实现 `faceLandmarker(_:didFinishDetection:timestampInMilliseconds:error:)` 方法，Face Landmarker 会在处理完每帧上的面部关键点检测结果后调用该方法。

| 选项名称 (Option name) | 说明 (Description) | 值范围 (Value Range) | 默认值 (Default Value) |
| --- | --- | --- | --- |
| `faceLandmarkerLiveStreamDelegate` | 使 Face Landmarker 能够在实时流模式下异步接收执行面部关键点检测的结果。其实例被设置为此属性的类必须实现 `faceLandmarker(_:didFinishDetection:timestampInMilliseconds:error:)` 方法。 | 不适用 | 未设置 |

## 准备数据 (Prepare data)

在将输入图像或帧传递给 Face Landmarker 之前，您需要将其转换为 `MPImage` 对象。`MPImage` 支持不同类型的 iOS 图像格式，并可以在任何运行模式下使用它们进行推理。有关 `MPImage` 的更多信息，请参阅 [MPImage API](/edge/api/mediapipe/swift/vision/Classes/MPImage)。

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

该示例使用默认的 [UIImage.Orientation.Up](https://developer.apple.com/documentation/uikit/uiimage/orientation/up) 方向初始化 `MPImage`。您可以使用任何支持的 [UIImage.Orientation](https://developer.apple.com/documentation/uikit/uiimage/orientation) 值来初始化 `MPImage`。Face Landmarker 不支持 `.upMirrored`、`.downMirrored`、`.leftMirrored`、`.rightMirrored` 等镜像方向。

有关 `UIImage` 的更多信息，请参阅 [UIImage Apple Developer Documentation](https://developer.apple.com/documentation/uikit/uiimage)。

### CVPixelBuffer

`CVPixelBuffer` 格式非常适合生成帧并使用 iOS [CoreImage](https://developer.apple.com/documentation/coreimage) 框架进行处理的应用。

`CVPixelBuffer` 格式非常适合以下运行模式：

* 图像：在使用 iOS 的 `CoreImage` 框架进行某些处理后生成 `CVPixelBuffer` 图像的应用程序，可以被发送到图像运行模式下的 Face Landmarker。
* 视频：视频帧可以转换为 `CVPixelBuffer` 格式进行处理，然后在视频模式下发送到 Face Landmarker。
* 实时流 (livestream)：使用 iOS 摄像头生成帧的应用程序在被发送到实时流模式下的 Face Landmarker 之前，可能会被转换为 `CVPixelBuffer` 格式以进行处理。

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

要运行 Face Landmarker，请使用特定于所分配运行模式的 `detect()` 方法：

* 静态图像：`detect(image:)`
* 视频：`detect(videoFrame:timestampInMilliseconds:)`
* 实时流：`detectAsync(image:timestampInMilliseconds:)`

以下代码示例显示了如何在这些不同的运行模式下运行 Face Landmarker 的基本示例：

### Swift

### 图像 (Image)

```swift
let result = try faceLandmarker.detect(image: image)
```

### 视频 (Video)

```swift
let result = try faceLandmarker.detect(
  videoFrame: image,
  timestampInMilliseconds: timestamp)
```

### 实时流 (Live stream)

```swift
try faceLandmarker.detectAsync(
  image: image,
  timestampInMilliseconds: timestamp)
```

### Objective-C

### 图像 (Image)

```objc
MPPFaceLandmarkerResult *result =
  [faceLandmarker detectImage:image error:nil];
```

### 视频 (Video)

```objc
MPPFaceLandmarkerResult *result =
  [faceLandmarker detectVideoFrame:image
           timestampInMilliseconds:timestamp
                             error:nil];
```

### 实时流 (Livestream)

```objc
BOOL success =
  [faceLandmarker detectAsyncImage:image
           timestampInMilliseconds:timestamp
                             error:nil];
```

Face Landmarker 代码示例更详细地显示了这些模式各自的实现：`detect(image:)`、`detect(videoFrame:timestampInMilliseconds:)` 和 `detectAsync(image:timestampInMilliseconds:)`。该示例代码允许用户在处理模式之间切换，这对于您的用例可能并非必要。

请注意以下几点：

* 在视频模式或实时流 (livestream) 模式下运行时，您必须另外向 Face Landmarker 任务提供输入帧的时间戳 (timestamp)。
* 在图像或视频模式下运行时，Face Landmarker 任务会阻塞当前线程，直到其完成对输入图像或帧的处理。为避免阻塞当前线程，请使用 iOS [Dispatch](https://developer.apple.com/documentation/dispatch) 或 [NSOperation](https://developer.apple.com/documentation/foundation/nsoperation) 框架在后台线程中执行处理。如果您的应用是使用 Swift 创建的，您还可以使用 [Swift Concurrency](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/) 执行后台线程。
* 在实时流 (livestream) 模式下运行时，Face Landmarker 任务会立即返回并且不会阻塞当前线程。它在处理完每个输入帧后，都会使用面部关键点检测结果调用 `faceLandmarker(_:didFinishDetection:timestampInMilliseconds:error:)` 方法。Face Landmarker 在专门的串行调度队列 (serial dispatch queue) 上异步调用此方法。为了在用户界面上显示结果，请在处理完结果后将结果分派到主队列 (main queue)。

## 处理和显示结果 (Handle and display results)

在运行推理后，Face Landmarker 会返回一个 `FaceLandmarkerResult`，其中包含每个检测到的面部的面部网格 (face mesh)，以及每个面部关键点的坐标。结果对象还可以选择包含混合形状 (blendshapes)，它表示面部表情，以及用于将面部特效应用到检测到的关键点上的面部变换矩阵。

以下显示了此任务的输出数据示例：

```text
FaceLandmarkerResult:
  face_landmarks:
    NormalizedLandmark #0:
      x: 0.5971359014511108
      y: 0.485361784696579
      z: -0.038440968841314316
    NormalizedLandmark #1:
      x: 0.3302789330482483
      y: 0.29289937019348145
      z: -0.09489090740680695
    ... (478 landmarks for each face)
  face_blendshapes:
    browDownLeft: 0.8296722769737244
    browDownRight: 0.8096957206726074
    browInnerUp: 0.00035583582939580083
    browOuterUpLeft: 0.00035752105759456754
    ... (52 blendshapes for each face)
  facial_transformation_matrixes:
    [9.99158978e-01, -1.23036895e-02, 3.91213447e-02, -3.70770246e-01]
    [1.66496094e-02,  9.93480563e-01, -1.12779640e-01, 2.27719707e+01]
    ...
```

> **注意:** `*Left` 和 `*Right` 混合形状对应于主体的面部，而不是观察者的方向。传入水平镜像的图像将反转这些输出。

下图展示了该任务输出的视图：

![勾勒出面部形状和尺寸的男子面部特征网格](../../../../assets/misc/face_landmarker_output.png)

Face Landmarker 示例代码演示了如何显示任务返回的结果，请参阅 [FaceOverlay.swift](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/face_landmarker/ios/FaceLandmarker/Views/FaceOverlay.swift) 以了解更多详细信息。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*
