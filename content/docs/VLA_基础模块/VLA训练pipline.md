VLA 训练整体流程

典型 VLA（Vision-Language-Action）训练 pipeline：

① 视觉预训练
② 多模态对齐（VLM阶段）
③ 行为克隆（BC）
④ RL / 偏好优化（可选）
⑤ Sim2Real / Online 微调







二、VLA 一般用什么 RL？
1️⃣ 早期（RT-1 时代）

主要是：

Behavior Cloning (BC)

少量 RL 微调（PPO）

代表算法：

Proximal Policy Optimization

特点：

动作是离散 token

PPO 用于 fine-tune

但问题：

reward 稀疏

不稳定

真实机器人 rollout 成本高

2️⃣ 中期（Diffusion Policy 时代）

引入：

Diffusion Policy

Flow Matching Policy

这阶段 RL 用得少。

因为：

diffusion 本身就是 conditional generative modeling

例如：

Diffusion Policy

训练方式：

纯 imitation learning

无 RL

原因：

robot 数据昂贵

offline dataset 足够大

3️⃣ 最新阶段（2025-2026）

趋势明显：

大部分 VLA 不再依赖传统 RL

更多用：

GRPO

GSPO

Preference Optimization

Self-improvement

而不是 PPO。

三、VLA 在哪个阶段用 RL？
关键结论：

RL 不用于训练“感知”，只用于“决策层”。





RL / Preference 微调（可选）

目的：

提高成功率

提升 long-horizon 任务

学会恢复错误

一般在：

BC 训练完成之后

训：

Action head

Policy head

有时微调大脑最后几层





1️⃣ 大部分真实机器人 VLA

仍然：

主要是 BC

少量 offline RL

很少 online RL

因为：

真实 rollout 成本太高

reward 设计困难

2️⃣ 推理型 VLA（Planning Brain）

这类更像 LLM。

会用：

GRPO

GSPO

DPO 类方法

原因：

任务 reward 可自动评估

可以大规模并行

3️⃣ 世界模型型 VLA

例如 world model + imagination：

在模拟器里 RL

不在真实机器人上 RL





传统 PPO 式 RL 在 VLA 中已经不是主流。
现在更多是：BC 为主，RL 只在决策层微调，且采用 group-based 或 preference-based 方法。




如果你要设计一个新 VLA：

层级	是否用 RL
视觉	❌
VLM backbone	很少
Action head	有时
Planner	推荐用 GRPO / GSPO
Skill policy	多用 diffusion








为什么低层控制里 RL 价值确实下降？
1️⃣ 连续动作 + 稀疏 reward = RL 很难
抓取任务 reward 只有：

成功 = 1

失败 = 0

中间几百步无信号。

Diffusion policy 直接模仿 expert 分布：

更稳定

更 sample efficient

所以在：

低层 skill control

RL 的优势确实不明显。

2️⃣ 真实机器人 rollout 成本太高

一次真实 RL 训练：

时间长

硬件磨损

有安全风险

而 BC 只需要示范数据。



BC 的问题：

只模仿单步

不优化最终成功率

RL 的优势：

高层规划（Planner 层）
optimize long horizon return

世界模型内部优化

现在趋势是：

用 world model 做 imagination

在 latent space 做 RL





