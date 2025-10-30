const componentHooks: Record<number, [unknown, (nextState: unknown) => void]> = [];
let currentIndex = 0;

function updateDom() {}

const useState = (initialState: unknown): [unknown, (nextState: unknown) => void] => {
  let pair = componentHooks[currentIndex];
  if (pair) {
    currentIndex++;
    return pair;
  }
  const setState = (nextState: unknown) => {
    pair[0] = nextState;
    updateDom();
  };
  pair = [initialState, setState];
  componentHooks[currentIndex] = pair;
  currentIndex++;
  return pair;
};

const useStateV2 = (initialState: unknown): [unknown, (nextState: unknown) => void] => {
  let pair = componentHooks[currentIndex];
  if (!pair) {
    const setState = (nextState: unknown) => {
      pair[0] = nextState;
      updateDom();
    };
    pair = [initialState, setState];
    componentHooks[currentIndex] = pair;
  }
  currentIndex++;
  return pair;
};
