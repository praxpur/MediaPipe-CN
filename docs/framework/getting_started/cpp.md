---
title: "C++ 中的 MediaPipe Framework (MediaPipe Framework in C++)"
original_url: "https://developers.google.com/edge/mediapipe/framework/getting_started/cpp"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-08-28 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# C++ 中的 MediaPipe Framework (MediaPipe Framework in C++)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/framework/getting_started/cpp)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

请按照下面的说明,使用 MediaPipe Framework 构建 C++ 命令行示例应用。要了解这些示例应用的更多信息,请从 [Hello World!(C++ 入门示例)](hello_world_cpp.md)开始。

## 构建 C++ 命令行示例应用

### 选项 1:在 CPU 上运行

1. 例如,要构建旧版 MediaPipe 手部检测解决方案(Hand Detection solution)的 C++ 示例应用并在 CPU 上运行,请执行:

   ```
   bazel build -c opt --define MEDIAPIPE_DISABLE_GPU=1 mediapipe/examples/desktop/hand_tracking:hand_tracking_cpu
   ```
2. 要运行该应用:

   ```
   GLOG_logtostderr=1 bazel-bin/mediapipe/examples/desktop/hand_tracking/hand_tracking_cpu \
     --calculator_graph_config_file=mediapipe/graphs/hand_tracking/hand_tracking_desktop_live.pbtxt
   ```

   只要摄像头已连接并开启,这就会打开你的网络摄像头。任何错误很可能都是因为无法访问你的摄像头。

### 选项 2:在 GPU 上运行

#### 针对 Linux

首先遵循 [Linux 桌面版上的 OpenGL ES 设置](gpu_support.md#opengl-es-setup-on-linux-desktop)。

1. 例如,要构建 [MediaPipe Hands](https://developers.google.com/edge/mediapipe/framework/solutions/hands.md),请执行:

   ```
   bazel build -c opt --copt -DMESA_EGL_NO_X11_HEADERS --copt -DEGL_NO_X11 \
     mediapipe/examples/desktop/hand_tracking:hand_tracking_gpu
   ```

#### 针对 macOS

1. 例如,要构建 [MediaPipe Hands](https://developers.google.com/edge/mediapipe/framework/solutions/hands.md),请执行:

   ```
   bash bazel build -c opt \
   --copt=-DMEDIAPIPE_METAL_ENABLED=1 \
   --copt=-DMEDIAPIPE_DISABLE_GPU=0 \
   --copt=-DMEDIAPIPE_GPU_BUFFER_USE_CV_PIXEL_BUFFER=1 \
   --copt=-DOSX_ENABLE_3_2_CORE \
   mediapipe/examples/desktop/hand_tracking:hand_tracking_gpu
   ```

#### 运行应用

1. 要运行该应用:

   ```
   GLOG_logtostderr=1 bazel-bin/mediapipe/examples/desktop/hand_tracking/hand_tracking_gpu \
     --calculator_graph_config_file=mediapipe/graphs/hand_tracking/hand_tracking_desktop_live_gpu.pbtxt
   ```

   只要摄像头已连接并开启,这就会打开你的网络摄像头。任何错误很可能是因为无法访问你的摄像头,或 GPU 驱动没有正确配置。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*