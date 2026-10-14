---
title: "音频分类 (Audio classification)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/audio/audio_classifier/web_js"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2024-04-18 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Web 与 JavaScript 的音频分类 (Audio classification for web and JavaScript)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/solutions/audio/audio_classifier/web_js)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 音频分类器 (Audio Classifier) 任务允许你对音频数据执行分类。你可以使用此任务从一组训练好的类别中识别声音事件。这些说明将向你展示如何在 Node 和 Web 应用程序中使用音频分类器。

你可以通过查看[演示](https://google-ai-edge.github.io/mediapipe-samples-web/#/audio/audio_classifier)来查看此任务的运行情况。有关此任务的功能、模型和配置选项的更多信息，请参阅[概述](https://developers.google.com/edge/mediapipe/solutions/audio/audio_classifier/index)。

## 代码示例

音频分类器的示例代码在 JavaScript 中提供了此任务的完整实现，供你参考。该代码可帮助你测试此任务并开始构建自己的音频分类应用程序。你可以仅使用 Web 浏览器查看、运行和编辑音频分类器的[示例](https://stackblitz.com/github/google-ai-edge/mediapipe-samples-web?file=src%2Ftasks%2Faudio-classifier.ts)。

## 环境配置指南

本节描述了设置开发环境和专门用于使用音频分类器的代码项目的关键步骤。有关设置开发环境以使用 MediaPipe Tasks 的一般信息，包括平台版本要求，请参阅 [Web 环境配置指南](../../setup_web.md)。

### JavaScript 包

音频分类器代码可通过 MediaPipe `@mediapipe/tasks-audio` [NPM](https://www.npmjs.com/search?q=%40mediapipe) 包获得。你可以从平台[环境配置指南](../../setup_web.md#downloads)中提供的链接查找并下载这些库。

你可以使用以下命令为本地暂存安装所需的包：

```javascript
npm install @mediapipe/tasks-audio
```

如果你希望通过内容分发网络 (CDN) 服务导入任务代码，请在 HTML 文件的 `<head>` 标签中添加以下代码：

```html
<!-- Replace "my-cdn-service.com" with your CDN -->
<head>
  <script src="https://my-cdn-service.com/npm/@mediapipe/tasks-audio/audio_bundle.js"
    crossorigin="anonymous"></script>
</head>
```

### 模型

MediaPipe 音频分类器任务需要一个与此任务兼容的受过训练的模型。有关音频分类器的可用训练模型的更多信息，请参阅任务概述的[模型部分](https://developers.google.com/edge/mediapipe/solutions/audio/audio_classifier/index#models)。

选择并下载一个模型，然后将其存储在项目目录中，例如：

```bash
<dev-project-root>/app/shared/models/
```

## 创建任务

使用音频分类器的 `createFrom...()` 函数之一来准备运行推理的任务。你可以使用 `createFromModelPath()` 函数并传入训练好的模型文件的相对或绝对路径。如果你的模型已加载到内存中，你可以使用 `createFromModelBuffer()` 方法。

下面的代码示例演示了如何使用 `createFromOptions()` 函数来设置任务。`createFromOptions` 函数允许你使用配置选项自定义音频分类器。有关配置选项的更多信息，请参阅[配置选项](#configuration_options)。

以下代码演示了如何使用自定义选项构建和配置任务：

```javascript
const audio = await FilesetResolver.forAudioTasks(
    "https://my-cdn-service.com/npm/@mediapipe/tasks-audio/wasm"
  );

const audioClassifier = await AudioClassifier.createFromOptions(audio, {
    baseOptions: {
      modelAssetPath:
        "https://tfhub.dev/google/lite-model/yamnet/classification/tflite/1?lite-format=tflite"
    }
  });
```

你可以在 [`example code`](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/workers/audio-classifier.worker.ts) 中查看完整示例。

### 配置选项

此任务为 Web 和 JavaScript 应用程序提供以下配置选项：

| 选项名称 | 描述 | 取值范围 | 默认值 |
| --- | --- | --- | --- |
| `displayNamesLocale` | 设置用于在任务模型的元数据中提供的显示名称标签语言（如果有）。默认值为 `en`，表示英语。你可以使用 [TensorFlow Lite Metadata Writer API](https://ai.google.dev/edge/lite/models/metadata_writer_tutorial#audio_classifiers) 将本地化的标签添加到自定义模型的元数据中。 | Locale code | en |
| `maxResults` | 设置要返回的可选得分最高的分类结果的最大数量。如果小于 0，则将返回所有可用的结果。 | 任意正数 | `-1` |
| `scoreThreshold` | 设置预测分数阈值，该阈值会覆盖模型元数据中提供的阈值（如果有）。低于此值的结果将被拒绝。 | [0.0, 1.0] | Not set |
| `categoryAllowlist` | 设置允许的类别名称的可选列表。如果非空，则其类别名称不在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `categoryDenylist` 互斥，同时使用两者会导致错误。 | 任意字符串 | Not set |
| `categoryDenylist` | 设置不允许的类别名称的可选列表。如果非空，则其类别名称在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `categoryAllowlist` 互斥，同时使用两者会导致错误。 | 任意字符串 | Not set |

## 准备数据

音频分类器可以处理音频剪辑和音频流 (audio streams)，并且可以处理主机浏览器支持的任何格式的音频文件。该任务负责处理数据输入预处理，包括重采样、缓冲和分帧。

## 运行任务

音频分类器使用 `classify()` 方法为音频剪辑文件或音频流运行推理。音频分类器 API 会返回输入音频中识别出的声音事件的可能类别。

调用音频分类器的 `classify()` 方法会同步运行，并阻塞用户界面线程。如果你对来自设备麦克风的音频进行分类，每个分类都会阻塞主线程。你可以通过实现 Web Workers 以在另一个线程上运行 `classify()` 来防止这种情况。

以下代码演示了如何使用任务模型执行处理：

### 音频剪辑

```javascript
// Create audio buffer
const sample = await response.arrayBuffer();
const audioBuffer = await audioCtx.decodeAudioData(sample);

// Use AudioClassifier to run classification
const results = audioClassifier.classify(
  audioBuffer.getChannelData(0),
  audioBuffer.sampleRate
);
```

### 音频流

```javascript
stream = await navigator.mediaDevices.getUserMedia(constraints);
audioCtx = new AudioContext({ sampleRate: 16000 });

const source = audioCtx.createMediaStreamSource(stream);
const scriptNode = audioCtx.createScriptProcessor(16384, 1, 1);

scriptNode.onaudioprocess = function (audioProcessingEvent) {
  const inputBuffer = audioProcessingEvent.inputBuffer;
  let inputData = inputBuffer.getChannelData(0);

  // Classify the audio
  const result = audioClassifier.classify(inputData);
  const categories = result[0].classifications[0].categories;
};
```

有关运行音频分类器任务的更完整实现，请参阅[示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/workers/audio-classifier.worker.ts)。

## 处理和显示结果

当你完成推理运行后，音频分类器任务会返回一个 `AudioClassifierResult` 对象，其中包含输入音频中可能对象的类别列表。

```text
AudioClassifierResult:
  Timestamp in microseconds: 100
  ClassificationResult #0:
    Timestamp in microseconds: 100  
    Classifications #0 (single classification head):
      head index: 0
      category #0:
        category name: "Speech"
        score: 0.6
        index: 0
      category #1:
        category name: "Music"
        score: 0.2
        index: 1
```

音频分类器示例代码演示了如何显示任务返回的分类结果，有关详细信息，请参阅[示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/audio-classifier.ts)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*
