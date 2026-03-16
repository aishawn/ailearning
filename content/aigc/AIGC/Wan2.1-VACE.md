## **02.开源内容**

本次开源Wan2.1-VACE，有1.3B和14B两个版本，支持480P和 720P。其中1.3B版本可在消费级显卡运行。

GitHub：[https://github.com/Wan-Video/Wan2.1](https://link.zhihu.com/?target=https%3A//github.com/Wan-Video/Wan2.1)

[ModelScope](https://zhida.zhihu.com/search?content_id=257768624&content_type=Article&match_order=1&q=ModelScope&zd_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6aGlkYV9zZXJ2ZXIiLCJleHAiOjE3NzM4MTgzMzcsInEiOiJNb2RlbFNjb3BlIiwiemhpZGFfc291cmNlIjoiZW50aXR5IiwiY29udGVudF9pZCI6MjU3NzY4NjI0LCJjb250ZW50X3R5cGUiOiJBcnRpY2xlIiwibWF0Y2hfb3JkZXIiOjEsInpkX3Rva2VuIjpudWxsfQ.lblI7uo8gPVdfikYLR-WkuMZduncDV-d9_1DRsobJ5A&zhida_source=entity): [https://www.modelscope.cn/organization/Wan-AI](https://link.zhihu.com/?target=https%3A//www.modelscope.cn/organization/Wan-AI)

[Huggingface](https://zhida.zhihu.com/search?content_id=257768624&content_type=Article&match_order=1&q=Huggingface&zd_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6aGlkYV9zZXJ2ZXIiLCJleHAiOjE3NzM4MTgzMzcsInEiOiJIdWdnaW5nZmFjZSIsInpoaWRhX3NvdXJjZSI6ImVudGl0eSIsImNvbnRlbnRfaWQiOjI1Nzc2ODYyNCwiY29udGVudF90eXBlIjoiQXJ0aWNsZSIsIm1hdGNoX29yZGVyIjoxLCJ6ZF90b2tlbiI6bnVsbH0.o9qs4QKTZuZuUtXrgJ6mwaW3m8qa2eUijdEpzYETxUE&zhida_source=entity): [https://huggingface.co/Wan-AI](https://link.zhihu.com/?target=https%3A//huggingface.co/Wan-AI)

Technical Report: [https://arxiv.org/abs/2503.07598](https://link.zhihu.com/?target=https%3A//arxiv.org/abs/2503.07598)

## **03.重点**

### **开源效果**

Wan2.1-VACE支持以下几种能力：

- 图像参考视频生成，支持基于主体和背景图像参考的视频生成；
- 视频的可控重绘，支持基于人体姿态、运动光流、画面景深、运动轨迹、着色等控制生成；
- 视频的局部编辑，通过指定视频的局部区域，可以实现视频元素的替换、增加和删除等操作；
- 视频扩展，在时间维度上支持视频任意片段生成，给定任意片段、首尾帧进行完整视频的补全。在空间维度上支持视频的扩展生成，这个能力的更进一步的应用是视频的背景替换，即可以保留主体不变来根据prompt变换背景或拓展视频画面。


**最重要的是，作为一个统一的多任务模型，VACE还支持上述单任务能力的自由组合，从而破解了传统的单任务专家模型各司其职的协同难题。**VACE统一模型的优势在于能够自然地实现前面所述基础能力的自由组合，不必再为了单一功能训练一个新的专家模型。通过组合各种能力，可以解锁各种各样的视频创作方式。这样一来，不仅大大简化了用户的工作流程，而且极大程度地扩展了AI视频生成创意的边界。



### **1.采用多模态信息输入，提高视频生成可控性**

文本提示词通常无法满足用户对于角色一致性、布局、运动姿态和幅度等要素的控制需求，特别是对于专业AI视频创作者而言。

为解决这一难题，VACE在Wan2.1文生视频基模型的基础上，增加了更多常见的输入形式，形成了集文本、图像、视频、mask和控制信号于一体的视频编辑统一模型。AYSCALE

  

![](https://pica.zhimg.com/v2-f3779d152e7159eb3d49e794fd35563c_1440w.jpg)

  

其中：

对于图像输入，VACE可以接受物体参考图或者视频帧；

对于视频，用户可以通过抹除、局部扩展等操作，使用VACE进行重新生成；

对于局部区域，用户可以通过0/1二值信号来指定编辑区域；

对于控制信号，VACE支持深度图、光流、布局、灰度、线稿和姿态等。  
  

### **2.统一的单一模型，为多种任务提供更加统一的解决方案**

由于VACE的多模态输入模块和Wan2.1强大的视频生成能力，传统专家模型能实现的功能VACE可以轻松驾驭。例如：

图像参考能力，给定参考主体和背景，可以完成元素一致性生成。  
视频重绘能力，包括姿态迁移、运动控制、结构控制、重新着色等；  
局部编辑能力，包括主体重塑、主体移除、背景延展、时长延展等。  
  

### **3.多任务自由组合，可以更加深度地挖掘视频生成的创意潜力。**

VACE视频编辑统一模型的优势在于比较自然地支持各种原子能力的自由组合，不必再为了单一功能训练一个新的专家模型。

例如：

1.组合图片参考和主体重塑功能，可以实现视频的物体替换功能。

2.组合运动控制和首帧参考功能，可以实现静态图片的姿态控制。

3.组合图片参考、首帧参考、背景扩展和时长延展功能，可以将一张竖版图片，变成一个横版视频，并且在其中加入参考图片中的元素。  
  

## **04.VACE统一框架**

VACE的强大能力源于通义万相团队对模型框架的设计，以下是VACE框架的三个设计。

### **1.视频条件单元 [VCU](https://zhida.zhihu.com/search?content_id=257768624&content_type=Article&match_order=1&q=VCU&zd_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6aGlkYV9zZXJ2ZXIiLCJleHAiOjE3NzM4MTgzMzcsInEiOiJWQ1UiLCJ6aGlkYV9zb3VyY2UiOiJlbnRpdHkiLCJjb250ZW50X2lkIjoyNTc3Njg2MjQsImNvbnRlbnRfdHlwZSI6IkFydGljbGUiLCJtYXRjaF9vcmRlciI6MSwiemRfdG9rZW4iOm51bGx9.iRAxWEAo5n4llWH-KTa0Ro1HTYLs0jgvs56CWibbE5U&zhida_source=entity)**

首先，通义万相团队深入分析和总结了文生视频、参考图生视频、视频生视频，基于局部区域的视频生视频4大类视频生成和编辑任务的输入形态，提出了一个更加灵活统一的输入范式：视频条件单元 VCU。

  

![](https://pic3.zhimg.com/v2-443728088396fc23f3a9f7011f92f9f6_1440w.jpg)

  

它将多模态的各类上下文输入，总结成了文本、帧序列、mask序列三大形态，在输入形式上统一了4类视频生成和编辑任务。

另外值得注意的是，VCU中的帧序列和mask序列在数学上可以相互叠加，从而给各种任务的自由组合创造了条件。

### **2.多模态输入的token序列化**FINE-TUNING

  

![](https://pic2.zhimg.com/v2-be715f69bd761a01ed2816123146de9d_1440w.jpg)

  

VACE解决的另一大难题是多模态输入的token序列化。token序列化（Tokenization）是Wan2.1的视频扩散Transformer架构能正确处理输入信息的前提条件。这里，VACE首先将VCU输入的Frame序列进行概念解耦。具体做法是，把需要保持不变的RGB像素，和需要重新生成的像素，例如控制信号等，分开重构成可变帧序列和不变帧序列。

然后，将可变帧序列、不变帧序列、mask序列分别进行编码至隐空间。这里可变帧序列、不变帧序列会通过VAE被编码至与[DiT](https://zhida.zhihu.com/search?content_id=257768624&content_type=Article&match_order=1&q=DiT&zd_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6aGlkYV9zZXJ2ZXIiLCJleHAiOjE3NzM4MTgzMzcsInEiOiJEaVQiLCJ6aGlkYV9zb3VyY2UiOiJlbnRpdHkiLCJjb250ZW50X2lkIjoyNTc3Njg2MjQsImNvbnRlbnRfdHlwZSI6IkFydGljbGUiLCJtYXRjaF9vcmRlciI6MSwiemRfdG9rZW4iOm51bGx9.mLBpTir9xcxGSie-6gr7Nxb-ALheNHdCI4C110aLHW4&zhida_source=entity)模型噪声的维度一致，通道数为16。而mask序列通过变形和采样，编码成时空维度一致，而通道数为64的隐空间特征。最后，将frame序列和mask序列的隐空间特征合一，并通过可训练参数映射为DiT的token序列。

### **3.[上下文适配微调](https://zhida.zhihu.com/search?content_id=257768624&content_type=Article&match_order=1&q=%E4%B8%8A%E4%B8%8B%E6%96%87%E9%80%82%E9%85%8D%E5%BE%AE%E8%B0%83&zd_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6aGlkYV9zZXJ2ZXIiLCJleHAiOjE3NzM4MTgzMzcsInEiOiLkuIrkuIvmlofpgILphY3lvq7osIMiLCJ6aGlkYV9zb3VyY2UiOiJlbnRpdHkiLCJjb250ZW50X2lkIjoyNTc3Njg2MjQsImNvbnRlbnRfdHlwZSI6IkFydGljbGUiLCJtYXRjaF9vcmRlciI6MSwiemRfdG9rZW4iOm51bGx9.VzF9q_VW3WEnHotIhQMaDqt_r7Qq7t39ojUcWaFrufM&zhida_source=entity)**

在训练策略上我们对比了全局微调和上下文适配微调两种方案。全局微调通过训练全部的DiT参数，较少地新增参数，能取得更快的推理速度。而上下文适配微调方案是固定原始的基模型参数，仅选择性地复制并训练一些原始Transformer层作为额外的适配器。STEP

通过实验验证，两种训练策略在最终的验证损失上差别不大，但是上下文适配微调可以取得更快的收敛速度，并且避免了全局微调可能隐含的基础能力丢失的问题。在本次开源的版本使用了上下文适配器微调作为训练方式。