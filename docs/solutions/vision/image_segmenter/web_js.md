---
title: "图像分割器 (Image Segmenter) - Web/JS"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter/web_js"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2024-04-03 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 图像分割器 (Image Segmenter) - Web/JS

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter/web_js)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 图像分割器 (Image Segmenter) 任务允许您根据预定义的类别将图像划分为多个区域，以便应用视觉效果，如背景模糊。这些说明向您展示了如何为 Node 和 Web 应用使用图像分割器。有关此任务的功能、模型和配置选项的更多信息，请参阅[概述](../image_segmenter.md)。

## 代码示例 (Code example)

图像分割器的代码示例提供了一个完整的 JavaScript 实现供您参考。此代码可帮助您测试此任务并开始构建自己的图像分割应用。您可以仅使用 Web 浏览器查看、运行和编辑图像分割器[示例](https://stackblitz.com/github/google-ai-edge/mediapipe-samples-web/?file=src%2Ftasks%2Fimage-segmenter.ts)。

## 设置 (Setup)

本节介绍了特定于使用图像分割器设置开发环境和代码项目的关键步骤。有关设置用于使用 MediaPipe 任务的开发环境（包括平台版本要求）的一般信息，请参阅 [Web 环境配置指南](../../setup_web.md)。

### JavaScript 包 (JavaScript packages)

图像分割器代码通过 MediaPipe `@mediapipe/tasks-vision` [NPM](https://www.npmjs.com/package/@mediapipe/tasks-vision) 包提供。您可以从平台[环境配置指南](../../setup_web.md#downloads)中提供的链接查找并下载这些库。

您可以使用以下命令安装本地暂存所需的软件包：

```
npm install --save @mediapipe/tasks-vision
```

如果您希望通过内容分发网络 (CDN) 服务导入任务代码，请在 HTML 文件的 `<head>` 标签中添加以下代码：

```
<head>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs"
    crossorigin="anonymous"></script>
</head>
```

### 模型 (Model)

MediaPipe 图像分割器任务需要一个与此任务兼容的训练好的模型。有关图像分割器可用预训练模型的更多信息，请参阅任务概述的[模型](../image_segmenter.md#models)部分。

选择并下载一个模型，然后将其存储在您的项目目录中：

```
<dev-project-root>/app/shared/models/
```

## 创建任务 (Create the task)

使用图像分割器的 `createFrom...()` 函数之一来准备运行推理的任务。使用 `createFromModelPath()` 函数并提供训练好的模型文件的相对或绝对路径。如果您的模型已加载到内存中，则可以使用 `createFromModelBuffer()` 方法。

以下代码示例演示了使用 `createFromOptions()` 函数来设置任务。`createFromOptions` 函数允许您使用配置选项自定义图像分割器。有关任务配置的更多信息，请参阅[配置选项](#configuration_options)。

以下代码演示了如何使用自定义选项构建和配置任务：

```
runningMode = "IMAGE";

async function createImageSegmenter() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-assets/deeplabv3.tflite?generation=1661875711618421",
    },
    outputCategoryMask: true,
    outputConfidenceMasks: false
    runningMode: runningMode
  });
}
createImageSegmenter();
```

有关创建图像分割器任务的更完整实现，请参阅[代码示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/workers/image-segmenter.worker.ts)。

### 配置选项 (Configuration options)

此任务具有针对 Web 应用程序的以下配置选项：

| 选项名称 | 描述 | 值范围 | 默认值 |
| --- | --- | --- | --- |
| `outputCategoryMask` | 如果设置为 `True`，则输出包含作为 uint8 图像的分割掩码，其中每个像素值指示获胜类别值。 | {`True`, `False`} | `False` |
| `outputConfidenceMasks` | 如果设置为 `True`，则输出包含作为浮点值图像的分割掩码，其中每个浮点值代表该类别的置信度得分映射。 | {`True`, `False`} | `True` |
| `displayNamesLocale` | 设置模型元数据中提供的显示名称的标签语言（如果可用）。默认为 `en`（英语）。您可以使用 [TensorFlow Lite Metadata Writer API](https://www.tensorflow.org/lite/models/convert/metadata_writer_tutorial) 向自定义模型的元数据中添加本地化标签。 | 区域代码 | `en` |
| `resultListener` | 当图像分割器处于 `LIVE_STREAM` 模式时，设置结果监听器以异步接收分割结果。只能在运行模式设置为 `LIVE_STREAM` 时使用。 | N/A | N/A |

## 准备数据 (Prepare data)

图像分割器可以分割主机浏览器支持的任何格式的图像中的对象。任务还会处理数据输入的预处理，包括调整大小、旋转和数值归一化。

调用图像分割器的 `segment()` 和 `segmentForVideo()` 方法同步运行，并会阻塞用户界面线程。如果您从设备的摄像头中分割视频帧中的对象，则每个分割任务都会阻塞主线程。您可以通过实现 Web Workers（在另一个线程上运行 `segment()` 和 `segmentForVideo()`）来避免这种情况。

## 运行任务 (Run the task)

图像分割器在图像模式下使用 `segment()` 方法，在 `video` 模式下使用 `segmentForVideo()` 方法来触发推理。图像分割器将检测到的分割区域作为图像数据返回给您在为任务运行推理时设置的回调函数。

以下代码演示了如何使用任务模型执行处理：

### 图像 (Image)

```
const image = document.getElementById("image") as HTMLImageElement;
imageSegmenter.segment(image, callback);
```

### 视频 (Video)

```
async function renderLoop(): void {
  const video = document.getElementById("video");
  let startTimeMs = performance.now();

  imageSegmenter.segmentForVideo(video, startTimeMs, callbackForVideo);

  requestAnimationFrame(() => {
    renderLoop();
  });
}
```

有关运行图像分割器任务的更完整实现，请参阅[示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/workers/image-segmenter.worker.ts)。

## 处理和显示结果 (Handle and display results)

在运行推理后，图像分割器任务将分割图像数据返回给回调函数。输出内容取决于您在[配置](#configuration_options)任务时设置的 `outputType`。

以下部分展示了此任务输出数据的示例：

### 类别置信度 (Category confidence)

以下图像展示了类别置信度掩码的任务输出可视化结果。置信度掩码输出包含介于 `[0, 1]` 之间的浮点值。

![Two girls riding a horse and one girl walking beside the horse](../../../../assets/misc/image-segmenter-example-input.jpg)
![The image mask that outlines the shape of the girls and horse from the previous photograph. The left half of the image's outline is captured, but the right half of the image is not](../../../../assets/misc/image-segmenter-confidence-output.png)

**原始图像和类别置信度掩码输出。源图像来自 [Pascal VOC 2012](https://www.kaggle.com/datasets/huanghanchina/pascal-voc-2012) 数据集。**

> **注意：** 在第二张输出图像中，浮点输出值被缩放到 `[0, 255]` 范围内的值，并转换为 uint8 数据类型。

### 类别值 (Category value)

以下图像展示了类别值掩码的任务输出可视化结果。类别掩码范围为 `[0, 255]`，每个像素值代表模型输出中的获胜类别索引。获胜类别索引具有模型可以识别的类别中的最高分数。

![Two girls riding a horse and one girl walking beside the horse](../../../../assets/misc/image-segmenter-example-input.jpg)
![The image mask that outlines the shape of the girls and horse from the previous image. The shape of all three girls and the horse are masked accurately](../../../../assets/misc/image-segmenter-category-output.jpg)

**原始图像和类别掩码输出。源图像来自 [Pascal VOC 2012](https://www.kaggle.com/datasets/huanghanchina/pascal-voc-2012) 数据集。**

> **注意：** 在第二张输出图像中，像素值乘以 10 以增加对比度并改善可视化效果。

图像分割器示例代码演示了如何显示任务返回的分割结果，有关详细信息，请参阅[示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/image-segmenter.ts)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*