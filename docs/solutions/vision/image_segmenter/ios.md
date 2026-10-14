---
title: "图像分割器 (Image Segmenter) - iOS"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter/ios"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2024-04-03 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 图像分割器 (Image Segmenter) - iOS

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter/ios)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

图像分割器 (Image Segmenter) 任务允许您根据预定义的类别将图像划分为多个区域，并应用诸如背景模糊等视觉效果。这些说明向您展示了如何在 iOS 应用中使用图像分割器。

这些说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/ios) 上找到。

您可以通过查看 [Web 演示](https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_segmenter)来看看此任务的实际效果。有关此任务的功能、模型和配置选项的更多信息，请参阅[概述](../image_segmenter.md)。

## 代码示例 (Code example)

MediaPipe Tasks 代码示例包含一个适用于 iOS 的图像分割器应用的简单实现。

该示例实现了一个输出类别掩码的图像分割器。它使用物理 iOS 设备上的摄像头对实时摄像头视频流进行图像分割，或者对来自设备图库的图像和视频进行图像分割。

您可以将此应用作为您自己 iOS 应用的起点，或者在修改现有应用时参考它。图像分割器示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/ios) 上。

### 下载代码 (Download the code)

以下说明向您展示如何使用 [git](https://git-scm.com) 命令行工具创建示例代码的本地副本。

下载示例代码的步骤：

1. 使用以下命令克隆 git 仓库：

   ```
   git clone https://github.com/google-ai-edge/mediapipe-samples/
   ```
2. 此外，您可以配置您的 git 实例使用稀疏检出 (sparse checkout)，这样您就只有图像分割器示例应用的文件：

   ```
   cd mediapipe-samples
   git sparse-checkout init --cone
   git sparse-checkout set examples/image_segmentation/ios/
   ```

创建示例代码的本地版本后，您可以在 Xcode 中打开项目并运行该应用。有关说明，请参阅 [iOS 环境配置指南](../../setup_ios.md)。

### 关键组件 (Key components)

以下文件包含图像分割器示例应用的关键代码：

* [ImageSegmenterService.swift](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/image_segmentation/ios/ImageSegmenter/Services/ImageSegmenterService.swift): 初始化图像分割器，处理模型选择，并在输入数据上运行推理。
* [CameraViewController.swift](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/image_segmentation/ios/ImageSegmenter/ViewContoller/CameraViewController.swift): 为实时相机视频流输入模式实现 UI 并可视化结果。
* [MediaLibraryViewController.swift](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/image_segmentation/ios/ImageSegmenter/ViewContoller/MediaLibraryViewController.swift) 为静态图像和视频文件输入模式实现 UI 并可视化结果。

## 设置 (Setup)

本节介绍设置开发环境和代码项目以使用图像分割器的关键步骤。有关设置使用 MediaPipe 任务的开发环境的一般信息，包括平台版本要求，请参阅 [iOS 环境配置指南](../../setup_ios.md)。

### 依赖项 (Dependencies)

图像分割器使用 `MediaPipeTasksVision` 库，可以使用 [Swift Package Manager](https://github.com/swiftlang/swift-package-manager) (SPM) 安装。该库兼容 Swift 和 Objective-C 应用，不需要任何额外的语言特定设置。

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
        name: "MyImageSegmenterApp",
        dependencies: [
            .product(name: "MediaPipeTasksVision", package: "mediapipe"),
        ]
    ),
]
```

有关配置依赖项的更多信息，请参阅 [iOS 环境配置指南](../../setup_ios.md)。

> **注意：** 以下部分提供了 Swift 和 Objective-C 的代码示例。在适用的情况下，说明引用了 Swift 的方法名称。

### 模型 (Model)

MediaPipe 图像分割器任务需要一个与此任务兼容的训练好的模型。有关图像分割器可用预训练模型的更多信息，请参阅任务概述的[模型部分](../image_segmenter.md#models)。

选择并下载一个模型，然后使用 Xcode 将其添加到您的项目目录中。有关如何向您的 Xcode 项目添加文件的说明，请参阅[在您的 Xcode 项目中管理文件和文件夹](https://developer.apple.com/documentation/xcode/managing-files-and-folders-in-your-xcode-project)。

使用 `BaseOptions.modelAssetPath` 属性来指定模型在您的应用程序包中的路径。有关代码示例，请参阅下一节。

## 创建任务 (Create the task)

您可以通过调用其初始化器之一来创建图像分割器任务。`ImageSegmenter(options:)` 初始化器接受配置选项的值。

如果您不需要使用自定义配置选项初始化的图像分割器，则可以使用 `ImageSegmenter(modelPath:)` 初始化器创建一个具有默认选项的图像分割器。有关配置选项的更多信息，请参阅[配置选项概述](#configuration_options)。

图像分割器任务支持 3 种输入数据类型：静态图像、视频文件和实时视频流。默认情况下，`ImageSegmenter(modelPath:)` 初始化用于处理静态图像的任务。如果您希望您的任务被初始化为处理视频文件或实时视频流，请使用 `ImageSegmenter(options:)` 来指定视频或实时流运行模式。实时流模式还需要额外的 `imageSegmenterLiveStreamDelegate` 配置选项，该选项使图像分割器能够将图像分割结果异步传递给委托。

选择与您的运行模式相对应的选项卡，以查看如何创建任务和运行推理。

### Swift

### 图像 (Image)

```
import MediaPipeTasksVision

let modelPath = Bundle.main.path(forResource: "model",
                                      ofType: "tflite")

let options = ImageSegmenterOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .image
options.shouldOutputCategoryMask = true
options.shouldOutputConfidenceMasks = false

let imageSegmenter = try ImageSegmenter(options: options)
```

### 视频 (Video)

```
import MediaPipeTasksVision

let modelPath = Bundle.main.path(forResource: "model",
                                      ofType: "tflite")

let options = ImageSegmenterOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .video
options.shouldOutputCategoryMask = true
options.shouldOutputConfidenceMasks = false

let imageSegmenter = try ImageSegmenter(options: options)
```

### 实时流 (Live stream)

```
import MediaPipeTasksVision

// Class that conforms to the `imageSegmenterLiveStreamDelegate` protocol and
// implements the method that the image segmenter calls once it finishes
// performing segmentation of each input frame.
class ImageSegmenterResultProcessor: NSObject, ImageSegmenterLiveStreamDelegate {

  func imageSegmenter(
    _ imageSegmenter: ImageSegmenter,
    didFinishSegmentation result: ImageSegmenterResult?,
    timestampInMilliseconds: Int,
    error: Error?) {

    // Process the image segmentation result or errors here.

  }
}

let modelPath = Bundle.main.path(forResource: "model",
                                      ofType: "tflite")

let options = ImageSegmenterOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .liveStream
options.shouldOutputCategoryMask = true
options.shouldOutputConfidenceMasks = false

// Set `imageSegmenterLiveStreamDelegate` to the object of the class that
// confirms to the `ImageSegmenterLiveStreamDelegate` protocol.
let processor = ImageSegmenterResultProcessor()
options.imageSegmenterLiveStreamDelegate = processor

let imageSegmenter = try ImageSegmenter(options: options)
```

### Objective-C

### 图像 (Image)

```
@import MediaPipeTasksVision;

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"model"
                                                      ofType:@"tflite"];

MPPImageSegmenterOptions *options = [[MPPImageSegmenterOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeImage;
options.shouldOutputCategoryMask = YES;
options.shouldOutputConfidenceMasks = NO;

MPPImageSegmenter *imageSegmenter =
  [[MPPImageSegmenter alloc] initWithOptions:options error:nil];
```

### 视频 (Video)

```
@import MediaPipeTasksVision;

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"model"
                                                      ofType:@"tflite"];

MPPImageSegmenterOptions *options = [[MPPImageSegmenterOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeVideo;
options.shouldOutputCategoryMask = YES;
options.shouldOutputConfidenceMasks = NO;

MPPImageSegmenter *imageSegmenter =
  [[MPPImageSegmenter alloc] initWithOptions:options error:nil];
```

### 实时流 (Live stream)

```
@import MediaPipeTasksVision;

// Class that conforms to the `MPPImageSegmenterLiveStreamDelegate` protocol
// and implements the method that the image segmenter calls once it finishes
// performing segmentation of each input frame.

@interface APPImageSegmenterResultProcessor : NSObject 

@end

@implementation APPImageSegmenterResultProcessor

-   (void)imageSegmenter:(MPPImageSegmenter *)imageSegmenter
    didFinishSegmentationWithResult:(MPPImageSegmenterResult *)imageSegmenterResult
         timestampInMilliseconds:(NSInteger)timestampInMilliseconds
                           error:(NSError *)error {

    // Process the image segmentation result or errors here.

}

@end

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"model"
                                                      ofType:@"tflite"];

MPPImageSegmenterOptions *options = [[MPPImageSegmenterOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPRunningModeLiveStream;
options.shouldOutputCategoryMask = YES;
options.shouldOutputConfidenceMasks = NO;

// Set `imageSegmenterLiveStreamDelegate` to the object of the class that
// confirms to the `MPPImageSegmenterLiveStreamDelegate` protocol.
APPImageSegmenterResultProcessor *processor =
  [APPImageSegmenterResultProcessor new];
options.imageSegmenterLiveStreamDelegate = processor;

MPPImageSegmenter *imageSegmenter =
  [[MPPImageSegmenter alloc] initWithOptions:options error:nil];
```

图像分割器示例代码实现允许用户在处理模式之间切换。这种方法使任务创建代码更加复杂，可能不适合您的用例。

### 配置选项 (Configuration options)

此任务具有针对 iOS 应用的以下配置选项：

| 选项名称 | 描述 | 值范围 | 默认值 |
| --- | --- | --- | --- |
| `runningMode` | 设置任务的运行模式。有三种模式：<br> `IMAGE`：单张图像输入的模式。<br> `VIDEO`：视频解码帧的模式。<br> `LIVE_STREAM`：输入数据（例如来自相机）的实时流模式。在此模式下，`ImageSegmenterLiveStreamDelegate` 必须设置为实现了 `ImageSegmenterLiveStreamDelegate` 的类的实例，以异步接收分割结果。 | {`RunningMode.image`, `RunningMode.video`, `RunningMode.liveStream`} | `RunningMode.image` |
| `shouldOutputCategoryMask` | 如果设置为 `True`，则输出包含作为 uint8 图像的分割掩码，其中每个像素值指示获胜类别值。 | {`True`, `False`} | `False` |
| `shouldOutputConfidenceMasks` | 如果设置为 `True`，则输出包含作为浮点值图像的分割掩码，其中每个浮点值代表该类别的置信度得分映射。 | {`True`, `False`} | `True` |
| `displayNamesLocale` | 设置模型元数据中提供的显示名称的标签语言（如果可用）。默认为 `en`（英语）。您可以使用 [TensorFlow Lite Metadata Writer API](https://www.tensorflow.org/lite/models/convert/metadata_writer_tutorial) 向自定义模型的元数据中添加本地化标签。 | 区域代码 | `en` |
| `result_callback` | 当图像分割器处于 `LIVE_STREAM` 模式时，设置结果监听器以异步接收分割结果。只能在运行模式设置为 `LIVE_STREAM` 时使用。 | N/A | N/A |

当运行模式设置为 `LIVE_STREAM` 时，图像分割器需要额外的 `imageSegmenterLiveStreamDelegate` 配置选项，这使图像分割器能够异步传递图像分割结果。委托必须实现 `imageSegmenter(_:didFinishSegmentation:timestampInMilliseconds:error:)` 方法，该方法会在图像分割器处理完每帧的分割结果后被调用。

| 选项名称 | 描述 | 值范围 | 默认值 |
| --- | --- | --- | --- |
| `imageSegmenterLiveStreamDelegate` | 使图像分割器能够在实时流模式下异步接收执行图像分割的结果。其实例设置为此属性的类必须实现 `imageSegmenter(_:didFinishSegmentation:timestampInMilliseconds:error:)` 方法。 | 不适用 | 未设置 |

## 准备数据 (Prepare data)

您需要将输入图像或帧转换为 `MPImage` 对象，然后再传递给图像分割器。`MPImage` 支持不同类型的 iOS 图像格式，并可在任何运行模式下使用它们进行推理。有关 `MPImage` 的更多信息，请参阅 [MPImage API](/edge/api/mediapipe/swift/vision/Classes/MPImage)。

根据您的用例和应用程序所需的运行模式选择 iOS 图像格式。`MPImage` 接受 `UIImage`、`CVPixelBuffer` 和 `CMSampleBuffer` 等 iOS 图像格式。

### UIImage

`UIImage` 格式非常适合以下运行模式：

* 图像：来自应用程序包、用户图库或格式化为 `UIImage` 图像的文件系统的图像可以转换为 `MPImage` 对象。
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

该示例使用默认的 [UIImage.Orientation.Up](https://developer.apple.com/documentation/uikit/uiimage/orientation/up) 方向初始化 `MPImage`。您可以使用任何支持的 [UIImage.Orientation](https://developer.apple.com/documentation/uikit/uiimage/orientation) 值初始化 `MPImage`。图像分割器不支持诸如 `.upMirrored`、`.downMirrored`、`.leftMirrored`、`.rightMirrored` 之类的镜像方向。

有关 `UIImage` 的更多信息，请参阅 [UIImage Apple 开发者文档](https://developer.apple.com/documentation/uikit/uiimage)。

### CVPixelBuffer

`CVPixelBuffer` 格式非常适合生成帧并使用 iOS [CoreImage](https://developer.apple.com/documentation/coreimage) 框架进行处理的应用程序。

`CVPixelBuffer` 格式非常适合以下运行模式：

* 图像：应用程序在使用 iOS 的 `CoreImage` 框架进行某些处理后生成 `CVPixelBuffer` 图像，可以将其在图像运行模式下发送给图像分割器。
* 视频：视频帧可以转换为 `CVPixelBuffer` 格式进行处理，然后在视频模式下发送给图像分割器。
* 实时流：使用 iOS 相机生成帧的应用程序可以在发送给实时流模式的图像分割器之前转换为 `CVPixelBuffer` 格式进行处理。

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

`CMSampleBuffer` 格式存储统一媒体类型的媒体样本，并且非常适合实时流运行模式。来自 iOS 相机的实时帧由 iOS [AVCaptureVideoDataOutput](https://developer.apple.com/documentation/avfoundation/avcapturevideodataoutput) 以 `CMSampleBuffer` 格式异步传递。

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

要运行图像分割器，请使用分配给运行模式特定的 `segment()` 方法：

* 静态图像：`segment(image:)`
* 视频：`segment(videoFrame:timestampInMilliseconds:)`
* 实时流：`segmentAsync(image:timestampInMilliseconds:)`

以下代码示例展示了如何在这些不同运行模式下运行图像分割器的简单示例：

### Swift

### 图像 (Image)

```
let result = try imageSegmenter.segment(image: image)
```

### 视频 (Video)

```
let result = try imageSegmenter.segment(
  videoFrame: image,
  timestampInMilliseconds: timestamp)
```

### 实时流 (Live stream)

```
try imageSegmenter.segmentAsync(
  image: image,
  timestampInMilliseconds: timestamp)
```

### Objective-C

### 图像 (Image)

```
MPPImageSegmenterResult *result =
  [imageSegmenter segmentImage:image error:nil];
```

### 视频 (Video)

```
MPPImageSegmenterResult *result =
  [imageSegmenter segmentVideoFrame:image
            timestampInMilliseconds:timestamp
                              error:nil];
```

### 实时流 (Live stream)

```
BOOL success =
  [imageSegmenter segmentAsyncImage:image
            timestampInMilliseconds:timestamp
                              error:nil];
```

图像分割器代码示例更详细地展示了这些模式的实现：`segment(image:)`、`segment(videoFrame:timestampInMilliseconds:)` 和 `segmentAsync(image:timestampInMilliseconds:)`。

请注意以下事项：

* 在视频模式或实时流模式下运行时，您还必须为图像分割器任务提供输入帧的时间戳。
* 在图像或视频模式下运行时，图像分割器任务会阻塞当前线程，直到完成输入图像或帧的处理。为了避免阻塞当前线程，请使用 iOS [Dispatch](https://developer.apple.com/documentation/dispatch) 或 [NSOperation](https://developer.apple.com/documentation/foundation/nsoperation) 框架在后台线程中执行处理。
* 在实时流模式下运行时，图像分割器任务立即返回，并且不会阻塞当前线程。它会在处理完每个输入帧后调用 `imageSegmenter(_:didFinishSegmentation:timestampInMilliseconds:error:)` 方法及其自身。图像分割器会在专用的串行调度队列中异步调用该方法。要在用户界面上显示结果，请在处理完结果后将结果分发到主队列 (main queue)。如果在图像分割器任务正忙于处理另一帧时调用 `segmentAsync` 函数，图像分割器将忽略该新的输入帧。

## 处理和显示结果 (Handle and display results)

在运行推理后，图像分割器任务返回一个 `ImageSegmenterResult` 对象，其中包含分割任务的结果。输出内容取决于您在[配置](../image_segmenter/ios.md#configuration_options)任务时设置的输出类型。

以下图像展示了任务输出对于类别值掩码的可视化效果。类别掩码范围为 `[0, 255]`，每个像素值代表模型输出中的获胜类别索引。获胜类别索引具有模型可以识别的类别中的最高分数。

![Two girls riding a horse and one girl walking beside the horse](../../../../assets/misc/image-segmenter-example-input.jpg)
![The image mask that outlines the shape of the girls and horse from the previous image. The shape of all three girls and the horse are masked accurately](../../../../assets/misc/image-segmenter-category-output.jpg)

**原始图像和类别掩码输出。源图像来自 [Pascal VOC 2012](https://www.kaggle.com/datasets/huanghanchina/pascal-voc-2012) 数据集。**

> **注意：** 在第二张输出图像中，像素值乘以 10 以增加对比度并改善可视化效果。

图像分割器示例代码演示了如何显示图像分割器的结果，有关详细信息，请参阅[代码示例](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/ios)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*