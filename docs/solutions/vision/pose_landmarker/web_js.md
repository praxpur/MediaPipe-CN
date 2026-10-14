---
title: "Web 姿态关键点检测指南 (Pose landmark detection guide for Web)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Web 姿态关键点检测指南 (Pose landmark detection guide for Web)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Pose Landmarker(姿态关键点检测器)任务可让您检测图像或视频中人体的关键点。您可以使用此任务识别关键身体部位位置、分析姿态,并对动作进行分类。此任务使用适用于单张图像或视频的机器学习 (ML) 模型。任务会输出图像坐标和 3 维世界坐标下的身体姿态关键点。

这些说明向您展示如何在 Web 和 JavaScript 应用中使用 Pose Landmarker。有关此任务的功能、模型和配置选项的更多信息,请参阅[概览](../pose_landmarker.md)。

## 代码示例

Pose Landmarker 的示例代码提供了此任务在 JavaScript 中的完整实现,供您参考。此代码可帮助您测试此任务,并开始构建自己的姿态关键点检测器应用。您只需使用 Web 浏览器即可查看、运行和编辑 Pose Landmarker [示例](https://stackblitz.com/github/google-ai-edge/mediapipe-samples-web/?file=src%2Ftasks%2Fpose-landmarker.ts)。

## 环境配置

本节介绍为使用 Pose Landmarker 而设置开发环境的关键步骤。有关设置 Web 和 JavaScript 开发环境的一般信息(包括平台版本要求),请参阅 [Web 环境配置指南](../../setup_web.md)。

### JavaScript 软件包

Pose Landmarker 代码可通过 MediaPipe 的 `@mediapipe/tasks-vision` [NPM](https://www.npmjs.com/search?q=%40mediapipe) 软件包获取。您可以按照平台[环境配置指南](../../setup_web.md#downloads)中的说明查找并下载这些库。

您可以使用以下命令通过 NPM 安装所需软件包:

```
npm install @mediapipe/tasks-vision
```

如果您想通过内容分发网络 (CDN) 服务导入任务代码,请在 HTML 文件的 <head> 标签中添加以下代码:

```
<!-- You can replace JSDeliver with another CDN if you prefer -->
<head>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs"
    crossorigin="anonymous"></script>
</head>
```

### 模型

MediaPipe Pose Landmarker 任务需要一个与此任务兼容的已训练模型。有关 Pose Landmarker 可用已训练模型的更多信息,请参阅任务概览中的[模型部分](../pose_landmarker.md#models)。

选择并下载模型,然后将其存储在项目目录中:

```
<dev-project-root>/app/shared/models/
```

## 创建任务

使用某个 Pose Landmarker 的 `createFrom...()` 函数来准备任务以运行推理。对已训练模型文件使用带相对或绝对路径的 `createFromModelPath()` 函数。如果您的模型已加载到内存中,可以使用 `createFromModelBuffer()` 方法。

下面的代码示例演示了使用 `createFromOptions()` 函数来设置任务。`createFromOptions()` 函数允许您通过配置选项自定义 Pose Landmarker。有关配置选项的更多信息,请参阅[配置选项](#configuration_options)。

以下代码演示了如何使用自定义选项构建和配置任务:

```
const vision = await FilesetResolver.forVisionTasks(
  // path/to/wasm/root
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
);
const poseLandmarker = await poseLandmarker.createFromOptions(
    vision,
    {
      baseOptions: {
        modelAssetPath: "path/to/model"
      },
      runningMode: runningMode
    });
```

### 配置选项

此任务对 Web 和 JavaScript 应用有以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `runningMode` | 设置任务的运行模式。共有两种模式:<br><br>IMAGE:用于单张图像输入的模式。<br><br>VIDEO:用于视频已解码帧或输入数据实时流(如来自摄像头)的模式。 | {`IMAGE, VIDEO`} | `IMAGE` |
| `numPoses` | Pose Landmarker 可检测的最大姿态数量。 | `Integer > 0` | `1` |
| `minPoseDetectionConfidence` | 姿态检测被视为成功所需的最低置信度分数。 | `Float [0.0,1.0]` | `0.5` |
| `minPosePresenceConfidence` | 姿态关键点检测中姿态存在分数所需的最低置信度分数。 | `Float [0.0,1.0]` | `0.5` |
| `minTrackingConfidence` | 姿态跟踪被视为成功所需的最低置信度分数。 | `Float [0.0,1.0]` | `0.5` |
| `outputSegmentationMasks` | Pose Landmarker 是否输出检测到的姿态的分割掩码。 | `Boolean` | `False` |

## 准备数据

Pose Landmarker 可以检测宿主浏览器支持的任何格式的图像中的姿态。任务还会处理数据输入的预处理,包括调整大小、旋转和值归一化。要对视频中的姿态进行关键点检测,您可以使用 API 一次快速处理一帧,利用帧的时间戳来确定姿态在视频中出现的时间。

## 运行任务

Pose Landmarker 使用 `detect()`(运行模式为 `IMAGE`)和 `detectForVideo()`(运行模式为 `VIDEO`)方法触发推理。任务处理数据,尝试对姿态进行关键点检测,然后报告结果。

对 Pose Landmarker `detect()` 和 `detectForVideo()` 方法的调用是同步运行的,会阻塞用户交互线程。如果您检测设备摄像头视频帧中的姿态,每次检测都会阻塞主线程。您可以通过实现 Web Worker 在另一个线程上运行 `detect()` 和 `detectForVideo()` 方法来避免这种情况。

以下代码演示了如何使用任务模型执行处理:

### 图像

```ts
const image = document.getElementById("image") as HTMLImageElement;
const poseLandmarkerResult = poseLandmarker.detect(image);
```

### 视频

```ts
await poseLandmarker.setOptions({ runningMode: "VIDEO" });

let lastVideoTime = -1;
function renderLoop(): void {
  const video = document.getElementById("video");

  if (video.currentTime !== lastVideoTime) {
    const poseLandmarkerResult = poseLandmarker.detectForVideo(video);
    processResults(detections);
    lastVideoTime = video.currentTime;
  }

  requestAnimationFrame(() => {
    renderLoop();
  });
}
```

有关运行 Pose Landmarker 任务的更完整实现,请参阅[示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/workers/pose-landmarker.worker.ts)。

## 处理并显示结果

Pose Landmarker 每次检测运行都会返回一个 `poseLandmarkerResult` 对象。结果对象包含每个姿态关键点的坐标。

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

Pose Landmarker 示例代码演示了如何显示任务返回的结果,请参阅[示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/pose-landmarker.ts)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*