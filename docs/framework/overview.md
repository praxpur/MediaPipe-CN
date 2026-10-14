---
title: "MediaPipe Framework(框架)"
original_url: "https://developers.google.com/edge/mediapipe/framework"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-05-28 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# MediaPipe Framework(框架)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/framework)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

> **注意:** 如果你只是想简单地把端侧机器学习解决方案集成到应用中,请使用 [MediaPipe Solutions](../../solutions/guide.md) 提供的预制解决方案。

MediaPipe Framework(框架)是用于构建高效端侧机器学习流水线的底层组件,功能与预制的 [MediaPipe Solutions](../../solutions/guide.md) 类似。

要开始使用 MediaPipe Framework,请先[安装 MediaPipe Framework](getting_started/install.md),并使用 C++、Android 和 iOS 构建示例应用。使用 MediaPipe Framework 之前,请先熟悉以下关键的[框架概念](framework_concepts/overview.md):

-   [数据包(Packets)](framework_concepts/packets.md)
-   [计算图(Graphs)](framework_concepts/graphs.md)
-   [计算器(Calculators)](framework_concepts/calculators.md)

源代码托管在 [MediaPipe GitHub 仓库](https://github.com/google/mediapipe) 中,你可以使用 [Google Open Source Code Search](https://cs.opensource.google/mediapipe/mediapipe) 进行代码搜索。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*