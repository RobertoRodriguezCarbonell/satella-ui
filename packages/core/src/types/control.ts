/**
 * Alturas de los controles interactivos de una línea (`Input`, `Select`). Coinciden
 * con `size.control` de los tokens y con los tamaños de `Button`, para que un campo y
 * un botón del mismo tamaño queden alineados en una fila.
 */
export const controlSizes = ['sm', 'md', 'lg'] as const;
export type ControlSize = (typeof controlSizes)[number];
