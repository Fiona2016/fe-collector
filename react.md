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
1. https://react.dev/learn/state-a-components-memory

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
  

