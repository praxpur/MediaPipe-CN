---
title: "同步 (Synchronization)"
original_url: "https://developers.google.com/edge/mediapipe/framework/framework_concepts/synchronization"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2024-05-01 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 同步 (Synchronization)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/framework/framework_concepts/synchronization)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

## 调度机制

MediaPipe 计算图（graph）中的数据处理发生在定义为 [`CalculatorBase`](https://github.com/google/mediapipe/tree/master/mediapipe/framework/calculator_base.h) 子类的处理节点（node）内。调度系统决定每个计算器（calculator）何时应运行。

每个计算图至少有一个**调度队列**。每个调度队列仅有一个**执行器**。节点静态分配到一个队列（并因此分配给一个执行器）。默认情况下有一个队列，其执行器是一个线程池，线程数量根据系统能力确定。

每个节点具有调度状态，可以是*未就绪*、*就绪*或*运行中*。就绪函数确定节点是否准备好运行。该函数在计算图初始化、节点完成运行以及节点输入状态改变时调用。

使用的就绪函数取决于节点类型。没有输入流（input stream）的节点称为**源节点**；源节点始终准备好运行，直到它们告诉框架它们没有更多输出数据为止，此时它们被关闭。

如果非源节点有输入需要处理，并且这些输入根据节点的**输入策略**（如下所述）形成有效的输入集，则该节点处于就绪状态。大多数节点使用默认的输入策略，但某些节点指定不同的策略。

> **注意:** 因为改变输入策略会改变计算器的代码对其输入可预期的保证，所以通常不可能将具有任意输入策略的计算器混合搭配。因此，如果计算器使用了特殊的输入策略，应专门为其编写代码并在合约中声明。

当一个节点变为就绪时，会将一个任务添加到相应的调度队列中，该队列是一个优先级队列。优先级函数目前固定不变，考虑节点的静态属性及其在计算图内的拓扑排序。例如，靠近计算图输出端的节点具有较高优先级，而源节点优先级最低。

每个队列由执行器服务，执行器负责通过调用计算器的代码来实际运行任务。可以提供并配置不同的执行器；这可用于定制执行资源的使用，例如，在低优先级线程上运行某些节点。

## 时间戳同步

MediaPipe 的图执行是去中心化的：没有全局时钟，不同节点可同时处理来自不同时间戳的数据。这允许通过流水线技术实现更高的吞吐量（throughput）。

然而，时间信息对于许多感知工作流非常重要。接收多个输入流的节点通常需要以某种方式协调它们。例如，物体检测器（object detector）可能从一帧图像输出一组边界框（bounding box）列表，该信息可能被馈送到渲染节点，后者应将其与原始帧一起处理。

因此，MediaPipe 框架（framework）的关键责任之一是为节点提供输入同步。在框架机制方面，时间戳的主要作用是用作**同步键**。

此外，MediaPipe 设计支持确定性操作，这在很多场景（测试、模拟、批量处理等）中非常重要，同时允许计算图作者在需要满足实时（real-time）限制的地方放宽确定性。

同步和确定性的两个目标是几个设计选择的基础。值得注意的是，推入给定数据流的数据包必须具有单调递增的时间戳（timestamp）：这不仅仅是对许多节点的有用假设，同步逻辑也依赖于此。每个数据流都有一个**时间戳边界**，这是流上新数据包允许的最低时间戳。当到达时间戳为 `T` 的数据包时，该边界自动前进到 `T+1`，反映单调性要求。这允许框架确切知道，时间戳低于 `T` 的数据包不会再到达。

## 输入策略

同步由各个节点使用节点指定的输入策略在本地处理。

由 [`DefaultInputStreamHandler`](https://github.com/google/mediapipe/tree/master/mediapipe/framework/stream_handler/default_input_stream_handler.h) 定义的默认输入策略提供输入的确定性同步，并具有以下保证：

* 如果在多个输入流上提供了相同时间戳的数据包，不论它们在实时中到达的先后顺序，它们将始终一起处理。
* 输入集严格按升序时间戳顺序进行处理。
* 没有数据包丢失，处理是完全确定性的。
* 在给定上述保证的情况下，节点会尽快就绪以处理数据。

> **注意:** 这带来的一个重要结果是，如果计算器在输出数据包时始终使用当前输入时间戳，输出必定符合单调递增的时间戳要求。

> **警告:** 另一方面，这不能保证一个输入数据包始终适用于所有数据流。

为了说明它的工作原理，我们需要引入已确定时间戳的定义。如果某个数据流中的时间戳低于时间戳边界，我们说该时间戳在流中*已确定*。换句话说，只要输入处于那个时间戳的状态无可挽回地确定了（要么有一个包，要么确定那个时间戳不会到达任何包），流的这个时间戳就已确定。

> **注意:** 出于该原因，MediaPipe 还允许流生产者显式推动时间戳边界，使其远超最后一个数据包隐含的边界，即提供更紧的边界。这可使下游节点更快确定其输入。

如果在跨多个流时该时间戳在每一个流上均已确定，则该时间戳就被称为已确定。此外，如果某个时间戳已确定，它意味着所有以前的时间戳也都已确定。因此已确定时间戳可以确定性地按升序处理。

根据这一定义，一个使用默认输入策略的计算器当且仅当存在一个所有输入流都已确定、且至少在一个输入流上包含数据包的时间戳时，才会变为就绪。该输入策略将单个已确定时间戳对应的所有可用数据包作为单一的*输入集*提供给计算器。

由于这种确定性行为，针对具多个输入流的节点，在一个时间戳变得已确定前，理论上可能会产生无限制的等待，且在此期间可能缓冲无限量的数据包。（考虑一个具两个输入流的节点，其中一个持续发送数据包，而另一个什么也不发送并且不推进边界。）

因此，我们也提供自定义输入策略：例如，根据 [`SyncSetInputStreamHandler`](https://github.com/google/mediapipe/tree/master/mediapipe/framework/stream_handler/sync_set_input_stream_handler.cc) 定义将输入分割到不同同步集中，或者由 [`ImmediateInputStreamHandler`](https://github.com/google/mediapipe/tree/master/mediapipe/framework/stream_handler/immediate_input_stream_handler.cc) 定义的那样，完全避免同步并在输入到达时立即处理它们。

## 流量控制

有两种主要流量控制机制。背压机制会在数据流缓冲的数据包达到一个由 [`CalculatorGraphConfig::max_queue_size`](https://github.com/google/mediapipe/tree/master/mediapipe/framework/calculator.proto) 定义的（可配置）上限时，限制上游节点的执行。此机制保持确定行为，并且包含一个死锁避免系统，在必要时放宽所配置的限制。

第二个系统包括插入特定节点，能根据实时（real-time）约束（通常用自定义输入策略）丢弃数据包，这由 [`FlowLimiterCalculator`](https://github.com/google/mediapipe/tree/master/mediapipe/calculators/core/flow_limiter_calculator.cc) 所定义。例如，一种常见的模式将一个流控节点放置在子图（subgraph）输入端，并且有一条从最终输出到此流控节点的回环连接。这样，流控节点就能跟踪下游计算图处理了多少时间戳，并且在计数达到（可配置）限制时丢弃数据包；因为数据包是在上游丢弃的，所以避免了因部分处理一个时间戳并在中间阶段之后丢弃数据包而浪费计算资源。

这种基于计算器的机制能赋予计算图作者指定在哪丢弃数据包的控制权，并允许根据资源约束灵活适应和定制图行为。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*