---
title: "数据包 (Packets)"
original_url: "https://developers.google.com/edge/mediapipe/framework/framework_concepts/packets"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2024-05-01 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 数据包 (Packets)

> 本文译自官方文档：[原文链接](https://developers.google.com/edge/mediapipe/framework/framework_concepts/packets)
> 为保持内容与版式一致，图片位置、章节顺序、代码示例均与原页对齐。

计算器（calculator）通过发送和接收数据包（packet）来进行通信。通常，在每个输入时间戳（timestamp）处，会沿着每个输入流（input stream）发送单个数据包。数据包可以包含任何类型的数据，例如单帧视频或单个整数检测计数。

## 创建数据包

数据包通常使用 `mediapipe::MakePacket<T>()` 或 `mediapipe::Adopt()`（来自 `packet.h`）创建。

```cpp
// 创建包含一些新数据的数据包。
Packet p = MakePacket<MyDataClass>("constructor_argument");
// 使用相同数据和不同时间戳创建新数据包。
Packet p2 = p.At(Timestamp::PostStream());
```

或者：

```cpp
// 创建一些新数据。
auto data = absl::make_unique<MyDataClass>("constructor_argument");
// 创建拥有该数据的数据包。
Packet p = Adopt(data.release()).At(Timestamp::PostStream());
```

使用 `Packet::Get<T>()` 访问数据包内的数据。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可；代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*