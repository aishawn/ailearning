verl 的真实使用流程 = SFT → Rollout → RL → Evaluation

Dataset  
↓  
SFT Trainer  
↓  
Actor Model  
↓  
Rollout Engine (vLLM / HF)  
↓  
Reward Model / Rule Reward  
↓  
RL Trainer (PPO / GRPO)  
↓  
Updated Policy



verl 最大特点：

**训练和推理解耦**

训练: FSDP / Megatron  
推理: vLLM / SGLang



Rollout = 生成训练 trajectory。
verl一般用：vLLM

Rollout流程：
Prompt  
 ↓  
Actor  
 ↓  
Generated Answer  
 ↓  
Reward  
 ↓  
Trajectory