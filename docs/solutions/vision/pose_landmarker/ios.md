---
title: "iOS 姿态关键点检测指南 (Pose landmark detection guide for iOS)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/ios"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-08 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# iOS 姿态关键点检测指南 (Pose landmark detection guide for iOS)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/ios)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

Pose Landmarker(姿态关键点检测器)任务可让您检测图像或视频中人体的关键点。您可以使用此任务识别关键身体部位位置、分析姿态,并对动作进行分类。此任务使用适用于单张图像或视频的机器学习 (ML) 模型。任务会输出图像坐标和 3 维世界坐标下的身体姿态关键点。

这些说明向您展示如何在 iOS 应用中使用 Pose Landmarker。本说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/pose_landmarker/ios) 上获取。

您可以通过查看此 [Web 演示](https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/pose_landmarker)来查看此任务的运行效果。有关此任务的功能、模型和配置选项的更多信息,请参阅[概览](../pose_landmarker.md)。

## 代码示例

MediaPipe Tasks 示例代码是一个适用于 iOS 的 Pose Landmarker 应用的基本实现。该示例使用实体 iOS 设备上的摄像头在连续视频流中检测姿态。该应用还可以检测设备图库中图像和视频中的姿态。

您可以将该应用作为自己 iOS 应用的起点,或在修改现有应用时参考它。Pose Landmarker 示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/pose_landmarker/ios) 上。

### 下载代码

以下说明向您展示如何使用 [git](https://git-scm.com) 命令行工具创建示例代码的本地副本。

要下载示例代码:

1.  使用以下命令克隆 git 仓库:

    ```
    git clone https://github.com/google-ai-edge/mediapipe-samples
    ```

2.  (可选)配置 git 实例使用稀疏检出,以便只保留 Pose Landmarker 示例应用所需的文件:

    ```
    cd mediapipe-samples
    git sparse-checkout init --cone
    git sparse-checkout set examples/pose_landmarker/ios/
    ```

创建示例代码的本地版本后,您可以在 Xcode 中打开项目并运行该应用。有关说明,请参阅 [iOS 环境配置指南](../../setup_ios.md)。

### 关键组件

以下文件包含 Pose Landmarker 示例应用的关键代码:

-   [PoseLandmarkerService.swift](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/pose_landmarker/ios/PoseLandmarker/Services/PoseLandmarkerService.swift):初始化关键点检测器,处理模型选择并对输入数据运行推理。
-   [CameraViewController](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/pose_landmarker/ios/PoseLandmarker/ViewContoller/CameraViewController.swift):实现实时摄像头输入模式的 UI,并可视化关键点。
-   [MediaLibraryViewController.swift](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/pose_landmarker/ios/PoseLandmarker/ViewContoller/MediaLibraryViewController.swift):实现静态图像和视频文件输入模式的 UI,并可视化关键点。

## 环境配置

本节介绍为使用 Pose Landmarker 而设置开发环境和代码项目的关键步骤。有关设置开发环境以使用 MediaPipe 任务的一般信息(包括平台版本要求),请参阅 [iOS 环境配置指南](../../setup_ios.md)。

### 依赖

Pose Landmarker 使用 `MediaPipeTasksVision` 库,该库可通过 [Swift Package Manager](https://github.com/swiftlang/swift-package-manager) (SPM) 安装。该库同时兼容 Swift 和 Objective-C 应用,且不需要任何额外的特定语言配置。

要将 `MediaPipeTasksVision` 库添加到您的 Xcode 项目:

1.  在 Xcode 中打开您的项目,选择 **File > Add Package Dependencies...**。
2.  在右上角的搜索字段中输入仓库 URL:`https://github.com/google-ai-edge/mediapipe`
3.  选择 `mediapipe` 包,并选择您的依赖规则(例如,**Up to Next Major Version** 或 `master` 分支)。
4.  点击 **Add Package**,然后选择 `MediaPipeTasksVision` 并将其添加到您的应用目标中。

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
        name: "MyPoseLandmarkerApp",
        dependencies: [
            .product(name: "MediaPipeTasksVision", package: "mediapipe"),
        ]
    ),
]
```

有关配置依赖的更多信息,请参阅 [iOS 环境配置指南](../../setup_ios.md)。

> **注意:** 以下各节提供 Swift 和 Objective-C 两种语言的代码示例。适用时,说明会引用 Swift 方法名。

### 模型

MediaPipe Pose Landmarker 任务需要一个与此任务兼容的已训练模型包。有关 Pose Landmarker 可用已训练模型的更多信息,请参阅任务概览中的[模型部分](../pose_landmarker.md#models)。

使用 [`download_models.sh` 脚本](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/pose_landmarker/ios/RunScripts/download_models.sh) 下载模型,并通过 Xcode 将其添加到项目目录中。有关如何向 Xcode 项目添加文件的说明,请参阅[管理 Xcode 项目中的文件和文件夹](https://developer.apple.com/documentation/xcode/managing-files-and-folders-in-your-xcode-project)。

使用 `BaseOptions.modelAssetPath` 属性指定应用包中模型的路径。代码示例请参见下一节。

## 创建任务

您可以通过调用 Pose Landmarker 的某个初始化器来创建任务。`PoseLandmarker(options:)` 初始化器接受配置选项的值。

如果您不需要使用自定义配置选项初始化 Pose Landmarker,可以使用 `PoseLandmarker(modelPath:)` 初始化器以默认选项创建 Pose Landmarker。有关配置选项的更多信息,请参阅[配置概览](#configuration)。

Pose Landmarker 任务支持 3 种输入数据类型:静态图像、视频文件和实时视频流。默认情况下,`PoseLandmarker(modelPath:)` 会初始化一个用于静态图像的任务。如果您希望任务初始化为处理视频文件或实时视频流,请使用 `PoseLandmarker(options:)` 指定视频或实时流运行模式。实时流模式还需要额外的 `poseLandmarkerLiveStreamDelegate` 配置选项,该选项使 Pose Landmarker 能够异步地向委托 (delegate) 传递姿态关键点检测结果。

选择与您的运行模式对应的标签页,以了解如何创建任务并运行推理。

### Swift

#### 图像

```
import MediaPipeTasksVision

let modelPath = Bundle.main.path(forResource: "pose_landmarker",
                                      ofType: "task")

let options = PoseLandmarkerOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .image
options.minPoseDetectionConfidence = minPoseDetectionConfidence
options.minPosePresenceConfidence = minPosePresenceConfidence
options.minTrackingConfidence = minTrackingConfidence
options.numPoses = numPoses

let poseLandmarker = try PoseLandmarker(options: options)
```

#### 视频

```
import MediaPipeTasksVision

let modelPath = Bundle.main.path(forResource: "pose_landmarker",
                                      ofType: "task")

let options = PoseLandmarkerOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .video
options.minPoseDetectionConfidence = minPoseDetectionConfidence
options.minPosePresenceConfidence = minPosePresenceConfidence
options.minTrackingConfidence = minTrackingConfidence
options.numPoses = numPoses

let poseLandmarker = try PoseLandmarker(options: options)
```

#### 实时流

```
import MediaPipeTasksVision

// Class that conforms to the `PoseLandmarkerLiveStreamDelegate` protocol and
// implements the method that the pose landmarker calls once it finishes
// performing pose landmark detection in each input frame.
class PoseLandmarkerResultProcessor: NSObject, PoseLandmarkerLiveStreamDelegate {

  func poseLandmarker(
    _ poseLandmarker: PoseLandmarker,
    didFinishDetection result: PoseLandmarkerResult?,
    timestampInMilliseconds: Int,
    error: Error?) {

    // Process the pose landmarker result or errors here.

  }
}

let modelPath = Bundle.main.path(forResource: "pose_landmarker",
                                      ofType: "task")

let options = PoseLandmarkerOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .liveStream
options.minPoseDetectionConfidence = minPoseDetectionConfidence
options.minPosePresenceConfidence = minPosePresenceConfidence
options.minTrackingConfidence = minTrackingConfidence
options.numPoses = numPoses

// Assign an object of the class to the `poseLandmarkerLiveStreamDelegate`
// property.
let processor = PoseLandmarkerResultProcessor()
options.poseLandmarkerLiveStreamDelegate = processor

let poseLandmarker = try PoseLandmarker(options: options)
```

### Objective-C

#### 图像

```objc
@import MediaPipeTasksVision;

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"pose_landmarker"
                                                      ofType:@"task"];

MPPPoseLandmarkerOptions *options = [[MPPPoseLandmarkerOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeImage;
options.minPoseDetectionConfidence = minPoseDetectionConfidence;
options.minPosePresenceConfidence = minPosePresenceConfidence;
options.minTrackingConfidence = minTrackingConfidence;
options.numPoses = numPoses;

MPPPoseLandmarker *poseLandmarker =
  [[MPPPoseLandmarker alloc] initWithOptions:options error:nil];
```

#### 视频

```objc
@import MediaPipeTasksVision;

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"pose_landmarker"
                                                      ofType:@"task"];

MPPPoseLandmarkerOptions *options = [[MPPPoseLandmarkerOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeVideo;
options.minPoseDetectionConfidence = minPoseDetectionConfidence;
options.minPosePresenceConfidence = minPosePresenceConfidence;
options.minTrackingConfidence = minTrackingConfidence;
options.numPoses = numPoses;

MPPPoseLandmarker *poseLandmarker =
  [[MPPPoseLandmarker alloc] initWithOptions:options error:nil];
```

#### 实时流

```objc
@import MediaPipeTasksVision;

// Class that conforms to the `MPPPoseLandmarkerLiveStreamDelegate` protocol
// and implements the method that the pose landmarker calls once it finishes
// performing pose landmarks= detection in each input frame.

@interface APPPoseLandmarkerResultProcessor : NSObject @end

@implementation APPPoseLandmarkerResultProcessor

-   (void)poseLandmarker:(MPPPoseLandmarker *)poseLandmarker
    didFinishDetectionWithResult:(MPPPoseLandmarkerResult *)poseLandmarkerResult
         timestampInMilliseconds:(NSInteger)timestampInMilliseconds
                           error:(NSError *)error {

    // Process the pose landmarker result or errors here.

}

@end

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"pose_landmarker"
                                                      ofType:@"task"];

MPPPoseLandmarkerOptions *options = [[MPPPoseLandmarkerOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeLiveStream;
options.minPoseDetectionConfidence = minPoseDetectionConfidence;
options.minPosePresenceConfidence = minPosePresenceConfidence;
options.minTrackingConfidence = minTrackingConfidence;
options.numPoses = numPoses;

// Assign an object of the class to the `poseLandmarkerLiveStreamDelegate`
// property.
APPPoseLandmarkerResultProcessor *processor =
  [APPPoseLandmarkerResultProcessor new];
options.poseLandmarkerLiveStreamDelegate = processor;

MPPPoseLandmarker *poseLandmarker =
  [[MPPPoseLandmarker alloc] initWithOptions:options error:nil];
```

> **注意:** 如果使用视频模式或实时流模式,Pose Landmarker 会使用跟踪,以避免在每一帧上都触发 palm detection 模型,这有助于降低延迟。

### 配置选项

此任务对 iOS 应用有以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `running_mode` | 设置任务的运行模式。共有三种模式:<br><br>IMAGE:用于单张图像输入的模式。<br><br>VIDEO:用于视频已解码帧的模式。<br><br>LIVE_STREAM:用于输入数据实时流(如来自摄像头)的模式。在此模式下,必须将 `poseLandmarkerLiveStreamDelegate` 设置为一个实现了 `PoseLandmarkerLiveStreamDelegate` 的类的实例,以异步接收姿态关键点检测的结果。 | {`RunningMode.image, RunningMode.video, RunningMode.liveStream`} | `RunningMode.image` |
| `num_poses` | Pose Landmarker 可检测的最大姿态数量。 | `Integer > 0` | `1` |
| `min_pose_detection_confidence` | 姿态检测被视为成功所需的最低置信度分数。 | `Float [0.0,1.0]` | `0.5` |
| `min_pose_presence_confidence` | 姿态关键点检测中姿态存在分数所需的最低置信度分数。 | `Float [0.0,1.0]` | `0.5` |
| `min_tracking_confidence` | 姿态跟踪被视为成功所需的最低置信度分数。 | `Float [0.0,1.0]` | `0.5` |
| `output_segmentation_masks` | Pose Landmarker 是否输出检测到的姿态的分割掩码。 | `Boolean` | `False` |
| `result_callback` | 设置结果监听器,以便在 Pose Landmarker 处于实时流模式时异步接收关键点检测器结果。只能在运行模式设置为 `LIVE_STREAM` 时使用。 | `ResultListener` | `N/A` |

#### 实时流配置

当运行模式设置为实时流时,Pose Landmarker 需要额外的 `poseLandmarkerLiveStreamDelegate` 配置选项,该选项使 Pose Landmarker 能够异步地传递姿态关键点检测结果。委托必须实现 `poseLandmarker(_:didFinishDetection:timestampInMilliseconds:error:)` 方法,Pose Landmarker 在处理完每一帧的姿态关键点检测结果后调用该方法。

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `poseLandmarkerLiveStreamDelegate` | 使 Pose Landmarker 能够在实时流模式下异步接收姿态关键点检测的结果。其实例被赋给此属性的类必须实现 `poseLandmarker(_:didFinishDetection:timestampInMilliseconds:error:)` 方法。 | 不适用 | 未设置 |

## 准备数据

您需要先将输入图像或帧转换为 `MPImage` 对象,然后再将其传给 Pose Landmarker。`MPImage` 支持不同类型的 iOS 图像格式,并可在任何运行模式下使用它们进行推理。有关 `MPImage` 的更多信息,请参阅 [MPImage API](https://developers.google.com/edge/api/mediapipe/swift/vision/Classes/MPImage)。

根据您的用例和应用所需的运行模式选择 iOS 图像格式。`MPImage` 接受 `UIImage`、`CVPixelBuffer` 和 `CMSampleBuffer` 三种 iOS 图像格式。

### UIImage

`UIImage` 格式非常适合以下运行模式:

-   图像:来自应用包、用户图库或文件系统的格式为 `UIImage` 的图像可以转换为 `MPImage` 对象。
-   视频:使用 [AVAssetImageGenerator](https://developer.apple.com/documentation/avfoundation/avassetimagegenerator) 将视频帧提取为 [CGImage](https://developer.apple.com/documentation/coregraphics/cgimage) 格式,然后再转换为 `UIImage` 图像。

#### Swift

```
// Load an image on the user's device as an iOS `UIImage` object.

// Convert the `UIImage` object to a MediaPipe's Image object having the default
// orientation `UIImage.Orientation.up`.
let image = try MPImage(uiImage: image)
```

#### Objective-C

```objc
// Load an image on the user's device as an iOS `UIImage` object.

// Convert the `UIImage` object to a MediaPipe's Image object having the default
// orientation `UIImageOrientationUp`.
MPImage *image = [[MPPImage alloc] initWithUIImage:image error:nil];
```

该示例使用默认的 [UIImage.Orientation.Up](https://developer.apple.com/documentation/uikit/uiimage/orientation/up) 方向初始化 `MPImage`。您可以使用任何受支持的 [UIImage.Orientation](https://developer.apple.com/documentation/uikit/uiimage/orientation) 值初始化 `MPImage`。Pose Landmarker 不支持镜像方向,如 `.upMirrored`、`.downMirrored`、`.leftMirrored`、`.rightMirrored`。

有关 `UIImage` 的更多信息,请参阅 [UIImage Apple Developer Documentation](https://developer.apple.com/documentation/uikit/uiimage)。

### CVPixelBuffer

`CVPixelBuffer` 格式非常适合生成帧并使用 iOS [CoreImage](https://developer.apple.com/documentation/coreimage) 框架进行处理的应用程序。

`CVPixelBuffer` 格式非常适合以下运行模式:

-   图像:在使用 iOS 的 `CoreImage` 框架进行一些处理后生成 `CVPixelBuffer` 图像的应用,可以在图像运行模式下将图像发送给 Pose Landmarker。
-   视频:视频帧可以转换为 `CVPixelBuffer` 格式进行处理,然后在视频模式下发送给 Pose Landmarker。
-   实时流:使用 iOS 摄像头生成帧的应用,可以将帧转换为 `CVPixelBuffer` 格式进行处理,然后在实时流模式下发送给 Pose Landmarker。

#### Swift

```
// Obtain a CVPixelBuffer.

// Convert the `CVPixelBuffer` object to a MediaPipe's Image object having the default
// orientation `UIImage.Orientation.up`.
let image = try MPImage(pixelBuffer: pixelBuffer)
```

#### Objective-C

```objc
// Obtain a CVPixelBuffer.

// Convert the `CVPixelBuffer` object to a MediaPipe's Image object having the
// default orientation `UIImageOrientationUp`.
MPImage *image = [[MPPImage alloc] initWithUIImage:image error:nil];
```

有关 `CVPixelBuffer` 的更多信息,请参阅 [CVPixelBuffer Apple Developer Documentation](https://developer.apple.com/documentation/corevideo/cvpixelbuffer-q2e)。

### CMSampleBuffer

`CMSampleBuffer` 格式存储统一媒体类型的媒体样本,非常适合实时流运行模式。来自 iOS 摄像头的实时帧由 iOS [AVCaptureVideoDataOutput](https://developer.apple.com/documentation/avfoundation/avcapturevideodataoutput) 以 `CMSampleBuffer` 格式异步传递。

#### Swift

```
// Obtain a CMSampleBuffer.

// Convert the `CMSampleBuffer` object to a MediaPipe's Image object having the default
// orientation `UIImage.Orientation.up`.
let image = try MPImage(sampleBuffer: sampleBuffer)
```

#### Objective-C

```objc
// Obtain a `CMSampleBuffer`.

// Convert the `CMSampleBuffer` object to a MediaPipe's Image object having the
// default orientation `UIImageOrientationUp`.
MPImage *image = [[MPPImage alloc] initWithSampleBuffer:sampleBuffer error:nil];
```

有关 `CMSampleBuffer` 的更多信息,请参阅 [CMSampleBuffer Apple Developer Documentation](https://developer.apple.com/documentation/coremedia/cmsamplebuffer)。

## 运行任务

要运行 Pose Landmarker,请使用与所分配运行模式对应的 `detect()` 方法:

-   静态图像:`detect(image:)`
-   视频:`detect(videoFrame:timestampInMilliseconds:)`
-   实时流:`detectAsync(image:timestampInMilliseconds:)`

以下代码示例展示了如何在这些不同运行模式下运行 Pose Landmarker:

### Swift

#### 图像

```
let result = try poseLandmarker.detect(image: image)
```

#### 视频

```
let result = try poseLandmarker.detect(
  videoFrame: image,
  timestampInMilliseconds: timestamp)
```

#### 实时流

```
try poseLandmarker.detectAsync(
  image: image,
  timestampInMilliseconds: timestamp)
```

### Objective-C

#### 图像

```objc
MPPPoseLandmarkerResult *result =
  [poseLandmarker detectImage:image error:nil];
```

#### 视频

```objc
MPPPoseLandmarkerResult *result =
  [poseLandmarker detectVideoFrame:image
           timestampInMilliseconds:timestamp
                             error:nil];
```

#### 实时流

```objc
BOOL success =
  [poseLandmarker detectAsyncImage:image
           timestampInMilliseconds:timestamp
                             error:nil];
```

Pose Landmarker 代码示例更详细地展示了每种模式的实现(`detect(image:)`、`detect(videoFrame:timestampInMilliseconds:)` 和 `detectAsync(image:timestampInMilliseconds:)`)。示例代码允许用户在处理模式之间切换,您的用例可能不需要这一点。

请注意以下事项:

-   在视频模式或实时流模式下运行时,您还必须向 Pose Landmarker 任务提供输入帧的时间戳。
-   在图像模式或视频模式下运行时,Pose Landmarker 任务会阻塞当前线程,直到处理完输入图像或帧。为避免阻塞当前线程,请使用 iOS [Dispatch](https://developer.apple.com/documentation/dispatch) 或 [NSOperation](https://developer.apple.com/documentation/foundation/nsoperation) 框架在后台线程中执行处理。
-   在实时流模式下运行时,Pose Landmarker 任务会立即返回,不会阻塞当前线程。它在处理完每个输入帧后,会以姿态关键点检测器结果调用 `poseLandmarker(_:didFinishDetection:timestampInMilliseconds:error:)` 方法。Pose Landmarker 会在专用的串行调度队列上异步调用此方法。若要在用户界面上显示结果,请在处理完结果后将结果安排到主队列。如果在 Pose Landmarker 任务正忙于处理另一帧时调用 `detectAsync` 函数,Pose Landmarker 会忽略新的输入帧。

## 处理并显示结果

运行推理后,Pose Landmarker 任务会返回一个 `PoseLandmarkerResult`,其中包含每个姿态关键点的坐标。

以下是此任务输出数据的示例:

```
PoseLandmarkerResult:
  Landmarks:
    Landmark #0:
      x            : 0.638852
      y            : 0.671197
      z            : 0.129959
      visibility   : 0.9999997615814209
      presence     : 0.9999984502792358
    Landmark #1:
      x            : 0.634599
      y            : 0.536441
      z            : -0.06984
      visibility   : 0.999909
      presence     : 0.999958
    ... (每个姿态 33 个关键点)
  WorldLandmarks:
    Landmark #0:
      x            : 0.067485
      y            : 0.031084
      z            : 0.055223
      visibility   : 0.9999997615814209
      presence     : 0.9999984502792358
    Landmark #1:
      x            : 0.063209
      y            : -0.00382
      z            : 0.020920
      visibility   : 0.999976
      presence     : 0.999998
    ... (每个姿态 33 个世界关键点)
  SegmentationMasks:
    ... (如下图)
```

输出包含每个关键点的归一化坐标 (`Landmarks`) 和世界坐标 (`WorldLandmarks`)。

输出包含以下归一化坐标 (`Landmarks`):

-   `x` 和 `y`:关键点坐标,分别按图像宽度 (`x`) 和高度 (`y`) 归一化至 0.0 到 1.0 之间。
-   `z`:关键点深度,以臀部中点为深度原点。值越小,关键点离摄像头越近。`z` 的大小使用与 `x` 大致相同的比例。
-   `visibility`:关键点在图像中可见的可能性。

输出包含以下世界坐标 (`WorldLandmarks`):

-   `x`、`y` 和 `z`:以米为单位的真实世界 3 维坐标,以臀部中点为原点。
-   `visibility`:关键点在图像中可见的可能性。

下图展示了任务输出的可视化:

![一位处于冥想姿态的女性。她的姿态被一个线框高亮,指示她四肢和躯干的位置](../../../../assets/edge/mediapipe/images/solutions/examples/pose_detector.png)

可选的分割掩码表示每个像素属于某个检测到的人的可能性。下图是任务输出的分割掩码:

![前一图像的分割掩码,勾勒出女性的轮廓](../../../../assets/edge/mediapipe/images/solutions/examples/pose_detector_mask.png)

Pose Landmarker 示例代码演示了如何显示 Pose Landmarker 结果。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*