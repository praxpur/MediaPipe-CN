---
title: "Web 手部关键点检测指南 (Hand landmarks detection guide for Web)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2024-05-14 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Web 手部关键点检测指南 (Hand landmarks detection guide for Web)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Hand Landmarker 任务可让您检测图像中手部的关键点 (landmarks)。
本说明向您展示如何将 Hand Landmarker 用于 Web 和 JavaScript 应用。

有关此任务的功能、模型和配置选项的更多信息，请参阅[概述](../hand_landmarker.md)。

## 代码示例 (Code example)

Hand Landmarker 的示例代码为您提供了在 JavaScript 中完整实现此任务的参考。这段代码可以帮助您测试该任务并开始构建您自己的手部关键点检测应用。您只需使用 Web 浏览器即可查看、运行和编辑 Hand Landmarker [示例](https://stackblitz.com/github/google-ai-edge/mediapipe-samples-web?file=src%2Ftasks%2Fhand-landmarker.ts)。

## 环境配置 (Setup)

本节介绍专门为使用 Hand Landmarker 配置开发环境的关键步骤。有关配置 Web 和 JavaScript 开发环境（包括平台版本要求）的通用信息，请参阅 [Web 环境配置指南](../../setup_web.md)。

### JavaScript 包 (JavaScript packages)

Hand Landmarker 代码通过 MediaPipe 的 `@mediapipe/tasks-vision` [NPM](https://www.npmjs.com/search?q=%40mediapipe) 包提供。您可以按照平台[环境配置指南](../../setup_web.md#downloads)中的说明找到并下载这些库。

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

MediaPipe Hand Landmarker 任务需要一个与此任务兼容的训练好的模型。有关 Hand Landmarker 的可用训练模型的更多信息，请参阅任务概述的[模型部分](../hand_landmarker.md#models)。

选择并下载一个模型，然后将其存储在您的项目目录中：

```
<dev-project-root>/app/shared/models/
```

## 创建任务 (Create the task)

使用其中一个 Hand Landmarker `createFrom...()` 函数来准备任务以运行推理。使用带有训练模型文件的相对或绝对路径的 `createFromModelPath()` 函数。如果您的模型已加载到内存中，则可以使用 `createFromModelBuffer()` 方法。

以下代码示例演示了使用 `createFromOptions()` 函数来设置任务。`createFromOptions` 函数允许您使用配置选项自定义 Hand Landmarker。有关配置选项的更多信息，请参阅[配置选项](#configuration_options)。

以下代码演示了如何使用自定义选项构建和配置任务：

```javascript
const vision = await FilesetResolver.forVisionTasks(
  // path/to/wasm/root
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
);
const handLandmarker = await HandLandmarker.createFromOptions(
    vision,
    {
      baseOptions: {
        modelAssetPath: "hand_landmarker.task"
      },
      numHands: 2
    });
```

### 配置选项 (Configuration options)

此任务为 Web 和 JavaScript 应用程序提供以下配置选项：

| 选项名称 (Option Name) | 说明 (Description) | 值范围 (Value Range) | 默认值 (Default Value) |
| --- | --- | --- | --- |
| `runningMode` | 设置任务的运行模式。有两种模式：IMAGE：用于单张图像输入的模式。VIDEO：用于视频解码帧或输入数据实时流（例如来自摄像头的）的模式。 | {`IMAGE, VIDEO`} | `IMAGE` |
| `numHands` | Hand landmark detector 检测到的最大手部数量。 | `Any integer > 0` | `1` |
| `minHandDetectionConfidence` | 在手掌检测模型中，手部检测被视为成功的最低置信度得分。 | `0.0 - 1.0` | `0.5` |
| `minHandPresenceConfidence` | 手部关键点检测模型中手部存在得分的最低置信度得分。在 Video 模式和 Live stream 模式下，如果来自手部关键点模型的手部存在置信度得分低于此阈值，Hand Landmarker 会触发手掌检测模型。否则，轻量级手部跟踪算法将确定手的位置以进行后续的关键点检测。 | `0.0 - 1.0` | `0.5` |
| `minTrackingConfidence` | 手部跟踪被视为成功的最低置信度得分。这是当前帧和上一帧中手部之间的边界框 IoU 阈值。在 Hand Landmarker 的 Video 模式和 Stream 模式下，如果跟踪失败，Hand Landmarker 会触发手部检测。否则，它会跳过手部检测。 | `0.0 - 1.0` | `0.5` |

## 准备数据 (Prepare data)

Hand Landmarker 可以检测主机浏览器支持的任何格式图像中的手部关键点。该任务还处理数据输入的预处理，包括缩放、旋转和值归一化。要检测视频中的手部关键点，您可以使用 API 快速一次处理一帧，使用该帧的时间戳来确定手部关键点在视频中出现的时间。

## 运行任务 (Run the task)

Hand Landmarker 使用 `detect()`（运行模式为 `image`）和 `detectForVideo()`（运行模式为 `video`）方法来触发推理。该任务处理数据，尝试检测手部关键点，然后报告结果。

对 Hand Landmarker `detect()` 和 `detectForVideo()` 方法的调用是同步运行的，并且会阻塞用户界面线程。如果您检测设备摄像头的视频帧中的手部关键点，则每次检测都会阻塞主线程。您可以通过实现 Web Workers 以在另一个线程上运行 `detect()` 和 `detectForVideo()` 方法来防止这种情况。

以下代码演示了如何使用任务模型执行处理：

### 图像 (Image)

```javascript
const image = document.getElementById("image") as HTMLImageElement;
const handLandmarkerResult = handLandmarker.detect(image);
```

### 视频 (Video)

```javascript
await handLandmarker.setOptions({ runningMode: "video" });

let lastVideoTime = -1;
function renderLoop(): void {
  const video = document.getElementById("video");

  if (video.currentTime !== lastVideoTime) {
    const detections = handLandmarker.detectForVideo(video);
    processResults(detections);
    lastVideoTime = video.currentTime;
  }

  requestAnimationFrame(() => {
    renderLoop();
  });
}
```

有关运行 Hand Landmarker 任务的更完整实现，请参阅[示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/workers/hand-landmarker.worker.ts)。

## 处理和显示结果 (Handle and display results)

Hand Landmarker 每次检测运行都会生成一个手部关键点检测结果对象。结果对象包含图像坐标中的手部关键点、世界坐标中的手部关键点以及检测到的手部的惯用手 (handedness，左手/右手)。

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

Hand Landmarker 示例代码演示了如何显示从任务返回的结果，请参阅[示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/hand-landmarker.ts)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*
