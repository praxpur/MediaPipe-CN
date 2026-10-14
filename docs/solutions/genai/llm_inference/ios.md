---
title: "iOS 版 LLM 推理指南 (LLM Inference guide for iOS)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/genai/llm_inference/ios"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-06-12 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# iOS 版 LLM 推理指南 (LLM Inference guide for iOS)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/genai/llm_inference/ios)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

> **⚠️ 重要:API 更新**
>
> MediaPipe LLM 推理 API 处于**仅维护模式**。我们建议将您的 iOS 项目迁移到 **[LiteRT-LM Swift API](https://developers.google.com/edge/litert-lm/swift)**。

> **注意:** 使用 MediaPipe LLM 推理 API 须遵守[生成式 AI 禁止使用政策](https://policies.google.com/terms/generative-ai/use-policy)。

LLM 推理 API 可让您在 iOS 应用中完全在端侧运行大语言模型(LLM),可用于执行各种任务,例如生成文本、以自然语言形式检索信息以及总结文档。该任务内置支持多种文本到文本大语言模型,因此您可以将最新的端侧生成式 AI 模型应用到您的 iOS 应用。

要快速将 LLM 推理 API 添加到您的 iOS 应用,请按照[快速入门](#quickstart)操作。有关运行 LLM 推理 API 的 iOS 应用的基本示例,请参阅[示例应用](#sample-application)。如需更深入地了解 LLM 推理 API 的工作原理,请参阅[配置选项](#configuration-options)、[模型转换](#model-conversion)和 [LoRA 调优](#lora-customization)部分。

您可以通过 [MediaPipe Studio 演示](https://mediapipe-studio.webapps.google.com/studio/demo/llm_inference)查看此任务的实际效果。有关此任务的功能、模型和配置选项的更多信息,请参阅[概述](../llm_inference.md)。

## 快速入门

请按照以下步骤将 LLM 推理 API 添加到您的 iOS 应用。LLM 推理 API 使用 `MediaPipeTasksGenai` 库,必须使用 CocoaPods 安装。该库同时兼容 Swift 和 Objective-C 应用,无需任何额外的语言特定设置。

有关在 macOS 上安装 CocoaPods 的说明,请参阅 [CocoaPods 安装指南](https://guides.CocoaPods.org/using/getting-started.html)。有关如何为您的应用创建包含必要 pod 的 `Podfile` 的说明,请参阅[使用 CocoaPods](https://guides.CocoaPods.org/using/using-cocoapods.html)。

### 添加依赖

使用以下代码在 `Podfile` 中添加 `MediaPipeTasksGenai` pod:

```
target 'MyLlmInferenceApp' do
  use_frameworks!
  pod 'MediaPipeTasksGenAI'
  pod 'MediaPipeTasksGenAIC'
end
```

如果您的应用包含单元测试目标,请参阅 [iOS 环境配置指南](https://developers.google.com/mediapipe/solutions/setup_ios),了解有关设置 `Podfile` 的更多信息。

### 下载模型

从 [Kaggle Models](https://www.kaggle.com/models/google/gemma-2/tfLite/gemma2-2b-it-gpu-int8T) 下载 8 位量化格式的 Gemma-2 2B。有关可用模型的更多信息,请参阅[模型文档](../llm_inference.md#models)。

使用 Xcode 将模型添加到您的项目目录。有关如何向 Xcode 项目添加文件的说明,请参阅[管理 Xcode 项目中的文件和文件夹](https://developer.apple.com/documentation/xcode/managing-files-and-folders-in-your-xcode-project)。

### 初始化任务

使用基本配置选项初始化任务:

```
import MediaPipeTasksGenai

let modelPath = Bundle.main.path(forResource: "model",
                                      ofType: "bin")

let options = LlmInferenceOptions()
options.baseOptions.modelPath = modelPath
options.maxTokens = 1000
options.topk = 40
options.temperature = 0.8
options.randomSeed = 101

let llmInference = try LlmInference(options: options)
```

> **注意:** 如果设置了 temperature 或 top-K,但没有同时设置随机种子,则响应将没有可变性。

### 运行任务

使用 `generateResponse(inputText:)` 方法生成文本响应。这将生成单个生成响应。

```
let result = try LlmInference.generateResponse(inputText: inputPrompt)
```

要流式传输响应,请使用 `generateResponseAsync(inputText:)` 方法。

```
let resultStream =  LlmInference.generateResponseAsync(inputText: inputPrompt)

do {
  for try await partialResult in resultStream {
    print("\(partialResult)")
  }
  print("Done")
}
catch {
  print("Response error: '\(error)")
}
```

> **注意:** 该任务会阻塞当前线程,直到其完成对文本的推理。为避免阻塞当前线程,请使用 iOS [Dispatch](https://developer.apple.com/documentation/dispatch) 或 [NSOperation](https://developer.apple.com/documentation/foundation/nsoperation) 框架在后台线程中执行处理。

## 示例应用

示例应用是使用 LLM 推理 API 的 iOS 基本文本生成应用示例。您可以将此应用作为自己 iOS 应用的起点,或在修改现有应用时参考它。示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/llm_inference/ios) 上。

使用以下命令克隆 git 仓库:

git clone https://github.com/google-ai-edge/mediapipe-samples

创建示例代码的本地版本后,您可以将项目导入 iOS Studio 并运行应用。有关更多信息,请参阅 [iOS 环境配置指南](https://developers.google.com/mediapipe/solutions/setup_ios)。

## 配置选项

使用以下配置选项设置 iOS 应用:

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `modelPath` | 项目目录中模型存储的路径。 | PATH | N/A |
| `maxTokens` | 模型处理的最大 token 数(输入 token + 输出 token)。 | 整数 | 512 |
| `topk` | 模型在生成每一步所考虑的 token 数。将预测限制为概率最高的前 k 个 token。 | 整数 | 40 |
| `temperature` | 生成过程中引入的随机性程度。温度越高,生成的文本越有创意;温度越低,生成结果越可预测。 | 浮点数 | 0.8 |
| `randomSeed` | 文本生成期间使用的随机种子。 | 整数 | 0 |
| `loraPath` | 设备上 LoRA 模型的绝对路径。注意:仅与 GPU 模型兼容。 | PATH | N/A |

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

转换器将生成两个 Flatbuffer 文件,一个用于基础模型,另一个用于 LoRA 模型。

### LoRA 模型推理

iOS 在初始化期间支持静态 LoRA。要加载 LoRA 模型,请指定 LoRA 模型路径以及基础 LLM。

```
import MediaPipeTasksGenai

let modelPath = Bundle.main.path(forResource: "model",
                                      ofType: "bin")
let loraPath= Bundle.main.path(forResource: "lora_model",
                                      ofType: "bin")
let options = LlmInferenceOptions()
options.modelPath = modelPath
options.maxTokens = 1000
options.topk = 40
options.temperature = 0.8
options.randomSeed = 101
options.loraPath = loraPath

let llmInference = try LlmInference(options: options)
```

要使用 LoRA 运行 LLM 推理,请使用与基础模型相同的 `generateResponse()` 或 `generateResponseAsync()` 方法。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*