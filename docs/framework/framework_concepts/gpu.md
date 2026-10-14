---
title: "GPU (GPU)"
original_url: "https://developers.google.com/edge/mediapipe/framework/framework_concepts/gpu"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2024-05-01 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# GPU (GPU)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/framework/framework_concepts/gpu)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

## 概览

MediaPipe 支持用于 GPU 计算与渲染的计算器（calculator）节点（node），并允许组合多个 GPU 节点，以及将它们与基于 CPU 的计算器节点混合使用。移动平台上存在多种 GPU API（例如，OpenGL ES、Metal 和 Vulkan）。MediaPipe 并不试图提供单一的跨 API 的 GPU 抽象。各个节点可以使用不同的 API 编写，从而在需要时利用平台特定功能。

GPU 支持对于在移动平台上获得良好性能至关重要，尤其是对于实时（real-time）视频。MediaPipe 使开发者能编写兼容 GPU 的计算器，支持使用 GPU 进行以下操作：

* 端侧（on-device）实时处理，而不仅仅是批处理。
* 视频渲染和特效，而不仅仅是分析。

以下是 MediaPipe 中支持 GPU 的设计原则：

* 基于 GPU 的计算器应该能够出现在计算图（graph）中的任何位置，而不一定只用于屏幕渲染。
* 将帧数据从一个基于 GPU 的计算器传输到另一个应该快速，并且不会引起昂贵的复制操作。
* CPU 和 GPU 之间帧数据的传输应尽可能高效，以平台允许的最高效率为准。
* 因为不同平台可能需要不同技术才能达到最佳性能，API 应该允许在幕后实现方式上具有灵活性。
* 应该允许计算器在全部或部分操作中最大程度地灵活使用 GPU，并在必要时将其与 CPU 结合使用。

## OpenGL ES 支持

MediaPipe 在 Android/Linux 上支持最高 3.2 版本的 OpenGL ES，在 iOS 上最高支持 ES 3.0。此外，MediaPipe 也在 iOS 上支持 Metal。

在运行机器学习推理（inference）计算器和计算图时，需要 OpenGL ES 3.1 或更高版本（在 Android/Linux 系统上）。

MediaPipe 允许计算图在多个 GL 上下文中运行 OpenGL。例如，这在将较慢的 GPU 推理路径（例如，10 FPS）与较快的 GPU 渲染路径（例如，30 FPS）结合在一起的计算图中非常有用：由于一个 GL 上下文对应于一个顺序的命令队列，对于这两个任务使用相同的上下文会降低渲染帧率。

MediaPipe 解决使用多个上下文带来的一项挑战，即在多个上下文之间进行通信的能力。例如，在输入视频同时发送到渲染和推理路径，并且渲染需要访问来自推理的最新输出的场景中。

OpenGL 上下文不能由多个线程同时访问。此外，在同一个线程上切换活动的 GL 上下文在某些 Android 设备上可能会很慢。因此，我们的方法是每个上下文有一个专用线程。每个线程发出 GL 命令，在其上下文上构建一个串行命令队列，然后由 GPU 异步执行。

## GPU 计算器的生命周期

本节展示了派生自基类 `GlSimpleCalculator` 的 GPU 计算器的 `Process` 方法的基本结构。此处以 GPU 计算器 `LuminanceCalculator` 作为示例。方法 `LuminanceCalculator::GlRender` 从 `GlSimpleCalculator::Process` 中调用。

```cpp
// 将 RGB 图像转换为亮度图像，仍以 RGB 格式存储。
// 有关输入、输出和输入边包的信息，请参阅 GlSimpleCalculator。
class LuminanceCalculator : public GlSimpleCalculator {
 public:
  absl::Status GlSetup() override;
  absl::Status GlRender(const GlTexture& src,
                        const GlTexture& dst) override;
  absl::Status GlTeardown() override;

 private:
  GLuint program_ = 0;
  GLint frame_;
};
REGISTER_CALCULATOR(LuminanceCalculator);

absl::Status LuminanceCalculator::GlRender(const GlTexture& src,
                                           const GlTexture& dst) {
  static const GLfloat square_vertices[] = {
      -1.0f, -1.0f,  // bottom left
      1.0f,  -1.0f,  // bottom right
      -1.0f, 1.0f,   // top left
      1.0f,  1.0f,   // top right
  };
  static const GLfloat texture_vertices[] = {
      0.0f, 0.0f,  // bottom left
      1.0f, 0.0f,  // bottom right
      0.0f, 1.0f,  // top left
      1.0f, 1.0f,  // top right
  };

  // program
  glUseProgram(program_);
  glUniform1i(frame_, 1);

  // vertex storage
  GLuint vbo[2];
  glGenBuffers(2, vbo);
  GLuint vao;
  glGenVertexArrays(1, &vao);
  glBindVertexArray(vao);

  // vbo 0
  glBindBuffer(GL_ARRAY_BUFFER, vbo[0]);
  glBufferData(GL_ARRAY_BUFFER, 4 * 2 * sizeof(GLfloat), square_vertices,
               GL_STATIC_DRAW);
  glEnableVertexAttribArray(ATTRIB_VERTEX);
  glVertexAttribPointer(ATTRIB_VERTEX, 2, GL_FLOAT, 0, 0, nullptr);

  // vbo 1
  glBindBuffer(GL_ARRAY_BUFFER, vbo[1]);
  glBufferData(GL_ARRAY_BUFFER, 4 * 2 * sizeof(GLfloat), texture_vertices,
               GL_STATIC_DRAW);
  glEnableVertexAttribArray(ATTRIB_TEXTURE_POSITION);
  glVertexAttribPointer(ATTRIB_TEXTURE_POSITION, 2, GL_FLOAT, 0, 0, nullptr);

  // draw
  glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);

  // cleanup
  glDisableVertexAttribArray(ATTRIB_VERTEX);
  glDisableVertexAttribArray(ATTRIB_TEXTURE_POSITION);
  glBindBuffer(GL_ARRAY_BUFFER, 0);
  glBindVertexArray(0);
  glDeleteVertexArrays(1, &vao);
  glDeleteBuffers(2, vbo);

  return absl::OkStatus();
}
```

前面提到的设计原则确立了 MediaPipe GPU 支持的以下设计选择：

* 我们有一个名为 `GpuBuffer` 的 GPU 数据类型，用于表示图像数据，专为 GPU 使用进行了优化。该数据类型的确切内容是不透明的且特定于平台的。
* 一个基于组合的底层 API，任何想要利用 GPU 的计算器都创建并拥有一个 `GlCalculatorHelper` 类的实例。该类提供与平台无关的 API 以管理 OpenGL 上下文，设置用于输入和输出的纹理等。
* 一个基于子类化的高层 API，实现图像过滤器的简单计算器从 `GlSimpleCalculator` 派生，并且仅需要用它们特定的 OpenGL 代码覆盖一两个虚方法，超类将负责所有底层连接工作。
* 需要在所有基于 GPU 的计算器之间共享的数据将作为通过计算图服务（graph service）实现的外部输入提供，由 `GlCalculatorHelper` 类管理。
* 计算器特定的辅助对象和共享计算图服务的结合为我们管理 GPU 资源提供了极大的灵活性：我们可以让每个计算器具有单独的上下文、共享单一上下文、共享锁或其他同步原语等 —— 所有这些都由辅助对象管理并对单个计算器隐藏。

## GpuBuffer 到 ImageFrame 转换器

我们提供两个名为 `GpuBufferToImageFrameCalculator` 和 `ImageFrameToGpuBufferCalculator` 的计算器。这些计算器在 `ImageFrame` 和 `GpuBuffer` 之间进行转换，允许构建结合了 GPU 和 CPU 计算器的计算图。它们在 iOS 和 Android 上均受到支持。

可能的话，这些计算器使用平台特定的功能在 CPU 和 GPU 之间共享数据而不进行复制。

下面的图表展示了捕获摄像机视频的移动应用程序中的数据流（data flow），它在 MediaPipe 计算图中运行它，并在屏幕上实时渲染输出。虚线表明哪些部分在严格意义上的 MediaPipe 计算图内部。此应用程序在 CPU 上使用 OpenCV 运行 Canny 边缘检测过滤器，并在 GPU 上将其叠加到原始视频上。

![GPU 计算器如何交互](https://mediapipe.dev/images/gpu_example_graph.png)<!-- 图片下载失败,保留原链接 -->

来自摄像机的视频帧（frame）作为 `GpuBuffer` 数据包（packet）馈送到计算图中。该输入流（input stream）被两个计算器并行访问。
`GpuBufferToImageFrameCalculator` 将缓冲区转换为 `ImageFrame`，之后其被送过灰度转换器和 canny 过滤器（都基于 OpenCV 并在 CPU 上运行），其输出再被转换为 `GpuBuffer`。多输入的 GPU 计算器 `GlOverlayCalculator` 将原始的 `GpuBuffer` 和边缘检测器输出的那个同时作为输入，并使用着色器（shader）叠加它们。输出被通过回调计算器送回应用程序，且应用程序利用 OpenGL 将图像渲染到屏幕上。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*