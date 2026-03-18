

# Transformer化（DiT时代）

## 代表

- DiT
    
- Stable Diffusion 3
    
- PixArt-α
    

---

## 核心变化

👉 U-Net（CNN） → Transformer

---

## 带来的飞跃

### 1. 全局建模

- 更好的构图、关系建模
    

### 2. scaling law

- 越大越强（类似LLM）
    

### 3. token统一

- 图像 / 文本 / 视频统一表示
    

---

👉 **结论：**  
Diffusion + Transformer = 当前SOTA

---

# 五、第五阶段：视频生成（时序建模）

## 代表

- Video Diffusion Models
    
- VideoChatGPT
    
- Sora
    

---

## 核心难点

### 1. 时间一致性

- 防止闪烁（flicker）
    

### 2. 长视频建模

- memory explosion
    

### 3. 物理合理性

- 运动真实
    

---

## 解决思路

### （1）时空统一建模

- 3D attention / space-time token
    

### （2）分段生成

- clip → stitching
    

### （3）latent video

- 压缩视频token
    

---

👉 **结论：**  
视频生成 = 图像 diffusion + 时间建模

---

# 六、第六阶段：多模态统一生成（2025–2026）

## 代表趋势

- 文本 → 图像 → 视频 → 动作 → 3D
    

---

## 核心模型方向

### 1. VLM + Diffusion

- 语言指导生成
    

### 2. 世界模型（World Model）

- 物理一致性
    
- 可交互生成
    

---

## 新范式

👉 **生成模型 = 世界模拟器**


# 时空统一建模（视频生成核心）


时空统一建模是将视频表示为三维 token（时间+空间），通过 Transformer 的空间和时间注意力机制统一建模，从而保证生成视频在结构和时间上的一致性。

## 1. 本质问题

图像生成：

2D空间（H × W）

视频生成：

3D时空（T × H × W）

👉 核心难点：

- 时间一致性（不闪）
    
- 长序列建模
    

---

## 2. 主流做法（3种）

---

## 方法1：3D Token + Transformer（最主流）

### 做法

把视频切成：

patch → token  
(x, y, t) → token

输入 Transformer：

[frame1_patch1, frame1_patch2, ..., frameT_patchN]

然后做：

- **空间 attention**
    
- **时间 attention**
    

---

### 两种结构

#### （1）Full 3D attention

- 所有 token 全连接
    
- 最强但最贵
    

---

#### （2）Factorized attention（工业常用）

分两步：

Step1: 空间 attention（每一帧）  
Step2: 时间 attention（跨帧）

👉 降低复杂度

---

## 方法2：2D模型 + Temporal模块

在图像模型基础上加：

- temporal conv
    
- temporal attention
    

👉 类似：

- Stable Diffusion + 时间层
    

---

## 方法3：Latent Video Diffusion

先压缩视频：

video → latent (z)

再在 latent 上做 diffusion

👉 大幅降低计算

---

## 3. 关键技术点

### （1）位置编码（非常关键）

- 空间位置（x, y）
    
- 时间位置（t）
    

👉 常用：

- 3D RoPE
    
- 分离位置编码
    

---

### （2）长视频处理

方法：

- sliding window
    
- keyframe + interpolation
    
- memory token
    

---

### （3）一致性约束

- optical flow loss
    
- feature consistency




# 世界模型（World Model）如何保证物理一致性


## 1. 什么是“物理一致性”

生成的视频要满足：

- 物体不会突然消失
    
- 重力合理
    
- 运动连续
    
- 碰撞真实
    

---

## 2. 三类核心方法

---

## 方法1：数据驱动（最主流）

👉 本质：  
**让模型“看够真实世界”**

训练数据：

- 大规模视频（真实物理）
    

模型自动学：

- 重力
    
- 惯性
    
- 碰撞
    

👉 类似：  
LLM学语言规律

---

## 方法2：显式物理约束（更硬核）

在训练中加入：

### （1）光流约束

frame_t → frame_t+1 motion consistent

### （2）速度/加速度约束

v(t+1) ≈ v(t)

### （3）3D约束

- 深度一致性
    
- 多视角一致性
    

---

## 方法3：世界模型（结构化建模）

👉 更高级（Sora方向）

模型内部学：

state_t → state_t+1

而不是直接生成像素

---

### 具体结构

视觉编码 → latent state  
latent state → dynamics model（预测未来）  
latent → 解码成视频

👉 类似：

- 游戏引擎
    
- 物理模拟器
    

---

## 3. 关键技术

### （1）NeRF / 3D表示

- 保证多视角一致
    

### （2）Latent dynamics

- 在 latent 空间建模运动
    

### （3）长时一致性

- memory / recurrence
    

---

## 4. 直观理解

普通Diffusion：  
直接画每一帧  
  
世界模型：  
先理解世界 → 再渲染帧





