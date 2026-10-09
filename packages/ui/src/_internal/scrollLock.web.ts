/** Cuántos diálogos piden ahora mismo que la página no se desplace. */
let locks = 0;
let restore: (() => void) | undefined;

/**
 * Impide que la página se desplace mientras hay un diálogo modal abierto (ADR-044): el
 * navegador deja inerte lo de detrás, pero la rueda y el dedo lo siguen moviendo.
 * Devuelve cómo soltarlo. Con varios diálogos a la vez, la página vuelve a desplazarse
 * cuando se cierra el último.
 */
export function lockScroll(): () => void {
  locks += 1;
  if (locks === 1) {
    const root = document.documentElement;
    const { overflow, paddingRight } = root.style;
    // Lo que ocupa la barra de desplazamiento, si la hay y no flota sobre el contenido.
    const scrollbar = window.innerWidth - root.clientWidth;
    root.style.overflow = 'hidden';
    // Al quitar la barra, la página ganaría ese ancho y todo daría un salto.
    if (scrollbar > 0) {
      root.style.paddingRight = `calc(${getComputedStyle(root).paddingRight} + ${scrollbar}px)`;
    }
    restore = () => {
      root.style.overflow = overflow;
      root.style.paddingRight = paddingRight;
    };
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks -= 1;
    if (locks === 0) {
      restore?.();
      restore = undefined;
    }
  };
}
