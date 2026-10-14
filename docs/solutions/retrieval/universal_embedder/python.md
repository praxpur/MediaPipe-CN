---
title: "通用嵌入器指南(Python)(Universal Embedder Guide for Python)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/retrieval/universal_embedder/python"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-06 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 通用嵌入器指南(Python)(Universal Embedder Guide for Python)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/retrieval/universal_embedder/python)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 通用嵌入器(Universal Embedder)任务支持在端侧跨多种输入模态(包括文本、图片和音频)生成高维嵌入向量。以下说明将向你展示如何在 Python 中使用 Universal Embedder。

有关此任务的能力、模型和配置选项的更多信息,请参阅[概览](../universal_embedder.md)。

## 环境配置

本节介绍专门为使用通用嵌入器而设置开发环境和代码项目的关键步骤。有关使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参阅 [Python 环境配置指南](../../setup_python.md)。

### 软件包

Universal Embedder 需要 `mediapipe` pip 包:

```bash
$ python -m pip install mediapipe
```

### 导入

导入以下类以访问 Universal Embedder 任务功能:

```python
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import retrieval
```

## 创建任务

你可以通过向 `create_from_options` 函数传入包含模型资产路径和其他配置选项的 `UniversalEmbedderOptions` 对象来初始化 `UniversalEmbedder`:

```python
from mediapipe.tasks.python.retrieval import UniversalEmbedder, UniversalEmbedderOptions

# 配置选项
options = UniversalEmbedderOptions(
    base_options=mp.tasks.BaseOptions(model_asset_path="embeddinggemma-2-text-vision-440m.litertlm"),
    l2_normalize=True
)

# 初始化通用嵌入器
universal_embedder = UniversalEmbedder.create_from_options(options)
```

## 生成嵌入

`UniversalEmbedder` 为单个输入模态提供不同的推理方法,还提供了一个通用的列表内容 API。

### 嵌入文本

要提取文本字符串的高维特征向量:

```python
text_result = universal_embedder.embed_text("The quick brown fox jumps over the lazy dog")
float_vector = text_result.embeddings[0].float_embedding
```

### 嵌入图片

从图片中提取嵌入:

```python
image = mp.Image.create_from_file("monument.jpg")
image_result = universal_embedder.embed_image(image)
```

### 嵌入音频

从音频文件中提取嵌入:

```python
audio_data = mp.tasks.audio.AudioData.create_from_wav_file("birds.wav")
audio_result = universal_embedder.embed_audio(audio_data)
```

### 嵌入多模态内容

你可以传入内容对象的混合列表(字符串、音频数据缓冲、图片或字节数组),以生成复合的多模态嵌入表示:

```python
contents = [
    "A majestic landmark in Paris",
    image
]
multi_result = universal_embedder.embed_content(contents)
```

## 计算相似度

你可以计算任意两个结果嵌入向量之间的语义余弦相似度:

```python
embedding_a = text_result.embeddings[0]
embedding_b = multi_result.embeddings[0]

# 计算相似度
score = UniversalEmbedder.cosine_similarity(embedding_a, embedding_b)
print(f"Similarity Score: {score}")
```

## 清理

在完成时释放系统资源并关闭底层 LiteRT-LM 推理引擎:

```python
universal_embedder.close()
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*