---
title: "语义检索器指南(Python)(Semantic retriever guide for Python)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/retrieval/semantic_retriever/python"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-06 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 语义检索器指南(Python)(Semantic retriever guide for Python)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/retrieval/semantic_retriever/python)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 语义检索器(Semantic Retriever)任务负责管理端侧向量嵌入的生成、向量存储,以及针对文本、图片和音频文件的搜索检索。以下说明将向你展示如何在 Python 中使用 Semantic Retriever。

有关此任务的能力、模型和配置选项的更多信息,请参阅[概览](../semantic_retriever.md)。

## 环境配置

本节介绍专门为使用语义检索器而设置开发环境和代码项目的关键步骤。有关使用 MediaPipe 任务配置开发环境的一般信息(包括平台版本要求),请参阅 [Python 环境配置指南](../../setup_python.md)。

### 软件包

语义检索器需要 `mediapipe` pip 包:

```bash
$ python -m pip install mediapipe
```

### 导入

导入以下模块以访问语义检索器任务函数:

```python
from mediapipe.tasks import python
from mediapipe.tasks.python.retrieval import semantic_retriever
from mediapipe.tasks.python.retrieval import universal_embedder
```

## 创建任务

语义检索器使用 `UniversalEmbedder` 为你摄取的内容和查询生成嵌入。首先创建嵌入器,然后将其传递给 `SemanticRetrieverOptions` 对象,并使用 `create_from_options()` 创建检索器。两个对象都是上下文管理器,因此你可以使用 `with` 语句自动释放其资源。

```python
# 1. 创建生成向量嵌入的嵌入器
base_options = python.BaseOptions(
    model_asset_path='embeddinggemma-2-text-vision-440m.litertlm'
)
embedder_options = universal_embedder.UniversalEmbedderOptions(
    base_options=base_options,
    l2_normalize=True,
)

with universal_embedder.UniversalEmbedder.create_from_options(
    embedder_options
) as embedder:
  # 2. 配置检索器
  retriever_options = semantic_retriever.SemanticRetrieverOptions(
      embedder=embedder,
      embedding_dimension=768,
      chunk_size=512,
      chunk_overlap=100,
      chunking_mode=semantic_retriever.ChunkingMode.CHARACTER,
  )

  # 3. 创建语义检索器
  with semantic_retriever.SemanticRetriever.create_from_options(
      retriever_options
  ) as retriever:
    ...
```

### 配置选项

`SemanticRetrieverOptions` 支持以下选项:

| 选项名称 | 描述 | 取值范围 | 默认值 |
|---|---|---|---|
| `embedder` | 用于为摄取内容和查询生成嵌入的 `UniversalEmbedder` 实例。 | `UniversalEmbedder` | 必需 |
| `embedding_dimension` | 嵌入器产生的嵌入向量的维度。 | 正整数 | `768` |
| `database_path` | 用于持久化向量存储的端侧 SQLite 数据库的文件路径。如果省略,则使用内存存储。 | 字符串形式的路径 | `None` |
| `chunk_size` | 长文本文档在嵌入之前被拆分成的每个文本块的最大大小。 | 正整数 | `512` |
| `chunk_overlap` | 连续文本块相互重叠的字符数或单词数。 | 非负整数 | `100` |
| `chunking_mode` | `chunk_size` 和 `chunk_overlap` 是以字符衡量还是以单词衡量。 | `ChunkingMode.CHARACTER`, `ChunkingMode.WORD` | `ChunkingMode.CHARACTER` |

本页其余示例假定它们在创建 `retriever` 的 `with` 块内运行。

## 摄取内容

`SemanticRetriever` 为文本文档、图片、音频和多模态内容提供摄取 API。每条记录都由一个唯一 ID 标识,并且可以携带一个可选的字符串元数据字典,你可以在之后使用它来过滤检索结果或删除记录。

### 摄取文本文档

插入带或不带元数据的文档:

```python
# 摄取不带元数据的文本
retriever.insert_document(
    doc_id='doc_1',
    text='The capital of France is Paris.',
)

# 摄取带元数据的文本
retriever.insert_document(
    doc_id='doc_burger',
    text='A grilled beef burger topped with melted cheddar, lettuce, and '
         'tomato on a toasted sesame bun.',
    metadata={'category': 'food', 'type': 'text'},
)
```

### 摄取图片和音频

通过文件路径插入图片和 WAV 音频文件。你也可以选择传入已解码的数据(`image_bytes` 或 `audio_data`),以避免从磁盘读取文件:

```python
retriever.insert_image(
    image_id='img_cat',
    image_path='cat.jpg',
    metadata={'category': 'animals', 'type': 'image'},
)

retriever.insert_audio(
    audio_id='aud_birds',
    audio_path='birds_singing.wav',
    metadata={'category': 'animals', 'type': 'audio'},
)
```

### 摄取多模态内容

要存储一个组合了多种模态的单一记录,请向 `insert_content()` 传入一个部分字典列表。每个部分通过 `TaskPartKind` 设置一个 `kind`(`TEXT`、`IMAGE` 或 `AUDIO`),并附带相应的载荷键:`text`、`image_bytes` 或 `file_path`,或 `audio_data` 或 `audio_path`。

```python
retriever.insert_content(
    record_id='combo_burger',
    parts=[
        {
            'kind': semantic_retriever.TaskPartKind.TEXT,
            'text': 'Juicy beef burger with fries',
        },
        {
            'kind': semantic_retriever.TaskPartKind.IMAGE,
            'file_path': 'burger.jpg',
        },
    ],
    metadata={'category': 'food'},
)
```

### 列出已存储的记录

调用 `get_all_record_ids()` 来查看当前已索引的记录:

```python
print('Indexed record IDs:', retriever.get_all_record_ids())
```

## 检索记录

要查询数据库,请调用 `retrieve()`,并传入查询内容、要返回的最大记录数(`limit`),以及可选的最低相似度阈值(`min_similarity`)。查询可以是纯字符串,对于多模态查询,也可以是与 `insert_content()` 所用格式相同的部分字典列表。该方法返回一个 `RetrievalResult`,其 `records` 列表包含按分数排序的匹配记录。

```python
result = retriever.retrieve(
    query='feline pet',
    limit=4,
    min_similarity=0.0,
)

for record in result.records:
  print(
      f'[{record.score:.4f}] id={record.id} '
      f'metadata={record.metadata} text={record.text!r}'
  )
```

### 按元数据过滤

传入一个 `metadata_filter` 字典,将结果限制为元数据包含所有给定键值对的记录:

```python
filtered_result = retriever.retrieve(
    query='something delicious to eat',
    limit=5,
    min_similarity=0.0,
    metadata_filter={'category': 'food'},
)
```

### 使用图片查询

使用部分列表以图片或音频代替文本进行查询:

```python
with open('cat.jpg', 'rb') as f:
  cat_bytes = f.read()

image_query_result = retriever.retrieve(
    query=[
        {
            'kind': semantic_retriever.TaskPartKind.IMAGE,
            'image_bytes': cat_bytes,
        }
    ],
    limit=5,
    min_similarity=0.0,
)
```

## 删除记录与清理

你可以按 ID 删除单条记录,删除所有匹配元数据过滤器的记录,或完全清空数据库:

```python
# 删除单条记录
retriever.delete_record('doc_1')

# 删除所有元数据匹配过滤器的记录
retriever.delete_with_metadata_filter({'category': 'food'})

# 删除所有记录
retriever.delete_all()
```

当 `with` 块退出时,检索器和嵌入器会释放它们的资源。如果你不使用 `with` 语句,请在完成后对它们各自调用 `close()`。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*