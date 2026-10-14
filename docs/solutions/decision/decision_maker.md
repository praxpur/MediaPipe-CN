---
title: "决策引擎 (Decision maker)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/decision/decision_maker"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2025-02-14 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 决策引擎指南 (Decision maker guide)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/decision/decision_maker)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 决策引擎 (Decision Maker) 任务将结构化决策问题（如类别选择、布尔条件和量表评分）作为一个确定性、经过校准的零解码 (zero-decoding) 决策引擎进行评估。该引擎由多种能够在设备端 (on-device) 运行的轻量级模型提供支持，包括 *EmbeddingGemma 1 和 2*、*双向交叉编码器 (bidirectional cross-encoders)*（Laya、GLiNER2.5-Decide）以及*生成式 Gemma 4*。

与通过计算成本高昂的自回归解码来生成自由格式文本或易碎 JSON 标记 (tokens) 不同，MediaPipe 决策引擎 (Decision Maker) 任务在*单次前向传递 (single forward pass)*中评估结构化的决策问题。MediaPipe 决策引擎 (Decision Maker) 任务以极小的运行时开销返回校准后的概率、获胜标签 (winning labels) 以及连续的期望分数。

[Try it!arrow\_forward](https://google-ai-edge.github.io/mediapipe-samples-web/#/decision/decision_maker)

## 快速入门

选择你目标平台的实施指南之一开始使用此任务。这些特定平台的指南引导你完成此任务的基本实现，包括推荐模型和推荐配置选项的代码示例：

| 平台 | 代码示例 | 指南 |
| --- | --- | --- |
| Android | [代码示例](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/decision_maker/android) | [指南](android.md) |
| iOS | [代码示例](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/decision_maker/ios) | [指南](ios.md) |
| Python | [Colab](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/decision_maker/python/decision_maker.ipynb) | [指南](python.md) |
| Web | [代码示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/decision-maker.ts) | [指南](web_js.md) |

## 任务详情

本节介绍了此任务的功能、输入、输出和配置选项。

### 功能

* **零解码决策推理 (Zero-decoding decision inference)**：通过直接从模型表示中对结构化决策基元 (primitives) 进行评分，消除了标记生成 (token generation) 的延迟。
* **多模态支持 (Multimodal support)**：在输入上下文 (input context) 和决策选项中均可接收 UTF-8 文本、RGB 图像（`MPImage`、JPEG/PNG 字节）以及 16kHz 音频样本。
* **原生 JSON 集成 (First-class JSON integration)**：内置的 JSON 解析实用程序无需自定义适配器代码即可评估 TypeSafe Jev JSON 负载 (payloads) 和 OpenAI `json_schema` 规范。
* **跨平台一致性 (Cross-platform consistency)**：提供跨 Android (Kotlin)、iOS (Swift)、Python 和 Web (TypeScript/JavaScript) 的统一 API 架构。

### 输入和输出格式

* **输入上下文 (Input Context)**：包含文本、图像或音频剪辑的多模态状态。
* **问题基元 (Question Primitives)**：
  + `ChoiceQuestion`：K 个选项之间的多类别分类决策。
  + `BooleanQuestion`：二元条件验证（True / False 或 Yes / No）。
  + `ScoreQuestion`：带有自动计算期望分数的有序量表评分 (Ordinal rubric grading)。
* **输出 (Outputs)**：获胜的键 (winning key)、选项概率、布尔值以及连续的期望分数。

### 支持的模型后端

| 模型后端 (Model Backend) | 架构 (Architecture) | 典型延迟 (Typical Latency) | 主要优势 (Key Strengths) |
| --- | --- | --- | --- |
| **EmbeddingGemma 1 & 2** | Bi-Encoder (270M / 300M) | 超低延迟 | 高吞吐量、多跨度 (multi-span) LogSumExp 文档池化 (document pooling)，使用 `UniversalEmbedder` 时占用 0 MB 额外 RAM。 |
| **Gemma 4 E2B & E4B** | Autoregressive Decoder (2B / 4B) | Single Prefill Pass | 复杂的组合逻辑、反事实 (counterfactual) 的策略例外。 |
| **Laya & GLiNER2.5-Decide** | Cross-Encoder (149M / 166M) | Single Cross-Attention Pass | 联合上下文-标签注意力机制 (Joint context-label attention)。 |

### 配置选项

此任务提供以下配置选项：

| 选项名称 | 描述 | 值类型 | 默认值 |
| --- | --- | --- | --- |
| `modelSource` | 模型资产 (model asset) 的来源，可指定路径 (`.filePath`) 或内存数据 (`.data`)。 | `ModelSource` | `undefined` |
| `maxNumTokens` | 允许用于输入上下文处理的最大标记 (tokens) 数量。 | `Int` | `4096` |
| `delegate` | 用于运行推理的硬件加速委托 (`.cpu`, `.gpu`)。 | `Delegate` | `.cpu` |

## 模型

决策引擎 (DecisionMaker) 在一个旨在优化延迟和内存的三步执行生命周期内运行：

1. *创建 (`DecisionMaker`)*：从模型路径、文件描述符或缓冲区初始化决策引擎。还可以共享现有的 `UniversalEmbedder` 提供程序，以实现 0 MB 额外 RAM 消耗。
2. *预热 (`prewarm` / `Prewarm` / `prewarmJson`)*：在设置期间执行一次。对于嵌入后端 (embedding backends)，它会计算候选选项嵌入，执行问题内中心点白化 (within-question centroid whitening)，并对向量表示进行 L2 归一化 (L2-normalizes)。对于 logit 后端，它预先填充 KV 缓存前缀。
3. *评估 (`evaluate` / `Evaluate` / `evaluateJson`)*：在每次请求时执行。在单次传递 (single pass) 中根据缓存的决策结构对上下文查询进行评分，并在 CPU 上以每个问题超低的延迟返回结构化结果。

| 模型名称 | 输入形状 (Input shape) | 量化类型 (Quantization type) | 模型卡 (Model Card) | 版本 |
| --- | --- | --- | --- | --- |
| [embedding_gemma2](https://huggingface.co/litert-community/embeddinggemma-2-text-270m-litert-lm/resolve/main/embeddinggemma-2-text-270m.litertlm) | string, one of `{string, Dict[string, string], List[string]}` | float 16 | [info](https://huggingface.co/litert-community/embeddinggemma-2-text-270m-litert-lm) | [Latest](https://huggingface.co/litert-community/embeddinggemma-2-text-270m-litert-lm) |
| [embedding_gemma2_text_vision](https://huggingface.co/litert-community/embeddinggemma-2-text-vision-440m-litert-lm/resolve/main/embeddinggemma-2-text-vision-440m.litertlm) | string, one of `{string, Dict[string, string], List[string]}` | float 16 | [info](https://huggingface.co/litert-community/embeddinggemma-2-text-vision-440m-litert-lm) | [Latest](https://huggingface.co/litert-community/embeddinggemma-2-text-vision-440m-litert-lm) |
| [embedding_gemma1](https://storage.googleapis.com/mediapipe-models/text_embedder/embedding_gemma/int4int8/latest/embedding_gemma.task) | string, one of `{string, Dict[string, string], List[string]}` | Mixed Precision (int4+int8) | [info](https://huggingface.co/litert-community/embeddinggemma-300m) | [Latest](https://storage.googleapis.com/mediapipe-models/text_embedder/embedding_gemma/int4int8/latest/embedding_gemma.task) |
| [Gemma E2B](https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm) | string, one of `{string, Dict[string, string], List[string]}` | int4 | [info](https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm) | [Latest](https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm) |
| [Gemma E4B](https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm) | string, one of `{string, Dict[string, string], List[string]}` | int4 | [info](https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm) | [Latest](https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm) |
| [laya_s256](https://storage.googleapis.com/mediapipe-models/decision_maker/laya/float32/laya_s256/latest/laya_s256.task) | string, one of `{string, Dict[string, string], List[string]}` | float 32 | [info](https://huggingface.co/litert-community/laya-LiteRT) | [Latest](https://storage.googleapis.com/mediapipe-models/decision_maker/laya/float32/laya_s256/latest/laya_s256.task) |
| [laya_s512](https://storage.googleapis.com/mediapipe-models/decision_maker/laya/float32/laya_s512/latest/laya_s512.task) | string, one of `{string, Dict[string, string], List[string]}` | float 32 | [info](https://huggingface.co/litert-community/laya-LiteRT) | [Latest](https://storage.googleapis.com/mediapipe-models/decision_maker/laya/float32/laya_s512/latest/laya_s512.task) |
| [gliner_s256](https://storage.googleapis.com/mediapipe-models/decision_maker/gliner/float16/gliner_s256/latest/gliner_s256.task) | string, one of `{string, Dict[string, string], List[string]}` | float 16 | [info](https://huggingface.co/litert-community/GLiNER2.5-Decide-LiteRT) | [Latest](https://storage.googleapis.com/mediapipe-models/decision_maker/gliner/float16/gliner_s256/latest/gliner_s256.task) |
| [gliner_s512](https://storage.googleapis.com/mediapipe-models/decision_maker/gliner/float16/gliner_s512/latest/gliner_s512.task) | string, one of `{string, Dict[string, string], List[string]}` | float 16 | [info](https://huggingface.co/litert-community/GLiNER2.5-Decide-LiteRT) | [Latest](https://storage.googleapis.com/mediapipe-models/decision_maker/gliner/float16/gliner_s512/latest/gliner_s512.task) |

## 决策基元 (Decision primitives)

MediaPipe 决策引擎 (DecisionMaker) 中的所有决策任务均由三个基础的决策问题基元组成：

| 基元 (Primitive) | 原型 / 类 (Prototype / Class) | 描述 | 主要输出字段 |
| --- | --- | --- | --- |
| *布尔型 (Boolean)* | `BooleanQuestion` | 根据上下文评估自然语言条件是否成立。 | `value` / `is_satisfied` (bool) `probability_true` (0.0 到 1.0) `confidence` |
| *选择型 (Choice)* | `ChoiceQuestion` | 在 K 个互斥的候选选项中选择 1 个。 | `selected_key` `probabilities` (键到概率的映射) `confidence` |
| *评分型 (Score)* | `ScoreQuestion` | 从最低评级到最高评级评估一个有序的 K 级量表 (rubric)。 | `expected_score` `selected_key` `probabilities` `confidence` |

### 1. BooleanQuestion

使用可配置的阈值（默认值：`0.5`）根据上下文评估二元条件。

* *`value` / `is_satisfied`*：如果 `probability_true` 大于或等于 `threshold`，则为 `true`。
* *`probability_true`*：从 `0.0` 到 `1.0` 的已校准概率值。
* *`confidence`*：相对于阈值边界的确定性 (Certainty) 分数。

### 2. ChoiceQuestion

评估由文本描述、图像或音频样本定义的 K 个候选选项。

* *`selected_key`*：具有最高概率的获胜选项键 (key)。
* *`probabilities`*：所有候选键之间总和为 `1.0` 的归一化概率分布。
* **`confidence`**：派生自裕度 (margin) 和熵 (entropy) 的归一化确定性。

### 3. ScoreQuestion

评估 K 个级别的有序定性量表 (rubric)，表示递增的严重性或质量。

* *`expected_score`*：跨量表级别的连续概率加权期望分数。
* *`selected_key`*：最高概率级别的键或索引。
* *`probabilities`*：量表级别上的完整概率分布。

## MediaPipe 决策引擎 (Decision Maker) 任务迁移与平台比较

本节详细介绍了 MediaPipe 决策引擎 (Decision Maker) 任务与云替代方案（如 OpenAI Structured Outputs 和服务器端 Jev API）的比较情况。

### 架构比较表

| 维度 | MediaPipe 决策引擎 (DecisionMaker) | TypeSafe Jev API | OpenAI Structured Outputs API |
| --- | --- | --- | --- |
| *执行目标 (Execution Target)* | *端侧边缘 (On-Device Edge)*（Android、iOS、WebGPU/Wasm、Desktop、Python） | *服务器 / 云端 / Python Harness*（Vertex AI、Gemini API） | *Cloud HTTP API* (`/v1/chat/completions`, `json_schema`) |
| *底层引擎 (Underlying Engine)* | *多后端引擎*: 1. 双向编码器 (EmbeddingGemma 1 & 2) 2. 交叉编码器 (Laya, GLiNER2.5) 3. 单次传递 Logits (Gemma 4) | *Prompted Generative Logits* (`Jev-Gemma`) 或 *Bi-Encoder Dot-Product* (`Jev-Embed`) | *自回归约束解码 (Autoregressive Constrained Decoding)* (FSM token masking over JSON Schema) |
| *核心基元 (Core Primitives)* | `ChoiceQuestion`, `BooleanQuestion`, `ScoreQuestion` | `choice`, `noul` (boolean), `score` | 任意 JSON Schema（`enum`, `boolean`, `number`），无内置的期望值计算 |
| *选项缓存 (`Prewarm`)* | *显式 `Prewarm()` API*：一次性前置嵌入 (embeds) 并白化所有 K 个选项；运行时执行*一次查询前向传递*（K 级别的 `O(1)`）。 | 除非手动缓存，否则每次请求都会重新评估提示词 (prompt) 或选项嵌入。 | 仅限服务器端自动前缀缓存（仍会执行 token 解码）。 |
| *多模态支持 (Multimodal Support)* | *上下文和选项均内置*：在输入和候选项中接受文本、`MPImage`/JPEG/PNG 以及 16kHz 音频。 | 仅限文本 / JSON 状态（`state: dict | str`）。 | 输入提示中支持多模态，输出 Schema 选项中*仅限文本*。 |
| *延迟和内存 (Latency and Memory)* | CPU 上每个问题的*超低延迟*，*157 MB* 包（共享 `UniversalEmbedder` 时*产生 0 MB 额外 RAM*）。 | 网络 RTT 或未缓存的 Python GPU 推理。 | 网络 RTT，按输入和输出 token 计费。 |

### 原生 JSON 支持

TypeSafe Jev JSON 负载和 OpenAI `json_schema` 定义均由 `DecisionMaker`（`evaluateJson` 和 `prewarmJson`）直接解析，**完全无需自定义适配器代码**。

#### 1. 内置 Jev JSON 负载格式 (`evaluateJson`)

评估未修改的 Jev 负载（`"state"` + `"questions"`）：

```json
{
  "state": "Cancel my flight and refund my credit card immediately.",
  "questions": {
    "intent": {
      "type": "choice",
      "instructions": "Determine the user's primary travel intent.",
      "normalize_prior": true,
      "criteria": {
        "book_flight": "Search or book a new flight itinerary.",
        "cancel_refund": "Cancel an existing reservation and request a refund.",
        "baggage_claim": "Report lost or delayed luggage."
      }
    },
    "is_financial": {
      "type": "noul",
      "condition": "The request involves a payment, charge, or refund.",
      "threshold": 0.5
    }
  }
}
```

#### 2. 内置 OpenAI `json_schema` 属性映射

`DecisionMaker` 自动将标准 OpenAI `json_schema` 属性对象映射到包含的 DecisionMaker 决策基元上：

| OpenAI JSON Schema 属性 | DecisionMaker 基元映射 | 相对于 OpenAI 的主要优势 |
| --- | --- | --- |
| `{"type": "string", "enum": [...], "description": "..."}` | `ChoiceQuestion(instructions=description, choices=enum)` | 在 1 次非生成传递中评估**每个**枚举值的校准概率。 |
| `{"type": "boolean", "description": "..."}` | `BooleanQuestion(condition=description)` | 带有可定制决策阈值的 True 校准概率。 |
| `{"type": "integer", "minimum": 1, "maximum": 5, "description": "..."}` | `ScoreQuestion(instructions=description, choices=["1".."5"])` | 计算连续期望分数而不是量化整数。 |

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*
