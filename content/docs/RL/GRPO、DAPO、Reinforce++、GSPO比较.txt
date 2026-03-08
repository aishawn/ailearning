
一、整体脉络

传统 RLHF 用的是：

Proximal Policy Optimization（PPO）

但 PPO 在 LLM 上有几个问题：

需要 value head（训练复杂）

advantage 估计不稳定

KL 约束不好调

大 batch 难 scale

于是就出现了一系列 “PPO-free” 或 “no-value” 方法：

方法	核心思想
Reinforce++	改良版 REINFORCE
GRPO	组内排序代替 value
DAPO	动态 advantage
GSPO	group soft preference 优化



GSPO 之所以在 MoE 上更优，是因为它把“路径级强化”变成“分布级匹配”，大幅降低了稀疏专家结构下的梯度方差与路由崩溃风险。


GSPO = 软排序最大似然

MoE 在 RL 阶段的两个大问题
① 梯度极度不均匀
② reward scale 放大 MoE 不稳定性
GSPO（Group Soft Preference Optimization）
GSPO 是更接近 DPO 思路的一种 group 版本。



MOE模型为什么用 GSPO更优？

这个问题问得非常关键。

为什么 MoE 模型在 RL 阶段往往 GSPO 比 GRPO / PPO 更优？

我从 梯度稳定性 → 专家路由 → credit assignment → 数学层面 四个层面给你拆开讲。

一、先明确两个对象

MoE 模型：例如 Google DeepMind 的 Switch Transformer

GSPO：Group Soft Preference Optimization（多样本 soft preference 优化）

二、MoE 模型的核心问题

MoE 的 forward 结构是：

x → router → top-k experts → combine → output

本质是：

𝑦
=
∑
𝑖
∈
𝑡
𝑜
𝑝
𝑘
𝑔
𝑖
(
𝑥
)
𝐸
𝑖
(
𝑥
)
y=
i∈topk
∑
	​

g
i
	​

(x)E
i
	​

(x)

其中：

𝑔
𝑖
(
𝑥
)
g
i
	​

(x) 是 router gate

𝐸
𝑖
E
i
	​

 是 expert

MoE 在 RL 阶段的两个大问题
① 梯度极度不均匀

Policy Gradient 类方法（GRPO / PPO）：

∇
𝜃
∝
𝐴
∇
𝑙
𝑜
𝑔
𝜋
(
𝑦
)
∇θ∝A∇logπ(y)

问题在于：

只有生成的 token 路径上的 expert 会被更新

低 reward → 整条路径梯度为负

高 reward → 整条路径梯度为正

于是：

少数 expert 被疯狂强化
其他 expert 梯度稀疏甚至消失

容易：

router collapse

expert specialization 过早固化

训练震荡

② reward scale 放大 MoE 不稳定性

MoE 参数巨大、稀疏激活。

如果 reward 有尖峰（reasoning 场景常见）：

GRPO/DAPO 属于 policy gradient

梯度直接乘 advantage

会导致：

𝑙
𝑎
𝑟
𝑔
𝑒
 
𝐴
×
𝑠
𝑝
𝑎
𝑟
𝑠
𝑒
 
𝑝
𝑎
𝑡
ℎ
large A×sparse path

→ 梯度爆炸集中到某些 expert

三、GSPO 的核心不同

GSPO 不做 policy gradient。

它做的是：

𝑠
𝑜
𝑓
𝑡
𝑚
𝑎
𝑥
(
𝑟
𝑖
)
→
𝑡
𝑎
𝑟
𝑔
𝑒
𝑡
 
𝑑
𝑖
𝑠
𝑡
𝑟
𝑖
𝑏
𝑢
𝑡
𝑖
𝑜
𝑛
softmax(r
i
	​

)→target distribution

然后优化：

𝐾
𝐿
(
𝜋
𝜃
∣
∣
𝑠
𝑜
𝑓
𝑡
𝑚
𝑎
𝑥
(
𝑟
)
)
KL(π
θ
	​

∣∣softmax(r))

等价于：

让模型输出概率分布匹配 reward soft 排序

四、为什么 GSPO 更适合 MoE？
1️⃣ 梯度是“分布级”的，而不是“路径级”的

GRPO：

𝐴
𝑖
∇
𝑙
𝑜
𝑔
𝜋
(
𝑦
𝑖
)
A
i
	​

∇logπ(y
i
	​

)

是 sample-based。

GSPO：

∑
𝑖
𝑤
𝑖
∇
𝑙
𝑜
𝑔
𝜋
(
𝑦
𝑖
)
i
∑
	​

w
i
	​

∇logπ(y
i
	​

)

是 distribution-based。

在 MoE 中这意味着：

方法	梯度流动
GRPO	只强化单条 expert 路径
GSPO	多个候选路径都被软更新

结果：

不会让单个 expert 垄断

router 更新更平滑

2️⃣ Soft weight 避免 router collapse

MoE 的 router 训练本来就敏感。

Policy Gradient：

∇
𝑔
∝
𝐴
∇g∝A

如果 A 很极端：

router 迅速偏向某 expert

负反馈很难恢复

GSPO：

𝑤
𝑖
=
𝑠
𝑜
𝑓
𝑡
𝑚
𝑎
𝑥
(
𝑟
𝑖
)
w
i
	​

=softmax(r
i
	​

)

即使 reward 差异大：

仍保留概率质量给其他路径

不会完全抛弃次优 expert

3️⃣ Credit assignment 更合理

MoE 的 credit assignment 难点：

是 expert 好？还是 router 选得好？

Policy gradient 是：

把 reward 全部给当前路径

GSPO 是：

在多个 response 之间做 soft 排序

credit 在样本之间分配

而不是全压单条路径

这对稀疏 MoE 至关重要。

4️⃣ 数学角度：MoE 更接近分类优化，而不是 RL

MoE 本质是：

conditional computation + sparse routing

它更像：

多专家分类器

mixture 分类模型

GSPO：

等价于最大似然

属于监督式 KL 优化

GRPO：

属于 policy gradient

噪声更大

MoE + GSPO = 两个“分布模型”匹配
MoE + PG = 噪声强化路径更新

五、从训练稳定性对比
指标	GRPO	GSPO
router collapse 风险	高	低
expert 负载均衡	差	好
reward spike 敏感	高	低
大 batch 可扩展	中	高
训练震荡	容易	少
六、从 scaling 角度看

大模型 + MoE + 长 CoT 时：

reward variance 极大

路径长度不一致

专家分工明显

GSPO：

天然支持 group N sample

软分布监督

梯度更 dense

这就是为什么：

大规模 MoE reasoning 模型，越来越偏向 GSPO 类方法

七、一个直觉总结

MoE 是“稀疏网络”。

Policy Gradient 是“高方差信号”。

稀疏结构 + 高方差信号
= 训练灾难。

GSPO 把高方差 reward
变成平滑的 soft target distribution。

八、和你研究 VLA 的关联

如果你未来做：

MoE-VLA

世界模型 + expert 模块

skill expert decomposition

那么：

低层动作专家 → 适合 PG

高层规划 MoE → 更适合 GSPO

九、一句话总结

GSPO 之所以在 MoE 上更优，是因为它把“路径级强化”变成“分布级匹配”，大幅降低了稀疏专家结构下的梯度方差与路由崩溃风险。