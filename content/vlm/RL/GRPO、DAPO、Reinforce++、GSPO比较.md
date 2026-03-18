
GSPO 更适合 MoE，因为它把 RL 的“路径级强化”变成“分布级匹配”，显著降低稀疏专家结构中的
梯度方差和 router collapse 风险。然后利用GSPO在组内基于序列重要性权重裁剪优势函数，缓解长序列梯度不稳。


PPO 依赖 value function，训练复杂。  
Reinforce++ 去掉 value head，但 variance 较大。  
GRPO 引入 group relative advantage，大幅降低 variance，是目前大模型 RL 的主流方法。  
DAPO 在 GRPO 基础上加入 dynamic advantage scaling，提高稳定性。  
FRPO 则通过 forward KL 提高探索能力。

| 类别                             | 方法                       |
| ------------------------------ | ------------------------ |
| **Policy Gradient（高方差）**       | PPO / REINFORCE++ / RLOO |
| **Variance-reduced PG（主流）**    | GRPO / DAPO / DrGRPO     |
| **Distribution Matching（新趋势）** | GSPO / ReMax / PRIME     |

| 方法          | 是否PG | 是否value | 方差  | 稳定性 | MoE友好 | 结论           |
| ----------- | ---- | ------- | --- | --- | ----- | ------------ |
| PPO         | ✅    | ✅       | 中   | 中   | ❌     | 过时           |
| REINFORCE++ | ✅    | ❌       | ❌高  | ❌   | ❌     | baseline     |
| RLOO        | ✅    | ❌       | 中   | 中   | ❌     | 过渡           |
| GRPO        | ✅    | ❌       | 低   | 高   | 一般    | 主流           |
| DAPO        | ✅    | ❌       | 更低  | 更高  | 一般    | 工业版          |
| DrGRPO      | ✅    | ❌       | 低   | 很高  | 一般    | noisy reward |
| GSPO        | ❌    | ❌       | 极低  | 极高  | ✅     | 未来           |
| ReMax       | ❌    | ❌       | 低   | 高   | ✅     | GSPO同类       |
| PRIME       | 混合   | ❌       | 低   | 高   | ✅     | 统一框架         |


## 👉 场景1：通用 LLM RLHF（非 MoE）

- 首选：**GRPO / DAPO**
    
- 原因：稳定 + 成熟
    

---

## 👉 场景2：长 CoT / reasoning

- 首选：**DAPO / DrGRPO**
    
- 原因：抗 reward spike
    

---

## 👉 场景3：MoE / 超大模型（未来主流）

- 首选：**GSPO / ReMax**
    
- 原因：
    
    - dense gradient
        
    - 不会 collapse
        

---

## 👉 场景4：弱 reward / noisy reward

- 首选：**DrGRPO / PRIME**
    

---

## 👉 场景5：极致简单快速验证

- 用：**REINFORCE++ / RLOO**






## PPO（传统 RLHF）

**核心：**

A=r−V(s)A = r - V(s)A=r−V(s)

**特点：**

- 需要 value head
    
- clip + KL 约束
    

**优点：**

- 理论成熟
    
- 稳定（在小模型）
    

**缺点：**

- ❌ 训练复杂（policy + value）
    
- ❌ advantage 估计噪声大
    
- ❌ 不适合大模型 / MoE
    

👉 **结论：已逐渐被替代**

---

## 2️⃣ REINFORCE++（最简单）

**核心：**

∇θ∝r∇log⁡π\nabla \theta \propto r \nabla \log \pi∇θ∝r∇logπ

**特点：**

- 无 value head
    
- 直接用 reward
    

**优点：**

- 简单
    
- 无 bias
    

**缺点：**

- ❌ 方差极大
    
- ❌ 不稳定
    

👉 **结论：baseline / 小规模实验用**

---

## 3️⃣ RLOO（Leave-One-Out）

**核心：**

Ai=ri−mean(r−i)A_i = r_i - \text{mean}(r_{-i})Ai​=ri​−mean(r−i​)

**特点：**

- 用 group 内其他样本做 baseline
    

**优点：**

- 降方差
    
- 无 value head
    

**缺点：**

- still sample-based
    
- 对 group size 敏感
    

👉 **结论：GRPO 的前身版本**

---

## 4️⃣ GRPO（🔥当前主流）

**核心：**

Ai=ri−mean(rgroup)A_i = r_i - \text{mean}(r_{\text{group}})Ai​=ri​−mean(rgroup​)

**关键思想：**  
👉 用“组内相对排序”代替 value

**优点：**

- ✅ 不需要 value head
    
- ✅ 方差显著降低
    
- ✅ 易 scale（大 batch）
    

**缺点：**

- ❌ 仍然是 policy gradient（有噪声）
    
- ❌ reward spike 仍敏感
    

👉 **结论：**

> 当前 LLM RL 的主流方法（DeepSeek/Qwen 类）

---

## 5️⃣ DAPO（GRPO增强版）

**核心：**

Ai=scale(ri−rˉ)A_i = \text{scale}(r_i - \bar r)Ai​=scale(ri​−rˉ)

**关键：**  
👉 动态缩放 advantage

**优点：**

- ✅ 抗 reward scale 波动
    
- ✅ 更稳定（长 CoT）
    

**缺点：**

- 本质仍是 PG
    

👉 **结论：**

> GRPO → DAPO = 工业稳定版本

---

## 6️⃣ DrGRPO（Distributionally Robust）

**核心：**

- 对 reward 分布做鲁棒优化（robust optimization）
    

**优点：**

- ✅ 抗 outlier reward
    
- ✅ 更稳定
    

**缺点：**

- 复杂度更高
    

👉 **结论：**

> 适合 noisy reward / 自动评测场景

---

## 7️⃣ GSPO（🔥MoE/大模型趋势）

**核心：**

wi=softmax(ri)w_i = \text{softmax}(r_i)wi​=softmax(ri​) L=KL(π∣∣w)\mathcal{L} = KL(\pi || w)L=KL(π∣∣w)

👉 **不再是 policy gradient！**

**优点：**

- ✅ 极低方差
    
- ✅ 分布级训练（dense gradient）
    
- ✅ MoE 友好（避免 collapse）
    
- ✅ scaling 极强
    

**缺点：**

- ❌ exploration 较弱（偏 exploitation）
    

👉 **结论：**

> **下一代 RLHF（尤其 MoE）核心方法**

---

## 8️⃣ ReMax（Reward Maximization）

**核心：**

- 直接 maximize reward（类似 soft Q-learning）
    

**特点：**

- 更偏“最大似然 + reward”
    

**优点：**

- 稳定
    
- 训练简单
    

**缺点：**

- exploration 不强
    

👉 **结论：**

> GSPO 同类（distribution 方法）

---

## 9️⃣ PRIME

**核心：**

- preference + reward + KL 混合优化
    

**优点：**

- 结合 DPO + RL
    
- 更稳定
    

👉 **结论：**

> **向“统一训练框架”演进**

---

## 🔟 KL_Cov / Clip_Cov（正则类）

**核心：**

- 控 KL / entropy
    

**作用：**

- 防止：
    
    - 模型崩坏
        
    - 过拟合 reward
        

👉 **结论：**

> 所有方法的“稳定器插件”


| 简写              | 全称（英文）                                             | 一句话解释                            |
| --------------- | -------------------------------------------------- | -------------------------------- |
| **PPO**         | Proximal Policy Optimization                       | 带 clip + value 的经典策略梯度方法         |
| **REINFORCE++** | Improved REINFORCE (Enhanced Policy Gradient)      | 改进版 REINFORCE（无 value 的 PG）      |
| **RLOO**        | Reinforcement Learning with Leave-One-Out Baseline | 用组内 leave-one-out 做 baseline 降方差 |
| **GRPO**        | Group Relative Policy Optimization                 | 用组内相对 reward 替代 value            |
| **DAPO**        | Dynamic Advantage Policy Optimization              | 对 advantage 做动态缩放                |
| **DrGRPO**      | Distributionally Robust GRPO                       | 对 reward 分布做鲁棒优化                 |
| **GSPO**        | Group Soft Preference Optimization                 | 用 soft preference 做分布匹配（非PG）     |
| **ReMax**       | Reward Maximization                                | 直接最大化 reward 的分布式方法              |
| **PRIME**       | Preference Reward Integrated Model Optimization    | 融合 preference + reward 的统一优化框架   |