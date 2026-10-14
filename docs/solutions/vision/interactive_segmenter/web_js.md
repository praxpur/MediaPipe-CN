---
title: "Web 交互式图像分割指南 (Interactive Image Segmentation Guide for Web)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/interactive_segmenter/web_js"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Web 交互式图像分割指南 (Interactive Image Segmentation Guide for Web)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/interactive_segmenter/web_js)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Interactive Image Segmenter(交互式图像分割器)任务接收指示图像中位置的笔画,估计该位置处物体的边界,并返回该物体的分割结果作为图像数据。以下说明介绍如何在 Node 与 Web 应用中使用交互式图像分割器。有关此任务的功能、模型和配置选项的更多信息,请参阅[概述](../interactive_segmenter.md)。

## 代码示例 (Code example)

交互式图像分割器的示例代码提供了此任务在 JavaScript 中的完整实现,供您参考。此代码可帮助您测试此任务,并开始构建自己的交互式图像分割应用。您可以仅使用网络浏览器查看、运行和编辑交互式图像分割器[示例](https://stackblitz.com/github/google-ai-edge/mediapipe-samples-web/?file=src%2Ftasks%2Finteractive-segmenter.ts)。

## 环境配置 (Setup)

本节介绍为使用交互式图像分割器而专门配置开发环境和代码项目的关键步骤。有关使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参阅 [Web 环境配置指南](../../../setup_web.md)。

### JavaScript 软件包

交互式图像分割器代码可通过 MediaPipe `@mediapipe/tasks-vision` [NPM](https://www.npmjs.com/package/@mediapipe/tasks-vision) 软件包获取。您可以从平台[环境配置指南](../../../setup_web.md#downloads)中提供的链接找到并下载这些库。

您可以先使用以下命令进行本地暂存,然后安装所需软件包:

```
npm install --save @mediapipe/tasks-vision
```

如果要通过内容分发网络(CDN)服务导入任务代码,请在 HTML 文件的 `<head>` 标签中添加以下代码:

```
<head>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs"
    crossorigin="anonymous"></script>
</head>
```

### 模型

MediaPipe 交互式图像分割器任务需要一个与此任务兼容的训练好的模型。有关交互式图像分割器可用训练模型的更多信息,请参阅任务概述[模型部分](../interactive_segmenter.md#models)。

选择并下载模型,然后将其存放在项目目录中:

```
<dev-project-root>/app/shared/models/
```

## 创建任务

使用交互式图像分割器的 `createFrom...()` 函数之一来准备任务以运行推理。使用 `createFromModelPath()` 函数并传入训练模型文件的相对或绝对路径。如果模型已加载到内存中,您可以使用 `createFromModelBuffer()` 方法。

以下代码示例演示如何使用 `createFromOptions()` 函数来设置任务。`createFromOptions` 函数允许您通过配置选项自定义交互式图像分割器。有关配置选项的更多信息,请参阅[配置选项](#configuration_options)。

以下代码演示如何使用自定义选项构建和配置任务:

```
async function createSegmenter() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  interactiveSegmenter = await InteractiveSegmenter.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/interactive_segmenter_v2/magic_touch/int8/latest/interactive_segmentation.task"
    },
  });
}
createSegmenter();
```

### 配置选项

此任务没有任务专属的配置选项。它仅支持所有任务通用的 `BaseOptions` 配置,允许您指定:

- **模型资源路径 (Model asset path)**: 项目内预训练任务模型的位置。
- **委托 (Delegate)**: 用于运行任务的处理硬件(如 CPU 或 GPU)。

## 准备数据

交互式图像分割器可分割宿主浏览器支持的任何格式图像中的物体。任务同样负责数据输入预处理,包括缩放、旋转与数值归一化。

对交互式图像分割器 `setImage()` 和 `segment()` 方法的调用会同步运行并阻塞用户界面线程。您可以通过实现 Web Workers 在另一个线程上运行这些调用来避免阻塞。

## 运行任务

交互式图像分割器使用 `setImage()` 和 `segment()` 方法触发推理。运行任务时,交互式图像分割器返回检测到的分割结果,即单个 `MPMask`。

以下代码演示如何使用任务模型执行处理:

```
const image = document.getElementById("image") as HTMLImageElement;
interactiveSegmenter.setImage(image);

const mask = interactiveSegmenter.segment([
  {
    brushMode: BrushMode.POSITIVE,
    point: [
      {
        x: event.offsetX / event.target.width,
        y: event.offsetY / event.target.height
      }
    ],
    isCompleted: true
  }
]);
```

有关运行交互式图像分割器任务的更完整实现,请参阅[示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/workers/interactive-segmenter.worker.ts)。

## 处理并显示结果

运行推理后,交互式图像分割器任务返回分割图像数据。输出的内容是置信度掩码。

以下小节进一步说明此任务的输出数据:

### 置信度掩码

交互式分割器的输出是单通道置信度掩码,针对图像的每个像素包含 `[0.0, 1.0]` 范围内的浮点值,尺寸与输入图像一致。数值越高,表示该图像像素属于感兴趣区域处物体的置信度越高。

交互式图像分割器示例代码演示了如何显示任务返回的分割结果,详细信息请参阅[示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/interactive-segmenter.ts)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*