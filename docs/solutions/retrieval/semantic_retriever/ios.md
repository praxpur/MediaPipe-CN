---
title: "语义检索器指南(iOS)(Semantic retriever guide for iOS)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/retrieval/semantic_retriever/ios"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-06 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 语义检索器指南(iOS)(Semantic retriever guide for iOS)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/retrieval/semantic_retriever/ios)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 语义检索器(Semantic Retriever)任务负责管理端侧向量嵌入的生成、向量存储,以及针对文本、图片和音频文件的搜索检索。以下说明将向你展示如何在 iOS 应用中使用 Semantic Retriever。

有关此任务的能力、模型和配置选项的更多信息,请参阅[概览](../semantic_retriever.md)。

## 环境配置

本节介绍专门为使用语义检索器而设置开发环境和代码项目的关键步骤。有关使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参阅 [iOS 环境配置指南](../../setup_ios.md)。

### 库

使用 Swift Package Manager 将 `MediaPipeTasksRetrieval` 添加到你的项目中:

```swift
// Swift Package Manager
.package(url: "https://github.com/google-ai-edge/mediapipe.git", from: "1.1.0")
```

然后,在你的 Swift 或 Objective-C 文件中导入该模块:

```swift
import MediaPipeTasksRetrieval
```

## 创建任务

你可以使用 `SemanticRetriever(components:)` 初始化器或 `SemanticRetriever.create(fromComponents:)` 工厂方法来初始化 `SemanticRetriever`。它们接受一个配置底层向量存储和嵌入提供器的 `SemanticRetrieverComponents` 对象。

```swift
// 1. 设置嵌入提供器
let embedderOptions = UniversalEmbedderOptions()
embedderOptions.baseOptions.modelAssetPath = Bundle.main.path(forResource: "embeddinggemma-2-text-vision-440m", ofType: "litertlm")!
let embedder = try UniversalEmbedder(options: embedderOptions)

// 2. 设置向量存储(SQLite 或内存)和组件
let vectorStore = SqliteVectorStore(
    databasePath: databasePath,
    embeddingDimension: MPPSemanticRetrieverDefaultEmbeddingDimension
)
let components = try SemanticRetrieverComponents(
    vectorStore: vectorStore,
    chunker: nil,
    providers: [embedder]
)

// 3. 初始化语义检索器
let semanticRetriever = try SemanticRetriever(components: components)
```

## 摄取内容

`SemanticRetriever` 为多种内容模态提供了便捷的摄取 API。

### 摄取文本文档

你可以插入带或不带元数据的文本文档:

```swift
// 摄取不带元数据的文本
try semanticRetriever.insertDocument(withId: "doc_1", text: "The capital of France is Paris.")

// 摄取带元数据的文本
let metadata = ["category": "geography", "language": "en"]
try semanticRetriever.insertDocument(withId: "doc_2", text: "The capital of Spain is Madrid.", metadata: metadata)
```

### 摄取图片和音频

你可以通过提供文件路径来摄取本地文件:

```swift
let imagePath = Bundle.main.path(forResource: "eiffel_tower", ofType: "jpg")!
try semanticRetriever.insertImage(withId: "img_1", filePath: imagePath)

let audioPath = Bundle.main.path(forResource: "birds_singing", ofType: "wav")!
try semanticRetriever.insertAudio(withId: "aud_1", filePath: audioPath)
```

### 摄取多模态内容

你可以通过传入 `TaskPart` 元素列表来摄取复杂的内容块:

```swift
let textPart = TextPart(text: "An iconic iron monument in Paris")
let imagePart = ImagePart(filePath: imagePath)

try semanticRetriever.insertContent(withId: "composite_1", parts: [textPart, imagePart])
```

## 检索记录

要查询已存储的端侧向量数据库,请调用 `retrieve`,并传入查询字符串或查询内容以及要获取的结果数量(`topK`):

```swift
let results = try semanticRetriever.retrieve(withText: "What is the capital of France?", topK: 3)

for result in results {
  let recordId = result.recordId
  let score = result.score
  let meta = result.metadata
  print("Record: \(recordId), Match Score: \(score), Metadata: \(meta)")
}
```

## 删除记录

你可以使用记录 ID 从数据库中移除元素:

```swift
try semanticRetriever.delete(withIds: ["doc_1", "img_1"])
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*