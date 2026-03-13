处理高分辨率图像和长视频，已经成了现在多模态大模型（Large Vision-Language Models, LVLMs）的“标配”能力。但随之而来的问题也很头疼：Token 数量爆炸，推理速度慢得像幻灯片，甚至动不动就爆显存。为了给模型“瘦身”，业界出了不少 Token 压缩方案，但大多依赖注意力权重，不仅容易产生“位置偏见”，还跟 FlashAttention 这种高效算子打架。

最近，来自四川大学、上海交通大学和浙江大学的研究团队提出了一种非常有灵气的方案——**V²Drop**。该模型被命名为 “V²Drop”，全称是 **V**ariation-aware **V**ision Token **Drop**ping。作者给它起这个名字，意在强调它不再依赖外部的注意力信号，而是通过感知（Aware）视觉 Token 在模型层间的动态变化（Variation）来精准识别并丢弃（Dropping）那些“出工不出力”的冗余信息。这种“以内看外”的视角，不仅让推理速度飞起，还完美解决了显存溢出的尴尬。

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/f4f88a94a2f839d8.png)

- **论文地址**: https://arxiv.org/abs/2509.01552
    
- **代码仓库**: https://github.com/xuyang-liu16/V2Drop (已开源)
    
- **录用会议**: CVPR 2026
    

**作者简介**  
本文由四川大学、上海交通大学 EPIC Lab和浙江大学联合完成。共同一作为四川大学研究生陈骏杰和刘旭洋，通讯作者为四川大学电子信息学院陈洪刚副教授。

## 为什么之前的压缩方案“不香”了？

在聊 V²Drop 之前，我们得先看看之前的技术是怎么做的。像 FastV、SparseVLM 这些前辈，核心逻辑都是“看注意力权重（Attention Weights）”。简单说，就是看 LLM 的注意力机制觉得哪些 Token 重要，就留哪些。

听起来很合理，对吧？但研究团队在深入分析后，发现了两个“扎心”的事实：

1. **信息无关的位置偏见（Positional Bias）**：研究人员发现，LLM 的注意力机制有个怪癖——它天生喜欢序列末尾的 Token。在图像里，这通常对应图像的底部区域。结果就是，不管图像底部是地板还是杂物，模型都会优先保留它们，而把图像中间真正重要的目标给剪掉了。这直接导致了严重的“多模态幻觉”。
    
2. **与高效算子不兼容**：现在的推理加速全靠 FlashAttention。但如果你想拿注意力权重做剪枝，就得强行把注意力矩阵算出来，这一下就把 FlashAttention 的优化给破了。结果就是，用了压缩算法，显存峰值反而比不压缩时还要高，这简直是南辕北辙。
    

![位置偏见与算子兼容性对比](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/2226b062ae9ebe6f.png)

位置偏见与算子兼容性对比

为了证明这一点，作者展示了图 2 和图 3。可以看到，传统的注意力引导方法（红色曲线）在图像底部（索引较大的位置）概率激增，而 V²Drop（绿色曲线）的分布则非常均匀且符合直觉。

![Token保留概率随位置的变化分布](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/4ee653b87c3dfbdd.png)

Token保留概率随位置的变化分布

## V2Drop：观察 Token 的“内在行为”

既然外部信号不靠谱，能不能直接看 Token 自己的表现？研究团队提出了一个非常深刻的洞察：**真正参与计算、对结果有贡献的 Token，在经过 LLM 的每一层时，它的表征（Representation）一定会发生剧烈变化；而那些无关紧要的“背景板”Token，在层与层之间几乎是原地踏步。**

作者把这些变化极小的 Token 称为“懒惰 Token”（Lazy Tokens）。V²Drop 的核心任务，就是把这些“懒汉”找出来并踢出队伍。


## 实验结果：又快又稳的“瘦身”专家

研究团队在 LLaVA-1.5、Qwen2-VL 和 LLaVA-OneVision (LLaVA-OV) 等主流模型上进行了详尽测试。

![性能-效率权衡曲线对比](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/0fa2aa3fceb0bbe6.png)

性能-效率权衡曲线对比

### 图像理解：保留 22% 依然能打

在 LLaVA-1.5-7B 上，当保留 192 个 Token（压缩了 66.7%）时，V²Drop 拿到了 **97.6%** 的原始性能。即使狠心剪到只剩 64 个 Token（压缩近 90%），它在 GQA、SQA 等任务上的表现依然远超 FastV 和 PDrop。

![LLaVA-1.5 图像理解性能对比](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/a226e1a76aae1e6f.png)

LLaVA-1.5 图像理解性能对比

而在更先进的 Qwen2-VL-7B 上，V²Drop 同样展现了极强的鲁棒性，在 AI2D 和 MMBench 等榜单上均保持了极高的性能水平。

![Qwen2-VL 图像理解性能对比](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/45b89983c9a3b48e.png)

Qwen2-VL 图像理解性能对比

### 视频理解：1.87 倍加速

视频任务是 Token 数量爆炸的重灾区。在 LLaVA-OV-7B 上，V²Drop 实现了 **1.87x** 的加速。在 MVBench 和 VideoMME 等长视频理解任务中，V²Drop 显著优于现有的 DyCoke 等方案。

![LLaVA-OV 视频理解性能对比](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/faab449cffe77f08.png)

LLaVA-OV 视频理解性能对比

更重要的是，在显存控制上，V²Drop 表现出了极强的优越性。来看一组硬核数据（Table 5）：

- 在处理视频时，之前的 SparseVLM 因为要算注意力权重，导致 GPU 峰值显存暴涨了 **54.8%**。
    
- 而 V²Drop 不仅没涨，反而比原始模型还降低了 **7.8%**。
    

这意味着，原本单张显卡跑不动的长视频，用了 V²Drop 之后，不仅跑得顺，显存还绰绰有余。

![效率与显存对比](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/d717101361efa44c.png)

效率与显存对比

## 开源实践指引

目前 V²Drop 的代码已经托管在 GitHub 上。虽然星星还不算多，但非常值得关注。

- **实现简洁**：核心逻辑就是几行张量运算，作者在附录中给出了完整的伪代码。
    
- **算力友好**：由于兼容 FlashAttention 且能降低显存峰值，这对于只有单张 3090 或 4090 的开发者来说简直是福音。
    
- **即插即用**：不需要微调（Training-free），直接在推理脚本里加上几行逻辑就能用。
    

![Token 压缩效果可视化](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/a0c26846203f39ae.png)

Token 压缩效果可视化

从图 7 的可视化可以看到，V²Drop（第三行）保留的 Token 区域非常精准地覆盖了问题相关的物体（如brand所在的位置），而 FastV（第一行）则留下了大量无用的背景信息。

![更多场景的可视化展示](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/08ebfa21fc7cc30b.png)

更多场景的可视化展示

## 写在最后

V²Drop 的出现，其实给了我们一个很重要的启示：**在追求模型“更大、更强”的同时，如何更聪明地利用现有的计算资源同样关键。**

它通过观察 Token 的“层间变化”这一内在属性，巧妙地避开了注意力机制的天然缺陷。这种“内容决定留存”的逻辑，比“位置决定留存”要高级得多。对于正在做多模态落地、受困于推理延迟和显存瓶颈的同学来说，V²Drop 绝对是一个值得尝试的方案。