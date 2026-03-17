随着高分辨率图像和长视频需求的爆发，大型视觉语言模型（LVLMs）的 Token 数量急剧膨胀，推理慢、显存告急成为落地死穴。四川大学团队敏锐发现，传统基于 Attention 权重的 Token 压缩存在严重的“末端位置偏置”。为此，他们提出基于 Token 内在变化量的 V²Drop 框架，不仅无需修改模型权重、完美兼容 FlashAttention，更在 LLaVA 和 Qwen2-VL 上实现了降维打击般的无损加速与显存缩减！ >>[加入极市CV技术交流群，走在计算机视觉的最前沿](http://mp.weixin.qq.com/s?__biz=MzI5MDUyMDIxNA==&mid=2247618084&idx=1&sn=981fa2ed41e2eda97799ae098b7c8907&chksm=ec1de3dddb6a6acb719081ffef32f72b72e7d6416f3504bf7049594b9f34f2d6cf570654ae21&scene=21#wechat_redirect)

作者介绍：第一作者陈骏杰（四川大学硕士二年级）与共同一作刘旭洋（四川大学硕士三年级）深耕高效视觉语言模型。

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/2a67a3032b4b1456.png)

- 论文题目：Variation-aware Vision Token Dropping for Faster Large Vision-Language Models
    
- 论文链接：https://arxiv.org/abs/2509.01552
    
- 代码链接：https://github.com/xuyang-liu16/V2Drop
    

# 01 背景与动机

随着高分辨率图像理解与长视频处理需求的爆发式增长，大型视觉语言模型（LVLMs）所需处理的视觉 Token 数量急剧膨胀，推理效率成为落地部署的核心瓶颈。Token 压缩是缩短序列、提升吞吐的直接手段，但现有方法普遍依赖注意力权重来判断 Token 重要性，这一路线暗藏两个致命缺陷：

一是**位置偏差问题**（如图 1 所示），该方法倾向于机械地保留序列末尾的 Token，无论图像内容如何，注意力得分普遍在序列末尾（对应图像底部区域）形成峰值（红色箭头），导致关键的前期 Token 被丢弃，进而加剧多模态幻觉。

二是**与高效算子存在根本性的不兼容**，计算注意力权重与 FlashAttention 等高效机制之间存在本质冲突。相比之下，右侧三列（绿色边框）展示了基于 L2 Norm 变化量评估方法的显著优势 —— 其得分分布均匀、能够精准聚焦于含有关键信息的图像区域（如绿色框标注的球衣号码区域），且无需显式注意力计算，与高效算子天然兼容。

![图 1：注意力引导 vs. 变化量感知的 Token 评估对比](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/45c35d242b3d74ff.jpeg)

图 1：注意力引导 vs. 变化量感知的 Token 评估对比

# 02 核心发现

### 发现 1：注意力方法存在系统性末端偏置

研究团队在 LLaVA-1.5-7B 和 Qwen2-VL-7B 上，对比了 SparseVLM、FastV 与 L2 Norm 变化量评估在相同输入下的 Token 保留行为。注意力方法的保留概率曲线均呈单调递增阶梯形状 —— 末端 Token 保留率高达 80%～100%，前端仅 10%～30%，与内容重要性毫无关联。L2 Norm 则呈近似均匀分布，天然规避位置偏差。

![图 2：两大模型上视觉 Token 保留位置分布分析 ——L2 Norm 呈现均匀分布，注意力方法呈严重末端偏置](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/f31ef08ad6d2dd32.png)

图 2：两大模型上视觉 Token 保留位置分布分析 ——L2 Norm 呈现均匀分布，注意力方法呈严重末端偏置

### 发现 2：变化量高的 Token 天然对应语义关键区域

针对两个典型样本（百事可乐瓶识别、球衣号码识别），L1 Norm、L2 Norm 和余弦相似度三种指标均在答案相关区域出现显著峰值，且无论关键区域位于序列中段还是后段均能精准捕捉，表明变化量是衡量视觉 Token 重要性的鲁棒内在属性，L2 Norm 综合性能最优，被 V²Drop 选为默认度量。

![图 3：三种变化量度量指标均精准定位答案相关区域（红框），验证变化量与语义重要性的强相关性](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/fa6e5f4f6ad2d5ee.jpeg)

图 3：三种变化量度量指标均精准定位答案相关区域（红框），验证变化量与语义重要性的强相关性

# 03 解决方案：V²Drop

V²Drop 在 LLM 推理阶段采用多阶段渐进式剪枝策略，三步实现高效无偏 Token 压缩：

1. 变化量计算（Variation Computation）在每个预定义剪枝层，计算每个视觉 Token 与上一层表示的 L2 距离作为重要性得分。额外开销仅为单层注意力计算量的 0.022%，可忽略不计。
    
2. Token 排序与选择（Token Ranking & Selection）按变化量得分从高到低排序，保留 Top-K 个 Token，自然过滤惰性 Token，无需引入任何位置偏置。
    
3. 渐进式压缩（Progressive Dropping）在浅层、中层、深层三阶段依次执行剪枝，形成 M → Ka → Kb → Kc 渐进压缩路径。消融实验证明，渐进式剪枝比一次性剪枝在 POPE 上高 9.3%、MME 上高 5.9%。
    

![图 4：V²Drop 整体框架](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/9be528933fcc86fa.jpeg)

图 4：V²Drop 整体框架

# 04 理论保证

通过一阶 Taylor 展开证明，Token 的变化量幅度与其对模型输出的影响正相关，从理论上验证了**丢弃低变化量 Token 能最小化输出扰动**的核心假设。架构的三大属性（残差连接、Layer Norm、平滑激活函数）共同保证了理论假设的合理性。

# 05 实验结果

### 1、图像理解（LLaVA-1.5-7B & Qwen2-VL-7B）

在图像场景的核心表现上，本方法在 LLaVA-1.5-7B 上：压缩 66.7% Token（保留 192 个）时，综合性能达 97.6%，超越次优方法 PDrop（96.0%。此外，在 Qwen2-VL-7B 高分辨率场景中，66.7% 和 77.8% 两档压缩率下均全面超越 FastV 和 DART，尤其在 POPE 幻觉抑制指标上表现突出，充分验证了本方法对原生可变分辨率输入的强泛化能力。

![表 1：基于 LLaVA-1.5-7B 的多图像理解基准测试对比](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/ea7d2f37e6ca3428.png)

表 1：基于 LLaVA-1.5-7B 的多图像理解基准测试对比

![表 2：基于 Qwen2-VL-7B 的多图像理解基准测试对比](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/1cb88847614e0095.png)

表 2：基于 Qwen2-VL-7B 的多图像理解基准测试对比

### 2、视频理解（LLaVA-OV-7B & Qwen2-VL-7B）

在视频场景中，本方法同样表现卓越：仅保留 25% 的 Token 时，综合性能即达 98.6%，超越保留 30% Token 的 DyCoke（97.7%），以更少 Token 实现更优性能；在长视频任务（VideoMME-Long）上持续领跑，有效缓解了 VideoLLM 普遍存在的末帧偏置问题；在 Qwen2-VL-7B 场景下，仅保留 20% Token 时综合性能达 93.3%，其中 MVBench 以 62.1 分大幅领先 DART（58.9）和 FastV（50.9），优势尤为突出。

![表 3：基于 Qwen2-VL-7B 的多视频理解基准测试性能对比](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/748869a0f6607ce9.png)

表 3：基于 Qwen2-VL-7B 的多视频理解基准测试性能对比

![表 4：基于 LLaVA-OV-7B 的多视频理解基准测试性能对比](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/ad52f463b24e0a38.png)

表 4：基于 LLaVA-OV-7B 的多视频理解基准测试性能对比

### 3、效率分析（与高效算子完全兼容）

在效率层面，本方法同样带来显著收益：图文理解任务（LLaVA-1.5-7B）中，LLM 生成延迟降低 31.5%，吞吐量提升至 9.01 items/s（↑1.26×），峰值显存同步下降 3.3%；视频理解任务（LLaVA-OV-7B）中，LLM 生成延迟大幅削减 74.2%，吞吐量提升 1.38×，峰值显存降低 7.8%。与之形成鲜明对比的是，SparseVLM、FastV、PDrop 在视频场景下峰值显存分别暴增 54.8%、39.2% 和 37.8%，而本方法无需计算注意力矩阵，真正实现了加速与节存的双重收益。

![表 5：图像 / 视频理解任务的效率对比](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/f64a0044e8d294cb.png)

表 5：图像 / 视频理解任务的效率对比

# 06 结论

V²Drop 为视觉语言模型的推理加速开辟了一条全新路径。研究发现，视觉 Token 在 LLM 各层间的变化量与其任务相关性高度吻合，且这一规律**与具体任务无关**（task-agnostic）。基于这一洞察，V²Drop 以变化量为核心评估信号，构建了一套**轻量、渐进、与高效算子完全兼容**的 Token 压缩框架 —— 无需修改模型权重，无需访问注意力矩阵，即插即用。在图像与视频理解两条赛道上均实现当前最优性能 - 效率权衡。