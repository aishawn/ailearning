22年：InternVideo，视频表征学习clip

24年：InternVideo2，多模态同一训练

25年：InternVideo2.5，长视频+细粒度：分层token压缩

25年：InternVideo-Next，世界模型无文本：clip学不到物理3D运动本质、



### A. Video-text（CLIP类）

- 依赖 noisy caption
    
- 学不到：
    
    - 物理规律
        
    - 3D结构
        
    - 运动本质
        

### B. MVM（VideoMAE类）

- pixel reconstruction → 太低级
    
- latent prediction → 容易“作弊”





**Encoder–Predictor–Decoder**

- Encoder：提特征
- Predictor：**世界模型（latent dynamics）**
- Decoder：重建


## 3️⃣ 两阶段训练（核心）

### Stage1：语义引导扩散重建

- 用 diffusion decoder
    
- 引入 image-level semantic prior（类似 SigLIP）
    

👉 解决：

> 细节 vs 语义冲突

---

### Stage2：latent prediction（世界建模）

- 不再做 pixel reconstruction
    
- 预测 latent
    

👉 学到：

- 动作
    
- 物理
    
- 时序因果


### InternVideo

- 直接建模：
    
    - spatiotemporal token
        
    - motion
        
    - long-range dynamics
        

👉 本质：

> **native video modeling**