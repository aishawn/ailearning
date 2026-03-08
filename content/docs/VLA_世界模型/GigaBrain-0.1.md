GigaBrain-0.1

GigaBrain-0.1 是另一路线：

World Model + VLA

目标：

解决机器人训练数据不足问题。

1 核心思想

当前机器人问题：

机器人数据太贵

采集成本：

真实机器人

人类示范

设备维护

非常贵。

GigaBrain提出：

用 世界模型生成机器人数据

2 架构

GigaBrain体系：

World Model
      ↓
生成机器人交互数据
      ↓
训练 VLA
      ↓
机器人执行

关键组件：

(1) GigaWorld-0

世界模型系统：

两个模块：

Video生成

生成机器人操作视频

控制：

动作
视角
环境
3D生成

使用：

3D Gaussian Splatting

物理仿真

动作规划

生成：

真实可执行的机器人数据

这些数据用于训练 VLA。

3 GigaBrain模型

GigaBrain是最终的机器人模型。

特点：

(1) RGBD输入

使用：

RGB
Depth

理解空间。

(2) Embodied CoT

类似 DM0：

模型会推理：

空间关系
任务步骤
长时依赖
(3) World Model 数据增强

训练数据来源：

真实机器人
+ world model生成数据

优势：

极大减少真实数据需求

4 性能

GigaBrain-0.1：

RoboChallenge 全球第二

强泛化能力

可跨任务迁移

三、DM0 vs GigaBrain 技术路线对比
维度	DM0	GigaBrain
核心思想	具身原生模型	World model数据引擎
参数规模	2.4B	未公开
数据来源	多模态真实数据	世界模型生成数据
Action policy	Flow matching	policy learning
关键创新	Spatial CoT	World model data engine
重点解决	机器人智能架构	数据规模问题