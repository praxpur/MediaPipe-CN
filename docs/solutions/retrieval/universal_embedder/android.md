---
title: "通用嵌入器指南(Android)(Universal Embedder Guide for Android)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/retrieval/universal_embedder/android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-06 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 通用嵌入器指南(Android)(Universal Embedder Guide for Android)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/retrieval/universal_embedder/android)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 通用嵌入器(Universal Embedder)任务支持在端侧跨多种输入模态(包括文本、图片和音频)生成高维嵌入向量。以下说明将向你展示如何在 Android 应用中使用 Universal Embedder。

有关此任务的能力、模型和配置选项的更多信息,请参阅[概览](../universal_embedder.md)。

## 代码示例

MediaPipe Tasks(任务 API)示例代码是面向 Android 的通用嵌入器应用的基本实现。你可以将此应用作为自己 Android 应用的起点,也可以在修改现有应用时参考它。通用嵌入器示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/universal_embedder/android) 上。

### 下载代码

以下说明将向你展示如何使用 [git](https://git-scm.com/) 命令行工具创建示例代码的本地副本。

要下载示例代码:

1. 使用以下命令克隆 git 仓库:

    ```bash
    git clone https://github.com/google-ai-edge/mediapipe-samples
    ```

2. (可选)配置你的 git 实例使用稀疏检出(sparse checkout),以便只包含通用嵌入器示例应用所需的文件:

    ```bash
    cd mediapipe-samples
    git sparse-checkout init --cone
    git sparse-checkout set examples/universal_embedder/android
    ```

创建示例代码的本地副本后,你可以将项目导入 Android Studio 并运行该应用。有关说明,请参阅 [Android 环境配置指南](../../setup_android.md#example_code)。

## 环境配置

本节介绍专门为使用通用嵌入器而设置开发环境和代码项目的关键步骤。有关使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参阅 [Android 环境配置指南](../../setup_android.md)。

### 依赖项

通用嵌入器使用 `com.google.mediapipe:tasks-retrieval` 库。retrieval 包直接依赖 LiteRT-LM,因此你无需手动指定 LiteRT-LM 依赖。在你的 Android 应用的 `build.gradle` 文件中添加以下依赖:

```gradle
dependencies {
    implementation 'com.google.mediapipe:tasks-retrieval:latest.release'
}
```

## 创建任务

你可以使用 `createFromOptions()` 工厂函数初始化 `UniversalEmbedder`,该函数接受一个 Android `Context` 和一个包含模型资产路径和推理设置的 `UniversalEmbedderOptions` 配置对象。要使用硬件加速,请设置相关选项以配置 GPU 委托。

```java
import android.content.Context;
import com.google.mediapipe.tasks.core.BaseOptions;
import com.google.mediapipe.tasks.core.Delegate;
import com.google.mediapipe.tasks.retrieval.universalembedder.UniversalEmbedder;
import com.google.mediapipe.tasks.retrieval.universalembedder.UniversalEmbedderOptions;

// 配置嵌入器选项
UniversalEmbedderOptions options = UniversalEmbedderOptions.builder()
    .setBaseOptions(BaseOptions.builder()
        .setModelAssetPath("embeddinggemma-2-text-vision-440m.litertlm")
        .build())
    .setTextDelegate(Delegate.GPU)
    .setVisionDelegate(Delegate.GPU)
    .setL2Normalize(true)
    .build();

// 初始化通用嵌入器
UniversalEmbedder universalEmbedder = UniversalEmbedder.createFromOptions(context, options);
```

## 生成嵌入

`UniversalEmbedder` 为单个输入模态提供了不同的推理方法,还提供了一个通用的多模态列表摄取 API。

### 嵌入文本

要提取文本字符串的高维特征向量:

```java
import com.google.mediapipe.tasks.components.containers.EmbeddingResult;
import com.google.mediapipe.tasks.components.containers.Embedding;

EmbeddingResult textResult = universalEmbedder.embedText("a yellow piece of fruit");
Embedding textEmbedding = textResult.embeddings().get(0);
```

### 嵌入图片

使用 `BitmapImageBuilder` 从原始图片中提取嵌入:

```java
import com.google.mediapipe.framework.image.BitmapImageBuilder;
import com.google.mediapipe.framework.image.MPImage;

MPImage image = new BitmapImageBuilder(bitmap).build();
EmbeddingResult imageResult = universalEmbedder.embedImage(image);
Embedding imageEmbedding = imageResult.embeddings().get(0);
```

### 嵌入音频

从分段后的音频缓冲中提取嵌入:

```java
import com.google.mediapipe.tasks.components.containers.AudioData;

AudioData audioData = ...; // 你的 AudioData 对象
EmbeddingResult audioResult = universalEmbedder.embedAudio(audioData);
Embedding audioEmbedding = audioResult.embeddings().get(0);
```

### 嵌入多模态内容

你可以传入内容对象的混合列表(字符串、音频数据缓冲、`MPImage` 或字节数组),以生成复合的多模态嵌入表示:

```java
List<Object> contents = new ArrayList<>();
contents.add("A majestic landmark in Paris");
contents.add(image);

EmbeddingResult multiResult = universalEmbedder.embedContent(contents);
```

## 计算余弦相似度

你可以使用内置工具函数计算两个结果嵌入之间的语义相似度,将两个条目映射到共享向量空间:

```java
// 直接使用 Embedding 对象计算相似度
double score = UniversalEmbedder.cosineSimilarity(textEmbedding, imageEmbedding);
```

## 与语义检索器集成

`UniversalEmbedder` 与 `SemanticRetriever` 生态系统完全兼容。你可以将其嵌入生成器作为标准的 provider 暴露:

```java
import com.google.mediapipe.tasks.core.EmbeddingProvider;

EmbeddingProvider provider = universalEmbedder.getProvider();
```

## 清理

在完成时释放底层系统资源并关闭 LiteRT-LM 推理引擎:

```java
universalEmbedder.close();
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*