---
'@satellatickets/ui': minor
'@satellatickets/core': minor
---

Componente nuevo: `Table`, una tabla de datos para los listados de un panel. Entra como `experimental` en un grupo nuevo del catálogo, **Datos** (ADR-045).

```tsx
<Table
  accessibilityLabel="Pedidos"
  columns={[
    {
      key: 'id',
      header: 'Pedido',
      rowHeader: true,
      sortable: true,
      cell: (order) => `#${order.id}`,
    },
    {
      key: 'total',
      header: 'Total',
      align: 'end',
      sortable: true,
      cell: (order) => euros(order.total),
    },
  ]}
  rows={orders}
  getRowKey={(order) => order.id}
  sort={sort}
  onSortChange={setSort}
/>
```

- Guiada por columnas: cada una dice cómo se llama y cómo se pinta su celda, que puede ser texto o cualquier componente. Alineación, ancho fijo o mínimo, cabecera oculta para las columnas de acciones y celda que identifica a la fila (`rowHeader`).
- Pinta las filas que recibe y en ese orden: no ordena ni pagina. Una columna `sortable` avisa con `onSortChange` del orden que se pide, y la app devuelve las filas ya ordenadas.
- Selección con `selectable`: una casilla por fila y otra en la cabecera, con estado intermedio. `selectedKeys` guarda las claves, también las de otras páginas.
- `loading` sustituye las filas por huecos; `empty` es lo que se ve cuando no hay ninguna.
- Dos densidades, `sm` y `md`.
- En web es un `<table>` real que se desplaza en horizontal dentro de su contenedor cuando no cabe. En React Native es una rejilla en la que cada columna mide lo mismo en todas las filas, también con desplazamiento horizontal, y cada celda de texto se anuncia con el nombre de su columna.

`core` exporta el contrato (`TableProps`, `TableColumn`, `TableSort`), las constantes `tableSizes`, `tableAligns` y `sortDirections`, y la lógica que usan las vistas: `getNextSort`, `getSelectionState`, `toggleSelectedKey`, `toggleAllSelected` y `getColumnWidths`.

`Icon` tiene cuatro iconos nuevos: `arrow-up`, `arrow-down`, `chevrons-up-down` y `ellipsis`.
