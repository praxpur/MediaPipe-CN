---
title: "定制物体检测器 (Customize object detector)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/customization/object_detector"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-06-05 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 定制物体检测器 (Customize object detector)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/customization/object_detector)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

你可以使用 MediaPipe Model Maker 定制用于物体检测任务的模型。这让你能够使用自己的训练数据调整预训练模型。

[![在 Colab 中打开](../../../../assets/edge/mediapipe/solutions/customization/colab-logo-32px_1920.png) 在 Colab 中打开](https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/customization/object_detector.ipynb)
[![在 GitHub 上查看](../../../../assets/edge/mediapipe/solutions/customization/github-logo-32px_1920.png) 在 GitHub 上查看](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/customization/object_detector.ipynb)

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*