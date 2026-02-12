### 2.12 
https://mp.weixin.qq.com/s/y7J8jiN_B8pbEExHEpAjbg
网页通过支持对WebMCP 的调用，可以协助AI 通过接口来获取网页需要传递的信息，有效节约token，而不必每次通过截图来确认dom情况。
思考：目前snapshot主要用于识别和对齐样式，获取数据其实也可以通过读取dom来获得。针对样式调整的需求,web mcp是支持不了的。web mcp的场景也许适合于SEO? 可以方便快速获取当前网页信息？

### 2.11
https://mp.weixin.qq.com/s/I_VpBEktknviXi1kWvt8GA 
AI如何提升效能？如何进行度量？ 以千人团队的实践进行距离说明


### 2.2
https://huggingface.co/learn/agents-course/en/unit1/actions 
这篇文章介绍了Action的一些说明，有点不太好理解。这里简单介绍一下整个Agent的工作流程方便理解其内容。
首先有个前置条件，LLM是无记忆的。它自身不会存储上下文，每次的对话，其实是system prompt + 用户输入 + 循环（LLM思考 + agent调用actions得到的结果） + final answer进行持续接力的结果。

感觉到困惑的几个讨论点如下：
Agent在调用LLM时，会预期希望其能够在明确有Action调用的情况下，结束输出，保证其能够在Action调用的地方停下来，让Agent来接管控制权，然后执行对应的tools或者LLM生成的代码，得到结果之后返回observation， LLM再继续思考迭代。
1. 假设没有stop的能力，LLM会在Action输出之后继续"胡言乱语", 对于Agent来说，如何正确感知到对应的结束token并获取到actions会是技术挑战，多轮对话下来可能会不好调试，也不稳定。
2. 保证stop这件事情现在有点矛盾，本来是LLM应该保证的事情，现在是需要Agent来指定stop sequence，有点别扭，2026年大部分模型都能在90%以上的场景对于actions场景stop
3. 如果每次遇到action调用，模型就停下来，然后再进行下一轮的调用，这样会造成token的浪费和执行时间的浪费。现在的优化做法
   - 让LLM充分思考，可以输出多个Actions供Agent批量并行调用并给到结果
   - 让LLM先进行plan，给出plan和里面的actions， Agent对plan里面的actions进行执行
   
<img width="797" height="570" alt="image" src="https://github.com/user-attachments/assets/78ac9513-8c5f-4c0a-b547-5b2a2a0f1355" />





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
