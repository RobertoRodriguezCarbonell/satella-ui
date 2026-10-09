import type { SortDirection } from '@satellatickets/core';

import type { IconName } from '../icon/Icon.types';

// Mapa exhaustivo (ADR-014), común a las dos vistas: la flecha apunta hacia donde crecen
// los valores al bajar por la columna.
export const sortIcon = {
  ascending: 'arrow-up',
  descending: 'arrow-down',
} satisfies Record<SortDirection, IconName>;

/** Una columna que se puede ordenar pero por la que ahora no se ordena. */
export const unsortedIcon = 'chevrons-up-down' satisfies IconName;
