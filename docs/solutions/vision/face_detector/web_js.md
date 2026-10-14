---
title: "Web 人脸检测指南 (Face detection guide for Web)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/face_detector/web_js"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Web 人脸检测指南 (Face detection guide for Web)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/face_detector/web_js)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 人脸检测器(Face Detector)任务允许您在图像或视频中检测人脸。您可以使用此任务定位一帧画面中的人脸和面部特征。此任务使用一个机器学习(ML)模型,适用于单张图像或连续的图像流。任务会输出人脸的位置,以及以下面部关键点:左眼、右眼、鼻尖、嘴巴、左耳屏点和右耳屏点。

这些说明介绍如何将人脸检测器用于 Web 和 JavaScript 应用。有关此任务的功能、模型和配置选项的更多信息,请参阅[概览](../face_detector.md)。

## 代码示例 (Code example)

人脸检测器的示例代码提供了此任务在 JavaScript 中的完整实现,供您参考。此代码可帮助您测试此任务,并开始构建自己的人脸检测应用。您只需使用 Web 浏览器即可查看、运行和编辑人脸检测器[示例](https://stackblitz.com/github/google-ai-edge/mediapipe-samples-web?file=src%2Ftasks%2Fface-detector.ts)。

## 环境配置 (Setup)

本节介绍为使用人脸检测器配置开发环境的关键步骤。有关设置 Web 和 JavaScript 开发环境的一般信息(包括平台版本要求),请参阅 [Web 环境配置指南](../../../setup_web.md)。

### JavaScript 软件包 (JavaScript packages)

人脸检测器代码通过 MediaPipe 的 `@mediapipe/tasks-vision` [NPM](https://www.npmjs.com/search?q=%40mediapipe) 软件包提供。您可以按照平台[环境配置指南](../../../setup_web.md#downloads)中的说明查找并下载这些库。

您可以使用 NPM 通过以下命令安装所需的软件包:

```
npm install @mediapipe/tasks-vision
```

如果您希望通过内容分发网络(CDN)服务导入任务代码,请在 HTML 文件的 <head> 标签中添加以下代码:

```
<!-- You can replace JSDeliver with another CDN if you prefer to -->
<head>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs"
    crossorigin="anonymous"></script>
</head>
```

### 模型 (Model)

MediaPipe 人脸检测器任务需要一个与此任务兼容的已训练模型。有关人脸检测器可用已训练模型的更多信息,请参阅任务概览的[模型章节](../face_detector.md#models)。

选择并下载模型,然后将其存储在项目目录中:

```
<dev-project-root>/app/shared/models/
```

## 创建任务 (Create the task)

使用一个人脸检测器的 `createFrom...()` 函数来准备任务以运行推理。将 `createFromModelPath()` 函数与已训练模型文件的相对或绝对路径一起使用。如果您的模型已经加载到内存中,则可以使用 `createFromModelBuffer()` 方法。

下面的代码示例演示了如何使用 `createFromOptions()` 函数来设置任务。`createFromOptions` 函数允许您通过配置选项自定义人脸检测器。有关配置选项的更多信息,请参阅[配置选项](#configuration_options)。

以下代码演示了如何使用自定义选项构建和配置任务:

```
const vision = await FilesetResolver.forVisionTasks(
  // path/to/wasm/root
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
);
const facedetector = await FaceDetector.createFromOptions(
    vision,
    {
      baseOptions: {
        modelAssetPath: "path/to/model"
      },
      runningMode: runningMode
    });
```

### 配置选项 (Configuration options)

此任务对 Web 和 JavaScript 应用有以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `option_var_1_web_js` | 设置任务的运行模式。共有两种模式:<br><br>IMAGE:用于单张图像输入的模式。<br><br>VIDEO:用于视频已解码帧或输入数据实时流(例如来自摄像头)的模式。 | `{IMAGE, VIDEO}` | `IMAGE` |
| `minDetectionConfidence` | 人脸检测被认为成功所需的最低置信度分数。 | `Float [0,1]` | `0.5` |
| `minSuppressionThreshold` | 人脸检测被认为重叠所需的最低非极大值抑制阈值。 | `Float [0,1]` | `0.3` |

## 准备数据 (Prepare data)

人脸检测器可以在宿主机浏览器支持的任何格式的图像中检测人脸。任务还会处理数据输入的预处理,包括缩放、旋转和值归一化。要在视频中检测人脸,您可以使用该 API 一次快速处理一帧,并使用帧的时间戳来确定人脸在视频中出现的时间。

## 运行任务 (Run the task)

人脸检测器使用 `detect()` 方法(将运行模式设置为 `image`)和 `detectForVideo()` 方法(将运行模式设置为 `video`)来触发推理。任务处理数据,尝试检测人脸,然后报告结果。

对人脸检测器 `detect()` 和 `detectForVideo()` 方法的调用会同步运行并阻塞用户界面线程。如果您在设备摄像头的视频帧中检测人脸,每次检测都会阻塞主线程。您可以通过实现 Web Worker 在另一个线程上运行 `detect()` 和 `detectForVideo()` 方法来避免这种情况。

以下代码演示了如何使用任务模型执行处理:

### 图像 (Image)

```
const image = document.getElementById("image") as HTMLImageElement;
const faceDetectorResult = faceDetector.detect(image);
```

### 视频 (Video)

```
await faceDetector.setOptions({ runningMode: "video" });

let lastVideoTime = -1;
function renderLoop(): void {
  const video = document.getElementById("video");

  if (video.currentTime !== lastVideoTime) {
    const detections = faceDetector.detectForVideo(video);
    processResults(detections);
    lastVideoTime = video.currentTime;
  }

  requestAnimationFrame(() => {
    renderLoop();
  });
}
```

有关运行人脸检测器任务的更完整实现,请参阅[示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/workers/face-detector.worker.ts)。

## 处理并显示结果 (Handle and display results)

人脸检测器每次检测都会生成一个人脸检测器结果对象。结果对象包含图像坐标中的人脸和世界坐标中的人脸。

以下展示了此任务输出数据的示例:

```
FaceDetectionResult:
  Detections:
    Detection #0:
      BoundingBox:
        origin_x: 126
        origin_y: 100
        width: 463
        height: 463
      Categories:
        Category #0:
          index: 0
          score: 0.9729152917861938
      NormalizedKeypoints:
        NormalizedKeypoint #0:
          x: 0.18298381567001343
          y: 0.2961040139198303
        NormalizedKeypoint #1:
          x: 0.3302789330482483
          y: 0.29289937019348145
        ... (6 keypoints for each face)
    Detection #1:
      BoundingBox:
        origin_x: 616
        origin_y: 193
        width: 430
        height: 430
      Categories:
        Category #0:
          index: 0
          score: 0.9251380562782288
      NormalizedKeypoints:
        NormalizedKeypoint #0:
          x: 0.6151331663131714
          y: 0.3713381886482239
        NormalizedKeypoint #1:
          x: 0.7460576295852661
          y: 0.38825345039367676
        ... (6 keypoints for each face)
```

下图展示了任务输出的可视化效果:

![两个孩子的脸周围带有边界框](../../../../assets/edge/mediapipe/images/solutions/face-detection-output.png)

如需要不带边界框的图像,请参阅[原始图像](https://pixabay.com/photos/brother-sister-girl-family-boy-977170/)。

人脸检测器示例代码演示了如何显示任务返回的结果,请参阅[示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/face-detector.ts)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*