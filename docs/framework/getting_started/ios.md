---
title: "iOS 上的 MediaPipe Framework (MediaPipe Framework on iOS)"
original_url: "https://developers.google.com/edge/mediapipe/framework/getting_started/ios"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-05-28 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# iOS 上的 MediaPipe Framework (MediaPipe Framework on iOS)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/framework/getting_started/ios)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

按照下面的说明,即可使用 MediaPipe Framework 构建 iOS 示例应用。要了解这些示例应用的更多信息,请从 [Hello World!(iOS 入门示例)](hello_world_ios.md)开始。

## 构建 iOS 示例应用

### 前置条件

1. 按照这些[说明](install.md)安装 MediaPipe Framework。
2. 安装 [Xcode](https://developer.apple.com/xcode/),然后安装命令行工具(Command Line Tools),命令如下:

   ```
   xcode-select --install
   ```
3. 安装 [Bazelisk](https://github.com/bazelbuild/bazelisk)。

   我们建议使用 [Homebrew](https://brew.sh/) 获取最新版本。

   ```
   brew install bazelisk
   ```
4. 安装 Python 的 "six" 库。TensorFlow 需要用到它。

   ```
   pip3 install --user six
   ```
5. 克隆 MediaPipe 代码仓库。

   ```
   git clone https://github.com/google/mediapipe.git
   ```

### 设置 Bundle ID 前缀

所有 iOS 应用都必须有 bundle ID,并且你必须有一份配置描述文件(Provisioning Profile),才能把带有该 ID 的应用安装到手机上。为了避免不同 MediaPipe 用户之间发生冲突,你需要为这些 iOS 演示应用的 bundle ID 配置一个唯一的前缀。

如果你有自定义的配置描述文件,请参阅下文[自定义配置](#custom_provisioning)。

否则,运行以下命令生成唯一前缀:

```
python3 mediapipe/examples/ios/link_local_profiles.py
```

### 创建 Xcode 项目

这样你就能在 Xcode 中编辑和调试其中一个示例应用,也可以使用自动配置(见后文)。

1. 我们将使用一个名为 [Tulsi](https://tulsi.bazel.build/) 的工具,从 Bazel 构建配置生成 Xcode 项目。

   ```
   # 请先退出 mediapipe 目录,然后:
   git clone https://github.com/bazelbuild/tulsi.git
   cd tulsi
   # 从 Tulsi 的 .bazelrc 中移除 Xcode 版本(参见 http://github.com/bazelbuild/tulsi#building-and-installing):
   sed -i .orig '/xcode_version/d' .bazelrc
   # 构建并运行 Tulsi:
   sh build_and_run.sh
   ```

   这会把 `Tulsi.app` 安装到主目录下的 `Applications` 目录中。
2. 使用 Tulsi 应用打开 `mediapipe/Mediapipe.tulsiproj`。

   **提示:** 如果 Tulsi 显示 "Bazel could not be found" 错误,请在 Packages 选项卡中点击 "Bazel..." 按钮,然后选择你 homebrew 的 `/bin/` 目录中的 `bazel` 可执行文件。
3. 在 Configs 选项卡中选择 MediaPipe 配置,然后点击下方的 Generate 按钮。系统会询问 Xcode 项目的保存位置。项目生成后会自动在 Xcode 中打开。

   如果遇到 bundle ID 相关错误,请参阅[上一节](#set_up_a_bundle_id_prefix)。

### 设置配置(Provisioning)

要在 iOS 设备上安装应用,你需要一份配置描述文件(Provisioning Profile)。有两种方式:

1. 自动配置(Automatic provisioning)。这允许你构建应用并安装到个人设备上。配置描述文件由 Xcode 管理,需要经常更新(有效期约为一周)。
2. 自定义配置(Custom provisioning)。这需要使用与 Apple 开发者账号关联的配置描述文件。此类配置文件有效期更长,并且可以面向多台设备,但你需要一个付费的 Apple 开发者账号才能获取。

#### 自动配置

1. 为 MediaPipe 创建 Xcode 项目,方法如前文[所述](#create_an_xcode_project)。
2. 在左侧边栏的项目导航器中,选择 "Mediapipe" 项目。
3. 选择其中一个应用目标,例如 HandTrackingGpuApp。
4. 选择 "Signing & Capabilities" 选项卡。
5. 勾选 "Automatically manage signing",并确认对话框。
6. 在 Team 对话框菜单中选择 "*你的名字* (Personal Team)"。
7. 每个你想要安装的应用都需要执行一次此设置。根据需要重复步骤 3-6。

这会为每个你选中的应用生成配置描述文件。现在你需要告诉 Bazel 使用它们。我们提供了一个脚本,让这件事更简单。

1. 在终端中,进入你克隆仓库时的 `mediapipe` 目录。
2. 运行以下命令:

   ```
   python3 mediapipe/examples/ios/link_local_profiles.py
   ```

该脚本会查找并链接所有你在 Xcode 中启用自动配置的应用的配置描述文件。

> **注意:** 一旦配置文件过期,Xcode 会生成新的;届时你必须重新运行该脚本,以链接更新后的配置文件。

#### 自定义配置

1. 从 Apple 获取一份配置描述文件。

**提示:** 你可以使用此命令查看之前用 Xcode 下载的配置描述文件:`open ~/Library/MobileDevice/"Provisioning Profiles"`。如果没有,请在 [Apple 开发者网站](https://developer.apple.com/account/resources/)上生成并下载一份。

1. 将你的配置描述文件符号链接或复制到 `mediapipe/mediapipe/provisioning_profile.mobileprovision`。

   ```
   cd mediapipe
   ln -s ~/Downloads/MyProvisioningProfile.mobileprovision mediapipe/provisioning_profile.mobileprovision
   ```

> **注意:** 如果你之前设置过自动配置,应删除每个示例目录中的 `provisioning_profile.mobileprovision` 符号链接,因为它会优先于公共的那份。如果不同应用需要不同的配置文件,你也可以用自己的配置文件覆盖它。

1. 打开 `mediapipe/examples/ios/bundle_id.bzl`,并将 `BUNDLE_ID_PREFIX` 改为与你的配置描述文件关联的前缀。

### 使用 Xcode 构建并运行应用

1. 创建 Xcode 项目,并确保已设置自动配置或自定义配置。
2. 现在你可以在目标菜单中选择任意 MediaPipe Framework 演示应用,并像平常一样构建和运行。

> **注意:** 当你让 Xcode 运行一个应用时,默认会使用 Debug 配置。我们的一些演示应用计算量较大;你可能希望使用 Release 配置以获得更好的性能。

> **注意:** 由于某个依赖项存在兼容性问题,该 Framework 无法用于在 Apple Silicon (M1) 上的 iPhone 模拟器中运行的应用。

> **提示:** 要在 Xcode 中切换构建配置,请点击目标菜单,选择 "Edit Scheme...",选择 Run 操作,然后将 Build Configuration 从 Debug 切换为 Release。注意,该设置是针对每个目标独立设置的。

> **提示:** 在设备上,请前往 Settings > General > Device Management,确保开发者(即你自己)已被信任。

### 使用命令行构建应用

1. 确保已设置自动配置或自定义配置。
2. 以 MediaPipe Hands 为例,运行:

   ```
   bazel build -c opt --config=ios_arm64 mediapipe/examples/ios/handtrackinggpu:HandTrackingGpuApp
   ```

   你可能会看到来自 `codesign` 的权限请求,用于对应用进行签名。

   **提示:** 如果你使用的是自定义配置,可以运行这个[脚本](https://github.com/google/mediapipe/blob/master/build_ios_examples.sh)来构建全部 Framework iOS 示例应用。
3. 在 Xcode 中,打开 `Devices and Simulators` 窗口(command-shift-2)。
4. 确保你的设备已连接。你会看到已安装应用的列表。点击列表下方的 "+" 按钮,选择由 Bazel 构建的 `.ipa` 文件。
5. 现在你可以在设备上运行该应用了。

**提示:** 在设备上,请前往 Settings > General > Device Management,确保开发者(即你自己)已被信任。

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*