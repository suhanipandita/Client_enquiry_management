import { useEffect, useState } from 'react';

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || target == null) { 
      setValue(target ?? 0); 
      return; 
    }
    
    let raf, start;
    const tick = (now) => {
      if (start === undefined) start = now;
      const t = Math.min((now - start) / duration, 1);
      // Ease out cubic
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  
  return value;
}

function Stat({ label, value, format = (n) => n.toLocaleString('en-IN') }) {
  const shown = useCountUp(value ?? 0);
  return (
    <div className="stat">
      <div className="stat-value">{value == null ? '—' : format(shown)}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default Stat;