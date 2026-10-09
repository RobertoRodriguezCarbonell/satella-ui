/**
 * Llama a `done` cuando terminan las animaciones que el elemento tiene en marcha. Sirve
 * para las salidas (ADR-043): el CSS arranca la animación al marcar el elemento con
 * `data-closing` y la vista espera a que acabe para quitarlo de la pantalla.
 *
 * Si no hay ninguna (el usuario ha pedido reducir el movimiento), llama en el momento.
 * Devuelve cómo cancelarlo, por si el elemento vuelve a abrirse a media salida.
 */
export function afterAnimations(element: Element, done: () => void): () => void {
  const running = element.getAnimations();
  if (running.length === 0) {
    done();
    return () => undefined;
  }
  let cancelled = false;
  void Promise.allSettled(running.map((animation) => animation.finished)).then(() => {
    if (!cancelled) done();
  });
  return () => {
    cancelled = true;
  };
}
