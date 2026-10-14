---
title: "Web 与 JavaScript 的决策引擎 (Decision maker for web and JavaScript)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/decision/decision_maker/web_js"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2025-02-14 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Web 决策引擎指南 (Decision maker guide for web)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/decision/decision_maker/web_js)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 决策引擎 (Decision Maker) 任务的 Web SDK 支持在 Web 浏览器中使用 WebAssembly (Wasm) 和 WebGPU 加速执行高性能的端侧 (on-device) 决策评估。

有关此任务的功能、模型和配置选项的更多信息，请参阅[概述](index.md)。

## 代码示例

TypeScript SDK (`DecisionMaker`) 既支持针对单个问题的直接调用（`evaluateBoolean`、`evaluateChoice`、`evaluateScore`，以及 `*Batch` 变体），也支持多问题的 `ClassifierSchema` 工作流（`prewarm`、`evaluate`、`classify`），同时将 `.litertlm` / `.tflite` 权重直接流式传输到 16 字节对齐的 Wasm 线性内存中。

要定义 schema 并加载 fileset，配置一个 `ClassifierSchema` 对象，定义上下文提示词 (context prompt) 以及强类型决策问题（`choice`、`boolean`、`score`）列表：

```typescript
import {
  DecisionMaker,
  ClassifierSchema,
} from '@mediapipe/tasks-decision';
import { FilesetResolver } from '@mediapipe/tasks-decision/fileset_resolver';

const triageSchema: ClassifierSchema = {
  context: 'Customer support router for a mobile banking app.',
  questions: [
    {
      id: 'department',
      type: 'choice',
      prompt: 'Which department should handle this message?',
      normalizePrior: true,
      options: [
        {label: 'fraud', description: 'Unauthorized transactions or stolen card.'},
        {label: 'transfers', description: 'Wire transfer delays or ACH limits.'},
        {label: 'general', description: 'Branch hours, settings, or general FAQ.'},
      ],
    },
    {
      id: 'requires_human',
      type: 'boolean',
      prompt: 'The issue involves stolen funds or immediate financial risk.',
      threshold: 0.5,
      normalizePrior: true,
    },
    {
      id: 'severity',
      type: 'score',
      prompt: 'Rate the severity of the customer issue from 1 to 3.',
      options: [
        {label: '1', description: 'Low: Routine informational question'},
        {label: '2', description: 'Medium: Feature blocked or delayed transaction'},
        {label: '3', description: 'High: Active account compromise or financial loss'},
      ],
    },
  ],
};

async function runWebDecisionDemo(wasmFileset: WasmFileset) {
  // 1. Create DecisionMaker (streams model into 16-byte aligned Wasm heap + WebGPU)
  const decisionMaker = await DecisionMaker.createFromOptions(wasmFileset, {
    baseOptions: {
      modelAssetPath: '/models/embeddinggemma-2-270m-it.litertlm',
    },
    maxNumTokens: 256,
    schema: triageSchema,
  });

  // 2. Prewarm schema once
  await decisionMaker.prewarm(triageSchema);

  // 3a. Evaluate entire schema in one call with classify() or evaluate()
  const result = await decisionMaker.classify(
    'Someone just charged $1,400 to my debit card in another country!'
  );
  console.log('Department:', result['department'].label, result['department'].probabilities);
  console.log('Escalate:', result['requires_human'].label, result['requires_human'].probability);
  console.log('Expected Severity (1..3):', result['severity'].expectedScore);

  // 3b. Or call primitive methods directly
  const boolRes = await decisionMaker.evaluateBoolean(
    'Please cancel my subscription immediately.',
    {condition: 'The user wants to cancel their subscription.', threshold: 0.5}
  );
  console.log('Cancel:', boolRes.value, boolRes.probabilityTrue);

  decisionMaker.close();
}
```

## 环境配置指南

本节描述了设置开发环境和专门用于使用决策引擎 (Decision Maker) 的代码项目的关键步骤。有关设置开发环境以使用 MediaPipe Tasks 的一般信息，包括平台版本要求，请参阅 [Web 环境配置指南](../../setup_web.md)。

### JavaScript 包

决策引擎 (Decision Maker) 代码可通过 MediaPipe `@mediapipe/tasks-decision` [NPM](https://www.npmjs.com/search?q=%40mediapipe) 包获得。你可以从平台[环境配置指南](../../setup_web.md#downloads)中提供的链接查找并下载这些库。

你可以使用以下命令为本地暂存安装所需的包：

```bash
npm install @mediapipe/tasks-decision
```

### 导入模块

在 TypeScript/JavaScript 中导入所需的模块：

```typescript
import {
  DecisionMaker,
  FilesetResolver,
  ChoiceQuestion,
  BooleanQuestion
} from '@mediapipe/tasks-decision';
```

### 模型

MediaPipe 决策引擎 (Decision Maker) 任务需要一个与此任务兼容的受过训练的模型。有关决策引擎 (Decision Maker) 可用的训练模型的更多信息，请参阅任务概述的[模型部分](index.md#models)。

选择并下载一个模型，然后将其存储在项目目录中。获取 Wasm 资产和模型二进制文件：

```typescript
const decision = await FilesetResolver.forDecisionTasks(
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-decision/wasm'
);
```

## 创建任务

使用 WebGPU 或 Wasm 委托 (delegate) 初始化任务：

```typescript
const decisionMaker = await DecisionMaker.createFromOptions(decision, {
  baseOptions: {
    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/decision_maker/embeddinggemma-2-270m-it.litertlm',
    delegate: 'GPU'
  },
  maxNumTokens: 512
});
```

### 预热选项 (Prewarm options)

在进入交互循环之前预热候选选择：

```typescript
const categoryQuestion: ChoiceQuestion = {
  instructions: "Categorize support ticket",
  criteria: {
    "refund": "Refunds, invoice updates, billing issues",
    "bug": "Software errors, crashes, broken UI",
    "feature": "Feature requests and product feedback"
  },
  normalizePrior: true
};

await decisionMaker.prewarmChoice(categoryQuestion);
```

## 准备数据

准备上下文字符串或 HTML 的 Image 或 Canvas 元素表示：

```typescript
const inputContext = "I need a refund for order #98212.";
```

## 运行任务

执行任务评估：

```typescript
const result = await decisionMaker.evaluateChoice(inputContext, categoryQuestion);
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

访问产生的决策负载：

```typescript
console.log(`Selected Key: ${result.selectedKey}`);
console.log(`Confidence: ${result.confidence}`);
console.log(`Conformal Set: ${JSON.stringify(result.predictionSet)}`);
```

## 集成

遵循这些步骤将 MediaPipe 决策引擎 (Decision Maker) 任务集成到你的 Web 应用程序中。

### 初始化 DecisionMaker 并预热

假设你已按照[代码示例](#code_example)中的说明定义了 schema 并加载了 fileset，现在初始化 DecisionMaker 并进行预热。这是通过 WebGPU 加速将模型权重直接流式传输到 16 字节对齐的 Wasm 线性内存中，并调用 `prewarm` 来完成的：

```typescript
async function runWebDecisionDemo(wasmFileset: WasmFileset) {
  // Initialize DecisionMaker instance
  const decisionMaker = await DecisionMaker.createFromOptions(wasmFileset, {
    baseOptions: {
      modelAssetPath: '/models/embeddinggemma-2-270m-it.litertlm'
    },
    maxNumTokens: 256,
    schema: triageSchema
  });

  // Prewarm schema options in Wasm memory
  await decisionMaker.prewarm(triageSchema);
```

### 评估问题

使用 `classify()` 评估完整的 schema，或调用单独的基元评估方法：

```typescript
  // 3a. Evaluate full schema in one pass
  const result = await decisionMaker.classify(
    'Someone just charged $1,400 to my debit card in another country!'
  );

  console.log('Department:', result['department'].label, result['department'].probabilities);
  console.log('Escalate to Human:', result['requires_human'].label, result['requires_human'].probability);
  console.log('Expected Severity (1..3):', result['severity'].expectedScore);

  // 3b. Evaluate standalone boolean primitive
  const boolRes = await decisionMaker.evaluateBoolean(
    'Please cancel my subscription immediately.',
    { condition: 'The user wants to cancel their subscription.', threshold: 0.5 }
  );

  console.log('Cancel Requested:', boolRes.value, boolRes.probabilityTrue);

  // Clean up instance memory
  decisionMaker.close();
}
```

## API 摘要参考

| TypeScript 方法 | 描述 |
| --- | --- |
| `DecisionMaker.createFromOptions(wasmFileset, options)` | 异步加载 Wasm 模块和模型权重。 |
| `decisionMaker.prewarm(schema)` | 在 Wasm 内存中预前置嵌入并白化选择选项。 |
| `decisionMaker.classify(input)` | 在单次传递中根据预热的 schema 对输入上下文进行评分。 |
| `decisionMaker.evaluateBoolean(input, question)` | 评估独立的二元条件。 |
| `decisionMaker.evaluateChoice(input, question)` | 评估候选的选择选项。 |
| `decisionMaker.evaluateScore(input, question)` | 评估有序量表，返回连续的期望分数。 |
| `decisionMaker.close()` | 释放 Wasm 堆缓冲区和 WebGPU 资源。 |

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*
