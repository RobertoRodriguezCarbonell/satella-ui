---
'@satellatickets/ui': minor
'@satellatickets/core': minor
---

Componente nuevo: `Pagination`, para moverse entre las páginas de un listado. Entra como `experimental` en el grupo **Datos** (ADR-045).

```tsx
<Pagination
  page={page}
  pageCount={12}
  onPageChange={setPage}
  accessibilityLabel="Páginas de pedidos"
  previousLabel="Página anterior"
  nextLabel="Página siguiente"
  getPageLabel={(number) => `Página ${number}`}
/>
```

- Anterior, siguiente y los números de página. Si no caben todos, quedan la primera, la última, la actual y sus vecinas (`siblingCount`), con un salto donde se omiten varias. El número de elementos no cambia al pasar de página, así que los botones no se mueven bajo el puntero.
- Controlada con `page`, o con estado propio a partir de `defaultPage`. Las páginas empiezan en 1.
- Dos tamaños, `sm` y `md`, y `disabled` para mientras llega la página pedida.
- No sabe nada de los datos: acompaña a una `Table` o a cualquier otra lista.
- En web es un `<nav>` con una lista de botones y `aria-current="page"` en la actual. Los nombres accesibles los da la app.

`core` exporta el contrato (`PaginationProps`), `paginationSizes` y las funciones que deciden qué páginas se muestran: `getPaginationItems` y `clampPage`.
