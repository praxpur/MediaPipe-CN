---
title: "故障排查 (Troubleshooting)"
original_url: "https://developers.google.com/edge/mediapipe/framework/getting_started/troubleshooting"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-05-28 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 故障排查 (Troubleshooting)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/framework/getting_started/troubleshooting)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

## 缺少 Python 二进制路径 (Missing Python binary path)

错误消息:

```
ERROR: An error occurred during the fetch of repository 'local_execution_config_python':
  Traceback (most recent call last):
       File "/sandbox_path/external/org_tensorflow/third_party/py/python_configure.bzl", line 208
               get_python_bin(repository_ctx)
    ...
Repository command failed
```

通常表明 Bazel 无法找到本地 Python 二进制文件。要解决此问题,请首先找到 python 二进制文件的位置,然后将 `--action_env PYTHON_BIN_PATH=<path to python binary>` 添加到 Bazel 命令中。例如,您可以通过以下命令切换到使用系统默认的 python3 二进制文件:

```
bazel build -c opt \
  --define MEDIAPIPE_DISABLE_GPU=1 \
  --action_env PYTHON_BIN_PATH=$(which python3) \
  mediapipe/examples/desktop/hello_world
```

## 缺少必要的 Python 包 (Missing necessary Python packages)

错误消息:

```
ImportError: No module named numpy
Is numpy installed?
```

通常表明某些 Python 包未安装。请根据您的 Python 二进制版本运行 `pip install` 或 `pip3 install` 来安装这些包。

## 无法获取远程依赖仓库 (Fail to fetch remote dependency repositories)

错误消息:

```
ERROR: An error occurred during the fetch of repository 'org_tensorflow':
   java.io.IOException: Error downloading [https://mirror.bazel.build/github.com/tensorflow/tensorflow/archive/77e9ffb9b2bfb1a4f7056e62d84039626923e328.tar.gz, https://github.com/tensorflow/tensorflow/archive/77e9ffb9b2bfb1a4f7056e62d84039626923e328.tar.gz] to /sandbox_path/external/org_tensorflow/77e9ffb9b2bfb1a4f7056e62d84039626923e328.tar.gz: Tried to reconnect at offset 9,944,151 but server didn't support it

or

WARNING: Download from https://storage.googleapis.com/mirror.tensorflow.org/github.com/bazelbuild/rules_swift/releases/download/0.12.1/rules_swift.0.12.1.tar.gz failed: class java.net.ConnectException Connection timed out (Connection timed out)
```

通常表明 Bazel 无法下载 MediaPipe 所需的必要依赖仓库。MediaPipe 有几个依赖仓库托管在 Google 站点。在某些地区,您可能需要设置网络代理或使用 VPN 才能访问这些资源。您可能还需要在 Bazel 命令后追加 `--host_jvm_args "-DsocksProxyHost=<ip address> -DsocksProxyPort=<port number>"`。更多细节请参阅 [这个 GitHub issue](https://github.com/google/mediapipe/issues/581#issuecomment-610356857)。

如果您认为这不是网络问题,另一种可能是一些资源暂时不可用,请运行 `bazel clean --expunge` 并在稍后重试。如果仍然无法工作,请提交包含详细错误消息的 GitHub issue。

## MediaPipe OpenCV 配置不正确 (Incorrect MediaPipe OpenCV config)

错误消息:

```
error: undefined reference to 'cv::String::deallocate()'
error: undefined reference to 'cv::String::allocate(unsigned long)'
error: undefined reference to 'cv::VideoCapture::VideoCapture(cv::String const&)'
...
error: undefined reference to 'cv::putText(cv::InputOutputArray const&, cv::String const&, cv::Point, int, double, cv::Scalar, int, int, bool)'
```

通常表明 OpenCV 未针对 MediaPipe 正确配置。请查看 [Installation](install.md) 中的 "Install OpenCV and FFmpeg" 部分,了解如何为您的本地 opencv 库修改 MediaPipe 的 WORKSPACE 和 linux_opencv/macos_opencv/windows_opencv.BUILD 文件。[这个 GitHub issue](https://github.com/google/mediapipe/issues/666) 可能也有帮助。

## Python pip 安装失败 (Python pip install failure)

错误消息:

```
ERROR: Could not find a version that satisfies the requirement mediapipe
ERROR: No matching distribution found for mediapipe
```

在运行 `pip install mediapipe` 后通常表明您的系统没有合格的 MediaPipe Python 包。请注意,MediaPipe Python PyPI 官方支持以下操作系统上的 **64 位** 版本 Python:

-   x86_64 Linux
-   x86_64 macOS 11.0+
-   arm64 macOS 11.0+
-   amd64 Windows

如果当前操作系统受支持但仍看到此错误,请确保 Python 和 pip 二进制文件都对应 MediaPipe 支持的 Python 版本。否则,请考虑按照 [此处](python_framework.md) 的说明在本地构建 MediaPipe Python 包。

## Windows 上 Python DLL 加载失败 (Python DLL load failure on Windows)

错误消息:

```
ImportError: DLL load failed: The specified module could not be found
```

通常表明本地 Windows 系统缺少 Visual C++ 可再发行组件包和/或 Visual C++ 运行时 DLL。可以通过安装官方的 [vc_redist.x64.exe](https://support.microsoft.com/en-us/topic/the-latest-supported-visual-c-downloads-2647da03-1eea-4433-9aff-95f26a218cc0) 或通过运行以下命令安装 "msvc-runtime" Python 包来解决:

```
$ python -m pip install msvc-runtime
```

请注意,"msvc-runtime" Python 包并非由 Microsoft 发布或维护。

## 找不到原生方法 (Native method not found)

错误消息:

```
java.lang.UnsatisfiedLinkError: No implementation found for void com.google.wick.Wick.nativeWick
```

通常表明所需的原生库,例如 `/libwickjni.so`,尚未加载、未包含在应用的依赖中,或由于某种原因无法找到。请注意,Java 要求每个原生库使用 `System.loadLibrary` 函数显式加载。

## 找不到已注册的计算器 (No registered calculator found)

错误消息:

```
No registered object with name: OurNewCalculator; Unable to find Calculator "OurNewCalculator"
```

通常表明 `OurNewCalculator` 在 [`CalculatorGraphConfig`](https://github.com/google-ai-edge/mediapipe/tree/master/mediapipe/framework/calculator.proto) 中按名称引用,但 OurNewCalculator 的库目标尚未链接到应用程序二进制文件。当新的计算器被添加到计算器计算图时,该计算器也必须作为使用该计算器计算图的应用程序的构建依赖添加。

此错误在运行时被捕获,因为计算器计算图通过字段 `CalculatorGraphConfig::Node:calculator` 按名称引用其计算器。当计算器的库链接到应用程序二进制文件时,计算器会通过 [`REGISTER_CALCULATOR`](https://github.com/google-ai-edge/mediapipe/tree/master/mediapipe/framework/calculator_registry.h) 宏使用 [`registration.h`](https://github.com/google-ai-edge/mediapipe/tree/master/mediapipe/framework/deps/registration.h) 库按名称自动注册。请注意,[`REGISTER_CALCULATOR`](https://github.com/google-ai-edge/mediapipe/tree/master/mediapipe/framework/calculator_registry.h) 可以注册带命名空间前缀的计算器,与其 C++ 命名空间相同。在这种情况下,计算器计算图也必须使用相同的命名空间前缀。

## 内存不足错误 (Out Of Memory error)

内存耗尽可能是正在运行的 MediaPipe 计算图内积累了太多数据包的症状。这可能由多种原因引起,例如:

1.  计算图中的某些计算器无法跟上来自实时输入流(例如摄像头)的数据包到达速度。
2.  某些计算器在等待永远不会到达的数据包。

对于问题 (1),可能需要丢弃一些旧数据包,以便处理较新的数据包。相关提示参见:[`How to process realtime input streams`](faq.md#how-to-process-realtime-input-streams)。

对于问题 (2),可能是某个输入流由于某种原因缺少数据包。设备或计算器可能配置错误,或者只零星地产生数据包。这会导致下游计算器等待许多永远不会到达的数据包,进而导致数据包在它们的一些输入流上累积。MediaPipe 使用"时间戳边界"(timestamp bounds) 来解决这类问题。相关提示参见:[`How to process realtime input streams`](faq.md#how-to-process-realtime-input-streams)。

MediaPipe 设置 [`CalculatorGraphConfig::max_queue_size`](https://github.com/google-ai-edge/mediapipe/tree/master/mediapipe/framework/calculator.proto) 通过限制进入计算图的输入来限制任何输入流上排队的数据包数量。对于实时输入流,在输入流处排队的数据包数量几乎应该始终为零或一。如果不是这种情况,您可能会看到以下警告消息:

```
Resolved a deadlock by increasing max_queue_size of input stream
```

此外,可以设置 [`CalculatorGraphConfig::report_deadlock`](https://github.com/google-ai-edge/mediapipe/tree/master/mediapipe/framework/calculator.proto),使计算图运行失败并将死锁作为错误显露出来,从而使 max_queue_size 起到内存使用限制的作用。

## 计算图挂起 (Graph hangs)

许多应用程序会调用 [`CalculatorGraph::CloseAllPacketSources`](https://github.com/google-ai-edge/mediapipe/tree/master/mediapipe/framework/calculator_graph.h) 和 [`CalculatorGraph::WaitUntilDone`](https://github.com/google-ai-edge/mediapipe/tree/master/mediapipe/framework/calculator_graph.h) 来完成或挂起 MediaPipe 计算图的执行。这里的目的是允许任何挂起的计算器或数据包完成处理,然后关闭计算图。如果一切顺利,计算图中的每个数据流都将达到 [`Timestamp::Done`](https://github.com/google-ai-edge/mediapipe/tree/master/mediapipe/framework/timestamp.h),每个计算器都将达到 [`CalculatorBase::Close`](https://github.com/google-ai-edge/mediapipe/tree/master/mediapipe/framework/calculator_base.h),然后 [`CalculatorGraph::WaitUntilDone`](https://github.com/google-ai-edge/mediapipe/tree/master/mediapipe/framework/calculator_graph.h) 将成功完成。

如果某些计算器或数据流无法达到 [`Timestamp::Done`](https://github.com/google-ai-edge/mediapipe/tree/master/mediapipe/framework/timestamp.h) 或 [`CalculatorBase::Close`](https://github.com/google-ai-edge/mediapipe/tree/master/mediapipe/framework/calculator_base.h) 状态,则可以调用 [`CalculatorGraph::Cancel`](https://github.com/google-ai-edge/mediapipe/tree/master/mediapipe/framework/calculator_graph.h) 方法来终止计算图运行,而无需等待所有挂起的计算器和数据包完成。

## 输出时序不均匀 (Output timing is uneven)

一些实时 MediaPipe 计算图会生成一系列视频帧,用作视频特效或视频诊断。有时,MediaPipe 计算图会成簇地产生这些帧,例如当多个输出帧从同一簇输入帧外推得到时。如果输出按产生的顺序呈现,同一簇中后面的帧会立即替换一些输出帧,这使得结果难以进行视觉评估。在这种情况下,可以在实时中以均匀间隔呈现帧来改善输出可视化。

MediaPipe 通过将时间戳映射到实时时间点来处理这种用例。每个时间戳表示一个时间(微秒),像 `LiveClockSyncCalculator` 这样的计算器可以延迟数据包的输出以匹配其时间戳。这类计算器会调整输出的时序,使得:

1.  输出之间的时间尽可能接近时间戳之间的时间。
2.  输出以尽可能小的延迟产生。

## CalculatorGraph 落后于输入 (CalculatorGraph lags behind inputs)

对于许多实时 MediaPipe 计算图,低延迟是一个目标。MediaPipe 支持"流水线"式并行处理,以便尽早开始处理每个数据包。通常,可实现的最低延迟是连续计算器"关键路径"上每个计算器所需的总时间。由于 [Output timing is uneven](#output-timing-is-uneven) 中描述的以均匀间隔显示帧而引入的延迟,MediaPipe 计算图的延迟可能比理想情况更差。

如果计算图中的某些计算器无法跟上实时输入流,那么延迟将继续增加,因此有必要丢弃一些输入数据包。推荐的技术是使用专门为此目的设计的 MediaPipe 计算器,例如 [`FlowLimiterCalculator`](https://github.com/google-ai-edge/mediapipe/tree/master/mediapipe/calculators/core/flow_limiter_calculator.cc),如 [`How to process realtime input streams`](faq.md#how-to-process-realtime-input-streams) 中所述。

## 监控计算器输入与时间戳判定 (Monitor calculator inputs and timestamp settlements)

调试 MediaPipe 计算器通常需要深入理解数据流和时间戳同步。传入计算器的数据包首先按流缓存在输入队列中,由分配的 `InputStreamHandler` 进行同步。`InputStreamHandler` 的职责是确定已判定时间戳的输入数据包集,这使计算器进入 "ready"(就绪) 状态,然后以确定的数据包集作为输入触发 Calculator::Process 调用。

`DebugInputStreamHandler` 可用于在应用程序的 LOG(INFO) 输出中实时跟踪传入的数据包和时间戳判定。可以通过计算器的 input_stream_handler 字段将其分配给特定计算器,或通过 `CalculatorGraphConfig` 的 input_stream_handler 字段在计算图范围内全局分配。

在计算图执行期间,传入的数据包会生成 LOG 消息,显示数据包的时间戳和类型,随后显示所有输入队列的当前状态:

```
[INFO] SomeCalculator: Adding packet (ts:2, type:int) to stream INPUT_B:0:input_b
[INFO] SomeCalculator: INPUT_A:0:input_a num_packets: 0 min_ts: 2
[INFO] SomeCalculator: INPUT_B:0:input_b num_packets: 1 min_ts: 2
```

此外,它还支持监控时间戳判定事件(如果应用了 `DefaultInputStreamHandler`)。这有助于揭示输入流上意外的时间戳边界增加,导致 Calculator::Process 调用使用不完整的输入集,进而在(可能必需的)输入流上产生空数据包。

*示例场景:*

```
node {
  calculator: "SomeCalculator"
  input_stream: "INPUT_A:a"
  input_stream: "INPUT_B:b"
  ...
}
```

给定一个具有两个输入的计算器,在流 A 上收到时间戳为 1 的传入数据包,随后在流 B 上收到时间戳为 2 的输入数据包。流 B 上时间戳边界增加到 2,而此时流 A 上还有时间戳为 1 的待处理输入数据包,这会触发 Calculator::Process 调用使用时间戳 1 的不完整输入集。在这种情况下,`DefaultInputStreamHandler` 输出:

```
[INFO] SomeCalculator: Filled input set at ts: 1 with MISSING packets in input streams: INPUT_B:0:input_b.
```

## VLOG 是你的朋友 (VLOG is your friend)

MediaPipe 在许多地方使用 `VLOG` 记录重要事件以进行调试,而在未启用日志记录时不会影响性能。

在 [abseil `VLOG`](https://abseil.io/docs/cpp/guides/logging#VLOG) 上查看更多关于 `VLOG` 的信息。

请注意,如果您全局启用 `VLOG`(例如使用 `--v` 标志),`VLOG` 可能会很冗长。解决方案是 `--vmodule` 标志,它允许为不同的源文件设置不同的级别。

在无法使用 `--v` / `--vmodule` 的情况下(例如运行 Android 应用),MediaPipe 允许为调试目的设置 `VLOG` 的 `--v` / `--vmodule` 标志覆盖,这些覆盖在创建 `CalculatorGraph` 时应用。

覆盖项:

-   `MEDIAPIPE_VLOG_V`:定义并提供您为 `--v` 提供的值
-   `MEDIAPIPE_VLOG_VMODULE`:定义并提供您为 `--vmodule` 提供的值

您可以通过在构建命令中添加 `--copt=-DMEDIAPIPE_VLOG_VMODULE=\"*calculator*=5\"` 来设置覆盖项,

并附带您所需的模块模式和 `VLOG` 级别(有关 `--vmodule` 的更多细节,请参阅 [abseil `VLOG`](https://abseil.io/docs/cpp/guides/logging#VLOG))。

重要:请注意,将上述内容添加到构建命令将触发整个二进制文件(包括依赖项)的重新构建。因此,考虑到 `VLOG` 覆盖项仅用于调试目的,更快的做法是直接修改 [`vlog_overrides.cc`](https://github.com/google-ai-edge/mediapipe/tree/master/mediapipe/framework/vlog_overrides.cc),在文件最顶部添加 `MEDIAPIPE_VLOG_V/VMODULE`。

## 构建期间不支持的标志 (Unsupported flags during build)

如果您使用 Clang 18 或更早版本,可能必须禁用我们 CPU 后端中的某些编译器优化。

要禁用对 `avxvnniint8` 的支持,请将以下内容添加到您的 `.bazelrc`:

```
build --define=xnn_enable_avxvnniint8=false
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*