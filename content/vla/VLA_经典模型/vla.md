

## (5) Vision-Language-Action Models —— VLA 模型

VLA（Vision-Language-Action）可以理解为“把视觉-语言模型的能力直接延伸到动作空间”。与“VLM 做 planning”不同，VLA 的目标是更端到端：输入视觉与语言，输出可执行动作（或动作序列）。实现上通常涉及一个关键步骤：**动作表示（Action Representation）**——把连续控制量或轨迹转成模型可学习的 token / latent，并设计动作头（autoregressive、diffusion、flow 等）完成生成。

从实践角度看，VLA 的差异往往来自三件事：  
（1）动作如何表示与量化（例如 tokenizer / FAST / latent action）  
（2）训练数据与对齐方式（真实/仿真/合成，多机型/多任务）  
（3）系统形态（单模型端到端 vs 分层双系统，是否引入 planner、world model 等）

### (5.0) 参考与综述

| 类型 | 资源 | 链接 | 备注 |
|---|---|---|---|
| Blog | 具身智能 Vision-Language-Action 的思考 | [link](https://zhuanlan.zhihu.com/p/9880769870) |  |
| Blog | 具身智能 VLA 的思考（问答） | [link](https://www.zhihu.com/question/655570660/answer/87040917575) |  |
| Survey | Action Tokenization 视角 VLA Survey | [link](https://arxiv.org/abs/2507.01925) / [link](https://github.com/Psi-Robot/Awesome-VLA-Papers) | 2025.07.02 |
| Survey | VLA for Embodied AI Survey | [link](https://arxiv.org/abs/2405.14093) | 2024.11.28 |

### (5.1) 经典工作

> 这里内容较多，为了不拉长页面，使用折叠。需要时展开即可。

<details>
<summary><b>展开：经典 VLA 工作列表（按方向归类）</b></summary>

| 方向 | 工作 | 链接 | 机构 | 时间 | 备注 |
|---|---|---|---|---|---|
| Autoregressive | RT-1 | [link](https://arxiv.org/abs/2212.06817) |  |  | RT 系列起点 |
| Autoregressive | RT-2 | [link](https://robotics-transformer2.github.io/) / [link](https://arxiv.org/abs/2307.15818) | Google DeepMind | 2023.07 | 55B |
| Autoregressive | RT-Trajectory | [link](https://arxiv.org/pdf/2311.01977) | GDM / UCSD / Stanford | 2023.11 | 轨迹化输出 |
| Autoregressive | AUTORT | [link](https://arxiv.org/abs/2401.12963) | Google DeepMind | 2024.01 |  |
| Autoregressive | RoboFlamingo | [link](https://arxiv.org/abs/2311.01378) / [link](https://github.com/roboflamingo) | ByteDance / THU | 2024.02 |  |
| Autoregressive | OpenVLA | [link](https://arxiv.org/pdf/2406.09246) / [link](https://github.com/openvla) | Stanford | 2024.06 | 7B |
| Autoregressive | TinyVLA | [link](https://arxiv.org/abs/2409.12514) | 上海大学 | 2024.11 |  |
| Autoregressive | TraceVLA | [link](https://arxiv.org/pdf/2412.10345) / [link](https://github.com/umd-huang-lab/tracevla) | Microsoft | 2024.12 | 输入 visual trace |
| Diffusion / Flow | Octo | [link](https://arxiv.org/pdf/2405.12213) / [link](https://octo-models.github.io/) | Stanford / Berkeley | 2024.05 | Octo-base 93M |
| Diffusion / Flow | π0 | [link](https://arxiv.org/pdf/2410.24164) / [link](https://github.com/Physical-Intelligence/openpi) | Stanford / PI |  | 3.3B；flow-based diffusion |
| Diffusion / Flow | CogACT | [link](https://arxiv.org/pdf/2411.19650) / [link](https://github.com/microsoft/CogACT.git) | THU / MSRA | 2024.11 | 7B |
| Diffusion / Flow | Diffusion-VLA | [link](https://arxiv.org/abs/2412.03293) | 华东师范等 | 2024.12 |  |
| 3D Vision | 3D-VLA | [link](https://arxiv.org/pdf/2403.09631) / [link](https://github.com/UMass-Foundation-Model/3D-VLA/tree/main) | UMass | 2024.03 | 3D-based LLM |
| 3D Vision | SpatialVLA | [link](https://arxiv.org/pdf/2501.15830) / [link](https://github.com/SpatialVLA/SpatialVLA) | 上海 AI Lab | 2025.01 | Adaptive Action Grid |
| VLA-related | FAST（π0） | [link](https://arxiv.org/pdf/2410.24164) / [link](https://github.com/Physical-Intelligence/openpi.git) | Stanford / Berkeley / PI | 2025.01 | 动作 tokenizer |
| VLA-related | RLDG | [link](https://generalist-distillation.github.io/static/high_performance_generalist.pdf) | Berkeley | 2024.12 | 用 RL 生成高质数据再蒸馏 |
| VLA-related | BYO-VLA | [link](https://arxiv.org/abs/2410.01971) / [link](https://github.com/irom-princeton/byovla) | Princeton | 2024.10 | 运行时图像干预 |
| 场景扩展 | RDT-1B（双臂） | [link](https://arxiv.org/pdf/2410.07864) / [link](https://github.com/thu-ml/RoboticsDiffusionTransformer) | 清华 |  | 扩散式动作头 |
| 场景扩展 | QUAR-VLA（四足） | [link](https://arxiv.org/pdf/2312.14457) | 西湖 / 浙大 | 2025.02.04 |  |
| 场景扩展 | CoVLA（自动驾驶） | [link](https://arxiv.org/abs/2408.10845) / [link](https://turingmotors.github.io/covla-ad/) | Turing | 2024.12 |  |
| 场景扩展 | Mobility-VLA（导航） | [link](https://arxiv.org/pdf/2407.07775) | Google DeepMind | 2024.07 |  |
| 场景扩展 | NaVILA（腿式导航） | [link](https://arxiv.org/pdf/2412.04453) / [link](https://navila-bot.github.io/) | UCSD | 2024.12 |  |

</details>

### (5.2) 分层双系统 VLA（2025.05 更新）⭐

近一年一个非常强的范式是“分层双系统”：  
**System 2**（慢系统）负责理解与规划（通常是 VLM/LLM），输出语言/符号/latent 的中间表示；  
**System 1**（快系统）负责高频、稳定的低层控制（VLA / policy），将中间表示转成连续动作。  
它的直观优势是：在长任务与复杂场景中，把“推理/规划”与“高频控制”解耦，既提升可解释性，也更易做工程约束与安全策略。

| 维度 | 常见差异点 | 例子 |
|---|---|---|
| 架构形态 | 单模型 vs 双模型 | Hi-Robot（VLM+VLA） vs π 系列（单模型范式） |
| 通信方式 | 指令 / 子目标 / latent vector | 中间表征粒度决定可控性与泛化 |
| 数据来源 | 真实 / 仿真 / 合成 | 不同数据组成直接影响鲁棒性 |
| 关注重点 | 频率、任务跨度、跨本体 | 人形/移动操作/长程任务等 |

同时也出现了不少“产业级 VLA/系统”，强调端到端能力与部署：

| 系统 / 产品 | 链接 | 时间 | 备注 |
|---|---|---|---|
| Figure：Helix | [link](https://www.figure.ai/news/helix) | 2025.02.20 | 上半身全身控制 |
| 智元：GO-1 | [link](https://www.zhiyuan-robot.com/article/189/detail/56.html) | 2025.03.10 | ViLLA：VLM+MoE，vision-language-latent-action |
| Physical Intelligence（openpi） | [link](https://github.com/Physical-Intelligence/openpi) |  |  |
| π0.5 | [link](https://arxiv.org/abs/2504.16054) | 2025.04.22 | 高级任务分解 + 单模型低层执行 |
| Hi Robot | [link](https://arxiv.org/abs/2502.19417) | 2025.02.26 | VLM 推理 + VLA 执行 |
| Nvidia：GROOT-N1 | [link](https://github.com/NVIDIA/Isaac-GR00T) / [link](https://arxiv.org/abs/2503.14734) | 2025.03.27 | 2B，全身控制，强调部署 |
| Psi-R1（灵初智能） | [link](https://www.jiqizhixin.com/articles/2025-03-03-9) | 2025.04.27 | 分层端到端 VLA + RL，test-time scaling |
| Gemini Robotics | [link](https://arxiv.org/pdf/2503.20020) | 2025.03.25 | 50 Hz |
| Gemini Robotics on-device | [link](https://deepmind.google/discover/blog/gemini-robotics-on-device-brings-ai-to-local-robotic-devices/) | 2025.06.24 | 设备端部署导向 |

### (5.3) 最新 VLA 工作（滚动更新）

<details>
<summary><b>展开：2025 年以来的代表工作</b></summary>

| 工作 | 链接 | 机构 | 时间 | 备注 |
|---|---|---|---|---|
| VQ-VLA | [link](https://arxiv.org/pdf/2507.01016) / [link](https://github.com/xiaoxiao0406/VQ-VLA) | 上海 AI Lab 等 | 2025.07.01 | VQ action tokenizer |
| WorldVLA | [link](https://arxiv.org/pdf/2506.21539) / [link](https://github.com/alibaba-damo-academy/WorldVLA) | 阿里达摩院等 | 2025.06.21 | VLA + World Model 统一 |
| BridgeVLA | [link](https://arxiv.org/abs/2506.07961) / [link](https://github.com/BridgeVLA/BridgeVLA) | CASIA / ByteDance Seed 等 | 2025.06.07 | 3D 对齐到 2D |
| TrackVLA | [link](https://arxiv.org/pdf/2505.23189) / [link](https://github.com/wsakobe/TrackVLA) | 北大等 | 2025.05.29 | 实时检测与导航 |
| OneTwoVLA | [link](https://arxiv.org/pdf/2505.11917) / [link](https://github.com/Fanqi-Lin/OneTwoVLA) | 清华等 | 2025.05.17 | 推理与执行协同 |
| UniVLA | [link](https://arxiv.org/pdf/2505.06111) / [link](https://github.com/OpenDriveLab/UniVLA) | 港大等 | 2025.05.09 | 潜在动作表征 |
| MoManipVLA | [link](https://arxiv.org/pdf/2503.13446) / [link](https://gary3410.github.io/momanipVLA/) | 北邮 / NTU 等 | 2025.03.17 | 移动操作 |
| TLA | [link](https://arxiv.org/pdf/2503.08548) / [link](https://sites.google.com/view/tactile-language-action/) | 三星等 | 2025.03.11 | 引入触觉模态 |
| PointVLA | [link](https://arxiv.org/pdf/2503.07511) / [link](https://pointvla.github.io/) | 美的等 | 2025.03.10 | 点云微调 2D VLA |
| SafeVLA | [link](https://arxiv.org/abs/2503.03480) / [link](https://github.com/PKU-Alignment/SafeVLA) | 北大 | 2025.03.05 | 安全对齐 |
| HybridVLA | [link](https://arxiv.org/pdf/2503.10631) / [link](https://github.com/PKU-HMI-Lab/Hybrid-VLA) | 北大 | 2025.03.17 | 扩散 + 自回归统一 |
| DexVLA | [link](https://arxiv.org/pdf/2502.05855) / [link](https://github.com/juruobenruo/DexVLA) | 美的 / 东南 | 2025.02.09 | 多 action head |
| DexGraspVLA | [link](https://arxiv.org/abs/2502.20900) / [link](https://github.com/Psi-Robot/DexGraspVLA) | 北大 | 2025.02.28 | 灵巧手抓取 |
| UP-VLA | [link](https://arxiv.org/pdf/2501.18867) | 清华 | 2025.02.03 | 预测辅助 |
| UniAct | [link](https://arxiv.org/abs/2501.10105) / [link](https://github.com/2toinf/UniAct) | 清华 |  | 通用动作空间 |
| CoT-VLA | [link](https://arxiv.org/pdf/2503.22020) | Nvidia / Stanford |  | CoT 融入 VLA |

</details>

**小结**：  
VLA 的研究正在从“把动作 token 化”走向“更可控、更可部署、更长程”的系统形态：分层架构、world model、3D 表征与安全对齐都在加速融合。做项目时建议优先关注动作表示与数据配方，它们往往比换 backbone 更影响最终表现。
