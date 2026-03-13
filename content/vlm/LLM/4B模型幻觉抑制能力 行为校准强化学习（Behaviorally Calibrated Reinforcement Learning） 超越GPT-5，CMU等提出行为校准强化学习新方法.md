
### 提出的核心方案：Behaviorally Calibrated RL（行为校准强化学习）

目标不是单纯提高正确率，而是让模型的**输出行为与真实准确率对齐**（calibration），即：

- 自信时才输出完整答案
- 不确定时主动**拒绝回答（abstain）** 或 **标记单个claim的不确定性**
- 最终让模型变成“诚实的沟通者”而非“会猜的考试机器”

关键技术路径：

1. 使用**strictly proper scoring rules**（严格适当评分规则，如Brier score的对数版本）作为奖励/损失，强制模型输出的置信度概率与实际正确率匹配。
2. 在RL阶段（基于Qwen3-4B-Instruct）引入**行为校准**的奖励塑造：奖励模型在低置信时拒绝、在高置信时自信回答。
3. 支持两种 abstention 形式：
    - 整句/整题拒绝回答
    - 逐claim标记不确定（fine-grained）

### 主要实验结果（非常有冲击力的点）

基模型：Qwen3-4B-Instruct（仅4B参数的小模型）

1. **数学推理领域（in-domain, BeyondAIME基准）**
    - 提出方法的 **log-scale Accuracy-to-Hallucination Ratio** 达到 **0.806**
    - 对比前沿模型：GPT-5只有 **0.207** → 小模型在“正确率 vs 幻觉率”的权衡上大幅超越百倍规模模型
2. **跨领域事实性QA（zero-shot SimpleQA）**
    - 校准误差（calibration error）达到与 **Grok-4、Gemini-2.5-Pro** 相当的水平
    - 注意：模型的**原始事实准确率远低于**这些前沿模型，但不确定性量化（meta-skill）已经追平甚至超越
3. **关键洞见**
    - 不确定性量化/校准能力可以**与原始预测准确率解耦**（decoupled）
    - 通过针对性的行为校准训练，小模型能获得很强的**可迁移的元技能**（uncertainty awareness），在训练任务外也能泛化





大语言模型（LLM）的幻觉问题一直是阻碍其在关键领域部署的核心难题。近日，研究人员提出了一种名为行为校准强化学习（Behaviorally Calibrated Reinforcement Learning）的新方法，通过重新设计奖励函数，让模型学会「知之为知之，不知为不知」。

  

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/dc9320bd9e059d9f.png)

  

论文链接：https://arxiv.org/abs/2512.19920

  

一个仅 40 亿参数的模型在接受该方法训练后，其幻觉抑制能力竟然超越了 GPT-5 等前沿大模型。

  

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/5cc2138980fdf099.png)

图1：模型在回答数学问题时输出的置信度标注示例。每个声明都附带置信度分数和理由说明。

  

核心问题：为什么 LLM 会产生幻觉？

  

研究团队指出，当前主流的大模型后训练范式 —— 基于可验证奖励的强化学习（RLVR）—— 存在一个根本性的奖励错位问题。在标准 RLVR 中，奖励函数通常是二元的：回答正确得 + 1 分，回答错误得 - 1 分。在这种机制下，只要正确概率大于零，一个追求效用最大化的智能体会被激励生成可能错误的答案。这就造成了对「拒绝回答」行为的惩罚，迫使模型抑制不确定性的表达，将猜测伪装成事实。模型被训练成了「优秀的应试者」—— 为了最大化预期分数而猜测，而不是成为「诚实的沟通者」—— 在置信不足时选择放弃。

  

解决方案：行为校准强化学习

  

针对上述问题，研究团队提出了行为校准的解决方案。其核心思想是：一个值得信赖的模型应该根据用户指定的风险阈值![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/1956e86cb28a41e9.png)动态调整其拒绝行为：

- 当 ![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/bd0d24cb160817b7.png) 时，模型处于「应试者模式」，尽可能回答问题；
    
- 当 ![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/acdda59bcde5ed12.png) 时，模型处于「完全诚实模式」，只在绝对确定时才回答；
    
- 一般情况下，0当且仅当模型的置信度 ![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/d846c97c29daf6a4.png) 时才输出实质性答案，否则输出![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/71106d31c6db7220.png)
    
      
    

为了实现这一目标，研究团队设计了两种策略：

  

策略一：言语化置信度（Verbalized Confidence）

  

该策略训练模型在输出答案的同时，显式输出一个标量置信度分数![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/6f9d6444d7f252a9.png)，当模型置信![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/68224a46c87ea085.png)低于用户风险阈值![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/9b70c949c22eac27.png)时拒绝回答，并分配奖励：

- 回答正确得 1 分；
    
- 回答错误得 - 1 分；
    
- 拒绝回答得 ![图片](https://mmbiz.qpic.cn/mmbiz_png/5L8bhP5dIqFrM4V9LUxmC9qFhEnd94ldxkt25EyEAVb4HEUCgNByoZ0SF5ZWibk6WO3nP4sSYpOBcBV87hXjWhY6jVBwy8otdKlicjpYTtYTk/640?wx_fmt=png&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1#imgIndex=11) 分。
    

  

研究团队将不同用户风险偏好 ![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/feed64539ad26f23.png) 下的奖励函数进行积分，将训练目标从带有显式风险阈值的条件优化，转化为对 Verbalized Confidence 的严格适当评分规则（proper scoring rule) 进行优化。

  

对于均匀分布的风险偏好![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/60f2c7151cf67678.png)，推导出的奖励函数类似于 Brier 分数：

  

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/f89686986692046b.png)

  

这个奖励可以分解为正确性奖励 ![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/4ba5475716b040e4.png) 和置信度校准的 Brier 分数 ![图片](https://mmbiz.qpic.cn/mmbiz_png/5L8bhP5dIqFJl4MhAjX4tCricD60GXmnH47WNbQ3t2mAh07JlVkPvqbbGzrwTq7xgJULSicHzedEwVpcGzuAkJnHSmRQJqKJvZc3mAeRHPM9w/640?wx_fmt=png&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1#imgIndex=16) 之差，激励模型在最大化预测准确率的同时，校准其声明的置信度。

  

对于一般的风险偏好累计分布函数 ![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/1d1c94e720acf54b.png)，奖励函数的通式为：

  

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/725b7dccde73ef35.png)

  

策略二：Critic 价值函数（Critic Value）

  

作为显示生成置信度的替代方案，该策略使用 PPO 算法中 Critic 网络的价值函数作为隐式置信度估计器。理论上，Critic 网络通过最小化预测值与策略回报之间的 Brier 分数进行训练，其价值函数会收敛到成功概率。

  

声明级行为校准：细粒度的「不确定」标注

  

研究团队进一步将行为校准从响应级别扩展到声明级别，使模型能够精确标注答案中单个不确定的推理步骤，而非简单地拒绝整个回答。这一扩展面临三大挑战：

  

挑战一：连贯性问题。直接将不确定的声明替换为 < IDK > 可能破坏推理的连贯性 —— 例如在数学问题中，后续步骤往往依赖于前面的结论。研究团队选择让模型输出完整响应，同时用 HTML 标签可视化高亮不确定的声明。

  

挑战二：中间步骤的歧义性。在思维链（CoT）推理中，中间步骤的正确性和置信度存在天然歧义：一个步骤可能正确识别了前面声明中的错误。为此，研究团队忽略中间推理过程，仅在最终的结构化步骤上进行校准。

  

挑战三：缺乏细粒度标签。声明级的正确性标注难以获取。研究团队设计了基于弱监督的学习目标：将声明级置信度聚合成响应级置信度，再使用 Brier 分数奖励进行训练。

  

具体而言，对于包含![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/3ee2c55754b0f200.png)个声明的响应，研究团队探索了两种聚合方式：

  

- 乘积聚合（Product Aggregation）：![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/b9b712119c4a8c93.png)，假设各声明的独立性，最终正确当且仅当所有声明都正确
    
- 最小值聚合（Minimum Aggregation）：![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/645cdb4355521940.png)，由最不确信的步骤决定整体置信度，强制模型为最易出错的步骤分配低置信度
    

  

实验发现，最小值聚合在声明级评估中表现更优，因为它能更有效地激励模型识别推理链中的薄弱环节。而乘积聚合虽然更适合响应级校准，但可能导致单个声明的置信度过于乐观。

  

实验结果

  

研究团队在多个基准测试上评估了该方法，包括字节跳动 Seed 团队发布的极具挑战性的数学推理基准 BeyondAIME，以及 AIME-2024/2025 和 SimpleQA（跨领域事实问答基准）。

  

核心评估指标

  

信噪比增益 (SNR Gain)：给定风险阈值![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/e005a33ce1dc1e36.png)，信噪比定义为模型回答中正确响应数量与幻觉响应数量的比值，即 ![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/8725a9a1d61142e8.png)。SNR 越高，说明模型在回答问题时的正确回答远多于错误回答。SNR 增益则是风险阈值在 ![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/678bc708a0fe103f.png) 的整个区间内的平均信噪比相对总是回答时的信噪比增益。

  

Confidence AUC：使用模型的置信度分数对正确和错误回答进行排序，计算 ROC 曲线下面积。AUC 越接近 1，说明模型越能准确地将高置信度分配给正确回答，将低置信度分配给错误回答。这是一个纯衡量模型「自知之明」的指标，不受模型本身能力强弱的影响。

  

响应级评估：超越 GPT-5

  

在 BeyondAIME 上的响应级评估结果显示（表 1），研究提出的方法显著优于 Qwen3-max，Kimi-K2，Gemini-2.5-Pro 和 GPT-5 等模型。其中，采用言语化置信度（Verbalized Confidence）、置信度乘积聚合（Qwen3-4B-Instruct-confidence-prod）的 40 亿参数模型取得了 0.806 的 SNR 增益，大幅超越 GPT-5 的 0.207。采用 Critic 价值函数（Qwen3-4B-Instruct-ppo-value）也取得了相当好的效果。

  

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/4bf7b3e48a48b0b9.png)

表1：BeyondAIME 响应级评估结果。SNR Gain 和 Conf AUC 是衡量幻觉抑制效果的关键指标，数值越高表示模型越能有效抑制幻觉。

  

  

声明级评估：超越 Gemini-2.5-Pro

  

研究团队还将行为校准从响应级别扩展到声明级别，让模型能够精确标注单个不确定的推理步骤。在 BeyondAIME 的声明级评估中（表 2），置信度最小聚合方法取得了 0.301 的 SNR 增益，显著优于 Gemini-2.5-Pro 的 0.019。

  

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/610bb27c10f1e2f8.png)

表2：BeyondAIME 声明级评估结果。最小值聚合方法在 SNR Gain 和 Conf AUC 两个核心指标上均大幅领先前沿模型。

  

置信度校准图：多数前沿模型缺少「自知之明」

  

置信度校准图（Reliability Diagram）是评估模型「自知之明」的重要可视化工具。图中的虚线![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/d585a8554cf6bde9.png)代表完美校准 —— 模型声明的置信度等于其实际准确率。从图 2 可以清晰地看到，前沿模型（包括 Gemini-2.5-Pro、Qwen3-Max 等）的校准曲线几乎是水平线，这意味着无论模型声称自己有多「自信」，其实际准确率都维持在相近水平。这说明这些模型缺乏区分正确与错误回答的能力。只有 GPT-5 和 o4-mini 输出的置信具有实际意义。相比之下，经过行为校准训练的模型（图 3）展现出理想的校准特性。单调递增的校准曲线证明模型学会了诚实地表达自己的不确定性。

  

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/d00cdd97e092bc67.png)

图2：前沿模型在BeyondAIME上的响应级置信度校准图。可以观察到，很多模型的准确率是一条水平线，与其声明的置信度几乎没有相关性。

  

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/8e0ca4f779599d24.png)

图3：本研究模型在BeyondAIME上的置信度校准图。经过行为校准训练后，模型的准确率与其声明的置信度呈现强烈的正相关关系。其中Base和Base-ppo是基准。

  

行为校准的四个目标

  

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/5L8bhP5dIqHtEuf70g0YlUBlxvVoztRBgqVLEvP77H0jQyAUicXE7vWFaqeO5XcDPXJLnpXXRqP2uwNEWdRIYYY8CQETQ7qkjIhZsWqODS8c/640?wx_fmt=png&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1#imgIndex=30)

图4：在不同风险阈值下的准确率、拒绝率和幻觉率变化曲线。绿色区域代表准确率，黄色区域代表拒绝率，红色区域代表幻觉率。随着风险阈值t的增加，模型逐渐从「应试者模式」过渡到「完全诚实模式」。

  

研究团队设计的系统满足行为校准的四个目标：

  

目标 1：自适应风险。模型能根据用户指定的风险阈值![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/3c4679ff0f40e5a3.png)自动调整拒绝策略。从图 4 可以观察到，随着风险阈值 ![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/835ebe039577c171.png) 的增加，幻觉率（红色区域）迅速下降。与前沿模型和基础 PPO 模型的「凸形」拒绝曲线不同，本研究模型的「凹形」拒绝曲线表明模型能更快地适应风险变化，在较低的风险阈值下就能有效降低幻觉。

  

目标 2：准确率保持。在![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/d96db5582ec4b854.png)（不拒绝）模式下，校准模型的准确率与标准 RL 微调基线相当甚至更好。

  

目标 3：幻觉减少。随着风险阈值 ![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/f9d0727cf86d35a0.png) 增加，幻觉率单调递减。当 ![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/91e7ee0d0ed3d187.png) 时（完全诚实模式），幻觉率几乎降至零。同时信噪比 SNR（绿色区域与红色区域的比值）大幅提升。

  

目标 4：定量校准。模型满足两个定量约束：

- 真阳性率（TP）：在模型选择回答的问题中，正确回答的比例不低于风险阈值 ![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/d85d3cf05de950ef.png) 
    
- 假阴性率（FN）：在模型选择拒绝的问题中，原本能正确回答的比例应不高于 ![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/6945d350a08363a5.png) 
    

图 5 展示了各模型的 TP 和 FN 曲线。TP 曲线大部分位于对角线 ![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/f3443a1d748635cb.png)上方，FN 曲线大部分位于对角线下方，满足行为校准的定量约束。

  

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/09b6c32c9e685e0a.png)

图5：行为校准的True Positive（实线）和False Negative（虚线)。TP曲线应位于对角线上方，FN曲线应位于对角线下方。Base和Base-ppo是基线

  

跨领域泛化：元技能的可迁移性

  

为了验证该方法训练出的元认知能力是否具有可迁移性，研究团队将在数学数据上训练的模型直接在 SimpleQA（具有挑战性的长尾事实知识基准）上进行零样本评估。

  

结果显示，方法的 SNR 显著优于基础指令模型，超越了大多数评估的前沿模型，与包括 Claude-Sonnet-4.5 和 GPT-5 在内的最强前沿模型相当。由于零样本评估的设定，在模型缺乏基础知识的全新领域上，行为校准被有效迁移，这说明行为校准是一种与预测准确率解耦的技能。

  

研究启示：

幻觉缓解与准确率是两个独立的能力

  

该研究还带来了一些理论洞察：

  

1. 幻觉缓解与事实准确率是两种不同的能力。研究团队观察到，对于某些前沿模型而言，准确率与幻觉率或置信度校准之间并没有正相关关系。GPT 系列模型的优势更多体现在控制幻觉的能力上，而不仅是准确率的优势。

  

2. 小模型也能实现与大模型相当的置信度校准。实现有效「校准」所需的计算资源远低于追求绝对准确率所需的资源。反过来说，某些大模型的言语化置信度并不能准确反映其实际表现。

  

3. 行为校准是一种可学习的属性，可以通过训练得到改善。这与此前认为幻觉是 LLM 不可避免的内置特性的观点形成了对比。