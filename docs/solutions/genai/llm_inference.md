---
title: "LLM 推理指南 (LLM Inference guide)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/genai/llm_inference"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-01 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# LLM 推理指南 (LLM Inference guide)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/genai/llm_inference)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

> **⚠️ 重要:LLM 推理 API 更新**
>
> MediaPipe LLM 推理 API(Android、iOS 和 Web)现处于**仅维护模式**。新功能和优化将集中在 **[LiteRT-LM](https://developers.google.com/edge/litert-lm/overview)** 上。
>
> 我们建议将您的项目迁移到 LiteRT-LM,以确保持续的支持和性能。

> **注意:** 使用 MediaPipe LLM 推理 API 须遵守[生成式 AI 禁止使用政策](https://policies.google.com/terms/generative-ai/use-policy)。

LLM 推理 API 可让您完全在端侧运行大语言模型(LLM),可用于执行各种任务,例如生成文本、以自然语言形式检索信息以及总结文档。该任务内置支持多种文本到文本大语言模型,因此您可以将最新的端侧生成式 AI 模型应用到您的应用和产品中。

[立即试用](https://mediapipe-studio.webapps.google.com/demo/llm_inference)

该任务为各种 LLM 提供内置支持。托管在 [LiteRT Community](https://huggingface.co/litert-community) 页面上的模型以 MediaPipe 友好格式提供,无需任何额外的转换或编译步骤。

您可以使用 [LiteRT Torch](https://github.com/google-ai-edge/litert-torch) 将 PyTorch 模型导出为多签名 LiteRT(`tflite`)模型,并与分词器参数捆绑以创建 Task Bundle(任务包)。使用 LiteRT Torch 转换的模型与 LLM 推理 API 兼容,可在 CPU 后端运行,适用于 Android 和 iOS 应用。

## 开始使用

按照以下目标平台的实现指南之一开始使用此任务。这些平台专属指南会逐步演示该任务的基本实现,其中的代码示例使用了可用的模型和推荐的配置选项:

| 平台 | 代码示例 | 指南 |
|---|---|---|
| Android | [代码示例](https://github.com/google-ai-edge/gallery) | [指南](android.md) |
| iOS | [代码示例](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/llm_inference/ios) | [指南](ios.md) |
| Web | [代码示例](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/llm_inference/js) | [指南](web_js.md) |

## 任务详情

本节介绍此任务的功能、输入、输出和配置选项。

### 特性

LLM 推理 API 包含以下关键特性:

1.  **文本到文本生成(Text-to-text generation)** — 根据输入文本提示词生成文本。
2.  **LLM 选择** — 应用多个模型来针对您的特定用例定制应用。您还可以对模型进行再训练并应用自定义权重。
3.  **LoRA 支持** — 通过在您自己的数据集上训练,或采用开源社区准备好的预构建 LoRA 模型(与使用 LiteRT Torch Generative API 转换的模型不兼容),使用 LoRA 模型扩展和定制 LLM 能力。

任务输入

任务输出

LLM 推理 API 接受以下输入:

-   文本提示词(例如,一个问题、一封邮件主题、一份待摘要的文档)

LLM 推理 API 输出以下结果:

-   基于输入提示词生成的文本(例如,问题的答案、一封邮件草稿、一份文档摘要)

### 配置选项

此任务具有以下配置选项:

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

## 模型

LLM 推理 API 支持多种文本到文本大语言模型,包括为在浏览器和移动设备上运行而优化的多个模型的内置支持。这些轻量级模型可用于完全在端侧运行推理。

在初始化 LLM 推理 API 之前,请下载一个模型并将文件存储在您的项目目录中。您可以使用 [LiteRT Community](https://huggingface.co/litert-community) HuggingFace 仓库中预转换的模型,或使用 [AI Edge Torch Generative Converter](https://github.com/google-ai-edge/litert-torch/tree/main/litert_torch/generative) 将模型转换为 MediaPipe 兼容格式。

如果您还没有可与 LLM 推理 API 一起使用的 LLM,请从以下模型之一开始使用。

### Gemma-3n

Gemma-3n E2B 和 E4B 是 Gemma 轻量级、最先进开源模型系列中的最新模型,基于用于创建 [Gemini](https://ai.google.dev/docs) 模型的相同研究和技术构建。Gemma 3n 模型专为在低资源设备上高效执行而设计。它们支持多模态输入,可处理文本、图像和音频输入,并生成文本输出。

Gemma 3n 模型使用选择性参数激活技术来降低资源需求。该技术使模型能够以 2B 和 4B 参数的有效规模运行,低于其包含的总参数数量。

> **注意:** Gemma-3n 是一个公开可用的模型。您有责任遵守任何适用的许可条款。

[下载 Gemma-3n E2B](https://huggingface.co/google/gemma-3n-E2B-it-litert-lm)

[下载 Gemma-3n E4B](https://huggingface.co/google/gemma-3n-E4B-it-litert-lm)

HuggingFace 上的 Gemma-3n E2B 和 E4B 模型提供 `.litertlm` 格式,可直接用于 Android 和 Web 的 LLM 推理 API。

### Gemma-3 1B

> **注意:** Gemma-3 是一个公开可用的模型。您有责任遵守任何适用的许可条款。

[Gemma-3 1B](https://huggingface.co/litert-community/Gemma3-1B-IT) 是 Gemma 轻量级、最先进开源模型系列中最轻量的模型,基于用于创建 [Gemini](https://ai.google.dev/docs) 模型的相同研究和技术构建。该模型包含 1B 参数和开放权重。

[下载 Gemma-3 1B](https://huggingface.co/litert-community/Gemma3-1B-IT)

[HuggingFace](https://huggingface.co/litert-community/Gemma3-1B-IT) 上的 Gemma-3 1B 模型提供 `.task`/[`.litertlm`](https://github.com/google-ai-edge/LiteRT-LM?tab=readme-ov-file#quick-start) 格式,可直接用于 Android 和 Web 应用的 LLM 推理 API。

在使用 LLM 推理 API 运行 Gemma-3 1B 时,请相应地配置以下选项:

-   `preferredBackend`:使用此选项在 `CPU` 或 `GPU` 后端之间进行选择。此选项仅适用于 Android。
-   `supportedLoraRanks`:LLM 推理 API 无法配置为支持 Gemma-3 1B 模型的低秩自适应(LoRA)。请勿使用 `supportedLoraRanks` 或 `loraRanks` 选项。
-   `maxTokens`:`maxTokens` 的值必须与模型内置的上下文大小匹配。这也可以称为键值(KV)缓存或上下文长度。
-   `numResponses`:必须始终为 1。此选项仅适用于 Web。

在 Web 应用上运行 Gemma-3 1B 时,初始化可能会导致当前线程长时间阻塞。如果可能,请始终在工作线程中运行模型。

### Gemma-2 2B

> **注意:** Gemma-2 是一个公开可用的模型。您有责任遵守任何适用的许可条款。

[Gemma-2 2B](https://huggingface.co/litert-community/Gemma2-2B-IT) 是 Gemma-2 的 2B 变体,适用于所有平台。

[下载 Gemma-2 2B](https://huggingface.co/litert-community/Gemma2-2B-IT)

该模型包含 2B 参数和开放权重。Gemma-2 2B 以其同类模型中卓越的推理能力而著称。

## PyTorch 模型转换

> **注意:** LiteRT Torch 库处于早期开发阶段。API 不稳定,包含一些[已知问题](https://github.com/google-ai-edge/litert-torch/tree/main/litert_torch/generative#known-issues)。

PyTorch 生成式模型可以使用 [LiteRT Torch Generative API](https://github.com/google-ai-edge/litert-torch/tree/main/litert_torch/generative) 转换为 MediaPipe 兼容格式。您可以使用该 API 将 PyTorch 模型转换为多签名 LiteRT(TensorFlow Lite)模型。有关映射和导出模型的更多详情,请访问 LiteRT Torch [GitHub 页面](https://github.com/google-ai-edge/litert-torch)。

使用 [LiteRT Torch Generative API](https://github.com/google-ai-edge/litert-torch/tree/main/litert_torch/generative) 转换 PyTorch 模型涉及以下步骤:

1.  下载 PyTorch 模型检查点。
2.  使用 LiteRT Torch Generative API 编写、转换和量化模型为 MediaPipe 兼容的文件格式(`.tflite`)。
3.  从 tflite 文件和模型分词器创建 Task Bundle(`.task`/`.litertlm`)。

Torch Generative 转换器仅针对 CPU 转换,需要一台至少 64 GB RAM 的 Linux 机器。

要创建 Task Bundle,请使用[捆绑脚本](https://colab.sandbox.google.com/github/googlesamples/mediapipe/blob/main/examples/llm_inference/bundling/llm_bundling.ipynb)创建 *Task Bundle*。捆绑过程将映射后的模型与端到端推理所需的附加元数据(例如,分词器参数)打包在一起。

模型捆绑过程需要 MediaPipe PyPI 包。从 `0.10.14` 开始,所有 MediaPipe 包中都提供转换脚本。

> **注意:** 为避免兼容性问题,请使用[模型捆绑 Colab](https://colab.sandbox.google.com/github/googlesamples/mediapipe/blob/main/examples/llm_inference/bundling/llm_bundling.ipynb)。

安装并导入依赖项:

```
$ python3 -m pip install mediapipe
```

使用 `genai.bundler` 库捆绑模型:

```
import mediapipe as mp
from mediapipe.tasks.python.genai import bundler

config = bundler.BundleConfig(
    tflite_model=TFLITE_MODEL,
    tokenizer_model=TOKENIZER_MODEL,
    start_token=START_TOKEN,
    stop_tokens=STOP_TOKENS,
    output_filename=OUTPUT_FILENAME,
    enable_bytes_to_unicode_mapping=ENABLE_BYTES_TO_UNICODE_MAPPING,
)
bundler.create_bundle(config)
```

| 参数 | 说明 | 可接受的值 |
|---|---|---|
| `tflite_model` | AI Edge 导出的 TFLite 模型的路径。 | PATH |
| `tokenizer_model` | SentencePiece 分词器模型的路径。 | PATH |
| `start_token` | 模型专属的起始 token。起始 token 必须存在于所提供的分词器模型中。 | STRING |
| `stop_tokens` | 模型专属的停止 token。停止 token 必须存在于所提供的分词器模型中。 | LIST\[STRING\] |
| `output_filename` | 输出任务捆绑文件的名称。 | PATH |

## LoRA 定制

MediaPipe LLM 推理 API 可配置为支持大语言模型的低秩自适应(LoRA)。利用微调后的 LoRA 模型,开发人员可以通过经济高效的训练过程定制 LLM 的行为。

LLM 推理 API 的 LoRA 支持适用于 GPU 后端的所有 Gemma 变体和 Phi-2 模型,LoRA 权重仅适用于注意力层。此初始实现用作未来开发的实验性 API,计划在后续更新中支持更多模型和各种类型的层。

### 准备 LoRA 模型

按照 [HuggingFace 上的说明](https://huggingface.co/docs/peft/main/en/task_guides/lora_based_methods),使用受支持的模型类型(Gemma 或 Phi-2)在您自己的数据集上训练微调的 LoRA 模型。[Gemma-2 2B](https://huggingface.co/google/gemma-2-2b)、[Gemma 2B](https://huggingface.co/google/gemma-2b) 和 [Phi-2](https://huggingface.co/microsoft/phi-2) 模型均可从 HuggingFace 以 safetensors 格式获取。由于 LLM 推理 API 仅支持注意力层上的 LoRA,因此创建 `LoraConfig` 时仅指定注意力层,如下所示:

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

用于测试,目前有公开可访问且适合 LLM 推理 API 的微调 LoRA 模型可在 HuggingFace 上获取。例如,Gemma-2B 可使用 [monsterapi/gemma-2b-lora-maths-orca-200k](https://huggingface.co/monsterapi/gemma-2b-lora-maths-orca-200k),Phi-2 可使用 [lole25/phi-2-sft-ultrachat-lora](https://huggingface.co/lole25/phi-2-sft-ultrachat-lora)。

在准备好的数据集上训练并保存模型后,您将获得一个包含微调后 LoRA 模型权重的 `adapter_model.safetensors` 文件。safetensors 文件是模型转换中使用的 LoRA 检查点。

下一步,您需要使用 MediaPipe Python 包将模型权重转换为 TensorFlow Lite Flatbuffer。`ConversionConfig` 应指定基础模型选项以及附加的 LoRA 选项。请注意,由于 API 仅支持使用 GPU 进行 LoRA 推理,因此后端必须设置为 `'gpu'`。

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
  lora_output_tflite_file=LORA_OUTPUT_TFLITE_FILE,
)

converter.convert_checkpoint(config)
```

转换器将输出两个 TFLite flatbuffer 文件,一个用于基础模型,另一个用于 LoRA 模型。

### LoRA 模型推理

Web、Android 和 iOS 的 LLM 推理 API 已更新以支持 LoRA 模型推理。

Android 在初始化期间支持静态 LoRA。要加载 LoRA 模型,用户需指定 LoRA 模型路径以及基础 LLM。

```
// 设置 LLM 推理任务的配置选项
val options = LlmInferenceOptions.builder()
        .setModelPath('<path to base model>')
        .setMaxTokens(1000)
        .setTopK(40)
        .setTemperature(0.8)
        .setRandomSeed(101)
        .setLoraPath('<path to LoRA model>')
        .build()

// 创建 LLM 推理任务的实例
llmInference = LlmInference.createFromOptions(context, options)
```

要使用 LoRA 运行 LLM 推理,请使用与基础模型相同的 `generateResponse()` 或 `generateResponseAsync()` 方法。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*