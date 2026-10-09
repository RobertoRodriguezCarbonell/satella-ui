/**
 * Coloca un elemento flotante bajo su ancla, o encima si debajo no cabe y arriba hay más
 * sitio, y lo mantiene ahí mientras la página se desplaza o cambia de tamaño. Lo saca a
 * la capa superior del navegador con la API Popover, como la lista de `Select` (ADR-042):
 * por encima de todo y sin que lo recorte ningún contenedor.
 *
 * La posición queda en dos variables del elemento, que su CSS aplica con
 * `position: fixed`, y en `data-side` (`top` o `bottom`):
 *
 *   --popover-left    borde izquierdo: el del ancla, o lo que haga falta para no
 *                     salirse de la ventana por la derecha
 *   --popover-offset  distancia del borde de la ventana al ancla, por el lado hacia el
 *                     que se abre
 *
 * Avisa con `onPressOutside` cuando se pulsa fuera de `boundary`, que contiene al ancla
 * y al elemento. Devuelve cómo deshacerlo todo.
 */
export function anchorPopover(
  anchor: HTMLElement,
  popup: HTMLElement,
  boundary: HTMLElement,
  onPressOutside: () => void,
): () => void {
  // En un navegador sin la API Popover se queda donde está, con `position: fixed`. Si ya
  // está en la capa superior (el modo estricto de React repite el efecto), no se repite.
  if (typeof popup.showPopover === 'function' && !popup.matches(':popover-open')) {
    popup.showPopover();
  }
  // El margen separa el elemento del ancla y del borde de la ventana.
  const margin = parseFloat(getComputedStyle(popup).marginTop) || 0;
  const { top, bottom } = anchor.getBoundingClientRect();
  const below = document.documentElement.clientHeight - bottom;
  const above = below < popup.offsetHeight + margin * 2 && top > below;

  const place = () => {
    const rect = anchor.getBoundingClientRect();
    const { clientWidth, clientHeight } = document.documentElement;
    const left = Math.max(margin, Math.min(rect.left, clientWidth - popup.offsetWidth - margin));
    popup.dataset.side = above ? 'top' : 'bottom';
    popup.style.setProperty('--popover-left', `${left}px`);
    popup.style.setProperty(
      '--popover-offset',
      `${above ? clientHeight - rect.top : rect.bottom}px`,
    );
  };
  place();

  const handlePointerDown = (event: PointerEvent) => {
    if (event.target instanceof Node && !boundary.contains(event.target)) onPressOutside();
  };
  const handleScroll = (event: Event) => {
    // Lo que se desplace dentro del propio elemento no mueve el ancla.
    if (event.target instanceof Node && popup.contains(event.target)) return;
    place();
  };
  document.addEventListener('pointerdown', handlePointerDown, true);
  window.addEventListener('scroll', handleScroll, true);
  window.addEventListener('resize', place);
  return () => {
    document.removeEventListener('pointerdown', handlePointerDown, true);
    window.removeEventListener('scroll', handleScroll, true);
    window.removeEventListener('resize', place);
  };
}
