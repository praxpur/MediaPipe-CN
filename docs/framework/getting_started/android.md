---
title: "Android 上的 MediaPipe Framework (MediaPipe Framework on Android)"
original_url: "https://developers.google.com/edge/mediapipe/framework/getting_started/android"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-05-28 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# Android 上的 MediaPipe Framework (MediaPipe Framework on Android)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/framework/getting_started/android)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

请按照以下说明使用 MediaPipe Framework 构建 Android 示例应用。要了解更多关于这些示例应用的内容,请从 [Android 上的 Hello World!](hello_world_android.md) 开始。

## 使用 Bazel 构建 Android 示例应用 (Building Android example apps with Bazel)

### 前置条件 (Prerequisite)

-   按照这些[说明](install.md) 安装 MediaPipe Framework。
-   安装 Java Runtime。
-   安装 Android SDK release 35.0.0 或更高版本。
-   安装 Android NDK version 28 或更高版本。

MediaPipe 建议通过 Android Studio 设置 Android SDK 和 NDK(Android Studio 的设置方法见下文)。不过,如果你希望在不用 Android Studio 的情况下使用 MediaPipe,请在构建任何 Android 示例应用之前运行 [`setup_android_sdk_and_ndk.sh`](https://github.com/google/mediapipe/blob/master/setup_android_sdk_and_ndk.sh) 来下载并设置 Android SDK 和 NDK。

如果 Android SDK 和 NDK 已经安装(例如由 Android Studio 安装),请设置 `$ANDROID_HOME` 和 `$ANDROID_NDK_HOME` 指向已安装的 SDK 和 NDK。

```
export ANDROID_HOME=<path to the Android SDK>
export ANDROID_NDK_HOME=<path to the Android NDK>
```

并将 `android_ndk_repository()`、`android_sdk_repository()` 和 `bind()` 规则添加到 [`WORKSPACE`](https://github.com/google/mediapipe/blob/master/WORKSPACE) 文件中,如下所示:

```
$ echo "android_sdk_repository(name = \"androidsdk\")" >> WORKSPACE
$ echo "android_ndk_repository(name = \"androidndk\", api_level=26)" >> WORKSPACE
$ echo "bind(name = \"android/crosstool\", actual = \"@androidndk//:toolchain\")" >> WORKSPACE
```

为了在更早的 Android 版本上使用 Framework,MediaPipe 需要切换到更低的 Android API level。你可以在 [`WORKSPACE`](https://github.com/google/mediapipe/blob/master/WORKSPACE) 文件的 android\_ndk\_repository() 和/或 android\_sdk\_repository() 中指定 `api_level = $YOUR_INTENDED_API_LEVEL` 来实现这一点。

**提示:** 你可以运行这个[脚本](https://github.com/google/mediapipe/blob/master/build_android_examples.sh) 来构建(并安装)所有 MediaPipe Android 示例应用。

1.  要构建一个 Android 示例应用,请针对对应的 `android_binary` 构建目标进行构建。例如,对于 MediaPipe Hands,目标是 [BUILD](https://github.com/google/mediapipe/tree/master/mediapipe/examples/android/src/java/com/google/mediapipe/apps/handtrackinggpu/BUILD) 文件中的 `handtrackinggpu`:

    **注意:** 为减小二进制体积,可考虑在下面的命令后追加 `--linkopt="-s"` 以去除符号。

    ```
    bazel build -c opt --config=android_arm64 mediapipe/examples/android/src/java/com/google/mediapipe/apps/handtrackinggpu:handtrackinggpu
    ```

2.  在设备上安装:

    ```
    adb install bazel-bin/mediapipe/examples/android/src/java/com/google/mediapipe/apps/handtrackinggpu/handtrackinggpu.apk
    ```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*