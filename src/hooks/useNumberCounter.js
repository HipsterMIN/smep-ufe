import { useState, useEffect, useRef } from 'react';

/**
 * 숫자가 0부터 목표값까지 증가하는 애니메이션 효과를 주는 Hook
 * @param {number} targetNumber - 목표 숫자
 * @param {number} duration - 애니메이션 지속 시간 (ms)
 * @param {boolean} start - 애니메이션 시작 여부
 */
export const useNumberCounter = (targetNumber, duration = 1000, start = true) => {
  const [count, setCount] = useState(0);
  const frameRef = useRef(0);
  const startTimeRef = useRef(0);

  useEffect(() => {
    if (!start || targetNumber === 0) {
      setCount(targetNumber);
      return;
    }

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      
      // 진행률 (0 ~ 1)
      const percentage = Math.min(progress / duration, 1);
      
      // Easing 함수 (easeOutExpo) 적용 가능
      // const ease = 1 - Math.pow(2, -10 * percentage);
      
      setCount(Math.floor(targetNumber * percentage));

      if (progress < duration) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(targetNumber);
      }
    };

    setCount(0);
    startTimeRef.current = 0;
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [targetNumber, duration, start]);

  return count;
};
