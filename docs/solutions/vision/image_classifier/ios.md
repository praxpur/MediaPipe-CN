---
title: "iOS 图像分类指南 (Image classification guide for iOS)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/image_classifier/ios"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-08 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# iOS 图像分类指南 (Image classification guide for iOS)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/image_classifier/ios)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

Image Classifier(图像分类器)任务可让您对图像进行分类。您可以使用此任务识别图像在训练时定义的一组类别中所代表的含义。以下说明向您展示如何在 iOS 应用中使用 Image Classifier。本说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_classification/ios) 上获取。

您可以通过查看此 [Web 演示](https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_classifier)来了解此任务的实际效果。有关此任务的功能、模型和配置选项的更多信息,请参阅[概览](../image_classifier.md)。

## 代码示例

MediaPipe Tasks 示例代码是一个适用于 iOS 的 Image Classifier 应用的基础实现。该示例使用实体 iOS 设备上的摄像头对物体进行持续分类,也可以使用设备图库中的图像和视频对物体进行静态分类。

您可以将该应用作为自己 iOS 应用的起点,或在修改现有应用时参考它。Image Classifier 示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_classification/ios) 上。

### 下载代码

以下说明向您展示如何使用 [git](https://git-scm.com) 命令行工具创建示例代码的本地副本。

要下载示例代码:

1.  使用以下命令克隆 git 仓库:

    ```
    git clone https://github.com/google-ai-edge/mediapipe-samples
    ```

2.  (可选)配置 git 实例使用稀疏检出 (sparse checkout),以便只保留 Image Classifier 示例应用所需的文件:

    ```
    cd mediapipe-samples
    git sparse-checkout init --cone
    git sparse-checkout set examples/image_classification/ios/
    ```

创建示例代码的本地版本后,您可以在 Xcode 中打开项目并运行该应用。有关说明,请参阅 [iOS 环境配置指南](../../setup_ios.md)。

### 关键组件

以下文件包含 Image Classifier 示例应用的关键代码:

-   [ImageClassifierService.swift](https://github.com/googlesamples/mediapipe/blob/main/examples/image_classification/ios/ImageClassifier/Services/ImageClassifierService.swift):初始化图像分类器,处理模型选择,并对输入数据运行推理。
-   [CameraViewController.swift](https://github.com/googlesamples/mediapipe/blob/main/examples/image_classification/ios/ImageClassifier/ViewContoller/CameraViewController.swift):实现实时摄像头输入模式的界面,并可视化结果。
-   [MediaLibraryViewController.swift](https://github.com/googlesamples/mediapipe/blob/main/examples/image_classification/ios/ImageClassifier/ViewContoller/MediaLibraryViewController.swift) 实现静态图像和视频文件输入模式的界面,并可视化结果。

## 环境配置

本节介绍为使用 Image Classifier 而设置开发环境和代码项目的关键步骤。有关设置开发环境以使用 MediaPipe 任务的一般信息(包括平台版本要求),请参阅 [iOS 环境配置指南](../../setup_ios.md)。

### 依赖

Image Classifier 使用 `MediaPipeTasksVision` 库,该库可以通过 [Swift Package Manager](https://github.com/swiftlang/swift-package-manager) (SPM) 安装。该库同时兼容 Swift 和 Objective-C 应用,并且不需要任何额外的语言特定设置。

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
        name: "MyImageClassifierApp",
        dependencies: [
            .product(name: "MediaPipeTasksVision", package: "mediapipe"),
        ]
    ),
]
```

有关配置依赖的更多信息,请参阅 [iOS 环境配置指南](../../setup_ios.md)。

> **注意:** 以下各节提供 Swift 和 Objective-C 两种语言的代码示例。适用时,说明会引用 Swift 方法名。

### 模型

MediaPipe Image Classifier 任务需要一个与此任务兼容的已训练模型。有关 Image Classifier 可用已训练模型的更多信息,请参阅任务概览中的[模型部分](../image_classifier.md#models)。

选择并下载模型,并使用 Xcode 将其添加到您的项目目录中。有关如何向 Xcode 项目添加文件的说明,请参阅[管理 Xcode 项目中的文件和文件夹](https://developer.apple.com/documentation/xcode/managing-files-and-folders-in-your-xcode-project)。

使用 `BaseOptions.modelAssetPath` 属性来指定应用包中模型的路径。代码示例请参见下一节。

## 创建任务

您可以通过调用 Image Classifier 的某个初始化器来创建任务。`ImageClassifier(options:)` 初始化器会设置配置选项的值,包括运行模式、显示名称的语言区域 (locale)、最大结果数、置信度阈值以及类别允许列表和拒绝列表。

如果您不需要使用自定义配置选项初始化 Image Classifier,可以使用 `ImageClassifier(modelPath:)` 初始化器以默认选项创建 Image Classifier。有关配置选项的更多信息,请参阅[配置概览](#configuration)。

Image Classifier 任务支持 3 种输入数据类型:静态图像、视频文件和实时视频流。默认情况下,`ImageClassifier(modelPath:)` 会初始化一个用于静态图像的任务。如果您希望任务初始化为处理视频文件或实时视频流,请使用 `ImageClassifier(options:)` 指定视频或实时流运行模式。实时流模式还需要额外的 `imageClassifierLiveStreamDelegate` 配置选项,该选项使 Image Classifier 能够异步地向委托 (delegate) 传递图像分类结果。

选择与您的运行模式对应的标签页,以了解如何创建任务并运行推理。

### Swift

#### 图像

```
import MediaPipeTasksVision

let modelPath = Bundle.main.path(forResource: "model",
                                      ofType: "tflite")

let options = ImageClassifierOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .image
options.maxResults = 5

let imageClassifier = try ImageClassifier(options: options)
```

#### 视频

```
import MediaPipeTasksVision

let modelPath = Bundle.main.path(forResource: "model",
                                      ofType: "tflite")

let options = ImageClassifierOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .video
options.maxResults = 5

let imageClassifier = try ImageClassifier(options: options)
```

#### 实时流

```
import MediaPipeTasksVision

// Class that conforms to the `ImageClassifierLiveStreamDelegate` protocol and
// implements the method that the image classifier calls once it
// finishes performing classification on each input frame.
class ImageClassifierResultProcessor: NSObject, ImageClassifierLiveStreamDelegate {

   func imageClassifier(
    _ imageClassifier: ImageClassifier,
    didFinishClassification result: ImageClassifierResult?,
    timestampInMilliseconds: Int,
    error: Error?) {

    // Process the image classifier result or errors here.

  }
}

let modelPath = Bundle.main.path(
  forResource: "model",
  ofType: "tflite")

let options = ImageClassifierOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .liveStream
options.maxResults = 5

// Assign an object of the class to the `imageClassifierLiveStreamDelegate`
// property.
let processor = ImageClassifierResultProcessor()
options.imageClassifierLiveStreamDelegate = processor

let imageClassifier = try ImageClassifier(options: options)
```

### Objective-C

#### 图像

```objc
@import MediaPipeTasksVision;

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"model"
                                                      ofType:@"tflite"];

MPPImageClassifierOptions *options = [[MPPImageClassifierOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeImage;
options.maxResults = 5;

MPPImageClassifier *imageClassifier =
      [[MPPImageClassifier alloc] initWithOptions:options error:nil];
```

#### 视频

```objc
@import MediaPipeTasksVision;

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"model"
                                                      ofType:@"tflite"];

MPPImageClassifierOptions *options = [[MPPImageClassifierOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeVideo;
options.maxResults = 5;

MPPImageClassifier *imageClassifier =
      [[MPPImageClassifier alloc] initWithOptions:options error:nil];
```

#### 实时流

```objc
@import MediaPipeTasksVision;

// Class that conforms to the `MPPImageClassifierLiveStreamDelegate` protocol
// and implements the method that the image classifier calls once it finishes
// performing classification on each input frame.

@interface APPImageClassifierResultProcessor : NSObject @end

@implementation APPImageClassifierResultProcessor

-   (void)imageClassifier:(MPPImageClassifier *)imageClassifier
    didFinishClassificationWithResult:(MPPImageClassifierResult *)imageClassifierResult
              timestampInMilliseconds:(NSInteger)timestampInMilliseconds
                                error:(NSError *)error {

    // Process the image classifier result or errors here.

}

@end

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"model"
                                                      ofType:@"tflite"];

MPPImageClassifierOptions *options = [[MPPImageClassifierOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeLiveStream;
options.maxResults = 5;

// Assign an object of the class to the `imageClassifierLiveStreamDelegate`
// property.
APPImageClassifierResultProcessor *processor = [APPImageClassifierResultProcessor new];
options.imageClassifierLiveStreamDelegate = processor;

MPPImageClassifier *imageClassifier =
      [[MPPImageClassifier alloc] initWithOptions:options error:nil];
```

### 配置选项

此任务对 iOS 应用有以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `runningMode` | 设置任务的运行模式。共有三种模式:<br><br>IMAGE:用于单张图像输入的模式。<br><br>VIDEO:用于视频已解码帧的模式。<br><br>LIVE_STREAM:用于输入数据实时流(如来自摄像头)的模式。在此模式下,必须调用 resultListener 来设置监听器,以异步接收结果。 | {`RunningMode.image, RunningMode.video, RunningMode.liveStream`} | `RunningMode.image` |
| `displayNamesLocale` | 设置任务模型元数据中提供的显示名称所使用的标签语言(如果可用)。默认值为 `en`(英语)。您可以使用 [TensorFlow Lite Metadata Writer API](https://ai.google.dev/edge/lite/models/metadata_writer_tutorial) 将本地化标签添加到自定义模型的元数据中。 | 区域代码 (Locale code) | `en` |
| `maxResults` | 设置可选的、要返回的最高分分类结果的最大数量。如果 < 0,将返回所有可用结果。 | 任意正数 | `-1` |
| `scoreThreshold` | 设置预测分数阈值,该阈值会覆盖模型元数据中提供的阈值(如果有)。低于此值的结果将被拒绝。 | 任意浮点数 (Any float) | 未设置 |
| `categoryAllowlist` | 设置可选的允许类别名称列表。如果非空,则类别名称不在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `categoryDenylist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |
| `categoryDenylist` | 设置不允许的类别名称的可选列表。如果非空,则类别名称在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `categoryAllowlist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |
| `resultListener` | 设置结果监听器,以便在 Image Classifier 处于实时流模式时异步接收分类结果。只能在运行模式设置为 `LIVE_STREAM` 时使用。 | N/A | 未设置 |

#### 实时流配置

当运行模式设置为实时流时,Image Classifier 需要额外的 `imageClassifierLiveStreamDelegate` 配置选项,该选项使分类器能够异步传递分类结果。委托 (delegate) 实现 `imageClassifier(_:didFinishClassification:timestampInMilliseconds:error:)` 方法,Image Classifier 在处理完每一帧的分类结果后调用该方法。

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `imageClassifierLiveStreamDelegate` | 使 Image Classifier 能够在实时流模式下异步接收分类结果。设置为该属性的实例所属的类必须实现 `imageClassifier(_:didFinishClassification:timestampInMilliseconds:error:)` 方法。 | 不适用 (Not applicable) | 未设置 |

## 准备数据

您需要先将输入图像或帧转换为 `MPImage` 对象,然后才能将其传递给 Image Classifier。`MPImage` 支持不同类型的 iOS 图像格式,并且可以在任何运行模式下使用它们进行推理。有关 `MPImage` 的更多信息,请参阅 [MPImage API](https://developers.google.com/edge/api/mediapipe/swift/vision/Classes/MPImage)。

根据您的用例和应用程序所需的运行模式选择 iOS 图像格式。`MPImage` 接受 `UIImage`、`CVPixelBuffer` 和 `CMSampleBuffer` iOS 图像格式。

### UIImage

`UIImage` 格式非常适合以下运行模式:

- 图像:来自应用包、用户图库或文件系统的格式为 `UIImage` 图像,可以转换为 `MPImage` 对象。
- 视频:使用 [AVAssetImageGenerator](https://developer.apple.com/documentation/avfoundation/avassetimagegenerator) 将视频帧提取为 [CGImage](https://developer.apple.com/documentation/coregraphics/cgimage) 格式,然后转换为 `UIImage` 图像。

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

该示例使用默认的 [UIImage.Orientation.Up](https://developer.apple.com/documentation/uikit/uiimage/orientation/up) 方向初始化 `MPImage`。您可以使用任何受支持的 [UIImage.Orientation](https://developer.apple.com/documentation/uikit/uiimage/orientation) 值初始化 `MPImage`。Image Classifier 不支持镜像方向,例如 `.upMirrored`、`.downMirrored`、`.leftMirrored`、`.rightMirrored`。

有关 `UIImage` 的更多信息,请参阅 [UIImage Apple Developer 文档](https://developer.apple.com/documentation/uikit/uiimage)。

### CVPixelBuffer

`CVPixelBuffer` 格式非常适合生成帧并使用 iOS [CoreImage](https://developer.apple.com/documentation/coreimage) 框架进行处理的应用程序。

`CVPixelBuffer` 格式非常适合以下运行模式:

- 图像:使用 iOS 的 `CoreImage` 框架经过处理后生成 `CVPixelBuffer` 图像的应用程序,可以在图像运行模式下发送给 Image Classifier。
- 视频:视频帧可以转换为 `CVPixelBuffer` 格式进行处理,然后在视频模式下发送给 Image Classifier。
- 实时流:使用 iOS 摄像头生成帧的应用程序,可以先将帧转换为 `CVPixelBuffer` 格式进行处理,然后再以实时流模式发送给 Image Classifier。

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

有关 `CVPixelBuffer` 的更多信息,请参阅 [CVPixelBuffer Apple Developer 文档](https://developer.apple.com/documentation/corevideo/cvpixelbuffer-q2e)。

### CMSampleBuffer

`CMSampleBuffer` 格式存储统一媒体类型的媒体样本,非常适合实时流运行模式。来自 iOS 摄像头的实时帧由 iOS [AVCaptureVideoDataOutput](https://developer.apple.com/documentation/avfoundation/avcapturevideodataoutput) 以 `CMSampleBuffer` 格式异步传递。

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

有关 `CMSampleBuffer` 的更多信息,请参阅 [CMSampleBuffer Apple Developer 文档](https://developer.apple.com/documentation/coremedia/cmsamplebuffer)。

## 运行任务

要运行 Image Classifier,请使用与指定运行模式对应的 `classify()` 方法:

- 静态图像:`classify(image:)`
- 视频:`classify(videoFrame:timestampInMilliseconds:)`
- 实时流:`classifyAsync(image:timestampInMilliseconds:)`

Image Classifier 返回输入图像或帧中对象的可能类别。

以下代码示例展示了如何在这些不同的运行模式下运行 Image Classifier 的基本示例:

### Swift

### 图像

```
let result = try imageClassifier.classify(image: image)
```

### 视频

```
let result = try imageClassifier.classify(
  videoFrame: image,
  timestampInMilliseconds: timestamp)
```

### 实时流

```
try imageClassifier.classifyAsync(
  image: image,
  timestampInMilliseconds: timestamp)
```

### Objective-C

### 图像

```
MPPImageClassifierResult *result = [imageClassifier classifyImage:image
                                                            error:nil];
```

### 视频

```
MPPImageClassifierResult *result = [imageClassifier classifyVideoFrame:image
                                               timestampInMilliseconds:timestamp
                                                                 error:nil];
```

### 实时流

```
BOOL success = [imageClassifier classifyAsyncImage:image
                          timestampInMilliseconds:timestamp
                                            error:nil];
```

Image Classifier 代码示例更详细地展示了每种模式的实现:`classify(image:)`、`classify(videoFrame:timestampInMilliseconds:)` 和 `classifyAsync(image:timestampInMilliseconds:)`。示例代码允许用户在处理模式之间切换,您的用例可能不需要这样做。

请注意以下事项:

- 在视频模式或实时流模式下运行时,您还必须向 Image Classifier 任务提供输入帧的时间戳。
- 在图像或视频模式下运行时,Image Classifier 任务会阻塞当前线程,直到处理完输入图像或帧。为避免阻塞当前线程,请使用 iOS [Dispatch](https://developer.apple.com/documentation/dispatch) 或 [NSOperation](https://developer.apple.com/documentation/foundation/nsoperation) 框架在后台线程中执行处理。
- 在实时流模式下运行时,Image Classifier 任务会立即返回,不会阻塞当前线程。它在处理完每个输入帧后,会使用分类结果调用 `imageClassifier(_:didFinishClassification:timestampInMilliseconds:error:)` 方法。Image Classifier 在专用的串行分发队列上异步调用此方法。要在用户界面上显示结果,请在处理完结果后将结果分发到主队列。如果在 Image Classifier 任务忙于处理另一帧时调用 `classifyAsync` 函数,Image Classifier 会忽略新的输入帧。

## 处理并显示结果

运行推理后,Image Classifier 任务会返回一个 `ImageClassifierResult` 对象,其中包含输入图像或帧中对象的可能类别列表。

以下内容展示了此任务的输出数据示例:

```
ImageClassifierResult:
 Classifications #0 (single classification head):
  head index: 0
  category #0:
   category name: "/m/01bwb9"
   display name: "Passer domesticus"
   score: 0.91406
   index: 671
  category #1:
   category name: "/m/01bwbt"
   display name: "Passer montanus"
   score: 0.00391
   index: 670
```

该结果是通过在以下图像上运行 [Bird Classifier](https://www.kaggle.com/models/google/aiy/tfLite/vision-classifier-birds-v1/3) 获得的:

![一只家麻雀的特写照片](../../../../assets/edge/mediapipe/images/solutions/image-classifier.jpg)

Image Classifier 示例代码演示了如何显示任务返回的分类结果,详情请参阅[代码示例](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_classification/ios)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*