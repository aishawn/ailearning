
在开源大模型里，Gemma-3的位置大概是：

| 模型          | 定位                |
| ----------- | ----------------- |
| DeepSeek-R1 | reasoning SOTA    |
| Qwen3       | 最强开源通用模型          |
| Llama-3.3   | 稳定生态              |
| **Gemma-3** | **最高效率 backbone** |
原因主要有 **3 个工程优势**：

1️⃣ KV cache 更小  
2️⃣ 推理速度更快  
3️⃣ backbone 更稳定


实际开源生态里，Gemma-3 常见于：

### 多模态模型

- Open VLM prototype
    
- Mobile VLM
    
- Edge multimodal
    

### Agent

- tool-calling agent
    
- mobile assistant
    

### robotics / VLA

一些 robotics 团队开始用：

Gemma-3  
+ vision encoder  
+ action head

原因：

- 小模型
    
- 推理快
    
- 长 context