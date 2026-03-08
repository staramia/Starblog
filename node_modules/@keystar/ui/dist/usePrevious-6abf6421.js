import { c } from './react-compiler-runtime-19061925.js';
import { useRef, useEffect } from 'react';

/**
 * Tracks the previous value of a variable.
 *
 * This is useful for comparing the previous value of some prop or state to the
 * current value, and taking action based on the change.
 */
function usePrevious(value) {
  const $ = c(2);
  const ref = useRef(undefined);
  let t0;
  if ($[0] !== value) {
    t0 = () => {
      ref.current = value;
    };
    $[0] = value;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  useEffect(t0);
  return ref.current;
}

export { usePrevious as u };
