
Qwen2-VL 是目前开源影响力最大的国产 VLM 之一。

发布时间：**2024**

核心目标：

> 做一个可以真正用于 **OCR / UI理解 / 视频理解 / agent** 的视觉语言模型

---

## 1 架构

整体结构：

Image / Video  
     ↓  
Vision Encoder (ViT)  
     ↓  
Dynamic Resolution Tokenization  
     ↓  
Multimodal Adapter  
     ↓  
Qwen2 LLM

核心组件：

### (1) Vision Encoder

通常使用 **ViT-G / ViT-L**

输出：

image → patch tokens

---

### (2) Dynamic Resolution

这是 Qwen2-VL 的 **核心创新**

传统 VLM：

固定分辨率  
224×224

Qwen2-VL：

任意分辨率  
动态切patch

例如：

1024×1024 → 256 tokens

优势：

- 高分辨率 OCR
    
- UI元素识别
    
- 图表理解
    

---

### (3) M-RoPE

Qwen2-VL 引入：

**Multimodal Rotary Positional Embedding**

目的：

解决

image + video + text

统一位置编码。

支持：

time  
height  
width

3D位置。

---

### (4) 视频输入

视频处理方式：

video → frame sampling → tokens

例如：

16 frames

拼接到序列。

---

## 2 训练流程

数据规模：

trillions tokens  
billions multimodal pairs

训练阶段：

### Stage 1

视觉对齐

image caption

---

### Stage 2

多模态 instruction tuning

image QA  
OCR  
chart QA  
UI grounding

---

### Stage 3

Agent / tool 数据

例如：

screen understanding  
GUI action reasoning

---

## 3 核心能力

Qwen2-VL 在几个领域很强：

### OCR

文本检测 + 理解

例如：

表格  
网页  
文档

---

### UI理解

可以做

button detection  
bounding box

例如：

<box>Submit</box>

---

### 视频理解

能力：

- action recognition
    
- event detection