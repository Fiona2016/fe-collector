### 2.2 
https://huggingface.co/learn/agents-course/en/unit1/thoughts 
对于thinking来说，有两种常见的模式。
* CoT（chain of thinking），触发模式是魔法语言"Let's think step by step", LLM会在输出结果之前，在内部进行问题的分解，最后给出结果。
* ReAct，触发模式常见于信息搜索场景或其他复杂任务的拆解，鼓励大模型采用在两次thinking之间补充action和observation，通过思考循环逐渐将问题分析清晰，直到得出结论。
CoT主要是internal thinking， 不与tools之间产生交互。 ReAct模式会和env进行互动，得到的observation会影响下一步的判断。

常见的思维类型统计如何，和人类的思考方式也是非常相似的。这些思考，正是一个合格的tl需要常年进行训练的内容。浅谈一下理解，抛转引玉如下：
* <img width="845" height="543" alt="image" src="https://github.com/user-attachments/assets/672e1457-076d-46a4-8600-2b6b8a0eceb5" />
* planning, 规划
    * 复杂问题拆解。将问题进行分类，并通过某个逻辑链条，将问题按照某条线或者规律进行拆解
    * 长短期规划。一般的步骤是首先需要对事物有一定的了解(方式方法可以从感性到理性，数据分析，田野调研等)，了解行业的最佳实践和评价标准，且能拆分出维度。设定目标并识别目标与现状之间的gap，使用拆解能力进行问题拆分设定todo。好的规划还会包括一些自我审视和迭代，
* Analysis,分析。 根据知识库结合问题现象进行追问，直到挖掘到问题的本质。
* Decision Making, 做决策。 拆分出决策的要素，结合目标和约束条件，给出局部最优解。（这里的目标和约束条件可能是动态变化的，长期和短期维度下的决策也可能会产生差异，需要具体情况具体分析）
* Problem Solving, 解问题。 最重要的点是识别问题，找对问题就解决了一半！定义问题，分析问题，逐步解决问题。
* Memory Integration, 记忆集成。这里有点像知识库的加载了，有了方法论，还需要结合行业的特有经验，采用“因地制宜”的方式来选取合适的解决方式。
  当前 agent 内存分类：
   - Short-term → context window
   - Long-term → vector DB / episodic memory / parametric memory
   - 行业知识 → RAG / fine-tuning / tool 的 domain knowledge
* Self-Reflection, 复盘。能够从过往的失败经验中发现问题，通过反思和复盘来优化后续的决策。
* Goal Setting, 目标设定。是规划的一部分，不再赘述。
* Prioritization, 优先级划分。在生活和工作中，能做到要事第一，抓住关键矛盾，比较重要。



### 2.2
https://huggingface.co/learn/agents-course/unit1/agent-steps-and-structure 
AI Agent 三要素：
- Thought 
- Action
- Observation

首先进行思考和推理，根据问题分析需要调用的工具，通过action(tools, mcp, skill)等进行处理，并监听结果。得到结果后再发起第二轮思考。直到observation得到了结果。
这个循环叫做ReAct。

QA
1. think是使用的LLM的能力吗？
    是的。think，一般的流程是将query + system context 发送给LLM，让其返回下一步需要执行的action。
3. observation是一个异步监听吗？观测了什么？ 
   不是。一般情况下指的是调用action得到的结果。为什么不叫result？
   - ReAct 的核心创新之一就是：action 让模型接触外部真实世界，observation 再把外部信息带回来帮助模型继续 reasoning。
   - 这里的observation观测到的内容，是每一步得到的中间态产物，不是最终结果。Observation 是因为它最准确地描述了“外部环境对我 action 的客观回应”，



### 12.30
https://mp.weixin.qq.com/s/xInB5TRU3iESKdkqQQ6qAg 
- 技术债在 AI 眼里并不是“债”，只是更多的代码而已。
- 开发人员还是需要作为第一责任人来负责代码的生成。
- 简单(simple)和容易(easy)不一样，不能贪图一键生成的便利，而导致自己对维护的代码不够了解。


### 12.9
1. b23.tv/tOHOcn4 gemini生成网页，capacitor框架可以支持跨端，思路是生成app，通过webview加载网页。
### 2025

### 学习资料
1. https://intro-llm.github.io/ 大语言模型的教科书，配课件
2. https://github.com/microsoft/AI-For-Beginners
3. https://aigc.phodal.com/prelude.html 

### 12.25 
https://learnprompting.org/zh-Hans/docs/basics/few_shot prompt工程师从入门到进阶，还有专业的培训
