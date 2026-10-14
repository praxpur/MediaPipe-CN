---
title: "iOS 版音频分类指南 (Audio Classification Guide for iOS)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/audio/audio_classifier/ios"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-08 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# iOS 版音频分类指南 (Audio Classification Guide for iOS)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/audio/audio_classifier/ios)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe 音频分类器(Audio Classifier)任务允许你对音频数据执行分类。你可以使用此任务从一组已训练的类别中识别声音事件。以下说明介绍如何在 iOS 应用中使用音频分类器。这些说明中描述的代码示例可在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/audio_classifier/ios) 上获取。

关于此任务的功能、模型和配置选项的更多信息,请参阅[总览](../audio_classifier.md)。

## 代码示例 (Code example)

MediaPipe Tasks 示例代码是一个适用于 iOS 的音频分类器应用的基本实现。该示例使用实体 iOS 设备上的麦克风持续对声音进行分类,也可以对存储在设备上的声音文件运行分类器。

你可以将该应用作为自己 iOS 应用的起点,也可以在修改现有应用时参考它。你可以在 [GitHub](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/audio_classifier/ios) 上查看音频分类器示例代码。

### 下载代码 (Download the code)

以下说明介绍如何使用 [git](https://git-scm.com) 命令行工具创建示例代码的本地副本。

下载示例代码:

1. 使用以下命令克隆 git 仓库:

   ```
   git clone https://github.com/google-ai-edge/mediapipe-samples
   ```
2. 可选:配置你的 git 实例使用稀疏检出(sparse checkout),这样你只保留音频分类器示例应用所需的文件:

   ```
   cd mediapipe-samples
   git sparse-checkout init --cone
   git sparse-checkout set examples/audio_classifier/ios/
   ```

创建示例代码的本地版本后,你可以在 Xcode 中打开项目并运行该应用。相关说明请参阅 [iOS 环境配置指南](../../setup_ios.md)。

### 关键组件 (Key components)

以下文件包含此音频分类器示例应用的关键代码:

- [AudioClassifierHelper.swift](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/audio_classifier/ios/AudioClassifier/AudioClassifierHelper.swift):
  初始化音频分类器,并处理模型选择。
- [ViewController.swift](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/audio_classifier/ios/AudioClassifier/ViewController.swift):
  实现用户界面并格式化结果。

## 环境配置 (Setup)

本节介绍专门用于使用音频分类器的开发环境与代码项目配置的关键步骤。关于使用 MediaPipe 任务(包括平台版本要求)配置开发环境的一般信息,请参阅 [iOS 环境配置指南](../../setup_ios.md)。

### 依赖项 (Dependencies)

音频分类器使用 `MediaPipeTasksAudio` 库,该库可以通过 [Swift Package Manager](https://github.com/swiftlang/swift-package-manager)(SPM)安装。该库同时兼容 Swift 和 Objective-C 应用,无需任何额外的语言特定配置。

要将 `MediaPipeTasksAudio` 库添加到你的 Xcode 项目中:

1. 在 Xcode 中打开你的项目,选择 **File > Add Package Dependencies...**。
2. 在右上角的搜索框中输入仓库 URL:`https://github.com/google-ai-edge/mediapipe`。
3. 选择 `mediapipe` 包,并选择你的依赖规则(例如 `master` 分支)。
4. 点击 **Add Package**,然后选择 `MediaPipeTasksAudio` 并将其添加到你的应用目标。

如果你使用 `Package.swift` 文件,请使用以下代码添加 MediaPipe 包和 `MediaPipeTasksAudio` 目标依赖:

```
dependencies: [
    .package(
        url: "https://github.com/google-ai-edge/mediapipe",
        branch: "master"
    ),
],
targets: [
    .target(
        name: "MyAudioClassifierApp",
        dependencies: [
            .product(name: "MediaPipeTasksAudio", package: "mediapipe"),
        ]
    ),
]
```

关于配置依赖的更多信息,请参阅 [iOS 环境配置指南](../../setup_ios.md)。

> **注意:** 以下各节提供 Swift 和 Objective-C 两种语言的代码示例。在适用的情况下,说明中会引用 Swift 的方法名。

### 模型 (Model)

MediaPipe 音频分类器任务需要与此任务兼容的已训练模型。关于音频分类器可用已训练模型的更多信息,请参阅任务总览中的[模型小节](../audio_classifier.md#models)。

选择并下载模型,然后使用 Xcode 将其添加到你的项目目录中。关于如何向 Xcode 项目添加文件的说明,请参阅 [Managing files and folders in your Xcode project](https://developer.apple.com/documentation/xcode/managing-files-and-folders-in-your-xcode-project)(管理 Xcode 项目中的文件与文件夹)。

使用 `BaseOptions.modelAssetPath` 属性指定应用包内模型的路径。有关代码示例,请参阅下一节。

## 创建任务 (Create the task)

你可以通过调用音频分类器的某个初始化方法(initializer)来创建它。`AudioClassifier(options:)` 初始化方法会为配置选项设置值。

如果不需要使用自定义配置选项初始化的音频分类器,你可以使用 `AudioClassifier(modelPath:)` 初始化方法以默认选项创建音频分类器。关于配置选项的更多信息,请参阅[配置总览](#configuration)。

音频分类器任务支持两种运行模式:音频片段(audio clips)和音频流(audio streams)。你需要在创建任务时指定与输入数据类型对应的运行模式。

选择与你所用语言和运行模式对应的标签页,查看如何创建任务并运行推理。

### Swift

### 音频片段 (Audio clips)

```
import MediaPipeTasksAudio

let modelPath = Bundle.main.path(forResource: "yamnet",
                                      ofType: "tflite")

let options = AudioClassifierOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .audioClips
options.maxResults = 5

let audioClassifier = try AudioClassifier(options: options)
```

### 音频流 (Audio stream)

```
import MediaPipeTasksAudio

let modelPath = Bundle.main.path(forResource: "yamnet",
                                      ofType: "tflite")

let options = AudioClassifierOptions()
options.baseOptions.modelAssetPath = modelPath
options.runningMode = .audioStream
options.maxResults = 5
options.audioClassifierStreamDelegate = self

let audioClassifier = try AudioClassifier(options: options)

// 定义委托类或扩展
extension ViewController: AudioClassifierStreamDelegate {
  func audioClassifier(
    _ audioClassifier: AudioClassifier,
    didFinishClassification result: AudioClassifierResult?,
    timestampInMilliseconds: Int,
    error: Error?
  ) {
    // 在此处理分类结果
  }
}
```

### Objective-C

### 音频片段 (Audio clips)

```
@import MediaPipeTasksAudio;

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"yamnet"
                                                      ofType:@"tflite"];

MPPAudioClassifierOptions *options = [[MPPAudioClassifierOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPAudioRunningModeAudioClips;
options.maxResults = 5;

MPPAudioClassifier *audioClassifier =
      [[MPPAudioClassifier alloc] initWithOptions:options error:nil];
```

### 音频流 (Audio stream)

```
@import MediaPipeTasksAudio;

NSString *modelPath = [[NSBundle mainBundle] pathForResource:@"yamnet"
                                                      ofType:@"tflite"];

MPPAudioClassifierOptions *options = [[MPPAudioClassifierOptions alloc] init];
options.baseOptions.modelAssetPath = modelPath;
options.runningMode = MPPAudioRunningModeAudioStream;
options.maxResults = 5;
options.audioClassifierStreamDelegate = self;

MPPAudioClassifier *audioClassifier =
      [[MPPAudioClassifier alloc] initWithOptions:options error:nil];

// 在接口或类别中遵循 MPPAudioClassifierStreamDelegate
- (void)audioClassifier:(MPPAudioClassifier *)audioClassifier
    didFinishClassificationWithResult:(nullable MPPAudioClassifierResult *)result
              timestampInMilliseconds:(NSInteger)timestampInMilliseconds
                                error:(nullable NSError *)error {
  // 在此处理分类结果
}
```

### 配置选项 (Configuration options)

此任务在 iOS 应用中有以下配置选项:

| 选项名 (Option Name) | 说明 (Description) | 值范围 (Value Range) | 默认值 (Default Value) |
| --- | --- | --- | --- |
| `runningMode` | 设置任务的运行模式。音频分类器有两种模式: AUDIO\_CLIPS:在独立音频片段上运行音频任务的模式。 AUDIO\_STREAM:在音频流上运行音频任务的模式,例如来自麦克风的输入。在此模式下,必须调用 resultListener 来设置监听器,以便异步接收分类结果。 | {`AUDIO_CLIPS, AUDIO_STREAM`} | `AUDIO_CLIPS` |
| `displayNamesLocale` | 设置任务模型元数据中提供的显示名称标签所使用的语言(如有)。默认为 `en`(英语)。你可以使用 [TensorFlow Lite Metadata Writer API](https://ai.google.dev/edge/lite/models/metadata_writer_tutorial#audio_classifiers) 向自定义模型的元数据添加本地化标签。 | 区域代码 (Locale code) | en |
| `maxResults` | 设置要返回的分类结果的最大数量(可选)。如果 < 0,将返回所有可用结果。 | 任意正数 | `-1` |
| `scoreThreshold` | 设置预测分数阈值,覆盖模型元数据中提供的阈值(如有)。低于此值的结果将被拒绝。 | [0.0, 1.0] | 未设置 (Not set) |
| `categoryAllowlist` | 设置允许的类别名称列表(可选)。如果非空,类别名称不在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `categoryDenylist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 (Not set) |
| `categoryDenylist` | 设置不允许的类别名称列表(可选)。如果非空,类别名称在此集合中的分类结果将被过滤掉。重复或未知的类别名称将被忽略。此选项与 `categoryAllowlist` 互斥,同时使用两者会导致错误。 | 任意字符串 | 未设置 (Not set) |
| `audioClassifierStreamDelegate` | 设置结果监听器,以便在音频分类器处于音频流模式时异步接收分类结果。仅在运行模式设置为 `AUDIO_STREAM` 时可用。 | 不适用 (N/A) | 未设置 (Not set) |

## 准备数据 (Prepare data)

音频分类器支持音频片段和音频流。任务会处理数据输入的预处理,包括重采样(resampling)、缓冲(buffering)和分帧(framing)。但是,你必须先将输入音频数据转换为 `AudioData` 对象,再将其传递给音频分类器任务。

### Swift

### 音频片段 (Audio clips)

```
import MediaPipeTasksAudio

// 创建 AudioDataFormat
let format = AudioDataFormat(channelCount: 1, sampleRate: 16000)

// 使用格式和采样数创建 AudioData
let audioData = AudioData(format: format, sampleCount: floatArray.count)

// 将浮点数组转换为 FloatBuffer
let floatBuffer = FloatBuffer(data: floatArray, length: floatArray.count)

// 将浮点缓冲区加载到 AudioData
try audioData.load(buffer: floatBuffer, offset: 0, length: floatArray.count)
```

### 音频流 (Audio stream)

```
import MediaPipeTasksAudio

// 创建 AudioRecord 实例
let audioRecord = try AudioClassifier.createAudioRecord(
  channelCount: 1,
  sampleRate: 16000,
  bufferLength: 8000
)

// 获取权限并开始录音
try audioRecord.startRecording()

...

// 从麦克风加载音频样本:
let format = AudioDataFormat(channelCount: 1, sampleRate: 16000)
let audioData = AudioData(format: format, sampleCount: 16000)
try audioData.load(audioRecord: audioRecord)
```

### Objective-C

### 音频片段 (Audio clips)

```
@import MediaPipeTasksAudio;

// 创建 MPPAudioDataFormat
MPPAudioDataFormat *format = [[MPPAudioDataFormat alloc] initWithChannelCount:1 sampleRate:16000];

// 使用格式和采样数创建 MPPAudioData
MPPAudioData *audioData = [[MPPAudioData alloc] initWithFormat:format sampleCount:length];

// 将浮点数组转换为 MPPFloatBuffer
MPPFloatBuffer *floatBuffer = [[MPPFloatBuffer alloc] initWithData:floatData length:length];

// 将浮点缓冲区加载到 MPPAudioData
[audioData loadBuffer:floatBuffer offset:0 length:length error:nil];
```

### 音频流 (Audio stream)

```
@import MediaPipeTasksAudio;

NSError *error = nil;

// 创建 MPPAudioRecord 实例
MPPAudioRecord *audioRecord = [MPPAudioClassifier createAudioRecordWithChannelCount:1
                                                                         sampleRate:16000
                                                                       bufferLength:8000
                                                                              error:&error];

// 开始录音
[audioRecord startRecordingWithError:&error];

...

// 从麦克风加载音频样本:
MPPAudioDataFormat *format = [[MPPAudioDataFormat alloc] initWithChannelCount:1 sampleRate:16000];
MPPAudioData *audioData = [[MPPAudioData alloc] initWithFormat:format sampleCount:16000];
[audioData loadAudioRecord:audioRecord error:&error];
```

## 运行任务 (Run the task)

要运行音频分类器,请根据你的运行模式调用相应的 classify 函数。

### Swift

### 音频片段 (Audio clips)

```
let result = try audioClassifier.classify(audioClip: audioData)
```

### 音频流 (Audio stream)

```
// 异步运行分类。结果通过
// `audioClassifierStreamDelegate` 回调传递。
try audioClassifier.classifyAsync(
  audioBlock: audioData,
  timestampInMilliseconds: timestampMs
)
```

### Objective-C

### 音频片段 (Audio clips)

```
MPPAudioClassifierResult *result = [audioClassifier classifyAudioClip:audioData
                                                                error:nil];
```

### 音频流 (Audio stream)

```
// 异步运行分类。结果通过
// `audioClassifierStreamDelegate` 回调传递。
[audioClassifier classifyAsyncAudioBlock:audioData
                 timestampInMilliseconds:timestampMs
                                   error:nil];
```

> **注意:** 在 `.audioClips` 模式下运行时,任务会阻塞当前线程,直到推理完成。在 `.audioStream` 模式下运行时,任务会立即返回,不会阻塞当前线程。

## 处理并显示结果 (Handle and display results)

运行推理后,音频分类器任务会返回一个 `AudioClassifierResult` 对象,其中包含所预测声音类别的列表。

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

示例代码中的 [ViewController.swift](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/audio_classifier/ios/AudioClassifier/ViewController.swift) 文件演示了如何显示任务返回的分类结果。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*