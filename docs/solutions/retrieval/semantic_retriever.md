---
title: "语义检索器指南 (Semantic retriever guide)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/retrieval/semantic_retriever"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-06 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 语义检索器指南 (Semantic retriever guide)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/retrieval/semantic_retriever)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 语义检索器(Semantic Retriever)任务负责管理向量嵌入的生成、端侧向量存储,以及针对文本、图片和音频内容的查询检索。你可以使用此任务构建高级搜索系统、个性化内容检索,或完全在端侧运行的知识检索流水线(如 RAG)。

[试一试!](https://google-ai-edge.github.io/mediapipe-samples-web/#/retrieval/semantic_retriever)

## 开始使用

要开始使用此任务,请根据你的目标平台选择以下实现指南之一。这些平台专属指南会引导你完成此任务的基本实现,包括推荐的配置选项和代码示例:

-   **Android** - [代码示例](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/semantic_retriever/android) - [指南](semantic_retriever/android.md)
-   **Python** - [指南](semantic_retriever/python.md)
-   **iOS** - [代码示例](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/semantic_retriever/ios) - [指南](semantic_retriever/ios.md)
-   **Web** - [代码示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/semantic-retriever.ts) - [指南](semantic_retriever/web_js.md)

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

-   **端侧存储与搜索 (On-Device Storage and Search)** - 利用内置向量数据库(如 SQLite)在设备本地存储、查询和管理嵌入,无需与云端往返通信。
-   **多模态摄取 (Multimodal Ingestion)** - 支持插入多种内容类型,包括文本文档、本地图片和本地音频文件,并将其转换为嵌入检索记录。
-   **自动文本分块 (Automated Text Chunking)** - 使用基于字符的边界将长文本文档自动划分为较小的块,确保最优的嵌入序列长度,并保持父子关系。
-   **灵活检索 (Flexible Retrieval)** - 使用查询字符串或多模态查询内容检索已存储的记录,以获取语义上最相似的 topK 个父记录或文本块。

| 任务输入 | 任务输出 |
|---|---|
| 接受以下输入用于摄取或检索:<br><br>- **文本文档** (`String`)<br>- **本地图片** (`Uri` / 文件路径)<br>- **本地音频** (`Uri` / 文件路径)<br>- **多模态内容** (结合文本、图片和音频的内容列表) | 输出按顺序排列的检索结果列表,包含:<br><br>- **记录 ID**:匹配记录的唯一标识符。<br>- **内容**:原始的匹配内容或文档文本块。<br>- **元数据**:与记录关联的键值字符串属性。<br>- **分数**:与查询比较的相似度分数(例如余弦相似度)。 |

### 配置选项

此任务具有以下配置选项:

| 选项名称 | 描述 | 取值范围 |
|---|---|---|
| `vectorStore` | 用于持久化嵌入的向量存储实例,例如端侧 SQLite 数据库或内存数据库。 | `VectorStore` 对象 |
| `providers` | 嵌入提供器列表(例如 `UniversalEmbedder` 实例),用于为文本、图片或音频生成高维向量。 | `List<EmbeddingProvider>` |
| `textChunker` | 可选的分块器实现,用于切分长文本文件。默认采用基于字符的分块,大小为 512,重叠为 100。 | `TextChunker` 实例 |

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*