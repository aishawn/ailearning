12条金牌法则！南洋理工&中山大学等提出VLANeXt：25亿参数刷新VLA性能榜单
jushen 非具身不智能
 2026年2月27日 21:26 江苏 听全文


现在的机器人大模型（Vision-Language-Action models, VLAs）领域，给人的感觉就像是一锅“原始汤”——想法很多，但各家有各家的做法。虽然 RT-2 和 OpenVLA 已经打下了基础，但由于训练协议和评估标准乱成一团，开发者们很难看清到底哪些设计才是真正的“财富密码”。
为了给这个碎片化的空间理出头绪，来自南洋理工大学、中山大学、上海交通大学以及商汤科技等机构的研究者们，决定做一次彻底的“大扫除”。他们系统地重新审视了 VLA 的设计空间，并总结出了一套构建强力模型的实战配方。基于这些发现，他们打造出了一个简单却异常强大的模型，命名为 VLANeXt。


该模型被命名为 VLANeXt，其中“VLA”代表了其核心的视觉-语言-动作架构，而“NeXt”则寓意着它是对现有经典模型（如 RT-2、OpenVLA）的下一代演进。作者希望通过这套“配方”，让 VLA 的构建不再是靠运气，而是有迹可循。


• 论文地址: https://arxiv.org/abs/2602.18532
• 项目主页: https://dravenalg.github.io/VLANeXt
• 代码仓库: https://github.com/DravenALG/VLANeXt（已开源）
，时长01:09
背景与动机：为什么要做这次“大扫除”？
在 VLA 的研究中，大家通常会把预训练的视觉语言大模型（Vision-Language Model, VLM）作为“大脑”，去处理视觉观察和语言指令。但在这个过程中，选择实在是太多了：VLM 和策略模块怎么连接？动作怎么表示？需不需要加入机器人自身的关节状态（即本体感受，Proprioception）？
以往的研究往往只关注某一个点，而且实验环境各异，很难横向对比。作者们从一个类似 RT-2 的简单基线出发，像剥洋葱一样，沿着基础组件、感知要素、动作建模三个维度，一步步测试各种设计的实际效果。


消融实验轨迹图
如上图所示，通过不断的优化，模型性能稳步攀升。最让人惊喜的是，即便模型规模仅有 25 亿参数（2.5B），在处理复杂任务时却比 70 亿参数（7B）的 OpenVLA-OFT 还要强。
方法详解：VLANeXt 的“金牌配方”
作者首先建立了一个基准模型：使用 LLaMA 3.2 (3B) 作为语言主干，搭配 SigLIP2 作为视觉编码器。随后，他们通过 12 条核心发现，逐步将其进化为 VLANeXt。
1. 基础组件的重构
在传统的 RT-2 架构中，动作被离散化为文本 Token。但 VLANeXt 发现：
• 策略模块解耦：不要直接复用文本 Token 空间。通过引入一个独立的、更深层的策略模块（16个 Token，12层 Transformer），性能得到了显著提升。
• 连续动作建模：相比于分类（Classification），使用回归（Regression）或 流匹配（Flow Matching） 效果更好。Flow Matching 能够更好地处理复杂的多峰动作分布。
• 动作块（Action Chunking）：一次预测未来多步动作（如 8 步），比单步预测更能保持动作的连贯性。
2. 软连接（Soft Connection）是关键
VLM 和策略模块（Policy Module）之间该怎么沟通？论文对比了三种方案：
• 松散连接（Loose）：两者完全解耦，VLM 的输出作为策略模块的输入。
• 紧密连接（Tight）：逐层硬连接，类似于  系列模型。
• 软连接（Soft）：在两模块间插入可学习的查询（Query）缓冲区，进行逐层交互。


连接方式对比
实验发现，软连接 的效果最好。这种设计就像是在大脑和手之间加了一个缓冲层，能更有效地传递有用的表征，而不是生搬硬套。
3. 感知要素：本体感受该放哪儿？
机器人自身的关节状态（本体感受）对操作至关重要。很多人习惯把它直接塞进策略头，但 VLANeXt 的研究表明：将本体感受输入 VLM 端 效果更佳。


本体感受接入位置
这样做的好处是让视觉、语言和机器人自身状态在底层就进行深度融合。此外，研究还发现，多视角输入（第三人称+手腕相机） 是刚需，而冗余的历史帧反而可能引入噪声。
4. 频域损失：低成本的“神技”
为了让动作预测更精准，很多人会尝试加入“世界模型”（World Modelling），即让模型预测未来的画面。这确实有用，但训练成本会暴增三倍。
VLANeXt 提出了一个非常聪明的替代方案：频域辅助损失。通过离散余弦变换（Discrete Cosine Transform, DCT）将动作序列转到频域进行建模：

其中  是预测动作， 是真实动作。这个改动几乎不增加计算开销，但带来的性能提升甚至超过了昂贵的世界模型。


VLANeXt 整体架构
最终的 VLANeXt 架构如上图所示：它采用了 Qwen3-VL-2B 作为主干，结合了多视角视觉输入、语言指令和本体感受，通过软连接驱动策略模块，并利用 Flow Matching 和频域损失来生成动作块。
实验与结果：小身材也有大能量
研究团队在 LIBERO 生态系统上进行了详尽的评估。LIBERO 包含 Spatial（空间）、Object（物体）、Goal（目标）和 Long（长程）四个套件，每个套件有 10 个任务，共 500 条专家演示。
1. 性能刷新榜单
在标准的 LIBERO 基准测试中，VLANeXt 以 2.5B 的参数量拿到了 97.4% 的平均成功率，超越了 7B 规模的 OpenVLA-OFT。


LIBERO 性能对比表
2. 更好的鲁棒性
真正的考验在于 LIBERO-plus，这里引入了各种未见的扰动，比如灯光变化、背景切换、相机位姿偏移等。在这种极端情况下，VLANeXt 依然稳健，平均成功率达到 80.1%，比之前的 SOTA 提升了整整 10.5%！


LIBERO-plus 鲁棒性对比
3. 真实世界部署
在真实世界中，研究者也在 Franka Emika 单臂和 Aloha 双臂系统上进行了验证。训练时先在 DROID 数据集上预训练 10 万步，再针对特定任务微调。即便每项任务只用了 50 个演示样本，VLANeXt 依然展现出了极强的适应能力，成功完成了清理桌面、拉抽屉等任务。在双臂协作的“抬篮子”任务中，成功率达到了 15/20，显著优于 。


真实世界任务演示
写在最后
VLANeXt 实践试图给我们一个很重要的启示：在追求机器人通用性的道路上，盲目追求模型规模（Scaling）并不是唯一的出路。通过对信息注入位置、模块连接方式以及动作时域结构的精细设计，小规模模型同样能爆发巨大的潜力。
特别是论文中提到的“软连接”和“频域损失”，为解决 VLM 与机器人策略之间的协同问题提供了优雅的方案。
你认为在 VLA 模型中，还有哪些被忽视的设计细节是决定成败的关键？欢迎在评论区分享你的看法。


入群加好友(v:xiao-ma-baoli)，请备注你感兴趣的技术方向
阅读 308
​
留言
写留言

来自 <https://mp.weixin.qq.com/s?__biz=MzAxNDg2MDYxNQ==&mid=2247485710&idx=1&sn=3bd60648801cb357c838d5a4273cf43e&chksm=9ab5c55fbeb537813612b240f1b5f08d8491ab9aae16d6718cc3b96ea7c42cddf01063443a32&mpshare=1&scene=1&srcid=02283k8BvVlwNcrcqdGar7ta&sharer_shareinfo=f04dd0776065badad4b39bd63b09a481&sharer_shareinfo_first=3b501feef0cf4a7af6ee14928232b8ba&click_id=2&key=daf9bdc5abc4e8d01933f069534fa0bb1222d78d9d7b297b8d57037558ddbb10f82132d0ec342e9fea8c256d8358d0f6799dcaf6c39f1e72c195683489420eda88f90f97b26eb20399a266e2b7a054ea0f75610a892760c2faaf355558531cc37f23cd13fee1e7b256e9f105e28e321c795ea30847cc8fc0b7b0b8cd4599c7b6&ascene=1&uin=MTM4NjMzMzkyMQ%3D%3D&devicetype=UnifiedPCWindows&version=f254171e&lang=zh_CN&countrycode=CN&exportkey=n_ChQIAhIQzh9AV87VhBC3HzlwVNO6pBLnAQIE97dBBAEAAAAAAEN8DHoepPsAAAAOpnltbLcz9gKNyK89dVj0bfGTdtCQFDky7SYldfoSnjWKvDTmql7mdblxonthHkBFvk591gyOZUP%2FLYtmMQHnPpRuIXR0UMffd8we1jMIfE9bUxEmETz%2Buam76ml45jqydn3FQRztP9QrOazvKAw%2BudQ0UbvyVPXZz1Np6RdEySydhNoGDSP4X6y8MRJOxqHNPGg88aEdqz8Zw8c2OHWNE16MySj7Tl3lRDVPaIn7nalLzTSgfbPrlD3kzwjy4GM3BtJ1vEo%2FtOkxeqzs9PU%2F5g%3D%3D&acctmode=0&pass_ticket=6KWY4KVyB5OkhZwwt7asR0q3txAJd9bIfib%2FdzdTZBt7Mi%2F%2B7OfhvPsv3btkND0r&wx_header=0&fasttmpl_type=0&fasttmpl_fullversion=8149423-zh_CN-html&from_xworker=1> 
