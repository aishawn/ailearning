<section id="foundation-models"></section>

## Vision Foundation Models —— 视觉基础模型在具身智能中的角色

近年来，大规模视觉基础模型已经成为**具身智能系统的重要感知支柱**。  
它们并不直接输出动作，但通过提供**高质量、具有语义一致性的视觉表征**，显著降低了下游任务（检测、分割、跟踪、位姿估计、操作规划）的难度。

| 能力      | 模型 / 工具              | 链接                                                                   | 简要说明                         |
| ------- | -------------------- | -------------------------------------------------------------------- | ---------------------------- |
| 图文对齐    | CLIP                 | [link](https://github.com/openai/CLIP)                               | 图像–文本共享语义空间                  |
| 表征学习    | DINO (v1/v2/v3)      | [link](https://github.com/facebookresearch/dino)                     | 高层视觉特征，对 correspondence 很有帮助 |
| 分割      | SAM / SAM2           | [link](https://segment-anything.com)                                 | 点 / 框提示分割，SAM2 支持视频          |
| 分割追踪    | SAM3                 | [link](https://ai.meta.com/sam3)                                     | 图像与视频级持续分割                   |
| 3D 重建   | SAM3D                | [link](https://ai.meta.com/sam3d)                                    | 资产 / 场景 / 人体重建               |
| 开放词表检测  | Grounding-DINO       | [link](https://github.com/IDEA-Research/GroundingDINO)               | 文本驱动目标检测                     |
| 检测 + 分割 | Grounded-SAM         | [link](https://github.com/IDEA-Research/Grounded-SAM-2)              | 检测后分割，工程友好                   |
| 位姿追踪    | FoundationPose       | [link](https://github.com/NVlabs/FoundationPose)                     | 物体 6D 位姿估计                   |
| 深度估计    | Depth Anything v1/v2 | [link](https://github.com/LiheYoung/Depth-Anything)                  | 单目深度预测                       |
| 点云表征    | Point Transformer v3 | [link](https://github.com/Pointcept/PointTransformerV3)              | 点云特征学习                       |
| 生成      | Stable Diffusion     | [link](https://github.com/CompVis/stable-diffusion)                  | 生成目标图像或中间表征                  |
| 机器人 FM  | RDT-1B               | [link](https://rdt-robotics.github.io/rdt-robotics)                  | 双臂操作基础模型                     |
| 图文对齐    | SigLIP               | [link](https://huggingface.co/docs/transformers/en/model_doc/siglip) | CLIP 类模型                     |

以 DINO 系列为例，它们并不是为“具身智能”设计的，但其学到的高层视觉表征在**跨实例 correspondence、关键点对齐、对象一致性**等问题上表现出很强的泛化性。这种“隐式几何一致性”对操作任务尤其重要。

在开放世界设置下，**开放词表检测与多任务模型**进一步减少了人工标注和任务定制成本：

| 开放词表 / 多任务 | 分割 | 深度 |
|---|---|---|
| OWL-ViT | Mask2Former | MiDaS |
| DETIC | SEEM |  |

这些模型使系统不再局限于“训练时见过的类别”，而是可以通过语言或提示进行动态感知，这一点在长期自主、家庭场景或多任务系统中尤为关键。

**小结**：  
Vision Foundation Models 的核心价值不在于“替代控制”，而在于**将复杂世界压缩成结构化、可泛化的感知表示**。  
它们是当前具身智能从“任务特化系统”走向“通用系统”的关键一环。





clip：2021 opeai提出的，batch内对比学习，要求很大的batch
siglip：2023 谷歌提出的，softmax改成sigmoid
siglip2：更多数据，更优训练配置，多任务训练（比对+生成+定位）