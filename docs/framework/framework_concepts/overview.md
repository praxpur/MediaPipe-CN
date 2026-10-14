---
title: "框架概念 (Framework Concepts)"
original_url: "https://developers.google.com/edge/mediapipe/framework/framework_concepts/overview"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-05-28 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 框架概念 (Framework Concepts)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/framework/framework_concepts/overview)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

在使用 MediaPipe Framework 之前,请先熟悉以下概念。

## 基础知识 (The basics)

### 数据包 (Packet)

数据流的基本单位。数据包由一个数值型时间戳和一个指向**不可变**载荷的共享指针组成。载荷可以是任何 C++ 类型,载荷的类型也称为数据包的类型。数据包是值类型,可以廉价复制。每个副本共享载荷的所有权,采用引用计数语义。每个副本都有自己的时间戳。另请参阅[数据包 (Packets)](packets.md)。

### 计算图 (Graph)

MediaPipe 的处理发生在计算图内部,计算图定义了**节点**之间的数据包流动路径。一个计算图可以有任意数量的输入和输出,数据流可以分支和合并。通常数据向前流动,但也可能存在向后的循环。详见[计算图 (Graphs)](graphs.md)。

### 节点 (Nodes)

节点产生和/或消耗数据包,它们是计算图大部分工作发生的地方。由于历史原因,它们也被称为"计算器 (calculators)"。每个节点的接口定义了一定数量的输入和输出**端口**,端口通过标签 (tag) 和/或索引 (index) 标识。详见[计算器 (Calculators)](calculators.md)。

### 数据流 (Streams)

数据流是两个节点之间的连接,它承载一系列数据包,这些数据包的时间戳必须单调递增。

### 边包 (Side packets)

节点之间的边包连接承载单个数据包(时间戳未指定)。它可以用来提供一些保持不变的数据,而数据流则表示随时间变化的数据流。

### 数据包端口 (Packet Ports)

端口具有关联的类型;通过端口传输的数据包必须是该类型。一个输出流端口可以连接到任意数量的同类型输入流端口;每个消费者都会收到输出数据包的独立副本,并拥有自己的队列,因此可以按自己的节奏使用它们。类似地,一个边包输出端口可以根据需要连接到任意数量的边包输入端口。

端口可以是必需的 (required),意味着必须建立连接计算图才有效;也可以是可选的 (optional),意味着它可以保持未连接。

> **注意:**即使数据流连接是必需的,该数据流也可能不会为所有时间戳都承载数据包。

## 输入与输出 (Input and output)

数据流可以源自**源节点 (source nodes)**,它们没有输入流,会自动产生数据包(例如,通过从文件读取);也可以源自**计算图输入流 (graph input streams)**,它们让应用程序可以向计算图馈送数据包。

类似地,还有**汇节点 (sink nodes)**,它们接收数据并将其写入各种目的地(例如文件、内存缓冲区等),应用程序也可以使用**回调 (callbacks)** 从计算图接收输出。

## 运行时行为 (Runtime behavior)

### 计算图生命周期 (Graph lifetime)

计算图一旦初始化完成,就可以**启动 (started)** 开始处理数据,并且可以处理一串数据包,直到每个数据流关闭或计算图被**取消 (canceled)**。然后计算图可以被销毁或再次**启动**。

### 节点生命周期 (Node lifetime)

框架会在节点上调用三种主要的生命周期方法:

-   Open:在其它方法之前被调用一次。调用时,节点所需的全部输入边包都将是可用的。
-   Process:根据节点的输入策略,在新的输入集可用时被多次调用。
-   Close:在结束时被调用一次。

此外,每个计算器都可以定义构造函数和析构函数,这对于创建和释放与所处理数据无关的资源非常有用。

### 输入策略 (Input policies)

默认的输入策略是按时间戳对数据包进行确定性合并 (deterministic collation)。节点在其 Process 方法的一次调用中同时接收同一时间戳的所有输入;连续的输入集按其时间戳顺序接收。这可能要求延迟处理某些数据包,直到在所有输入流上都收到具有相同时间戳的数据包,或者直到可以保证具有该时间戳的数据包不会到达那些尚未收到它的数据流上。

也可以使用其它策略,这些策略通过一种名为 InputStreamHandler 的独立组件来实现。

更多细节请参阅[同步 (Synchronization)](synchronization.md)。

### 实时数据流 (Real-time streams)

MediaPipe 计算器计算图经常用于处理交互式应用程序的视频或音频帧数据流。通常,每个计算器会在给定时间戳的所有输入数据包可用后立即运行。实时计算图中使用的计算器需要基于输入时间戳边界定义输出时间戳边界,以便下游计算器能够及时被调度。详见[实时数据流 (Real-time Streams)](realtime_streams.md)。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*