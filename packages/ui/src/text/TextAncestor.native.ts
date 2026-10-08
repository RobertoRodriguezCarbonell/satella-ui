import { createContext } from 'react';

/**
 * `true` dentro de un `Text` de la librería. React Native propaga la tipografía de un
 * `Text` a los `Text` que contiene; `Link` lo consulta para heredarla en vez de fijar
 * la suya. En web no hace falta: CSS ya hereda.
 */
export const TextAncestorContext = createContext(false);
