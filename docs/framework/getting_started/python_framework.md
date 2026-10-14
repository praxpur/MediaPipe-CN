---
title: "Python 中的 MediaPipe Framework (MediaPipe Framework in Python)"
original_url: "https://developers.google.com/edge/mediapipe/framework/getting_started/python_framework"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-05-28 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Python 中的 MediaPipe Framework (MediaPipe Framework in Python)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/framework/getting_started/python_framework)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

MediaPipe Python 框架提供了对 MediaPipe C++ 框架核心组件的直接访问,例如 Timestamp、Packet 和 CalculatorGraph;而开箱即用的 Python solutions 则隐藏了框架的技术细节,只把易读的模型推理结果返回给调用方。

MediaPipe 框架构建在 [pybind11 库](https://pybind11.readthedocs.io/en/stable/index.html) 之上。C++ 核心框架通过 C++/Python 语言绑定暴露给 Python。下面的内容假定读者已经对 MediaPipe C++ 框架有基本的了解。否则,你可以在 [Framework Concepts(框架概念)](../framework_concepts/overview.md) 中找到有用的信息。

### 数据包 (Packet)

数据包是 MediaPipe 中基本的数据流单元。一个数据包由一个数字时间戳和一个指向不可变载荷的共享指针组成。在 Python 中,可以通过调用 [`mp.packet_creator`](https://github.com/google/mediapipe/tree/master/mediapipe/python/pybind/packet_creator.cc) 模块中的数据包创建器方法之一来创建 MediaPipe 数据包。相应地,可以通过使用 [`mp.packet_getter`](https://github.com/google/mediapipe/tree/master/mediapipe/python/pybind/packet_getter.cc) 模块中的数据包获取器方法之一来取回数据包载荷。请注意,数据包载荷在创建后是**不可变**的。因此,修改取回的数据包内容不会影响数据包中真正的载荷。MediaPipe framework Python API 在核心绑定中支持了 MediaPipe 最常用的数据类型(例如 ImageFrame、Matrix、Protocol Buffers,以及原始数据类型)。下表全面展示了 MediaPipe Python framework API 支持的每一种数据类型在 Python 与 C++ 数据类型之间的映射,以及对应的数据包创建器和内容获取器方法。

| Python 数据类型 | C++ 数据类型 | 数据包创建器 | 内容获取器 |
| --- | --- | --- | --- |
| bool | bool | create\_bool(True) | get\_bool(packet) |
| int or np.intc | int\_t | create\_int(1) | get\_int(packet) |
| int or np.int8 | int8\_t | create\_int8(2\*\*7-1) | get\_int(packet) |
| int or np.int16 | int16\_t | create\_int16(2\*\*15-1) | get\_int(packet) |
| int or np.int32 | int32\_t | create\_int32(2\*\*31-1) | get\_int(packet) |
| int or np.int64 | int64\_t | create\_int64(2\*\*63-1) | get\_int(packet) |
| int or np.uint8 | uint8\_t | create\_uint8(2\*\*8-1) | get\_uint(packet) |
| int or np.uint16 | uint16\_t | create\_uint16(2\*\*16-1) | get\_uint(packet) |
| int or np.uint32 | uint32\_t | create\_uint32(2\*\*32-1) | get\_uint(packet) |
| int or np.uint64 | uint64\_t | create\_uint64(2\*\*64-1) | get\_uint(packet) |
| float or np.float32 | float | create\_float(1.1) | get\_float(packet) |
| float or np.double | double | create\_double(1.1) | get\_float(packet) |
| str (UTF-8) | std::string | create\_string('abc') | get\_str(packet) |
| bytes | std::string | create\_string(b'\xd0\xd0\xd0') | get\_bytes(packet) |
| mp.Packet | mp::Packet | create\_packet(p) | get\_packet(packet) |
| List[bool] | std::vector<bool> | create\_bool\_vector([True, False]) | get\_bool\_list(packet) |
| List[int] or List[np.intc] | int[] | create\_int\_array([1, 2, 3]) | get\_int\_list(packet, size=10) |
| List[int] or List[np.intc] | std::vector<int> | create\_int\_vector([1, 2, 3]) | get\_int\_list(packet) |
| List[float] or List[np.float] | float[] | create\_float\_arrary([0.1, 0.2]) | get\_float\_list(packet, size=10) |
| List[float] or List[np.float] | std::vector<float> | create\_float\_vector([0.1, 0.2]) | get\_float\_list(packet, size=10) |
| List[str] | std::vector<std::string> | create\_string\_vector(['a']) | get\_str\_list(packet) |
| List[mp.Packet] | std::vector<mp::Packet> | create\_packet\_vector(         [packet1, packet2]) | get\_packet\_list(p) |
| Mapping[str, Packet] | std::map | create\_string\_to\_packet\_map(         {'a': packet1, 'b': packet2}) | get\_str\_to\_packet\_dict(packet) |
| np.ndarray (cv.mat and PIL.Image) | mp::ImageFrame | create\_image\_frame(         format=ImageFormat.SRGB,         data=mat) | get\_image\_frame(packet) |
| np.ndarray | mp::Matrix | create\_matrix(data) | get\_matrix(packet) |
| Google Proto Message | Google Proto Message | create\_proto(proto) | get\_proto(packet) |
| List[Proto] | std::vector<Proto> | n/a | get\_proto\_list(packet) |

用户创建自定义 C++ 类并把它们送入计算图和计算器,这并不罕见。为了让自定义类可以在 Python 中与 MediaPipe Framework 配合使用,你可以通过以下步骤,为一种新的数据类型扩展 Packet API:

1. 在一个 cc 文件中,为自定义类型编写 pybind11 [类绑定代码](https://pybind11.readthedocs.io/en/stable/advanced/classes.html)或[自定义类型转换器(custom type caster)](https://pybind11.readthedocs.io/en/stable/advanced/cast/custom.html?highlight=custom%20type%20caster)。

   ```
   #include "path/to/my_type/header/file.h"
   #include "pybind11/pybind11.h"

   namespace py = pybind11;

   PYBIND11_MODULE(my_type_binding, m) {
     // Write binding code or a custom type caster for MyType.
     py::class_<MyType>(m, "MyType")
         .def(py::init<>())
         .def(...);
   }
   ```
2. 在另一个 cc 文件中,为自定义类型创建新的数据包创建器和获取器方法。

   ```
   #include "path/to/my_type/header/file.h"
   #include "mediapipe/framework/packet.h"
   #include "pybind11/pybind11.h"

   namespace mediapipe {
   namespace py = pybind11;

   PYBIND11_MODULE(my_packet_methods, m) {
     m.def(
         "create_my_type",
         [](const MyType& my_type) { return MakePacket<MyType>(my_type); });

     m.def(
         "get_my_type",
         [](const Packet& packet) {
           if(!packet.ValidateAsType<MyType>().ok()) {
             PyErr_SetString(PyExc_ValueError, "Packet data type mismatch.");
             return py::error_already_set();
           }
           return packet.Get<MyType>();
         });
   }
   }  // namespace mediapipe
   ```
3. 在 BUILD 文件中,为自定义类型绑定和新的数据包方法添加两条 bazel 构建规则。

   ```
   load("@pybind11_bazel//:build_defs.bzl", "pybind_extension")

   pybind_extension(
       name = "my_type_binding",
       srcs = ["my_type_binding.cc"],
       deps = [":my_type"],
   )

   pybind_extension(
       name = "my_packet_methods",
       srcs = ["my_packet_methods.cc"],
       deps = [
           ":my_type",
           "//mediapipe/framework:packet"
       ],
   )
   ```
4. 用 Bazel 构建 pybind 扩展目标(带 .so 后缀),并把生成的动态库移动到某个 $LD\_LIBRARY\_PATH 目录中。
5. 在 Python 中使用绑定模块。

   ```
   import my_type_binding
   import my_packet_methods

   packet = my_packet_methods.create_my_type(my_type_binding.MyType())
   my_type = my_packet_methods.get_my_type(packet)
   ```

### 时间戳 (Timestamp)

每个数据包都包含一个以微秒为单位的时间戳。在 Python 中,Packet API 提供了便捷方法 `packet.at()` 来定义数据包的数值时间戳。更一般地,`packet.timestamp` 是数据包类中用于访问底层时间戳的属性。要把 Unix 纪元(epoch)转换为 MediaPipe 时间戳,[Timestamp API](https://github.com/google/mediapipe/tree/master/mediapipe/python/pybind/timestamp.cc) 提供了方法 `mp.Timestamp.from_seconds()` 来实现这一目的。

### ImageFrame

ImageFrame 是存储图像或视频帧的容器。ImageFrame 支持的格式列在 [ImageFormat 枚举](https://github.com/google/mediapipe/tree/master/mediapipe/python/pybind/image_frame.cc#l=170)中。像素按行主序(row-major)编码,颜色分量交错排列;ImageFrame 支持 uint8、uint16 和 float 作为其数据类型。MediaPipe 提供了[一个 ImageFrame Python API](https://github.com/google/mediapipe/tree/master/mediapipe/python/pybind/image_frame.cc)来访问 ImageFrame C++ 类。在 Python 中,取回像素数据最简单的方法是调用 `image_frame.numpy_view()` 获得一个 numpy ndarray。请注意,返回的 numpy ndarray 是对内部像素数据的引用,是不可写的。如果调用方需要修改该 numpy ndarray,则必须显式地调用复制操作来获得一份副本。当 MediaPipe 接收 numpy ndarray 来制作 ImageFrame 时,它假定数据是连续存储的。相应地,ImageFrame 的像素数据在返回给 Python 端时会被重新对齐,以保证连续。

### 计算图 (Graph)

在 MediaPipe Framework 中,所有处理都在 CalculatorGraph 的上下文中进行。[CalculatorGraph Python API](https://github.com/google/mediapipe/tree/master/mediapipe/python/pybind/calculator_graph.cc) 是对 C++ CalculatorGraph 类的直接绑定。主要区别在于:当发生错误时,CalculatorGraph Python API 抛出 Python 错误,而不是返回非 OK 的 Status。因此,作为 Python 用户,你可以像平常一样处理异常。CalculatorGraph 的生命周期包含三个阶段:初始化与设置、计算图运行、计算图关闭。

1. 用 CalculatorGraphConfig protobuf 或二进制 protobuf 文件初始化 CalculatorGraph,并提供回调方法以观察输出数据流。

   选项 1:用 CalculatorGraphConfig protobuf 或其文本表示初始化 CalculatorGraph,并观察输出数据流:

   ```
   import mediapipe as mp

   config_text = """
     input_stream: 'in_stream'
     output_stream: 'out_stream'
     node {
       calculator: 'PassThroughCalculator'
       input_stream: 'in_stream'
       output_stream: 'out_stream'
     }
   """
   graph = mp.CalculatorGraph(graph_config=config_text)
   output_packets = []
   graph.observe_output_stream(
       'out_stream',
       lambda stream_name, packet:
           output_packets.append(mp.packet_getter.get_str(packet)))
   ```

   选项 2:用二进制 protobuf 文件初始化 CalculatorGraph,并观察输出数据流。

   ```
   import mediapipe as mp
   # resources dependency

   graph = mp.CalculatorGraph(
       binary_graph=os.path.join(
           resources.GetRunfilesDir(), 'path/to/your/graph.binarypb'))
   graph.observe_output_stream(
       'out_stream',
       lambda stream_name, packet: print(f'Get {packet} from {stream_name}'))
   ```
2. 启动计算图运行,并向计算图喂入数据包。

   ```
   graph.start_run()

   graph.add_packet_to_input_stream(
       'in_stream', mp.packet_creator.create_string('abc').at(0))

   rgb_img = cv2.cvtColor(cv2.imread('/path/to/your/image.png'), cv2.COLOR_BGR2RGB)
   graph.add_packet_to_input_stream(
       'in_stream',
       mp.packet_creator.create_image_frame(image_format=mp.ImageFormat.SRGB,
                                            data=rgb_img).at(1))
   ```
3. 运行结束后关闭计算图。调用 `close()` 之后,你可以重新启动计算图进行另一次运行。

   ```
   graph.close()
   ```

该 Python 脚本可以由你本地的 Python 运行时运行。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*