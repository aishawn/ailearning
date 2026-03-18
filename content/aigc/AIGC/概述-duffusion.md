GAN（对抗生成）  
↓  
VAE / Flow（概率建模探索）  
↓  
Diffusion（稳定 + 可控）  
↓  
Diffusion + Transformer（DiT）  
↓  
Video Diffusion（时空建模）  
↓  
Multimodal World Model（统一生成）




# Diffusion（革命性阶段）

## 代表

- DDPM
    
- Stable Diffusion
    
- DALL·E 2
    

## 核心思想

- 加噪 → 去噪（逐步生成）
    

---

## 为什么干掉 GAN？

### 1. 训练稳定

- 没有对抗博弈
    

### 2. 多样性强

- 覆盖分布更完整
    

### 3. 可控性强

- 可以加条件（text / image / mask）
    

---

## 关键突破

### （1）Latent Diffusion（SD）

👉 在 latent 空间生成，大幅降低计算

---

### （2）Classifier-Free Guidance（CFG）

👉 控制生成强度（prompt遵循度）

---

👉 **结论：**  
Diffusion = 当前图像生成主流范式

---




## Q1：CFG 是不是只用于推理？

> 是的，标准的 classifier-free guidance 只在推理阶段使用，通过组合有条件和无条件的预测来调整采样方向。训练阶段仅通过随机丢弃条件来让模型同时学习两种分布。

---

## Q2：同一图像配多个条件会不会有问题？

> 在合理标注的情况下不会有问题，因为模型学习的是条件分布 P(x|c)，允许一个图像对应多个语义描述。但如果条件标注存在冲突或错误，会导致条件分布被污染，从而影响生成质量，并且这种问题会在 CFG 中被进一步放大。