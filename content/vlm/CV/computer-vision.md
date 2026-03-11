<section id="cv"></section>

## (6) Computer Vision —— 计算机视觉

具身智能几乎所有下游能力（抓取、操作、导航、交互）都建立在视觉之上。和纯 CV 不同，具身更关心的是：**在变化的光照、遮挡、视角、运动模糊与跨域条件下，视觉表征是否稳定**，以及它是否能与几何（深度/点云）和语言（指令/目标）对齐。本节将视觉按“2D → 3D → 4D（视频/时序）→ Prompting/可供性”串起来，便于你形成一条连续的学习路线。

| 课程/资源 | 链接 | 说明 |
|---|---|---|
| CS231n（Stanford） | [link](https://cs231n.stanford.edu/schedule.html) | 深度学习 CV 全景课，适合视频+讲义快速建立体系 |

### (6.1) 2D / 3D / 4D Vision（从图像到时空）

> 为了不把页面拉得太长，这里把 2D/3D/4D 的资源合并成一个“能力栈表”。你可以按需选择深入方向。

| 层级        | 关注点（具身视角）                   | 代表资源                                    | 链接                                                                                                                                                                                                     |
| --------- | --------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2D Vision | 稳定表征与泛化：backbone、对比学习、生成式表征 | CNN 概念 / ResNet / ViT / Swin            | CNN：[link](https://easyai.tech/ai-definition/cnn/；ResNet：https://www.bilibili.com/video/BV1P3411y7nn；ViT：https://www.bilibili.com/video/BV15P4y137jb；Swin：https://www.bilibili.com/video/BV13L4y1475U) |
| 2D Vision | 表征学习方法论：对比学习与大规模预训练         | 对比学习综述                                  | [link](https://www.bilibili.com/video/BV19S4y1M7hm)                                                                                                                                                    |
| 2D/4D Gen | 生成式模型（用于表征、合成数据、目标图像等）      | 自回归综述 / 扩散综述 / 扩散推导                     | 自回归：[link](https://arxiv.org/pdf/2411.05902；扩散：https://arxiv.org/pdf/2209.00796；推导：https://kexue.fm/archives/9119)                                                                                     |
| 3D Vision | 多视几何与三维理解（对重建/位姿/点云感知很关键）   | Andreas Geiger 3D Vision                | [link](https://uni-tuebingen.de/fakultaeten/mathematisch-naturwissenschaftliche-fakultaet/fachbereiche/informatik/lehrstuehle/autonomous-vision/lectures/computer-vision/)                             |
| 3D Vision | 三维重建与理解（偏工程与应用）             | GAMES203                                | [link](https://www.bilibili.com/video/BV1pw411d7aS)                                                                                                                                                    |
| 3D/Gen    | 2D/3D 生成方向梳理                | 论文分类 / 2024 论文整理                        | 分类：[link](https://zhuanlan.zhihu.com/p/617510702；2024：https://zhuanlan.zhihu.com/p/700895749)                                                                                                          |
| 4D Vision | 视频理解：时序建模与跨帧一致性（具身中非常常见）    | 开山之作 / 串讲 / 综述                          | 开山：[link](https://www.bilibili.com/video/BV1mq4y1x7RU；串讲：https://www.bilibili.com/video/BV1fL4y157yA；综述：https://arxiv.org/pdf/2312.17432)                                                              |
| 4D Gen    | 视频/4D 生成（用于合成与世界建模相关）       | Lilian Weng 视频扩散博客 / 4D generation list | 博客：[link](https://lilianweng.github.io/posts/2024-04-12-diffusion-video/；list：https://github.com/cwchenwang/awesome-4d-generation)                                                                     |

### (6.2) Visual Prompting & Affordance Grounding

具身视觉的一个关键变化是：我们不只想识别物体，而是要回答“**哪里能抓、怎么推、哪能开合**”。  
因此在工程系统里，视觉常常以两种形式进入控制：  
（1）通过 prompt / 标注把视觉模型“定向”到当前任务；（2）通过 affordance 将视觉输出直接变成可执行的交互区域或动作参数。

| 方向               | 资源                         | 链接                                       | 说明                        |
| ---------------- | -------------------------- | ---------------------------------------- | ------------------------- |
| Visual Prompting | 视觉提示综述                     | [link](https://arxiv.org/abs/2409.15310) | Prompt 作为任务条件，连接视觉与决策     |
| Visual Prompting | PIVOT                      | [link](https://pivot-prompt.github.io)   | 迭代式视觉问答，zero-shot 控制与空间推理 |
| Visual Prompting | Set-of-Mark（SoM）for GPT-4V | [link](https://som-gpt4v.github.io)      | 用可视标记提升可控性与对齐             |

| 维度            | 工作/数据集                                 | 链接                                                                                          | 说明                 |
| ------------- | -------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------ |
| 2D Affordance | Cross-View-AG / AGD20K                 | [link](https://arxiv.org/pdf/2203.09905) / [link](https://github.com/lhc1224/Cross-View-AG) | 跨视角学习可供性 + 数据集     |
| 2D Affordance | AffordanceLLM                          | [link](https://arxiv.org/pdf/2401.06341)                                                    | 借助 VLM/LLM 知识提升泛化  |
| 3D Affordance | Where2Act                              | [link](https://arxiv.org/abs/2101.02692)                                                    | 铰接物体可供性与交互点        |
| 3D Affordance | VAT-Mart                               | [link](https://openreview.net/pdf?id=iEx3PiooLy)                                            | 铰接交互数据             |
| 3D Affordance | DeformableAffordance / UniGarmentManip | [link](https://arxiv.org/pdf/2303.11057) / [link](https://arxiv.org/abs/2405.06903)         | 柔性物体与服装等场景         |
| 3D Affordance | SceneFun3D / 3D AffordanceNet          | [link](https://scenefun3d.github.io/) / [link](https://github.com/lhc1224/Cross-View-AG)    | 室内环境+实物数据与点云可供性数据集 |

**小结**：  
对具身而言，CV 不只是分类/检测，而是提供可用于交互与决策的稳定表征：2D 打底，3D 提供几何约束，4D 提供跨时间一致性，而 Prompting/可供性把视觉输出变成“可执行”的中间表示。
