---
title: "手势识别 iOS 指南 (Gesture recognition guide for iOS)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer/ios"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-08 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 手势识别 iOS 指南 (Gesture recognition guide for iOS)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer/ios)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 手势识别器 (Gesture Recognizer) 任务可让您实时识别手势，并提供识别出的手势结果和检测到的手部关键点 (landmarks)。这些说明向您展示如何在 iOS 应用程序中使用手势识别器。

您可以通过查看 [Web 演示](https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/gesture_recognizer) 来了解此任务的实际运行情况。有关此任务的功能、模型和配置选项的更多信息，请参阅[总览 (Overview)](../gesture_recognizer.md)。

## 代码示例 (Code example)

MediaPipe Tasks 示例代码是 iOS 手势识别器应用的基本实现。该示例使用物理 iOS 设备上的摄像头持续检测手势，还可以使用设备图库中的图像和视频静态地检测手势。

您可以将该应用作为您自己的 iOS 应用的起点，或者在修改现有应用时参考它。手势识别器示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/gesture_recognizer/ios) 上。

### 下载代码 (Download the code)

以下说明向您展示如何使用 [git](https://git-scm.com) 命令行工具创建示例代码的本地副本。

要下载示例代码：

1.  使用以下命令克隆 git 仓库：

    ```bash
    git clone https://github.com/google-ai-edge/mediapipe-samples
    ```

2.  （可选）配置您的 git 实例使用稀疏检出 (sparse checkout)，以便只保留手势识别器示例应用的文件：

    ```bash
    cd mediapipe-samples
    git sparse-checkout init --cone
    git sparse-checkout set examples/gesture_recognizer/ios/
    ```

创建示例代码的本地版本后，您可以在 Xcode 中打开项目并运行应用。有关说明，请参阅 [iOS 环境配置指南 (Setup Guide for iOS)](../../setup_ios.md)。

### 核心组件 (Key components)

以下文件包含手势识别示例应用程序的核心代码：

*   [GestureRecognizerService.swift](https://github.com/googlesamples/mediapipe/blob/main/examples/gesture_recognizer/ios/GestureRecognizer/Services/GestureRecognizerService.swift)：初始化手势识别器，处理模型选择，并在输入数据上运行推理。
*   [CameraViewController.swift](https://github.com/googlesamples/mediapipe/blob/main/examples/gesture_recognizer/ios/GestureRecognizer/ViewContoller/CameraViewController.swift)：实现实时摄像头输入的 UI 并可视化结果。
*   [MediaLibraryViewController.swift](https://github.com/googlesamples/mediapipe/blob/main/examples/gesture_recognizer/ios/GestureRecognizer/ViewContoller/MediaLibraryViewController.swift)：实现静态图像和视频文件输入的 UI 并可视化结果。

## 环境配置 (Setup)

本节描述了专为使用手势识别器而设置开发环境和代码项目的关键步骤。有关设置 MediaPipe 任务开发环境（包括平台版本要求）的一般信息，请参阅 [iOS 环境配置指南 (Setup guide for iOS)](../../setup_ios.md)。

### 依赖项 (Dependencies)

手势识别器使用 `MediaPipeTasksVision` 库，可以使用 [Swift Package Manager](https://github.com/swiftlang/swift-package-manager) (SPM) 进行安装。该库与 Swift 和 Objective-C 应用兼容，无需任何额外的语言特定设置。

要将 `MediaPipeTasksVision` 库添加到您的 Xcode 项目中：

1.  在 Xcode 中打开您的项目，选择 **File > Add Package Dependencies...**。
2.  在右上角的搜索字段中，输入仓库 URL：`https://github.com/google-ai-edge/mediapipe`
3.  选择 `mediapipe` 包并选择您的依赖规则（例如，**Up to Next Major Version** 或 `master` 分支）。
4.  点击 **Add Package**，然后选择 `MediaPipeTasksVision` 并将其添加到您的应用程序目标 (target) 中。

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
        name: "MyGestureRecognizerApp",
        dependencies: [
            .product(name: "MediaPipeTasksVision", package: "mediapipe"),
        ]
    ),
]
```

有关配置依赖项的更多信息，请参阅 [iOS 环境配置指南 (Setup guide for iOS)](../../setup_ios.md)。

> **注意：** 以下部分提供了 Swift 和 Objective-C 的代码示例。适用的情况下，说明将引用 Swift 方法名称。

### 模型 (Model)

MediaPipe 手势识别器任务需要一个与该任务兼容的已训练的模型。有关手势识别器可用预训练模型的更多信息，请参阅任务总览中的[模型部分 (Models section)](../gesture_recognizer.md#models)。

选择并下载模型，然后使用 Xcode 将其添加到您的项目目录中。有关如何向 Xcode 项目添加文件的说明，请参阅[在 Xcode 项目中管理文件和文件夹 (Managing files and folders in your Xcode project)](https://developer.apple.com/documentation/xcode/managing-files-and-folders-in-your-xcode-project)。

使用 `BaseOptions.modelAssetPath` 属性指定应用程序包 (app bundle) 中模型的路径。有关代码示例，请参阅下一节。

## 创建任务 (Create the task)

您可以通过调用其初始化器 (initializers) 之一来创建手势识别器任务。`GestureRecognizer(options:)` 初始化器接受配置选项的值。

如果您不需要使用自定义配置选项初始化的手势识别器，则可以使用 `GestureRecognizer(modelPath:)` 初始化器创建一个具有默认选项的手势识别器。有关配置选项的更多信息，请参阅[配置总览 (Configuration Overview)](#configuration_options)。

手势识别器任务支持 3 种输入数据类型：静态图像、视频文件和实时视频流。默认情况下，`GestureRecognizer(modelPath:)` 会初始化一个用于静态图像的任务。如果您希望您的任务被初始化以处理视频文件或实时视频流，请使用 `GestureRecognizer(options:)` 指定视频或实时流运行模式。实时流模式还需要额外的 `gestureRecognizerLiveStreamDelegate` 配置选项，它使手势识别器能够将手势识别结果异步传递给委托 (delegate)。

选择与您的运行模式相对应的选项卡，以查看如何创建任务并运行推理。

### Swift

### 图像 (Image)

```swift
import MediaPipeTasksVision

let modelPath = Bundle.main.path(forResource: "gesture_recognizer",
                                      ofType: "task")

let options = GestureRecognizerOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .image
options.minHandDetectionConfidence = minHandDetectionConfidence
options.minHandPresenceConfidence = minHandPresenceConfidence
options.minTrackingConfidence = minHandTrackingConfidence
options.numHands = numHands

let gestureRecognizer = try GestureRecognizer(options: options)
```

### 视频 (Video)

```swift
import MediaPipeTasksVision

let modelPath = Bundle.main.path(forResource: "gesture_recognizer",
                                      ofType: "task")

let options = GestureRecognizerOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .video
options.minHandDetectionConfidence = minHandDetectionConfidence
options.minHandPresenceConfidence = minHandPresenceConfidence
options.minTrackingConfidence = minHandTrackingConfidence
options.numHands = numHands

let gestureRecognizer = try GestureRecognizer(options: options)
```

### 实时流 (Livestream)

```swift
import MediaPipeTasksVision

// Class that conforms to the `GestureRecognizerLiveStreamDelegate` protocol and
// implements the method that the gesture recognizer calls once it finishes
// performing recognizing hand gestures in each input frame.
class GestureRecognizerResultProcessor: NSObject, GestureRecognizerLiveStreamDelegate {

  func gestureRecognizer(
    _ gestureRecognizer: GestureRecognizer,
    didFinishRecognition result: GestureRecognizerResult?,
    timestampInMilliseconds: Int,
    error: Error?) {

    // Process the gesture recognizer result or errors here.

  }
}

let modelPath = Bundle.main.path(
  forResource: "gesture_recognizer",
  ofType: "task")

let options = GestureRecognizerOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .liveStream
options.minHandDetectionConfidence = minHandDetectionConfidence
options.minHandPresenceConfidence = minHandPresenceConfidence
options.minTrackingConfidence = minHandTrackingConfidence
options.numHands = numHands

// Assign an object of the class to the `gestureRecognizerLiveStreamDelegate`
// property.
let processor = GestureRecognizerResultProcessor()
options.gestureRecognizerLiveStreamDelegate = processor

let gestureRecognizer = try GestureRecognizer(options: options)
```

### Objective-C

### 图像 (Image)

```objc
@import MediaPipeTasksVision;

NSString *modelPath =
  [[NSBundle mainBundle] pathForResource:@"gesture_recognizer"
                                  ofType:@"task"];

MPPGestureRecognizerOptions *options =
  [[MPPGestureRecognizerOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeImage;
options.minHandDetectionConfidence = minHandDetectionConfidence
options.minHandPresenceConfidence = minHandPresenceConfidence
options.minTrackingConfidence = minHandTrackingConfidence
options.numHands = numHands

MPPGestureRecognizer *gestureRecognizer =
      [[MPPGestureRecognizer alloc] initWithOptions:options error:nil];
```

### 视频 (Video)

```objc
@import MediaPipeTasksVision;

NSString *modelPath =
  [[NSBundle mainBundle] pathForResource:@"gesture_recognizer"
                                  ofType:@"task"];

MPPGestureRecognizerOptions *options =
  [[MPPGestureRecognizerOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeVideo;
options.minHandDetectionConfidence = minHandDetectionConfidence
options.minHandPresenceConfidence = minHandPresenceConfidence
options.minTrackingConfidence = minHandTrackingConfidence
options.numHands = numHands

MPPGestureRecognizer *gestureRecognizer =
      [[MPPGestureRecognizer alloc] initWithOptions:options error:nil];
```

### 实时流 (Livestream)

```objc
@import MediaPipeTasksVision;

// Class that conforms to the `MPPGestureRecognizerLiveStreamDelegate` protocol
// and implements the method that the gesture recognizer calls once it finishes
// performing gesture recognition on each input frame.

@interface APPGestureRecognizerResultProcessor : NSObject 

@end

@implementation APPGestureRecognizerResultProcessor

-   (void)gestureRecognizer:(MPPGestureRecognizer *)gestureRecognizer
    didFinishRecognitionWithResult:(MPPGestureRecognizerResult *)gestureRecognizerResult
           timestampInMilliseconds:(NSInteger)timestampInMilliseconds
                             error:(NSError *)error {

    // Process the gesture recognizer result or errors here.

}

@end

NSString *modelPath =
  [[NSBundle mainBundle] pathForResource:@"gesture_recognizer"
                                  ofType:@"task"];

MPPGestureRecognizerOptions *options =
  [[MPPGestureRecognizerOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeLiveStream;
options.minHandDetectionConfidence = minHandDetectionConfidence
options.minHandPresenceConfidence = minHandPresenceConfidence
options.minTrackingConfidence = minHandTrackingConfidence
options.numHands = numHands

// Assign an object of the class to the `gestureRecognizerLiveStreamDelegate`
// property.
APPGestureRecognizerResultProcessor *processor =
  [APPGestureRecognizerResultProcessor new];
options.gestureRecognizerLiveStreamDelegate = processor;

MPPGestureRecognizer *gestureRecognizer =
      [[MPPGestureRecognizer alloc] initWithOptions:options error:nil];
```

> **注意：** 如果使用视频模式或实时流模式，手势识别器会使用跟踪算法，以避免在每一帧上触发手掌检测模型，这有助于降低延迟。

### 配置选项 (Configuration options)

此任务具有针对 iOS 应用的以下配置选项：

| 选项名称 | 描述 | 取值范围 | 默认值 |
| --- | --- | --- | --- |
| `runningMode` | 设置任务的运行模式。共有三种模式：<br> `IMAGE`：用于单张图像输入的模式。<br> `VIDEO`：用于视频解码帧的模式。<br> `LIVE_STREAM`：用于输入数据实时流（例如来自摄像头）的模式。在此模式下，必须调用 `resultListener` 来设置侦听器以异步接收结果。在此模式下，必须将 `gestureRecognizerLiveStreamDelegate` 设置为实现了 `GestureRecognizerLiveStreamDelegate` 类的实例，以便异步接收手势识别执行的结果。 | {`RunningMode.image`, `RunningMode.video`, `RunningMode.liveStream`} | `RunningMode.image` |
| `num_hands` | `GestureRecognizer` 可以检测到的最大手部数量。 | `任何整数 > 0` | `1` |
| `min_hand_detection_confidence` | 在手掌检测模型中，手部检测被认为成功的最低置信度分数。 | `0.0 - 1.0` | `0.5` |
| `min_hand_presence_confidence` | 手部关键点检测模型中手部存在分数的最低置信度分数。在手势识别器的视频模式和实时流模式下，如果手部关键点模型的手部存在置信度分数低于此阈值，则会触发手掌检测模型。否则，使用轻量级手部跟踪算法来确定随后进行关键点检测的手部位置。 | `0.0 - 1.0` | `0.5` |
| `min_tracking_confidence` | 手部跟踪被认为成功的最低置信度分数。这是当前帧和上一帧中手部之间的边界框 IoU 阈值。在手势识别器的视频模式和流模式下，如果跟踪失败，手势识别器会触发手部检测。否则，跳过手部检测。 | `0.0 - 1.0` | `0.5` |
| `canned_gestures_classifier_options` | 用于配置预制手势分类器行为的选项。预制手势有 `["None", "Closed_Fist", "Open_Palm", "Pointing_Up", "Thumb_Down", "Thumb_Up", "Victory", "ILoveYou"]`<br> - Display names locale（显示名称区域设置）：如果有的话，通过 TFLite 模型元数据指定的用于显示名称的区域设置。<br> - Max results（最大结果数）：要返回的得分最高的分类结果的最大数量。如果 < 0，将返回所有可用结果。<br> - Score threshold（分数阈值）：结果被拒绝的分数下限。如果设置为 0，将返回所有可用结果。<br> - Category allowlist（类别允许列表）：类别名称的允许列表。如果非空，类别不在此集合中的分类结果将被过滤掉。与拒绝列表互斥。<br> - Category denylist（类别拒绝列表）：类别名称的拒绝列表。如果非空，类别在此集合中的分类结果将被过滤掉。与允许列表互斥。 | * Display names locale：`任意字符串` <br> * Max results：`任意整数` <br> * Score threshold：`0.0-1.0` <br> * Category allowlist：`字符串向量 (vector of strings)` <br> * Category denylist：`字符串向量 (vector of strings)` | * Display names locale：`"en"` <br> * Max results：`-1` <br> * Score threshold：`0` <br> * Category allowlist：空 <br> * Category denylist：空 |
| `custom_gestures_classifier_options` | 用于配置自定义手势分类器行为的选项。<br> - Display names locale（显示名称区域设置）：如果有的话，通过 TFLite 模型元数据指定的用于显示名称的区域设置。<br> - Max results（最大结果数）：要返回的得分最高的分类结果的最大数量。如果 < 0，将返回所有可用结果。<br> - Score threshold（分数阈值）：结果被拒绝的分数下限。如果设置为 0，将返回所有可用结果。<br> - Category allowlist（类别允许列表）：类别名称的允许列表。如果非空，类别不在此集合中的分类结果将被过滤掉。与拒绝列表互斥。<br> - Category denylist（类别拒绝列表）：类别名称的拒绝列表。如果非空，类别在此集合中的分类结果将被过滤掉。与允许列表互斥。 | * Display names locale：`任意字符串` <br> * Max results：`任意整数` <br> * Score threshold：`0.0-1.0` <br> * Category allowlist：`字符串向量 (vector of strings)` <br> * Category denylist：`字符串向量 (vector of strings)` | * Display names locale：`"en"` <br> * Max results：`-1` <br> * Score threshold：`0` <br> * Category allowlist：空 <br> * Category denylist：空 |
| `result_listener` | 设置结果侦听器，以便在手势识别器处于实时流模式时异步接收分类结果。仅在运行模式设置为 `LIVE_STREAM` 时使用。 | `ResultListener` | N/A |

当运行模式设置为实时流时，手势识别器需要额外的 `gestureRecognizerLiveStreamDelegate` 配置选项，该选项使手势识别器能够异步提供手势识别结果。委托必须实现 `gestureRecognizer(_:didFinishRecognition:timestampInMilliseconds:error:)` 方法，手势识别器在处理每帧上的手势识别结果后会调用该方法。

| 选项名称 | 描述 | 取值范围 | 默认值 |
| --- | --- | --- | --- |
| `gestureRecognizerLiveStreamDelegate` | 使手势识别器能够在实时流模式下异步接收手势识别结果。将其实例设置为此属性的类必须实现 `gestureRecognizer(_:didFinishRecognition:timestampInMilliseconds:error:)` 方法。 | 不适用 | 未设置 |

## 准备数据 (Prepare data)

在将输入图像或帧传递给手势识别器之前，您需要将其转换为 `MPImage` 对象。`MPImage` 支持不同类型的 iOS 图像格式，并且可以在任何运行模式下使用它们进行推理。有关 `MPImage` 的更多信息，请参阅 [MPImage API](/edge/api/mediapipe/swift/vision/Classes/MPImage)。

根据您的用例和应用程序所需的运行模式选择 iOS 图像格式。`MPImage` 接受 `UIImage`、`CVPixelBuffer` 和 `CMSampleBuffer` 这几种 iOS 图像格式。

### UIImage

`UIImage` 格式非常适合以下运行模式：

*   图像：可以将来自应用程序包、用户图库或文件系统的格式化为 `UIImage` 的图像转换为 `MPImage` 对象。
*   视频：使用 [AVAssetImageGenerator](https://developer.apple.com/documentation/avfoundation/avassetimagegenerator) 将视频帧提取为 [CGImage](https://developer.apple.com/documentation/coregraphics/cgimage) 格式，然后将它们转换为 `UIImage` 图像。

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

该示例使用默认的 [UIImage.Orientation.Up](https://developer.apple.com/documentation/uikit/uiimage/orientation/up) 方向初始化了一个 `MPImage`。您可以使用任何受支持的 [UIImage.Orientation](https://developer.apple.com/documentation/uikit/uiimage/orientation) 值初始化 `MPImage`。手势识别器不支持镜像方向，如 `.upMirrored`、`.downMirrored`、`.leftMirrored`、`.rightMirrored`。

有关 `UIImage` 的更多信息，请参阅 [UIImage Apple 开发者文档](https://developer.apple.com/documentation/uikit/uiimage)。

### CVPixelBuffer

`CVPixelBuffer` 格式非常适合生成帧并使用 iOS [CoreImage](https://developer.apple.com/documentation/coreimage) 框架进行处理的应用程序。

`CVPixelBuffer` 格式非常适合以下运行模式：

*   图像：在使用 iOS 的 `CoreImage` 框架进行一些处理后生成 `CVPixelBuffer` 图像的应用程序，可以在图像运行模式下将其发送给手势识别器。
*   视频：可以将视频帧转换为 `CVPixelBuffer` 格式进行处理，然后在视频模式下发送给手势识别器。
*   实时流：使用 iOS 摄像头生成帧的应用程序可以在进行处理时先将其转换为 `CVPixelBuffer` 格式，然后再在实时流模式下发送给手势识别器。

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

有关 `CVPixelBuffer` 的更多信息，请参阅 [CVPixelBuffer Apple 开发者文档](https://developer.apple.com/documentation/corevideo/cvpixelbuffer-q2e)。

### CMSampleBuffer

`CMSampleBuffer` 格式存储统一媒体类型的媒体样本，非常适合实时流运行模式。来自 iOS 摄像头的实时帧通过 iOS [AVCaptureVideoDataOutput](https://developer.apple.com/documentation/avfoundation/avcapturevideodataoutput) 以 `CMSampleBuffer` 格式异步传递。

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

有关 `CMSampleBuffer` 的更多信息，请参阅 [CMSampleBuffer Apple 开发者文档](https://developer.apple.com/documentation/coremedia/cmsamplebuffer)。

## 运行任务 (Run the task)

要运行手势识别器，请使用特定于所分配运行模式的 `recognize()` 方法：

*   静态图像：`recognize(image:)`
*   视频：`recognize(videoFrame:timestampInMilliseconds:)`
*   实时流：`recognizeAsync(image:timestampInMilliseconds:)`

以下代码示例显示了如何在这些不同运行模式下运行手势识别器的基本示例：

### Swift

### 图像 (Image)

```swift
let result = try gestureRecognizer.recognize(image: image)
```

### 视频 (Video)

```swift
let result = try gestureRecognizer.recognize(
  videoFrame: image,
  timestampInMilliseconds: timestamp)
```

### 实时流 (Livestream)

```swift
try gestureRecognizer.recognizeAsync(
  image: image,
  timestampInMilliseconds: timestamp)
```

### Objective-C

### 图像 (Image)

```objc
  MPPGestureRecognizerResult *result =
    [gestureRecognizer recognizeImage:mppImage
                                error:nil];
```

### 视频 (Video)

```objc
MPPGestureRecognizerResult *result =
  [gestureRecognizer recognizeVideoFrame:image
                 timestampInMilliseconds:timestamp
                                   error:nil];
```

### 实时流 (Livestream)

```objc
BOOL success =
  [gestureRecognizer recognizeAsyncImage:image
                 timestampInMilliseconds:timestamp
                                   error:nil];
```

该示例代码允许用户在处理模式之间进行切换，这在您的用例中可能并非必需。

请注意以下事项：

*   在视频模式或实时流模式下运行时，您还必须向手势识别器任务提供输入帧的时间戳。
*   在图像或视频模式下运行时，手势识别器任务会阻塞当前线程，直到完成输入图像或帧的处理。为了避免阻塞当前线程，请使用 iOS [Dispatch](https://developer.apple.com/documentation/dispatch) 或 [NSOperation](https://developer.apple.com/documentation/foundation/nsoperation) 框架在后台线程中执行处理。
*   在实时流模式下运行时，手势识别器任务会立即返回并且不会阻塞当前线程。在处理完每一帧输入后，它会使用手势识别结果调用 `gestureRecognizer(_:didFinishRecognition:timestampInMilliseconds:error:)` 方法。手势识别器在一个专用的串行调度队列 (serial dispatch queue) 上异步调用此方法。要在用户界面上显示结果，请在处理结果后将结果调度到主队列 (main queue)。如果在手势识别器任务正忙于处理另一帧时调用 `recognizeAsync` 函数，手势识别器将忽略新的输入帧。

## 处理和显示结果 (Handle and display results)

在运行推理后，手势识别器任务返回一个 `GestureRecognizerResult`，其中包含图像坐标中的手部关键点、世界坐标中的手部关键点、惯用手（左手/右手）以及检测到的手部的手势类别。

以下显示了此任务的输出数据示例：

产生的 `GestureRecognizerResult` 包含四个组件，每个组件都是一个数组，其中每个元素包含单只检测到的手部的检测结果。

*   Handedness（惯用手）

    惯用手代表检测到的手是左手还是右手。
*   Gestures（手势）

    检测到的手部被识别出的手势类别。
*   Landmarks（关键点）

    共有 21 个手部关键点，每个关键点由 `x`、`y` 和 `z` 坐标组成。`x` 和 `y` 坐标分别由图像宽度和高度归一化到 [0.0, 1.0]。`z` 坐标代表关键点深度，以手腕处的深度作为原点。值越小，关键点离相机越近。`z` 的大小比例与 `x` 大致相同。
*   World Landmarks（世界坐标关键点）

    这 21 个手部关键点也以世界坐标呈现。每个关键点由 `x`、`y` 和 `z` 组成，表示以手部几何中心为原点、单位为米的真实世界 3D 坐标。

```
GestureRecognizerResult:
  Handedness:
    Categories #0:
      index        : 0
      score        : 0.98396
      categoryName : Left
  Gestures:
    Categories #0:
      score        : 0.76893
      categoryName : Thumb_Up
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

下图显示了任务输出的可视化：

![呈现比出大拇指朝上手势的手，并在手上映射出骨骼结构](../../../../assets/misc/ios/gesture-recognizer.png)

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*
