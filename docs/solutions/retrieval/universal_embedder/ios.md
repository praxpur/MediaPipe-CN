---
title: "通用嵌入器指南(iOS)(Universal Embedder Guide for iOS)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/retrieval/universal_embedder/ios"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-06 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 通用嵌入器指南(iOS)(Universal Embedder Guide for iOS)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/retrieval/universal_embedder/ios)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 通用嵌入器(Universal Embedder)任务支持在端侧跨多种输入模态(包括文本、图片和音频)生成高维嵌入向量。以下说明将向你展示如何在 iOS 应用中使用 Universal Embedder。

有关此任务的能力、模型和配置选项的更多信息,请参阅[概览](../universal_embedder.md)。

## 环境配置

本节介绍专门为使用通用嵌入器而设置开发环境和代码项目的关键步骤。有关使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参阅 [iOS 环境配置指南](../../setup_ios.md)。

### 库

使用 Swift Package Manager 将 `MediaPipeTasksRetrieval` 添加到你的项目:

```swift
// Swift Package Manager
.package(url: "https://github.com/google-ai-edge/mediapipe.git", from: "1.1.0")
```

然后,在你的 Swift 或 Objective-C 文件中导入该模块:

```swift
import MediaPipeTasksRetrieval
```

## 创建任务

你可以直接使用模型路径初始化 `UniversalEmbedder`,或传入配置了自定义后端设置或 L2 归一化的 `UniversalEmbedderOptions` 对象。

```swift
// 配置选项
let options = UniversalEmbedderOptions()
options.baseOptions.modelAssetPath = Bundle.main.path(forResource: "embeddinggemma-2-text-vision-440m", ofType: "litertlm")!
options.l2Normalize = true

// 初始化通用嵌入器
let universalEmbedder = try UniversalEmbedder(options: options)
```

## 生成嵌入

`UniversalEmbedder` 为文本、图片和音频提供专门的推理方法,还提供了一个通用的列表内容 API。

### 嵌入文本

要提取文本字符串的高维特征向量:

```swift
let textResult = try universalEmbedder.embed(text: "The quick brown fox jumps over the lazy dog")
let floatVector = textResult.embeddings[0].floatEmbedding
```

### 嵌入图片

你可以通过传入 `MPImage` 对象或原始图片字节来嵌入图片数据:

```swift
// 使用 MPImage 对象(例如 UIImage 包装)
let image = try MPImage(uiImage: UIImage(named: "monument.jpg")!)
let imageResult = try universalEmbedder.embed(image: image)

// 或使用原始 NSData 压缩图片字节
let data = try Data(contentsOf: imageURL)
let bytesResult = try universalEmbedder.embed(imageBytes: data)
```

### 嵌入音频

你可以通过传入浮点缓冲区或 `AudioData` 对象来嵌入音频数据:

```swift
let audioResult = try universalEmbedder.embed(audio: audioData)
```

### 嵌入多模态内容

你可以提供多种内容片段(字符串、图片对象、音频对象)组成的数组,以生成复合表示:

```swift
let contentArray: [Any] = [
    "A majestic landmark in Paris",
    image
]
let compositeResult = try universalEmbedder.embed(content: contentArray)
```

## 计算相似度

你可以计算任意两个返回的嵌入向量之间的语义余弦相似度:

```swift
let embeddingA = textResult.embeddings[0]
let embeddingB = compositeResult.embeddings[0]

let similarityNumber = try UniversalEmbedder.cosineSimilarity(
    embedding1: embeddingA,
    embedding2: embeddingB
)
print("Similarity Score: \(similarityNumber.doubleValue)")
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*