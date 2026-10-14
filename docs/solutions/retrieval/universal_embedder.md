---
title: "通用嵌入器指南 (Universal Embedder Guide)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/retrieval/universal_embedder"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-06 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 通用嵌入器指南 (Universal Embedder Guide)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/retrieval/universal_embedder)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 通用嵌入器(Universal Embedder)任务将独立的音频、文本和图片嵌入器的功能整合为单一的统一服务,同时还增加了对视频嵌入的支持。它直接封装内置的 LiteRT-LM EmbeddingEngine,提供真正的端侧高性能多模态嵌入。

你可以使用通用嵌入器将文本、图片和音频样本向量化,或对复合内容列表执行多模态嵌入提取,以捕获跨模态的语义信息。

[试一试!](https://google-ai-edge.github.io/mediapipe-samples-web/#/retrieval/universal_embedder)

## 开始使用

要开始使用此任务,请根据你的目标平台选择以下实现指南之一。这些平台专属指南会引导你完成此任务的基本实现,包括推荐的配置选项和代码示例:

-   **Android** - [代码示例](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/universal_embedder/android) - [指南](universal_embedder/android.md)
-   **Python** - [指南](universal_embedder/python.md)
-   **iOS** - [代码示例](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/universal_embedder/ios) - [指南](universal_embedder/ios.md)
-   **Web** - [代码示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/universal-embedder.ts) - [指南](universal_embedder/web_js.md)

## 模型

我们支持将 EmbeddingGemma V2 模型用于此任务,该模型在 [Gemma 许可](https://ai.google.dev/gemma/terms)下提供。

### EmbeddingGemma V2

EmbeddingGemma V2 是一种多模态嵌入模型,能够将文本、图片和音频投影到统一的共享向量空间中。正是这种统一的表示让精确的跨模态能力成为可能,例如基于自然语言概念的语义图片搜索。

你可以在 Hugging Face 上找到 LiteRT 社区提供的不同模态的模型卡:

| 模态 | 大小 | 模型卡 |
|---|---|---|
| 文本 (Text) | 270M | [Hugging Face](https://huggingface.co/litert-community/embeddinggemma-2-text-270m-litert-lm) |
| 文本-视觉 (Text-Vision) | 440M | [Hugging Face](https://huggingface.co/litert-community/embeddinggemma-2-text-vision-440m-litert-lm) |
| 全模态 (Omnimodal) | 740M | [Hugging Face](https://huggingface.co/litert-community/embeddinggemma-2-740m-litert-lm) |

## 任务详情

本节介绍此任务的能力、输入、输出和配置选项。

### 特性

-   **统一多模态嵌入 API (Unified Multimodal Embedding API)** - 在单一任务生命周期内,从文本字符串、原始或压缩图片、以及音频数据中提取嵌入。
-   **直接封装 LiteRT-LM (Direct LiteRT-LM Wrapper)** - 使用共享的内置 EmbeddingEngine 完全在端侧运行,以获得最佳的内存占用和性能。
-   **相似度比较工具 (Similarity Comparison Utilities)** - 内置静态工具函数,用于计算原始浮点数组或嵌入结果之间的余弦相似度。
-   **语义记忆桥接 (Semantic Memory Bridge)** - 通过暴露 `EmbeddingProvider` 实现,与 `SemanticRetriever` 直接集成。

| 任务输入 | 任务输出 |
|---|---|
| 接受各种模态的输入,可以是单独的内容,也可以是混合列表:<br><br>- **文本** (`String`)<br>- **图片** (`MPImage` / `UIImage` / 压缩字节)<br>- **音频** (`AudioData` / 浮点采样)<br>- **复合内容**(上述任何对象的混合列表) | 输出一个 `EmbeddingResult`,包含:<br><br>- **嵌入**:高维特征向量,可以是原始浮点数,也可以是标量量化后的形式。 |

### 配置选项

此任务具有以下配置选项:

| 选项名称 | 描述 | 取值范围 | 默认值 |
|---|---|---|---|
| `baseOptions` | 指定模型资产路径或文件描述符,以及后端加速选项(CPU、GPU、NPU)。 | `BaseOptions` 对象 | 必需 |
| `l2Normalize` | 是否使用 L2 归一化对返回的嵌入特征向量进行归一化。 | `Boolean` | `False` |
| `activationDataType` | 指定推理期间激活值使用的精度类型。 | `ActivationDataType`(例如 `FLOAT32`、`FLOAT16`、`INT16`、`INT8`) | `FLOAT32` |
| `cacheDir` | 用于存储编译后模型缓存产物的目录的绝对路径。 | `String` | 未设置 |
| `maxInputLength` | 从多签名模型加载的最大输入签名序列长度。 | `Integer` | 未设置 |
| `visionTokensPerImage` | 每张图片生成的视觉软标记 (vision soft token) 数量。 | `Integer` | 未设置 |

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*