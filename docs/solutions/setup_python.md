---
title: "Python 环境配置指南 (Setup Guide for Python)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/setup_python"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Python 环境配置指南 (Setup Guide for Python)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/setup_python)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

本页介绍如何配置开发环境,以便在你的 Python 应用程序中使用 MediaPipe Tasks。

## 受支持的平台和版本

使用 MediaPipe Tasks 构建应用程序需要以下开发环境资源:

-   操作系统:
    -   桌面端:Windows、Mac、Linux
    -   IoT:Raspberry OS 64 位
-   Python:支持 3.9 及更高版本
-   PIP:20.3 及以上版本

**注意:** 如果你正在测试或试验 MediaPipe 任务,建议使用 [Colaboratory](https://colab.research.google.com/),这是一个无需任何配置、完全在云端运行的 Python notebook 环境。

## 开发者环境配置

在 Python 应用中运行 MediaPipe 任务之前,请先安装 MediaPipe 包。

```
$ python -m pip install mediapipe
```

安装该包后,将其导入你的开发项目。

```
import mediapipe as mp
```

## MediaPipe Tasks 依赖项

MediaPipe Tasks 为视觉、文本、音频提供三个预构建库。根据应用所使用的 MediaPipe Task,将视觉、文本或音频库导入你的开发项目。

### 视觉任务

MediaPipe Tasks 的视觉模块包含处理图像或视频输入的任务。要导入 MediaPipe Tasks 视觉库,请将以下依赖项导入你的开发项目。

```
from mediapipe.tasks.python import vision
```

### 文本任务

MediaPipe Tasks 的文本模块包含处理字符串输入的任务。要导入 MediaPipe Tasks 文本库,请将以下依赖项导入你的开发项目。

```
from mediapipe.tasks.python import text
```

### 音频任务

MediaPipe Tasks 的音频模块包含处理声音输入的任务。要导入 MediaPipe Tasks 音频库,请将以下依赖项导入你的开发项目。

```
from mediapipe.tasks.python import audio
```

## BaseOptions 配置

BaseOptions 允许对 MediaPipe Task API 进行常规配置。

| 选项名称 | 说明 | 可接受的值 |
| --- | --- | --- |
| `model_asset_buffer` | 模型资源文件的内容。 | 以字节字符串形式表示的模型内容 |
| `model_asset_path` | 要打开并映射到内存中的模型资源路径。 | 字符串形式的文件路径 |

## 使用 PyInstaller 打包 Python Tasks 应用

使用 PyInstaller 打包 Python Tasks 应用时,`.task` 等模型文件不会自动包含。如果你的应用使用 `BaseOptions(model_asset_path=...)`,请将模型文件包含在 PyInstaller bundle 中,并在运行时解析其路径。

例如,使用一个会检查 PyInstaller 的 `sys._MEIPASS` 目录的辅助函数:

```
import os
import sys

def resource_path(relative_path: str) -> str:
    base_path = getattr(sys, "_MEIPASS", os.path.abspath("."))
    return os.path.join(base_path, relative_path)
```

然后将解析后的模型路径传给 `BaseOptions`:

```
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

model_path = resource_path("pose_landmarker.task")
base_options = python.BaseOptions(model_asset_path=model_path)
options = vision.PoseLandmarkerOptions(base_options=base_options)
pose_landmarker = vision.PoseLandmarker.create_from_options(options)
```

使用 PyInstaller 构建时,请打包模型文件并收集 MediaPipe 包文件:

```
pyinstaller app.py \
  --add-data "pose_landmarker.task:." \
  --collect-all mediapipe \
  --hidden-import mediapipe.tasks.c
```

在 macOS 或 Linux 上,`--add-data` 的分隔符是 `:`。在 Windows 上,请使用 `;`。对于 macOS 桌面应用,请添加 `--windowed` 以创建 `.app` bundle:

## 问题排查

如需有关 MediaPipe 技术问题的帮助,请访问[讨论组](https://groups.google.com/forum/#!forum/mediapipe)或 [Stack Overflow](https://stackoverflow.com/questions/tagged/mediapipe),获取社区支持。要报告 bug 或提出功能请求,请在 [GitHub 上提交 issue](https://github.com/google/mediapipe/issues)。

如需有关配置 Python 开发环境的帮助,请访问 [Python 开发者指南](https://devguide.python.org/)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*