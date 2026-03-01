<section id="ad"></section>

## (10.3) Autonomous Driving —— 自动驾驶

自动驾驶和具身操作类似，本质是“在复杂开放世界中闭环决策”。但它的研究与工程路线经常可以归纳成两大块：  
**世界模型（World / Simulation）**：如何表示、重建并可控生成驾驶世界（用于仿真、数据增广、评测与训练）；  
**策略系统（Policy）**：从模块化到端到端，并出现越来越多“快慢系统”范式（快系统高频安全控制，慢系统语义理解与规划）。

#### (10.3.1) World / Simulation：重建 + 可控生成

| 主题 | 资源/工作 | 链接 | 备注 |
|---|---|---|---|
| 生成式仿真（概念） | 生成式仿真为具身智能释放无限灵感 | [link](https://bydrug.pharmcube.com/news/detail/80b67b2227879864af934e5f81835776) |  |

**3D/4D 场景重建**

| 工作 | 链接 | 备注 |
|---|---|---|
| NSG | [link](https://github.com/princeton-computational-imaging/neural-scene-graphs) / [link](https://arxiv.org/abs/2011.10379) | CVPR 2021 |
| MARS | [link](https://open-air-sun.github.io/mars/) / [link](https://arxiv.org/abs/2307.15058) |  |
| StreetGaussians | [link](https://github.com/zju3dv/street_gaussians) / [link](https://arxiv.org/abs/2401.01339) |  |
| OmniRe | [link](https://ziyc.github.io/omnire) / [link](https://github.com/ziyc/drivestudio) / [link](https://arxiv.org/abs/2408.16760) | ICLR 2025 Spotlight |

**场景可控生成 / 世界模型**

| 工作 | 链接 | 备注 |
|---|---|---|
| GAIA-1 | [link](https://wayve.ai/thinking/introducing-gaia1/) / [link](https://arxiv.org/abs/2309.17080) |  |
| GenAD（OpenDV） | [link](https://github.com/OpenDriveLab/DriveAGI?tab=readme-ov-file#opendv) / [link](https://arxiv.org/abs/2403.09630) | CVPR 2024 Highlight |
| Vista | [link](https://opendrivelab.com/Vista) / [link](https://github.com/OpenDriveLab/Vista) / [link](https://arxiv.org/abs/2405.17398) | NeurIPS 2025 |
| SCP-Diff | [link](https://air-discover.github.io/SCP-Diff/) / [link](https://github.com/AIR-DISCOVER/SCP-Diff-Toolkit) / [link](https://arxiv.org/abs/2403.09638) |  |
| MagicDrive → MagicDriveDiT | [link](https://gaoruiyuan.com/magicdrive-v2/) / [link](https://arxiv.org/abs/2411.13807) |  |
| UniScene | [link](https://arlo0o.github.io/uniscene/) / [link](https://arxiv.org/abs/2412.05435) | CVPR 2025 |
| VaVAM | [link](https://github.com/valeoai/VideoActionModel) |  |

**生态补充**

| 仿真/数据生态 | 链接 | 说明 |
|---|---|---|
| CARLA | （建议补链接） | 自动驾驶仿真常用 |
| nuScenes / Waymo Open / Argoverse 2 | （建议补链接） | 数据与评测生态（决定可复现实验） |

**小结**：  
世界模型路线的关键不是“生成得像不像”，而是“能不能被策略有效利用”：可控性、可评测性、覆盖长尾场景，往往比视觉质量更关键。

---

#### (10.3.2) Policy：从模块化到端到端，再到快慢系统

| 主题 | 资源 | 链接 |
|---|---|---|
| 模块化到端到端 | End-to-end Autonomous Driving: Challenges and Frontiers | [link](https://arxiv.org/pdf/2306.16927) |
| 快慢系统并行（观点） | 理想端到端-VLM双系统 | [link](https://www.sohu.com/a/801987742_258768) |

为了便于“选路线”，这里把代表工作按快/慢系统拆开：  
快系统通常强调高频闭环（检测、占用、轨迹与控制），慢系统强调语义理解、解释与规划（往往更接近 VLM/LLM）。

**快系统代表作**

| 工作 | 链接 | 备注 |
|---|---|---|
| UniAD | [link](https://github.com/OpenDriveLab/UniAD) / [link](https://arxiv.org/abs/2212.10156) | CVPR 2023 Best Paper |
| VAD | [link](https://github.com/hustvl/VAD) / [link](https://arxiv.org/abs/2303.12077) | ICCV 2023 |
| SparseDrive | [link](https://github.com/swc-17/SparseDrive) / [link](https://arxiv.org/abs/2405.19620) |  |
| DiffusionDrive | [link](https://github.com/hustvl/DiffusionDrive) / [link](https://arxiv.org/abs/2411.15139) | CVPR 2025 |
| Scale-up 特性探究 | [link](https://arxiv.org/pdf/2412.02689) |  |

**慢系统代表作**

| 工作 | 链接 | 备注 |
|---|---|---|
| DriveVLM | [link](https://arxiv.org/abs/2402.12289) | CoRL 2024 |
| EMMA | [link](https://arxiv.org/abs/2410.23262) |  |
| Open-EMMA | [link](https://github.com/taco-group/OpenEMMA) | 开源实现 |

**小结**：  
自动驾驶策略的发展越来越像具身操作：快系统保证稳定与安全，慢系统提供语义理解与长时规划。做研究时建议先固定评测生态（数据/仿真/指标），再讨论模型形态，否则很难做可复现对比。

---

#### (10.3.3) 未来方向

| 资源 | 链接 |
|---|---|
| AIR ApolloFM 技术全解读 | [link](https://air.tsinghua.edu.cn/info/1007/2258.htm) |
