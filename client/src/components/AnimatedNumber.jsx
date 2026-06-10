import { useEffect, useRef, useState } from 'react';

/**
 * Smoothly animates a numeric value when it changes.
 * @param {{value: number, prefix?: string, suffix?: string, decimals?: number, duration?: number, className?: string}} props
 */
export default function AnimatedNumber({ value = 0, prefix = '', suffix = '', decimals = 2, duration = 1000, className = '' }) {
  const [displayValue, setDisplayValue] = useState(value);
  const animationRef = useRef(null);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const start = performance.now();
    const from = previousValueRef.current;
    const to = Number(value) || 0;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const nextValue = from + (to - from) * progress;
      setDisplayValue(nextValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step);
      } else {
        previousValueRef.current = to;
      }
    }

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  return <span className={className}>{`${prefix}${Number(displayValue || 0).toFixed(decimals)}${suffix}`}</span>;
}
