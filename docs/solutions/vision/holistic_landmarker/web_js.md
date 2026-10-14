---
title: "Web 整体关键点检测指南 (Holistic landmark detection guide for Web)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/holistic_landmarker/web_js"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-19 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Web 整体关键点检测指南 (Holistic landmark detection guide for Web)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/holistic_landmarker/web_js)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Holistic Landmarker(整体关键点检测器)任务可让您组合面部、手部和姿态关键点检测器的组件,在图像或视频中检测人体关键点。该任务以归一化图像坐标和 3 维世界坐标输出整体关键点。

以下说明向您展示如何在 Web 和 JavaScript 应用中使用 Holistic Landmarker。有关此任务的功能、模型和配置选项的更多信息,请参阅[概览](../holistic_landmarker.md)。

## 代码示例

Holistic Landmarker 示例代码提供了此任务在 JavaScript 中的完整实现,供您参考。此代码可帮助您测试此任务,并开始构建自己的整体关键点检测应用。您只需使用 Web 浏览器即可查看、运行和编辑 Holistic Landmarker [示例](https://stackblitz.com/github/google-ai-edge/mediapipe-samples-web/?file=src%2Ftasks%2Fholistic-landmarker.ts)。

## 环境配置

本节介绍为使用 Holistic Landmarker 而设置开发环境的关键步骤。有关设置 Web 和 JavaScript 开发环境的一般信息(包括平台版本要求),请参阅 [Web 环境配置指南](../../setup_web.md)。

### JavaScript 软件包

Holistic Landmarker 代码可通过 MediaPipe 的 `@mediapipe/tasks-vision` [NPM](https://www.npmjs.com/search?q=%40mediapipe) 软件包获取。您可以按照平台[环境配置指南](../../setup_web.md#downloads)中的说明查找并下载这些库。

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

MediaPipe Holistic Landmarker 任务需要一个与此任务兼容的已训练模型包。有关 Holistic Landmarker 可用已训练模型的更多信息,请参阅任务概览中的[模型部分](../holistic_landmarker.md#models)。

选择并下载模型,然后将其存放在项目目录中:

```
<dev-project-root>/app/shared/models/
```

## 创建任务

使用 Holistic Landmarker 的某个 `createFrom...()` 函数来准备任务以运行推理。使用 `createFromModelPath()` 函数并传入已训练模型文件的相对或绝对路径。如果您的模型已加载到内存中,可以使用 `createFromModelBuffer()` 方法。

下面的代码示例演示了如何使用 `createFromOptions()` 函数来设置任务。`createFromOptions()` 函数允许您通过配置选项自定义 Holistic Landmarker。有关配置选项的更多信息,请参阅[配置选项](#configuration_options)。

以下代码演示了如何使用自定义选项构建和配置任务:

```
const vision = await FilesetResolver.forVisionTasks(
  // 指向 wasm 根目录的路径
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
);
const holisticLandmarker = await HolisticLandmarker.createFromOptions(
    vision,
    {
      baseOptions: {
        modelAssetPath: "path/to/model"
      },
      minFaceDetectionConfidence: 0.5,
      minPoseDetectionConfidence: 0.5,
      minHandLandmarksConfidence: 0.5,
      runningMode: runningMode
    });
```

### 配置选项

此任务对 Web 和 JavaScript 应用有以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `runningMode` | 设置任务的运行模式。共有两种模式:<br><br>IMAGE:用于单张图像输入的模式。<br><br>VIDEO:用于视频已解码帧或输入数据实时流(如来自摄像头)的模式。 | {`IMAGE, VIDEO`} | `IMAGE` |
| `minFaceDetectionConfidence` | 面部检测被视为成功所需的最低置信度分数。 | `Float [0.0, 1.0]` | `0.5` |
| `minFaceSuppressionThreshold` | 面部检测被视为重叠所需的最低非极大值抑制阈值。 | `Float [0.0, 1.0]` | `0.3` |
| `minFacePresenceConfidence` | 面部关键点检测中面部存在分数所需的最低置信度分数。 | `Float [0.0, 1.0]` | `0.5` |
| `minPoseDetectionConfidence` | 姿态检测被视为成功所需的最低置信度分数。 | `Float [0.0, 1.0]` | `0.5` |
| `minPoseSuppressionThreshold` | 姿态检测被视为重叠所需的最低非极大值抑制阈值。 | `Float [0.0, 1.0]` | `0.3` |
| `minPosePresenceConfidence` | 姿态关键点检测中姿态存在分数所需的最低置信度分数。 | `Float [0.0, 1.0]` | `0.5` |
| `minHandLandmarksConfidence` | 手部关键点检测中手部存在分数所需的最低置信度分数。 | `Float [0.0, 1.0]` | `0.5` |
| `outputFaceBlendshapes` | 是否输出面部融合变形 (blendshapes) 分类。面部融合变形用于渲染 3 维面部模型。 | `Boolean` | `false` |
| `outputPoseSegmentationMasks` | 是否输出人体姿态的分割掩码。 | `Boolean` | `false` |

## 准备数据

Holistic Landmarker 可以检测主机浏览器支持的任何格式图像中的整体关键点。该任务还会处理数据输入的预处理,包括调整大小、旋转和值归一化。要在视频中检测关键点,您可以使用该 API 逐帧快速处理,并使用帧的时间戳来确定关键点在视频中出现的时间。

## 运行任务

Holistic Landmarker 使用 `detect()` 方法(运行模式为 `IMAGE`)和 `detectForVideo()` 方法(运行模式为 `VIDEO`)来触发推理。任务会处理数据,尝试检测关键点,然后报告结果。

以下代码演示了如何执行处理:

### 图像

```
const image = document.getElementById("image") as HTMLImageElement;
const result = holisticLandmarker.detect(image);
```

### 视频

```
await holisticLandmarker.setOptions({ runningMode: "VIDEO" });

let lastVideoTime = -1;
function renderLoop(): void {
  const video = document.getElementById("video") as HTMLVideoElement;
  if (video.currentTime !== lastVideoTime) {
    const result = holisticLandmarker.detectForVideo(video, video.currentTime);
    lastVideoTime = video.currentTime;
  }
  requestAnimationFrame(renderLoop);
}
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*