---
title: "物体检测 (Object Detector) - iOS"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/object_detector/ios"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2024-04-03 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 物体检测 (Object Detector) - iOS

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/object_detector/ios)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

物体检测 (Object Detector) 任务允许您检测多种类别物体的存在和位置。例如，物体检测可以定位图像中的狗。这些说明向您展示了如何在 iOS 中使用物体检测任务。这些说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/object_detection/ios) 上找到。

您可以通过查看此 [Web 演示](https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/object_detector) 来看看此任务的实际效果。有关此任务的功能、模型和配置选项的更多信息，请参阅[概述](../object_detector.md)。

## 代码示例 (Code example)

MediaPipe Tasks 示例代码是适用于 iOS 的物体检测应用程序的基本实现。该示例使用物理 iOS 设备上的摄像头持续检测物体，也可以使用设备图库中的图像和视频进行静态物体检测。

您可以将此应用作为您自己 iOS 应用的起点，或者在修改现有应用时参考它。物体检测示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/object_detection/ios) 上。

### 下载代码 (Download the code)

以下说明向您展示如何使用 [git](https://git-scm.com) 命令行工具创建示例代码的本地副本。

下载示例代码的步骤：

1. 使用以下命令克隆 git 仓库：

   ```
   git clone https://github.com/google-ai-edge/mediapipe-samples
   ```
2. 此外，您可以配置您的 git 实例使用稀疏检出 (sparse checkout)，这样您就只有物体检测示例应用的文件：

   ```
   cd mediapipe-samples
   git sparse-checkout init --cone
   git sparse-checkout set examples/object_detection/ios/
   ```

创建示例代码的本地版本后，您可以在 Xcode 中打开项目并运行应用。有关说明，请参阅 [iOS 环境配置指南](../../setup_ios.md)。

### 关键组件 (Key components)

以下文件包含物体检测示例应用的关键代码：

* [ObjectDetectorService.swift](https://github.com/googlesamples/mediapipe/blob/main/examples/object_detection/ios/ObjectDetector/Services/ObjectDetectorService.swift): 初始化检测器，处理模型选择并在输入数据上运行推理。
* [CameraViewController.swift](https://github.com/googlesamples/mediapipe/blob/main/examples/object_detection/ios/ObjectDetector/ViewControllers/CameraViewController.swift): 为实时摄像头视频流输入模式实现 UI 并可视化检测结果。
* [MediaLibraryViewController.swift](https://github.com/googlesamples/mediapipe/blob/main/examples/object_detection/ios/ObjectDetector/ViewControllers/MediaLibraryViewController.swift): 为静态图像和视频文件输入模式实现 UI 并可视化检测结果。

## 设置 (Setup)

本节介绍设置开发环境和代码项目以使用物体检测的关键步骤。有关设置使用 MediaPipe 任务的开发环境的一般信息，包括平台版本要求，请参阅 [iOS 环境配置指南](../../setup_ios.md)。

### 依赖项 (Dependencies)

物体检测使用 `MediaPipeTasksVision` 库，可以使用 [Swift Package Manager](https://github.com/swiftlang/swift-package-manager) (SPM) 安装。该库兼容 Swift 和 Objective-C 应用，不需要任何额外的语言特定设置。

要将 `MediaPipeTasksVision` 库添加到您的 Xcode 项目：

1. 在 Xcode 中打开您的项目，选择 **File > Add Package Dependencies...**。
2. 在右上角的搜索字段中，输入仓库 URL：`https://github.com/google-ai-edge/mediapipe`
3. 选择 `mediapipe` 包并选择您的依赖规则（例如，**Up to Next Major Version** 或 `master` 分支）。
4. 点击 **Add Package**，然后选择 `MediaPipeTasksVision` 并将其添加到您的应用程序 target。

如果您使用 `Package.swift` 文件，请使用以下代码添加 MediaPipe 包和 `MediaPipeTasksVision` target 依赖项：

```
dependencies: [
    .package(
        url: "https://github.com/google-ai-edge/mediapipe",
        branch: "master"
    ),
],
targets: [
    .target(
        name: "MyObjectDetectorApp",
        dependencies: [
            .product(name: "MediaPipeTasksVision", package: "mediapipe"),
        ]
    ),
]
```

有关配置依赖项的更多信息，请参阅 [iOS 环境配置指南](../../setup_ios.md)。

> **注意：** 以下部分提供了 Swift 和 Objective-C 的代码示例。在适用的情况下，说明引用了 Swift 的方法名称。

### 模型 (Model)

MediaPipe 物体检测任务需要一个与此任务兼容的训练好的模型。有关物体检测可用预训练模型的更多信息，请参阅任务概述的[模型](../object_detector.md#models)部分。

选择并下载模型，然后使用 Xcode 将其添加到您的项目目录中。有关如何将文件添加到 Xcode 项目的说明，请参阅[在您的 Xcode 项目中管理文件和文件夹](https://developer.apple.com/documentation/xcode/managing-files-and-folders-in-your-xcode-project)。

使用 `BaseOptions.modelAssetPath` 属性指定模型在应用程序包中的路径。有关代码示例，请参阅下一节。

## 创建任务 (Create the task)

您可以通过调用其初始化器之一来创建物体检测任务。`ObjectDetector(options:)` 初始化器设置配置选项的值，包括运行模式、显示名称语言区域、最大结果数量、置信度阈值、类别白名单和黑名单。

如果您不需要使用自定义配置选项初始化的物体检测，则可以使用 `ObjectDetector(modelPath:)` 初始化器创建一个具有默认选项的物体检测。有关配置选项的更多信息，请参阅[配置选项概述](#configuration_options)。

物体检测任务支持 3 种输入数据类型：静态图像、视频文件和实时视频流。默认情况下，`ObjectDetector(modelPath:)` 初始化用于静态图像的任务。如果您希望您的任务初始化为处理视频文件或实时视频流，请使用 `ObjectDetector(options:)` 指定视频或实时流运行模式。实时流模式还需要额外的 `objectDetectorLiveStreamDelegate` 配置选项，该选项使物体检测能够将检测结果异步传送到委托。

选择与您的运行模式对应的选项卡以查看如何创建任务和运行推理。

### Swift

### 图像 (Image)

```
import MediaPipeTasksVision

let modelPath = Bundle.main.path(forResource: "model",
                                      ofType: "tflite")

let options = ObjectDetectorOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .image
options.maxResults = 5

let objectDetector = try ObjectDetector(options: options)
```

### 视频 (Video)

```
import MediaPipeTasksVision

let modelPath = Bundle.main.path(forResource: "model",
                                      ofType: "tflite")

let options = ObjectDetectorOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .video
options.maxResults = 5

let objectDetector = try ObjectDetector(options: options)
```

### 实时流 (Live stream)

```
import MediaPipeTasksVision

// Class that conforms to the `ObjectDetectorLiveStreamDelegate` protocol and
// implements the method that the object detector calls once it
// finishes performing detection on each input frame.
class ObjectDetectorResultProcessor: NSObject, ObjectDetectorLiveStreamDelegate {

  func objectDetector(
    _ objectDetector: ObjectDetector,
    didFinishDetection objectDetectionResult: ObjectDetectorResult?,
    timestampInMilliseconds: Int,
    error: Error?) {
    // Process the detection result or errors here.
  }
}

let modelPath = Bundle.main.path(forResource: "model",
                                      ofType: "tflite")

let options = ObjectDetectorOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .liveStream
options.maxResults = 5

// Assign an object of the class to the `objectDetectorLiveStreamDelegate`
// property.
let processor = ObjectDetectorResultProcessor()
options.objectDetectorLiveStreamDelegate = processor

let objectDetector = try ObjectDetector(options: options)
```

### Objective-C

### 图像 (Image)

```
@import MediaPipeTasksVision;

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"model"
                                                      ofType:@"tflite"];

MPPObjectDetectorOptions *options = [[MPPObjectDetectorOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeImage;
options.maxResults = 5;

MPPObjectDetector *objectDetector =
      [[MPPObjectDetector alloc] initWithOptions:options error:nil];
```

### 视频 (Video)

```
@import MediaPipeTasksVision;

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"model"
                                                      ofType:@"tflite"];

MPPObjectDetectorOptions *options = [[MPPObjectDetectorOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeVideo;
options.maxResults = 5;

MPPObjectDetector *objectDetector =
      [[MPPObjectDetector alloc] initWithOptions:options error:nil];
```

### 实时流 (Live stream)

```
@import MediaPipeTasksVision;

// Class that conforms to the `ObjectDetectorLiveStreamDelegate` protocol and
// implements the method that the object detector calls once it
// finishes performing detection on each input frame.

@interface APPObjectDetectorResultProcessor : NSObject 

@end

@implementation MPPObjectDetectorResultProcessor

-   (void)objectDetector:(MPPObjectDetector *)objectDetector
    didFinishDetectionWithResult:(MPPObjectDetectorResult *)ObjectDetectorResult
         timestampInMilliseconds:(NSInteger)timestampInMilliseconds
                           error:(NSError *)error {

    // Process the detection result or errors here.

}

@end

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"model"
                                                      ofType:@"tflite"];

MPPObjectDetectorOptions *options = [[MPPObjectDetectorOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeLiveStream;
options.maxResults = 5;

// Assign an object of the class to the `objectDetectorLiveStreamDelegate`
// property.
APPObjectDetectorResultProcessor *processor = [APPObjectDetectorResultProcessor new];
options.objectDetectorLiveStreamDelegate = processor;

MPPObjectDetector *objectDetector =
      [[MPPObjectDetector alloc] initWithOptions:options error:nil];
```

### 配置选项 (Configuration options)

此任务具有针对 iOS 应用的以下配置选项：

| 选项名称 | 描述 | 值范围 | 默认值 |
| --- | --- | --- | --- |
| `runningMode` | 设置任务的运行模式。有三种模式：<br> `IMAGE`：单张图像输入的模式。<br> `VIDEO`：视频解码帧的模式。<br> `LIVE_STREAM`：输入数据（例如来自相机）的实时流模式。在此模式下，必须调用 `resultListener` 来设置异步接收结果的监听器。 | {`RunningMode.image`, `RunningMode.video`, `RunningMode.liveStream`} | `RunningMode.image` |
| `displayNamesLocales` | 设置模型元数据中提供的显示名称的标签语言（如果可用）。默认为 `en`（英语）。您可以使用 [TensorFlow Lite Metadata Writer API](https://ai.google.dev/edge/lite/models/metadata_writer_tutorial) 向自定义模型的元数据中添加本地化标签。 | 区域代码 | `en` |
| `maxResults` | 设置要返回的可选最高得分检测结果的最大数量。 | 任意正数 | -1（返回所有结果） |
| `scoreThreshold` | 设置覆盖模型元数据中提供（如果有）的预测分数阈值。低于此值的结果将被拒绝。 | 任意浮点数 | 未设置 |
| `categoryAllowlist` | 设置允许的类别名称的可选列表。如果非空，则类别名称不在此集合中的检测结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `categoryDenylist` 互斥，同时使用两者将导致错误。 | 任意字符串 | 未设置 |
| `categoryDenylist` | 设置不允许的类别名称的可选列表。如果非空，则类别名称在此集合中的检测结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `categoryAllowlist` 互斥，同时使用两者将导致错误。 | 任意字符串 | 未设置 |

#### 实时流配置 (Livestream configuration)

当运行模式设置为实时流时，物体检测需要额外的 `objectDetectorLiveStreamDelegate` 配置选项，该选项使检测器能够异步提供检测结果。委托实现 `objectDetector(_objectDetector:didFinishDetection:timestampInMilliseconds:error:)` 方法，物体检测在处理每帧的检测结果后会调用该方法。

| 选项名称 | 描述 | 值范围 | 默认值 |
| --- | --- | --- | --- |
| `objectDetectorLiveStreamDelegate` | 启用物体检测在实时流模式下异步接收检测结果。其实例设置为此属性的类必须实现 `objectDetector(_:didFinishDetection:timestampInMilliseconds:error:)` 方法。 | 不适用 | 未设置 |

## 准备数据 (Prepare data)

您需要将输入图像或帧转换为 `MPImage` 对象，然后再将其传递给物体检测。`MPImage` 支持不同类型的 iOS 图像格式，并可在任何运行模式下使用它们进行推理。有关 `MPImage` 的更多信息，请参阅 [MPImage API](/edge/api/mediapipe/swift/vision/Classes/MPImage)。

根据您的用例和应用程序需要的运行模式选择 iOS 图像格式。`MPImage` 接受 `UIImage`、`CVPixelBuffer` 和 `CMSampleBuffer` iOS 图像格式。

### UIImage

`UIImage` 格式非常适合以下运行模式：

* 图像：应用程序包、用户图库或文件系统中格式化为 `UIImage` 的图像可以转换为 `MPImage` 对象。
* 视频：使用 [AVAssetImageGenerator](https://developer.apple.com/documentation/avfoundation/avassetimagegenerator) 将视频帧提取为 [CGImage](https://developer.apple.com/documentation/coregraphics/cgimage) 格式，然后将它们转换为 `UIImage` 图像。

### Swift

```
// Load an image on the user's device as an iOS `UIImage` object.

// Convert the `UIImage` object to a MediaPipe's Image object having the default
// orientation `UIImage.Orientation.up`.
let image = try MPImage(uiImage: image)
```

### Objective-C

```
// Load an image on the user's device as an iOS `UIImage` object.

// Convert the `UIImage` object to a MediaPipe's Image object having the default
// orientation `UIImageOrientationUp`.
MPImage *image = [[MPPImage alloc] initWithUIImage:image error:nil];
```

该示例使用默认的 [UIImage.Orientation.Up](https://developer.apple.com/documentation/uikit/uiimage/orientation/up) 方向初始化 `MPImage`。您可以使用任何支持的 [UIImage.Orientation](https://developer.apple.com/documentation/uikit/uiimage/orientation) 值初始化 `MPImage`。物体检测不支持镜像方向，例如 `.upMirrored`、`.downMirrored`、`.leftMirrored`、`.rightMirrored`。

有关 `UIImage` 的更多信息，请参阅 [UIImage Apple 开发者文档](https://developer.apple.com/documentation/uikit/uiimage)。

### CVPixelBuffer

`CVPixelBuffer` 格式非常适合生成帧并使用 iOS [CoreImage](https://developer.apple.com/documentation/coreimage) 框架进行处理的应用程序。

`CVPixelBuffer` 格式非常适合以下运行模式：

* 图像：在使用 iOS 的 `CoreImage` 框架进行某些处理后生成 `CVPixelBuffer` 图像的应用程序，可以将其发送到图像运行模式下的物体检测中。
* 视频：视频帧可以转换为 `CVPixelBuffer` 格式进行处理，然后发送到视频模式下的物体检测中。
* 实时流：使用 iOS 相机生成帧的应用程序可以在发送到实时流模式下的物体检测之前转换为 `CVPixelBuffer` 格式进行处理。

### Swift

```
// Obtain a CVPixelBuffer.

// Convert the `CVPixelBuffer` object to a MediaPipe's Image object having the default
// orientation `UIImage.Orientation.up`.
let image = try MPImage(pixelBuffer: pixelBuffer)
```

### Objective-C

```
// Obtain a CVPixelBuffer.

// Convert the `CVPixelBuffer` object to a MediaPipe's Image object having the
// default orientation `UIImageOrientationUp`.
MPImage *image = [[MPPImage alloc] initWithUIImage:image error:nil];
```

有关 `CVPixelBuffer` 的更多信息，请参阅 [CVPixelBuffer Apple 开发者文档](https://developer.apple.com/documentation/corevideo/cvpixelbuffer-q2e)。

### CMSampleBuffer

`CMSampleBuffer` 格式存储统一媒体类型的媒体样本，非常适合实时流运行模式。iOS 相机的实时帧由 iOS [AVCaptureVideoDataOutput](https://developer.apple.com/documentation/avfoundation/avcapturevideodataoutput) 以 `CMSampleBuffer` 格式异步传递。

### Swift

```
// Obtain a CMSampleBuffer.

// Convert the `CMSampleBuffer` object to a MediaPipe's Image object having the default
// orientation `UIImage.Orientation.up`.
let image = try MPImage(sampleBuffer: sampleBuffer)
```

### Objective-C

```
// Obtain a `CMSampleBuffer`.

// Convert the `CMSampleBuffer` object to a MediaPipe's Image object having the
// default orientation `UIImageOrientationUp`.
MPImage *image = [[MPPImage alloc] initWithSampleBuffer:sampleBuffer error:nil];
```

有关 `CMSampleBuffer` 的更多信息，请参阅 [CMSampleBuffer Apple 开发者文档](https://developer.apple.com/documentation/coremedia/cmsamplebuffer)。

## 运行任务 (Run the task)

要运行物体检测，请使用分配的运行模式特定的 `detect()` 方法：

* 静态图像：`detect(image:)`
* 视频：`detect(videoFrame:timestampInMilliseconds:)`
* 实时流：`detectAsync(image:)`

以下代码示例显示了如何在这些不同运行模式下运行物体检测的基本示例：

### Swift

### 图像 (Image)

```
let objectDetector.detect(image:image)
```

### 视频 (Video)

```
let objectDetector.detect(videoFrame:image)
```

### 实时流 (Live stream)

```
let objectDetector.detectAsync(image:image)
```

### Objective-C

### 图像 (Image)

```
MPPObjectDetectorResult *result = [objectDetector detectInImage:image error:nil];
```

### 视频 (Video)

```
MPPObjectDetectorResult *result = [objectDetector detectInVideoFrame:image          timestampInMilliseconds:timestamp error:nil];
```

### 实时流 (Live stream)

```
BOOL success = [objectDetector detectAsyncInImage:image
                          timestampInMilliseconds:timestamp
                                            error:nil];
```

物体检测代码示例更详细地显示了这些模式的实现：`detect(image:)`、`detect(videoFrame:)` 和 `detectAsync(image:)`。示例代码允许用户在处理模式之间切换，这可能并非您的用例所需的。

请注意以下事项：

* 在视频模式或实时流模式下运行时，您还必须为物体检测任务提供输入帧的时间戳。
* 在图像或视频模式下运行时，物体检测任务会阻塞当前线程，直到完成输入图像或帧的处理。为了避免阻塞当前线程，请使用 iOS [Dispatch](https://developer.apple.com/documentation/dispatch) 或 [NSOperation](https://developer.apple.com/documentation/foundation/nsoperation) 框架在后台线程中执行处理。
* 在实时流模式下运行时，物体检测任务会立即返回并且不阻塞当前线程。它在处理完每个输入帧后使用检测结果调用 `objectDetector(_objectDetector:didFinishDetection:timestampInMilliseconds:error:)` 方法。物体检测在专用串行调度队列上异步调用此方法。为了在用户界面上显示结果，请在处理结果后将其分派到主队列。如果物体检测任务忙于处理另一个帧时调用了 `detectAsync` 函数，则物体检测将忽略新的输入帧。

## 处理和显示结果 (Handle and display results)

在运行推理后，物体检测任务返回一个 `ObjectDetectorResult` 对象，该对象描述了在输入图像中找到的物体。

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

物体检测示例代码演示了如何显示任务返回的检测结果，有关详细信息，请参阅[代码示例](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/object_detection/ios)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*