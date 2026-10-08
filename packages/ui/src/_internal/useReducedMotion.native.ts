import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * `true` si el usuario ha pedido reducir el movimiento en los ajustes del sistema. Es
 * el equivalente nativo de `@media (prefers-reduced-motion: reduce)` en web.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      // Solo se actualiza si cambia: el valor inicial ya es `false`.
      if (mounted && enabled) setReduced(true);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}
