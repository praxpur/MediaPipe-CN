---
title: "Web 环境配置指南 (Setup Guide for Web)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/setup_web"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-17 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Web 环境配置指南 (Setup Guide for Web)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/setup_web)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

本页介绍如何配置开发环境,以便在你的 JavaScript Web 应用程序中使用 MediaPipe Tasks。

## 受支持的平台和版本

要使用 MediaPipe Tasks 创建 Web 应用程序,你的开发环境需要满足以下条件:

-   Chrome 或 Safari 浏览器
-   使用 Node.js 和 NPM 的 Web 应用程序。或者,你可以使用 script 标签,通过内容分发网络(CDN)访问 MediaPipe Tasks。

## MediaPipe Tasks 依赖项

MediaPipe Tasks 为视觉、文本和音频提供三个预构建库。根据应用所使用的 MediaPipe Task,将视觉、文本或音频库导入你的开发项目。

### 生成式 AI (Generative AI) 任务

MediaPipe Tasks 的 Generative AI 模块包含处理图像或文本生成的任务。要导入 MediaPipe Tasks Generative AI 库,请将以下依赖项导入你的开发项目。

#### LLM 推理 API (LLM Inference API)

MediaPipe LLM 推理任务包含在 `tasks-genai` 库中。

```
npm install @mediapipe/tasks-genai
```

如果你想部署到服务器,可以使用内容分发网络(CDN)服务(如 [jsDelivr](https://www.jsdelivr.com/))将代码直接添加到你的 HTML 页面。

```
<head>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/genai_bundle.cjs"
    crossorigin="anonymous"></script>
</head>
```

### 视觉任务

MediaPipe Tasks 的视觉模块包含处理图像或视频输入的任务。要导入 MediaPipe Tasks 视觉库,请将以下依赖项导入你的开发项目。

```
npm install @mediapipe/tasks-vision
```

如果你想部署到服务器,可以使用内容分发网络(CDN)服务(如 [jsDelivr](https://www.jsdelivr.com/))将代码直接添加到你的 HTML 页面。

```
<head>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs"
    crossorigin="anonymous"></script>
</head>
```

### 文本任务

MediaPipe Tasks 的文本模块包含处理字符串输入的任务。要导入 MediaPipe Tasks 文本库,请将以下依赖项导入你的开发项目。

```
npm install @mediapipe/tasks-text
```

如果你想部署到服务器,可以使用内容分发网络(CDN)服务(如 [jsDelivr](https://www.jsdelivr.com/))将代码直接添加到你的 HTML 页面。

```
<head>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-text/text_bundle.js"
    crossorigin="anonymous"></script>
</head>
```

### 音频任务

MediaPipe Tasks 的音频模块包含处理声音输入的任务。要导入 MediaPipe Tasks 音频库,请将以下依赖项导入你的开发项目。

```
npm install @mediapipe/tasks-audio
```

如果你想部署到服务器,可以使用内容分发网络(CDN)服务(如 [jsDelivr](https://www.jsdelivr.com/))将代码直接添加到你的 HTML 页面。

```
<head>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-audio/audio_bundle.js"
    crossorigin="anonymous"></script>
</head>
```

## BaseOptions 配置

BaseOptions 允许对 MediaPipe Task API 进行常规配置。

| 选项名称 | 说明 | 可接受的值 |
| --- | --- | --- |
| `modelAssetBuffer` | 以 `Uint8Array` 类型数组表示的模型资源文件内容。 | `Uint8Array` |
| `modelAssetPath` | 要打开并映射到内存中的模型资源路径。 | `TrustedResourceUrl` |
| `Delegate` | 通过设备委托启用硬件加速来运行 MediaPipe 流水线。默认值:`CPU`。 | [`CPU`, `GPU`] |

## 问题排查

如需有关 MediaPipe 技术问题的帮助,请访问[讨论组](https://groups.google.com/forum/#!forum/mediapipe)或 [Stack Overflow](https://stackoverflow.com/questions/tagged/mediapipe),获取社区支持。要报告 bug 或提出功能请求,请在 [GitHub 上提交 issue](https://github.com/google/mediapipe/issues)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*