---
title: "Android 环境配置指南 (Setup Guide for Android)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/setup_android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Android 环境配置指南 (Setup Guide for Android)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/setup_android)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

本页介绍如何配置开发环境,以便在你的 Android 应用程序中使用 MediaPipe Tasks。

## 受支持的设备和平台

要使用 MediaPipe Tasks 创建 Android 应用程序,你的开发环境需要满足以下条件:

-   [Android Studio](https://developer.android.com/studio/index.html),建议版本至少为 2021.1.1(Bumblebee),或其他兼容的 IDE。
-   Android SDK 版本 24 或更高
-   满足最低 SDK 版本的 Android 设备。Android 模拟器可能不适用于所有任务。

## 开发者环境配置

在 Android 应用程序上运行 MediaPipe 任务之前,你必须在本机上有现有应用,或创建一个新的 Android Studio 项目。MediaPipe 适配你应用中的[数据层](https://developer.android.com/topic/architecture/data-layer),该层包含应用数据和业务逻辑。有关 Android 应用架构的更多信息,请参阅[应用架构指南](https://developer.android.com/topic/architecture)。

## Android 设备配置

在物理 Android 设备上测试应用之前,你必须在该设备上启用开发者选项和 USB 调试。有关配置设备开发者选项的说明,请参阅[配置设备端开发者选项](https://developer.android.com/studio/debug/dev-options)。

对于不需要设备摄像头或麦克风的任务,你可以使用 Android 设备模拟器来代替物理 Android 设备。有关设置 Android 模拟器的说明,请参阅[在 Android 模拟器上运行应用](https://developer.android.com/studio/run/emulator)。

## 示例代码配置

[MediaPipe Examples](https://github.com/googlesamples/mediapipe/tree/main/examples) 代码库包含每个 MediaPipe 任务的示例 Android 应用程序。你可以基于示例代码创建项目、构建项目并运行它。

要导入并构建示例代码项目:

1.  启动 [Android Studio](https://developer.android.com/studio)。
2.  在 Android Studio 中,选择**文件 > 新建 > 导入项目**。
3.  导航到包含 `build.gradle` 文件的示例代码目录并选择该目录,例如:`.../mediapipe/examples/text_classification/android/build.gradle`。
4.  如果 Android Studio 请求 Gradle 同步,请选择**确定**。
5.  确保你的 Android 设备已连接到计算机且已启用开发者模式。点击绿色的 `Run` 箭头。

如果你选择了正确的目录,Android Studio 会创建一个新项目并构建它。此过程可能需要几分钟,具体取决于计算机的速度以及你是否将 Android Studio 用于其他项目。构建完成后,Android Studio 会在**构建输出**状态面板中显示 `BUILD SUCCESSFUL` 消息。

要运行项目:

1.  在 Android Studio 中,选择**运行 > 运行…** 来运行项目。
2.  选择已连接的 Android 设备(或模拟器)来测试应用。

## MediaPipe Tasks 依赖项

MediaPipe Tasks 提供三个预构建库,分别用于视觉、文本和音频。`.tflite` 模型文件必须位于使用该模型的 Android 模块的 assets 目录中。根据应用使用的 MediaPipe Task,在 `build.gradle` 文件的依赖项列表中添加视觉、文本或音频库。

### 生成式 AI 任务

MediaPipe Tasks 生成式 AI 库包含处理图像或文本生成的任务。要在 Android Studio 中导入 MediaPipe Tasks 生成式 AI 库,请将依赖项添加到 `build.gradle` 文件中。

#### 图像生成器 (Image Generator)

MediaPipe 图像生成器任务包含在 `tasks-vision-image-generator` 库中。将依赖项添加到 `build.gradle` 文件:

```
dependencies {
    implementation 'com.google.mediapipe:tasks-vision-image-generator:latest.release'
}
```

#### LLM 推理 API

MediaPipe LLM 推理任务包含在 `tasks-genai` 库中。将依赖项添加到 `build.gradle` 文件:

```
dependencies {
    implementation 'com.google.mediapipe:tasks-genai:latest.release'
}
```

### 视觉任务

MediaPipe Tasks 视觉库包含处理图像或视频输入的任务。要在 Android Studio 中导入 MediaPipe Tasks 视觉库,请将以下依赖项添加到 `build.gradle` 文件:

```
dependencies {
    implementation 'com.google.mediapipe:tasks-vision:latest.release'
}
```

### 文本任务

MediaPipe Tasks 文本库包含处理文本格式语言数据的任务。要在 Android Studio 中导入 MediaPipe Tasks 文本库,请将以下依赖项添加到 `build.gradle` 文件:

```
dependencies {
    implementation 'com.google.mediapipe:tasks-text:latest.release'
}
```

### 音频任务

MediaPipe Tasks 音频库包含处理声音输入的任务。要在 Android Studio 中导入 MediaPipe Tasks 音频库,请将以下依赖项添加到 `build.gradle` 文件:

```
dependencies {
    implementation 'com.google.mediapipe:tasks-audio:latest.release'
}
```

## BaseOptions 配置

`BaseOptions` 允许对 MediaPipe Task API 进行常规配置。

| 选项名称 | 描述 | 可接受值 |
|---|---|---|
| `modelAssetBuffer` | 模型资源文件内容,类型为直接的 `ByteBuffer` 或 `MappedByteBuffer`。 | `ByteBuffer` 或 `MappedByteBuffer`(以字符串形式) |
| `modelAssetPath` | Android 应用 assets 文件夹中模型资源文件的模型路径。 | 文件路径(以字符串形式) |
| `modelAssetFileDescriptor` | 模型资源文件的本地文件描述符整数。 | 指定文件描述符的整数 |
| `Delegate` | 通过设备委托启用硬件加速来运行 MediaPipe 流水线。默认值:`CPU`。 | \[`CPU`, `GPU`\] |

## 硬件加速

MediaPipe Tasks 支持使用图形处理单元(GPU)来运行机器学习模型。在 Android 设备上,你可以通过使用委托来启用模型的 GPU 加速执行。委托充当 MediaPipe 的硬件驱动程序,使你可以在 GPU 处理器而不是标准 CPU 处理器上运行模型。

在任务选项中通过 `BaseOptions` 配置 GPU 委托:

```
BaseOptions baseOptions = BaseOptions.builder().useGpu().build();
```

## 故障排除

如需与 MediaPipe 相关的技术问题帮助,请访问[讨论组](https://groups.google.com/forum/#!forum/mediapipe)或 [Stack Overflow](https://stackoverflow.com/questions/tagged/mediapipe) 获取社区支持。要报告错误或提出功能请求,请[在 GitHub 上提交问题](https://github.com/google/mediapipe/issues)。

如需配置 Android 开发环境的帮助,请访问 [Android 开发者文档](https://developer.android.com/guide)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*