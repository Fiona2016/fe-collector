### 9.18
1. https://react.dev/learn/responding-to-events 事件系统，基础知识复习

### 9.19
1. https://react.dev/learn/state-a-components-memory

* useState是react最基础的hook，返回值是个数组，第一个值是hook的值，第二个值是setter，setter会触发react的rerender，每次render时将store的值再次返回。
* `const [index, setIndex] = useState(0)` 首次加载时index为0, `setIndex(index+1)`触发二次渲染，返回index -> 2
* 为什么hook必须在最顶部，类似import申明，因为react识别具体的hook是通过index来识别的。如果有条件判断会影响
* 
   
