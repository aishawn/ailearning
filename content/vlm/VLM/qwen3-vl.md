Qwen3-VL 是 **Qwen2-VL 的下一代版本（2025）**

目标：

> 从 VLM 升级为 **视觉推理模型**

核心升级：

perception → reasoning

---

## 1 新架构：Unified Token Space

核心思想：

**统一视觉和语言 token**

以前：

image tokens  
text tokens

现在：

shared token space

类似：

- Flamingo
    
- Kosmos
    
- Gemini
    

---

## 2 多图推理

Qwen3-VL 支持：

image1  
image2  
image3

进行：

compare  
temporal reasoning  
spatial reasoning

例如：

before / after  
difference

---

## 3 视频长序列

支持：

long video understanding

通过：

frame compression  
token pruning

减少 token。

---

## 4 视觉 reasoning

加入：

chain-of-thought  
visual reasoning

例如：

step-by-step analysis







# Interleaved RoPE：核心思想

一句话总结：

> **把时间和空间维度“交错绑定”到 embedding 维度中，让每个 attention head 同时感知 t + h + w**

---

## ✅ Step 1：拆 embedding 维度

假设：

head_dim = 128

传统：

[0~127] → 全部用于 1D position

---

Interleaved 做法：

👉 **把维度分组，并交错分配给 t/h/w**

例如：

dim 0,3,6,... → 时间 t  
dim 1,4,7,... → 高度 h  
dim 2,5,8,... → 宽度 w

也就是：

(t, h, w, t, h, w, t, h, w, ...)

👉 这就是 **interleaved（交错）**

---

## ✅ Step 2：分别计算 RoPE 角度

对一个 token：

pos = (t, h, w)

分别算：

θ_t = t * freq_i  
θ_h = h * freq_i  
θ_w = w * freq_i

---

## ✅ Step 3：按维度交错应用旋转

例如：

dim 0 → 用 θ_t  
dim 1 → 用 θ_h  
dim 2 → 用 θ_w  
dim 3 → 用 θ_t  
...

然后做标准 RoPE rotation：

q_i = q_i * cosθ - q_j * sinθ

👉 每个 head 的每一小段维度，都绑定一个空间或时间信息






# 为什么它比 3D RoPE 更优？

## 🆚 3D RoPE

### 3D RoPE 做法：

- 把 (t,h,w) → 映射到不同维度块
    
- 每一块独立旋转
    

问题：

- **维度是“分块”的（block-wise）**
    
- 不同维度之间 interaction 弱
    

---

### Interleaved RoPE：

- 维度是 **交错的（fine-grained）**
    
- 每个 attention head 都同时包含 t/h/w




# YaRN（**Yet another RoPE extensioN**）本质是：  
👉 **在不改模型结构、不重新训练的前提下，把 RoPE 的有效上下文长度“拉长”**  
👉 核心是：**对 RoPE 的旋转角度 θ 做“非线性缩放”**
不同频率，用不同缩放策略（低频保留，高频压缩）