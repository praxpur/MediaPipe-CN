---
title: "MediaPipe Tasks(任务 API)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/tasks"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-09-28 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# MediaPipe Tasks(任务 API)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/tasks)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Tasks 提供 MediaPipe Solutions 套件的核心编程接口,包含一组库,只需极少量代码即可将创新的机器学习(ML)解决方案部署到设备上。它支持多种平台,包括 Android、Web / JavaScript、Python 和 iOS。

**易于使用、定义良好的跨平台 API**
只需 5 行代码即可运行 ML 推理。使用 MediaPipe Tasks 中强大且易于使用的解决方案 API 作为构建模块,构建你自己的 ML 功能。

**可定制的解决方案**
你可以充分利用 MediaPipe Tasks 提供的所有优势,并使用通过 [Model Maker](model_maker.md) 以你自己的数据构建的模型轻松进行定制。例如,你可以使用 [Model Maker GestureRecognizer API](vision/gesture_recognizer/customize.md) 创建能识别你自定义手势的模型,并使用 [Tasks GestureRecognizer API](vision/gesture_recognizer.md) 将模型部署到目标平台。

**高性能 ML 流水线**
典型的端侧(设备端)ML 解决方案会组合多个 ML 和非 ML 模块,从而拖慢性能。MediaPipe Tasks 提供经过优化的 ML 流水线,在 CPU、GPU 和 TPU 上实现端到端加速,以满足实时端侧用例的需求。

## 支持的平台

本节概述每个受支持平台上 MediaPipe Tasks 的情况。有关具体实现,请参阅每个任务的平台专属开发[指南](vision/object_detector/android.md)。要获取在某个平台上设置开发环境以使用 MediaPipe Tasks 的帮助,请查看平台[环境配置指南](setup_android.md)。

### Android

Android 上的 MediaPipe Tasks [Java API](https://developers.google.com/edge/api/mediapipe/java/com/google/mediapipe/framework/image/package-summary) 分为多个包,用于在视觉、自然语言和音频等主要领域执行 ML 任务。以下是你可以在 Android 应用开发项目中添加以启用这些 API 的依赖项列表:

```
dependencies {
    implementation 'com.google.mediapipe:tasks-vision:latest.release'
    implementation 'com.google.mediapipe:tasks-text:latest.release'
    implementation 'com.google.mediapipe:tasks-audio:latest.release'
}
```

如需具体实现细节,请参阅 MediaPipe Tasks 中每个解决方案的平台专属开发[指南](vision/object_detector/android.md)。

### Python

MediaPipe Tasks [Python API](https://developers.google.com/edge/api/mediapipe/python/mp) 包含几个主要模块,用于在视觉、自然语言和音频等主要领域执行 ML 任务的解决方案。以下展示安装命令以及你可以添加到 Python 开发项目以启用这些 API 的导入列表:

```
$ python -m pip install mediapipe

import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from mediapipe.tasks.python import text
from mediapipe.tasks.python import audio
```

如需具体实现细节,请参阅 MediaPipe Tasks 中每个解决方案的平台专属开发[指南](vision/object_detector/python.md)。

### Web 与 JavaScript

MediaPipe Tasks [Web JavaScript API](https://developers.google.com/edge/api/mediapipe/js/tasks-vision) 分为多个包,用于在视觉、自然语言和音频等主要领域执行 ML 任务。以下是你可以在 Web 和 JavaScript 开发项目中添加以启用这些 API 的脚本导入列表:

```
<head>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs"
    crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-text/text_bundle.js"
    crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-audio/audio_bundle.js"
    crossorigin="anonymous"></script>
</head>
```

如需具体实现细节,请参阅 MediaPipe Tasks 中每个解决方案的平台专属开发[指南](vision/object_detector/web_js.md)。

### MediaPipe Tasks 隐私声明

最后修改日期:2026 年 6 月 5 日

当你使用 MediaPipe Tasks 时,输入数据(如图像、视频、文本)的处理在设备端进行,MediaPipe 不会将这些输入数据发送到 Google 服务器。因此,你可以使用我们的 MediaPipe Tasks API 处理不应离开设备的数据。

MediaPipe Tasks API 会将应用内 API 的性能和使用情况指标发送给 Google。Google 使用这些指标数据来衡量性能、使用情况,并对 MediaPipe Tasks 进行调试、维护和改进,详见我们的[隐私政策](https://policies.google.com/privacy)。

**你有责任根据适用法律,获得应用用户对 Google 处理 MediaPipe 指标数据的知情同意。**

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*