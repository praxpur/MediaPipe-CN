---
title: "提示词与 Schema 设计最佳实践 (Prompting and schema design best practices)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/decision/decision_maker/best-practices"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2025-02-14 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# MediaPipe 决策引擎任务的提示词与 Schema 设计最佳实践 (Prompting and schema design best practices for MediaPipe Decision Maker task)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/decision/decision_maker/best-practices)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

本指南概述了在 **MediaPipe 决策引擎 (Decision Maker) 任务**中设计 schemas、编写提示词 (prompts) 以及配置参数的最佳实践。

决策引擎 (DecisionMaker) 跨三种不同的模型架构提供统一的 API (`BooleanQuestion`、`ChoiceQuestion`、`ScoreQuestion`)：

1. **双向编码器 (Bi-Encoders)** (*EmbeddingGemma 1 & 2*)
2. **自回归生成模型 (Autoregressive Generative Models)** (*Gemma 4 E2B & E4B*)
3. **双向交叉编码器 (Bidirectional Cross-Encoders)** (*Laya, GLiNER2.5-Decide*)

由于这些模型系列的评分机制各不相同，遵循这些准则可确保最大的准确性、更低的延迟和经过校准的预测。

---

## 1. 快速参考：建议与禁忌 (Quick Reference: Do's and Don'ts)

| 设计维度 | 建议 (Do) | 禁忌 (Don't) | 原因说明 |
| --- | --- | --- | --- |
| **选项描述 (Option Descriptions)** (*Choice* & *Score*) | 为每个键 (key) 提供丰富且自包含的语义描述（例如：`"billing_refund": "Disputed charges, refund requests, or invoice errors"`）。 | 避免传递空描述或重复样板文本的裸露、不透明的键（`"0"`, `"1"`, `"cat_a"`）。 | 双向编码器将选项投影到度量空间中；独特的语义短语可以最大化选项之间的分离度。 |
| **布尔条件 (Boolean Conditions)** (*Boolean*) | 将条件表述为单一的、肯定的、可测试的命题（例如：`"The customer is requesting a refund or billing credit"`）。 | 避免在单个字符串中使用双重否定（`"The request is NOT ineligible"`）或复合的 `"A unless B"` 例外。 | 肯定的命题与所有模型后端内部的假设模板完美契合。 |
| **先验归一化 (Prior Normalization)** (`normalize_prior`) | 当选项描述在长度、特异性或频率上有显着差异时，启用 `normalize_prior = True`。 | 当一个包罗万象 (catch-all) 的选项比其他选项更宽泛或更通用时，避免保留 `normalize_prior = False`。 | 减去无上下文 (null-context) 的基线分数（在预热时成本为 0 毫秒），这样通用标签就不会在边缘输入上占主导地位。 |
| **温度校准 (Temperature Calibration)** (`temperature`) | 保留 `temperature = 0.0`（默认值）以使用自动校准的温度（对于 EmbeddingGemma 约为 0.045，对于 Gemma 4 / Laya 约为 1.0）。 | 除非明确需要未缩放的余弦概率，否则避免在 EmbeddingGemma 上硬编码 `temperature = 1.0`。 | 原始余弦相似度在一个狭窄的 -0.15 到 +0.35 范围内。默认的 `T = 1.0` 产生接近均匀的概率 (ECE > 0.30)，而自动校准的 `T = 0.045` 实现 ECE = 0.048。 |
| **三向验证与弃权 (3-Way Verification & Abstention)** | 使用标准键（`"supported"`, `"contradicted"`, `"insufficient"`）并提供截然不同的证据描述。 | 避免在没有明确定义的情况下，在同一个问题中混合多个重叠的 "unsure" / "maybe" 选项。 | 编译器可识别三向验证 schemas，处理中性中心点减法 (neutral centroid subtraction)，并防止决策偏差。 |
| **静态与动态 Schemas (Static vs. Dynamic Schemas)** | 对于静态或重复评估的 schemas，在启动时调用一次 `prewarm()`。 | 避免在具有大量选项集（10 个或更多选项）的热循环 (hot loops) 上重新编译或省略 `prewarm()`。 | `prewarm()` 缓存选项嵌入 (EmbeddingGemma) 和 KV 前缀 (Gemma 4)，从而将运行时评估减少到与选项数量成 `O(1)` 的复杂度。 |

---

## 2. 通用 Schema 设计规则 (Universal Schema Design Rules)

遵循这些设计规则可以充分利用任何 MediaPipe 决策引擎 (Decision Maker) 任务模型。

### A. 编写自包含的选项描述 (Write Self-Contained Option Descriptions)

对于 `ChoiceQuestion` 和 `ScoreQuestion`，始终将简洁的键 (keys) 与清晰、具描述性的字符串配对。

```python
# GOOD: Rich, distinct semantic descriptions
support_routing = decision_maker.ChoiceQuestion(
    criteria={
        "billing_refund": "Disputed charges, refund requests, invoice errors, or payment failures.",
        "technical_bug": "App crash, UI freeze, login failure, sync error, or broken functionality.",
        "feature_request": "Suggestions for new capabilities, UI enhancements, or integrations."
    }
)

# AVOID: Bare keys with empty or repetitive descriptions
bad_routing = decision_maker.ChoiceQuestion(
    criteria={
        "option_1": "Option 1",
        "option_2": "Option 2"
    }
)
```

### B. 以肯定方式表述布尔条件 (Phrase Boolean Conditions Affirmatively)

避免使用双重否定或棘手的条件表述。保持布尔条件肯定和简洁。

```python
# GOOD: Direct, affirmative condition
is_vip = decision_maker.BooleanQuestion(
    condition="The customer holds an active Premium or Enterprise tier subscription."
)

# AVOID: Double negatives
is_not_unsubscribed = decision_maker.BooleanQuestion(
    condition="The user does NOT want to opt out of notifications."
)
```

### C. 对不平等的选项使用先验归一化 (Use Prior Normalization for Unequal Options)

当一个选项自然比其他选项更宽泛（例如，`"other_general"` 包罗万象类别）时，启用先验归一化。这会在预热时评估没有上下文的 schema，并在零运行时成本的情况下减去基准偏好。

```python
normalized_choice = decision_maker.ChoiceQuestion(
    criteria={
        "password_reset": "Specific requests to reset account password or unlock 2FA.",
        "general_inquiry": "General questions about company policies, business hours, or contact info."
    },
    normalize_prior=True
)
```

---

## 3. 特定模型优化指南 (Model-Specific Optimization Guides)

请遵循你选择的模型系列的指南。

### EmbeddingGemma 1 & 2 (双向编码器)

* **模型 (Models)**：EmbeddingGemma 2 (270M / Omni), EmbeddingGemma 1 (300M)
* **性能 (Performance)**：在 CPU 和 GPU 上具有超低延迟
* **架构 (Architecture)**：对称双向编码器 (Symmetric bi-encoder)，将上下文和候选选项嵌入到共享的 768D L2 归一化向量空间中。

#### EmbeddingGemma 的最佳实践：

1. **提供具体的范例 (Provide Concrete Exemplars)**：在选项描述中包含具体的同义词和关键词（例如，`"technical_bug": "App crash, freeze, login failure, sync error, or broken UI"`）。
2. **将指令聚焦于决策轴心 (Focus Instructions on the Decision Axis)**：保持可选的指令 (instructions) 简洁（1 句话），说明要分类的*维度 (dimension)*（例如，`"Classify the primary intent of the support ticket."`）。
3. **自动处理长上下文 (Automatic Long-Context Handling)**：对于长文档（> 256 tokens，最多 2,048 tokens），`DecisionMaker` 使用以头部为锚点的 LogSumExp 池化，自动将上下文分块成重叠的 512-token 跨度。将关键元数据放置在上下文顶部附近，可以利用头部跨度锚点权重 (head-span anchor weight) (0.35)。
4. **对 ScoreQuestion 使用量表描述 (Use Rubric Descriptions with ScoreQuestion)**：对于有序评级 (1–N)，为每个级别填充描述。DecisionMaker 计算跨级别的概率加权期望分数，从而产生比离散的 argmax 选取相关性更高的平滑连续分数。

### Gemma 4 (E2B & E4B)

* **模型 (Models)**：Gemma 4 E2B (2B) & E4B (4B)
* **性能 (Performance)**：在**单个预填充前向传递 (single prefill forward pass)** 中评估决策，零自回归标记生成 (zero autoregressive token generation)。

#### Gemma 4 的最佳实践：

1. **利用其处理复杂的策略规则 (Leverage for Complex Policy Rules)**：非常适合涉及反事实推理 (counterfactual reasoning)、多规则例外或复杂的条件逻辑（双向编码器在这些方面难以应对）的任务。
2. **将明确的规则放在指令中 (Put Explicit Rules in Instructions)**：直接将显式约束放置在 `instructions` 字段中（例如，`"Approve refund ONLY IF purchased within 14 days; EXCEPT digital downloads which are non-refundable unless unplayed."`）。
3. **通过预热进行前缀缓存 (Prewarm for Prefix Caching)**：始终调用 `prewarm()`，这样 `DecisionMaker` 就会缓存提示词前缀的 KV 状态。

---

### Laya & GLiNER2.5-Decide (交叉编码器)

* **模型 (Models)**：Laya (149M), GLiNER2.5-Decide (166M)
* **架构 (Architecture)**：双向 DeBERTa/ModernBERT 交叉编码器，在 256 或 512-token 的窗口内同时关注输入上下文和候选选项。

#### 交叉编码器的最佳实践：

1. **尽可能保持选项集紧凑 (Keep Option Sets Compact When Possible)**：当所有候选选项和输入上下文都适合模型的 256 或 512-token 窗口（通常 8 个或更少的选项）时，`DecisionMaker` 会将所有选项和上下文一起打包到单个编码器前向传递中（比成对评估快约 4 倍）。对于更大的选项集或非常长的选项描述，`DecisionMaker` 会自动回退到跨多次传递评估选项。
2. **保持选项描述简洁 (Keep Option Descriptions Concise)**：使用高信号 (high-signal) 的 5–15 个词的描述，以节省上下文的 token 预算。

## 4. 常见陷阱与代码修复 (Pitfalls & Code Fixes)

避免这些常见问题并应用推荐的修复方法。

### 陷阱 1：双向编码器上未拆分的反事实或 "除非 (Unless)" 例外

**问题 (Problem)**：双向编码器为上下文和选项计算独立的嵌入。当单个问题包含基本规则、"除非" 例外和反事实覆盖时，词汇重叠可能会将双向编码器拉向错误的标签。

#### 解决方案 A：分解为原子 BooleanQuestions (推荐)

由于 DecisionMaker **仅一次**嵌入输入上下文，并在所有预热的问题中重用查询向量，因此评估 3 个原子布尔问题相对于评估单个问题，仅仅增加最小的额外延迟。

* **避免 (Avoid)**：

  ```python
  # AVOID: Single compound question with "unless" / "except" clauses on Bi-Encoders
  bad_policy = decision_maker.BooleanQuestion(
      condition=(
          "The order is eligible for a refund (purchased within 30 days, UNLESS it is "
          "a final-sale clearance item, EXCEPT when the item arrived physically damaged)."
      )
  )
  ```
* **推荐替代做法 (Do Instead)**：

  ```python
  # RECOMMENDED on Bi-Encoders (EG1 / EG2): Decompose into atomic factual BooleanQuestions
  # DecisionMaker embeds the input context ONCE and evaluates all 3 conditions with minimal overhead!
  atomic_policy_schema = {
      "within_30_days": decision_maker.BooleanQuestion(
          condition="The item was purchased within the last 30 days."
      ),
      "is_clearance": decision_maker.BooleanQuestion(
          condition="The item is a final-sale or clearance item."
      ),
      "arrived_damaged": decision_maker.BooleanQuestion(
          condition="The item arrived physically damaged, broken, or defective."
      ),
  }
  # Evaluate all conditions in a single pass
  res = maker.evaluate_schema(order_text, atomic_policy_schema)
  # Combine booleans deterministically in application logic
  is_eligible = res["arrived_damaged"].value or (
      res["within_30_days"].value and not res["is_clearance"].value
  )
  ```

#### 解决方案 B：路由到 Gemma 4 或交叉编码器模型

如果你的应用程序接受无法提前分解的任意、用户定义的策略提示，请将评估路由到 **Gemma 4** 或 **Laya**，它们可以在规则例外和上下文之间执行全交叉注意力 (full cross-attention)。

---

### 陷阱 2：双重否定和带有否定词的选项键

**问题 (Problem)**：包含否定词的条件 (`"is NOT ineligible"`) 或共享词根的键（`"not_spam"` 对比 `"spam"`）会产生语义歧义。

* **避免 (Avoid)**：

  ```python
  decision_maker.BooleanQuestion(condition="The user does NOT want to opt out of notifications.")
  decision_maker.ChoiceQuestion(criteria={"not_spam": "Legitimate email", "spam": "Unsolicited email"})
  ```
* **推荐替代做法 (Do Instead)**：

  ```python
  decision_maker.BooleanQuestion(condition="The user wants to receive notifications.")
  decision_maker.ChoiceQuestion(
      criteria={
          "legitimate_inbox": "Personal, work, or transactional message expected by user.",
          "unsolicited_spam": "Promotional bulk mail, phishing, or unwanted advertisement."
      }
  )
  ```

---

### 陷阱 3：没有描述的裸数字或代码键

**问题 (Problem)**：不透明的数字键（如 `"0"`, `"1"`, `"2"`）如果带有空描述，则无法为双向编码器提供语义向量目标。

* **避免 (Avoid)**：

  ```python
  decision_maker.ChoiceQuestion(criteria={"0": "", "1": "", "2": ""})
  ```
* **推荐替代做法 (Do Instead)**：

  ```python
  decision_maker.ChoiceQuestion(
      criteria={
          "0": "No defect visible upon inspection.",
          "1": "Minor cosmetic scratch or superficial blemish.",
          "2": "Severe structural crack or functional failure."
      }
  )
  ```

  *（注意：当 3 个或更多带描述的数字键被使用时，DecisionMaker 的编译器会自动将它们格式化为 `"title: Level 0 | text: ..."`，以防与二元布尔值混淆。）*

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*
