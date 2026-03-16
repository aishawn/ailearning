LibraMerging思路不同：

相邻位置 token 直接 merge

原因：

视觉 patch 有 **强空间相关性**。

例如：

patch(i,j)  
patch(i+1,j)

往往内容类似。

所以可以：

merge → 一个 token




# LibraMerging整体流程

完整 pipeline：

Image  
 ↓  
Vision Encoder (ViT)  
 ↓  
Visual tokens  
 ↓  
LibraMerging  
 ↓  
Compressed tokens  
 ↓  
LLM

关键点：

在进入LLM前压缩



merge：

token_new = w1 * token_i + w2 * token_j