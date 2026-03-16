
| 模型     | 公司              | 类型               |
| ------ | --------------- | ---------------- |
| Cosmos | NVIDIA          | World Model      |
| Sora   | OpenAI          | Video generation |
| Genie  | Google DeepMind | Game world model |



**2025 年提出的一套“世界模型（World Model）体系**

**让 AI 学会理解和预测真实世界的物理演化**。

我从 **背景 → 架构 → 技术核心 → 和传统多模态模型差异 → 应用** 给你系统解读。

---

# 一、Cosmos 是什么

Cosmos 可以理解为：

**“用于物理世界理解和模拟的基础模型（Foundation World Model）”**

传统大模型：

- LLM：理解语言
    
- VLM：理解图像 + 文本
    
- Video Model：理解视频
    

但这些模型 **不会真正理解物理世界规律**。

Cosmos 的目标：

> **学习现实世界的物理动力学，并预测未来状态**

核心能力：

1️⃣ **理解视频世界**  
2️⃣ **预测未来视频**  
3️⃣ **生成可控物理环境**

本质：

**Video → World Model → Simulation**

---

# 二、Cosmos 整体架构

Cosmos 体系主要包含 **三层结构**：

真实数据  
   ↓  
Cosmos Pretraining  
   ↓  
World Model  
   ↓  
Simulation / Planning / Robotics

具体组件：

### 1 视觉编码器

通常使用：

- ViT
    
- SigLIP
    
- DINOv2
    

把视频转换成 token。

---

### 2 时空世界模型（核心）

核心是：

**Video Transformer**

输入：

过去视频帧

输出：

未来视频帧

本质任务：

P(Future Frames | Past Frames)

类似：

**Video Diffusion / Autoregressive Video**

---

### 3 物理推理层

Cosmos 学习：

- 物体运动
    
- 碰撞
    
- 重力
    
- 遮挡
    
- 动作结果
    

例如：

输入：

机器人抓球

预测：

球会掉落 / 被抓住

---

# 三、Cosmos 的关键技术

## 1 Video World Model

Cosmos 的核心：

**世界状态预测**

公式：

S_t → S_t+1

S = world state

视频本质上是：

Frame_t → Frame_t+1

---

## 2 Latent World Representation

Cosmos 不直接在像素空间预测。

而是：

Video → Latent Space → Dynamics

类似：

VAE / diffusion latent。

优点：

- 计算更小
    
- 更稳定
    
- 可泛化
    

---

## 3 Physics-aware training

训练数据：

- 自动驾驶视频
    
- 机器人操作
    
- 真实物理世界
    

学习：

- inertia
    
- collision
    
- gravity
    

让模型形成：

**隐式物理模型**

---

## 4 Simulation without engine

传统仿真：

Unity  
Unreal  
Isaac Sim

依赖：

- 人工建模
    
- 物理引擎
    

Cosmos：

Video → 学习物理规律

变成：

**Neural Simulation**