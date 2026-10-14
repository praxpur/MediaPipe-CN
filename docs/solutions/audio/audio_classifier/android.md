---
title: "Android 版音频分类指南 (Audio Classification Guide for Android)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/audio/audio_classifier/android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-09-02 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Android 版音频分类指南 (Audio Classification Guide for Android)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/audio/audio_classifier/android)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 音频分类器(Audio Classifier)任务允许你对音频数据执行分类。你可以使用此任务从一组已训练的类别中识别声音事件。以下说明介绍如何在 Android 应用中使用音频分类器。

关于此任务的功能、模型和配置选项的更多信息,请参阅[总览](../audio_classifier.md)。

## 代码示例 (Code example)

MediaPipe Tasks 示例代码是一个适用于 Android 的音频分类器应用的简单实现。该示例使用实体 Android 设备上的麦克风持续对声音进行分类,也可以对存储在设备上的声音文件运行分类器。

你可以将该应用作为自己 Android 应用的起点,也可以在修改现有应用时参考它。音频分类器示例代码托管在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/audio_classifier/android) 上。

### 下载代码 (Download the code)

以下说明介绍如何使用 [git](https://git-scm.com/) 命令行工具创建示例代码的本地副本。

下载示例代码:

1.  使用以下命令克隆 git 仓库:

    ```
    git clone https://github.com/google-ai-edge/mediapipe-samples
    ```

2.  可选:配置你的 git 实例使用稀疏检出(sparse checkout),这样你只保留音频分类器示例应用所需的文件:

    ```
    cd mediapipe-samples
    git sparse-checkout init --cone
    git sparse-checkout set examples/audio_classifier/android
    ```

创建示例代码的本地版本后,你可以将项目导入 Android Studio 并运行该应用。相关说明请参阅 [Android 环境配置指南](../../setup_android.md#example_code)。

### 关键组件 (Key components)

以下文件包含此音频分类示例应用的关键代码:

- [AudioClassifierHelper.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/audio_classifier/android/app/src/main/java/com/google/mediapipe/examples/audioclassifier/AudioClassifierHelper.kt) - 初始化音频分类器,并处理模型和委托(delegate)选择。
- [RecorderFragment.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/audio_classifier/android/app/src/main/java/com/google/mediapipe/examples/audioclassifier/fragment/RecorderFragment.kt) - 创建实时音频录制的用户界面和控制代码。
- [LibraryFragment.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/audio_classifier/android/app/src/main/java/com/google/mediapipe/examples/audioclassifier/fragment/LibraryFragment.kt) - 创建用于选择音频文件的用户界面和控制代码。
- [ProbabilitiesAdapter.kt](https://github.com/googlesamples/mediapipe/blob/main/examples/audio_classifier/android/app/src/main/java/com/google/mediapipe/examples/audioclassifier/fragment/ProbabilitiesAdapter.kt) - 处理并格式化分类器的预测结果。

## 环境配置 (Setup)

本节介绍专门用于使用音频分类器的开发环境与代码项目配置的关键步骤。关于使用 MediaPipe 任务(包括平台版本要求)配置开发环境的一般信息,请参阅 [Android 环境配置指南](../../setup_android.md)。

### 依赖项 (Dependencies)

音频分类器使用 `com.google.mediapipe:tasks-audio` 库。请将此依赖项添加到你的 Android 应用开发项目的 `build.gradle` 文件中。使用以下代码导入所需依赖:

```
dependencies {
    ...
    implementation 'com.google.mediapipe:tasks-audio:latest.release'
}
```

### 模型 (Model)

MediaPipe 音频分类器任务需要与此任务兼容的已训练模型。关于音频分类器可用已训练模型的更多信息,请参阅任务总览中的[模型小节](../audio_classifier.md#models)。

选择并下载模型,然后将其存储在你的项目目录中:

```
<dev-project-root>/src/main/assets
```

> **注意:** 建议使用此位置,因为 Android 构建系统会自动检查此目录中的文件资源。

使用 `BaseOptions.Builder.setModelAssetPath()` 方法指定模型使用的路径。下一节的代码示例中会用到此方法。

在音频分类器[示例代码](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/audio_classifier/android)中,模型在 [`AudioClassifierHelper.kt`](https://github.com/googlesamples/mediapipe/blob/2b9de6135a098e81b7153377b70dda2570e30c62/examples/audio_classifier/android/app/src/main/java/com/google/mediapipe/examples/audioclassifier/AudioClassifierHelper.kt#L76) 文件中定义。

## 创建任务 (Create the task)

你可以使用 `createFromOptions` 函数创建任务。`createFromOptions` 函数接受配置选项,包括运行模式、显示名称区域设置、结果最大数量、置信度阈值,以及类别白名单或黑名单。关于配置选项的更多信息,请参阅[配置总览](#configuration_options)。

音频分类器任务支持以下输入数据类型:音频片段和音频数据流。在创建任务时,你需要指定与输入数据类型相对应的运行模式。选择与你的输入数据类型对应的标签页,查看如何创建任务并运行推理。

### 音频片段 (Audio clips)

```
AudioClassifierOptions options =
    AudioClassifierOptions.builder()
        .setBaseOptions(
            BaseOptions.builder().setModelAssetPath("model.tflite").build())
        .setRunningMode(RunningMode.AUDIO_CLIPS)
        .setMaxResults(5)
        .build();
audioClassifier = AudioClassifier.createFromOptions(context, options);
```

### 音频数据流 (Audio stream)

```
AudioClassifierOptions options =
    AudioClassifierOptions.builder()
        .setBaseOptions(
            BaseOptions.builder().setModelAssetPath("model.tflite").build())
        .setRunningMode(RunningMode.AUDIO_STREAM)
        .setMaxResults(5)
        .setResultListener(audioClassifierResult -> {
             // 在此处处理分类结果。
        })
        .build();
audioClassifier = AudioClassifier.createFromOptions(context, options);
```

音频分类器示例代码的实现允许用户在处理模式之间切换。这种方法使任务创建代码更为复杂,可能不适合你的用例。你可以在 [`AudioClassifierHelper`](https://github.com/googlesamples/mediapipe/blob/2b9de6135a098e81b7153377b70dda2570e30c62/examples/audio_classifier/android/app/src/main/java/com/google/mediapipe/examples/audioclassifier/AudioClassifierHelper.kt) 的 `initClassifier()` 函数中查看模式切换代码。

### 配置选项 (Configuration options)

此任务为 Android 应用提供以下配置选项:

| 选项名称 (Option Name) | 描述 (Description) | 取值范围 (Value Range) | 默认值 (Default Value) |
|---|---|---|---|
| `runningMode` | 设置任务的运行模式。音频分类器有两种模式:<br><br>AUDIO_CLIPS:在独立音频片段上运行音频任务的模式。<br><br>AUDIO_STREAM:在音频数据流(如来自麦克风)上运行音频任务的模式。在此模式下,必须调用 resultListener 来设置监听器,以异步接收分类结果。 | {`AUDIO_CLIPS, AUDIO_STREAM`} | `AUDIO_CLIPS` |
| `displayNamesLocale` | 设置用于显示名称的标签语言(取自任务模型元数据,如果可用)。默认为 `en`(英语)。你可以使用 [TensorFlow Lite Metadata Writer API](https://ai.google.dev/edge/lite/models/metadata_writer_tutorial#audio_classifiers) 为自定义模型的元数据添加本地化标签。 | 区域设置代码 (Locale code) | en |
| `maxResults` | 设置要返回的得分最高的分类结果的可选最大数量。如果 < 0,将返回所有可用结果。 | 任意正数 | `-1` |
| `scoreThreshold` | 设置预测分数阈值,用于覆盖模型元数据中提供的阈值(如果有)。低于此值的结果将被拒绝。 | [0.0, 1.0] | 未设置 |
| `categoryAllowlist` | 设置可选的白名单类别名称列表。若非空,分类结果中类别名称不在此集合内的将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `categoryDenylist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |
| `categoryDenylist` | 设置可选的黑名单类别名称列表。若非空,分类结果中类别名称在此集合内的将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `categoryAllowlist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 |
| `resultListener` | 设置在音频分类器处于音频数据流模式时异步接收分类结果的结果监听器。只能在运行模式设置为 `AUDIO_STREAM` 时使用。 | 不适用 | 未设置 |
| `errorListener` | 设置可选的错误监听器。 | 不适用 | 未设置 |

## 准备数据 (Prepare data)

音频分类器适用于音频片段和音频数据流。该任务会处理数据输入的预处理,包括重采样、缓冲和分帧。但是,你必须在将输入音频数据传递给音频分类器任务之前,将其转换为 `com.google.mediapipe.tasks.components.containers.AudioData` 对象。

### 音频片段 (Audio clips)

```
import com.google.mediapipe.tasks.components.containers.AudioData;

// Load an audio on the user’s device as a float array.

// Convert a float array to a MediaPipe’s AudioData object.
AudioData audioData =
    AudioData.create(
        AudioData.AudioDataFormat.builder()
            .setNumOfChannels(numOfChannels)
            .setSampleRate(sampleRate)
            .build(),
        floatData.length);
audioData.load(floatData);
```

### 音频数据流 (Audio stream)

```
import android.media.AudioRecord;
import com.google.mediapipe.tasks.components.containers.AudioData;

AudioRecord audioRecord =
    audioClassifier.createAudioRecord(/* numChannels= */ 1, /* sampleRate= */ 16000);
audioRecord.startRecording();

...

// 从 AudioRecord 对象获取一秒钟的片段:
AudioData audioData =
    AudioData.create(
        16000 /*每秒样本数*/);
        AudioData.AudioDataFormat.create(audioRecord.getFormat()),
audioData.load(audioRecord)
```

## 运行任务 (Run the task)

你可以调用与运行模式相对应的 `classify` 函数来触发推理。音频分类器 API 返回输入音频数据中识别出的音频事件的潜在类别。

### 音频片段 (Audio clips)

```
AudioClassifierResult classifierResult = audioClassifier.classify(audioData);
```

### 音频数据流 (Audio stream)

```
// 对音频数据块运行推理。分类结果将通过创建音频分类器时
// 在 `AudioClassifierOptions` 中提供的 `resultListener` 获取。
audioClassifier.classifyAsync(audioBlock, timestampMs);
```

请注意以下几点:

- 在音频数据流模式下运行时,你还必须向音频分类器任务提供一个时间戳,以跟踪数据流中哪些音频数据被用于推理。
- 在音频片段模式下运行时,音频分类器任务会阻塞当前线程,直到处理完输入音频。为避免阻塞用户界面响应,请在后台线程中执行处理。

你可以在[代码示例](https://github.com/googlesamples/mediapipe/blob/main/examples/audio_classifier/android/app/src/main/java/com/google/mediapipe/examples/audioclassifier/AudioClassifierHelper.kt)的 `AudioClassifierHelper` 类中查看使用音频片段运行音频分类器的示例。

## 处理并显示结果 (Handle and display results)

运行推理后,音频分类器任务会返回输入音频中音频事件的潜在类别列表。以下列表展示了此任务的输出数据示例:

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

在 Android 应用中,任务返回一个 `ClassificationResult`,其中包含 `AudioClassifierResult` 对象列表,表示对音频事件的预测,包括类别标签和置信度分数。

### 音频片段 (Audio clips)

```
// 在音频片段模式下,分类结果是针对整个音频片段的。
// 结果是以时间戳标记的 AudioClassifierResult 对象,每个对象
// 对整个音频片段中从
// ClassificationResult.timestampMs().get() 开始的区间进行分类。

for (ClassificationResult result : audioClassifierResult.classificationResults()) {
  // 音频区间开始时间戳:
  result.timestampMs().get();
  // 该音频区间的分类结果。
  result.classifications();
}
```

### 音频数据流 (Audio stream)

```
// 在音频数据流模式下,分类结果列表只包含一个元素,
// 表示对音频数据流中从 ClassificationResult.timestampMs 开始的
// 音频数据块的分类结果。

ClassificationResult result = audioClassifierResult.classificationResults().get(0);
// 音频数据块开始时间戳
audioClassifierResult.timestampMs();
// 或者,也可以从
// result.timestampMs().get() 获取相同的时间戳。

// 分类结果。
result.classifications();
```

你可以在[代码示例](https://github.com/googlesamples/mediapipe/blob/main/examples/audio_classifier/android/app/src/main/java/com/google/mediapipe/examples/audioclassifier/fragment/ProbabilitiesAdapter.kt)的 `ProbabilitiesAdapter` 类中查看如何显示此任务返回的分类结果。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*