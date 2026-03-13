
## 方法详解：三位一体的架构设计

Innovator-VL 采用了经典但经过深度优化的“视觉编码器-投影器-语言模型”三阶段架构，其核心在于如何更精准地“看懂”科学图像。

### 1. 区域感知的视觉“眼睛”：RICE-ViT

为了解决科学图像细节丢失的问题，团队引入了 **RICE-ViT** 作为视觉编码器。与普通的 Vision Transformer 不同，RICE-ViT 具备 **区域感知聚类判别（Region-based cluster discrimination）** 机制。它能够将图像分解为语义连贯的视觉单元，特别加强了对 OCR 区域和物体局部结构的捕捉能力。这对于识别分子式中的原子符号或复杂的图表标注至关重要。

### 2. 紧凑的桥梁：PatchMerger

视觉特征提取后，会产生大量的 Token，这会给后续的语言模型带来巨大的计算压力。Innovator-VL 采用了 **PatchMerger** 模块。它的作用是将相邻且语义相近的视觉补丁（Patches）进行融合，在保留关键信息的前提下，大幅缩短 Token 序列长度。

### 3. 大脑中枢：Qwen3-8B-Base

在语言解码器方面，模型选择了 **Qwen3-8B-Base**。由于该基座模型已经在海量文本上进行了充分预训练，具备了深厚的 STEM 知识储备和逻辑推理能力，为后续的科学对齐打下了坚实基础。

![Innovator-VL 的整体架构图，展示了原生分辨率输入、RICE-ViT 编码、PatchMerger 压缩以及 Qwen3 生成响应的全流程。](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/406331c599fce345.png)

Innovator-VL 的整体架构图，展示了原生分辨率输入、RICE-ViT 编码、PatchMerger 压缩以及 Qwen3 生成响应的全流程。

## 训练流程：从对齐到“深度思考”

Innovator-VL 的训练分为四个阶段，每一步都经过了精心设计：

1. **语言-图像对齐**：使用 LLaVA-1.5 的 558K 数据，让投影器学会将视觉特征映射到语言模型的空间。
    
2. **高质量中期训练（Mid-Training）**：利用约 8500 万高质量图像-文本对（如 LLaVA-OneVision 1.5 数据集）进行全参数微调，构建强大的视觉基础。
    
3. **有监督微调（SFT）**：这是注入科学知识的关键。团队构建了不到 500 万的科学样本，涵盖了 **光学化学结构识别（Optical Chemical Structure Recognition, OCSR）**、化学反应理解和电镜图像表征等领域。
    
4. **强化学习（RL）**：为了进一步激发模型的推理潜能，团队引入了 **组序列策略优化（Group Sequence Policy Optimization, GSPO）**。
    

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/ca86dc1d6beb4c70.png)



在人工智能迈向通用人工智能（AGI）的征途中，科学通用人工智能（Scientific General Intelligence, SGI）被视为一座极具挑战性的里程碑。尽管现有的多模态大模型（Multimodal Large Language Models, MLLMs）在日常对话和通用视觉任务中表现出色，但面对严谨的科学推理——比如识别复杂的化学结构式、解读高分辨率的电子显微镜图像或是解决复杂的物理数学题时，往往显得力不从心。

近日，由上海交通大学、深势科技（DP Technology）、MemTensor 以及中国科学院理论物理研究所联合团队推出了一款名为 **Innovator-VL** 的科学多模态大模型。

不同于以往依赖海量数据堆砌的“黑盒”模型，Innovator-VL 走的是一条“少而精”的透明化道路：它仅用了不到 500 万精选科学样本，就在多个科学基准测试中超越了同规模的 SOTA 模型，并且推理过程更加高效、简洁。

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/5bba35ea9d3daa1b.png)

- **论文地址**: https://arxiv.org/abs/2601.19325
    
- **项目主页**: https://InnovatorLM.github.io/Innovator-VL
    
- **代码仓库**: https://github.com/innovatorlm/innovator-vl (已开源)
    

## 科学推理的“深水区”：为什么通用模型会“翻车”？

在科学研究中，视觉信息往往是高度结构化且极其稠密的。一张化学反应方程式或是一幅电路图，其中的每一个微小符号、每一根连线的转折都承载着关键的语义。传统的视觉编码器（如 CLIP）更擅长捕捉图像的全局特征（比如“这是一张实验室的照片”），但在处理这些细粒度的局部细节时，往往会产生“幻觉”或直接忽略关键信息。

此外，科学领域的训练数据极其匮乏且标注成本高昂。很多现有的科学多模态模型为了提升性能，会使用大量非公开的私有数据，且训练流程不够透明，这让社区很难进行复现和二次开发。Innovator-VL 的出现，正是为了打破这种局面，通过原则性的数据筛选和先进的强化学习（Reinforcement Learning, RL）策略，证明了“小数据”也能办“大事”。

![Innovator-VL 在不同基准测试中的表现，第一行展示了 Instruct 模型在通用任务上的结果，二三行展示了 Thinking 模型在数学和科学任务上的突破。](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/51082a7bedffd6a5.png)

Innovator-VL 在不同基准测试中的表现，第一行展示了 Instruct 模型在通用任务上的结果，二三行展示了 Thinking 模型在数学和科学任务上的突破。


### 创新算法：GSPO 带来的效率革命

在强化学习阶段，传统的 GRPO 算法在处理长链条推理（Chain-of-Thought, CoT）时，可能会因为 Token 级别的权重分配产生噪声。而 **GSPO** 通过在序列级别进行重要性采样和裁剪，确保了优化目标与奖励的一致性。

模型被要求在回答时使用 `<think>...</think>` 标签记录思考过程，并在 `<answer>...</answer>` 中给出最终结论。这种“显式思考”不仅提高了准确率，还让推理过程变得可解释。

![训练数据分布图，展示了中期训练、SFT 和 RL 阶段各领域数据的构成比例。](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/9d5c762ee25a7760.png)

训练数据分布图，展示了中期训练、SFT 和 RL 阶段各领域数据的构成比例。

## 实验结果：化学领域的“霸榜”表现

在 37 个涵盖通用、数学和科学维度的基准测试中，**Innovator-VL-8B-Thinking** 取得了 **61.83%** 的平均分，位居同规模模型榜首。

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/6965e29baba99ad8.png)

- **科学任务的统治力**：在专门的化学任务 MolParse 和 OpenRxn 上，Innovator-VL 的得分分别超过了 **64%** 和 **57%** 。作为对比，Qwen3-VL-8B 和 InternVL3.5-8B 等通用模型在这些任务上的得分甚至不足 **17%** 。这种巨大的性能代差，充分体现了其在科学专业领域的深度。
    
- **数学推理的飞跃**：经过 RL 优化后的 Thinking 版本，在 MathVision 和 WeMath 等数学基准上，比 Instruct 版本提升了约 **4.54%** 。
    

### 推理 Token：更短、更准、更省

一个有趣的发现是，Innovator-VL 并不靠“废话”来堆砌推理。实验数据显示，在达到更高准确率的同时，Innovator-VL 生成的推理链条比 Intern-S1-mini 缩短了 **62%~66%** 。这意味着每一颗 Token 的“含金量”更高，推理效率提升了 1.4 到 4.3 倍。

![推理 Token 效率对比，展示了模型在保持高准确率的同时，生成的推理链显著更短。](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/8ab7ce5b070c4d29.png)

推理 Token 效率对比，展示了模型在保持高准确率的同时，生成的推理链显著更短。

## 科学数据的“炼金术”：Human-in-the-Loop

论文中详细介绍的数据构建管线非常值得借鉴。对于复杂的化学结构，团队采用了 **扩展 SMILES（Extended SMILES, E-SMILES）** 格式，能够描述专利中常见的 Markush 结构和环状基团。

通过“模型预标注-专家核查-定期重训”的闭环，团队在保证数据质量的前提下，实现了规模化生产。这种对数据的极致追求，正是 Innovator-VL 能够实现高数据效率的秘诀。

![数据构建管线图，展示了合成生成与真实世界来源的数据如何通过专家审核和迭代优化。](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/1d8cebbe1467369d.png)

数据构建管线图，展示了合成生成与真实世界来源的数据如何通过专家审核和迭代优化。

## 写在最后

Innovator-VL 的开源不仅是提供了一个强大的模型，更重要的是它贡献了一套 **全流程透明、端到端可复现** 的科学多模态训练方案。它告诉我们，在通往科学发现的道路上，盲目追求数据规模并非唯一解，对领域知识的深度对齐和对推理路径的精细优化，往往能带来更具性价比的突破。

目前，Innovator-VL 的模型权重、训练数据和代码已全部在 GitHub 和 HuggingFace 上线。对于科研人员来说，这无疑是一个值得参考的基座模型，可以进一步适配到生物、物理等更多细分领域。