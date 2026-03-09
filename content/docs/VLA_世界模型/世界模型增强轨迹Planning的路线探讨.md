## 1.问题：

不管是VLA，还是端到端，都可以抽象为， 环境信息→action 的映射。

我们为什么要使用world model来对 这种映射 进行增强呢？

那一定是：这种映射有什么问题；而且，这个问题，恰好是world model可以解决的。

我觉得，只有把这个思考清楚，使用worldmodel来增强轨迹规划的 逻辑，才能闭环。

### 1.1 思想层面的问题：

#### ① 人是怎么做的？

我学骑自行车的时候，开始关注怎么车头怎么转，转多少，骑出来一个蛇形路线。后来我哥跟我说，你不要看你眼前，你看远一些，盯着前方的目标。然后自然就好了，，，甚至，你的车头是歪的，只要能盯着前方的目标，就能骑得很好。

**我开始骑**：只看眼下，刻意关注车头怎么转，结果骑出了蛇形路线，这是简单的 **当前世界状态→轨迹** 的映射；

**我哥说的**：往前看，其实是，**先去想象一下**，接下来的“正常的、合理的”未来，作为目标；**然后做出**你的动作规划，**来实现**这个“正常的，合理的”未来。

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/4a65a4626232ffc8.png)

#### ② 直觉上：

当前世界状态→action 这个简单映射，是一种应激反应，属于被动的，不思考做这个action有什么后果；所以对于不熟悉的case，凭感觉，做出的动作可能是不合理的，甚至是危险的。

而world model是主动想象未来长什么样子，来决策现在。

### 1.2 模型层面的问题：

但我们不一定要模仿人类。就建模逻辑来说，环境信息→action 这个简单映射，有什么问题？

模型不知道执行这个动作，未来会怎么样。那也就是，**无从判断这个动作带来的结果是好，还是坏。**所以，可能就有危险动作，不合理的规划。

## 2.方案 1: 【当前世界状态→未来世界状态】 → action

**显式利用world model**

### 2.1 模型pipeline

**建立规划映射：[当前世界状态，未来世界状态]→action**

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/62b8c825e2809a86.png)

#### 第一阶段：获取隐空间

用dino或其他的，提取驾驶特征；

#### 第二阶段：基于navigation的world model，自监督，可做成大模型

1. 模仿学习：训一个预测模型，预测未来隐空间特征；
    
2. 强化学习：类似GPT的RL部分，比如判断预测的未来特征，是否“合理的，正常的”
    

第一阶段的特征编码要freeze

#### Note:

a. 和其他world model都不同的是，**是基于navigation的，而不是基于action的**; 如果是基于action，就存在鸡生蛋还是蛋生鸡的问题;

b. 这里的模型，可以不用LLM。类似Dino-world使用dino的feature做成大模型、gaia使用image压缩的token做大模型、LVM (Sequential Modeling Enables Scalable Learning for Large Vision Models)使用纯vision做成大模型。我们**也可以使用纯“视觉特征编码”做成大模型。**

#### 第三阶段：轨迹解码

学一个action解码，来学习什么样的action, 可以发生 当前世界状态→未来世界状态 的转移；

#### 自我评估：

潜力最大：逻辑上可以对模型和数据都scale

风险最大：需要对预测的未来比较准，比较合理，才行

### 2.2 相关工作：

#### 2024.07.08, Bevworld

BEVWorld: A Multimodal World Simulator for Autonomous Driving via Scene-Level BEV Latents

https://arxiv.org/abs/2407.05679

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/427001dc6fc73599.png)

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/a4a1846ef15c57c5.png)

**Note**：这只是bevworld的一个toy example，其worldmodel是基于action的，所以在这个实验中预测未来bev时，没有使用action(因为不知道)。所以其预测的bev是不准的。结果仅定性参考。

#### 2022.07.15, ST-P3

ST-P3: End-to-end Vision-based Autonomous Driving via Spatial-Temporal Feature Learning

https://arxiv.org/abs/2207.07601

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/6418537c2e27e47a.png)

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/f2d5df7669ab994a.png)

## 3.方案 2: 当前世界状态 →[未来世界状态，action]

**隐式利用world model**

### 3.1 模型pipeline

**当前世界状态 → [未来世界状态，action]**

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/e22e3575d1ea2508.png)

#### 第一阶段：隐空间

用dino或其他的，提取驾驶特征；

#### 第二阶段：轨迹和world model 协同训练

建立 当前世界状态 → [action, 未来世界状态]

**Note**: 和其他world model都不同的是，**是基于navigation的，而不是基于action的**; 如果是基于action，就存在鸡生蛋还是蛋生鸡的问题。

#### 自我评估：

相比 [当前世界状态→action] 的传统映射，多了个输出 未来帧 的任务。

这样的作用，一方面，action间接获取了所预测的未来帧的信息；

另一方面，是对特征的增强，使特征具备时序上的可预见性。

大概率会有用，但因为是隐式利用world model，感觉潜力比 方案1 要小一些，不过风险也要小一些。

### 3.2 相关工作：

#### 2025.03.27, CoT-VLA:

CoT-VLA: Visual Chain-of-Thought Reasoning for Vision-Language-Action Models

https://arxiv.org/abs/2503.22020

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/392ece22a8b72463.png)

其world model是基于cmd的，这个点，和上述方案类似。

#### 2025.01.16, Dima:

Distilling Multi-modal Large Language Models for Autonomous Driving

https://arxiv.org/abs/2501.09757

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/c765f369efca09b1.png)

Future BEV prediction: anticipating future events

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/0344028837fe09a9.png)

#### 2018.09.05, Dreaming about driving, Wayve Research

https://wayve.ai/thinking/dreaming-about-driving/

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/b57bc10a73f2cd37.png)

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/af504ed69e61258f.png)

## 4 方案3：【当前世界状态→action】→ 未来世界状态

**隐式利用world model**

### 4.1 模型pipeline

**建立映射：**

Module 1：当前世界状态→action 这样的传统映射

Module 2：[当前世界状态，action] →未来世界状态

训练时，action和未来帧同时有监督

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/0f9b74f036b981d8.png)

#### 第一阶段：隐空间

用dinov或其他的，提取驾驶特征；

#### 第二阶段：轨迹和world model 协同训练

Module 1：当前世界状态→action 这样的传统映射

Module 2：[当前世界状态，action] →未来世界状态

Module 1 和 Module 2，可以是两个模型，也可以是同一个模型。

这样其实和world VLA的建模思路非常接近，不同的是，world VLA的worldmodel (这里的Module 2)不对action反传梯度，而我们这里的world model（Module 2）可以对action反传梯度。world VLA的pipeline见下面"相关工作"。

#### 自我评估：

相比 【当前世界状态→action】 的传统映射，多了个 [当前世界状态, action]→未来世界状 的映射。

这样的作用，一方面，是对特征的增强，使特征具备时序上的可预见性；

另外一方面，对action多了个优化目标，就是action要能使 当前世界状态→未来世界状态 的状态转移 更加准确。

总之就是 特征增强和协同训练。大概率会有用，但因为action没有使用预测的未来世界状态的信息，效果可能比 方案2 要弱一些，风险估计和 方案2 差不多。另外，这个方案部署友好，因为部署时不需要Module 2。

### 4.2 相关工作：

#### 2025.06.26, WorldVLA:

WorldVLA: Towards Autoregressive Action World Model

https://arxiv.org/pdf/2506.21539

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/814f2a9b532c5e7f.png)

#### 2024.09.26, SSR：

Navigation-Guided Sparse Scene Representation for End-to-End Autonomous Driving

https://arxiv.org/abs/2409.18341

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/9c7dcf51cb9a5510.png)

#### 2024.06.12, LAW：

Enhancing End-to-End Autonomous Driving with Latent World Model

https://arxiv.org/abs/2406.08481

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/d3b7d91f0769a100.png)

#### 2024.05.07, DriveWorld：

DriveWorld: 4D Pre-trained Scene Understanding via World Models for Autonomous Driving

https://arxiv.org/abs/2405.04390

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/949b780707aa8b0b.png)

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/2ed7554e03c45801.png)

#### 2022.10.14， MILE:

Model-Based Imitation Learning for Urban Driving

https://arxiv.org/abs/2210.07729

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/01e41c77e00ddd3a.png)

#### 2020.03.16，Predicting the future， Wayve Research

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/c553490b5197bcee.png)

## 5 方案总结和对比分析

下表中，一个“→”表示一个映射

|方案类型|核心映射|模型pipeline|相关工作|自我评估|
|---|---|---|---|---|
|方案1：显式利用world model|[当前世界状态→未来世界状态]→action|1. 隐空间获取  <br>2. 基于navigation的world model（模仿学习预测未来特征+强化学习判断合理性）  <br>3. 轨迹解码|Bevworld (2024.07.08)、ST-P3 (2022.07.15)|潜力最大（验证实验支持），相对比较创新，但风险也比较大（预测的未来比较准确才起到作用，相关工作少）|
|方案2：隐式利用world model|当前世界状态→[未来世界状态, action]|1. 隐空间获取  <br>2. 轨迹与world model协同训练|CoT-VLA (2025.03.27)、Dima (2025.01.16)、Dreaming about driving (2018.09.05)|相比当前世界状态→action的传统映射，多了个输出未来帧的任务。这样的作用，一方面，action间接获取了所预测的未来帧的信息；另一方面，是对特征的增强，使特征具备时序上的可预见性。大概率会有用，但因为是隐式利用world model，感觉潜力比方案1要小一些，不过风险也要小一些。|
|方案3：隐式利用world model|[当前世界状态→action]→未来世界状态|1. 隐空间获取  <br>2. 两个映射协同训练（Module1：当前状态→action；Module2：[当前状态, action]→未来状态）|WorldVLA (2025.06.26)、SSR (2024.09.26)、LAW (2024.06.12)、DriveWorld(2024.05.07)、MILE (2022.10.14)、Predicting the future (2020.03.16)|相比当前世界状态→action的传统映射，多了个[当前世界状态, action]→未来世界状态的映射。这样的作用，一方面，是对特征的增强，使特征具备时序上的可预见性；另外一方面，对action多了个优化目标，就是action要能使当前世界状态→未来世界状态的状态转移更加准确。总之就是特征增强和协同训练。大概率会有用，但因为action没有使用预测的未来世界状态的信息，效果可能比方案2要弱一些，风险估计和方案2差不多。另外，部署友好，因为部署时不需要Module 2。|

---

现有的 worldmodel增强规划 的工作，基本都可以归为这三种类型中的一种。即便是新设计的方案，也大概率属于这三种的一种。

### 方案选型：

根据对这三个方案的自我评估：

效果潜力：方案 1 > 方案 2 > 方案 3

风险：方案 1 > 方案 2=方案 3

方案 1 感觉潜力更大，风险或许也更大。