import type { ModalPresentation } from '@satellatickets/core';
import { useEffect, useId, useMemo, useRef, type MouseEvent, type SyntheticEvent } from 'react';

import { cx } from '../_internal/cx';
import { mergeRefs } from '../_internal/mergeRefs';
import { IconButton } from '../icon-button/IconButton';
import styles from './Modal.module.css';
import type { ModalDialogWebProps } from './Modal.types';

// Mapa exhaustivo (ADR-014): una presentación nueva en `core` no compila hasta que
// tenga aquí su clase.
const presentationClass = {
  dialog: styles.dialog,
  sheet: styles.sheet,
} satisfies Record<ModalPresentation, string | undefined>;

/**
 * La implementación que comparten `Modal` y `Sheet` (ADR-040): un `<dialog>` real
 * abierto con `showModal()`. El foco, la inercia del fondo y el apilamiento los
 * resuelve el navegador.
 */
export function ModalDialog({
  presentation,
  open,
  onClose,
  title,
  description,
  closeLabel,
  dismissible = true,
  footer,
  className,
  style,
  testID,
  ref,
  children,
}: ModalDialogWebProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const setRef = useMemo(() => mergeRefs(dialog, ref), [ref]);
  const titleId = useId();
  const descriptionId = useId();

  // `open` lo decide la app; `showModal()` y `close()` son la forma de decírselo al navegador.
  useEffect(() => {
    const element = dialog.current;
    if (element === null) return;
    if (open && !element.open) element.showModal();
    else if (!open && element.open) element.close();
  }, [open]);

  // Escape y los demás gestos de cierre del navegador (el botón atrás en Android).
  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    // Sin esto el navegador lo cerraría por su cuenta, sin que la app cambie `open`.
    event.preventDefault();
    if (dismissible) onClose();
  }

  // Algo de dentro lo ha cerrado sin pasar por la app, por ejemplo un `<form method="dialog">`.
  function handleNativeClose() {
    if (open) onClose();
  }

  // El fondo (`::backdrop`) pertenece al `<dialog>`: un clic cuyo destino es el propio
  // elemento, y no algo de dentro, es un clic fuera.
  function handleClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget && dismissible) onClose();
  }

  const hasBody = children !== undefined && children !== null;
  const hasFooter = footer !== undefined && footer !== null;

  return (
    // El clic en el fondo es un atajo de puntero: con teclado se cierra con Escape, que
    // el navegador entrega como `cancel`.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
    <dialog
      ref={setRef}
      className={cx(styles.root, presentationClass[presentation], className)}
      style={style}
      aria-labelledby={titleId}
      aria-describedby={description === undefined ? undefined : descriptionId}
      data-testid={testID}
      onCancel={handleCancel}
      onClose={handleNativeClose}
      onClick={handleClick}
    >
      {/* El contenido solo existe mientras está abierto. */}
      {open ? (
        <>
          <div className={styles.header}>
            <div className={styles.titles}>
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
              {description === undefined ? null : (
                <p id={descriptionId} className={styles.description}>
                  {description}
                </p>
              )}
            </div>
            {closeLabel === undefined ? null : (
              <IconButton
                icon="x"
                label={closeLabel}
                size="sm"
                variant="ghost"
                onPress={onClose}
                className={styles.close}
              />
            )}
          </div>
          {hasBody ? <div className={styles.body}>{children}</div> : null}
          {hasFooter ? <div className={styles.footer}>{footer}</div> : null}
        </>
      ) : null}
    </dialog>
  );
}
