### 9.18
1. https://react.dev/learn/responding-to-events 事件系统，基础知识复习

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
   * 不要重复维护数据，如有需要，可以维护id
   * <img width="475" height="242" alt="image" src="https://github.com/user-attachments/assets/a8d5732b-6b76-4d27-bd43-97a8ee6e8b2c" />
   * 避免使用深度嵌套，可以拍平数据，通过childId来进行关联
   * 

