<section id="navigation"></section>

## (9) Robot Navigation —— 机器人导航（任务、系统与生态）

机器人导航的本质是：智能体在已知或未知环境中，根据传感器输入（RGB/Depth/GPS/IMU 等）与目标指令，输出一系列动作以到达目标。具身任务里，导航往往是更复杂操作的前置能力：先到达、再交互。

为了避免“分类太碎导致阅读成本高”，这里把导航组织为三层：**任务形态 → 系统形态 → 代表工作与数据集生态**。

### (9.1) 任务形态（你到底在导航到什么）

| 任务类型                    | 简述                             |
| ----------------------- | ------------------------------ |
| 物体目标导航（Object-Goal Nav） | 输入是目标物体描述，输出到达目标物体附近的动作序列      |
| 图像目标导航（Image-Goal Nav）  | 输入是一张目标图像，目标是到达与图像一致的场景位置      |
| 视觉-语言导航（VLN）            | 输入是自然语言指令（路线/描述/约束），目标是按语言完成路径 |

### (9.2) 系统形态（你如何把感知变成行动）

| 系统 | 描述 | 优势 | 局限 |
|---|---|---|---|
| 端到端（E2E） | 直接从传感器输入映射到动作（RL/IL 等） | 简洁直接 | 易过拟合、泛化挑战大 |
| 模块化（Modular） | Mapping + Global Policy + Local Policy 等模块接口组合 | 可解释、工程可控 | 规则与手工设计仍限制通用性 |
| 零样本（Zero-shot） | 不训练或少训练，依赖 CLIP/LLM 等先验 | 更接近迁移到真实场景 | 推理慢、上限受限，常需再对齐 |

### (9.3) 代表工作（按系统形态组织）

> 这里的工作可以作为“入门时的 anchor”，建议先读摘要+方法图建立直觉，再决定深入方向。

<details>
<summary><b>展开：端到端（E2E）</b></summary>

| 工作 | 链接 |
|---|---|
| Learning Object Relation Graph and Tentative Policy for Visual Navigation | [link](https://arxiv.org/abs/2007.11018) |
| VTNet: Visual Transformer Network for Object Goal Navigation | [link](https://openreview.net/forum?id=DILxQP08O3B) |

</details>

<details>
<summary><b>展开：模块化（Modular）</b></summary>

| 方法/简称 | 工作 | 链接 | 备注 |
|---|---|---|---|
| SemExp | Object Goal Navigation using Goal-Oriented Semantic Exploration | [link](https://arxiv.org/abs/2007.00643) | 早期语义地图代表 |
| PONI | Potential Functions for ObjectGoal Navigation with Interaction-free Learning | [link](https://openaccess.thecvf.com/content/CVPR2022/papers/Ramakrishnan_PONI_Potential_Functions_for_ObjectGoal_Navigation_With_Interaction-Free_Learning_CVPR_2022_paper.pdf) | potential function + 语义地图预测 |
| 3D-aware | 3D-Aware Object Goal Navigation via Simultaneous Exploration and Identification | [link](https://arxiv.org/abs/2212.00338) | 引入 3D 缓解 2D 语义图信息损失 |

</details>

<details>
<summary><b>展开：零样本（Zero-shot）</b></summary>

| 工作 | 链接 | 备注 |
|---|---|---|
| CoWs on Pasture: Baselines and Benchmarks for Language-Driven Zero-Shot Object Navigation | [link](https://arxiv.org/abs/2203.10421) | 用 CLIP 找目标，找到就走过去 |
| L3MVN: Leveraging Large Language Models for Visual Target Navigation | [link](https://arxiv.org/abs/2304.05501) | LLM 决策“朝哪走” |
| ESC: Exploration with Soft Commonsense Constraints for Zero-shot Object Navigation | [link](https://arxiv.org/abs/2301.13166) | 语义地图 + 常识约束 |
| SG-Nav: Online 3D Scene Graph Prompting for LLM-based Zero-shot Object Navigation | [link](https://arxiv.org/abs/2410.08189) | 在线构建场景图喂给 LLM |

</details>

### (9.4) 数据集与仿真生态（决定你能跑什么实验）

| 数据集/平台 | 链接 | 备注 |
|---|---|---|
| Matterport3D（MP3D） | [link](https://niessner.github.io/Matterport/) | 真实场景采集，规模大、难度高 |
| Habitat-Matterport3D（HM3D） | [link](https://aihabitat.org/datasets/hm3d/) | Habitat 生态核心数据 |
| RoboTHOR | [link](https://ai2thor.allenai.org/robothor/) | 场景较小，仿真更轻量 |
| AI2-THOR | [link](https://ai2thor.allenai.org/) | 与 RoboTHOR 同系，交互生态强 |
| Gibson / iGibson | （可补链接） | 室内仿真常用，含交互任务生态 |
| VLN 常用：R2R / RxR / CVDN | （可补链接） | 偏语言导航方向的数据集 |

> 注：如果你希望这里“完全自洽且可点击”，我也可以把 Gibson/iGibson 与 R2R/RxR/CVDN 的链接补齐并统一格式。

### (9.5) 其他参考（进一步扩展）

| 资源 | 链接 |
|---|---|
| Object-Goal Navigation 综述 | [link](https://orca.cardiff.ac.uk/id/eprint/167432/1/ObjectGoalNavigationSurveyTASE.pdf) |
| Awesome VLN | [link](https://github.com/eric-ai-lab/awesome-vision-language-navigation) |
| Habitat Navigation Challenge | [link](https://github.com/facebookresearch/habitat-challenge) |

**小结**：  
导航方向最重要的分歧不在“用什么网络”，而在系统形态：端到端追求简洁但容易过拟合，模块化更可控但偏工程，零样本更易迁移但速度与上限受限。做项目时建议先选定评估平台与数据集生态，再决定模型路线，否则很容易在实现层面被卡住。
