---
title: "Android 决策引擎 (Decision maker for Android)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/decision/decision_maker/android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2025-02-14 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Android 决策引擎指南 (Decision maker guide for Android)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/decision/decision_maker/android)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 决策引擎 (Decision Maker) 任务的 Android API 提供了一个 Kotlin 优先的 SDK (`com.google.mediapipe.tasks.decision`)，用于在 Android 设备上使用 EmbeddingGemma 等基础模型执行端侧 (on-device) 决策问题。

有关此任务的功能、模型和配置选项的更多信息，请参阅[概述](index.md)。

## 代码示例

Android Kotlin SDK (`com.google.mediapipe.tasks.decision`) 提供了 `DecisionMakerOptions.decisionMakerOptions { ... }` DSL、`BooleanQuestion`、`ChoiceQuestion`（包含 `ChoiceQuestion.withDescriptions(...)`）、`ScoreQuestion`、多模态 `DecisionContext`、批处理评估以及内置的 JSON Schema 评估（`prewarmJson` / `evaluateJson`）：

```kotlin
package com.example.ondevicedecision

import android.content.Context
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.decision.DecisionMaker
import com.google.mediapipe.tasks.decision.DecisionMakerOptions
import com.google.mediapipe.tasks.decision.DecisionMakerDelegate
import com.google.mediapipe.tasks.decision.BooleanQuestion
import com.google.mediapipe.tasks.decision.ChoiceQuestion
import com.google.mediapipe.tasks.decision.ScoreQuestion
import com.google.mediapipe.tasks.decision.DecisionContext

class OnDeviceRouter(context: Context) : AutoCloseable {

  // 1. Configure DecisionMakerOptions with Kotlin DSL (supports asset path, FileDescriptor, or DirectByteBuffer)
  private val options = decisionMakerOptions {
    modelPath = "embeddinggemma-2-270m-it.litertlm"
    maxNumTokens = 512
    delegate = DecisionMakerDelegate.CPU
  }

  private val decisionMaker = DecisionMaker.createFromOptions(context, options)

  // 2. Define typed questions & prewarm option embeddings once
  private val toolQuestion = ChoiceQuestion.withDescriptions(
    options = mapOf(
      "set_alarm" to "Set a wake-up alarm or countdown timer.",
      "send_message" to "Send an SMS or chat message to a contact.",
      "capture_note" to "Save a memo, shopping item, or voice note.",
      "none" to "No tool needed; answer conversationally.",
    ),
    instructions = "Select the on-device tool to invoke for the user request.",
    normalizePrior = true,
  )

  private val urgentQuestion = BooleanQuestion(
    condition = "The request specifies an immediate deadline or urgent reminder.",
    threshold = 0.5f,
    normalizePrior = true,
  )

  private val clarityQuestion = ScoreQuestion(
    rubric = listOf(
      "Vague or missing required parameters",
      "Partially specified parameters",
      "Fully specified with clear parameters",
    ),
    instructions = "How explicitly does the user state the required tool parameters?",
  )

  init {
    decisionMaker.prewarm(toolQuestion)
  }

  // 3a. Evaluate typed questions directly
  fun routeUtterance(userText: String) {
    val action = decisionMaker.evaluate(userText, toolQuestion)
    val urgent = decisionMaker.evaluate(userText, urgentQuestion)
    val clarity = decisionMaker.evaluate(userText, clarityQuestion)

    println("Tool: ${action.selectedKey} (p=${action.probabilities[action.selectedKey]}, conf=${action.confidence})")
    println("Urgent: ${urgent.value} (pTrue=${urgent.probabilityTrue})")
    println("Clarity [0..1]: ${clarity.expectedScore} (level=${clarity.selectedKey})")
  }

  // 3b. Multimodal DecisionContext + Multi-Question JSON Evaluation in a single call
  fun routeMultimodal(userText: String, jpegBytes: ByteArray) {
    val ctx = DecisionContext(text = userText, imageBytes = jpegBytes)
    val jsonResponse = decisionMaker.evaluateJson(
      context = ctx,
      jsonQuestions = """
        {
          "questions": {
            "screen_issue": {
              "type": "choice",
              "instructions": "Classify the hardware issue visible in the photo.",
              "criteria": {
                "cracked_screen": "Physical glass crack or shattered OLED panel.",
                "water_damage": "Liquid corrosion or condensation."
              }
            }
          }
        }
      """.trimIndent(),
    )
    println("Multimodal JSON Result: $jsonResponse")
  }

  override fun close() = decisionMaker.close()
}
```

## 环境配置指南

将你的 `.litertlm` 或 `.tflite` 模型文件（例如 `embeddinggemma-2-270m-it.litertlm`）放置在项目的 `app/src/main/assets/` 目录中。

### 依赖项

决策引擎 (Decision Maker) 使用 `com.google.mediapipe:tasks-decision` 库。将此依赖项添加到 Android 应用程序开发项目的 `build.gradle` 文件中。使用以下代码导入所需的依赖项：

```groovy
dependencies {
    ...
    implementation 'com.google.mediapipe:tasks-decision:latest.release'
}
```

### 模型

MediaPipe 决策引擎 (Decision Maker) 任务需要一个与此任务兼容的受过训练的模型。有关决策引擎 (Decision Maker) 可用的训练模型的更多信息，请参阅任务概述的[模型部分](index.md#models)。

下载推荐的模型资产并将其放置在你的 Android 应用程序的 `assets/` 目录中：

* **EmbeddingGemma 2 (270M)**：`embeddinggemma-2-270m-it.litertlm`

选择并下载模型，然后将其存储在项目目录中：

```bash
<dev-project-root>/src/main/assets
```

在 `ModelName` 参数中指定模型的路径。

## 创建任务

使用 `BaseOptions` 配置 `DecisionMakerOptions` 并实例化 `DecisionMaker`：

```kotlin
val baseOptions = BaseOptions.builder()
    .setModelAssetPath("embeddinggemma-2-270m-it.litertlm")
    .build()

val options = DecisionMakerOptions.builder()
    .setBaseOptions(baseOptions)
    .setMaxNumTokens(512)
    .build()

val decisionMaker = DecisionMaker.createFromOptions(context, options)
```

### 预热选项 (Prewarm options)

在设置期间预热静态的候选问题，以消除运行时的编码开销：

```kotlin
val intentQuestion = ChoiceQuestion.builder()
    .setInstructions("Route customer inquiry to the appropriate queue.")
    .setCriteria(mapOf(
        "billing_refund" to "Disputed charges, refund requests, or invoice errors.",
        "technical_bug" to "App crashes, login failures, or sync issues.",
        "account_cancel" to "Account closure or subscription cancellation."
    ))
    .setNormalizePrior(true)
    .build()

// Prewarm candidates in memory
decisionMaker.prewarmChoice(intentQuestion)
```

## 准备数据

构造一个包含文本、图像或多模态输入的 `DecisionContext`：

```kotlin
val inputContext = DecisionContext.builder()
    .setText("App crashes immediately after logging in on Android 14.")
    .build()
```

## 运行任务

使用 `evaluateChoice`、`evaluateBoolean` 或 `evaluateScore` 同步执行评估：

```kotlin
val choiceResult = decisionMaker.evaluateChoice(inputContext, intentQuestion)

val urgentQuestion = BooleanQuestion.builder()
    .setCondition("The user is blocked from using the application.")
    .build()

val booleanResult = decisionMaker.evaluateBoolean(inputContext, urgentQuestion)
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

检查预测的类别、概率和 90% 的共形预测集 (conformal prediction sets)：

```kotlin
Log.d("DecisionMaker", "Selected Key: ${choiceResult.selectedKey}")
Log.d("DecisionMaker", "Confidence: ${choiceResult.confidence}")
Log.d("DecisionMaker", "Conformal Set: ${choiceResult.predictionSet}")

Log.d("DecisionMaker", "Is Urgent: ${booleanResult.value}")
Log.d("DecisionMaker", "P(True): ${booleanResult.probabilityTrue}")
```

## 使用方法

Android SDK 使用 Kotlin DSL 进行配置，提供强类型的问题基元，并支持直接对象评估和多问题 (multi-question) JSON Schema。

### 1. 初始化选项和 MediaPipe 决策引擎 (Decision Maker) 任务

使用 `decisionMakerOptions` 配置模型路径、标记限制和委托加速 (CPU 或 GPU)：

```kotlin
import android.content.Context
import com.google.mediapipe.tasks.decision.BooleanQuestion
import com.google.mediapipe.tasks.decision.ChoiceQuestion
import com.google.mediapipe.tasks.decision.DecisionContext
import com.google.mediapipe.tasks.decision.DecisionMaker
import com.google.mediapipe.tasks.decision.DecisionMakerDelegate
import com.google.mediapipe.tasks.decision.DecisionMakerOptions.Companion.decisionMakerOptions
import com.google.mediapipe.tasks.decision.ScoreQuestion

class OnDeviceRouter(context: Context) : AutoCloseable {

    private val options = decisionMakerOptions {
        modelPath = "embeddinggemma-2-270m-it.litertlm"
        maxNumTokens = 512
        delegate = DecisionMakerDelegate.CPU
    }

    private val decisionMaker = DecisionMaker.createFromOptions(context, options)
```

### 2. 定义问题和预热

构造 `ChoiceQuestion`、`BooleanQuestion` 和 `ScoreQuestion` 实例。在初始化期间调用一次 `prewarm` 以预计算并白化选项嵌入，运行时评估成本为 0 毫秒：

```kotlin
    private val toolQuestion = ChoiceQuestion.withDescriptions(
        options = mapOf(
            "set_alarm" to "Set a wake-up alarm or countdown timer.",
            "send_message" to "Send an SMS or chat message to a contact.",
            "capture_note" to "Save a memo, shopping item, or voice note.",
            "none" to "No tool needed; answer conversationally."
        ),
        instructions = "Select the on-device tool to invoke for the user request.",
        normalizePrior = true
    )

    private val urgentQuestion = BooleanQuestion(
        condition = "The request specifies an immediate deadline or urgent reminder.",
        threshold = 0.5f,
        normalizePrior = true
    )

    private val clarityQuestion = ScoreQuestion(
        rubric = listOf(
            "Vague or missing required parameters",
            "Partially specified parameters",
            "Fully specified with clear parameters"
        ),
        instructions = "How explicitly does the user state the required tool parameters?"
    )

    init {
        // Embeds and whitens candidate options once up front
        decisionMaker.prewarm(toolQuestion)
    }
```

### 3. 评估单个和强类型的问题

将输入文本和问题传递给 `evaluate`：

```kotlin
    fun routeUtterance(userText: String) {
        val action = decisionMaker.evaluate(userText, toolQuestion)
        val urgent = decisionMaker.evaluate(userText, urgentQuestion)
        val clarity = decisionMaker.evaluate(userText, clarityQuestion)

        println("Selected Tool: ${action.selectedKey}")
        println("Tool Probability: ${action.probabilities[action.selectedKey]}")
        println("Confidence: ${action.confidence}")

        println("Is Urgent: ${urgent.value} (pTrue=${urgent.probabilityTrue})")
        println("Clarity Score [0..1]: ${clarity.expectedScore} (Level Key=${clarity.selectedKey})")
    }
```

## 多模态 DecisionContext 和 JSON Schema

Android SDK 支持多模态上下文输入（将文本与 JPEG/PNG 图像字节或音频结合），并使用 `evaluateJson` 评估复杂的 JSON 问题 schema：

```kotlin
    fun routeMultimodal(userText: String, jpegBytes: ByteArray) {
        val ctx = DecisionContext(text = userText, imageBytes = jpegBytes)

        val jsonResponse = decisionMaker.evaluateJson(
            context = ctx,
            jsonQuestions = """
            {
              "questions": {
                "screen_issue": {
                  "type": "choice",
                  "instructions": "Classify the hardware issue visible in the photo.",
                  "criteria": {
                    "cracked_screen": "Physical glass crack or shattered OLED panel.",
                    "water_damage": "Liquid corrosion or condensation."
                  }
                }
              }
            }
            """.trimIndent()
        )

        println("Multimodal JSON Evaluation Result: $jsonResponse")
    }

    override fun close() {
        decisionMaker.close()
    }
}
```

## API 摘要参考

| 方法 | 描述 |
| --- | --- |
| `DecisionMaker.createFromOptions(context, options)` | 使用指定的选项创建一个新实例。 |
| `decisionMaker.prewarm(question)` | 为给定的问题嵌入并白化候选选项。 |
| `decisionMaker.evaluate(text, question)` | 根据文本上下文评估单个强类型问题。 |
| `decisionMaker.evaluateBatch(contexts, questions)` | 批量跨多个问题评估多个上下文。 |
| `decisionMaker.evaluateJson(context, jsonQuestions)` | 自动解析 Jev 或 OpenAI JSON schemas 并根据文本/多模态上下文进行评估。 |
| `decisionMaker.close()` | 释放底层的 JNI 和模型资源。 |

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*
