---
'@satellatickets/ui': minor
---

Más componentes entran y salen con una transición, con las mismas duraciones y curvas en web y en móvil (ADR-043).

- `Modal` aparece y desaparece con un fundido también en web, junto con su fondo. En móvil ya lo hacía.
- `Toast` se va con un fundido al cerrarse, en web y en nativo. Antes solo animaba la entrada.
- La lista de `Select` en web aparece y desaparece con un fundido corto.
- Las animaciones que ya había (`Sheet`, el indicador de `Tabs`, la entrada de `Toast`) toman su curva de los tokens `easing` nuevos en lugar de llevarla escrita.

Con movimiento reducido en los ajustes del sistema, nada de esto se anima.

Un `Modal`, un toast o una lista cerrados siguen en pantalla lo que dura su salida, hasta 150 ms, sin poder pulsarse. El toast y la lista dejan de existir para los lectores de pantalla en el momento, así que un test que los busque por su rol no cambia. Un test que compruebe que un `Modal` ha desaparecido nada más cerrarlo en web tiene que esperar (`waitFor`).
