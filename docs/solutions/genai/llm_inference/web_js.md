---
title: "Web 版 LLM 推理指南 (LLM Inference guide for Web)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/genai/llm_inference/web_js"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-06-12 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Web 版 LLM 推理指南 (LLM Inference guide for Web)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/genai/llm_inference/web_js)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

> **⚠️ 重要:API 更新**
>
> MediaPipe LLM 推理 API 处于**仅维护模式**。我们建议将您的 Web 项目迁移到 **[LiteRT-LM JavaScript API](https://developers.google.com/edge/litert-lm/js)**。

> **注意:** 使用 MediaPipe LLM 推理 API 须遵守[生成式 AI 禁止使用政策](https://policies.google.com/terms/generative-ai/use-policy)。

LLM 推理 API 可让您在 Web 应用中完全在端侧运行大语言模型(LLM),可用于执行各种任务,例如生成文本、以自然语言形式检索信息以及总结文档。该任务内置支持多种文本到文本大语言模型,因此您可以将最新的端侧生成式 AI 模型应用到您的 Web 应用。如果您使用最新的 Gemma-3n 模型,则还支持图像和音频输入。

要快速将 LLM 推理 API 添加到您的 Web 应用,请按照[快速入门](#quickstart)操作。有关运行 LLM 推理 API 的 Web 应用的基本示例,请参阅[示例应用](#sample-application)。如需更深入地了解 LLM 推理 API 的工作原理,请参阅[配置选项](#configuration-options)、[模型转换](#model-conversion)和 [LoRA 调优](#lora-customization)部分。

您可以通过 [MediaPipe Studio 演示](https://mediapipe-studio.webapps.google.com/studio/demo/llm_inference)查看此任务的实际效果。有关此任务的功能、模型和配置选项的更多信息,请参阅[概述](../llm_inference.md)。

## 快速入门

请按照以下步骤将 LLM 推理 API 添加到您的 Web 应用。LLM 推理 API 需要支持 WebGPU 的 Web 浏览器。有关兼容浏览器的完整列表,请参阅 [GPU 浏览器兼容性](https://developer.mozilla.org/en-US/docs/Web/API/GPU#browser_compatibility)。

### 添加依赖

LLM 推理 API 使用 [`@mediapipe/tasks-genai`](https://www.npmjs.com/package/@mediapipe/tasks-genai) 包。

为本地暂存安装所需包:

```
npm install @mediapipe/tasks-genai
```

要部署到服务器,请使用内容分发网络(CDN)服务(如 [jsDelivr](https://www.jsdelivr.com/))将代码直接添加到您的 HTML 页面:

```
<head>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/genai_bundle.cjs"
    crossorigin="anonymous"></script>
</head>
```

### 下载模型

从 HuggingFace 下载 Gemma-3n [E4B](https://huggingface.co/google/gemma-3n-E4B-it-litert-lm/blob/main/gemma-3n-E4B-it-int4-Web.litertlm) 或 [E2B](https://huggingface.co/google/gemma-3n-E2B-it-litert-lm/blob/main/gemma-3n-E2B-it-int4-Web.litertlm)。名称中包含 "-Web" 的模型是专门为 Web 使用转换的,因此强烈建议始终使用其中之一。

有关可用模型的更多信息,请参阅[模型文档](../llm_inference.md#models),或浏览我们的 [HuggingFace Community 页面](https://huggingface.co/litert-community/models),该页面提供新发布的 Gemma 4 [E2B](https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm) 和 [E4B](https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm),以及文档中未涵盖的多个其他 Gemma 3 变体,这些变体都已专门为 Web 转换,例如 [270M](https://huggingface.co/litert-community/gemma-3-270m-it)、[4B](https://huggingface.co/litert-community/Gemma3-4B-IT)、[12B](https://huggingface.co/litert-community/Gemma3-12B-IT)、[27B](https://huggingface.co/litert-community/Gemma3-27B-IT) 和 [MedGemma-27B-Text](https://huggingface.co/litert-community/MedGemma-27B-IT)。

将模型存储在您的项目目录中:

```
<dev-project-root>/assets/gemma-3n-E4B-it-int4-Web.litertlm
```

使用 `baseOptions` 对象的 `modelAssetPath` 参数指定模型的路径:

```
baseOptions: { modelAssetPath: `/assets/gemma-3n-E4B-it-int4-Web.litertlm`}
```

### 初始化任务

使用基本配置选项初始化任务:

```
const genai = await FilesetResolver.forGenAiTasks(
    // wasm 根目录的路径
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@latest/wasm"
);
llmInference = await LlmInference.createFromOptions(genai, {
    baseOptions: {
        modelAssetPath: '/assets/gemma-3n-E4B-it-int4-Web.litertlm'
    },
    maxTokens: 1000,
    topK: 40,
    temperature: 0.8,
    randomSeed: 101
});
```

### 运行任务

使用 `generateResponse()` 函数触发推理。

```
const response = await llmInference.generateResponse(inputPrompt);
document.getElementById('output').textContent = response;
```

要流式传输响应,请使用以下代码:

```
llmInference.generateResponse(
  inputPrompt,
  (partialResult, done) => {
        document.getElementById('output').textContent += partialResult;
});
```

### 多模态提示

对于 Gemma-3n 模型,LLM 推理 API Web API 支持多模态提示。启用多模态后,用户可以在提示词中包含有顺序的图像、音频和文本组合。随后 LLM 会提供文本响应。

要开始使用,请使用 MediaPipe 和 Web 兼容格式的 [Gemma-3n E4B](https://huggingface.co/google/gemma-3n-E4B-it-litert-lm/blob/main/gemma-3n-E4B-it-int4-Web.litertlm) 或 [Gemma-3n E2B](https://huggingface.co/google/gemma-3n-E2B-it-litert-lm/blob/main/gemma-3n-E2B-it-int4-Web.litertlm)。有关更多信息,请参阅 [Gemma-3n 文档](https://ai.google.dev/gemma/docs/gemma-3n)。

要启用视觉支持,请确保 `maxNumImages` 设置为正值。这决定了 LLM 可以在单个提示词中处理的图像片段的最大数量。

要启用音频支持,请确保 `supportAudio` 设置为 `true`。

```
llmInference = await LlmInference.createFromOptions(genai, {
    baseOptions: {
        modelAssetPath: '/assets/gemma-3n-E4B-it-int4-Web.litertlm'
    },
    maxTokens: 1000,
    topK: 40,
    temperature: 0.8,
    randomSeed: 101,
    maxNumImages: 5,
    supportAudio: true,
});
```

现在可以像之前一样生成响应,但使用有序的字符串、图像和音频数据数组:

```
const response = await llmInference.generateResponse([
  '<start_of_turn>user\n',
  'Describe ',
  {imageSource: '/assets/test_image.png'},
  ' and then transcribe ',
  {audioSource: '/assets/test_audio.wav'},
  '<end_of_turn>\n<start_of_turn>model\n',
]);
```

> **注意:** 我们所有为 Web 转换的指令微调 Gemma 模型都遵循相同的[提示词模板](https://ai.google.dev/gemma/docs/core/prompt-structure),Gemma 4 除外,Gemma 4 使用[具有更多功能的新格式](https://ai.google.dev/gemma/docs/core/prompt-formatting-gemma4)。

对于视觉,支持图像 URL 以及大多数常见的图像、视频或 canvas 对象。对于音频,仅支持单声道 AudioBuffer 和单声道音频文件 URL。更多详情可通过浏览[源代码](https://cs.opensource.google/mediapipe/mediapipe/+/master:mediapipe/web/graph_runner/graph_runner_llm_inference_lib.ts)找到。

## 示例应用

示例应用是使用 LLM 推理 API 的 Web 基本文本生成应用示例。您可以将此应用作为自己 Web 应用的起点,或在修改现有应用时参考它。示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/llm_inference/js) 上。

使用以下命令克隆 git 仓库:

git clone https://github.com/google-ai-edge/mediapipe-samples

有关更多信息,请参阅 [Web 环境配置指南](https://developers.google.com/mediapipe/solutions/setup_web)。

## 配置选项

使用以下配置选项设置 Web 应用:

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `modelPath` | 项目目录中模型存储的路径。 | PATH | N/A |
| `maxTokens` | 模型处理的最大 token 数(输入 token + 输出 token)。 | 整数 | 512 |
| `topK` | 模型在生成每一步所考虑的 token 数。将预测限制为概率最高的前 k 个 token。 | 整数 | 40 |
| `temperature` | 生成过程中引入的随机性程度。温度越高,生成的文本越有创意;温度越低,生成结果越可预测。 | 浮点数 | 0.8 |
| `randomSeed` | 文本生成期间使用的随机种子。 | 整数 | 0 |
| `loraRanks` | 运行时 LoRA 模型要使用的 LoRA 秩。注意:仅与 GPU 模型兼容。 | 整数数组 | N/A |

## 模型转换

LLM 推理 API 兼容以下类型的模型,其中一些需要模型转换。使用下表确定您的模型所需的步骤和方法。

| 模型 | 转换方法 | 兼容平台 | 文件类型 |
|---|---|---|---|
| Gemma-3 1B | 无需转换 | Android、Web | .task |
| Gemma 2B、Gemma 7B、Gemma-2 2B | 无需转换 | Android、iOS、Web | .bin |
| Phi-2、StableLM、Falcon | [MediaPipe 转换脚本](../llm_inference.md#supported-models) | Android、iOS、Web | .bin |
| 所有 PyTorch LLM 模型 | [LiteRT Torch Generative 库](../llm_inference.md#pytorch-models) | Android、iOS | .task |

要了解如何转换其他模型,请参阅[模型转换](../llm_inference.md#convert-model)部分。

## LoRA 定制

LLM 推理 API 支持使用 [PEFT](https://huggingface.co/docs/peft/main/en/index)(参数高效微调)库进行 LoRA(低秩自适应)调优。LoRA 调优通过经济高效的训练过程定制 LLM 的行为,基于新的训练数据创建一小组可训练权重,而不是重新训练整个模型。

LLM 推理 API 支持将 LoRA 权重添加到 [Gemma-2 2B](https://huggingface.co/google/gemma-2-2b)、[Gemma 2B](https://huggingface.co/google/gemma-2b) 和 [Phi-2](https://huggingface.co/microsoft/phi-2) 模型的注意力层。请以 `safetensors` 格式下载模型。

基础模型必须以 `safetensors` 格式提供,才能创建 LoRA 权重。LoRA 训练完成后,您可以将模型转换为 FlatBuffers 格式,以便在 MediaPipe 上运行。

### 准备 LoRA 权重

使用 PEFT 的 [LoRA 方法](https://huggingface.co/docs/peft/main/en/task_guides/lora_based_methods)指南,在您自己的数据集上训练微调的 LoRA 模型。

LLM 推理 API 仅支持注意力层上的 LoRA,因此请仅在 `LoraConfig` 中指定注意力层:

```
# Gemma
from peft import LoraConfig
config = LoraConfig(
    r=LORA_RANK,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
)

# Phi-2
config = LoraConfig(
    r=LORA_RANK,
    target_modules=["q_proj", "v_proj", "k_proj", "dense"],
)
```

在准备好的数据集上训练并保存模型后,微调后的 LoRA 模型权重可在 `adapter_model.safetensors` 中获取。`safetensors` 文件是模型转换期间使用的 LoRA 检查点。

### 模型转换

使用 MediaPipe Python 包将模型权重转换为 Flatbuffer 格式。`ConversionConfig` 指定基础模型选项以及附加的 LoRA 选项。

> **注意:** 由于 API 仅支持使用 GPU 进行 LoRA 推理,因此后端必须设置为 `'gpu'`。

```
import mediapipe as mp
from mediapipe.tasks.python.genai import converter

config = converter.ConversionConfig(
  # 与基础模型相关的其他参数
  ...
  # 进行 LoRA 转换必须使用 gpu 后端
  backend='gpu',
  # LoRA 相关参数
  lora_ckpt=LORA_CKPT,
  lora_rank=LORA_RANK,
  lora_output_tflite_file=LORA_OUTPUT_FILE,
)

converter.convert_checkpoint(config)
```

转换器将生成两个 MediaPipe 兼容的文件,一个用于基础模型,另一个用于 LoRA 模型。

### LoRA 模型推理

Web 在运行时支持动态 LoRA,这意味着用户在初始化期间声明 LoRA 秩。这意味着您可以在运行时交换不同的 LoRA 模型。

```
const genai = await FilesetResolver.forGenAiTasks(
    // wasm 根目录的路径
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@latest/wasm"
);
const llmInference = await LlmInference.createFromOptions(genai, {
    // 基础模型的选项
    ...
    // 运行时 LoRA 模型要使用的 LoRA 秩
    loraRanks: [4, 8, 16]
});
```

在初始化基础模型后,于运行时加载 LoRA 模型。生成 LLM 响应时,通过传递模型引用来触发 LoRA 模型。

```
// 加载多个 LoRA 模型。返回的 LoRA 模型引用用于指定
// 推理时要使用的 LoRA 模型。
loraModelRank4 = await llmInference.loadLoraModel(loraModelRank4Url);
loraModelRank8 = await llmInference.loadLoraModel(loraModelRank8Url);

// 指定推理期间要使用的 LoRA 模型
llmInference.generateResponse(
  inputPrompt,
  loraModelRank4,
  (partialResult, done) => {
        document.getElementById('output').textContent += partialResult;
});
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*