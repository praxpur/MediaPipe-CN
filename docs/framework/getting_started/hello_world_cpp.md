---
title: "Hello World!(C++ 入门示例) (Hello World! in C++)"
original_url: "https://developers.google.com/edge/mediapipe/framework/getting_started/hello_world_cpp"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-05-28 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Hello World!(C++ 入门示例) (Hello World! in C++)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/framework/getting_started/hello_world_cpp)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

1. 确保你有可用的 MediaPipe Framework 版本。参见[安装说明](install.md)。
2. 要运行 [`hello world`](https://github.com/google/mediapipe/tree/master/mediapipe/examples/desktop/hello_world/hello_world.cc) 示例:

   ```
   $ git clone https://github.com/google/mediapipe.git
   $ cd mediapipe

   $ export GLOG_logtostderr=1
   # 需要 bazel 标志 'MEDIAPIPE_DISABLE_GPU=1',因为目前桌面端 GPU 不受支持。
   $ bazel run --define MEDIAPIPE_DISABLE_GPU=1 \
       mediapipe/examples/desktop/hello_world:hello_world

   # 它应当打印 10 行 Hello World!
   # Hello World!
   # Hello World!
   # Hello World!
   # Hello World!
   # Hello World!
   # Hello World!
   # Hello World!
   # Hello World!
   # Hello World!
   # Hello World!
   ```
3. [`hello world`](https://github.com/google/mediapipe/tree/master/mediapipe/examples/desktop/hello_world/hello_world.cc) 示例在 `PrintHelloWorld()` 函数中使用了一个简单的 MediaPipe 计算图,该函数定义在 [`CalculatorGraphConfig`](https://github.com/google/mediapipe/tree/master/mediapipe/framework/calculator.proto) proto 中。

   ```
   absl::Status PrintHelloWorld() {
     // 配置一个简单的计算图,该计算图串联了 2 个 PassThroughCalculator。
     CalculatorGraphConfig config = ParseTextProtoOrDie<CalculatorGraphConfig>(R"(
       input_stream: "in"
       output_stream: "out"
       node {
         calculator: "PassThroughCalculator"
         input_stream: "in"
         output_stream: "out1"
       }
       node {
         calculator: "PassThroughCalculator"
         input_stream: "out1"
         output_stream: "out"
       }
     )");
   ```

   你可以通过把下面的 CalculatorGraphConfig 内容粘贴到可视化工具中,使用 [MediaPipe Visualizer](https://viz.mediapipe.dev) 将该计算图可视化。关于可视化工具的帮助,参见[这里](../tools/visualizer.md)。

   ```
       input_stream: "in"
       output_stream: "out"
       node {
         calculator: "PassThroughCalculator"
         input_stream: "in"
         output_stream: "out1"
       }
       node {
         calculator: "PassThroughCalculator"
         input_stream: "out1"
         output_stream: "out"
       }
   ```

   该计算图包含 1 个计算图输入数据流(`in`)和 1 个计算图输出数据流(`out`),以及 2 个串行连接的 [`PassThroughCalculator`](https://github.com/google/mediapipe/tree/master/mediapipe/calculators/core/pass_through_calculator.cc)。

   ![hello_world 计算图](../../../assets/edge/mediapipe/framework/images/hello_world.png)
4. 在运行计算图之前,一个 `OutputStreamPoller` 对象被连接到输出数据流,以便之后取回计算图的输出,然后通过 [`StartRun`](https://github.com/google/mediapipe/tree/master/mediapipe/framework/calculator_graph.h) 启动计算图运行。

   ```
   CalculatorGraph graph;
   MP_RETURN_IF_ERROR(graph.Initialize(config));
   MP_ASSIGN_OR_RETURN(OutputStreamPoller poller,
                       graph.AddOutputStreamPoller("out"));
   MP_RETURN_IF_ERROR(graph.StartRun({}));
   ```
5. 然后,该示例使用 [`MakePacket`](https://github.com/google/mediapipe/tree/master/mediapipe/framework/packet.h) 函数创建 10 个数据包(每个数据包包含字符串 "Hello World!",Timestamp 值从 0, 1, ... 9),通过 `in` 输入数据流将每个数据包加入计算图,最后关闭输入数据流以结束计算图运行。

   ```
   for (int i = 0; i < 10; ++i) {
     MP_RETURN_IF_ERROR(graph.AddPacketToInputStream("in",
                        MakePacket<std::string>("Hello World!").At(Timestamp(i))));
   }
   MP_RETURN_IF_ERROR(graph.CloseInputStream("in"));
   ```
6. 然后,该示例通过 `OutputStreamPoller` 对象从输出数据流取回全部 10 个数据包,从每个数据包中取出字符串内容,并打印到输出日志中。

   ```
   mediapipe::Packet packet;
   while (poller.Next(&packet)) {
     LOG(INFO) << packet.Get<string>();
   }
   ```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*