---
title: "Python 版音频分类指南 (Audio Classification Guide for Python)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/audio/audio_classifier/python"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-09-02 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Python 版音频分类指南 (Audio Classification Guide for Python)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/audio/audio_classifier/python)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 音频分类器(Audio Classifier)任务允许你对音频数据执行分类。你可以使用此任务从一组已训练的类别中识别声音事件。以下说明介绍如何在 Python 中使用音频分类器。

关于此任务的功能、模型和配置选项的更多信息,请参阅[总览](../audio_classifier.md)。

## 代码示例 (Code example)

音频分类器的示例代码提供了此任务在 Python 中的完整实现,供你参考。此代码帮助你测试此任务,并开始构建你自己的音频分类器。你可以仅使用浏览器,通过 Google Colab 查看、运行和编辑音频分类器[示例代码](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/audio_classifier/python/audio_classification.ipynb)。你也可以在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/audio_classifier/python) 上查看此示例的源代码。

如果你正在为 Raspberry Pi 实现音频分类器,请参阅 [Raspberry Pi 示例应用](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/audio_classifier/raspberry_pi)。

## 环境配置 (Setup)

本节介绍专门用于使用音频分类器的开发环境与代码项目配置的关键步骤。关于使用 MediaPipe 任务(包括平台版本要求)配置开发环境的一般信息,请参阅 [Python 环境配置指南](../../setup_python.md)。

### 软件包 (Packages)

需要以下依赖项来使用 MediaPipe Python 音频分类器任务:

```
mediapipe
```

运行 `pip install mediapipe` 即可安装该依赖项。如果你需要其他 Python 环境配置选项,请参阅 [Python 环境配置指南](../../setup_python.md)。

### 导入 (Imports)

导入以下类以访问音频分类器任务函数:

```
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import audio
```

### 模型 (Model)

MediaPipe 音频分类器任务需要与此任务兼容的已训练模型。关于音频分类器可用已训练模型的更多信息,请参阅任务总览中的[模型小节](../audio_classifier.md#models)。

选择并下载模型,然后将其存储在本地目录中。你可以使用推荐的 [Yamnet](https://tfhub.dev/google/lite-model/yamnet/classification/tflite/1?lite-format=tflite) 模型。

```
model_path = '/absolute/path/to/lite-model_yamnet_classification_tflite_1.tflite'
```

在 Model Name 参数中指定模型的路径,如下所示:

```
base_options = BaseOptions(model_asset_path=model_path)
```

## 创建任务 (Create the task)

使用 `create_from_options` 函数创建任务。`create_from_options` 函数接受配置选项,包括运行模式、显示名称区域设置(display names locale)、最大结果数、置信度阈值、类别允许列表(allow list)和拒绝列表(deny list)。关于配置选项的更多信息,请参阅[配置总览](#configuration)。

音频分类器任务支持音频片段和音频流作为输入。你需要在创建任务时指定与输入数据类型对应的运行模式。选择与你输入数据类型对应的标签页,查看如何创建任务并运行推理。

### 音频片段 (Audio clips)

```
AudioClassifier = mp.tasks.audio.AudioClassifier
AudioClassifierOptions = mp.tasks.audio.AudioClassifierOptions
AudioRunningMode = mp.tasks.audio.RunningMode
BaseOptions = mp.tasks.BaseOptions

options = AudioClassifierOptions(
    base_options=BaseOptions(model_asset_path='/path/to/model.tflite'),
    max_results=5,
    running_mode=AudioRunningMode.AUDIO_CLIPS)

with AudioClassifier.create_from_options(options) as classifier:
  # The classifier is initialized. Use it here.
  # ...
```

### 音频流 (Audio stream)

```
AudioClassifier = mp.tasks.audio.AudioClassifier
AudioClassifierOptions = mp.tasks.audio.AudioClassifierOptions
AudioClassifierResult = mp.tasks.audio.AudioClassifierResult
AudioRunningMode = mp.tasks.audio.RunningMode
BaseOptions = mp.tasks.BaseOptions

def print_result(result: AudioClassifierResult, timestamp_ms: int):
    print(AudioClassifierResult result: {}’.format(result))

options = AudioClassifierOptions(
    base_options=BaseOptions(model_asset_path='/path/to/model.tflite'),
    running_mode=AudioRunningMode.AUDIO_STREAM,
    max_results=5,
    result_callback=print_result)

with AudioClassifier.create_from_options(options) as classifier:
  # The classifier is initialized. Use it here.
  # ...
```

关于创建用于音频的音频分类器的完整示例,请参阅[代码示例](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/audio_classifier/python/audio_classification.ipynb)。

### 配置选项 (Configuration options)

此任务在 Python 应用中有以下配置选项:

| 选项名 (Option Name) | 说明 (Description) | 值范围 (Value Range) | 默认值 (Default Value) |
| --- | --- | --- | --- |
| `running_mode` | 设置任务的运行模式。音频分类器有两种模式: AUDIO\_CLIPS:在独立音频片段上运行音频任务的模式。 AUDIO\_STREAM:在音频流上运行音频任务的模式,例如来自麦克风的输入。在此模式下,必须调用 resultListener 来设置监听器,以便异步接收分类结果。 | {`AUDIO_CLIPS, AUDIO_STREAM`} | `AUDIO_CLIPS` |
| `display_names_locale` | 设置任务模型元数据中提供的显示名称标签所使用的语言(如有)。默认为 `en`(英语)。你可以使用 [TensorFlow Lite Metadata Writer API](https://ai.google.dev/edge/lite/models/metadata_writer_tutorial#audio_classifiers) 向自定义模型的元数据添加本地化标签。 | 区域代码 (Locale code) | en |
| `max_results` | 设置要返回的分类结果的最大数量(可选)。如果 < 0,将返回所有可用结果。 | 任意正数 | `-1` |
| `score_threshold` | 设置预测分数阈值,覆盖模型元数据中提供的阈值(如有)。低于此值的结果将被拒绝。 | [0.0, 1.0] | 未设置 (Not set) |
| `category_allowlist` | 设置允许的类别名称列表(可选)。如果非空,类别名称不在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `category_denylist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 (Not set) |
| `category_denylist` | 设置不允许的类别名称列表(可选)。如果非空,类别名称在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `category_allowlist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 (Not set) |
| `result_callback` | 设置结果监听器,以便在音频分类器处于音频流模式时异步接收分类结果。仅在运行模式设置为 `AUDIO_STREAM` 时可用。 | 不适用 (N/A) | 未设置 (Not set) |

## 准备数据 (Prepare data)

音频分类器支持音频片段和音频流。任务会处理数据输入的预处理,包括重采样(resampling)、缓冲(buffering)和分帧(framing)。

将输入准备为音频文件或 numpy 数组,然后将其转换为 MediaPipe `AudioData` 对象。你可以使用 [SciPy](https://scipy.org/) 等外部库将输入音频加载为 numpy 数组。

以下示例针对每种可用的数据类型,说明并演示如何准备数据以供处理:

### 音频片段 (Audio clips)

```
import numpy as np
from scipy.io import wavfile

AudioData = mp.tasks.components.containers.AudioData

sample_rate, buffer = wavfile.read('/path/to/audio.wav')
audio_data = AudioData.create_from_array(
    buffer.astype(float) / np.iinfo(np.int16).max, sample_rate)
```

### 音频流 (Audio stream)

```
import numpy as np

AudioData = mp.tasks.components.containers.AudioData

# Read microphone data as np arrays, then call

audio_data = AudioData.create_from_array(
    buffer.astype(float) / np.iinfo(np.int16).max, sample_rate)
```

> **注意:** 音频分类器任务会自动对输入音频进行重采样、缓冲和分帧,以匹配其模型的输入要求。

## 运行任务 (Run the task)

调用与你的运行模式对应的 classify 函数来触发推理。音频分类器 API 会返回输入音频缓冲区中音频事件的候选类别。

### 音频片段 (Audio clips)

```
# Perform audio classification on the provided audio clip.
audio_classifier_result_list = classifier.classify(audio_data)
```

### 音频流 (Audio stream)

```
# Send live audio data to perform audio classification.
# Results are sent to the `result_callback` provided in the `AudioClassifierOptions`
classifier.classify_async(audio_data, timestamp_ms)
```

请注意以下事项:

- 在音频流模式下运行时,你还需要向音频分类器任务提供输入音频数据的时间戳。
- 在音频片段模式下运行时,音频分类器任务会阻塞当前线程,直到处理完输入音频。

关于使用音频片段运行音频分类器的更完整示例,请参阅[代码示例](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/audio_classifier/python/audio_classification.ipynb)。

## 处理并显示结果 (Handle and display results)

运行推理后,音频分类器任务会返回一个 `AudioClassifierResult` 对象,其中包含输入音频中音频事件的候选类别列表。

以下展示了此任务的输出数据示例:

```
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

音频分类器示例代码演示了如何显示此任务返回的分类结果,详情请参阅[代码示例](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/audio_classifier/python/audio_classification.ipynb)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*