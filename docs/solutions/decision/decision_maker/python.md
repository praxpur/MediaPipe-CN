---
title: "Python 决策引擎 (Decision maker for Python)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/decision/decision_maker/python"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2025-02-14 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Python 决策引擎指南 (Decision maker guide for Python)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/decision/decision_maker/python)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 决策引擎 (Decision Maker) 任务的 Python API (`mediapipe.tasks.python.decision.decision_maker`) 提供了用于定义结构化决策问题、预热静态选项、执行多上下文批处理以及执行检索增强生成 (RAG) 候选重排的高级抽象。这些说明将向你展示如何在 Python 中使用决策引擎 (Decision Maker)。

有关此任务的功能、模型和配置选项的更多信息，请参阅[概述](index.md)。

## 代码示例

首先，构造 `ChoiceQuestion`、`BooleanQuestion` 和 `ScoreQuestion` 对象：

```python
from mediapipe.tasks.python.core import base_options
from mediapipe.tasks.python.decision import decision_maker

# 1. Define structured questions (ChoiceQuestion, BooleanQuestion, ScoreQuestion)
intent_q = decision_maker.ChoiceQuestion(
    instructions="Route the customer message to the appropriate support queue.",
    criteria={
        "billing_refund": "Disputed charges, refund requests, or invoice errors.",
        "technical_bug": "App crashes, login failures, or broken device sync.",
        "account_cancel": "Requests to close the account or cancel a subscription.",
        "none": "General chitchat or out-of-scope inquiry.",
    },
    normalize_prior=True,
)

urgent_q = decision_maker.BooleanQuestion(
    condition="The user is locked out of their account or experiencing double billing.",
    threshold=0.5,
    normalize_prior=True,
)

frustration_q = decision_maker.ScoreQuestion(
    instructions="Rate the user's frustration level.",
    rubric=[
        "Calm, polite inquiry",
        "Slightly annoyed or impatient",
        "Highly frustrated, angry, or threatening churn",
    ],
)

# 2. Initialize DecisionMaker and prewarm static option embeddings once
options = decision_maker.DecisionMakerOptions(
    base_options=base_options.BaseOptions(
        model_asset_path="embeddinggemma-2-270m-it.litertlm"
    ),
    max_num_tokens=512,
)

with decision_maker.DecisionMaker.create_from_options(options) as maker:
  maker.prewarm_choice(intent_q)

  query = "Your app crashed twice during checkout and billed my card twice!"

  # 3a. Evaluate individual questions
  choice_res = maker.evaluate_choice(query, intent_q)
  bool_res = maker.evaluate_boolean(query, urgent_q)
  score_res = maker.evaluate_score(query, frustration_q)

  print(f"Intent: {choice_res.selected_key} (conf={choice_res.confidence:.2f})")
  print(f"90% Conformal Set: {choice_res.prediction_set}")
  print(f"Urgent: {bool_res.value} (p_true={bool_res.probability_true:.2f})")
  print(f"Frustration Score: {score_res.expected_score:.2f} (level={score_res.selected_key})")

  # 3b. Multi-Context Batch and Shared-Prefix Candidate Reranking
  schema = {"intent": intent_q, "urgent": urgent_q, "frustration": frustration_q}
  batch_results = maker.evaluate_batch(
      contexts=["Where is my refund?", "App crashes on launch"],
      questions=schema,
  )
  rerank_results = maker.evaluate_candidates(
      shared_context="User Query: How do I reset my 2FA hardware key?",
      candidates=[
          "Doc 1: Resetting two-factor security keys in Account Settings.",
          "Doc 2: Updating your billing address and payment card.",
      ],
      questions={"is_relevant": decision_maker.BooleanQuestion(condition="The document answers the user query.")},
  )
```

## 环境配置指南

本节描述了设置开发环境和专门用于使用决策引擎 (Decision Maker) 的代码项目的关键步骤。有关设置开发环境以使用 MediaPipe Tasks 的一般信息，包括平台版本要求，请参阅 [Python 环境配置指南](../../setup_python.md)。

### 开发依赖项

安装 MediaPipe Python 包：

```bash
pip install mediapipe
```

### 导入模块

导入模块依赖项：

```python
from mediapipe.tasks.python.core import base_options
from mediapipe.tasks.python.decision import decision_maker
```

## 模型

下载 `embeddinggemma-2-270m-it.litertlm` 并指定其路径。

## 创建任务

将 `DecisionMaker` 初始化为上下文管理器 (context manager) 或实例：

```python
options = decision_maker.DecisionMakerOptions(
    base_options=base_options.BaseOptions(
        model_asset_path="embeddinggemma-2-270m-it.litertlm"
    ),
    max_num_tokens=512,
)

maker = decision_maker.DecisionMaker.create_from_options(options)
```

### 预热选项 (Prewarm options)

在处理查询之前预热决策 schemas：

```python
intent_q = decision_maker.ChoiceQuestion(
    instructions="Route customer inquiry.",
    criteria={
        "refund": "Refund requests and billing disputes.",
        "bug": "App crashes and technical issues.",
        "general": "General product questions."
    },
    normalize_prior=True
)

maker.prewarm_choice(intent_q)
```

## 准备数据

指定输入上下文的字符串或多模态图像/音频对象：

```python
context_text = "I received a double charge on my account this morning."
```

## 运行任务

运行单个问题或 schema 批处理：

```python
# Single evaluation
res = maker.evaluate_choice(context_text, intent_q)

# Batch evaluation across contexts
batch_res = maker.evaluate_batch(
    contexts=["Double charge error", "App crashes on start"],
    questions={"intent": intent_q}
)
```

## 处理和显示结果

以下展示了此任务输出数据的示例：

```text
// BooleanResult
value: true
probabilityTrue: 0.942
confidence: 0.884

// ChoiceResult
selectedKey: "lights_control"
probabilities: ["lights_control": 0.912, "thermostat": 0.051, "security_check": 0.037]
confidence: 0.861

// ScoreResult
selectedKey: "Routine preference adjustment"
expectedScore: 0.18
levelProbabilities: [0.82, 0.15, 0.03]
confidence: 0.79
```

处理输出值和共形集 (conformal sets)：

```python
print(f"Selected Key: {res.selected_key}")
print(f"Confidence: {res.confidence:.4f}")
print(f"90% Prediction Set: {res.prediction_set}")
```

## 批处理评估和 RAG 候选重排

Python SDK 提供了用于多上下文处理和零开销候选重排的专用方法：

### 多上下文批处理 (Multi-context batching)

并行地根据共享字典 schema 评估多个输入上下文 (`evaluate_batch`)：

```python
schema = {
    "intent": intent_q,
    "urgent": urgent_q,
    "frustration": frustration_q,
}

batch_results = maker.evaluate_batch(
    contexts=[
        "Where is my refund?",
        "App crashes on launch"
    ],
    questions=schema,
)
```

### 共享前缀候选重排 (Shared-prefix candidate reranking)

根据共享的查询前缀对多个检索候选内容 (`evaluate_candidates`) 进行重排，无需重新编码查询前缀：

```python
rerank_results = maker.evaluate_candidates(
    shared_context="User Query: How do I reset my 2FA hardware key?",
    candidates=[
        "Doc 1: Resetting two-factor security keys in Account Settings.",
        "Doc 2: Updating your billing address and payment card.",
    ],
    questions={
        "is_relevant": decision_maker.BooleanQuestion(
            condition="The document answers the user query."
        )
    },
)
```

## API 摘要参考

| Python 函数 / 方法 | 描述 |
| --- | --- |
| `decision_maker.DecisionMaker.create_from_options(options)` | `DecisionMaker` 的上下文管理器构造函数。 |
| `maker.prewarm_choice(question)` | 嵌入、白化并归一化候选选项。 |
| `maker.evaluate_choice(query, question)` | 评估选择基元；返回 `selected_key`、`probabilities`、`prediction_set`。 |
| `maker.evaluate_boolean(query, question)` | 评估二元条件；返回 `value`、`probability_true`、`confidence`。 |
| `maker.evaluate_score(query, question)` | 评估定性量表；返回连续的 `expected_score`。 |
| `maker.evaluate_batch(contexts, questions)` | 根据一个问题 schema 评估多个输入文本。 |
| `maker.evaluate_candidates(...)` | 执行共享前缀的 RAG 候选重排。 |

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*
