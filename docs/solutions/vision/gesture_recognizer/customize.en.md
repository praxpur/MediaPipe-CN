LAST_UPDATED: [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-06-05 UTC."],[],[]]

* [Home](https://developers.google.com/)
* [Products](https://developers.google.com/products)
* [Google AI Edge](https://developers.google.com/edge)
* [MediaPipe](https://developers.google.com/edge/mediapipe/solutions/guide)

Send feedback

# Hand gesture recognition model customization guide Stay organized with collections Save and categorize content based on your preferences.



[Colab logo Run in Colab](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/customization/gesture_recognizer.ipynb) | [GitHub logo View on GitHub](https://github.com/googlesamples/mediapipe/blob/main/examples/customization/gesture_recognizer.ipynb) |

### License information

Toggle code

```devsite-click-to-copy
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

[![Google for Developers](../../../../assets/gstatic/devrel-devsite/prod/v097103d8ccd7b257790809ea4cc5e5fee6daa6e24890a4af388296e58364bc31/developers/images/lockup-new.svg)](/)

`/`

* English
* Deutsch
* Español
* Français
* Indonesia
* Português – Brasil
* Русский
* 中文 – 简体
* 日本語
* 한국어

Sign in

* [Google AI Edge](https://developers.google.com/edge)

[LiteRT](https://developers.google.com/edge/litert)


* [Android](https://developers.google.com/edge/litert/android)
* [iOS & macOS](https://developers.google.com/edge/litert/ios/quickstart)
* [Web](https://developers.google.com/edge/litert/web)
* [Desktop](https://developers.google.com/edge/litert/next/python)
* [Embedded & IoT](https://developers.google.com/edge/litert/microcontrollers/overview)


[LiteRT-LM](https://developers.google.com/edge/litert-lm)

[MediaPipe](https://developers.google.com/edge/mediapipe/solutions/guide)


* [MediaPipe Solutions](https://developers.google.com/edge/mediapipe/solutions/guide)
* [MediaPipe Framework](https://developers.google.com/edge/mediapipe/framework)


[Model Explorer](https://developers.google.com/edge/model-explorer)

[AI Edge Portal](https://developers.google.com/edge/ai-edge-portal)

[Google Tensor SDK](https://developers.google.com/edge/tensor-sdk)


Apps

* [AI Edge Gallery](https://developers.google.com/edge/gallery)
* [AI Edge Eloquent](https://developers.google.com/edge/eloquent)
* [AI Edge Foresight](https://developers.google.com/edge/foresight)
* [MediaPipe Demos](https://google-ai-edge.github.io/mediapipe-samples-web)


[API Reference](https://developers.google.com/edge/api)



[![Google for Developers](../../../../assets/gstatic/devrel-devsite/prod/v097103d8ccd7b257790809ea4cc5e5fee6daa6e24890a4af388296e58364bc31/developers/images/lockup-new.svg)](/)

* [AI Edge](/edge)
  + [LiteRT](/edge/litert)
    - More
  + [LiteRT-LM](/edge/litert-lm)
  + [MediaPipe](/edge/mediapipe/solutions/guide)
    - More
  + [Model Explorer](/edge/model-explorer)
  + [AI Edge Portal](/edge/ai-edge-portal)
  + [Google Tensor SDK](/edge/tensor-sdk)
  + Apps
    - More
  + [API Reference](/edge/api)

* MediaPipe Solutions
* [Overview](/edge/mediapipe/solutions/guide)
* [Tasks](/edge/mediapipe/solutions/tasks)
* [Model Maker](/edge/mediapipe/solutions/model_maker)
* [Instant Demos](/edge/mediapipe/solutions/studio)
* Audio tasks
* Audio classification

  + [Overview](/edge/mediapipe/solutions/audio/audio_classifier)
  + [Android](/edge/mediapipe/solutions/audio/audio_classifier/android)
  + [iOS](/edge/mediapipe/solutions/audio/audio_classifier/ios)
  + [Python](/edge/mediapipe/solutions/audio/audio_classifier/python)
  + [Web](/edge/mediapipe/solutions/audio/audio_classifier/web_js)
* Decision tasks
* Decision maker

  + [Overview](/edge/mediapipe/solutions/decision/decision_maker)
  + [Android](/edge/mediapipe/solutions/decision/decision_maker/android)
  + [iOS](/edge/mediapipe/solutions/decision/decision_maker/ios)
  + [Python](/edge/mediapipe/solutions/decision/decision_maker/python)
  + [Web](/edge/mediapipe/solutions/decision/decision_maker/web_js)
  + [Best Practices](/edge/mediapipe/solutions/decision/decision_maker/best-practices)
* Generative AI tasks
* LLM Inference

  + [Overview](/edge/mediapipe/solutions/genai/llm_inference)
  + [Android](/edge/mediapipe/solutions/genai/llm_inference/android)
  + [iOS](/edge/mediapipe/solutions/genai/llm_inference/ios)
  + [Web](/edge/mediapipe/solutions/genai/llm_inference/web_js)
* Retrieval tasks
* Semantic retriever

  + [Overview](/edge/mediapipe/solutions/retrieval/semantic_retriever)
  + [Android](/edge/mediapipe/solutions/retrieval/semantic_retriever/android)
  + [iOS](/edge/mediapipe/solutions/retrieval/semantic_retriever/ios)
  + [Python](/edge/mediapipe/solutions/retrieval/semantic_retriever/python)
  + [Web](/edge/mediapipe/solutions/retrieval/semantic_retriever/web_js)
* Universal embedder

  + [Overview](/edge/mediapipe/solutions/retrieval/universal_embedder)
  + [Android](/edge/mediapipe/solutions/retrieval/universal_embedder/android)
  + [iOS](/edge/mediapipe/solutions/retrieval/universal_embedder/ios)
  + [Python](/edge/mediapipe/solutions/retrieval/universal_embedder/python)
  + [Web](/edge/mediapipe/solutions/retrieval/universal_embedder/web_js)
* Text tasks
* Language detection

  + [Overview](/edge/mediapipe/solutions/text/language_detector)
  + [Android](/edge/mediapipe/solutions/text/language_detector/android)
  + [iOS](/edge/mediapipe/solutions/text/language_detector/ios)
  + [Python](/edge/mediapipe/solutions/text/language_detector/python)
  + [Web](/edge/mediapipe/solutions/text/language_detector/web_js)
* Text classification

  + [Overview](/edge/mediapipe/solutions/text/text_classifier)
  + [Android](/edge/mediapipe/solutions/text/text_classifier/android)
  + [iOS](/edge/mediapipe/solutions/text/text_classifier/ios)
  + [Python](/edge/mediapipe/solutions/text/text_classifier/python)
  + [Web](/edge/mediapipe/solutions/text/text_classifier/web_js)
  + [Customize](/edge/mediapipe/solutions/customization/text_classifier)
* Text embedding

  + [Overview](/edge/mediapipe/solutions/text/text_embedder)
  + [Android](/edge/mediapipe/solutions/text/text_embedder/android)
  + [iOS](/edge/mediapipe/solutions/text/text_embedder/ios)
  + [Python](/edge/mediapipe/solutions/text/text_embedder/python)
  + [Web](/edge/mediapipe/solutions/text/text_embedder/web_js)
* Text proofreading

  + [Overview](/edge/mediapipe/solutions/text/text_proofreader)
  + [Android](/edge/mediapipe/solutions/text/text_proofreader/android)
  + [iOS](/edge/mediapipe/solutions/text/text_proofreader/ios)
  + [Python](/edge/mediapipe/solutions/text/text_proofreader/python)
* Text summarization

  + [Overview](/edge/mediapipe/solutions/text/text_summarizer)
  + [Android](/edge/mediapipe/solutions/text/text_summarizer/android)
  + [iOS](/edge/mediapipe/solutions/text/text_summarizer/ios)
  + [Python](/edge/mediapipe/solutions/text/text_summarizer/python)
* Vision tasks
* Face detection

  + [Overview](/edge/mediapipe/solutions/vision/face_detector)
  + [Android](/edge/mediapipe/solutions/vision/face_detector/android)
  + [iOS](/edge/mediapipe/solutions/vision/face_detector/ios)
  + [Python](/edge/mediapipe/solutions/vision/face_detector/python)
  + [Web](/edge/mediapipe/solutions/vision/face_detector/web_js)
* Face landmark detection

  + [Overview](/edge/mediapipe/solutions/vision/face_landmarker)
  + [Android](/edge/mediapipe/solutions/vision/face_landmarker/android)
  + [iOS](/edge/mediapipe/solutions/vision/face_landmarker/ios)
  + [Python](/edge/mediapipe/solutions/vision/face_landmarker/python)
  + [Web](/edge/mediapipe/solutions/vision/face_landmarker/web_js)
* Gesture recognition

  + [Overview](/edge/mediapipe/solutions/vision/gesture_recognizer)
  + [Android](/edge/mediapipe/solutions/vision/gesture_recognizer/android)
  + [iOS](/edge/mediapipe/solutions/vision/gesture_recognizer/ios)
  + [Python](/edge/mediapipe/solutions/vision/gesture_recognizer/python)
  + [Web](/edge/mediapipe/solutions/vision/gesture_recognizer/web_js)
  + [Customize](/edge/mediapipe/solutions/customization/gesture_recognizer)
* Hand landmark detection

  + [Overview](/edge/mediapipe/solutions/vision/hand_landmarker)
  + [Android](/edge/mediapipe/solutions/vision/hand_landmarker/android)
  + [iOS](/edge/mediapipe/solutions/vision/hand_landmarker/ios)
  + [Python](/edge/mediapipe/solutions/vision/hand_landmarker/python)
  + [Web](/edge/mediapipe/solutions/vision/hand_landmarker/web_js)
* Holistic landmark detection

  + [Overview](/edge/mediapipe/solutions/vision/holistic_landmarker)
  + [Android](/edge/mediapipe/solutions/vision/holistic_landmarker/android)
  + [iOS](/edge/mediapipe/solutions/vision/holistic_landmarker/ios)
  + [Python](/edge/mediapipe/solutions/vision/holistic_landmarker/python)
  + [Web](/edge/mediapipe/solutions/vision/holistic_landmarker/web_js)
* Image classification

  + [Overview](/edge/mediapipe/solutions/vision/image_classifier)
  + [Android](/edge/mediapipe/solutions/vision/image_classifier/android)
  + [iOS](/edge/mediapipe/solutions/vision/image_classifier/ios)
  + [Python](/edge/mediapipe/solutions/vision/image_classifier/python)
  + [Web](/edge/mediapipe/solutions/vision/image_classifier/web_js)
  + [Customize](/edge/mediapipe/solutions/customization/image_classifier)
* Image embedding

  + [Overview](/edge/mediapipe/solutions/vision/image_embedder)
  + [Android](/edge/mediapipe/solutions/vision/image_embedder/android)
  + [iOS](/edge/mediapipe/solutions/vision/image_embedder/ios)
  + [Python](/edge/mediapipe/solutions/vision/image_embedder/python)
  + [Web](/edge/mediapipe/solutions/vision/image_embedder/web_js)
* Image segmentation

  + [Overview](/edge/mediapipe/solutions/vision/image_segmenter)
  + [Android](/edge/mediapipe/solutions/vision/image_segmenter/android)
  + [iOS](/edge/mediapipe/solutions/vision/image_segmenter/ios)
  + [Python](/edge/mediapipe/solutions/vision/image_segmenter/python)
  + [Web](/edge/mediapipe/solutions/vision/image_segmenter/web_js)
* Interactive segmentation

  + [Overview](/edge/mediapipe/solutions/vision/interactive_segmenter)
  + [Android](/edge/mediapipe/solutions/vision/interactive_segmenter/android)
  + [Python](/edge/mediapipe/solutions/vision/interactive_segmenter/python)
  + [Web](/edge/mediapipe/solutions/vision/interactive_segmenter/web_js)
* Object detection

  + [Overview](/edge/mediapipe/solutions/vision/object_detector)
  + [Android](/edge/mediapipe/solutions/vision/object_detector/android)
  + [iOS](/edge/mediapipe/solutions/vision/object_detector/ios)
  + [Python](/edge/mediapipe/solutions/vision/object_detector/python)
  + [Web](/edge/mediapipe/solutions/vision/object_detector/web_js)
  + [Customize](/edge/mediapipe/solutions/customization/object_detector)
* Pose landmark detection

  + [Overview](/edge/mediapipe/solutions/vision/pose_landmarker)
  + [Android](/edge/mediapipe/solutions/vision/pose_landmarker/android)
  + [iOS](/edge/mediapipe/solutions/vision/pose_landmarker/ios)
  + [Python](/edge/mediapipe/solutions/vision/pose_landmarker/python)
  + [Web](/edge/mediapipe/solutions/vision/pose_landmarker/web_js)
* Platform setup guides
* [Android setup](/edge/mediapipe/solutions/setup_android)
* [iOS setup](/edge/mediapipe/solutions/setup_ios)
* [Python setup](/edge/mediapipe/solutions/setup_python)
* [Web setup](/edge/mediapipe/solutions/setup_web)
* Build from source
* [Build Python Wheel Package](/edge/mediapipe/solutions/build_python)
* MediaPipe Framework
* [Overview](/edge/mediapipe/framework)
* [Installation](/edge/mediapipe/framework/getting_started/install)
* Getting started
* Framework on Android

  + [Overview](/edge/mediapipe/framework/getting_started/android)
  + [Hello world!](/edge/mediapipe/framework/getting_started/hello_world_android)
  + [Android Archive](/edge/mediapipe/framework/getting_started/android_archive_library)
* Framework on iOS

  + [Overview](/edge/mediapipe/framework/getting_started/ios)
  + [Hello world!](/edge/mediapipe/framework/getting_started/hello_world_ios)
* [Framework in Python](/edge/mediapipe/framework/getting_started/python_framework)
* Framework in C++

  + [Overview](/edge/mediapipe/framework/getting_started/cpp)
  + [Hello world!](/edge/mediapipe/framework/getting_started/hello_world_cpp)
* Framework concepts
* [Overview](/edge/mediapipe/framework/framework_concepts/overview)
* [Calculators](/edge/mediapipe/framework/framework_concepts/calculators)
* Graphs

  + [Overview](/edge/mediapipe/framework/framework_concepts/graphs)
  + [Building graphs with C++](/edge/mediapipe/framework/framework_concepts/graphs_cpp)
* [Packets](/edge/mediapipe/framework/framework_concepts/packets)
* [Synchronization](/edge/mediapipe/framework/framework_concepts/synchronization)
* [GPU](/edge/mediapipe/framework/framework_concepts/gpu)
* [Real-time Streams](/edge/mediapipe/framework/framework_concepts/realtime_streams)
* Framework tools
* [Visualizer](/edge/mediapipe/framework/tools/visualizer)
* Resources
* [Getting Help](/edge/mediapipe/framework/getting_started/help)
* [FAQ](/edge/mediapipe/framework/getting_started/faq)
* [Troubleshooting](/edge/mediapipe/framework/getting_started/troubleshooting)
* [GPU Support](/edge/mediapipe/framework/getting_started/gpu_support)

* [Android](/edge/litert/android)
* [iOS & macOS](/edge/litert/ios/quickstart)
* [Web](/edge/litert/web)
* [Desktop](/edge/litert/next/python)
* [Embedded & IoT](/edge/litert/microcontrollers/overview)

* [MediaPipe Solutions](/edge/mediapipe/solutions/guide)
* [MediaPipe Framework](/edge/mediapipe/framework)

* [AI Edge Gallery](/edge/gallery)
* [AI Edge Eloquent](/edge/eloquent)
* [AI Edge Foresight](/edge/foresight)
* [MediaPipe Demos](https://google-ai-edge.github.io/mediapipe-samples-web)

* [Home](https://developers.google.com/)
* [Products](https://developers.google.com/products)
* [Google AI Edge](https://developers.google.com/edge)
* [MediaPipe](https://developers.google.com/edge/mediapipe/solutions/guide)

Send feedback

# Hand gesture recognition model customization guide Stay organized with collections Save and categorize content based on your preferences.



[Colab logo Run in Colab](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/customization/gesture_recognizer.ipynb) | [GitHub logo View on GitHub](https://github.com/googlesamples/mediapipe/blob/main/examples/customization/gesture_recognizer.ipynb) |

### License information

Toggle code

```devsite-click-to-copy
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

**Deprecated:** MediaPipe Model Maker is still available, but is no longer actively
maintained.

The MediaPipe Model Maker package is a low-code solution for customizing on-device machine learning (ML) Models.

This notebook shows the end-to-end process of customizing a gesture recognizer model for recognizing some common hand gestures in the [HaGRID](https://www.kaggle.com/datasets/innominate817/hagrid-sample-30k-384p) dataset.

## Prerequisites

Install the MediaPipe Model Maker package.

```devsite-click-to-copy
pip install --upgrade pip
pip install mediapipe-model-maker
```

Import the required libraries.

```devsite-click-to-copy
from google.colab import files
import os
import tensorflow as tf
assert tf.__version__.startswith('2')

from mediapipe_model_maker import gesture_recognizer

import matplotlib.pyplot as plt
```

## Simple End-to-End Example

This end-to-end example uses Model Maker to customize a model for on-device gesture recognition.

### Get the dataset

The dataset for gesture recognition in model maker requires the following format: `<dataset_path>/<label_name>/<img_name>.*`. In addition, one of the label names (`label_names`) must be `none`. The `none` label represents any gesture that isn't classified as one of the other gestures.

This example uses a rock paper scissors dataset sample which is downloaded from GCS.

```devsite-click-to-copy
!wget https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/rps_data_sample.zip
!unzip rps_data_sample.zip
dataset_path = "rps_data_sample"
```

Verify the rock paper scissors dataset by printing the labels. There should be 4 gesture labels, with one of them being the `none` gesture.

```devsite-click-to-copy
print(dataset_path)
labels = []
for i in os.listdir(dataset_path):
  if os.path.isdir(os.path.join(dataset_path, i)):
    labels.append(i)
print(labels)
```

To better understand the dataset, plot a couple of example images for each gesture.

```devsite-click-to-copy
NUM_EXAMPLES = 5

for label in labels:
  label_dir = os.path.join(dataset_path, label)
  example_filenames = os.listdir(label_dir)[:NUM_EXAMPLES]
  fig, axs = plt.subplots(1, NUM_EXAMPLES, figsize=(10,2))
  for i in range(NUM_EXAMPLES):
    axs[i].imshow(plt.imread(os.path.join(label_dir, example_filenames[i])))
    axs[i].get_xaxis().set_visible(False)
    axs[i].get_yaxis().set_visible(False)
  fig.suptitle(f'Showing {NUM_EXAMPLES} examples for {label}')

plt.show()
```

### Run the example

The workflow consists of 4 steps which have been separated into their own code blocks.

**Load the dataset**

Load the dataset located at `dataset_path` by using the `Dataset.from_folder` method. When loading the dataset, run the pre-packaged hand detection model from MediaPipe Hands to detect the hand landmarks from the images. Any images without detected hands are ommitted from the dataset. The resulting dataset will contain the extracted hand landmark positions from each image, rather than images themselves.

The `HandDataPreprocessingParams` class contains two configurable options for the data loading process:

* `shuffle`: A boolean controlling whether to shuffle the dataset. Defaults to true.
* `min_detection_confidence`: A float between 0 and 1 controlling the confidence threshold for hand detection.

Split the dataset: 80% for training, 10% for validation, and 10% for testing.

```devsite-click-to-copy
data = gesture_recognizer.Dataset.from_folder(
    dirname=dataset_path,
    hparams=gesture_recognizer.HandDataPreprocessingParams()
)
train_data, rest_data = data.split(0.8)
validation_data, test_data = rest_data.split(0.5)
```

**Train the model**

Train the custom gesture recognizer by using the create method and passing in the training data, validation data, model options, and hyperparameters. For more information on model options and hyperparameters, see the [Hyperparameters](#hyperparameters) section below.

```devsite-click-to-copy
hparams = gesture_recognizer.HParams(export_dir="exported_model")
options = gesture_recognizer.GestureRecognizerOptions(hparams=hparams)
model = gesture_recognizer.GestureRecognizer.create(
    train_data=train_data,
    validation_data=validation_data,
    options=options
)
```

**Evaluate the model performance**

After training the model, evaluate it on a test dataset and print the loss and accuracy metrics.

```devsite-click-to-copy
loss, acc = model.evaluate(test_data, batch_size=1)
print(f"Test loss:{loss}, Test accuracy:{acc}")
```

**Export to Tensorflow Lite Model**

After creating the model, convert and export it to a Tensorflow Lite model format for later use on an on-device application. The export also includes model metadata, which includes the label file.

```devsite-click-to-copy
model.export_model()
!ls exported_model
```

```devsite-click-to-copy
files.download('exported_model/gesture_recognizer.task')
```

## Run the model on-device

To use the TFLite model for on-device usage through MediaPipe Tasks, refer to the Gesture Recognizer [overview page](https://developers.google.com/mediapipe/solutions/vision/gesture_recognizer).

## Hyperparameters

You can further customize the model using the `GestureRecognizerOptions` class, which has two optional parameters for `ModelOptions` and `HParams`. Use the `ModelOptions` class to customize parameters related to the model itself, and the `HParams` class to customize other parameters related to training and saving the model.

`ModelOptions` has one customizable parameter that affects accuracy:

* `dropout_rate`: The fraction of the input units to drop. Used in dropout layer. Defaults to 0.05.
* `layer_widths`: A list of hidden layer widths for the gesture model. Each element in the list will create a new hidden layer with the specified width. The hidden layers are separated with BatchNorm, Dropout, and ReLU. Defaults to an empty list(no hidden layers).

`HParams` has the following list of customizable parameters which affect model accuracy:

* `learning_rate`: The learning rate to use for gradient descent training. Defaults to 0.001.
* `batch_size`: Batch size for training. Defaults to 2.
* `epochs`: Number of training iterations over the dataset. Defaults to 10.
* `steps_per_epoch`: An optional integer that indicates the number of training steps per epoch. If not set, the training pipeline calculates the default steps per epoch as the training dataset size divided by batch size.
* `shuffle`: True if the dataset is shuffled before training. Defaults to False.
* `lr_decay`: Learning rate decay to use for gradient descent training. Defaults to 0.99.
* `gamma`: Gamma parameter for focal loss. Defaults to 2

Additional `HParams` parameter that does not affect model accuracy:

* `export_dir`: The location of the model checkpoint files and exported model files.

For example, the following trains a new model with the dropout\_rate of 0.2 and learning rate of 0.003.

```devsite-click-to-copy
hparams = gesture_recognizer.HParams(learning_rate=0.003, export_dir="exported_model_2")
model_options = gesture_recognizer.ModelOptions(dropout_rate=0.2)
options = gesture_recognizer.GestureRecognizerOptions(model_options=model_options, hparams=hparams)
model_2 = gesture_recognizer.GestureRecognizer.create(
    train_data=train_data,
    validation_data=validation_data,
    options=options
)
```

Evaluate the newly trained model.

```devsite-click-to-copy
loss, accuracy = model_2.evaluate(test_data)
print(f"Test loss:{loss}, Test accuracy:{accuracy}")
```







Send feedback


Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.

Last updated 2026-06-05 UTC.




Need to tell us more?

[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-06-05 UTC."],[],[]]





* ### Engage

  + [Google Developer Program](/program)
  + [Google Developer Groups](/community)
  + [Google Developer Experts](/community/experts)
  + [Accelerators](/community/accelerators)
  + [Google Cloud & NVIDIA](/community/nvidia)
* ### Connect

  + [Blog](//googledevelopers.blogspot.com)
  + [Bluesky](https://bsky.app/profile/developers.google.com)
  + [Instagram](https://www.instagram.com/googlefordevs/)
  + [LinkedIn](https://www.linkedin.com/showcase/googledevelopers/)
  + [X (Twitter)](//twitter.com/googledevs)
  + [YouTube](//www.youtube.com/user/GoogleDevelopers)
* ### Build

  + [Android](https://developer.android.com/)
  + [Chrome](https://developer.chrome.com/)
  + [Firebase](https://firebase.google.com/)
  + [Google AI Studio](https://aistudio.google.com/)
  + [Google Antigravity](https://antigravity.google/)
  + [Google Cloud](https://cloud.google.com/)
  + [Google Play](https://play.google.com/console/about/)
  + [View all](/products)


[![Google Developers](../../../../assets/gstatic/devrel-devsite/prod/v097103d8ccd7b257790809ea4cc5e5fee6daa6e24890a4af388296e58364bc31/developers/images/lockup-google-for-developers.svg)](https://developers.google.com/)

* [Android](//developer.android.com)
* [Chrome](//developer.chrome.com/home)
* [Firebase](//firebase.google.com)
* [Google Cloud Platform](//cloud.google.com)
* [Google AI](//ai.google.dev/)
* [All products](/products)


* [Terms](/terms/site-terms)
* [Privacy](//policies.google.com/privacy)
* [Manage cookies](#)

* English
* Deutsch
* Español
* Français
* Indonesia
* Português – Brasil
* Русский
* 中文 – 简体
* 日本語
* 한국어