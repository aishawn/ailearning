<section id="robot-learning"></section>

## (3) Robot Learning —— 机器人学习（从控制到策略）

机器人学习并不是单一方向，而是一条从**经典控制（PID / MPC）**到**学习型策略（RL / IL）**的连续谱。在具身系统中，很多“成功的方案”本质上是混合式：用控制与规划保证稳定性，用学习补足复杂感知与泛化能力。本节给出一组相对系统的入门资源，同时补充工程里最常用的策略基线与仿真/代码生态，方便你快速形成学习路线并落到可跑的实验。

| 模块 | 资源 | 链接 | 说明 |
|---|---|---|---|
| 自主机器人课程 | ETH & TTIC & UdeM Robot Autonomy | 视频：[link](https://www.edx.org/learn/technology/eth-zurich-self-driving-cars-with-duckietown) / 网站：[link](https://duckietown.com/self-driving-cars-with-duckietown-mooc/) | Duckietown 平台贯穿感知-决策-控制闭环 |
| MPC 入门 | 华工机器人实验室：MPC 从公式到代码 | bilibili：[link](https://www.bilibili.com/video/BV1U54y1J7wh) / 代码：[link](https://gitee.com/clangwu/mpc_control.git) | 从 PID 过渡到 MPC，含仿真与代码 |
| RL 入门 | 强化学习的数学原理（西湖大学） | bilibili：[link](https://space.bilibili.com/2044042934/channel/collectiondetail?sid=748665) / 书+代码：[link](https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning) | 数学推导体系化，适合打地基 |
| DRL 速览 | Abbeel 6 Lectures | [link](https://www.youtube.com/watch?v=2GwBez0D20A) | 六讲概览 DRL，快速建立框架 |
| DRL 系统课 | Berkeley CS285 | 网站：[link](https://rail.eecs.berkeley.edu/deeprlcourse/) / YouTube：[link](https://www.youtube.com/playlist?list=PL_iWQOsE6TfVYGEGiAOMaOzzv41Jfm_Ps) | Levine 主讲，内容详尽 |
| DRL 中文课 | 李宏毅强化学习 | [link](https://www.bilibili.com/video/BV1XP4y1d7Bk) | 搭配实践（Gymnasium 等）较友好 |
| 模仿学习 | LAMDA：IL 简洁教程 | [link](https://www.lamda.nju.edu.cn/xut/Imitation_Learning.pdf) | 结构清晰，入门友好 |
| 真实机器人 IL | RSS 2024 Workshop 教程 | [link](https://www.bilibili.com/video/BV1Fx4y1s7if) | 从真实机器人监督学习的角度讲落地问题 |

为了尽快“跑通一个具身学习 pipeline”，工程上经常直接从成熟基线开始改：

| 策略基线（最常用） | 链接 | 说明 |
|---|---|---|
| ACT（Transformer Policy） | [link](https://github.com/tonyzhaozh/act) / [link](https://tonyzhaozh.github.io/aloha/) | 经典模仿学习基线，适合做对照与复现 |
| Diffusion Policy | [link](https://github.com/real-stanford/diffusion_policy) | 扩散式动作生成，实践中效果稳健 |
| DP3（3D Diffusion Policy） | [link](https://github.com/YanjieZe/3D-Diffusion-Policy) | 引入 3D 表征，适配更复杂几何 |

仿真与代码生态决定了你能否低成本迭代：同一算法在不同平台的“可用性”差异非常大。

| 仿真 / 平台 | 链接 | 常用 Codebase | 链接 |
|---|---|---|---|
| MuJoCo Playground | [link](https://playground.mujoco.org/) | legged-gym | [link](https://github.com/leggedrobotics/legged_gym) |
| Isaac Lab | [link](https://isaac-sim.github.io/IsaacLab/main/index.html) |  |  |
| SAPIEN | [link](https://sapien.ucsd.edu/) |  |  |
| Genesis | [link](https://github.com/Genesis-Embodied-AI/Genesis) |  |  |

**小结**：  
Robot Learning 的核心不是“选 RL 还是 IL”，而是用**控制/规划保证稳定**，用**学习提升复杂感知下的泛化**。建议先用成熟基线跑通数据-训练-评估闭环，再逐步替换关键模块。
