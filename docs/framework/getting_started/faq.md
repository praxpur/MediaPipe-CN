---
title: "常见问题解答 (FAQ)"
original_url: "https://developers.google.com/edge/mediapipe/framework/getting_started/faq"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-05-28 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 常见问题解答 (FAQ)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/framework/getting_started/faq)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

### 如何转换 ImageFrames 和 GpuBuffers (How to convert ImageFrames and GpuBuffers)

计算器 [`ImageFrameToGpuBufferCalculator`](https://github.com/google/mediapipe/tree/master/mediapipe/gpu/image_frame_to_gpu_buffer_calculator.cc) 和 [`GpuBufferToImageFrameCalculator`](https://github.com/google/mediapipe/tree/master/mediapipe/gpu/gpu_buffer_to_image_frame_calculator.cc) 在类型为 [`ImageFrame`](https://github.com/google/mediapipe/tree/master/mediapipe/framework/formats/image_frame.h) 和 [`GpuBuffer`](https://github.com/google/mediapipe/tree/master/mediapipe/gpu/gpu_buffer.h) 的数据包之间来回转换。[`ImageFrame`](https://github.com/google/mediapipe/tree/master/mediapipe/framework/formats/image_frame.h) 指 CPU 内存中的图像数据,可以是多种位图图像格式之一。[`GpuBuffer`](https://github.com/google/mediapipe/tree/master/mediapipe/gpu/gpu_buffer.h) 指 GPU 内存中的图像数据。您可以在框架概念章节的 [GpuBuffer 到 ImageFrame 转换器](../../framework_concepts/gpu.md#gpubuffer_to_imageframe_converters) 找到更多细节。您可以在以下示例中看到用法:

-   [`object_detection_mobile_cpu.pbtxt`](https://github.com/google/mediapipe/tree/master/mediapipe/graphs/object_detection/object_detection_mobile_cpu.pbtxt)

### 如何可视化感知结果 (How to visualize perception results)

[`AnnotationOverlayCalculator`](https://github.com/google/mediapipe/tree/master/mediapipe/calculators/util/annotation_overlay_calculator.cc) 允许将感知结果(例如边界框、箭头和椭圆)叠加到与已识别对象对齐的视频帧上。在工作站上运行时,结果可以显示在诊断窗口中;在设备上运行时,结果显示在纹理帧中。您可以在以下示例中看到 [`AnnotationOverlayCalculator`](https://github.com/google/mediapipe/tree/master/mediapipe/calculators/util/annotation_overlay_calculator.cc) 的用法:

-   [`face_detection_mobile_gpu.pbtxt`](https://github.com/google/mediapipe/tree/master/mediapipe/graphs/face_detection/face_detection_mobile_gpu.pbtxt)。

### 如何并行运行计算器 (How to run calculators in parallel)

在计算器计算图内,MediaPipe 会例行地并行运行独立的计算器节点。MediaPipe 维护一个线程池,一旦某个线程可用且计算器的所有输入都已就绪,就运行该计算器。每个计算器实例一次只能处理一组输入,因此大多数计算器只需是 *线程兼容* (thread-compatible) 的,而不必是 *线程安全* (thread-safe) 的。

为了使一个计算器能够并行处理多个输入,有两种可能的方法:

1.  定义多个计算器节点,并将输入数据包分发到所有节点。
2.  使计算器线程安全,并配置其 [`max_in_flight`](https://github.com/google/mediapipe/tree/master/mediapipe/framework/calculator.proto) 设置。

第一种方法可以使用为在其他计算器之间分发数据包而设计的计算器,例如 [`RoundRobinDemuxCalculator`](https://github.com/google/mediapipe/tree/master//mediapipe/calculators/core/round_robin_demux_calculator.cc)。单个 [`RoundRobinDemuxCalculator`](https://github.com/google/mediapipe/tree/master//mediapipe/calculators/core/round_robin_demux_calculator.cc) 可以将连续的数据包分发到多个配置相同的 [`ScaleImageCalculator`](https://github.com/google/mediapipe/tree/master/mediapipe/calculators/image/scale_image_calculator.cc) 节点。

第二种方法允许在同一计算器节点上最多有 [`max_in_flight`](https://github.com/google/mediapipe/tree/master/mediapipe/framework/calculator.proto) 次 [`CalculatorBase::Process`](https://github.com/google/mediapipe/tree/master/mediapipe/framework/calculator_base.h) 方法调用。来自 [`CalculatorBase::Process`](https://github.com/google/mediapipe/tree/master/mediapipe/framework/calculator_base.h) 的输出数据包在传递给下游计算器之前会自动按时间戳排序。

无论采用哪种方法,都必须注意,并行运行的计算器不能像正常的顺序计算器那样维护内部状态。

### 使用 ImmediateInputStreamHandler 时的输出时间戳 (Output timestamps when using ImmediateInputStreamHandler)

[`ImmediateInputStreamHandler`](https://github.com/google/mediapipe/tree/master/mediapipe/framework/stream_handler/immediate_input_stream_handler.cc) 会在每个数据包到达输入流时立即将其传送。因此,它可能会在传送来自另一个输入流的较低时间戳的数据包之前,先传送来自一个输入流的较高时间戳的数据包。如果这些输入时间戳都用于发送到一个输出流的数据包,该输出流将报告时间戳不是单调递增的。为了解决这个问题,计算器必须注意只在某个时间戳的处理完成之后再输出数据包。这可以通过等待该时间戳的所有输入流数据包都已收到,或者忽略一个时间戳已经被处理过的数据包来实现。

### 如何在运行时更改设置 (How to change settings at runtime)

在应用程序运行期间更改计算器计算图的设置有两种主要方法:

1.  使用修改后的 [`CalculatorGraphConfig`](https://github.com/google/mediapipe/tree/master/mediapipe/framework/calculator.proto) 重新启动计算器计算图。
2.  通过计算图输入流上的数据包发送新的计算器选项。

第一种方法的优势在于可以利用 [`CalculatorGraphConfig`](https://github.com/google/mediapipe/tree/master/mediapipe/framework/calculator.proto) 处理工具,例如"subgraphs"(子图)。第二种方法的优势在于允许活动中的计算器和数据包在设置更改期间保持处理中(in-flight)。MediaPipe 贡献者目前正在研究替代方法,以实现这两种优势。

### 如何处理实时输入流 (How to process realtime input streams)

MediaPipe 框架既可以用于在线处理数据流,也可以用于离线处理。对于离线处理,只要计算器准备好处理数据包,数据包就会被推入计算图。对于在线处理,每记录一帧,就将该帧的一个数据包推入计算图。

MediaPipe 框架只要求连续的数据包具有单调递增的时间戳。按照惯例,实时计算器和计算图使用录制时间或呈现时间作为每个数据包的时间戳,每个时间戳表示自 `Jan/1/1970:00:00:00` 以来的微秒数。这使得来自不同来源的数据包能够以全局一致的顺序进行处理。

通常,对于离线处理,每个输入数据包都会被处理,处理过程根据需要持续进行。对于在线处理,通常需要丢弃输入数据包,以便跟上输入数据帧的到达速度。当输入到达过于频繁时,推荐的丢包技术是使用专门为此目的设计的 MediaPipe 计算器,例如 [`FlowLimiterCalculator`](https://github.com/google/mediapipe/tree/master/mediapipe/calculators/core/flow_limiter_calculator.cc) 和 [`PacketClonerCalculator`](https://github.com/google/mediapipe/tree/master/mediapipe/calculators/core/packet_cloner_calculator.cc)。

对于在线处理,还需要及时确定何时可以继续处理。MediaPipe 通过计算器之间传播时间戳边界来支持这一点。时间戳边界表示将不包含输入数据包的时间戳区间,它们允许计算器立即开始处理这些时间戳。为实时处理设计的计算器应仔细计算时间戳边界,以便尽快开始处理。例如,[`MakePairCalculator`](https://github.com/google/mediapipe/tree/master/mediapipe/calculators/core/make_pair_calculator.cc) 使用 `SetOffset` API 将时间戳边界从输入流传播到输出流。

### 我可以在 MS Windows 上运行 MediaPipe 吗? (Can I run MediaPipe on MS Windows?)

目前 MediaPipe 的可移植性支持 Debian Linux、Ubuntu Linux、MacOS、Android 和 iOS。MediaPipe 框架的核心是一个符合 C++11 标准的 C++ 库,因此相对容易移植到其他平台。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*