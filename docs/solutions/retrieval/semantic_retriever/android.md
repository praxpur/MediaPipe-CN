---
title: "语义检索器指南(Android)(Semantic retriever guide for Android)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/retrieval/semantic_retriever/android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-06 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 语义检索器指南(Android)(Semantic retriever guide for Android)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/retrieval/semantic_retriever/android)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 语义检索器(Semantic Retriever)任务负责管理端侧向量嵌入的生成、向量存储,以及针对文本、图片和音频文件的搜索检索。以下说明将向你展示如何在 Android 应用中使用 Semantic Retriever。

有关此任务的能力、模型和配置选项的更多信息,请参阅[概览](../semantic_retriever.md)。

## 代码示例

MediaPipe Tasks(任务 API)示例代码是面向 Android 的语义检索器应用的基本实现。你可以将此应用作为自己 Android 应用的起点,也可以在修改现有应用时参考它。语义检索器示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/semantic_retriever/android) 上。

### 下载代码

以下说明将向你展示如何使用 [git](https://git-scm.com/) 命令行工具创建示例代码的本地副本。

要下载示例代码:

1. 使用以下命令克隆 git 仓库:

    ```bash
    git clone https://github.com/google-ai-edge/mediapipe-samples
    ```

2. (可选)配置你的 git 实例使用稀疏检出(sparse checkout),以便只包含语义检索器示例应用所需的文件:

    ```bash
    cd mediapipe-samples
    git sparse-checkout init --cone
    git sparse-checkout set examples/semantic_retriever/android
    ```

创建示例代码的本地副本后,你可以将项目导入 Android Studio 并运行该应用。有关说明,请参阅 [Android 环境配置指南](../../setup_android.md#example_code)。

## 环境配置

本节介绍专门为使用语义检索器而设置开发环境和代码项目的关键步骤。有关使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参阅 [Android 环境配置指南](../../setup_android.md)。

### 依赖项

语义检索器使用 `com.google.mediapipe:tasks-retrieval` 库。retrieval 包直接依赖 LiteRT-LM,因此你无需手动指定 LiteRT-LM 依赖。AppSearch 依赖是可选依赖,仅当你计划使用 `AppSearchVectorStore` 时才需要。在你的 Android 应用的 `build.gradle` 文件中添加以下依赖:

```gradle
dependencies {
    implementation 'com.google.mediapipe:tasks-retrieval:latest.release'

    // 可选:仅在使用 AppSearch 后端时需要
    implementation 'androidx.appsearch:appsearch:1.2.0-alpha02'
    implementation 'androidx.appsearch:appsearch-local-storage:1.2.0-alpha02'
}
```

## 创建任务

你可以使用 `createFromComponents()` 工厂函数初始化 `SemanticRetriever`,该函数接受一个 Android `Context` 和一个 `SemanticRetrieverComponents` 配置块。该配置定义了向量数据库实例和嵌入提供器。

```java
import android.content.Context;
import com.google.mediapipe.tasks.retrieval.semanticretriever.SemanticRetriever;
import com.google.mediapipe.tasks.retrieval.semanticretriever.SemanticRetrieverComponents;
import com.google.mediapipe.tasks.retrieval.universalembedder.UniversalEmbedder;
import com.google.mediapipe.tasks.retrieval.components.SqliteVectorStore;

// 1. 初始化嵌入引擎 / 提供器
UniversalEmbedder embedder = UniversalEmbedder.createFromOptions(context, embedderOptions);

// 2. 构建组件列表
SemanticRetrieverComponents components = new SemanticRetrieverComponents()
    .setVectorStore(new SqliteVectorStore(context, "semantic_db"))
    .addProvider(embedder.getProvider());

// 3. 创建语义检索器
SemanticRetriever semanticRetriever = SemanticRetriever.createFromComponents(context, components);
```

## 摄取内容

`SemanticRetriever` 为文档、图片、音频和多模态文本块提供了专门的端侧摄取 API。

### 摄取文本文档

你可以插入文本文档。如果文档较大,检索器会自动将其分块为较小的片段:

```java
// 摄取不带元数据的文本
semanticRetriever.insertDocument("doc_1", "The capital of France is Paris.");

// 摄取带元数据的文本
Map<String, String> metadata = new HashMap<>();
metadata.put("category", "geography");
semanticRetriever.insertDocument("doc_2", "The capital of Germany is Berlin.", metadata);
```

### 摄取图片和音频

你可以使用本地媒体的 Android `Uri` 路径来摄取它们:

```java
Uri imageUri = Uri.parse("file:///android_asset/images/sunny_beach.jpg");
semanticRetriever.insertImage("img_1", imageUri);

Uri audioUri = Uri.parse("file:///android_asset/ambient_birds.wav");
semanticRetriever.insertAudio("aud_1", audioUri);
```

### 摄取多模态内容

你可以使用 `Part` 原语组装自定义的内容列表:

```java
import com.google.mediapipe.tasks.core.Part;
import com.google.mediapipe.tasks.core.TextPart;

List<Part> contentParts = new ArrayList<>();
contentParts.add(new TextPart("An iconic iron monument in Paris"));

semanticRetriever.insertContent("composite_1", contentParts);
```

## 检索记录

要查询已存储的数据,请调用 `retrieve`,并传入查询字符串或查询内容以及匹配结果的数量(`topK`):

```java
import com.google.mediapipe.tasks.retrieval.semanticretriever.RetrievalResult;

// 使用查询字符串查询数据库
List<RetrievalResult> results = semanticRetriever.retrieve("What is the capital of France?", 3);

for (RetrievalResult result : results) {
    String id = result.id();
    double score = result.score();
    System.out.println("Match ID: " + id + ", Similarity Score: " + score);
}
```

## 删除记录与清理

你可以使用原始记录 ID 从向量数据库中移除元素,并在完成时释放系统资源:

```java
// 按 ID 删除特定记录
List<String> idsToDelete = Arrays.asList("doc_1", "img_1");
semanticRetriever.delete(idsToDelete);

// 关闭并释放数据库资源
semanticRetriever.close();
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*