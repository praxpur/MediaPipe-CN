---
title: "Web 图像嵌入指南 (Image embedding guide for Web)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/image_embedder/web_js"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Web 图像嵌入指南 (Image embedding guide for Web)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/image_embedder/web_js)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 图像嵌入器(Image Embedder)任务可将图像数据转换为数值表示形式,以完成与 ML 相关的图像处理任务,例如比较两张图像的相似度。这些说明向您展示如何将图像嵌入器用于 Node 和 Web 应用。

有关此任务的功能、模型和配置选项的更多信息,请参阅[概览](../image_embedder.md)。

## 代码示例 (Code example)

图像嵌入器的示例代码提供了此任务在 JavaScript 中的完整实现,供您参考。此代码可帮助您测试此任务,并开始构建自己的图像嵌入应用。您只需使用 Web 浏览器即可查看、运行和编辑图像嵌入器[示例](https://stackblitz.com/github/google-ai-edge/mediapipe-samples-web?file=src%2Ftasks%2Fimage-embedder.ts)。

## 环境配置 (Setup)

本节介绍为使用图像嵌入器配置开发环境和代码项目的关键步骤。有关使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参阅 [Web 环境配置指南](../../../setup_web.md)。

### JavaScript 软件包 (JavaScript packages)

图像嵌入器代码可通过 MediaPipe 的 `@mediapipe/tasks-vision` [NPM](https://www.npmjs.com/search?q=%40mediapipe) 软件包获得。您可以从平台[环境配置指南](../../../setup_web.md#downloads)中提供的链接查找并下载这些库。

您可以使用以下命令安装所需的软件包,以便进行本地暂存:

```
npm install @mediapipe/tasks-vision
```

如果您想通过内容分发网络(CDN)服务导入任务代码,请在 HTML 文件的 `<head>` 标签中添加以下代码:

```
<!-- 如果您愿意,可以用您喜欢的其他 CDN 替换 jsDelivr -->
<head>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs"
    crossorigin="anonymous"></script>
</head>
```

### 模型 (Model)

MediaPipe 图像嵌入器任务需要一个与此任务兼容的已训练模型。有关图像嵌入器可用已训练模型的更多信息,请参阅任务概览的[模型章节](../image_embedder.md#models)。

选择并下载模型,然后将其存储在您的项目目录中:

```
<dev-project-root>/app/shared/models/
```

## 创建任务 (Create the task)

### 指定模型路径 (Specify a model path)

您可以使用 `createFromModelPath()` 方法以默认选项创建任务:

```
const vision = await FilesetResolver.forVisionTasks(
  // path/to/wasm/root
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
);
  const imageEmbedder = await ImageEmbedder.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/image_embedder/mobilenet_v3_small/float32/1/mobilenet_v3_small.tflite`
    },
  });
```

### 指定模型缓冲区 (Specify the model buffer)

如果您的模型已经加载到内存中,则可以使用 `createFromModelBuffer()` 方法:

```
const vision = await FilesetResolver.forVisionTasks(
  // path/to/wasm/root
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
);
const imageEmbedder = ImageEmbedder.createFromModelBuffer(
    vision, 
    new Uint8Array(...)
);
```

### 指定自定义选项 (Specify custom options)

MediaPipe 图像嵌入器任务使用 `createFromOptions` 函数来设置任务。`createFromOptions` 函数接受配置选项的值。有关配置选项的更多信息,请参阅[配置选项](#configuration_options)。

以下代码演示了如何使用自定义选项构建和配置任务:

```
const vision = await FilesetResolver.forVisionTasks(
  // path/to/wasm/root
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
);
const imageEmbedder = await ImageEmbedder.createFromOptions(
    vision,
    {
      baseOptions: {
        modelAssetPath: "model.tflite"
      },
      quantize: true
    });
```

### 配置选项 (Configuration options)

此任务为 Web 应用提供以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
| --- | --- | --- | --- |
| `running_mode` | 设置任务的运行模式。共有两种模式:IMAGE:用于单张图像输入的模式。VIDEO:用于视频解码帧或输入数据实时流(例如来自摄像头)的模式。 | {`IMAGE, VIDEO`} | `IMAGE` |
| `l2Normalize` | 是否使用 L2 范数对返回的特征向量进行归一化。仅当模型尚未包含原生的 L2\_NORMALIZATION TFLite Op 时才使用此选项。在大多数情况下,模型已经包含该 Op,因此通过 TFLite 推理即可实现 L2 归一化,无需此选项。 | `Boolean` | `False` |
| `quantize` | 返回的嵌入是否通过标量量化量化为字节。嵌入被隐式假定为单位范数,因此任何维度都保证值在 [-1.0, 1.0] 范围内。如果不是这种情况,请使用 l2Normalize 选项。 | `Boolean` | `False` |

## 准备数据 (Prepare data)

图像嵌入器可以嵌入宿主浏览器支持的任意格式的图像。该任务还处理数据输入预处理,包括调整大小、旋转和数值归一化。

对图像嵌入器 `embed()` 和 `embedForVideo()` 方法的调用是同步运行的,会阻塞用户界面线程。如果您想从视频帧中提取特征向量,每次嵌入都会阻塞主线程。您可以通过实现 Web 工作线程(web workers)在另一个线程上运行 `embed()` 和 `embedForVideo()` 方法来避免这种情况。

## 运行任务 (Run the task)

图像嵌入器使用 `embed()`(运行模式为 `image`)和 `embedForVideo()`(运行模式为 `video`)方法来触发推理。图像嵌入器 API 将返回输入图像的嵌入向量。

以下代码演示了如何使用任务模型执行处理:

### 图像 (Image)

```
const image = document.getElementById("image") as HTMLImageElement;
const imageEmbedderResult = imageEmbedder.embed(image);
```

### 视频 (Video)

```
  const video = document.getElementById("webcam");

  const startTimeMs = performance.now();
  const embedderResult = await imageEmbedder.embedForVideo(video, startTimeMs);
```

## 处理并显示结果 (Handle and display results)

运行推理后,图像嵌入器任务会返回一个 `ImageEmbedderResult` 对象,其中包含输入图像或帧的嵌入向量。

以下内容展示了此任务的输出数据示例:

```
ImageEmbedderResult:
  Embedding #0 (sole embedding head):
    float_embedding: {0.0, 0.0, ..., 0.0, 1.0, 0.0, 0.0, 2.0}
    head_index: 0
```

该结果是通过嵌入以下图像获得的:

![一只异国猫的中景照片](../../../../assets/edge/mediapipe/images/solutions/image-embedder.jpg)

您可以使用 `ImageEmbedder.cosineSimilarity` 函数比较两个嵌入的语义相似度。请参见以下代码示例。

```
// 计算余弦相似度。
const similarity = ImageEmbedder.cosineSimilarity(
  imageEmbedderResult.embeddings[0],
  otherEmbedderResult.embeddings[0]);
```

图像嵌入器示例代码演示了如何显示任务返回的嵌入结果,详情请参阅[示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/image-embedder.ts)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*