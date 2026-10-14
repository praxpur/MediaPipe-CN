---
title: "通用嵌入器指南(Web/JavaScript)(Universal Embedder Guide for Web)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/retrieval/universal_embedder/web_js"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-06 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 通用嵌入器指南(Web/JavaScript)(Universal Embedder Guide for Web)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/retrieval/universal_embedder/web_js)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 通用嵌入器(Universal Embedder)任务将单独的音频、文本和图片嵌入器的功能整合到一个统一的服务中。本指南将向你展示如何在 Web 和 JavaScript 应用中使用 Universal Embedder。

有关此任务的能力、模型和配置选项的更多信息,请参阅[概览](../universal_embedder.md)。

## 代码示例

Universal Embedder 的示例代码提供了该任务在 JavaScript 中的完整实现,供你参考。此代码可帮助你测试该任务,并着手构建你自己的多模态嵌入应用。你可以在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples-web) 上查看 Universal Embedder 示例代码。

## 环境配置

本节介绍专门为使用通用嵌入器而设置开发环境和代码项目的关键步骤。有关使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参阅 [Web 环境配置指南](../../setup_web.md)。

### JavaScript 软件包

Universal Embedder 代码可通过 `@mediapipe/tasks-retrieval` 软件包获取。你可以从[平台环境配置指南](../../setup_web.md)中提供的链接查找并下载这些库。

你可以使用以下命令为本地暂存安装所需软件包:

```bash
npm install @mediapipe/tasks-retrieval
```

如果你希望部署到服务器,可以使用内容分发网络(CDN)服务(例如 [jsDelivr](https://www.jsdelivr.com/))直接将代码添加到你的 HTML 页面,如下所示:

```html
<head>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-retrieval@latest/retrieval_bundle.mjs" crossorigin="anonymous"></script>
</head>
```

### 模型

MediaPipe Universal Embedder 任务需要一个与该任务兼容的已训练模型。有关可用模型的更多信息,请参阅[任务概览中的模型部分](../universal_embedder.md#models)。

你可以下载模型并将其与应用一同托管,或在 `modelAssetPath` 选项中直接通过 URL 引用。

## 创建任务

使用某一个 `UniversalEmbedder` 的 `createFrom...()` 函数来准备任务以运行推理。以下代码示例演示了 `createFromOptions()` 函数的用法:

```js
import { UniversalEmbedder, FilesetResolver } from "@mediapipe/tasks-retrieval";

let universalEmbedder;

async function createEmbedder() {
  const retrieval = await FilesetResolver.forRetrievalTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-retrieval@latest/wasm");
  universalEmbedder = await UniversalEmbedder.createFromOptions(
    retrieval,
    {
      baseOptions: {
        modelAssetPath: "https://huggingface.co/litert-community/embeddinggemma-2-text-vision-440m-litert-lm/resolve/main/embeddinggemma-2-text-vision-440m.litertlm"
      }
    }
  );
}

createEmbedder();
```

## 准备数据并运行推理

`UniversalEmbedder` 为单个输入模态提供不同的推理方法(`embedText`、`embedImage`、`embedAudio`),还提供了一个通用的 `embedContent` API 用于在 Web 端原生处理多模态内容。所有这些方法都是异步的,并返回一个 `Promise`。

### 文本嵌入

将文本原生格式化为 `String`,并调用文本嵌入方法:

```js
const textEmbeddingResult = await universalEmbedder.embedText("The quick brown fox jumps over the lazy dog");
console.log("Text embedding:", textEmbeddingResult.embeddings[0].floatEmbedding);
```

### 图片嵌入

将编码后的图片字节(例如 JPEG 或 PNG 文件的内容)以 `Uint8Array` 形式传入图片嵌入方法:

```js
const response = await fetch("monument.jpg");
const imageBytes = new Uint8Array(await response.arrayBuffer());

const imageEmbeddingResult = await universalEmbedder.embedImage(imageBytes);
console.log("Image embedding:", imageEmbeddingResult.embeddings[0].floatEmbedding);
```

### 音频嵌入

将包含原始音频采样的 `Float32Array` 传入音频嵌入方法:

```js
// 假设你已将音频数据提取到 Float32Array 中(例如来自 AudioContext)
const audioSamples = new Float32Array([...]);

const audioEmbeddingResult = await universalEmbedder.embedAudio(audioSamples);
console.log("Audio embedding:", audioEmbeddingResult.embeddings[0].floatEmbedding);
```

## 处理并显示结果

`UniversalEmbedder` 返回一个 `EmbeddingResult` 对象,该对象通常包含单个 `Embedding`。每个 `Embedding` 都包含高维特征向量,根据配置的不同,该向量可能是原始浮点数或标量量化结果。

```js
function processEmbeddingResult(result) {
    if (result.embeddings.length > 0) {
        const floatVector = result.embeddings[0].floatEmbedding;
        console.log(`Generated an embedding with ${floatVector.length} dimensions.`);
    }
}

processEmbeddingResult(textEmbeddingResult);
```

使用 `UniversalEmbedder.cosineSimilarity()` 工具函数即时计算两个嵌入结果之间的语义相似度:

```js
const similarity = UniversalEmbedder.cosineSimilarity(
  textEmbeddingResult.embeddings[0],
  imageEmbeddingResult.embeddings[0]
);
console.log("Cosine similarity:", similarity);
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*