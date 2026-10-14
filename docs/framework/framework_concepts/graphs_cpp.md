---
title: "使用 C++ 构建计算图 (Building Graphs in C++)"
original_url: "https://developers.google.com/edge/mediapipe/framework/framework_concepts/graphs_cpp"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-05-28 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 使用 C++ 构建计算图 (Building Graphs in C++)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/framework/framework_concepts/graphs_cpp)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

C++ 计算图构建器(graph builder)是一个强大的工具,可用于:

-   构建复杂计算图
-   参数化计算图(例如在 `InferenceCalculator` 上设置委托、启用/禁用计算图的部分功能)
-   计算图去重(例如,无需为 CPU 和 GPU 各自维护专门的 pbtxt 计算图,而是用单一代码构造所需的计算图,尽可能多地共享)
-   支持可选的计算图输入/输出
-   按平台定制计算图

## 基本用法 (Basic Usage)

让我们看看如何为一个简单的计算图使用 C++ 计算图构建器:

```
# Graph inputs.
# 计算图输入。
input_stream: "input_tensors"
input_side_packet: "model"

# Graph outputs.
# 计算图输出。
output_stream: "output_tensors"

node {
  calculator: "InferenceCalculator"
  input_stream: "TENSORS:input_tensors"
  input_side_packet: "MODEL:model"
  output_stream: "TENSORS:output_tensors"
  options: {
    [drishti.InferenceCalculatorOptions.ext] {
      # Requesting GPU delegate.
      # 请求使用 GPU 委托。
      delegate { gpu {} }
    }
  }
}
```

构建上述 `CalculatorGraphConfig` 的函数可能如下所示:

```
CalculatorGraphConfig BuildGraph() {
  Graph graph;

  // Graph inputs.
  // 计算图输入。
  Stream<std::vector<Tensor>> input_tensors =
      graph.In(0).SetName("input_tensors").Cast<std::vector<Tensor>>();
  SidePacket<TfLiteModelPtr> model =
      graph.SideIn(0).SetName("model").Cast<TfLiteModelPtr>();

  auto& inference_node = graph.AddNode("InferenceCalculator");
  auto& inference_opts =
      inference_node.GetOptions<InferenceCalculatorOptions>();
  // Requesting GPU delegate.
  // 请求使用 GPU 委托。
  inference_opts.mutable_delegate()->mutable_gpu();
  input_tensors.ConnectTo(inference_node.In("TENSORS"));
  model.ConnectTo(inference_node.SideIn("MODEL"));
  Stream<std::vector<Tensor>> output_tensors =
      inference_node.Out("TENSORS").Cast<std::vector<Tensor>>();

  // Graph outputs.
  // 计算图输出。
  output_tensors.SetName("output_tensors").ConnectTo(graph.Out(0));

  // Get `CalculatorGraphConfig` to pass it into `CalculatorGraph`
  // 获取 `CalculatorGraphConfig` 以便传入 `CalculatorGraph`。
  return graph.GetConfig();
}
```

简要总结:

-   使用 `Graph::In/SideIn` 将计算图输入获取为 `Stream/SidePacket`(数据流/边包)
-   使用 `Node::Out/SideOut` 将节点输出获取为 `Stream/SidePacket`
-   使用 `Stream/SidePacket::ConnectTo` 将数据流和边包连接到节点输入(`Node::In/SideIn`)与计算图输出(`Graph::Out/SideOut`)
    -   有一个 "快捷" 运算符 `>>` 可以代替 `ConnectTo` 函数使用(例如 `x >> node.In("IN")`)。
-   `Stream/SidePacket::Cast` 用于将 `AnyType` 的数据流或边包(例如 `Stream<AnyType> in = graph.In(0);`)转换为特定类型
    -   使用实际类型而不是 `AnyType`,可以让你更好地发挥计算图构建器的能力,并提高计算图的可读性。

## 高级用法 (Advanced Usage)

### 工具函数 (Utility Functions)

让我们把推理构造代码提取为专门的工具函数,以提高可读性和代码复用:

```
// Updates graph to run inference.
// 更新计算图以运行推理。
Stream<std::vector<Tensor>> RunInference(
    Stream<std::vector<Tensor>> tensors, SidePacket<TfLiteModelPtr> model,
    const InferenceCalculatorOptions::Delegate& delegate, Graph& graph) {
  auto& inference_node = graph.AddNode("InferenceCalculator");
  auto& inference_opts =
      inference_node.GetOptions<InferenceCalculatorOptions>();
  *inference_opts.mutable_delegate() = delegate;
  tensors.ConnectTo(inference_node.In("TENSORS"));
  model.ConnectTo(inference_node.SideIn("MODEL"));
  return inference_node.Out("TENSORS").Cast<std::vector<Tensor>>();
}

CalculatorGraphConfig BuildGraph() {
  Graph graph;

  // Graph inputs.
  // 计算图输入。
  Stream<std::vector<Tensor>> input_tensors =
      graph.In(0).SetName("input_tensors").Cast<std::vector<Tensor>>();
  SidePacket<TfLiteModelPtr> model =
      graph.SideIn(0).SetName("model").Cast<TfLiteModelPtr>();

  InferenceCalculatorOptions::Delegate delegate;
  delegate.mutable_gpu();
  Stream<std::vector<Tensor>> output_tensors =
      RunInference(input_tensors, model, delegate, graph);

  // Graph outputs.
  // 计算图输出。
  output_tensors.SetName("output_tensors").ConnectTo(graph.Out(0));

  return graph.GetConfig();
}
```

这样一来,`RunInference` 提供了一个清晰的接口,说明了输入/输出是什么以及它们的类型。

它很容易被复用,例如,如果你想运行额外的模型推理,只需要很少几行:

  ```
  // Run first inference.
  // 运行第一次推理。
  Stream<std::vector<Tensor>> output_tensors =
      RunInference(input_tensors, model, delegate, graph);
  // Run second inference on the output of the first one.
  // 在第一次推理的输出上运行第二次推理。
  Stream<std::vector<Tensor>> extra_output_tensors =
      RunInference(output_tensors, extra_model, delegate, graph);
```

而且你不需要重复名称和标签(`InferenceCalculator`、`TENSORS`、`MODEL`),也不必在这里或那里引入专用常量——这些细节都局部化在 `RunInference` 函数中。

> **提示:** 将 `RunInference` 及类似函数提取到专用模块(例如依赖推理计算器的 inference.h/cc)中,可以在计算图构造代码中实现复用,并有助于自动引入计算器依赖(例如无需手动添加 `:inference_calculator` 依赖,只需让 IDE 包含 `inference.h`,构建系统就会自动引入相应依赖)。

### 工具类 (Utility Classes)

当然,这不仅仅是函数的问题,在某些情况下,引入工具类(utility classes)会大有裨益,它可以让你的计算图构造代码更具可读性、更不易出错。

MediaPipe 提供了 `PassThroughCalculator` 计算器,它简单地透传其输入:

```
input_stream: "float_value"
input_stream: "int_value"
input_stream: "bool_value"

output_stream: "passed_float_value"
output_stream: "passed_int_value"
output_stream: "passed_bool_value"

node {
  calculator: "PassThroughCalculator"
  input_stream: "float_value"
  input_stream: "int_value"
  input_stream: "bool_value"
  # The order must be the same as for inputs (or you can use explicit indexes)
  # 顺序必须与输入相同(或者可以使用显式索引)
  output_stream: "passed_float_value"
  output_stream: "passed_int_value"
  output_stream: "passed_bool_value"
}
```

让我们看看用于创建上述计算图的直接了当的 C++ 构造代码:

```
CalculatorGraphConfig BuildGraph() {
  Graph graph;

  // Graph inputs.
  // 计算图输入。
  Stream<float> float_value = graph.In(0).SetName("float_value").Cast<float>();
  Stream<int> int_value = graph.In(1).SetName("int_value").Cast<int>();
  Stream<bool> bool_value = graph.In(2).SetName("bool_value").Cast<bool>();

  auto& pass_node = graph.AddNode("PassThroughCalculator");
  float_value.ConnectTo(pass_node.In("")[0]);
  int_value.ConnectTo(pass_node.In("")[1]);
  bool_value.ConnectTo(pass_node.In("")[2]);
  Stream<float> passed_float_value = pass_node.Out("")[0].Cast<float>();
  Stream<int> passed_int_value = pass_node.Out("")[1].Cast<int>();
  Stream<bool> passed_bool_value = pass_node.Out("")[2].Cast<bool>();

  // Graph outputs.
  // 计算图输出。
  passed_float_value.SetName("passed_float_value").ConnectTo(graph.Out(0));
  passed_int_value.SetName("passed_int_value").ConnectTo(graph.Out(1));
  passed_bool_value.SetName("passed_bool_value").ConnectTo(graph.Out(2));

  // Get `CalculatorGraphConfig` to pass it into `CalculatorGraph`
  // 获取 `CalculatorGraphConfig` 以便传入 `CalculatorGraph`。
  return graph.GetConfig();
}
```

虽然 `pbtxt` 表示形式可能容易出错(当我们要透传的输入很多时),C++ 代码看起来更糟:重复的空标签和 `Cast` 调用。让我们通过引入一个 `PassThroughNodeBuilder` 来看看如何做得更好:

```
class PassThroughNodeBuilder {
 public:
  explicit PassThroughNodeBuilder(Graph& graph)
      : node_(graph.AddNode("PassThroughCalculator")) {}

  template <typename T>
  Stream<T> PassThrough(Stream<T> stream) {
    stream.ConnectTo(node_.In(index_));
    return node_.Out(index_++).Cast<T>();
  }

 private:
  int index_ = 0;
  GenericNode& node_;
};
```

现在,计算图构造代码可以写成这样:

```
CalculatorGraphConfig BuildGraph() {
  Graph graph;

  // Graph inputs.
  // 计算图输入。
  Stream<float> float_value = graph.In(0).SetName("float_value").Cast<float>();
  Stream<int> int_value = graph.In(1).SetName("int_value").Cast<int>();
  Stream<bool> bool_value = graph.In(2).SetName("bool_value").Cast<bool>();

  PassThroughNodeBuilder pass_node_builder(graph);
  Stream<float> passed_float_value = pass_node_builder.PassThrough(float_value);
  Stream<int> passed_int_value = pass_node_builder.PassThrough(int_value);
  Stream<bool> passed_bool_value = pass_node_builder.PassThrough(bool_value);

  // Graph outputs.
  // 计算图输出。
  passed_float_value.SetName("passed_float_value").ConnectTo(graph.Out(0));
  passed_int_value.SetName("passed_int_value").ConnectTo(graph.Out(1));
  passed_bool_value.SetName("passed_bool_value").ConnectTo(graph.Out(2));

  // Get `CalculatorGraphConfig` to pass it into `CalculatorGraph`
  // 获取 `CalculatorGraphConfig` 以便传入 `CalculatorGraph`。
  return graph.GetConfig();
}
```

现在,你的透传构造代码不可能出现错误的顺序或索引,并且可以通过 `PassThrough` 的输入推断出 `Cast` 的类型,从而省去一些输入。

> **提示:** 与 `RunInference` 函数一样,将 `PassThroughNodeBuilder` 及类似的工具类提取到专用模块中,可以在计算图构造代码中实现复用,并有助于自动引入相应的计算器依赖。

## 该做与不该做 (Dos and Don'ts)

### 尽可能在最开始定义计算图输入 (Define graph inputs at the very beginning if possible)

在下面的代码中:

-   可能很难猜出计算图中有多少个输入。
-   整体上容易出错,并且将来难以维护(例如,索引是否正确?名称是否正确?如果某些输入被移除或变成可选会怎样?等等)。
-   `RunSomething` 的复用受限,因为其他计算图可能有不同的输入

不该做——错误代码示例。

```
Stream<D> RunSomething(Stream<A> a, Stream<B> b, Graph& graph) {
  Stream<C> c = graph.In(2).SetName("c").Cast<C>();  // Bad.
  // ...
}

CalculatorGraphConfig BuildGraph() {
  Graph graph;

  Stream<A> a = graph.In(0).SetName("a").Cast<A>();
  // 10/100/N lines of code.
  // 10/100/N 行代码。
  Stream<B> b = graph.In(1).SetName("b").Cast<B>()  // Bad.
  Stream<D> d = RunSomething(a, b, graph);
  // ...

  return graph.GetConfig();
}

```

相反,应该在计算图构建器的开头定义计算图输入:

该做——良好代码示例。

```
Stream<D> RunSomething(Stream<A> a, Stream<B> b, Stream<C> c, Graph& graph) {
  // ...
}

CalculatorGraphConfig BuildGraph() {
  Graph graph;

  // Inputs.
  // 输入。
  Stream<A> a = graph.In(0).SetName("a").Cast<A>();
  Stream<B> b = graph.In(1).SetName("b").Cast<B>();
  Stream<C> c = graph.In(2).SetName("c").Cast<C>();

  // 10/100/N lines of code.
  // 10/100/N 行代码。
  Stream<D> d = RunSomething(a, b, c, graph);
  // ...

  return graph.GetConfig();
}
```

如果你有并非始终定义的输入流或边包,请使用 `std::optional`,并将其放在最开头:

该做——良好代码示例。

```
std::optional<Stream<A>> a;
if (needs_a) {
  a = graph.In(0).SetName(a).Cast<A>();
}
```

> **注意:** 当然,也可能存在例外情况——例如,可能有这样的用例:调用 `RunSomething1(..., graph)`, ..., `RunSomethingN(..., graph)` **是为了添加新的输入**,这样之后你可以遍历这些输入,并且只把新增的输入送入计算图。不过,无论如何,都要尽量让读者容易弄清计算图有或可能有哪些输入。

### 在最后定义计算图输出 (Define graph outputs at the very end)

在下面的代码中:

-   可能很难猜出计算图中有多少个输出。
-   整体上容易出错,并且将来难以维护(例如,索引是否正确?名称是否正确?如果某些输出被移除或变成可选会怎样?等等)。
-   `RunSomething` 的复用受限,因为其他计算图可能有不同的输出

不该做——错误代码示例。

```
void RunSomething(Stream<Input> input, Graph& graph) {
  // ...
  node.Out("OUTPUT_F")
      .SetName("output_f").ConnectTo(graph.Out(2));  // Bad.
}

CalculatorGraphConfig BuildGraph() {
  Graph graph;

  // 10/100/N lines of code.
  // 10/100/N 行代码。
  node.Out("OUTPUT_D")
      .SetName("output_d").ConnectTo(graph.Out(0));  // Bad.
  // 10/100/N lines of code.
  // 10/100/N 行代码。
  node.Out("OUTPUT_E")
      .SetName("output_e").ConnectTo(graph.Out(1));  // Bad.
  // 10/100/N lines of code.
  // 10/100/N 行代码。
  RunSomething(input, graph);
  // ...

  return graph.GetConfig();
}
```

相反,应该在计算图构建器的最后定义计算图输出:

该做——良好代码示例。

```
Stream<F> RunSomething(Stream<Input> input, Graph& graph) {
  // ...
  return node.Out("OUTPUT_F").Cast<F>();
}

CalculatorGraphConfig BuildGraph() {
  Graph graph;

  // 10/100/N lines of code.
  // 10/100/N 行代码。
  Stream<D> d = node.Out("OUTPUT_D").Cast<D>();
  // 10/100/N lines of code.
  // 10/100/N 行代码。
  Stream<E> e = node.Out("OUTPUT_E").Cast<E>();
  // 10/100/N lines of code.
  // 10/100/N 行代码。
  Stream<F> f = RunSomething(input, graph);
  // ...

  // Outputs.
  // 输出。
  d.SetName("output_d").ConnectTo(graph.Out(0));
  e.SetName("output_e").ConnectTo(graph.Out(1));
  f.SetName("output_f").ConnectTo(graph.Out(2));

  return graph.GetConfig();
}
```

### 保持节点之间解耦 (Keep nodes decoupled from each other)

在 MediaPipe 中,数据包流和边包与处理节点一样重要。任何节点的输入需求和输出产物,都是通过它所消费和产生的数据流与边包清晰、独立地表达的。

不该做——错误代码示例。

```
CalculatorGraphConfig BuildGraph() {
  Graph graph;

  // Inputs.
  // 输入。
  Stream<A> a = graph.In(0).Cast<A>();

  auto& node1 = graph.AddNode("Calculator1");
  a.ConnectTo(node1.In("INPUT"));

  auto& node2 = graph.AddNode("Calculator2");
  node1.Out("OUTPUT").ConnectTo(node2.In("INPUT"));  // Bad.

  auto& node3 = graph.AddNode("Calculator3");
  node1.Out("OUTPUT").ConnectTo(node3.In("INPUT_B"));  // Bad.
  node2.Out("OUTPUT").ConnectTo(node3.In("INPUT_C"));  // Bad.

  auto& node4 = graph.AddNode("Calculator4");
  node1.Out("OUTPUT").ConnectTo(node4.In("INPUT_B"));  // Bad.
  node2.Out("OUTPUT").ConnectTo(node4.In("INPUT_C"));  // Bad.
  node3.Out("OUTPUT").ConnectTo(node4.In("INPUT_D"));  // Bad.

  // Outputs.
  // 输出。
  node1.Out("OUTPUT").SetName("b").ConnectTo(graph.Out(0));  // Bad.
  node2.Out("OUTPUT").SetName("c").ConnectTo(graph.Out(1));  // Bad.
  node3.Out("OUTPUT").SetName("d").ConnectTo(graph.Out(2));  // Bad.
  node4.Out("OUTPUT").SetName("e").ConnectTo(graph.Out(3));  // Bad.

  return graph.GetConfig();
}
```

在上述代码中:

-   节点相互耦合,例如 `node4` 知道其输入来自哪里(`node1`、`node2`、`node3`),这使得重构、维护和代码复用变得复杂
    -   这种使用模式相对于 proto 表示形式是一种退步,因为在 proto 中节点默认是解耦的。
-   `node#.Out("OUTPUT")` 调用被重复,可读性受损——你可以使用更清晰的名称,并提供实际类型。

因此,为了修复上述问题,你可以编写如下计算图构造代码:

该做——良好代码示例。

```
CalculatorGraphConfig BuildGraph() {
  Graph graph;

  // Inputs.
  // 输入。
  Stream<A> a = graph.In(0).Cast<A>();

  // `node1` usage is limited to 3 lines below.
  // `node1` 的使用仅限于下面的 3 行。
  auto& node1 = graph.AddNode("Calculator1");
  a.ConnectTo(node1.In("INPUT"));
  Stream<B> b = node1.Out("OUTPUT").Cast<B>();

  // `node2` usage is limited to 3 lines below.
  // `node2` 的使用仅限于下面的 3 行。
  auto& node2 = graph.AddNode("Calculator2");
  b.ConnectTo(node2.In("INPUT"));
  Stream<C> c = node2.Out("OUTPUT").Cast<C>();

  // `node3` usage is limited to 4 lines below.
  // `node3` 的使用仅限于下面的 4 行。
  auto& node3 = graph.AddNode("Calculator3");
  b.ConnectTo(node3.In("INPUT_B"));
  c.ConnectTo(node3.In("INPUT_C"));
  Stream<D> d = node3.Out("OUTPUT").Cast<D>();

  // `node4` usage is limited to 5 lines below.
  // `node4` 的使用仅限于下面的 5 行。
  auto& node4 = graph.AddNode("Calculator4");
  b.ConnectTo(node4.In("INPUT_B"));
  c.ConnectTo(node4.In("INPUT_C"));
  d.ConnectTo(node4.In("INPUT_D"));
  Stream<E> e = node4.Out("OUTPUT").Cast<E>();

  // Outputs.
  // 输出。
  b.SetName("b").ConnectTo(graph.Out(0));
  c.SetName("c").ConnectTo(graph.Out(1));
  d.SetName("d").ConnectTo(graph.Out(2));
  e.SetName("e").ConnectTo(graph.Out(3));

  return graph.GetConfig();
}
```

现在,如果需要,你可以轻松移除 `node1` 并把 `b` 变成计算图输入,而无需更新 `node2`、`node3`、`node4`(顺便说一下,这与 proto 表示形式一样),因为它们彼此解耦。

总的来说,上述代码更贴近 proto 计算图:

```
input_stream: "a"

node {
  calculator: "Calculator1"
  input_stream: "INPUT:a"
  output_stream: "OUTPUT:b"
}

node {
  calculator: "Calculator2"
  input_stream: "INPUT:b"
  output_stream: "OUTPUT:C"
}

node {
  calculator: "Calculator3"
  input_stream: "INPUT_B:b"
  input_stream: "INPUT_C:c"
  output_stream: "OUTPUT:d"
}

node {
  calculator: "Calculator4"
  input_stream: "INPUT_B:b"
  input_stream: "INPUT_C:c"
  input_stream: "INPUT_D:d"
  output_stream: "OUTPUT:e"
}

output_stream: "b"
output_stream: "c"
output_stream: "d"
output_stream: "e"
```

除此之外,现在你还可以提取工具函数,以便在其他计算图中进一步复用:

该做——良好代码示例。

```
Stream<B> RunCalculator1(Stream<A> a, Graph& graph) {
  auto& node = graph.AddNode("Calculator1");
  a.ConnectTo(node.In("INPUT"));
  return node.Out("OUTPUT").Cast<B>();
}

Stream<C> RunCalculator2(Stream<B> b, Graph& graph) {
  auto& node = graph.AddNode("Calculator2");
  b.ConnectTo(node.In("INPUT"));
  return node.Out("OUTPUT").Cast<C>();
}

Stream<D> RunCalculator3(Stream<B> b, Stream<C> c, Graph& graph) {
  auto& node = graph.AddNode("Calculator3");
  b.ConnectTo(node.In("INPUT_B"));
  c.ConnectTo(node.In("INPUT_C"));
  return node.Out("OUTPUT").Cast<D>();
}

Stream<E> RunCalculator4(Stream<B> b, Stream<C> c, Stream<D> d, Graph& graph) {
  auto& node = graph.AddNode("Calculator4");
  b.ConnectTo(node.In("INPUT_B"));
  c.ConnectTo(node.In("INPUT_C"));
  d.ConnectTo(node.In("INPUT_D"));
  return node.Out("OUTPUT").Cast<E>();
}

CalculatorGraphConfig BuildGraph() {
  Graph graph;

  // Inputs.
  // 输入。
  Stream<A> a = graph.In(0).Cast<A>();

  Stream<B> b = RunCalculator1(a, graph);
  Stream<C> c = RunCalculator2(b, graph);
  Stream<D> d = RunCalculator3(b, c, graph);
  Stream<E> e = RunCalculator4(b, c, d, graph);

  // Outputs.
  // 输出。
  b.SetName("b").ConnectTo(graph.Out(0));
  c.SetName("c").ConnectTo(graph.Out(1));
  d.SetName("d").ConnectTo(graph.Out(2));
  e.SetName("e").ConnectTo(graph.Out(3));

  return graph.GetConfig();
}
```

### 分隔节点以提高可读性 (Separate nodes for better readability)

不该做——错误代码示例。

```
CalculatorGraphConfig BuildGraph() {
  Graph graph;

  // Inputs.
  // 输入。
  Stream<A> a = graph.In(0).Cast<A>();
  auto& node1 = graph.AddNode("Calculator1");
  a.ConnectTo(node1.In("INPUT"));
  Stream<B> b = node1.Out("OUTPUT").Cast<B>();
  auto& node2 = graph.AddNode("Calculator2");
  b.ConnectTo(node2.In("INPUT"));
  Stream<C> c = node2.Out("OUTPUT").Cast<C>();
  auto& node3 = graph.AddNode("Calculator3");
  b.ConnectTo(node3.In("INPUT_B"));
  c.ConnectTo(node3.In("INPUT_C"));
  Stream<D> d = node3.Out("OUTPUT").Cast<D>();
  auto& node4 = graph.AddNode("Calculator4");
  b.ConnectTo(node4.In("INPUT_B"));
  c.ConnectTo(node4.In("INPUT_C"));
  d.ConnectTo(node4.In("INPUT_D"));
  Stream<E> e = node4.Out("OUTPUT").Cast<E>();
  // Outputs.
  // 输出。
  b.SetName("b").ConnectTo(graph.Out(0));
  c.SetName("c").ConnectTo(graph.Out(1));
  d.SetName("d").ConnectTo(graph.Out(2));
  e.SetName("e").ConnectTo(graph.Out(3));

  return graph.GetConfig();
}
```

在上述代码中,很难看出每个节点的起止位置。为了改善这一点并帮助阅读代码的人,你可以简单地在每个节点的前后加上空行:

该做——良好代码示例。

```
CalculatorGraphConfig BuildGraph() {
  Graph graph;

  // Inputs.
  // 输入。
  Stream<A> a = graph.In(0).Cast<A>();

  auto& node1 = graph.AddNode("Calculator1");
  a.ConnectTo(node1.In("INPUT"));
  Stream<B> b = node1.Out("OUTPUT").Cast<B>();

  auto& node2 = graph.AddNode("Calculator2");
  b.ConnectTo(node2.In("INPUT"));
  Stream<C> c = node2.Out("OUTPUT").Cast<C>();

  auto& node3 = graph.AddNode("Calculator3");
  b.ConnectTo(node3.In("INPUT_B"));
  c.ConnectTo(node3.In("INPUT_C"));
  Stream<D> d = node3.Out("OUTPUT").Cast<D>();

  auto& node4 = graph.AddNode("Calculator4");
  b.ConnectTo(node4.In("INPUT_B"));
  c.ConnectTo(node4.In("INPUT_C"));
  d.ConnectTo(node4.In("INPUT_D"));
  Stream<E> e = node4.Out("OUTPUT").Cast<E>();

  // Outputs.
  // 输出。
  b.SetName("b").ConnectTo(graph.Out(0));
  c.SetName("c").ConnectTo(graph.Out(1));
  d.SetName("d").ConnectTo(graph.Out(2));
  e.SetName("e").ConnectTo(graph.Out(3));

  return graph.GetConfig();
}
```

此外,上述表示形式与 `CalculatorGraphConfig` proto 表示形式更加一致。

如果你把节点提取到工具函数中,它们已经在函数内有了作用域,起止位置很清楚,因此完全可以这样写:

该做——良好代码示例。

```
CalculatorGraphConfig BuildGraph() {
  Graph graph;

  // Inputs.
  // 输入。
  Stream<A> a = graph.In(0).Cast<A>();

  Stream<B> b = RunCalculator1(a, graph);
  Stream<C> c = RunCalculator2(b, graph);
  Stream<D> d = RunCalculator3(b, c, graph);
  Stream<E> e = RunCalculator4(b, c, d, graph);

  // Outputs.
  // 输出。
  b.SetName("b").ConnectTo(graph.Out(0));
  c.SetName("c").ConnectTo(graph.Out(1));
  d.SetName("d").ConnectTo(graph.Out(2));
  e.SetName("e").ConnectTo(graph.Out(3));

  return graph.GetConfig();
}
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*