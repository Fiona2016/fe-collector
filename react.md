### 11.5
https://react.dev/learn/reusing-logic-with-custom-hooks 再读一遍。
* hook是react与”外部系统“之间的桥梁。
* 在抽取hook时，也就指定了应用的边界。
* 使用Effect写法，关注的是过程，useEffect将其抽取后，主流程关注的是意图的实现。

https://react.dev/reference/react/useSyncExternalStore 
对于外部系统状态的获取可以使用useExternalStore hook。适用于从外部 store 获取最新快照的场景


### 11.4
[https://react.dev/learn/conditional-rendering ](https://react.dev/learn/passing-props-to-a-component)




### 11.3
开始学习第二遍。

https://react.dev/learn/your-first-component 本篇讲述什么是React中的组件。
* 组件存在的最主要的目的是复用
* React通过大写来区分html原生标签和React自定义组件

### 10.30
https://react.dev/learn/reusing-logic-with-custom-hooks

本篇讨论自定义hook
* 抽取hook的前提是逻辑复用，hook里定义的state是独立的，不会共享
* hook命名以use开头，不可用于条件渲染
* useEffect，说明脱离了react的边界，此时可以考虑useEffect的内容，能否抽取为独立hook方便后续复用
* 抽取hook时，该hook可能只是react与”外部系统“之间的桥梁。由hook来定义如何桥接，那自定义的逻辑，也可以抽取成class
* （最后一题挺好，适合面试）

### 10.29
https://react.dev/learn/removing-effect-dependencies
* 本篇讨论哪些情况下需要考虑去掉依赖。
  * 对应的依赖，是不是可以抽取成独立事件？可使用effectEvent进行抽取
  * 是否有一些不相关的依赖？可以去除或者进行拆分
  * 如果有些值的读取是为了set值进行处理，可以通过setState(prev => fn())的方式在setState中获取并修改
  * 对于依赖中有function的情况，每次渲染时funtion都会变化，可以通过useEffectEvent抽取方法，在方法中引用对应的function即可
  * 如果依赖的是一个function或者object，每次parent components渲染时该prop都会发生变化

### 10.28
https://react.dev/learn/separating-events-from-effects(重要)
* 首先需要区分eventHandler和Effect。前者侧重于交互，是行为驱动；后者侧是数据驱动。
* 有个场景是需要在Effect里面列出dependency，但有些denpendency只是需要在effect里面读取数据，并不需要因为该数据的变化而重新开启一次effect。(如Connect里面的Effect可能有notify的功能，其需要感知theme弹出对应的对话框。但是theme的变化不应该引起reconnect）这种场景下，可以使用useEffectEvent来实现
* 该hook只能被Effect进行调用，在函数中可以读取state和prop的最新值。

### 10.27
https://react.dev/learn/lifecycle-of-reactive-effects
* 对于react组件来说，有mount, update, unmount这些生命周期。而effect只有sync和destroy两种状态。
* 从组件的视角来看，可能会将effect视作callback，如afterRenderCB和beforeUnMountCB，事实上， 尽量不要从组件的视角上看，不要依赖组件的生命周期，effect可能被多次启动和停止。
* 可以在deps添加依赖项，当依赖项发生变化时，会重新执行停止和启动的过程。不同的依赖项不要“杂糅”在一起，尽量剥离开。
* 哪些数据不可以作为依赖: location.path, ref.current（只一个可变容器，无法追踪?）
* 

### 10.23
1. https://react.dev/learn/synchronizing-with-effects

- 当组件已经渲染完毕后，需要额外进行函数调用时，使用effect？
- 需要关注Strict Mode 参数，development会渲染两次
- 对于异步请求如何处理？可以添加一个标志位，ignore，在接口返回时对比标志位。如果ignore是true，则不再执行后续操作。 (这里是否有现成的封装方法？)

### 10.20
1. https://react.dev/learn/manipulating-the-dom-with-refs
- useRef也可以是一个对象，不一定必须是dom
- 采用 useImperativeHandle 来限制ref对象的访问方法

### 10.15
1. https://react.dev/learn/referencing-values-with-refs （重要）

在使用state时，有时某些变量不需要参与render，但需要获取它的动态值，可以使用useRef。useRef的设置不会触发重新渲染，在获取值的时候也会获取实时的值而不是某个state tree的快照。

* 使用原则
如何区分何时使用state，何时使用ref呢？ <b>与 UI 无关但要跨渲染保存</b>

* 原理？
useRef的实现是维护一个useState变量，这个变量是个对象。直接修改ref.current，对象本身的引用不会发生变化。所以返回的ref，每次都能通过.current获取到最新的数据。
也正是因为ref的值不会发生变化，所以setter没有必要返回。
```
// Inside of React
function useRef(initialValue) {
  const [ref, unused] = useState({ current: initialValue });
  return ref;
}
```

* when to use
  - timer
  - dom引用
  - 与jsx渲染无关的变量

ps: 每个组件的ref只会初始化一次，如果不显示修改ref.current， ref始终是稳定的。下面的代码在send中无法获取到最新值，需要修改input的onChange函数才可以。思考下why
```js
import { useState, useRef } from 'react';

export default function Chat() {
  const [text, setText] = useState('');
  const testRef  = useRef(text);

  function handleSend() {
    setTimeout(() => {
      alert('Sending: ' + testRef.current);
    }, 3000);
  }

  return (
    <>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button
        onClick={handleSend}>
        Send
      </button>
    </>
  );
}

```


### 10.14
https://react.dev/learn/scaling-up-with-reducer-and-context （重点）

可以通过context + reducer 将组件进行合理分层。
* Data: Context，获取数据后存在context供子组件进行获取
* Logic-数据相关: reducer控制
* Logic-UI相关：在组件中控制
* UI：组件控制
对于针对特性场景的复杂业务组件可以采用这种架构模式。
好处是数据和展示分离，代码结构更清晰。
副作用是形成的“组件群”之间耦合会比较严重。对于子组件来说，依赖provider，相当于和Root组件有一条线关联起来了，不好复用于其他场景。


### 10.13
1. https://react.dev/learn/passing-data-deeply-with-context
本文讲述context的使用，可以支持跨组件进行数据传递。在顶层配置一个数据源，子组件均继承该数据源。
* store关注的是数据层的托管
* context会通过provider和useContext来定义一个松散的页面组织结构。有个特性是适应环境，意味着不管这个组件的位置如何改变，其用于展示的规则都会进行相应的适配（level场景）
* 类比于css的属性，会对子dom生效。子组件设置的属性优先级会更好(可以覆盖写入)；不同层级设定的不同属性彼此不会覆盖干扰。
* 什么情况下不应该使用context?
  * props传递较繁琐
  * 考虑是否可以通过直接抽取中间组件作为children进行传递？
* 使用场景
  * 主题
  * 当前账号
  * 路由
  * app级别的一些元信息
  


### 10.11
1. https://react.dev/learn/extracting-state-logic-into-a-reducer
useReducer hook，和array的reduce方法是类似的。通过定义一个函数，保留一个state状态，并在每次通过操作的action决定next state返回什么
下面的代码很有趣。
```js
import tasksReducer from './tasksReducer.js';

let initialState = [];
let actions = [
  {type: 'added', id: 1, text: 'Visit Kafka Museum'},
  {type: 'added', id: 2, text: 'Watch a puppet show'},
  {type: 'deleted', id: 1},
  {type: 'added', id: 3, text: 'Lennon Wall pic'},
];

let finalState = actions.reduce(tasksReducer, initialState);

const output = document.getElementById('output');
output.textContent = JSON.stringify(finalState, null, 2);
```
在看初始化语句
```
const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
```
在初始化时，通过对useReducer的调用，将reducer和initState传入。返回的disptch方法，是后续进行reduce操作的触发器。这个function在被调用时，其接收到的对象是一个“变更”，reducer内部维护的state + 本次变更，会产生一个新的state。这个新的state变化时，组件会重新渲染。类似useState, 组件重新渲染时，会获取到当前index hook所对应的值进行render。

一个Reducer，其实是维护了数据 + 变更。每次变更发起时，newState = State + Mutation -> 触发重新渲染。

什么时候适合使用useReducer而不是useState呢？ 
* 对state的操作很多，很重，且有重复？
* 逻辑梳理，相同于对state的变更进行了分类
* 每次对state的操作由dispatch触发，可以更好的观察state的变化，也会更容易debug

useReducer的最佳实践
* 纯函数，无副作用
* 和交互保持一致。

useReducer的实现
```
import { useState } from 'react';

export function useReducer(reducer, initialState) {
  const [state, setState] = useState(initialState);

  const dispatch = (mutation) => {
    setState(state => reducer(state, mutation))
  }

  return [state, dispatch];
}
```



### 10.10
1. https://react.dev/learn/preserving-and-resetting-state（重点）
React 在渲染UI时，会记录每个component的位置，并通过state进行初始化。如果识别出在相同的位置渲染了相同的组件，则会保留对应的state。
* It’s the same component at the same position。
* That’s because when React removes a component, it destroys its state.
* 对于定义在一个组件内部的子组件，每次该组件渲染时，都会重新加载子组件，这样会引起子组件的重新渲染，这是anti-pattern。建议将组件定义在topLevel, 或者添加useMemo。
* 对于同一个位置，但是不需要保留state，需要重新初始化组件，则可以通过设置一个key来重置state.
注意这个条件渲染, <Form/> re-render时是否会保留state?
```js
{showHint &&
        <p><i>Hint: Your favorite city?</i></p>
      }
      <Form />
``` 

### 10.9
1. https://react.dev/learn/sharing-state-between-components
* 本篇讨论在React中，组件之间如何共享状态。受控组件与非受控组件，指的是所需要控制的状态，是通过父组件传入props进行控制(受控组件)还是组件内部通过state进行维护(非受控组件)。这是从整体视角来看的。受控组件扩展性更强，但需要父组件需维护更多配置。
* 对于state在哪里维护没有统一标准，建议遵循"single of truth"，在哪里配置能够保证全局是唯一的、可信的数据源，那就在哪里维护。


### 9.30
1. https://react.dev/learn/choosing-the-state-structure 关于如何构造state的一些原则和建议
   * 总是一起出现，合并成一个数据 -> x, y -> [x，y]
   * 不同时维护语义相反的数据 -> isSent, isSending -> state: sending, sent
   * 不维护多余的数据 -> firstName, lastName, fullName(×) -> fullName = firstName + lastName
   * 不维护重复数据 -> items, selectedItem(×) -> selectedId
   * 避免深度嵌套 -> {x: {y: {z: 1}}} -> {z: {prop: 1, parent: y}}
### 9.29 
1. https://react.dev/learn/reacting-to-input-with-state 通过state描述式生成组件而不是命令式生成组件

### 9.28
1. https://react.dev/learn/updating-arrays-in-state 如object一样，array类型的数据也建议当做不可变对象来处理。
   1. array的“可变”操作：push(),pop(), "不可变"操作：filter(),map()
   2. 注意slice和splice区别。slice会复制array的一部分，splice会修改array（新增或者删除）
   3. 常用的增删改查的映射关系。push -> ..., splice -> slice, pop -> filter, modify -> ...; 或者使用useImmer实现。
<img width="814" height="288" alt="image" src="https://github.com/user-attachments/assets/214a71df-e998-452e-822e-819e4e51150f" />
2. 

### 9.26
1. https://react.dev/learn/updating-objects-in-state

   1. treat state as ready-only, 对于对象类型的state，每次使用新的对象直接替换而不是修改原对象的值。
   2. 可以通过https://github.com/immerjs/use-immer 来实现对嵌套对象里的深度属性进行修改。其原理是通过proxy监听变化key值，重新创建一个新的对象替换原来的。

   
### 9.25
1. https://react.dev/learn/queueing-a-series-of-state-update 
```
import { useState } from 'react';

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(number + 5);
        setNumber(n => n + 1);
        setNumber(42);
      }}>Increase the number</button>
    </>
  )
}
```
这篇主要讲batchUpdate，对于setState操作，会等页面上的事件触发完毕后，再进行rerender提升性能。这个称之为batching.
如果在setState的时候传入的是一个function，则会将该function放入一个queue依次执行，每次执行前获取到的数据是当前的state。看下面这个例子，n会从0 => 3.
```
setNumber(n => n + 1);
setNumber(n => n + 1);
setNumber(n => n + 1);

```

PS: 这里的challenge挺适合作为面试题考察基础。
challenge2的实现。

```
export function getFinalState(baseState, queue) {
  return queue.reduce((prev, cur) => (typeof cur  === 'function' ? cur(prev): cur), baseState)
}
```

问题
1. 批处理rerender的规则和时机是什么？
   在一个回调中，同步触发的setState会在event回调结束后批量执行并执行rerender. 对于异步的场景，会将setState添加到异步队列，在异步执行时，也会将异步里的代码批量执行后触发一次rerender。
   本质上是希望通过多个setState的执行减少rerender次数。


### 9.24
1. https://react.dev/learn/state-as-a-snapshot 深入了解state。
``` js
const [number, setNumber] = useState(0);
<button onClick={() => {
  setNumber(number + 1);
  setNumber(number + 1);
  setNumber(number + 1);
}}>+3</button>

<button onClick={() => {
        setNumber(number + 5);
        setTimeout(() => {
          alert(number); // 这里number依然是
        }, 3000);
      }}>+5</button>
```
对于这个代码来说，由于number在同一个渲染周期始终为InititalValue -> 0， 那么setNumber 执行三遍，number不会从0变成3.而是重复三遍0 -> 1.
setTimeout中的number也依然是0.

<b>A state variable’s value never changes within a render, even if its event handler’s code is asynchronous.</b>
React 中，每个渲染周期的状态都是 “快照”，一旦生成就不会在该周期内改变，哪怕执行了 setState 或异步操作


### 9.23
1. https://react.dev/learn/render-and-commit react的渲染流程，整体分为三步：trigger, render, commit。trigger一般来源于组件初始化和state变化；render时，首次创建dom，后续会按需更新； commit将dom的变化提交给browser

### 9.22
1. https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e 可视化说明useState原理


### 9.19
1. https://react.dev/learn/state-a-components-memory （重点）

* useState是react最基础的hook，返回值是个数组，第一个值是hook的值，第二个值是setter，setter会触发react的rerender，每次render时将store的值再次返回。
* `const [index, setIndex] = useState(0)` 首次加载时index为0, `setIndex(index+1)`触发二次渲染，返回index -> 2
* 为什么hook必须在最顶部，类似import申明，因为react识别具体的hook是通过index来识别的。如果有条件判断会影响
模拟实现useState
``` typescript
// useState.ts
const componentHooks: Record<number, [unknown, (nextState: unknown) => void]> = [];
let currentIndex = 0;

function updateDom() {}

const useState = (initialState: unknown): [unknown, (nextState: unknown) => void] => {
  let pair = componentHooks[currentIndex]; // 获取当前value和setter
  if (!pair) { 
    const setState = (nextState: unknown) => {
      pair[0] = nextState;
      updateDom();
    };
    pair = [initialState, setState]; // 如果不存在，则通过initialState初始化
    componentHooks[currentIndex] = pair; // 存入hooks数组
  }
  currentIndex++; // 将指针指向下个state
  return pair; // 返回state值和setter
};
```
* 最佳实践
   * 可以计算得出的state不要重复赋值，如firstName + lastName = fullName的情况
   * 如果有互斥的状态，可以考虑通过状态机来维护而不是通过两个状态的设置来判断，如 isSending, isSent
   * props传入的属性，不需要通过state再次维护。除非仅获取初始化，后续需要在当前组件自行维护。如initColor
 
### 9.18
1. https://react.dev/learn/responding-to-events 事件系统，基础知识复习
   * 不要重复维护数据，如有需要，可以维护id
   * <img width="475" height="242" alt="image" src="https://github.com/user-attachments/assets/a8d5732b-6b76-4d27-bd43-97a8ee6e8b2c" />
   * 避免使用深度嵌套，可以拍平数据，通过childId来进行关联
  

