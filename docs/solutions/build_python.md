---
title: "构建 MediaPipe Python Wheel 包 (Build MediaPipe Python Wheel Package)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/build_python"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-10-05 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 构建 MediaPipe Python Wheel 包 (Build MediaPipe Python Wheel Package)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/build_python)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

本页介绍如何构建 MediaPipe Wheel 包。你可以使用该 wheel 包在本地 [UNIX 机器](#manylinux)或 [Raspberry Pi](#raspberry-pi) 上安装 MediaPipe。

## 前提条件

要构建 Python Wheel 包,你的系统需要满足以下条件:

-   支持 Buildkit 的 Docker(18 或更高版本)

Python 构建流水线已使用 Python 3.9、3.10、3.11 和 3.12 版本完成测试。

## 使用 Docker 调用 BUILD

你可以使用我们发布到 [MediaPipe 代码库](https://github.com/google-ai-edge/mediapipe) 的 Docker 镜像之一。我们提供三种不同的镜像:

-   [manylinux_2_28_x86_64](https://github.com/google-ai-edge/mediapipe/blob/master/Dockerfile.manylinux_2_28_x86_64) 包含构建 Manylinux wheel 的构建流水线,可在任何 x86_64 Unix 主机上运行。
-   [manylinux_aarch64rp4](https://github.com/google-ai-edge/mediapipe/blob/master/Dockerfile.manylinux2014_aarch64rp4) 包含构建支持 aarch64 的 Raspberry wheel 的构建流水线。
-   [Dockerfile](https://github.com/google-ai-edge/mediapipe/blob/master/Dockerfile) 包含构建 C++ 框架的构建流水线。

## 适用于 x86_64 的 Manylinux 镜像

克隆 [MediaPipe 代码库](https://github.com/google-ai-edge/mediapipe/),并使用以下命令为大多数 Unix 平台构建 Docker 镜像。你可以修改命令,以便为镜像上预装的任何 Python 版本构建(目前为 3.9、3.10、3.11 和 3.12)。对于其他 Python 版本,你可以相应地修改 Dockerfile。

构建 Docker 镜像:

```
$ DOCKER_BUILDKIT=1 docker build -f Dockerfile.manylinux_2_28_x86_64 -t mp_manylinux . --build-arg "PYTHON_BIN=/opt/python/cp312-cp312/bin/python3.12"
```

创建 Docker 容器:

```
$ docker create -ti --name mp_pip_package_container mp_manylinux:latest
```

将 Docker 容器文件复制到你的本地机器:

```
$ docker cp mp_pip_package_container:/wheelhouse/. wheelhouse/
```

删除 Docker 容器:

```
$ docker rm -f mp_pip_package_container
```

## 适用于 ARM 的 Raspberry Pi 镜像

克隆 [MediaPipe 代码库](https://github.com/google-ai-edge/mediapipe/),并使用以下命令为 Raspberry Pi 平台构建 Docker 镜像。该 Dockerfile 会从源码安装 Python 3.12,并仅为该版本构建 wheel。对于其他 Python 版本,你可以相应地修改 Dockerfile。

构建 Docker 镜像:

```
$ docker build -f Dockerfile.manylinux2014_aarch64rp4 -t mp_manylinux_aarch64rp4 .
```

创建 Docker 容器:

```
$ docker create -ti --name mp_pip_package_container mp_manylinux_aarch64rp4:latest
```

将 Docker 容器文件复制到你的本地机器:

```
$ docker cp mp_pip_package_container:/wheelhouse/. wheelhouse/
```

删除 Docker 容器:

```
$ docker rm -f mp_pip_package_container
```

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*