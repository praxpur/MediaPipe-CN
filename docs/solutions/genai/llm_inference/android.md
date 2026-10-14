---
title: "Android 版 LLM 推理指南 (LLM Inference guide for Android)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/genai/llm_inference/android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-06-12 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Android 版 LLM 推理指南 (LLM Inference guide for Android)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/genai/llm_inference/android)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

> **⚠️ 重要:API 更新**
>
> MediaPipe LLM 推理 API 处于**仅维护模式**。我们建议将您的 Android 项目迁移到 **[LiteRT-LM Android (Kotlin) API](https://developers.google.com/edge/litert-lm/android)**。

> **注意:** 使用 MediaPipe LLM 推理 API 须遵守[生成式 AI 禁止使用政策](https://policies.google.com/terms/generative-ai/use-policy)。

LLM 推理 API 可让您在 Android 应用中完全在端侧运行大语言模型(LLM),可用于执行各种任务,例如生成文本、以自然语言形式检索信息以及总结文档。该任务内置支持多种文本到文本大语言模型,因此您可以将最新的端侧生成式 AI 模型应用到您的 Android 应用。

要快速将 LLM 推理 API 添加到您的 Android 应用,请按照[快速入门](#quickstart)操作。有关运行 LLM 推理 API 的 Android 应用的基本示例,请参阅[示例应用](#sample-application)。如需更深入地了解 LLM 推理 API 的工作原理,请参阅[配置选项](#configuration-options)、[模型转换](../llm_inference.md#convert-pytorch)和 [LoRA 调优](#lora-customization)部分。

您可以通过 [MediaPipe Studio 演示](https://mediapipe-studio.webapps.google.com/studio/demo/llm_inference)查看此任务的实际效果。有关此任务的功能、模型和配置选项的更多信息,请参阅[概述](../llm_inference.md)。

## 快速入门

请按照以下步骤将 LLM 推理 API 添加到您的 Android 应用。LLM 推理 API 针对高端 Android 设备(如 Pixel 8 和 Samsung S23 或更高版本)进行了优化,无法可靠地支持设备模拟器。

### 添加依赖

LLM 推理 API 使用 `com.google.mediapipe:tasks-genai` 库。将此依赖项添加到您的 Android 应用的 `build.gradle` 文件中:

```
dependencies {
    implementation 'com.google.mediapipe:tasks-genai:0.10.27'
}
```

### 下载模型

从 [Hugging Face](https://huggingface.co/litert-community/Gemma3-1B-IT) 下载 4 位量化格式的 Gemma-3 1B。有关可用模型的更多信息,请参阅[模型文档](../llm_inference.md#models)。

将 output\_path 文件夹的内容推送到 Android 设备。

```
$ adb shell rm -r /data/local/tmp/llm/ # 移除之前加载的任何模型
$ adb shell mkdir -p /data/local/tmp/llm/
$ adb push output_path /data/local/tmp/llm/model_version.task
```

> **注意:** 在开发期间,您可以使用 adb 将模型推送到测试设备,以实现更简单的工作流程。对于部署,请将模型托管在服务器上并在运行时下载。模型太大,无法打包在 APK 中。

### 初始化任务

使用基本配置选项初始化任务:

```
// 设置 LLM 推理任务的配置选项
val taskOptions = LlmInferenceOptions.builder()
        .setModelPath("/data/local/tmp/llm/model_version.task")
        .setMaxTopK(64)
        .build()

// 创建 LLM 推理任务的实例
val llmInference = LlmInference.createFromOptions(context, taskOptions)
```

### 运行任务

使用 `generateResponse()` 方法生成文本响应。这将生成单个生成响应。

```
val result = llmInference.generateResponse(inputPrompt)
logger.atInfo().log("result: $result")
```

要流式传输响应,请使用 `generateResponseAsync()` 方法。

```
val options = LlmInference.LlmInferenceOptions.builder()
  ...
  .setResultListener { partialResult, done ->
    logger.atInfo().log("partial result: $partialResult")
  }
  .build()

llmInference.generateResponseAsync(inputPrompt)
```

## 示例应用

> **注意:** Google AI Edge Gallery 属于 Alpha(预发布)版本。

要查看 LLM 推理 API 的实际效果,并探索全面的端侧生成式 AI 功能,请查看 [Google AI Edge Gallery 应用](https://github.com/google-ai-edge/gallery)。

Google AI Edge Gallery 是一个开源 Android 应用,是开发人员的交互式游乐场。它展示了:

-   在各种任务中使用 LLM 推理 API 的实际示例,包括:
    -   图像问答(Ask Image):上传图像并就其提问。获取描述、解决问题或识别物体。
    -   提示词实验室(Prompt Lab):总结、重写、生成代码,或使用自由形式的提示词探索单轮 LLM 用例。
    -   AI 聊天(AI Chat):进行多轮对话。
-   从 Hugging Face LiteRT Community 和 Google 官方版本(例如 Gemma 3N)中发现、下载和试验各种 LiteRT 优化模型的能力。
-   不同模型的实时端侧性能基准测试(首 token 时间、解码速度等)。
-   如何导入和测试您自己的自定义 `.litertlm` 或 `.task` 模型。

此应用是了解 LLM 推理 API 的实际实现以及端侧生成式 AI 潜力的资源。请从 [Google AI Edge Gallery GitHub 仓库](https://github.com/google-ai-edge/gallery)浏览源代码并下载应用。

## 配置选项

使用以下配置选项设置 Android 应用:

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `modelPath` | 项目目录中模型存储的路径。 | PATH | N/A |
| `maxTokens` | 模型处理的最大 token 数(输入 token + 输出 token)。 | 整数 | 512 |
| `topK` | 模型在生成每一步所考虑的 token 数。将预测限制为概率最高的前 k 个 token。 | 整数 | 40 |
| `temperature` | 生成过程中引入的随机性程度。温度越高,生成的文本越有创意;温度越低,生成结果越可预测。 | 浮点数 | 0.8 |
| `randomSeed` | 文本生成期间使用的随机种子。 | 整数 | 0 |
| `loraPath` | 设备上 LoRA 模型的绝对路径。注意:仅与 GPU 模型兼容。 | PATH | N/A |
| `resultListener` | 设置结果监听器以异步接收结果。仅在使用异步生成方法时适用。 | N/A | N/A |
| `errorListener` | 设置可选的错误监听器。 | N/A | N/A |

## 多模态提示

LLM 推理 API Android API 支持使用接受文本、图像和音频输入的模型进行多模态提示。启用多模态后,用户可以在提示词中组合图像和文本或音频和文本。随后 LLM 会提供文本响应。

要开始使用,请使用 [Gemma 3n](https://ai.google.dev/gemma/docs/gemma-3n) 的 MediaPipe 兼容变体:

-   [Gemma-3n E2B](https://huggingface.co/google/gemma-3n-E2B-it-litert-lm):Gemma-3n 系列的有效 2B 模型。
-   [Gemma-3n E4B](https://huggingface.co/google/gemma-3n-E4B-it-litert-lm):Gemma-3n 系列的有效 4B 模型。

有关更多信息,请参阅 [Gemma-3n 文档](https://ai.google.dev/gemma/docs/gemma-3n)。

按照以下步骤为 LLM 推理 API 启用图像或音频输入。

### 图像输入

要在提示词中提供图像,请在将其传递到 LLM 推理 API 之前,将输入图像或帧转换为 `com.google.mediapipe.framework.image.MPImage` 对象:

```
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage

// 将输入 Bitmap 对象转换为 MPImage 对象以运行推理
val mpImage = BitmapImageBuilder(image).build()
```

要为 LLM 推理 API 启用视觉支持,请在 Graph 选项中设置 `EnableVisionModality` 配置选项为 `true`:

```
LlmInferenceSession.LlmInferenceSessionOptions sessionOptions =
  LlmInferenceSession.LlmInferenceSessionOptions.builder()
    ...
    .setGraphOptions(GraphOptions.builder().setEnableVisionModality(true).build())
    .build();
```

每会话最多设置 10 张图像。

```
LlmInferenceOptions options = LlmInferenceOptions.builder()
  ...
  .setMaxNumImages(10)
  .build();
```

以下是 LLM 推理 API 设置为处理视觉和文本输入的示例实现:

```
MPImage image = getImageFromAsset(BURGER_IMAGE);

LlmInferenceSession.LlmInferenceSessionOptions sessionOptions =
  LlmInferenceSession.LlmInferenceSessionOptions.builder()
    .setTopK(10)
    .setTemperature(0.4f)
    .setGraphOptions(GraphOptions.builder().setEnableVisionModality(true).build())
    .build();

try (LlmInference llmInference =
    LlmInference.createFromOptions(ApplicationProvider.getApplicationContext(), options);
  LlmInferenceSession session =
    LlmInferenceSession.createFromOptions(llmInference, sessionOptions)) {
  session.addQueryChunk("Describe the objects in the image.");
  session.addImage(image);
  String result = session.generateResponse();
}
```

### 音频输入

在 LlmInferenceOptions 中启用音频支持:

```
val inferenceOptions = LlmInference.LlmInferenceOptions.builder()
  ...
  .setAudioModelOptions(AudioModelOptions.builder().build())
  .build()
```

在 sessionOptions 中启用音频支持:

```
val sessionOptions =  LlmInferenceSessionOptions.builder()
  ...
  .setGraphOptions(GraphOptions.builder().setEnableAudioModality(true).build())
  .build()
```

在推理期间发送音频数据。注意:音频必须是单声道的 `.wav` 格式

```
val audioData: ByteArray = ...
inferenceEngine.llmInferenceSession.addAudio(audioData)
```

以下是 LLM 推理 API 设置为处理音频和文本输入的示例实现:

```
val audioData: ByteArray = ...
val inferenceOptions = LlmInference.LlmInferenceOptions.builder()
  ...
  .setAudioModelOptions(AudioModelOptions.builder().build())
  .build()
val sessionOptions =  LlmInferenceSessionOptions.builder()
  ...
  .setGraphOptions(GraphOptions.builder().setEnableAudioModality(true).build())
  .build()

LlmInference.createFromOptions(context, inferenceOptions).use { llmInference ->
  LlmInferenceSession.createFromOptions(llmInference, sessionOptions).use { session ->
    session.addQueryChunk("Transcribe the following speech segment:")
    session.addAudio(audioData)
    val result = session.generateResponse()
  }
}
```

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

Android 在初始化期间支持静态 LoRA。要加载 LoRA 模型,请指定 LoRA 模型路径以及基础 LLM。

```
// 设置 LLM 推理任务的配置选项
val options = LlmInferenceOptions.builder()
        .setModelPath(BASE_MODEL_PATH)
        .setMaxTokens(1000)
        .setTopK(40)
        .setTemperature(0.8)
        .setRandomSeed(101)
        .setLoraPath(LORA_MODEL_PATH)
        .build()

// 创建 LLM 推理任务的实例
llmInference = LlmInference.createFromOptions(context, options)
```

要使用 LoRA 运行 LLM 推理,请使用与基础模型相同的 `generateResponse()` 或 `generateResponseAsync()` 方法。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*