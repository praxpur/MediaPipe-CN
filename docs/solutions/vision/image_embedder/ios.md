---
title: "iOS 图像嵌入指南 (Image embedding guide for iOS)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/image_embedder/ios"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-08 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# iOS 图像嵌入指南 (Image embedding guide for iOS)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/image_embedder/ios)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 图像嵌入器(Image Embedder)任务可将图像数据转换为数值表示形式,以完成与 ML 相关的图像处理任务,例如比较两张图像的相似度。

这些说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_embedder/ios) 上获取。您可以通过查看此 [Web 演示](https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_embedder)来了解此任务的实际效果。有关此任务的功能、模型和配置选项的更多信息,请参阅[概览](../image_embedder.md)。

## 代码示例 (Code example)

MediaPipe Tasks 示例代码是适用于 iOS 的图像嵌入器应用的基础实现。该示例使用实体 iOS 设备上的摄像头持续嵌入图像,也可以在设备图库中的图像文件上运行嵌入器。

您可以将该应用作为自己 iOS 应用的起点,或在修改现有应用时参考它。图像嵌入器示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_embedder) 上。

### 下载代码 (Download the code)

以下说明向您展示如何使用 [git](https://git-scm.com) 命令行工具创建示例代码的本地副本。

要下载示例代码:

1. 使用以下命令克隆 git 存储库:

   ```
   git clone https://github.com/google-ai-edge/mediapipe-samples
   ```
2. 可以选择配置您的 git 实例使用稀疏检出(sparse checkout),以便只保留图像嵌入器示例应用的文件:

   ```
   cd mediapipe-samples
   git sparse-checkout init --cone
   git sparse-checkout set examples/image_embedder/ios
   ```

创建示例代码的本地版本后,您可以在 Xcode 中打开项目并运行该应用。有关说明,请参阅 [iOS 环境配置指南](../../../setup_ios.md)。

### 关键组件 (Key components)

以下文件包含图像嵌入器示例应用的关键代码:

- [ImageEmbedderService.swift](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/image_embedder/ios/ImageEmbedder/Services/ImageEmbedderService.swift):初始化图像嵌入器、处理模型选择,并对输入数据运行推理。
- [CameraViewController.swift](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/image_embedder/ios/ImageEmbedder/ViewContoller/CameraViewController.swift):实现实时摄像头输入模式的 UI,并可视化结果。
- [MediaLibraryViewController.swift](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/image_embedder/ios/ImageEmbedder/ViewContoller/MediaLibraryViewController.swift):实现静态图像输入模式的 UI,并可视化结果。

## 环境配置 (Setup)

本节介绍为使用图像嵌入器配置开发环境和代码项目的关键步骤。有关使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参阅 [iOS 环境配置指南](../../../setup_ios.md)。

### 依赖项 (Dependencies)

图像嵌入器使用 `MediaPipeTasksVision` 库,该库可以通过 [Swift Package Manager](https://github.com/swiftlang/swift-package-manager)(SPM)安装。该库兼容 Swift 和 Objective-C 应用,不需要任何额外的语言特定设置。

要将 `MediaPipeTasksVision` 库添加到您的 Xcode 项目:

1. 在 Xcode 中打开您的项目后,选择 **File > Add Package Dependencies...**。
2. 在右上角的搜索字段中输入存储库 URL:`https://github.com/google-ai-edge/mediapipe`。
3. 选择 `mediapipe` 软件包,并选择您的依赖规则(例如,**Up to Next Major Version** 或 `master` 分支)。
4. 单击 **Add Package**,然后选择 `MediaPipeTasksVision` 并将其添加到您的应用目标中。

如果您使用 `Package.swift` 文件,请使用以下代码添加 MediaPipe 软件包和 `MediaPipeTasksVision` 目标依赖项:

```
dependencies: [
    .package(
        url: "https://github.com/google-ai-edge/mediapipe",
        branch: "master"
    ),
],
targets: [
    .target(
        name: "MyImageEmbedderApp",
        dependencies: [
            .product(name: "MediaPipeTasksVision", package: "mediapipe"),
        ]
    ),
]
```

有关配置依赖项的更多信息,请参阅 [iOS 环境配置指南](../../../setup_ios.md)。

> **注意:** 以下章节同时提供 Swift 和 Objective-C 代码示例。适用时,说明引用的是 Swift 方法名称。

### 模型 (Model)

MediaPipe 图像嵌入器任务需要一个与此任务兼容的已训练模型。有关图像嵌入器可用已训练模型的更多信息,请参阅[模型章节](../image_embedder.md#models)。

选择并下载模型,然后使用 Xcode 将其添加到您的项目目录中。有关如何向 Xcode 项目添加文件的说明,请参阅 [管理 Xcode 项目中的文件和文件夹](https://developer.apple.com/documentation/xcode/managing-files-and-folders-in-your-xcode-project)。

使用 `BaseOptions.modelAssetPath` 属性指定模型在应用包中的路径。

## 创建任务 (Create the task)

您可以通过调用图像嵌入器的某个初始化器来创建该任务。`ImageEmbedder(options:)` 初始化器接受配置选项的值。

如果您不需要使用自定义配置选项初始化的图像嵌入器,则可以使用 `ImageEmbedder(modelPath:)` 初始化器以默认选项创建图像嵌入器。有关配置选项的更多信息,请参阅[配置概览](#configuration)。

图像嵌入器任务支持 3 种输入数据类型:静态图像、视频文件和实时视频流。默认情况下,`ImageEmbedder(modelPath:)` 会初始化一个用于静态图像的任务。如果您希望任务初始化为处理视频文件或实时视频流,请使用 `ImageEmbedder(options:)` 指定视频或实时流运行模式。实时流模式还需要额外的 `imageEmbedderLiveStreamDelegate` 配置选项,该选项使图像嵌入器能够异步地将图像嵌入结果传递给委托。

选择与您的运行模式对应的标签页,了解如何创建任务并运行推理。

### Swift

### 图像 (Image)

```
import MediaPipeTasksVision

let modelPath = Bundle.main.path(
  forResource: "model",
  ofType: "tflite")

let options = ImageEmbedderOptions()
options.baseOptions.modelAssetPath = modelPath
options.quantize = true
options.l2Normalize = true

let imageEmbedder = try ImageEmbedder(options: options)
```

### 视频 (Video)

```
import MediaPipeTasksVision

let modelPath = Bundle.main.path(
  forResource: "model",
  ofType: "tflite")

let options = ImageEmbedderOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .video
options.quantize = true
options.l2Normalize = true

let imageEmbedder = try ImageEmbedder(options: options)
```

### 实时流 (Livestream)

```
import MediaPipeTasksVision

// 符合 `ImageEmbedderLiveStreamDelegate` 协议的类,
// 实现图像嵌入器完成每个输入帧嵌入后调用的方法。
class ImageEmbedderResultProcessor: NSObject, ImageEmbedderLiveStreamDelegate {

  func imageEmbedder(
    _ imageEmbedder: ImageEmbedder,
    didFinishEmbedding result: ImageEmbedderResult?,
    timestampInMilliseconds: Int,
    error: Error?) {

    // 在此处处理图像嵌入器结果或错误。

  }
}

let modelPath = Bundle.main.path(
  forResource: "model",
  ofType: "tflite")

let options = ImageEmbedderOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .liveStream
options.quantize = true
options.l2Normalize = true

// 将一个该类的对象赋值给 `imageEmbedderLiveStreamDelegate`
// 属性。
let processor = ImageEmbedderResultProcessor()
options.imageEmbedderLiveStreamDelegate = processor

let imageEmbedder = try ImageEmbedder(options: options)
```

### Objective-C

### 图像 (Image)

```
@import MediaPipeTasksVision;

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"model"
                                                      ofType:@"tflite"];

MPPImageEmbedderOptions *options = [[MPPImageEmbedderOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeImage;
options.quantize = YES;
options.l2Normalize = YES;

MPPImageEmbedder *imageEmbedder =
  [[MPPImageEmbedder alloc] initWithOptions:options error:nil];
```

### 视频 (Video)

```
@import MediaPipeTasksVision;

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"model"
                                                      ofType:@"tflite"];

MPPImageEmbedderOptions *options = [[MPPImageEmbedderOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeVideo;
options.quantize = YES;
options.l2Normalize = YES;

MPPImageEmbedder *imageEmbedder =
  [[MPPImageEmbedder alloc] initWithOptions:options error:nil];
```

### 实时流 (Livestream)

```
@import MediaPipeTasksVision;

// 符合 `MPPImageEmbedderLiveStreamDelegate` 协议的类,
// 实现图像嵌入器完成每个输入帧嵌入后调用的方法。
@interface APPImageEmbedderResultProcessor : NSObject 

@end

@implementation APPImageEmbedderResultProcessor

-   (void)imageEmbedder:(MPPImageEmbedder *)imageEmbedder
    didFinishEmbeddingWithResult:(MPPImageEmbedderResult *)imageEmbedderResult
         timestampInMilliseconds:(NSInteger)timestampInMilliseconds
                           error:(NSError *)error {

    // 在此处处理图像嵌入器结果或错误。

}

@end

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"model"
                                                      ofType:@"tflite"];

MPPImageEmbedderOptions *options = [[MPPImageEmbedderOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeLiveStream;
options.quantize = YES;
options.l2Normalize = YES;

// 将一个该类的对象赋值给 `imageEmbedderLiveStreamDelegate`
// 属性。
APPImageEmbedderResultProcessor *processor =
  [APPImageEmbedderResultProcessor new];
options.imageEmbedderLiveStreamDelegate = processor;

MPPImageEmbedder *imageEmbedder =
  [[MPPImageEmbedder alloc] initWithOptions:options error:nil];
```

### 配置选项 (Configuration options)

此任务为 iOS 应用提供以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
| --- | --- | --- | --- |
| `runningMode` | 设置任务的运行模式。图像嵌入器有三种模式:IMAGE:用于单张图像输入的模式。VIDEO:用于视频解码帧的模式。LIVE\_STREAM:用于输入数据实时流(例如来自摄像头)的模式。在此模式下,必须将 `imageEmbedderLiveStreamDelegate` 设置为实现了 `ImageEmbedderLiveStreamDelegate` 的类的实例,以异步接收图像帧嵌入的结果。 | {RunningMode.image, RunningMode.video, RunningMode.liveStream} | {RunningMode.image} |
| `l2Normalize` | 是否使用 L2 范数对返回的特征向量进行归一化。仅当模型尚未包含原生的 L2\_NORMALIZATION TFLite Op 时才使用此选项。在大多数情况下,模型已经包含该 Op,因此通过 TFLite 推理即可实现 L2 归一化,无需此选项。 | Bool | false |
| `quantize` | 返回的嵌入是否通过标量量化量化为字节。嵌入被隐式假定为单位范数,因此任何维度都保证值在 [-1.0, 1.0] 范围内。如果不是这种情况,请使用 l2Normalize 选项。 | Bool | false |

当运行模式设置为实时流时,图像嵌入器需要额外的 `imageEmbedderLiveStreamDelegate` 配置选项,该选项使图像嵌入器能够异步传递图像嵌入结果。委托必须实现 `imageEmbedder(_:didFinishEmbedding:timestampInMilliseconds:error:)` 方法,图像嵌入器在处理完每个输入图像帧的嵌入结果后调用该方法。

| 选项名称 | 说明 | 取值范围 | 默认值 |
| --- | --- | --- | --- |
| `imageEmbedderLiveStreamDelegate` | 使图像嵌入器能够在实时流模式下异步接收图像嵌入结果。其实例被设置为此属性的类必须实现 `imageEmbedder(_:didFinishEmbedding:timestampInMilliseconds:error:)` 方法。 | 不适用 | 未设置 |

## 准备数据 (Prepare data)

您需要先将输入图像或帧转换为 `MPImage` 对象,然后才能将其传递给图像嵌入器。`MPImage` 支持不同类型的 iOS 图像格式,并且可以在任何运行模式下使用它们进行推理。有关 `MPImage` 的更多信息,请参阅 [MPImage API](https://developers.google.com/edge/api/mediapipe/swift/vision/Classes/MPImage)。

根据您的用例和应用程序所需的运行模式选择 iOS 图像格式。`MPImage` 接受 `UIImage`、`CVPixelBuffer` 和 `CMSampleBuffer` iOS 图像格式。

### UIImage

`UIImage` 格式非常适合以下运行模式:

- 图像:来自应用包、用户图库或文件系统的格式为 `UIImage` 图像,可以转换为 `MPImage` 对象。
- 视频:使用 [AVAssetImageGenerator](https://developer.apple.com/documentation/avfoundation/avassetimagegenerator) 将视频帧提取为 [CGImage](https://developer.apple.com/documentation/coregraphics/cgimage) 格式,然后转换为 `UIImage` 图像。

### Swift

```
// 将用户设备上的图像加载为 iOS 的 `UIImage` 对象。

// 将 `UIImage` 对象转换为具有默认
// 方向 `UIImage.Orientation.up` 的 MediaPipe 图像对象。
let image = try MPImage(uiImage: image)
```

### Objective-C

```
// 将用户设备上的图像加载为 iOS 的 `UIImage` 对象。

// 将 `UIImage` 对象转换为具有默认
// 方向 `UIImageOrientationUp` 的 MediaPipe 图像对象。
MPImage *image = [[MPPImage alloc] initWithUIImage:image error:nil];
```

该示例使用默认的 [UIImage.Orientation.Up](https://developer.apple.com/documentation/uikit/uiimage/orientation/up) 方向初始化 `MPImage`。您可以使用任何受支持的 [UIImage.Orientation](https://developer.apple.com/documentation/uikit/uiimage/orientation) 值初始化 `MPImage`。图像嵌入器不支持镜像方向,例如 `.upMirrored`、`.downMirrored`、`.leftMirrored`、`.rightMirrored`。

有关 `UIImage` 的更多信息,请参阅 [UIImage Apple Developer 文档](https://developer.apple.com/documentation/uikit/uiimage)。

### CVPixelBuffer

`CVPixelBuffer` 格式非常适合生成帧并使用 iOS [CoreImage](https://developer.apple.com/documentation/coreimage) 框架进行处理的应用程序。

`CVPixelBuffer` 格式非常适合以下运行模式:

- 图像:使用 iOS 的 `CoreImage` 框架经过处理后生成 `CVPixelBuffer` 图像的应用程序,可以在图像运行模式下发送给图像嵌入器。
- 视频:视频帧可以转换为 `CVPixelBuffer` 格式进行处理,然后在视频模式下发送给图像嵌入器。
- 实时流:使用 iOS 摄像头生成帧的应用程序,可以先将帧转换为 `CVPixelBuffer` 格式进行处理,然后再以实时流模式发送给图像嵌入器。

### Swift

```
// 获取一个 CVPixelBuffer。

// 将 `CVPixelBuffer` 对象转换为具有默认
// 方向 `UIImage.Orientation.up` 的 MediaPipe 图像对象。
let image = try MPImage(pixelBuffer: pixelBuffer)
```

### Objective-C

```
// 获取一个 CVPixelBuffer。

// 将 `CVPixelBuffer` 对象转换为具有默认
// 方向 `UIImageOrientationUp` 的 MediaPipe 图像对象。
MPImage *image = [[MPPImage alloc] initWithUIImage:image error:nil];
```

有关 `CVPixelBuffer` 的更多信息,请参阅 [CVPixelBuffer Apple Developer 文档](https://developer.apple.com/documentation/corevideo/cvpixelbuffer-q2e)。

### CMSampleBuffer

`CMSampleBuffer` 格式存储统一媒体类型的媒体样本,非常适合实时流运行模式。来自 iOS 摄像头的实时帧由 iOS [AVCaptureVideoDataOutput](https://developer.apple.com/documentation/avfoundation/avcapturevideodataoutput) 以 `CMSampleBuffer` 格式异步传递。

### Swift

```
// 获取一个 CMSampleBuffer。

// 将 `CMSampleBuffer` 对象转换为具有默认
// 方向 `UIImage.Orientation.up` 的 MediaPipe 图像对象。
let image = try MPImage(sampleBuffer: sampleBuffer)
```

### Objective-C

```
// 获取一个 `CMSampleBuffer`。

// 将 `CMSampleBuffer` 对象转换为具有默认
// 方向 `UIImageOrientationUp` 的 MediaPipe 图像对象。
MPImage *image = [[MPPImage alloc] initWithSampleBuffer:sampleBuffer error:nil];
```

有关 `CMSampleBuffer` 的更多信息,请参阅 [CMSampleBuffer Apple Developer 文档](https://developer.apple.com/documentation/coremedia/cmsamplebuffer)。

## 运行任务 (Run the task)

要运行图像嵌入器,请使用与指定运行模式对应的 `embed()` 方法:

- 静态图像:`embed(image:)`
- 视频:`embed(videoFrame:timestampInMilliseconds:)`
- 实时流:`embedAsync(image:timestampInMilliseconds:)`

以下代码示例展示了如何在这些不同的运行模式下运行图像嵌入器的基本示例:

### Swift

### 图像 (Image)

```
let result = try imageEmbedder.embed(image: image)
```

### 视频 (Video)

```
let result = try imageEmbedder.embed(
  videoFrame: image,
  timestampInMilliseconds: timestamp)
```

### 实时流 (Live stream)

```
try imageEmbedder.embedAsync(
  image: image,
  timestampInMilliseconds: timestamp)
```

### Objective-C

### 图像 (Image)

```
MPPImageEmbedderResult *result =
  [imageEmbedder embedImage:image error:nil];
```

### 视频 (Video)

```
MPPImageEmbedderResult *result =
  [imageEmbedder embedVideoFrame:image
           timestampInMilliseconds:timestamp
                             error:nil];
```

### 实时流 (Live stream)

```
BOOL success =
  [imageEmbedder embedAsyncImage:image
           timestampInMilliseconds:timestamp
                             error:nil];
```

图像嵌入器代码示例更详细地展示了每种模式的实现:`embed(image:)`、`embed(videoFrame:timestampInMilliseconds:)` 和 `embedAsync(image:timestampInMilliseconds:)`。示例代码允许用户在处理模式之间切换,您的用例可能不需要这样做。

请注意以下事项:

- 在视频模式或实时流模式下运行时,您还必须向图像嵌入器任务提供输入帧的时间戳。
- 在图像或视频模式下运行时,图像嵌入器任务会阻塞当前线程,直到处理完输入图像或帧。为避免阻塞当前线程,请使用 iOS [Dispatch](https://developer.apple.com/documentation/dispatch) 或 [NSOperation](https://developer.apple.com/documentation/foundation/nsoperation) 框架在后台线程中执行处理。如果您的应用使用 Swift 创建,您还可以使用 [Swift Concurrency](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/) 执行后台线程。
- 在实时流模式下运行时,图像嵌入器任务会立即返回,不会阻塞当前线程。它在嵌入每个输入帧后,会使用结果调用 `imageEmbedder(_:didFinishEmbedding:timestampInMilliseconds:error:)` 方法。图像嵌入器在专用的串行分发队列上异步调用此方法。要在用户界面上显示结果,请在处理完结果后将结果分发到主队列。如果在图像嵌入器任务忙于处理另一帧时调用 `embedAsync` 函数,图像嵌入器会忽略新的输入帧。

## 处理并显示结果 (Handle and display results)

运行推理后,图像嵌入器会返回一个 `ImageEmbedderResult` 对象,其中包含输入图像的嵌入列表(浮点或标量量化)。

以下内容展示了此任务的输出数据示例:

```
ImageEmbedderResult:
  Embedding #0 (sole embedding head):
    float_embedding: {0.0, 0.0, ..., 0.0, 1.0, 0.0, 0.0, 2.0}
    head_index: 0
```

该结果是通过嵌入以下图像获得的:

![一只异国猫的中景照片](../../../../assets/edge/mediapipe/images/solutions/image-embedder.jpg)

您可以使用 `ImageEmbedder.cosineSimilarity` 函数比较两个嵌入的相似度。

### Swift

```
let similarity = try ImageEmbedder.cosineSimilarity(
  embedding1: result.embeddingResult.embeddings[0],
  embedding2: otherResult.embeddingResult.embeddings[0])
```

### Objective-C

```
NSNumber *similarity = [MPPImageEmbedder
      cosineSimilarityBetweenEmbedding1:result.embeddingResult.embeddings[0]
                          andEmbedding2:otherResult.embeddingResult.embeddings[0]
                                  error:nil];
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*