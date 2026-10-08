---
'@satellatickets/ui': minor
'@satellatickets/core': minor
---

`Tabs`, para cambiar entre varias vistas del mismo nivel sin salir de la página. Entra con madurez `experimental`.

- `items` es una lista de `{ value, label, icon?, disabled?, content? }`. Con `content`, `Tabs` pinta el panel de la pestaña elegida; sin él, solo las pestañas, y la app decide qué mostrar.
- Controlado con `value` o no controlado con `defaultValue`; avisa con `onValueChange(value)`. Empieza en la primera pestaña habilitada.
- En web sigue el patrón de pestañas de ARIA: solo la elegida está en el orden de tabulación y las flechas, Inicio y Fin se mueven entre ellas saltando las deshabilitadas. Si no caben, la lista se desplaza en horizontal.
- `core` publica los contratos `TabsProps` y `TabItem`, y las funciones `getTabInDirection` y `firstEnabledTab`.
