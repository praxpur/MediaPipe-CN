---
title: "安装 (Installation)"
original_url: "https://developers.google.com/edge/mediapipe/framework/getting_started/install"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-05-28 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 安装 (Installation)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/framework/getting_started/install)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

> **注意:** 为了与 OpenCV 互操作,建议使用 OpenCV 3.x 至 4.1。OpenCV 2.x 目前可用,但互操作支持将来可能会被弃用。

> **注意:** 如果你计划使用 TensorFlow 计算器和示例应用,需要注意 gcc 和 g++ 6.3、7.3 版本存在一个已知问题。我们建议安装 gcc 和 g++ 8.x 版本。

> **注意:** 为了让 MediaPipe 与 TensorFlow 一起工作,请将 Python 3.7 设置为默认 Python 版本,并运行 `pip3 install --user six` 安装 Python "six" 库。

## 在 Debian 和 Ubuntu 上安装

1.  安装 Bazelisk。

    请按照官方 [Bazel 文档](https://docs.bazel.build/versions/master/install-bazelisk.html) 安装 Bazelisk。

2.  检出 MediaPipe 仓库。

    ```
    $ cd $HOME
    $ git clone --depth 1 https://github.com/google/mediapipe.git

    # 切换到 MediaPipe 根目录
    $ cd mediapipe
    ```

3.  安装 OpenCV 和 FFmpeg。

    **选项 1**。使用包管理器工具安装预编译的 OpenCV 库。FFmpeg 将通过 `libopencv-video-dev` 安装。

    | 操作系统 | OpenCV |
    |---|---|
    | Debian 9 (stretch) | 2.4 |
    | Debian 10 (buster) | 3.2 |
    | Debian 11 (bullseye) | 4.5 |
    | Ubuntu 16.04 LTS | 2.4 |
    | Ubuntu 18.04 LTS | 3.2 |
    | Ubuntu 20.04 LTS | 4.2 |
    | Ubuntu 20.04 LTS | 4.2 |
    | Ubuntu 21.04 | 4.5 |

    ```
    $ sudo apt-get install -y \
        libopencv-core-dev \
        libopencv-highgui-dev \
        libopencv-calib3d-dev \
        libopencv-features2d-dev \
        libopencv-imgproc-dev \
        libopencv-video-dev
    ```

    **注意**。在 Debian 11/Ubuntu 21.04 上,当通过 `libopencv-video-dev` 安装 OpenCV 4.5 时,还应安装 `libopencv-contrib-dev`。

    ```
    $ sudo apt-get install -y libopencv-contrib-dev
    ```

    MediaPipe 的 [`opencv_linux.BUILD`](https://github.com/google/mediapipe/tree/master/third_party/opencv_linux.BUILD) 和 [`WORKSPACE`](https://github.com/google/mediapipe/blob/master/WORKSPACE) 已针对 OpenCV 2/3 完成配置,应能在任何架构上正常工作:

    ```
    # WORKSPACE
    new_local_repository(
      name = "linux_opencv",
      build_file = "@//third_party:opencv_linux.BUILD",
      path = "/usr",
    )

    # opencv_linux.BUILD:OpenCV 2/3 由 Debian 包安装
    cc_library(
      name = "opencv",
      linkopts = [
        "-l:libopencv_core.so",
        "-l:libopencv_calib3d.so",
        "-l:libopencv_features2d.so",
        "-l:libopencv_highgui.so",
        "-l:libopencv_imgcodecs.so",
        "-l:libopencv_imgproc.so",
        "-l:libopencv_video.so",
        "-l:libopencv_videoio.so",
      ],
    )
    ```

    对于 OpenCV 4,你需要考虑当前架构来修改 [`opencv_linux.BUILD`](https://github.com/google/mediapipe/tree/master/third_party/opencv_linux.BUILD):

    ```
    # WORKSPACE
    new_local_repository(
      name = "linux_opencv",
      build_file = "@//third_party:opencv_linux.BUILD",
      path = "/usr",
    )

    # opencv_linux.BUILD:OpenCV 4 由 Debian 包安装
    cc_library(
      name = "opencv",
      hdrs = glob([
        # 根据你的 multiarch 值(gcc -print-multiarch)取消注释:
        #  "include/aarch64-linux-gnu/opencv4/opencv2/cvconfig.h",
        #  "include/arm-linux-gnueabihf/opencv4/opencv2/cvconfig.h",
        #  "include/x86_64-linux-gnu/opencv4/opencv2/cvconfig.h",
        "include/opencv4/opencv2/**/*.h*",
      ]),
      includes = [
        # 根据你的 multiarch 值(gcc -print-multiarch)取消注释:
        #  "include/aarch64-linux-gnu/opencv4/",
        #  "include/arm-linux-gnueabihf/opencv4/",
        #  "include/x86_64-linux-gnu/opencv4/",
        "include/opencv4/",
      ],
      linkopts = [
        "-l:libopencv_core.so",
        "-l:libopencv_calib3d.so",
        "-l:libopencv_features2d.so",
        "-l:libopencv_highgui.so",
        "-l:libopencv_imgcodecs.so",
        "-l:libopencv_imgproc.so",
        "-l:libopencv_video.so",
        "-l:libopencv_videoio.so",
      ],
    )
    ```

    **选项 2**。运行 [`setup_opencv.sh`](https://github.com/google/mediapipe/blob/master/setup_opencv.sh) 自动从源码构建 OpenCV 并修改 MediaPipe 的 OpenCV 配置。此选项会自动完成选项 3 中定义的所有步骤。

    **选项 3**。按照 OpenCV 的[文档](https://docs.opencv.org/3.4.6/d7/d9f/tutorial_linux_install.html) 手动从源码构建 OpenCV。

    你可能需要修改 [`WORKSPACE`](https://github.com/google/mediapipe/blob/master/WORKSPACE) 和 [`opencv_linux.BUILD`](https://github.com/google/mediapipe/tree/master/third_party/opencv_linux.BUILD),让 MediaPipe 指向你自己的 OpenCV 库。假设 OpenCV 按照默认建议安装到 `/usr/local/`。

    OpenCV 2/3 配置:

    ```
    # WORKSPACE
    new_local_repository(
      name = "linux_opencv",
      build_file = "@//third_party:opencv_linux.BUILD",
      path = "/usr/local",
    )

    # opencv_linux.BUILD:OpenCV 2/3 安装到 /usr/local
    cc_library(
      name = "opencv",
      linkopts = [
        "-L/usr/local/lib",
        "-l:libopencv_core.so",
        "-l:libopencv_calib3d.so",
        "-l:libopencv_features2d.so",
        "-l:libopencv_highgui.so",
        "-l:libopencv_imgcodecs.so",
        "-l:libopencv_imgproc.so",
        "-l:libopencv_video.so",
        "-l:libopencv_videoio.so",
      ],
    )
    ```

    OpenCV 4 配置:

    ```
    # WORKSPACE
    new_local_repository(
      name = "linux_opencv",
      build_file = "@//third_party:opencv_linux.BUILD",
      path = "/usr/local",
    )

    # opencv_linux.BUILD:OpenCV 4 安装到 /usr/local
    cc_library(
      name = "opencv",
      hdrs = glob([
        "include/opencv4/opencv2/**/*.h*",
      ]),
      includes = [
        "include/opencv4/",
      ],
      linkopts = [
        "-L/usr/local/lib",
        "-l:libopencv_core.so",
        "-l:libopencv_calib3d.so",
        "-l:libopencv_features2d.so",
        "-l:libopencv_highgui.so",
        "-l:libopencv_imgcodecs.so",
        "-l:libopencv_imgproc.so",
        "-l:libopencv_video.so",
        "-l:libopencv_videoio.so",
      ],
    )
    ```

    当前的 FFmpeg 配置定义在 [`ffmpeg_linux.BUILD`](https://github.com/google/mediapipe/tree/master/third_party/ffmpeg_linux.BUILD) 中,应适用于任何架构:

    ```
    # WORKSPACE
    new_local_repository(
      name = "linux_ffmpeg",
      build_file = "@//third_party:ffmpeg_linux.BUILD",
      path = "/usr"
    )

    # ffmpeg_linux.BUILD:FFmpeg 由 Debian 包安装
    cc_library(
      name = "libffmpeg",
      linkopts = [
        "-l:libavcodec.so",
        "-l:libavformat.so",
        "-l:libavutil.so",
      ],
    )
    ```

4.  仅在 Linux 上(而非 OS X)运行带 GPU 加速的桌面示例。

    ```
    # 需要支持 EGL 驱动的 GPU。
    # 桌面端可以使用 mesa GPU 库(或等效的 Nvidia/AMD)。
    sudo apt-get install mesa-common-dev libegl1-mesa-dev libgles2-mesa-dev

    # 要启用 GPU 支持编译,将
    --define MEDIAPIPE_DISABLE_GPU=1
    # 替换为
    --copt -DMESA_EGL_NO_X11_HEADERS --copt -DEGL_NO_X11
    # 在构建 GPU 示例时。
    ```

5.  运行 [Hello World! C++ 示例](hello_world_cpp.md)。

    ```
    $ export GLOG_logtostderr=1

    # 如果你只在 CPU 上运行 Linux 桌面
    $ bazel run --define MEDIAPIPE_DISABLE_GPU=1 \
        mediapipe/examples/desktop/hello_world:hello_world

    # 如果你在 Linux 桌面上启用了 GPU 支持(通过 mesa 驱动)
    $ bazel run --copt -DMESA_EGL_NO_X11_HEADERS --copt -DEGL_NO_X11 \
        mediapipe/examples/desktop/hello_world:hello_world

    # 应输出:
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

如果你遇到构建错误,请阅读[疑难解答](troubleshooting.md) 以找到几种常见构建问题的解决方案。

## 在 CentOS 上安装

**免责声明**:在 CentOS 上运行 MediaPipe 是实验性的。

1.  安装 Bazelisk。

    请按照官方 [Bazel 文档](https://docs.bazel.build/versions/master/install-bazelisk.html) 安装 Bazelisk。

2.  检出 MediaPipe 仓库。

    ```
    $ git clone --depth 1 https://github.com/google/mediapipe.git

    # 切换到 MediaPipe 根目录
    $ cd mediapipe
    ```

3.  安装 OpenCV。

    选项 1。使用包管理器工具安装预编译版本。

    **注意:** yum 安装的是 OpenCV 2.4.5,它可能存在一个 opencv/gstreamer [问题](https://github.com/opencv/opencv/issues/4592)。

    ```
    $ sudo yum install opencv-devel
    ```

    选项 2。从源码构建 OpenCV。

    **注意:** 你可能需要修改 [`WORKSPACE`](https://github.com/google/mediapipe/blob/master/WORKSPACE)、[`opencv_linux.BUILD`](https://github.com/google/mediapipe/tree/master/third_party/opencv_linux.BUILD) 和 [`ffmpeg_linux.BUILD`](https://github.com/google/mediapipe/tree/master/third_party/ffmpeg_linux.BUILD),让 MediaPipe 指向你自己的 OpenCV 和 FFmpeg 库。例如,如果 OpenCV 和 FFmpeg 都手动安装在 "/usr/local/" 中,你需要更新:(1) [`WORKSPACE`](https://github.com/google/mediapipe/blob/master/WORKSPACE) 中的 "linux\_opencv" 和 "linux\_ffmpeg" new\_local\_repository 规则;(2) [`opencv_linux.BUILD`](https://github.com/google/mediapipe/tree/master/third_party/opencv_linux.BUILD) 中的 "opencv" cc\_library 规则;(3) [`ffmpeg_linux.BUILD`](https://github.com/google/mediapipe/tree/master/third_party/ffmpeg_linux.BUILD) 中的 "libffmpeg" cc\_library 规则。这 3 处修改如下所示:

    ```
    new_local_repository(
        name = "linux_opencv",
        build_file = "@//third_party:opencv_linux.BUILD",
        path = "/usr/local",
    )

    new_local_repository(
        name = "linux_ffmpeg",
        build_file = "@//third_party:ffmpeg_linux.BUILD",
        path = "/usr/local",
    )

    cc_library(
        name = "opencv",
        srcs = glob(
            [
                "lib/libopencv_core.so",
                "lib/libopencv_highgui.so",
                "lib/libopencv_imgcodecs.so",
                "lib/libopencv_imgproc.so",
                "lib/libopencv_video.so",
                "lib/libopencv_videoio.so",
            ],
        ),
        hdrs = glob([
            # 适用于 OpenCV 3.x
            "include/opencv2/**/*.h*",
            # 适用于 OpenCV 4.x
            # "include/opencv4/opencv2/**/*.h*",
        ]),
        includes = [
            # 适用于 OpenCV 3.x
            "include/",
            # 适用于 OpenCV 4.x
            # "include/opencv4/",
        ],
        linkstatic = 1,
        visibility = ["//visibility:public"],
    )

    cc_library(
        name = "libffmpeg",
        srcs = glob(
            [
                "lib/libav*.so",
            ],
        ),
        hdrs = glob(["include/libav*/*.h"]),
        includes = ["include"],
        linkopts = [
            "-lavcodec",
            "-lavformat",
            "-lavutil",
        ],
        linkstatic = 1,
        visibility = ["//visibility:public"],
    )
    ```

4.  运行 [Hello World! C++ 示例](hello_world_cpp.md)。

    ```
    $ export GLOG_logtostderr=1
    # 如果只在 CPU 上运行 Linux 桌面,需要 bazel 标志 'MEDIAPIPE_DISABLE_GPU=1'
    $ bazel run --define MEDIAPIPE_DISABLE_GPU=1 \
        mediapipe/examples/desktop/hello_world:hello_world

    # 应输出:
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

如果你遇到构建错误,请阅读[疑难解答](troubleshooting.md) 以找到几种常见构建问题的解决方案。

## 在 macOS 上安装

1.  准备工作:

    -   安装 [Homebrew](https://brew.sh)。
    -   通过 `xcode-select --install` 安装 [Xcode](https://developer.apple.com/xcode/) 及其命令行工具。
2.  安装 Bazelisk。

    请按照官方 [Bazel 文档](https://docs.bazel.build/versions/master/install-bazelisk.html) 安装 Bazelisk。

3.  检出 MediaPipe 仓库。

    ```
    $ git clone --depth 1 https://github.com/google/mediapipe.git

    $ cd mediapipe
    ```

4.  安装 OpenCV 和 FFmpeg。

    选项 1。使用 HomeBrew 包管理器工具安装预编译的 OpenCV 3 库。FFmpeg 将通过 OpenCV 安装。

    ```
    $ brew install opencv

    # glog 依赖存在一个已知问题。请卸载 glog。
    $ brew uninstall --ignore-dependencies glog
    ```

    选项 2。使用 MacPorts 包管理器工具安装 OpenCV 库。

    ```
    $ port install opencv
    ```

    **注意:** 使用 MacPorts 时,请按如下方式编辑 [`WORKSPACE`](https://github.com/google/mediapipe/blob/master/WORKSPACE)、[`opencv_macos.BUILD`](https://github.com/google/mediapipe/tree/master/third_party/opencv_macos.BUILD) 和 [`ffmpeg_macos.BUILD`](https://github.com/google/mediapipe/tree/master/third_party/ffmpeg_macos.BUILD) 文件:

    ```
    new_local_repository(
        name = "macos_opencv",
        build_file = "@//third_party:opencv_macos.BUILD",
        path = "/opt",
    )

    new_local_repository(
        name = "macos_ffmpeg",
        build_file = "@//third_party:ffmpeg_macos.BUILD",
        path = "/opt",
    )

    cc_library(
        name = "opencv",
        srcs = glob(
            [
                "local/lib/libopencv_core.dylib",
                "local/lib/libopencv_highgui.dylib",
                "local/lib/libopencv_imgcodecs.dylib",
                "local/lib/libopencv_imgproc.dylib",
                "local/lib/libopencv_video.dylib",
                "local/lib/libopencv_videoio.dylib",
            ],
        ),
        hdrs = glob(["local/include/opencv2/**/*.h*"]),
        includes = ["local/include/"],
        linkstatic = 1,
        visibility = ["//visibility:public"],
    )

    cc_library(
        name = "libffmpeg",
        srcs = glob(
            [
                "local/lib/libav*.dylib",
            ],
        ),
        hdrs = glob(["local/include/libav*/*.h"]),
        includes = ["local/include/"],
        linkopts = [
            "-lavcodec",
            "-lavformat",
            "-lavutil",
        ],
        linkstatic = 1,
        visibility = ["//visibility:public"],
    )
    ```

5.  确保安装了 Python 3 和 Python "six" 库。

    ```
    $ brew install python
    $ sudo ln -s -f /usr/local/bin/python3.7 /usr/local/bin/python
    $ python --version
    Python 3.7.4
    $ pip3 install --user six
    ```

6.  运行 [Hello World! C++ 示例](hello_world_cpp.md)。

    ```
    $ export GLOG_logtostderr=1
    # 桌面 GPU 目前不受支持,需要 bazel 标志 'MEDIAPIPE_DISABLE_GPU=1'
    $ bazel run --define MEDIAPIPE_DISABLE_GPU=1 \
        mediapipe/examples/desktop/hello_world:hello_world

    # 应输出:
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

如果你遇到构建错误,请阅读[疑难解答](troubleshooting.md) 以找到几种常见构建问题的解决方案。

## 在 Windows 上安装

**免责声明**:在 Windows 上运行 MediaPipe 是实验性的。

**注意:** 在原生 Windows 上仍无法构建 MediaPipe Android 应用。请在 WSL 中构建,并参见下一节的 WSL 配置说明。

1.  安装 [MSYS2](https://www.msys2.org/) 并编辑 `%PATH%` 环境变量。

    如果 MSYS2 安装到 `C:\msys64`,请将 `C:\msys64\usr\bin` 添加到你的 `%PATH%` 环境变量中。

2.  安装必要的包。

    ```
    C:\> pacman -S git patch unzip
    ```

3.  安装 Python,并允许该可执行文件编辑 `%PATH%` 环境变量。

    从 [https://www.python.org/downloads](https://www.python.org/downloads/windows) 下载 Windows 版 Python 可执行文件并安装。

4.  安装 Visual C++ Build Tools 和 WinSDK。

    访问 [VisualStudio 网站](https://visualstudio.microsoft.com/visual-cpp-build-tools),下载构建工具,并安装 Microsoft Visual C++ 2022 Redistributable 和 Microsoft Build Tools 2022。

    从 [微软官方网站](https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk/) 下载 WinSDK 并安装。

5.  安装 Bazel 或 Bazelisk,并将 Bazel 可执行文件的位置添加到 `%PATH%` 环境变量中。

    选项 1。按照[官方 Bazel 文档](https://docs.bazel.build/versions/master/install-windows.html) 安装 Bazel 6.5.0 或更高版本。

    选项 2。按照官方 [Bazel 文档](https://docs.bazel.build/versions/master/install-bazelisk.html) 安装 Bazelisk。

6.  设置 Bazel 变量。在 Bazel 官方文档中了解有关 ["Build on Windows"](https://docs.bazel.build/versions/master/windows.html#build-c-with-msvc) 的更多详情。

    ```
    # 请从你本地版本中找到准确的路径和版本号。
    C:\> set BAZEL_VS=C:\Program Files (x86)\Microsoft Visual Studio\<version>\BuildTools
    C:\> set BAZEL_VC=C:\Program Files (x86)\Microsoft Visual Studio\<version>\BuildTools\VC
    C:\> set BAZEL_VC_FULL_VERSION=<Your local VC version>
    C:\> set BAZEL_WINSDK_FULL_VERSION=<Your local WinSDK version>
    ```

7.  检出 MediaPipe 仓库。

    ```
    C:\Users\Username\mediapipe_repo> git clone --depth 1 https://github.com/google/mediapipe.git

    # 切换到 MediaPipe 根目录
    C:\Users\Username\mediapipe_repo> cd mediapipe
    ```

8.  安装 OpenCV。

    从 [https://opencv.org/releases/](https://opencv.org/releases/) 下载 Windows 可执行文件并安装。MediaPipe 0.10.x 支持 OpenCV 3.4.10。如果 OpenCV 未安装到 `C:\opencv`,请记得编辑 [`WORKSPACE`](https://github.com/google/mediapipe/blob/master/WORKSPACE) 文件。

    ```
    new_local_repository(
        name = "windows_opencv",
        build_file = "@//third_party:opencv_windows.BUILD",
        path = "C:\\<path to opencv>\\build",
    )
    ```

9.  运行 [Hello World! C++ 示例](hello_world_cpp.md)。

    **注意:** 在 Windows 上构建 MediaPipe 时,请在构建命令中添加 `--action_env PYTHON_BIN_PATH="C://path//to//python.exe"`。或者,你可以按照 [issue 724](https://github.com/google/mediapipe/issues/724) 手动修复 python 配置。

    ```
    C:\Users\Username\mediapipe_repo>bazel build -c opt --define MEDIAPIPE_DISABLE_GPU=1 --action_env PYTHON_BIN_PATH="C://python_36//python.exe" mediapipe/examples/desktop/hello_world

    C:\Users\Username\mediapipe_repo>set GLOG_logtostderr=1

    C:\Users\Username\mediapipe_repo>bazel-bin\mediapipe\examples\desktop\hello_world\hello_world.exe

    # 应输出:
    # I20200514 20:43:12.277598  1200 hello_world.cc:56] Hello World!
    # I20200514 20:43:12.278597  1200 hello_world.cc:56] Hello World!
    # I20200514 20:43:12.279618  1200 hello_world.cc:56] Hello World!
    # I20200514 20:43:12.279618  1200 hello_world.cc:56] Hello World!
    # I20200514 20:43:12.279618  1200 hello_world.cc:56] Hello World!
    # I20200514 20:43:12.279618  1200 hello_world.cc:56] Hello World!
    # I20200514 20:43:12.279618  1200 hello_world.cc:56] Hello World!
    # I20200514 20:43:12.279618  1200 hello_world.cc:56] Hello World!
    # I20200514 20:43:12.279618  1200 hello_world.cc:56] Hello World!
    # I20200514 20:43:12.280613  1200 hello_world.cc:56] Hello World!
    ```

如果你遇到构建错误,请阅读[疑难解答](troubleshooting.md) 以找到几种常见构建问题的解决方案。

## 在 Windows Subsystem for Linux (WSL) 上安装

**注意:** 预编译的 OpenCV 包不支持 WSL 中的摄像头。除非你在 WSL 中用 FFMPEG 和 GStreamer [编译](https://funvision.blogspot.com/2019/12/opencv-web-camera-and-video-streams-in.html) OpenCV,否则实时演示无法与任何摄像头配合工作。另一种做法是使用视频文件作为输入。

1.  按照[说明](https://docs.microsoft.com/en-us/windows/wsl/install-win10) 安装 Windows Subsystem for Linux (Ubuntu)。

2.  安装 Windows ADB,并在 Windows 中启动 ADB 服务器。

    **注意:** Windows 和 WSL 的 adb 版本必须相同,例如,如果 WSL 有 ADB 1.0.39,你需要从[这里](https://dl.google.com/android/repository/platform-tools_r30.0.3-windows.zip) 下载对应的 Windows ADB。

3.  启动 WSL。

    **注意:** 以下所有步骤都将在 WSL 中执行。Linux Subsystem 的 Windows 目录位于 C:\\Users\\YourUsername\\AppData\\Local\\Packages\\CanonicalGroupLimited.UbuntuonWindows\_SomeID\\LocalState\\rootfs\\home

4.  安装所需的包。

    ```
    username@DESKTOP-TMVLBJ1:~$ sudo apt-get update && sudo apt-get install -y build-essential git python zip adb openjdk-8-jdk
    ```

5.  安装 Bazelisk。

    请按照官方 [Bazel 文档](https://docs.bazel.build/versions/master/install-bazelisk.html) 安装 Bazelisk。

6.  检出 MediaPipe 仓库。

    ```
    username@DESKTOP-TMVLBJ1:~$ git clone --depth 1 https://github.com/google/mediapipe.git

    username@DESKTOP-TMVLBJ1:~$ cd mediapipe
    ```

7.  安装 OpenCV 和 FFmpeg。

    选项 1。使用包管理器工具安装预编译的 OpenCV 库。FFmpeg 将通过 libopencv-video-dev 安装。

    ```
    username@DESKTOP-TMVLBJ1:~/mediapipe$ sudo apt-get install libopencv-core-dev libopencv-highgui-dev \
                           libopencv-calib3d-dev libopencv-features2d-dev \
                           libopencv-imgproc-dev libopencv-video-dev
    ```

    选项 2。运行 [`setup_opencv.sh`](https://github.com/google/mediapipe/blob/master/setup_opencv.sh) 自动从源码构建 OpenCV 并修改 MediaPipe 的 OpenCV 配置。

    选项 3。按照 OpenCV 的[文档](https://docs.opencv.org/3.4.6/d7/d9f/tutorial_linux_install.html) 手动从源码构建 OpenCV。

    **注意:** 你可能需要修改 [`WORKSPACE`](https://github.com/google/mediapipe/blob/master/WORKSPACE) 和 [`opencv_linux.BUILD`](https://github.com/google/mediapipe/tree/master/third_party/opencv_linux.BUILD),让 MediaPipe 指向你自己的 OpenCV 库,例如,如果 OpenCV 4 安装在 "/usr/local/" 中,你需要按如下方式更新 [`WORKSPACE`](https://github.com/google/mediapipe/blob/master/WORKSPACE) 中的 "linux\_opencv" new\_local\_repository 规则和 [`opencv_linux.BUILD`](https://github.com/google/mediapipe/tree/master/third_party/opencv_linux.BUILD) 中的 "opencv" cc\_library 规则:

    ```
    new_local_repository(
        name = "linux_opencv",
        build_file = "@//third_party:opencv_linux.BUILD",
        path = "/usr/local",
    )

    cc_library(
        name = "opencv",
        srcs = glob(
            [
                "lib/libopencv_core.so",
                "lib/libopencv_highgui.so",
                "lib/libopencv_imgcodecs.so",
                "lib/libopencv_imgproc.so",
                "lib/libopencv_video.so",
                "lib/libopencv_videoio.so",
            ],
        ),
        hdrs = glob(["include/opencv4/**/*.h*"]),
        includes = ["include/opencv4/"],
        linkstatic = 1,
        visibility = ["//visibility:public"],
    )
    ```

8.  运行 [Hello World! C++ 示例](hello_world_cpp.md)。

    ```
    username@DESKTOP-TMVLBJ1:~/mediapipe$ export GLOG_logtostderr=1

    # 桌面 GPU 目前不受支持,需要 bazel 标志 'MEDIAPIPE_DISABLE_GPU=1'
    username@DESKTOP-TMVLBJ1:~/mediapipe$ bazel run --define MEDIAPIPE_DISABLE_GPU=1 \
        mediapipe/examples/desktop/hello_world:hello_world

    # 应输出:
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

如果你遇到构建错误,请阅读[疑难解答](troubleshooting.md) 以找到几种常见构建问题的解决方案。

## 使用 Docker 安装

这将使用一个 Docker 镜像,把 mediapipe 的安装与系统其他部分隔离开来。

1.  在宿主机系统上[安装 Docker](https://docs.docker.com/install/#supported-platforms)。

2.  构建一个标签为 "mediapipe" 的 docker 镜像。

    ```
    $ git clone --depth 1 https://github.com/google/mediapipe.git
    $ cd mediapipe
    $ docker build --tag=mediapipe .

    # 应输出:
    # Sending build context to Docker daemon  147.8MB
    # Step 1/9 : FROM ubuntu:latest
    # latest: Pulling from library/ubuntu
    # 6abc03819f3e: Pull complete
    # 05731e63f211: Pull complete
    # ........
    # See http://bazel.build/docs/getting-started.html to start a new project!
    # Removing intermediate container 82901b5e79fa
    # ---> f5d5f402071b
    # Step 9/9 : COPY . /edge/mediapipe/
    # ---> a95c212089c5
    # Successfully built a95c212089c5
    # Successfully tagged mediapipe:latest
    ```

3.  运行 [Hello World! C++ 示例](hello_world_cpp.md)。

    ```
    $ docker run -it --name mediapipe mediapipe:latest

    root@bca08b91ff63:/mediapipe# GLOG_logtostderr=1 bazel run --define MEDIAPIPE_DISABLE_GPU=1 mediapipe/examples/desktop/hello_world

    # 应输出:
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

如果你遇到构建错误,请阅读[疑难解答](troubleshooting.md) 以找到几种常见构建问题的解决方案。

1.  构建一个 MediaPipe Android 示例。

    ```
    $ docker run -it --name mediapipe mediapipe:latest

    root@bca08b91ff63:/mediapipe# bash ./setup_android_sdk_and_ndk.sh

    # 应输出:
    # Android NDK is now installed. Consider setting $ANDROID_NDK_HOME environment variable to be /root/Android/Sdk/ndk-bundle/android-ndk-r19c
    # Set android_ndk_repository and android_sdk_repository in WORKSPACE
    # Done

    root@bca08b91ff63:/mediapipe# bazel build -c opt --config=android_arm64 mediapipe/examples/android/src/java/com/google/mediapipe/apps/objectdetectiongpu:objectdetectiongpu

    # 应输出:
    # Target //mediapipe/examples/android/src/java/com/google/mediapipe/apps/objectdetectiongpu:objectdetectiongpu up-to-date:
    # bazel-bin/mediapipe/examples/android/src/java/com/google/mediapipe/apps/objectdetectiongpu/objectdetectiongpu_deploy.jar
    # bazel-bin/mediapipe/examples/android/src/java/com/google/mediapipe/apps/objectdetectiongpu/objectdetectiongpu_unsigned.apk
    # bazel-bin/mediapipe/examples/android/src/java/com/google/mediapipe/apps/objectdetectiongpu/objectdetectiongpu.apk
    # INFO: Elapsed time: 144.462s, Critical Path: 79.47s
    # INFO: 1958 processes: 1 local, 1863 processwrapper-sandbox, 94 worker.
    # INFO: Build completed successfully, 2028 total actions
    ```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*