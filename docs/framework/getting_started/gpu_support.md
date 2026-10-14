---
title: "GPU 支持 (GPU Support)"
original_url: "https://developers.google.com/edge/mediapipe/framework/getting_started/gpu_support"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-05-28 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# GPU 支持 (GPU Support)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/framework/getting_started/gpu_support)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

## OpenGL ES 支持 (OpenGL ES Support)

MediaPipe 在 Android/Linux 上支持最高 3.2 版的 OpenGL ES,在 iOS 上支持最高 ES 3.0。此外,MediaPipe 在 iOS 上也支持 Metal。

在 Android/Linux 系统上运行机器学习推理计算器和计算图,需要 OpenGL ES 3.1 或更高版本。

## 禁用 OpenGL ES 支持 (Disable OpenGL ES Support)

默认情况下,构建 MediaPipe(不使用特殊 bazel 标志)会尝试编译并链接 OpenGL ES(在 iOS 上还有 Metal)库。

在没有 OpenGL ES 的平台上(另请参阅 [Linux 桌面上的 OpenGL ES 设置](#opengl-es-setup-on-linux-desktop)),您应该使用以下方式禁用 OpenGL ES 支持:

```
$ bazel build --define MEDIAPIPE_DISABLE_GPU=1 <my-target>
```

> **注意:** 在 Android 和 iOS 上,MediaPipe 框架要求 OpenGL ES,且不应禁用该支持。

## Linux 桌面上的 OpenGL ES 设置 (OpenGL ES Setup on Linux Desktop)

在配备支持 OpenGL ES 3.1+ 的显卡的 Linux 桌面上,MediaPipe 可以执行 GPU 计算和渲染,并在 GPU 上执行 TFLite 推理。

要检查您的 Linux 桌面 GPU 是否可以使用 OpenGL ES 运行 MediaPipe:

```
$ sudo apt-get install mesa-common-dev libegl1-mesa-dev libgles2-mesa-dev
$ sudo apt-get install mesa-utils
$ glxinfo | grep -i opengl
```

例如,它可能会输出:

```
$ glxinfo | grep -i opengl
...
OpenGL ES profile version string: OpenGL ES 3.2 NVIDIA 430.50
OpenGL ES profile shading language version string: OpenGL ES GLSL ES 3.20
OpenGL ES profile extensions:
```

如果您通过 SSH 连接到计算机,并且在探测 GPU 信息时看到如下输出:

```
glxinfo | grep -i opengl
Error: unable to open display
```

请尝试使用 `-X` 选项重新建立 SSH 连接,然后重试。例如:

```
ssh -X <user>@<host>
```

*注意上面显示的 ES 3.20 文本。*

您需要在输出中看到 ES 3.1 或更高版本,才能在 MediaPipe 中于 GPU 上执行 TFLite 推理。在此设置下,使用以下方式构建:

```
$ bazel build --copt -DMESA_EGL_NO_X11_HEADERS --copt -DEGL_NO_X11 <my-target>
```

如果仅支持 ES 3.0 或更低版本,您仍然可以使用以下方式构建不需要在 GPU 上执行 TFLite 推理的 MediaPipe 目标:

```
$ bazel build --copt -DMESA_EGL_NO_X11_HEADERS --copt -DEGL_NO_X11 --copt -DMEDIAPIPE_DISABLE_GL_COMPUTE <my-target>
```

> **注意:** MEDIAPIPE_DISABLE_GL_COMPUTE 已在所有 Apple 系统上自动定义(Apple 不支持 OpenGL ES 3.1+)。

## Linux 桌面上的 TensorFlow CUDA 支持与设置 (TensorFlow CUDA Support and Setup on Linux Desktop)

MediaPipe 框架的 GPU 计算和渲染不要求 CUDA。但是,MediaPipe 可以与 TensorFlow 配合,在支持 CUDA 的显卡上执行 GPU 推理。

要启用 MediaPipe 的 TensorFlow GPU 推理,第一步是按照 [TensorFlow GPU 文档](https://www.tensorflow.org/install/gpu#software_requirements) 在您的 Linux 桌面上安装所需的 NVIDIA 软件。

安装后,使用以下方式更新 `$PATH` 和 `$LD_LIBRARY_PATH` 并运行 `ldconfig`:

```
$ export PATH=/usr/local/cuda-10.1/bin${PATH:+:${PATH}}
$ export LD_LIBRARY_PATH=/usr/local/cuda/extras/CUPTI/lib64,/usr/local/cuda-10.1/lib64${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}
$ sudo ldconfig
```

建议验证 CUPTI、CUDA、CuDNN 和 NVCC 的安装:

```
$ ls /usr/local/cuda/extras/CUPTI
/lib64
libcupti.so       libcupti.so.10.1.208  libnvperf_host.so        libnvperf_target.so
libcupti.so.10.1  libcupti_static.a     libnvperf_host_static.a

$ ls /usr/local/cuda-10.1
LICENSE  bin  extras   lib64      libnvvp           nvml  samples  src      tools
README   doc  include  libnsight  nsightee_plugins  nvvm  share    targets  version.txt

$ nvcc -V
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2019 NVIDIA Corporation
Built on Sun_Jul_28_19:07:16_PDT_2019
Cuda compilation tools, release 10.1, V10.1.243

$ ls /usr/lib/x86_64-linux-gnu/ | grep libcudnn.so
libcudnn.so
libcudnn.so.7
libcudnn.so.7.6.4
```

设置 `$TF_CUDA_PATHS` 是声明 CUDA 库位置的方法。请注意,以下代码片段还将 `/usr/lib/x86_64-linux-gnu` 和 `/usr/include` 添加到 `$TF_CUDA_PATHS`,用于 cudablas 和 libcudnn。

```
$ export TF_CUDA_PATHS=/usr/local/cuda-10.1,/usr/lib/x86_64-linux-gnu,/usr/include
```

要使 MediaPipe 获取 TensorFlow 的 CUDA 设置,请找到 TensorFlow 的 [.bazelrc](https://github.com/tensorflow/tensorflow/blob/master/.bazelrc),并将 `build:using_cuda` 和 `build:cuda` 部分复制到 MediaPipe 的 .bazelrc 文件中。例如,截至 2020 年 4 月 23 日,TensorFlow 的 CUDA 设置如下:

```
# 此配置指使用可用的 CUDA 进行构建。它不一定
# 意味着我们构建 CUDA op 内核。
build:using_cuda --define=using_cuda=true
build:using_cuda --action_env TF_NEED_CUDA=1
build:using_cuda --crosstool_top=@local_config_cuda//crosstool:toolchain

# 此配置指使用 nvcc 构建 CUDA op 内核。
build:cuda --config=using_cuda
build:cuda --define=using_cuda_nvcc=true
```

最后,使用另外两个标志 `--config=cuda` 和 `--spawn_strategy=local` 构建带 TensorFlow GPU 的 MediaPipe。例如:

```
$ bazel build -c opt --config=cuda --spawn_strategy=local \
    --define no_aws_support=true --copt -DMESA_EGL_NO_X11_HEADERS \
    mediapipe/examples/desktop/object_detection:object_detection_tensorflow
```

在二进制文件运行时,它会打印出 GPU 设备信息:

```
I external/org_tensorflow/tensorflow/stream_executor/platform/default/dso_loader.cc:44] Successfully opened dynamic library libcuda.so.1
I external/org_tensorflow/tensorflow/core/common_runtime/gpu/gpu_device.cc:1544] Found device 0 with properties: pciBusID: 0000:00:04.0 name: Tesla T4 computeCapability: 7.5 coreClock: 1.59GHz coreCount: 40 deviceMemorySize: 14.75GiB deviceMemoryBandwidth: 298.08GiB/s
I external/org_tensorflow/tensorflow/core/common_runtime/gpu/gpu_device.cc:1686] Adding visible gpu devices: 0
```

您可以监控 GPU 使用情况,以验证 GPU 是否用于模型推理:

```
$ nvidia-smi --query-gpu=utilization.gpu --format=csv --loop=1

0 %
0 %
4 %
5 %
83 %
21 %
22 %
27 %
29 %
100 %
0 %
0%
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*