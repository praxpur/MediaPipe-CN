---
title: "手势识别 Web 指南 (Gesture recognition guide for Web)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer/web_js"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 手势识别 Web 指南 (Gesture recognition guide for Web)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer/web_js)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 手势识别器 (Gesture Recognizer) 任务可让您实时识别手势，并提供识别出的手势结果和检测到的手部关键点 (landmarks)。这些说明向您展示如何在 Web 和 JavaScript 应用程序中使用手势识别器。

您可以通过查看[演示](https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/gesture_recognizer)来了解此任务的实际运行情况。有关此任务的功能、模型和配置选项的更多信息，请参阅[总览 (Overview)](../gesture_recognizer.md)。

## 代码示例 (Code example)

手势识别器的示例代码提供了此任务在 JavaScript 中的完整实现供您参考。此代码可帮助您测试此任务并开始构建自己的手势识别应用程序。您只需使用 Web 浏览器即可查看、运行和编辑手势识别器[示例](https://stackblitz.com/github/google-ai-edge/mediapipe-samples-web?file=src%2Ftasks%2Fgesture-recognizer.ts)。

## 环境配置 (Setup)

本节描述了专为使用手势识别器而设置开发环境的关键步骤。有关设置 Web 和 JavaScript 开发环境（包括平台版本要求）的一般信息，请参阅 [Web 环境配置指南 (Setup guide for web)](../../setup_web.md)。

### JavaScript 包 (JavaScript packages)

手势识别器代码可通过 MediaPipe `@mediapipe/tasks-vision` [NPM](https://www.npmjs.com/package/@mediapipe/tasks-vision) 包获取。您可以按照平台[环境配置指南](../../setup_web.md#downloads)中的说明查找并下载这些库。

您可以使用以下命令通过 NPM 安装所需的包：

```bash
npm install @mediapipe/tasks-vision
```

如果您想通过内容分发网络 (CDN) 服务导入任务代码，请在 HTML 文件的 `<head>` 标签中添加以下代码：

```html
<!-- You can replace JSDeliver with another CDN if you prefer to -->
<head>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs"
    crossorigin="anonymous"></script>
</head>
```

### 模型 (Model)

MediaPipe 手势识别器任务需要一个与该任务兼容的已训练的模型。有关手势识别器可用预训练模型的更多信息，请参阅任务总览中的[模型部分 (Models section)](../gesture_recognizer.md#models)。

选择并下载模型，然后将其存储在您的项目目录中：

```
<dev-project-root>/app/shared/models/
```

## 创建任务 (Create the task)

使用手势识别器的 `createFrom...()` 函数之一来准备任务以运行推理。将 `createFromModelPath()` 函数与已训练模型文件的相对或绝对路径一起使用。如果您的模型已加载到内存中，则可以使用 `createFromModelBuffer()` 方法。

下面的代码示例演示了如何使用 `createFromOptions()` 函数来设置任务。`createFromOptions` 函数允许您使用配置选项自定义手势识别器。有关配置选项的更多信息，请参阅[配置选项 (Configuration options)](#configuration_options)。

以下代码演示了如何使用自定义选项构建和配置任务：

```javascript
// Create task for image file processing:
const vision = await FilesetResolver.forVisionTasks(
  // path/to/wasm/root
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm "
);
const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath: "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task"
  },
  numHands: 2
});
```

### 配置选项 (Configuration options)

此任务具有针对 Web 应用程序的以下配置选项：

| 选项名称 | 描述 | 取值范围 | 默认值 |
| --- | --- | --- | --- |
| `runningMode` | 设置任务的运行模式。共有两种模式：<br> `IMAGE`：用于单张图像输入的模式。<br> `VIDEO`：用于视频解码帧或输入数据实时流（例如来自摄像头）的模式。 | {`IMAGE`, `VIDEO`} | `IMAGE` |
| `num_hands` | `GestureRecognizer` 可以检测到的最大手部数量。 | `任何整数 > 0` | `1` |
| `min_hand_detection_confidence` | 在手掌检测模型中，手部检测被认为成功的最低置信度分数。 | `0.0 - 1.0` | `0.5` |
| `min_hand_presence_confidence` | 手部关键点检测模型中手部存在分数的最低置信度分数。在手势识别器的视频模式和实时流模式下，如果手部关键点模型的手部存在置信度分数低于此阈值，则会触发手掌检测模型。否则，使用轻量级手部跟踪算法来确定随后进行关键点检测的手部位置。 | `0.0 - 1.0` | `0.5` |
| `min_tracking_confidence` | 手部跟踪被认为成功的最低置信度分数。这是当前帧和上一帧中手部之间的边界框 IoU 阈值。在手势识别器的视频模式和流模式下，如果跟踪失败，手势识别器会触发手部检测。否则，跳过手部检测。 | `0.0 - 1.0` | `0.5` |
| `canned_gestures_classifier_options` | 用于配置预制手势分类器行为的选项。预制手势有 `["None", "Closed_Fist", "Open_Palm", "Pointing_Up", "Thumb_Down", "Thumb_Up", "Victory", "ILoveYou"]`<br> - Display names locale（显示名称区域设置）：如果有的话，通过 TFLite 模型元数据指定的用于显示名称的区域设置。<br> - Max results（最大结果数）：要返回的得分最高的分类结果的最大数量。如果 < 0，将返回所有可用结果。<br> - Score threshold（分数阈值）：结果被拒绝的分数下限。如果设置为 0，将返回所有可用结果。<br> - Category allowlist（类别允许列表）：类别名称的允许列表。如果非空，类别不在此集合中的分类结果将被过滤掉。与拒绝列表互斥。<br> - Category denylist（类别拒绝列表）：类别名称的拒绝列表。如果非空，类别在此集合中的分类结果将被过滤掉。与允许列表互斥。 | * Display names locale：`任意字符串` <br> * Max results：`任意整数` <br> * Score threshold：`0.0-1.0` <br> * Category allowlist：`字符串向量 (vector of strings)` <br> * Category denylist：`字符串向量 (vector of strings)` | * Display names locale：`"en"` <br> * Max results：`-1` <br> * Score threshold：`0` <br> * Category allowlist：空 <br> * Category denylist：空 |
| `custom_gestures_classifier_options` | 用于配置自定义手势分类器行为的选项。<br> - Display names locale（显示名称区域设置）：如果有的话，通过 TFLite 模型元数据指定的用于显示名称的区域设置。<br> - Max results（最大结果数）：要返回的得分最高的分类结果的最大数量。如果 < 0，将返回所有可用结果。<br> - Score threshold（分数阈值）：结果被拒绝的分数下限。如果设置为 0，将返回所有可用结果。<br> - Category allowlist（类别允许列表）：类别名称的允许列表。如果非空，类别不在此集合中的分类结果将被过滤掉。与拒绝列表互斥。<br> - Category denylist（类别拒绝列表）：类别名称的拒绝列表。如果非空，类别在此集合中的分类结果将被过滤掉。与允许列表互斥。 | * Display names locale：`任意字符串` <br> * Max results：`任意整数` <br> * Score threshold：`0.0-1.0` <br> * Category allowlist：`字符串向量 (vector of strings)` <br> * Category denylist：`字符串向量 (vector of strings)` | * Display names locale：`"en"` <br> * Max results：`-1` <br> * Score threshold：`0` <br> * Category allowlist：空 <br> * Category denylist：空 |

## 准备数据 (Prepare data)

手势识别器可以识别宿主浏览器支持的任何格式的图像中的手势。该任务还处理数据输入预处理，包括调整大小、旋转和值归一化。要识别视频中的手势，您可以使用 API 快速一次处理一帧，使用帧的时间戳来确定视频中发生手势的时间。

## 运行任务 (Run the task)

手势识别器使用 `recognize()`（运行模式为 `'image'`）和 `recognizeForVideo()`（运行模式为 `'video'`）方法来触发推理。任务处理数据，尝试识别手势，然后报告结果。

以下代码演示了如何使用任务模型执行处理：

### 图像 (Image)

```javascript
const image = document.getElementById("image") as HTMLImageElement;
const gestureRecognitionResult = gestureRecognizer.recognize(image);
```

### 视频 (Video)

```javascript
await gestureRecognizer.setOptions({ runningMode: "video" });

let lastVideoTime = -1;
function renderLoop(): void {
  const video = document.getElementById("video");

  if (video.currentTime !== lastVideoTime) {
    const gestureRecognitionResult = gestureRecognizer.recognizeForVideo(video);
    processResult(gestureRecognitionResult);
    lastVideoTime = video.currentTime;
  }

  requestAnimationFrame(() => {
    renderLoop();
  });
}
```

对手势识别器 `recognize()` 和 `recognizeForVideo()` 方法的调用同步运行，并阻塞用户界面线程。如果您从设备摄像头中识别视频帧中的手势，每次识别都会阻塞主线程。您可以通过实现 Web workers (Web workers) 在另一个线程上运行 `recognize()` 和 `recognizeForVideo()` 方法来防止这种情况。

有关运行手势识别器任务的更完整实现，请参阅[示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/workers/gesture-recognizer.worker.ts)。

## 处理和显示结果 (Handle and display results)

手势识别器会为每次识别运行生成一个手势检测结果对象。结果对象包含图像坐标中的手部关键点、世界坐标中的手部关键点、惯用手（左手/右手）以及检测到的手部的手势类别。

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

![呈现比出大拇指朝上手势的手，并在手上映射出骨骼结构](../../../../assets/misc/web_js/gesture-recognizer.png)

有关创建手势识别器任务的更完整实现，请参阅[示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/gesture-recognizer.ts)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*
