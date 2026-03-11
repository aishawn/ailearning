<section id="uav"></section>

## (10.2) UAV —— 无人机（技能、任务与本体）

无人机研究大体可以用“三条主线”来理解：  
**技能（Skill）**：避障、竞速、敏捷飞行/特技等，强调高速闭环与安全约束；  
**任务（Task）**：探索、重建、跟踪/追捕等，强调长时规划与不确定环境；  
**本体（Platform）**：飞行器构型与载荷（例如空中机械臂、全驱动、多模态等），决定了可执行的动作空间与任务边界。  
实际系统里三者往往是耦合的：任务提出约束，技能保证可执行，本体决定上限。

#### (10.2.1) 技能实现/学习（Skill Learning）

无人机技能学习的瓶颈通常不是“有没有算法”，而是**闭环速度、仿真可用性、sim2real 稳定性**。因此这里先列出更贴近 RL/学习的仿真器与工程链路，再给代表工作做索引。

| 类别 | 仿真/链路 | 链接 | 备注 |
|---|---|---|---|
| 学习仿真 | AirSim | [link](https://microsoft.github.io/AirSim/) | UE4；生态成熟但运行偏慢 |
| 学习仿真 | Flightmare | [link](https://github.com/uzh-rpg/flightmare) | Unity 渲染；CPU 并行动力学 |
| 学习仿真 | AerialGym | [link](https://github.com/ntnu-arl/aerial_gym_simulator) | IsaacSim；GPU 并行动力学 |
| 轻量生态 | gym-pybullet-drones | （建议补链接） | 轻量、研究/教学常用 |
| 工程链路 | PX4 SITL / ROS2 | （建议补链接） | 更贴近真实系统部署与接口 |

<details>
<summary><b>展开：经典技能代表工作（按主题归类）</b></summary>

**未知场景障碍物躲避 / 反应式控制**

| 工作 | 链接 | 备注 |
|---|---|---|
| Learning Monocular Reactive UAV Control in Cluttered Natural Environments (ICRA 2013, CMU) |  | 监督学习：图像 → 离散控制指令 |
| CAD2RL: Real Single-Image Flight without a Single Real Image (RSS 2017, UCB) |  | sim2real RL + domain randomization |
| DroNet: Learning to Fly by Driving (RAL 2018, UZH) | [link](https://github.com/uzh-rpg/rpg_public_dronet) | 输出速度指令 |
| Learning High-Speed Flight in the Wild (SciRob 2021, UZH) | [link](https://github.com/uzh-rpg/agile_autonomy) | dagger + 传统轨迹规划监督 |
| Back to Newton's Laws… Differentiable Physics (Arxiv 2024, SJTU) |  | 可微物理辅助策略优化 |
| Flying on Point Clouds using RL (Arxiv 2025, ZJU) | [link](https://arxiv.org/abs/2503.00496) | 机载雷达 + sim2real RL |

**无人机竞速（高速度、高精度、高风险约束）**

| 工作 | 链接 | 备注 |
|---|---|---|
| Champion-level drone racing using deep RL (Nature 2023, UZH) |  | RL 战胜人类冠军 |
| Optimal Control vs RL in Racing (SciRob 2023, UZH) |  | RL 与最优控制对比 |
| Agile Flight from Pixels w/o State Estimation (RSS 2024, UZH) |  | 视觉端到端，不依赖显式状态估计 |

**大机动 / 特技飞行（敏捷性与可控性）**

| 工作 | 链接 | 备注 |
|---|---|---|
| Deep Drone Acrobatics (RSS 2020, UZH) |  | 模仿学习 + MPC 轨迹跟踪 |
| Whole-Body Control Through Narrow Gaps (ICRA 2025, ZJU) | [link](https://arxiv.org/abs/2409.00895) | 端到端窄缝穿越 |

</details>

**小结**：  
技能学习的主矛盾通常是“闭环工程问题”：仿真速度、传感器噪声、延迟与 sim2real。选平台时建议先明确你需要的是 **快速迭代（轻量）** 还是 **高保真+可部署（PX4/ROS 链路）**。

---

#### (10.2.2) 任务实现/学习（Task Learning）

任务层比技能层更强调：**长时规划、部分可观测、目标不确定与多机协作**。很多工作会把“任务规划”交给上层策略，把“飞行稳定”交给下层控制/技能模块。

<details>
<summary><b>展开：经典任务代表工作（探索/追捕等）</b></summary>

| 任务 | 工作 | 链接 |
|---|---|---|
| 追捕/协作 | HOLA-Drone: Hypergraphic Open-ended Learning for Zero-Shot Multi-Drone Cooperative Pursuit (Arxiv 2024, Manchester) |  |
| 追捕/规划 | Multi-UAV Pursuit-Evasion with Online Planning… (Arxiv 2024, THU) |  |
| 探索 | Deep RL-based Large-scale Robot Exploration (RAL 2024, NUS) |  |
| 探索 | ARiADNE: … Exploration (ICRA 2023, NUS) |  |
| 探索 | DARE: Diffusion Policy for Autonomous Robot Exploration (ICRA 2025, NUS) |  |

</details>

---

#### (10.2.3) 无人机硬件平台搭建

| 教程 | 链接 |
|---|---|
| 从 0 制作自主空中机器人 | [link](https://www.bilibili.com/video/BV1WZ4y167me) |

---

#### (10.2.4) 新构型无人机设计

这一部分更偏“具身本体学”：通过构型改变动作空间，使无人机从“移动平台”变成“可交互平台”。

**空中机械臂（Aerial Manipulator）**

| 资源/工作 | 链接 | 备注 |
|---|---|---|
| 空中作业机器人，下一代无人机技术？ | [link](https://zhuanlan.zhihu.com/p/442331197) |  |
| Past, Present, and Future of Aerial Robotic Manipulators (TRO 2022) | [link](https://ieeexplore.ieee.org/document/9462539) | 综述 |
| Millimeter-Level Pick and Peg-in-Hole by Aerial Manipulator (TRO 2023) | [link](https://ieeexplore.ieee.org/abstract/document/10339889) |  |
| NDOB-Based Control of a UAV with Delta-Arm… (ICRA 2025) | [link](https://arxiv.org/abs/2501.06122) |  |
| A Compact Aerial Manipulator… (JIRS 2024) | [link](https://link.springer.com/article/10.1007/s10846-024-02090-7) |  |

**全驱动无人机（Fully-Actuated UAV）**

| 工作 | 链接 | 备注 |
|---|---|---|
| Fully Actuated Multirotor UAVs: A Literature Review (RAM 2020) | [link](https://ieeexplore.ieee.org/document/8978486/?arnumber=8978486) | 综述 |
| Omni-directional aerial vehicle (ICRA 2016, ETH) | [link](https://ieeexplore.ieee.org/document/7487497) |  |
| Voliro omniorientational hexacopter (RAM 2018, ETH) | [link](https://ieeexplore.ieee.org/document/8485627) |  |
| FLOAT Drone (Arxiv 2025, ZJU) | [link](https://arxiv.org/abs/2503.00785) |  |

**可变形无人机（Deformable UAV）**

| 工作 | 链接 |
|---|---|
| DRAGON (RAL 2018) | [link](https://ieeexplore.ieee.org/document/8258850) |
| The Foldable Drone (RAL 2019) | [link](https://ieeexplore.ieee.org/document/8567932?arnumber=8567932) |
| Ring-Rotor (RAL 2023) | [link](https://ieeexplore.ieee.org/document/10044964) |
| Passively Morphing Quadcopter (ICRA 2019) | [link](https://ieeexplore.ieee.org/document/8794373) |

**多模态无人机（Terrestrial-Aerial / Multi-Modal）**

| 工作 | 链接 |
|---|---|
| A bipedal walking robot that can fly… (SciRob 2021, Caltech) | [link](https://www.science.org/doi/10.1126/scirobotics.abf8136) |
| Morphobot (NC 2023) | [link](https://www.nature.com/articles/s41467-023-39018-y) |
| Skater (RAL 2024, ZJU) | [link](https://ieeexplore.ieee.org/document/10538378) |
| Terrestrial-Aerial Bimodal Vehicles Navigation (RAL 2022, ZJU) | [link](https://ieeexplore.ieee.org/document/9691888) |

**小结**：  
如果你关注“具身交互”，新构型往往比换算法更有效：空中机械臂解决“能不能操作”，全驱动解决“姿态与力控自由度”，可变形解决“通过性与安全”，多模态解决“跨地形任务连续性”。
