**BandPO 的核心贡献：**

> 通过“概率带（probability band）”限制策略更新，在 TRPO 的稳定性和 PPO 的效率之间取得平衡，从而提升 LLM 强化学习训练稳定性。


# 1️⃣ 论文要解决的问题

当前 **LLM 强化学习（RLHF）** 主要使用 **Proximal Policy Optimization**（PPO）。

PPO 的关键机制是：

ratio clipping

即限制新旧策略概率比：

r = πθ(a|s) / πold(a|s)

但 PPO 有两个问题：

1️⃣ **过度更新问题**

ratio clipping 只在区间外截断，  
仍可能产生较大策略变化。

2️⃣ **训练不稳定**

特别是在：

- 长序列
    
- 大模型
    
- RLHF reward noise
    

情况下。

---

# 2️⃣ 核心思想

BandPO 提出：

**Probability-Aware Bounds（概率感知边界）**

核心思想：

不是简单clip ratio  
而是动态限制概率变化范围

建立一个：

probability band

保证策略更新：

既稳定  
又不太保守

---

# 3️⃣ 方法结构

BandPO 介于两种经典方法之间：

|方法|特点|
|---|---|
|TRPO|严格 trust region|
|PPO|简单 ratio clipping|

BandPO 的目标：

TRPO 稳定性  
+ PPO 简单性

因此论文名字：

Bridging Trust Regions and Ratio Clipping

---

# 4️⃣ 关键机制

BandPO 的策略更新限制为：

πnew(a|s) ∈ [lower_bound , upper_bound]

这个 bound 根据：

πold(a|s)  
reward advantage

动态调整。

效果：

- 防止概率突然变大
    
- 防止概率突然变小
    

即：

update band

---

# 5️⃣ 实验结论

在多个 LLM RL 任务中：

- 收敛更稳定
    
- reward 更高
    
- collapse 更少
    

相比：

- PPO
    
- GRPO
    
- DPO 类方法
    

表现更稳定。

---

# 6️⃣ 为什么重要

这篇论文针对的是一个**非常现实的问题**：

现在很多 LLM RL 训练（如 **DeepSeek-R1** 类推理模型）都会遇到：

RL训练不稳定

BandPO 的价值是：

更安全的策略更新

特别适合：

- 长序列 RL
    
- reasoning LLM
    
- tool-use agent
    

---

# 7️⃣ 一句话总结

