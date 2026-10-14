---
title: "Web 图像分类指南 (Image classification guide for Web)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/image_classifier/web_js"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Web 图像分类指南 (Image classification guide for Web)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/image_classifier/web_js)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 图像分类器(Image Classifier)任务可在图像上执行分类。您可以使用此任务,识别图像在训练时定义的一组类别中代表的内容。这些说明向您展示如何将图像分类器用于 Node 和 Web 应用。

您可以通过查看[演示](https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_classifier)来了解此任务的实际效果。有关此任务的功能、模型和配置选项的更多信息,请参阅[概览](../image_classifier.md)。

## 代码示例 (Code example)

图像分类器的示例代码提供了此任务在 JavaScript 中的完整实现,供您参考。此代码可帮助您测试此任务,并开始构建自己的图像分类应用。您只需使用 Web 浏览器即可查看、运行和编辑图像分类器[示例](https://stackblitz.com/github/google-ai-edge/mediapipe-samples-web/?file=src%2Ftasks%2Fimage-classifier.ts)。

## 环境配置 (Setup)

本节介绍为使用图像分类器配置开发环境和代码项目的关键步骤。有关使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参阅 [Web 环境配置指南](../../../setup_web.md)。

### JavaScript 软件包 (JavaScript packages)

图像分类器代码可通过 MediaPipe 的 `@mediapipe/tasks-vision` [NPM](https://www.npmjs.com/search?q=%40mediapipe) 软件包获得。您可以从平台[环境配置指南](../../../setup_web.md#downloads)中提供的链接查找并下载这些库。

您可以使用以下命令安装所需的软件包,以便进行本地暂存:

```
npm install @mediapipe/tasks-vision
```

如果您想通过内容分发网络(CDN)服务导入任务代码,请在 HTML 文件的 `<head>` 标签中添加以下代码:

```
<!-- 如果您愿意,可以用其他 CDN 替换 JSDeliver -->
<head>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs"
    crossorigin="anonymous"></script>
</head>
```

### 模型 (Model)

MediaPipe 图像分类器任务需要一个与此任务兼容的已训练模型。有关图像分类器可用已训练模型的更多信息,请参阅任务概览的[模型章节](../image_classifier.md#models)。

选择并下载模型,然后将其存储在您的项目目录中:

```
<dev-project-root>/app/shared/models/
```

## 创建任务 (Create the task)

使用图像分类器的某个 `createFrom...()` 函数来准备任务以运行推理。使用 `createFromModelPath()` 函数,并传入已训练模型文件的相对或绝对路径。如果您的模型已经加载到内存中,则可以使用 `createFromModelBuffer()` 方法。

下面的代码示例演示了如何使用 `createFromOptions()` 函数来设置任务。`createFromOptions` 函数允许您使用配置选项自定义图像分类器。有关配置选项的更多信息,请参阅[配置选项](#configuration_options)。

以下代码演示了如何使用自定义选项构建和配置任务:

```
async function createImageClassifier {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  imageClassifier = await ImageClassifier.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/image_classifier/efficientnet_lite0/float32/1/efficientnet_lite0.tflite`
    },
  });
}
```

### 配置选项 (Configuration options)

此任务为 Web 应用提供以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
| --- | --- | --- | --- |
| `runningMode` | 设置任务的运行模式。共有两种模式:IMAGE:用于单张图像输入的模式。VIDEO:用于视频解码帧或输入数据实时流(例如来自摄像头)的模式。 | {`IMAGE, VIDEO`} | `IMAGE` |
| `displayNamesLocale` | 设置任务模型元数据中提供的显示名称所用标签的语言(如果有)。默认为 `en`(英语)。您可以使用 [TensorFlow Lite Metadata Writer API](https://ai.google.dev/edge/lite/models/metadata_writer_tutorial) 向自定义模型的元数据中添加本地化标签 | 语言区域代码 | en |
| `maxResults` | 设置要返回的得分最高的分类结果的可选最大数量。如果 < 0,则返回所有可用结果。 | 任意正数 | `-1` |
| `scoreThreshold` | 设置预测分数阈值,该阈值会覆盖模型元数据中提供的阈值(如果有)。低于此值的结果会被拒绝。 | 任意浮点数 | 未设置 |
| `categoryAllowlist` | 设置允许的类别名称的可选列表。如果非空,则类别名称不在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `categoryDenylist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |
| `categoryDenylist` | 设置不允许的类别名称的可选列表。如果非空,则类别名称在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `categoryAllowlist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |
| `resultListener` | 设置结果监听器,当图像分类器处于实时流模式时异步接收分类结果。仅当运行模式设置为 `LIVE_STREAM` 时才能使用 | 不适用 | 未设置 |

## 准备数据 (Prepare data)

图像分类器可以对宿主浏览器支持的任意格式的图像中的对象进行分类。该任务还处理数据输入预处理,包括调整大小、旋转和数值归一化。

对图像分类器 `classify()` 和 `classifyForVideo()` 方法的调用是同步运行的,会阻塞用户界面线程。如果您要对来自设备摄像头的视频帧中的对象进行分类,每次分类都会阻塞主线程。您可以通过实现 Web 工作线程(web workers)在另一个线程上运行 `classify()` 和 `classifyForVideo()` 来避免这种情况。

## 运行任务 (Run the task)

图像分类器使用 `classify()` 方法(image 模式)和 `classifyForVideo()` 方法(video 模式)来触发推理。图像分类器 API 将返回输入图像中对象的可能类别。

以下代码演示了如何使用任务模型执行处理:

### 图像 (Image)

```
const image = document.getElementById("image") as HTMLImageElement;
const imageClassifierResult = imageClassifier.classify(image);
```

### 视频 (Video)

```
const video = document.getElementById("video");
await imageClassifier.setOptions({ runningMode: "VIDEO" });

const timestamp = performance.now();
const classificationResult = await imageClassifier.classifyForVideo(
    video,
    timestamp
  );
```

有关运行图像分类器任务更完整的实现,请参阅[示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/workers/image-classifier.worker.ts)。

## 处理并显示结果 (Handle and display results)

运行推理后,图像分类器任务会返回一个 `ImageClassifierResult` 对象,其中包含输入图像或帧中对象的可能类别列表。

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

图像分类器示例代码演示了如何显示任务返回的分类结果,详情请参阅[示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/image-classifier.ts)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*