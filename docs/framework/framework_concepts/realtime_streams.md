---
title: "实时数据流 (Real-time Streams)"
original_url: "https://developers.google.com/edge/mediapipe/framework/framework_concepts/realtime_streams"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2024-05-01 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 实时数据流 (Real-time Streams)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/framework/framework_concepts/realtime_streams)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

## 实时时间戳

MediaPipe 计算图（calculator graph）经常被用于交互式应用程序中处理视频或音频帧流。MediaPipe 框架（framework）只要求连续的数据包（packet）被分配单调递增的时间戳（timestamp）。按照惯例，实时计算器和计算图使用每帧的记录时间或呈现时间作为其时间戳，每个时间戳表示自 `1970年1月1日 00:00:00` 以来经过的微秒数。这允许来自各种源的数据包在全局一致的序列中进行处理。

## 实时调度

通常，每个计算器在给定时间戳的所有输入数据包变得可用时立即运行。通常，这发生在计算器完成上一帧的处理，并且生成其输入的每个计算器都完成当前帧的处理时。只要满足这些条件，MediaPipe 调度器就会尽快调用每个计算器。更多详情请参见[同步 (Synchronization)](../../../docs/framework/framework_concepts/synchronization.md)。

## 时间戳边界

当计算器未在给定时间戳输出任何数据包时，它可以转而输出一个“时间戳边界”（timestamp bound），表示该时间戳不会产生任何数据包。此指示对于允许下游计算器在该时间戳运行是必要的，即使某些数据流在该时间戳未收到任何数据包也是如此。这对于交互式应用程序中的实时计算图尤为重要，在这些图里，尽早开始每个计算器的处理是至关重要的。

考虑如下计算图：

```protobuf
node {
   calculator: "A"
   input_stream: "alpha_in"
   output_stream: "alpha"
}
node {
   calculator: "B"
   input_stream: "alpha"
   input_stream: "foo"
   output_stream: "beta"
}
```

假设：在时间戳 `T`，节点（node） `A` 不在它的输出流（output stream） `alpha` 中发送数据包。节点 `B` 在时间戳 `T` 于 `foo` 中得到一个数据包，并且在等待时间戳 `T` 的 `alpha` 数据包。如果 `A` 没有给 `B` 发送关于 `alpha` 的时间戳边界更新，`B` 就会一直等待 `alpha` 中的数据包到达。与此同时，`foo` 的数据包队列会在 `T`、`T+1` 等处不断累积数据包。

为了在数据流上输出数据包，计算器使用 API 函数 `CalculatorContext::Outputs` 和 `OutputStream::Add`。如果要替代为在流上输出时间戳边界，计算器可使用 API 函数 `CalculatorContext::Outputs` 和 `CalculatorContext::SetNextTimestampBound`。指定的边界是该指定输出流上下一数据包的最低允许时间戳。当没有数据包输出时，计算器通常会这样做：

```cpp
cc->Outputs().Tag("output_frame").SetNextTimestampBound(
  cc->InputTimestamp().NextAllowedInStream());
```

函数 `Timestamp::NextAllowedInStream` 返回后继的时间戳。例如，`Timestamp(1).NextAllowedInStream() == Timestamp(2)`。

## 传递时间戳边界

在实时计算图中将要使用的计算器需要基于输入时间戳边界来定义输出时间戳边界，以便允许下游计算器及时被调度。一种常见的模式是计算器输出与其输入数据包具有相同时间戳的数据包。在这种情况下，只需在每次调用 `Calculator::Process` 时输出一个数据包就足以定义输出时间戳边界。

然而，计算器并不要求在输出时间戳上遵循这种常见模式，它们仅要求选择单调递增的输出时间戳。结果，特定的计算器必须显式计算时间戳边界。MediaPipe 为每个计算器提供了用于计算合适时间戳边界的几种工具。

1. **SetNextTimestampBound()** 可被用来指定输出流的时间戳边界 `t + 1`。

```cpp
cc->Outputs.Tag("OUT").SetNextTimestampBound(t.NextAllowedInStream());
```

或者，也可以生成一个带有时间戳 `t` 的空数据包，以指定时间戳边界 `t + 1`。

```cpp
cc->Outputs.Tag("OUT").Add(Packet(), t);
```

输入流的时间戳边界由输入流上的数据包或空数据包指示。

```cpp
Timestamp bound = cc->Inputs().Tag("IN").Value().Timestamp();
```

2. 可以指定 **TimestampOffset()** 以便自动将输入流的时间戳边界复制到输出流。

```cpp
cc->SetTimestampOffset(0);
```

这个设置有自动传递时间戳边界的优势，即使在仅时间戳边界到达且 `Calculator::Process` 未被调用时也是如此。

3. 可以指定 **ProcessTimestampBounds()**，以便为每一个新的“已确定时间戳”（settled timestamp）调用 `Calculator::Process`，其中“已确定时间戳”是低于当前时间戳边界的新的最高时间戳。若没有 `ProcessTimestampBounds()`，`Calculator::Process` 仅在有一个或多个数据包到达时被调用。

```cpp
cc->SetProcessTimestampBounds(true);
```

此设置允许计算器执行其自己的时间戳边界计算及传递，甚至在仅有输入时间戳更新时也可进行。它不仅可用于复制 `TimestampOffset()` 的效果，还可用于在考量其他因素的情况下计算时间戳边界。

例如，为了复制 `SetTimestampOffset(0)`，计算器可以这么做：

```cpp
absl::Status Open(CalculatorContext* cc) {
  cc->SetProcessTimestampBounds(true);
}

absl::Status Process(CalculatorContext* cc) {
  cc->Outputs.Tag("OUT").SetNextTimestampBound(
      cc->InputTimestamp().NextAllowedInStream());
}
```

## Calculator::Open 与 Calculator::Close 的调度

当所需的所有输入边包（side packet）都生成时，调用 `Calculator::Open`。输入边包可由包裹它的应用程序提供，或由计算图内的“边包计算器”提供。边包可以从计算图外部使用 API 的 `CalculatorGraph::Initialize` 和 `CalculatorGraph::StartRun` 指定。边包可以由计算图内的计算器通过使用 `CalculatorGraphConfig::OutputSidePackets` 和 `OutputSidePacket::Set` 指定。

当所有的输入流由于被关闭或达到时间戳边界 `Timestamp::Done` 而变为 `Done`（完成）时，调用 `Calculator::Close`。

> **注意:** 如果计算图完成了所有的待定计算器执行并变为 `Done`，且发生在部分数据流变为 `Done` 之前，则 MediaPipe 将触发执行对 `Calculator::Close` 的剩余调用，以便让每一个计算器都能生成它的最终输出。

`TimestampOffset` 的使用对 `Calculator::Close` 有一些影响。通过设计，指定 `SetTimestampOffset(0)` 的计算器在所有输入流都已达到 `Timestamp::Done` 时，将发出其所有输出流也都已达到 `Timestamp::Done` 的信号，因而无法做进一步的输出。这就阻止了此类计算器在 `Calculator::Close` 期间发送任何数据包。如果某计算器需要在 `Calculator::Close` 期间生成概要数据包，`Calculator::Process` 必须指定时间戳边界，以使得在 `Calculator::Close` 期间至少有一个时间戳（如 `Timestamp::Max`）依然可用。这意味着这种计算器一般不能依赖 `SetTimestampOffset(0)`，并必须改用 `SetNextTimestampBounds()` 显式指定时间戳边界。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*