import React from 'react';
import useCounterStore from '../store/useCounterStore';

function Counter() {
  const { count, increase, decrease, reset } = useCounterStore();

  return (
    <div>
      <h1>Counter</h1>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
      <button onClick={decrease}>Decrease</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

export default Counter;
