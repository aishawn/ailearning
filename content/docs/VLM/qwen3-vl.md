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