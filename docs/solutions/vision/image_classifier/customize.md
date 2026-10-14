---
title: "图像分类模型定制指南 (Image classification model customization guide)"
original_url: "https://developers.google.com/edge/mediapipe/solutions/customization/image_classifier"
original_lang: "en"
target_lang: "zh-CN"
last_updated: "2026-06-05 UTC"
license: "CC BY 4.0 (内容) / Apache 2.0 (代码)"
translated: true
---

# 图像分类模型定制指南 (Image classification model customization guide)

> 本文译自官方文档:[原文链接](https://developers.google.com/edge/mediapipe/solutions/customization/image_classifier)
> 为保持内容与版式一致,图片位置、章节顺序、代码示例均与原页对齐。

[![Colab logo](../../../../assets/edge/mediapipe/solutions/customization/colab-logo-32px_1920.png) 在 Colab 中运行](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/customization/image_classifier.ipynb) | [![GitHub logo](../../../../assets/edge/mediapipe/solutions/customization/github-logo-32px_1920.png) 在 GitHub 上查看](https://github.com/googlesamples/mediapipe/blob/main/examples/customization/image_classifier.ipynb)

### 许可信息 (License information)

```
# Copyright 2023 The MediaPipe Authors.
# Licensed under the Apache License, Version 2.0 (the "License");
#
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
```

> **已弃用:** MediaPipe Model Maker 仍然可用,但官方已不再积极维护。

MediaPipe Model Maker 软件包是一种低代码解决方案,用于定制端侧机器学习(ML)模型。

MediaPipe 图像分类解决方案提供了多个现成模型,可直接用于您的应用程序中的机器学习(ML)。但是,如果您需要对所提供模型未涵盖的内容进行分类,可以使用您自己的数据和 MediaPipe [Model Maker](../../../model_maker.md) 定制任意一个所提供模型。该模型修改工具使用您提供的数据重建模型的一部分。这种方法比从头训练新模型更快,并且可以生成对您的特定应用更有用的模型。

以下章节向您展示如何使用 Model Maker 用您自己的数据重新训练一个预先构建的图像分类模型,然后可在 MediaPipe [图像分类器](../image_classifier.md) 中使用该模型。该示例将一个通用分类模型重新训练为对花朵图像进行分类。

本笔记本展示了使用用户自定义的花朵数据集,定制一个 ImageNet 预训练图像分类模型以识别花朵的端到端流程。

## 环境配置 (Setup)

本节介绍重新训练模型所需的开发环境配置关键步骤。这些说明描述了如何使用 [Google Colab](https://colab.research.google.com/) 更新模型,您也可以在您自己的开发环境中使用 Python。有关使用 MediaPipe 配置开发环境的一般信息(包括平台版本要求),请参阅 [Python 环境配置指南](../../../setup_python.md)。

要安装用于定制模型的库,请运行以下命令:

```
python --version
pip install --upgrade pip
pip install mediapipe-model-maker
```

使用以下代码导入所需的 Python 类:

```
from google.colab import files
import os
import tensorflow as tf
assert tf.__version__.startswith('2')

from mediapipe_model_maker import image_classifier

import matplotlib.pyplot as plt
```

## 准备数据 (Prepare data)

重新训练图像分类模型需要一个数据集,其中包含您希望完成的模型能够识别的所有类别,即*类(classes)*。您可以缩小一个公共数据集的规模,只保留与您的用例相关的类别;也可以自行整理数据,或者两者结合。数据集的规模可以明显小于训练新模型所需的数据量。例如,用于训练许多参考模型的 [ImageNet](https://www.image-net.org) 数据集包含数百万张图像、数千个类别。使用 Model Maker 进行迁移学习,可以用较小的数据集重新训练现有模型并且仍然表现良好,具体取决于您的推理精度目标。这些说明使用一个包含 5 种花朵、即 5 个*类*,每个类 600 到 800 张图像的小型数据集。

要下载示例数据集,请使用以下代码:

```
image_path = tf.keras.utils.get_file(
    'flower_photos.tgz',
    'https://storage.googleapis.com/download.tensorflow.org/example_images/flower_photos.tgz',
    extract=True)
image_path = os.path.join(os.path.dirname(image_path), 'flower_photos')
```

此代码将下载的图像存储到 `image_path` 变量保存的目录位置。该目录包含几个子目录,每个子目录对应特定的类标签。您的训练数据也应遵循这种模式:`<image_path>/<label_name>/<image_names>.*`。

### 检查数据 (Review data)

在使用 Model Maker 准备训练数据时,您应检查训练数据,确保其格式正确、分类正确,并按照分类标签组织到目录中。*此步骤为可选步骤,但建议执行。*

以下代码块按预期目录结构从 `image_path` 中检索所有标签名称并打印出来。

```
print(image_path)
labels = []
for i in os.listdir(image_path):
  if os.path.isdir(os.path.join(image_path, i)):
    labels.append(i)
print(labels)
```

您可以使用以下代码查看每个类别中的一些示例图像:

```
NUM_EXAMPLES = 5

for label in labels:
  label_dir = os.path.join(image_path, label)
  example_filenames = os.listdir(label_dir)[:NUM_EXAMPLES]
  fig, axs = plt.subplots(1, NUM_EXAMPLES, figsize=(10,2))
  for i in range(NUM_EXAMPLES):
    axs[i].imshow(plt.imread(os.path.join(label_dir, example_filenames[i])))
    axs[i].get_xaxis().set_visible(False)
    axs[i].get_yaxis().set_visible(False)
  fig.suptitle(f'Showing {NUM_EXAMPLES} examples for {label}')

plt.show()
```

### 创建数据集 (Create dataset)

机器学习训练数据可能很大,包含成百上千个文件,通常无法放入可用内存。您还必须将其分成不同的用途组:训练、测试和验证。因此,Model Maker 使用 `Dataset` 类来组织训练数据并将其提供给重新训练过程。

要创建数据集,请使用 `Dataset.from_folder` 方法加载位于 `image_path` 的数据,并将其分为训练、测试和验证组:

```
data = image_classifier.Dataset.from_folder(image_path)
train_data, remaining_data = data.split(0.8)
test_data, validation_data = remaining_data.split(0.5)
```

在此示例中,80% 的数据用于训练,其余数据对半分,因此总量的 10% 用于测试,10% 用于验证。

## 重新训练模型 (Retrain model)

完成数据准备后,您可以开始重新训练模型,以构建一个能够识别训练数据所定义类别的新分类层。这种模型修改方式称为[迁移学习 (transfer learning)](https://www.wikipedia.org/wiki/Transfer_learning)。以下说明使用上一节准备的数据,重新训练一个图像分类模型以识别不同类型的花朵。

> **注意:** 对于此类模型,重新训练过程会导致模型忘记其先前能够识别的任何类别。重新训练完成后,新模型*只能*识别从新数据集训练的类别。

### 设置重新训练选项 (Set retraining options)

除了训练数据集之外,运行重新训练还有几个必需设置:模型的输出目录和模型架构。使用 `HParams` 对象的 `export_dir` 参数指定模型输出目录。使用 `SupportedModels` 类指定模型架构。图像分类解决方案支持以下模型架构:

- `MobileNet-V2`
- `EfficientNet-Lite0`
- `EfficientNet-Lite2`
- `EfficientNet-Lite4`

要设置所需参数,请使用以下代码:

```
spec = image_classifier.SupportedModels.MOBILENET_V2
hparams = image_classifier.HParams(export_dir="exported_model")
options = image_classifier.ImageClassifierOptions(supported_model=spec, hparams=hparams)
```

此示例代码使用 MobileNetV2 模型架构,您可以从 [MobileNetV2](https://arxiv.org/abs/1801.04381) 研究论文中了解更多信息。重新训练过程还有许多其他选项,但其中大部分已为您自动设置。您可以在[重新训练参数](#retraining_parameters)部分了解这些可选参数。

### 运行重新训练 (Run retraining)

准备好训练数据集和重新训练选项后,即可开始重新训练过程。此过程占用大量资源,根据您可用的计算资源,可能需要几分钟到几小时。在使用标准 CPU 处理的 Google Colab 环境中,下面的示例重新训练约需 20 分钟,在约 4000 张图像上训练。使用 GPU 处理器通常可以缩短训练时间。

要开始重新训练过程,请使用 `create()` 方法以及先前定义的数据集和选项:

```
model = image_classifier.ImageClassifier.create(
    train_data = train_data,
    validation_data = validation_data,
    options=options,
)
```

### 评估性能 (Evaluate performance)

重新训练模型后,您应在测试数据集上评估它,该数据集通常是原始数据集中未用于训练的部分。精度在 0.8 到 0.9 之间通常被认为是非常好的,但您的用例要求可能有所不同。您还应考虑模型产生推理的速度。更高的精度通常以更长的推理时间为代价。

要对示例模型进行评估,请在数据集的测试部分上运行它:

```
loss, acc = model.evaluate(test_data)
print(f'Test loss:{loss}, Test accuracy:{acc}')
```

> **注意:** 虽然高精度是机器学习模型的常见目标,但您应警惕训练到[过拟合 (overfitting)](https://en.wikipedia.org/wiki/Overfitting) 的程度,这会导致模型在训练数据上表现极好,但在新数据上表现很差。

## 导出模型 (Export model)

重新训练模型后,您必须将其导出为 TensorFlow Lite 模型格式,以便在应用程序中与 MediaPipe 一起使用。导出过程会生成所需的模型元数据以及分类标签文件。

要将重新训练的模型导出以供您的应用使用,请使用以下命令:

```
model.export_model()
```

在 Google Colab 中使用以下命令列出模型并将其下载到您的开发环境:

```
!ls exported_model
files.download('exported_model/model.tflite')
```

## 模型调优 (Model tuning)

您可以使用 MediaPipe Model Maker 工具,通过配置选项和性能技术(例如数据量化)进一步改进和调整模型重新训练。*这些步骤为可选步骤。* Model Maker 对所有训练配置参数使用合理的默认设置,但如果您想进一步调整模型重新训练,以下说明描述了可用选项。

### 重新训练参数 (Retraining parameters)

您可以进一步自定义重新训练过程的运行方式,以调整训练时间并可能提高重新训练模型的性能。*这些参数为可选参数。* 使用 `ImageClassifierModelOptions` 类和 `HParams` 类设置这些附加选项。

使用 `ImageClassifierModelOptions` 类的参数自定义现有模型。它有以下影响模型精度的可自定义参数:

- `dropout_rate`:要丢弃的输入单元比例。用于 dropout 层。默认为 0.05。

使用 `HParams` 类自定义与训练和保存模型相关的其他参数:

- `learning_rate`:用于梯度下降训练的学习率。默认为 0.001。
- `batch_size`:训练的批大小。默认为 2。
- `epochs`:数据集上的训练迭代次数。默认为 10。
- `steps_per_epoch`:可选整数,表示每个 epoch 的训练步数。如果未设置,训练流程将每个 epoch 的默认步数计算为训练数据集大小除以批大小。
- `shuffle`:如果为 True,则在训练前对数据集进行洗牌。默认为 False。
- `do_fine_tuning`:如果为 true,则基础模块与顶部的分类层一起训练。默认为 False,这意味着只训练分类层,基础模块的预训练权重被冻结。
- `l1_regularizer`:应用 L1 正则化惩罚的正则化器。默认为 0.0。
- `l2_regularizer`:应用 L2 正则化惩罚的正则化器。默认为 0.0001。
- `label_smoothing`:要应用的标签平滑量。详情请参阅 [`tf.keras.losses`](https://www.tensorflow.org/api_docs/python/tf/keras/losses)。默认为 0.1。
- `do_data_augmentation`:是否通过应用裁剪、翻转等随机变换来增强训练数据集。详情请参阅 [utils.image\_preprocessing](https://www.tensorflow.org/api_docs/python/tf/keras/preprocessing/image)。默认为 True。
- `decay_samples`:用于计算衰减步数并创建训练优化器的训练样本数。默认为 2,560,000。
- `warmup_epochs`:学习率线性递增预热计划的预热步数。用于通过 `model_util.WarmUp` 设置预热计划。默认为 2。

以下示例代码训练一个具有更多 epoch 和更高 dropout 率的模型:

```
hparams=image_classifier.HParams(epochs=15, export_dir="exported_model_2")
options = image_classifier.ImageClassifierOptions(supported_model=spec, hparams=hparams)
options.model_options = image_classifier.ModelOptions(dropout_rate = 0.07)
model_2 = image_classifier.ImageClassifier.create(
    train_data = train_data,
    validation_data = validation_data,
    options=options,
)
```

要评估上面新训练的模型,请使用以下代码:

```
loss, accuracy = model_2.evaluate(test_data)
```

有关受支持模型总体性能的更多信息,请参阅[性能基准](#performance_benchmarks)部分。

### 模型量化 (Model quantization)

训练后模型量化是一种模型修改技术,可以减小模型大小并提高预测速度,而精度只会相对较小幅度的下降。该方法减少了模型处理的数据大小,例如将 32 位浮点数转换为 8 位整数。该技术被广泛用于在训练过程后进一步优化模型。

本指南的这一节说明如何对重新训练的模型应用量化。此优化必须在 Model Maker 模型导出过程中完成,不能在已导出的模型上执行。以下示例演示了如何使用此方法对重新训练的模型应用 `int8` 量化。有关训练后量化的更多信息,请参阅 [TensorFlow Lite](https://www.tensorflow.org/lite/performance/post_training_quantization) 文档。

导入 MediaPipe Model Maker 量化模块:

```
from mediapipe_model_maker import quantization
```

使用 `for_int8()` 类方法定义 `QuantizationConfig` 对象。此配置修改训练好的模型,使用 8 位整数而不是更大的数据类型(例如 32 位浮点数)。您可以通过为 `QuantizationConfig` 类设置附加参数来进一步自定义量化过程。

```
quantization_config = quantization.QuantizationConfig.for_int8(train_data)
```

`for_int8()` 方法需要代表性数据集,而 `dynamic()` 和 `for_float16()` 量化方法则不需要。量化过程使用代表性数据集执行模型修改,您通常为此目的使用现有的训练数据集。有关过程和选项的更多信息,请参阅 TensorFlow Lite [训练后量化](https://www.tensorflow.org/lite/performance/post_training_quantization) 指南。

使用附加的 `quantization_config` 对象导出模型,以应用训练后量化:

```
model.export_model(model_name="model_int8.tflite", quantization_config=quantization_config)
```

运行此命令后,您应该会得到一个新的 `model_int8.tflite` 模型文件。这个新的量化模型应明显小于 `model.tflite` 文件。您可以使用以下命令比较大小:

```
ls -lh exported_model
```

## 性能基准 (Performance benchmarks)

以下是我们对受支持模型架构的基准测试结果摘要。这些模型与本笔记本一样,在同一花朵数据集上训练和评估。在考虑模型基准测试结果时,需要记住几个重要注意事项:

- 测试精度一列反映的是使用默认参数训练的模型。要优化模型性能,请尝试不同的模型和重新训练参数以获得最高的测试精度。有关自定义这些设置的更多信息,请参阅[重新训练参数](#retraining_parameters)部分。
- 较大的模型架构(如 EfficientNet\_Lite4)在简单数据集(如本笔记本使用的花朵数据集)上可能无法达到最高的测试精度。研究表明,在更复杂的数据集(如图像数量超过一百万、类别达 1000 类的 ImageNet)上,这些较大的模型架构可以优于其他架构,更多信息请参阅 [EfficientNet 论文](https://arxiv.org/pdf/1905.11946.pdf)。ImageNet 数据集更复杂,拥有超过一百万个训练图像和 1000 个类别,而花朵数据集只有 3670 个训练图像和 5 个类别。

| 模型架构 | 测试精度 | 模型大小 | CPU 1 线程延迟(Pixel 6) | GPU 延迟(Pixel 6) | EdgeTPU 延迟(Pixel 6) |
| --- | --- | --- | --- | --- | --- |
| MobileNet\_V2 | 85.4% | **8.9MB** | 29.12 | 77.77 | 31.14 |
| EfficientNet\_Lite0 | 91.3% | 13.5MB | **15.6** | **9.25** | **16.72** |
| EfficientNet\_Lite2 | **91.5%** | 19.2MB | 35.2 | 13.94 | 37.52 |
| EfficientNet\_Lite4 | 90.8% | 46.8MB | 103.16 | 23.14 | 114.67 |

---

*页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。*