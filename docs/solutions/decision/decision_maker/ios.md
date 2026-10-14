---
title: "iOS 决策引擎 (Decision maker for iOS)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/decision/decision_maker/ios"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2025-02-14 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# iOS 决策引擎指南 (Decision maker guide for iOS)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/decision/decision_maker/ios)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 决策引擎 (Decision Maker) 任务的 iOS API (`MediaPipeTasksDecision`) 允许你在 iOS 和 macOS 应用程序中定义结构化决策问题、预热静态选项以及评估文本或 JSON schemas。这些说明将向你展示如何在 Swift 中使用决策引擎 (Decision Maker)。

有关此任务的功能、模型和配置选项的更多信息，请参阅[概述](index.md)。

## 代码示例

Swift SDK (`MediaPipeTasksDecision`) 提供了 `DecisionMakerOptions`、结构化问题类型（`BooleanQuestion`、`ChoiceQuestion`、`ScoreQuestion`）、批处理评估 (`evaluateBatch`) 以及内置的 JSON Schema 评估（`prewarmJson` 和 `evaluateJson`）：

```swift
import Foundation
import MediaPipeTasksDecision

final class OnDeviceDecisionService {
  private let decisionMaker: DecisionMaker
  private let intentQuestion: ChoiceQuestion
  private let confirmQuestion: BooleanQuestion
  private let urgencyQuestion: ScoreQuestion

  init(modelPath: String) throws {
    // 1. Configure DecisionMakerOptions (.filePath or .data, .cpu or .gpu)
    let options = DecisionMakerOptions(
      modelPath: modelPath,
      maxNumTokens: 512,
      delegate: .cpu
    )
    self.decisionMaker = try DecisionMaker(options: options)

    // 2. Define questions & prewarm option embeddings once
    self.intentQuestion = ChoiceQuestion(
      options: [
        (key: "lights_control", description: "Turn lights on, off, or dim brightness in a room."),
        (key: "thermostat", description: "Change indoor temperature, heating, or cooling mode."),
        (key: "security_check", description: "Check camera feed, lock doors, or arm the alarm."),
        (key: "none", description: "General question unrelated to smart-home controls.")
      ],
      instructions: "Classify the user's smart-home command.",
      normalizePrior: true
    )

    self.confirmQuestion = BooleanQuestion(
      condition: "The command unlocks a door or disables a security system.",
      threshold: 0.5,
      normalizePrior: true
    )

    self.urgencyQuestion = ScoreQuestion(
      rubric: [
        "Routine preference adjustment",
        "Time-sensitive household action",
        "Immediate safety or security alert"
      ],
      instructions: "Rate the urgency of the command."
    )

    try self.decisionMaker.prewarm(question: self.intentQuestion)
  }

  // 3. Evaluate typed questions or multi-question JSON schemas
  func evaluateCommand(_ text: String) throws {
    let intent: ChoiceResult = try decisionMaker.evaluate(text: text, question: intentQuestion)
    let confirm: BooleanResult = try decisionMaker.evaluate(text: text, question: confirmQuestion)
    let urgency: ScoreResult = try decisionMaker.evaluate(text: text, question: urgencyQuestion)

    print("Intent: \(intent.selectedKey) (confidence: \(intent.confidence))")
    print("Needs Confirmation: \(confirm.value) (pTrue: \(confirm.probabilityTrue))")
    print("Urgency Expected Score: \(urgency.expectedScore) (level: \(urgency.selectedKey))")
  }
}
```

## 环境配置指南

使用 Swift Package Manager (SwiftPM 或 SPM) 将 `MediaPipeTasksDecision` 添加到你的项目中：

```swift
// Swift Package Manager
.package(url: "https://github.com/google-ai-edge/mediapipe.git", branch: "master")
```

### 导入模块

将框架导入到你的 Swift 文件中：

```swift
import MediaPipeTasksDecision
```

## 模型

将目标模型资产 (`embeddinggemma-2-270m-it.litertlm`) 包含在你的 Xcode 项目 Bundle 中。

## 创建任务

使用 `DecisionMakerOptions` 初始化 `DecisionMaker`：

```swift
guard let modelPath = Bundle.main.path(forResource: "embeddinggemma-2-270m-it", ofType: "litertlm") else {
  fatalError("Model asset not found in app bundle.")
}

let options = DecisionMakerOptions(
  modelPath: modelPath,
  maxNumTokens: 512,
  delegate: .cpu
)

let decisionMaker = try DecisionMaker(options: options)
```

### 预热选项 (Prewarm options)

在初始化期间预热静态问题定义：

```swift
let intentQuestion = ChoiceQuestion(
  options: [
    (key: "billing", description: "Invoices, payment errors, refund requests"),
    (key: "tech_support", description: "System bugs, crashes, error codes"),
    (key: "general", description: "Other questions")
  ],
  instructions: "Classify incoming user message",
  normalizePrior: true
)

try decisionMaker.prewarm(question: intentQuestion)
```

## 准备数据

指定要评估的输入文本：

```swift
let inputText = "Payment went through twice on my credit card."
```

### 配置选项

此任务为 iOS 应用程序提供以下配置选项：

| 选项名称 | 描述 | 值类型 | 默认值 |
| --- | --- | --- | --- |
| `modelSource` | 模型资产 (model asset) 的来源，可指定路径 (`.filePath`) 或内存数据 (`.data`)。 | `ModelSource` | `undefined` |
| `maxNumTokens` | 允许用于输入上下文处理的最大标记 (tokens) 数量。 | `Int` | `4096` |
| `delegate` | 用于运行推理的硬件加速委托 (`.cpu`, `.gpu`)。 | `Delegate` | `.cpu` |

## 运行任务

执行同步决策评估：

```swift
let choiceResult = try decisionMaker.evaluate(text: inputText, question: intentQuestion)
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

处理评估结果属性：

```swift
print("Winning Category: \(choiceResult.selectedKey)")
print("Confidence: \(choiceResult.confidence)")
print("Probabilities: \(choiceResult.probabilities)")
```

## 在 Swift 中进行 JSON Schema 评估

使用 `evaluateJson` 评估 Jev JSON 或 OpenAI 结构化输出 schemas：

```swift
func evaluateJsonSchema(text: String) throws {
  let requestJson = """
  {
    "text": "\(text)",
    "questions": {
      "intent": {
        "type": "choice",
        "choices": ["refund", "support"],
        "descriptions": ["Requesting a billing refund", "Technical support request"]
      }
    }
  }
  """

  let resultJson = try decisionMaker.evaluateJson(requestJson)
  print("Evaluated JSON Result: \(resultJson)")
}
```

## API 摘要参考

DecisionMaker 上的 Swift 推理 API 为：

* `evaluate(text:question:)` 用于 `BooleanQuestion`、`ChoiceQuestion` 或 `ScoreQuestion`
* `evaluateBatch(texts:question:sharedPrefixText:)`
* `evaluateJson(_ jsonRequest: String)`

| Swift API | 描述 |
| --- | --- |
| `DecisionMakerOptions(modelPath:maxNumTokens:delegate:)` | 配置模型来源 (`.filePath`/`.data`) 和硬件委托 (`.cpu`/`.gpu`) 的选项结构体。 |
| `DecisionMaker(options:)` | 在串行调度队列上实例化决策引擎。 |
| `decisionMaker.prewarm(question:)` | 预前置嵌入并白化 `ChoiceQuestion` 的选项。 |
| `decisionMaker.evaluate(text:question:)` | 评估单个 `BooleanQuestion`、`ChoiceQuestion` 或 `ScoreQuestion`。 |
| `decisionMaker.evaluateJson(_ jsonRequest: String)` | 根据文本评估原始的 Jev 或 OpenAI JSON schemas。 |
| `decisionMaker.close()` | 释放所有资源。 |
| `decisionMaker.prewarmJson(_ jsonSchema: String)` | 预前置嵌入并白化 JSON schema 的选项。 |
| `decisionMaker.evaluateBatch(texts:question:sharedPrefixText:)` | 根据单个问题评估一批文本输入。 |

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*
