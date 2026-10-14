---
title: "整体关键点检测指南 (Holistic landmark detection guide)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/vision/holistic_landmarker"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-01 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 整体关键点检测指南 (Holistic landmark detection guide)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/vision/holistic_landmarker)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

![Holistic Landmarker 任务](../../../assets/edge/mediapipe/images/solutions/examples/pose_detector.png)

MediaPipe Holistic Landmarker(整体关键点检测器)任务让您组合面部、手部和姿态关键点检测器的组件,实时检测总共 553 个人体关键点。您可以使用此任务在连续的图像或视频流中分析全身手势、姿态和动作。

任务会输出归一化关键点、世界关键点、混合变形 (blendshape)(可选)和分割掩码(可选)的组合。

[立即试用!](https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/holistic_landmarker)

## 开始使用

通过为目标平台实施指南开始使用此任务:

| 平台 | 代码示例 | 指南 |
|---|---|---|
| Android | [代码示例](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/holistic_landmarker/android) | [指南](android.md) |
| iOS | [代码示例](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/holistic_landmarker/ios) | [指南](ios.md) |
| Python | [Colab](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/holistic_landmarker/python) | [指南](python.md) |
| Web | [代码示例](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/holistic-landmarker.ts) | [指南](web_js.md) |

## 任务详情

本节介绍此任务的功能、输入、输出和配置选项。

### 特性

-   **输入图像处理** — 处理包括图像旋转、调整大小、归一化和色彩空间转换。
-   **分数阈值** — 根据预测分数和置信度分数过滤结果。
-   **可选输出** — 可选输出面部混合变形和姿态分割掩码。

| 任务输入 | 任务输出 |
|---|---|
| Holistic Landmarker 接受以下数据类型之一作为输入:<br><br>- 静态图片<br>- 已解码的视频帧<br>- 实时视频流 | Holistic Landmarker 输出以下结果:<br><br>- 归一化图像坐标下的面部关键点(478 个关键点)<br>- 归一化图像坐标和 3D 世界坐标下的姿态关键点(33 个关键点)<br>- 归一化图像坐标和 3D 世界坐标下的左手关键点(21 个关键点)<br>- 归一化图像坐标和 3D 世界坐标下的右手关键点(21 个关键点)<br>- 可选:面部混合变形分数<br>- 可选:姿态区域的分割掩码 |

### 配置选项

此任务有以下配置选项:

| 选项名称 | 说明 | 取值范围 | 默认值 |
|---|---|---|---|
| `running_mode` | 设置任务的运行模式。共有三种模式:<br><br>IMAGE:用于单张图像输入的模式。<br><br>VIDEO:用于视频已解码帧的模式。<br><br>LIVE_STREAM:用于输入数据实时流(如来自摄像头)的模式。 | {`IMAGE, VIDEO, LIVE_STREAM`} | `IMAGE` |
| `min_face_detection_confidence` | 面部检测被视为成功所需的最低置信度分数。 | `Float [0.0, 1.0]` | `0.5` |
| `min_face_suppression_threshold` | 面部检测被视为重叠所需的最低非极大值抑制 (non-maximum-suppression) 阈值。 | `Float [0.0, 1.0]` | `0.3` |
| `min_face_presence_confidence` | 面部关键点检测中面部存在分数所需的最低置信度分数。 | `Float [0.0, 1.0]` | `0.5` |
| `min_pose_detection_confidence` | 姿态检测被视为成功所需的最低置信度分数。 | `Float [0.0, 1.0]` | `0.5` |
| `min_pose_suppression_threshold` | 姿态检测中姿态抑制分数所需的最低阈值。 | `Float [0.0, 1.0]` | `0.3` |
| `min_pose_presence_confidence` | 姿态关键点检测中姿态存在分数所需的最低置信度分数。 | `Float [0.0, 1.0]` | `0.5` |
| `min_hand_landmarks_confidence` | 手部关键点检测中手部存在分数所需的最低置信度分数。 | `Float [0.0, 1.0]` | `0.5` |
| `output_face_blendshapes` | 是否输出面部混合变形分类,可用于为 3D 模型制作动画。 | `Boolean` | `false` |
| `output_pose_segmentation_masks` | 是否输出人体姿态的分割掩码。 | `Boolean` | `false` |

## 模型

Holistic Landmarker 使用一系列打包的模型来执行整体关键点检测。这些模型包括面部检测、面部网格 (face mesh)/关键点、姿态检测、姿态关键点检测器、手掌检测和手部关键点模型。

以下模型被打包成一个可下载的模型包:

-   **姿态检测与关键点模型**:跟踪 33 个身体姿态坐标。
-   **面部检测与网格模型**:检测并跟踪 478 个 3D 面部网格关键点,包括 10 个虹膜关键点,并带有可选的 52 个混合变形系数。
-   **手掌检测与手部关键点模型**:每只手跟踪 21 个指关节 (knuckle) 坐标。

| 模型包 | 数据类型 | 模型卡 | 版本 |
|---|---|---|---|
| [Holistic landmarker](https://storage.googleapis.com/mediapipe-models/holistic_landmarker/holistic_landmarker/float16/latest/holistic_landmarker.task) | float 16 | [BlazePose](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20BlazePose%20GHUM%203D.pdf)<br>[FaceMesh-V2](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20MediaPipe%20Face%20Mesh%20V2.pdf)<br>[HandLandmarker](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20Hand%20Tracking%20(Lite_Full)%20with%20Fairness%20Oct%202021.pdf) | [最新](https://storage.googleapis.com/mediapipe-models/holistic_landmarker/holistic_landmarker/float16/latest/holistic_landmarker.task) |

## 关键点坐标

Holistic Landmarker 输出总共 553 个关键点,表示全身:

-   **姿态关键点**:33 个关键点,表示身体关键坐标点(与 [Pose Landmarker](../pose_landmarker.md) 相同)。
-   **面部关键点**:478 个关键点,表示面部结构,包括 10 个虹膜关键点(与 [Face Landmarker](../face_landmarker.md) 相同)。
-   **手部关键点**:每只手 21 个关键点(共 42 个),表示指关节坐标(与 [Hand Landmarker](../hand_landmarker.md) 相同)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*