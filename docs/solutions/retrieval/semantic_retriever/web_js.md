---
title: "语义检索器指南(Web)(Semantic retriever guide for Web)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/retrieval/semantic_retriever/web_js"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-06 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 语义检索器指南(Web)(Semantic retriever guide for Web)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/retrieval/semantic_retriever/web_js)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 语义检索器(Semantic Retriever)任务让您能够在端侧高效地摄取和搜索语义向量。本指南介绍如何在 Web 和 JavaScript 应用中使用 Semantic Retriever 实现语义搜索,让您的应用能够基于语义含义而非显式关键词来检索相关条目。

有关此任务的能力、模型和配置选项的更多信息,请参阅[概览](../semantic_retriever.md)。

## 代码示例

语义检索器的示例代码提供了此任务在 JavaScript 中的完整实现,供你参考。此代码可帮助你测试此任务,并着手构建自己的端侧搜索引擎。你可以在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples-web) 上查看语义检索器示例代码。

## 环境配置

本节介绍专门为使用语义检索器而设置开发环境和代码项目的关键步骤。有关使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参阅 [Web 环境配置指南](../../setup_web.md)。

### JavaScript 软件包

语义检索器代码可通过 [`@mediapipe/tasks-retrieval`](https://www.npmjs.com/package/@mediapipe/tasks-retrieval) 软件包获得。你可以从平台[环境配置指南](../../setup_web.md)中提供的链接查找并下载这些库。

你可以使用以下命令安装本地暂存(staging)所需的软件包:

```bash
npm install @mediapipe/tasks-retrieval
```

如果你想要部署到服务器,可以使用内容分发网络(CDN)服务(如 [jsDelivr](https://www.jsdelivr.com/))将代码直接添加到你的 HTML 页面,如下所示:

```html
<head>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-retrieval@latest/retrieval_bundle.mjs" crossorigin="anonymous"></script>
</head>
```

### 模型

为了生成用于填充向量存储的嵌入,MediaPipe 语义检索器任务通常与相应的嵌入模型配合使用。对于 Web 上的多模态应用,强烈推荐使用带 `UniversalEmbedder` 的 **EmbeddingGemma V2** 模型。

有关更多信息,请参阅任务概览的[模型章节](../semantic_retriever.md#models)。你可以下载模型并将其与你的应用一起托管,或者通过 `modelAssetPath` 选项直接引用模型 URL。

## 创建任务

`SemanticRetriever` 并不直接接收模型配置选项,而是通过 `SemanticRetrieverComponents` 将向量存储(如内存向量存储)和 `UniversalEmbedder` 嵌入提供器组合在一起。

```javascript
import { SemanticRetriever, InMemoryVectorStore, UniversalEmbedder, FilesetResolver } from "@mediapipe/tasks-retrieval";

let semanticRetriever;

async function createRetriever() {
  const retrieval = await FilesetResolver.forRetrievalTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-retrieval@latest/wasm");

  // 1. 初始化嵌入引擎 / 提供器
  const embedder = await UniversalEmbedder.createFromOptions(retrieval, {
    baseOptions: {
      modelAssetPath: "https://huggingface.co/litert-community/embeddinggemma-2-text-vision-440m-litert-lm/resolve/main/embeddinggemma-2-text-vision-440m.litertlm"
    }
  });

  // 2. 初始化语义检索器
  semanticRetriever = await SemanticRetriever.createFromComponents(retrieval, {
    vectorStore: new InMemoryVectorStore(),
    providers: [embedder.getProvider()]
  });
}

createRetriever();
```

## 准备数据

你可以直接将内容字符串加载到检索器中。这些输入会自动传递给集成的嵌入提供器,生成的嵌入会在内部向量存储中安全地管理。

Web API 允许你使用 `SemanticRetriever.index()` 将标准字符串查询推入索引。

```javascript
// 将文本条目摄取到向量存储中
await semanticRetriever.index("How to compute semantic distance on the web");
await semanticRetriever.index("Best vector search libraries for JavaScript");
await semanticRetriever.index("A completely irrelevant document about apples and bananas.");
```

## 运行推理

使用该 API 搜索并检索相关文档。

### 单一搜索查询

搜索操作使用标准字符串(或条目)。这些内容会被无缝委托给 `UniversalEmbedder` 实例,以便在 WASM/WebGL 中原生生成内部搜索向量。

```javascript
const searchOptions = {
    maxResults: 2
};

// 发起语义检索查询
const results = await semanticRetriever.retrieve("What is vector search in JS?", searchOptions);
```

## 处理并显示结果

检索输出会被映射到内部记录。

```javascript
results.forEach((retrievalResult, index) => {
    console.log(`Rank ${index + 1}:`);
    console.log(`  Similarity Score: ${retrievalResult.score}`);
    console.log(`  Text Data: ${retrievalResult.textData}`);
});
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*