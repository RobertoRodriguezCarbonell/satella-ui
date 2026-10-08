# ADR-038: `Select` usa el `<select>` del navegador en web y una lista modal en nativo

**Estado:** Aceptado
**Fecha:** 2026-10-08

## Contexto

`Select` deja elegir una opción de una lista. Ninguna de las dos plataformas lo pone fácil:

- En web existe `<select>`, accesible y con el comportamiento correcto en cada sistema (en un móvil abre el selector del sistema), pero su lista desplegable no se puede estilar. La alternativa, un desplegable propio con el patrón ARIA de `listbox`, exige gestionar foco, teclado, posicionamiento y lectores de pantalla, y es de las piezas donde más fallan las librerías.
- React Native ya no trae ningún selector: el antiguo `Picker` se movió al paquete `@react-native-picker/picker`, que incluye código nativo.

La librería no añade dependencias que una app tenga que instalar y enlazar sin un motivo fuerte (CLAUDE.md §2, ADR-033).

## Decisión

- **Web:** `Select` renderiza un `<select>` real con sus `<option>`. Se estila la caja cerrada, igual que un `Input`, con el icono `chevron-down`. La lista abierta es la del navegador.
- **Nativo:** `Select` renderiza un disparador con aspecto de `Input` que abre una lista modal propia, hecha con `Modal`, `ScrollView` y `Pressable` de React Native. Al elegir una opción se cierra. Se cierra también tocando fuera o con el botón atrás de Android.
- La lista modal es interna de `Select`. No es todavía el `Modal` ni el `Sheet` públicos de la Fase 5.4.

El contrato es el mismo: `options` como lista de `{ value, label, disabled? }`, `value`, `defaultValue`, `onValueChange` y `placeholder`.

## Alternativas descartadas

- **Desplegable propio en web.** Permite estilar la lista, pero hay que reimplementar lo que `<select>` da hecho, y en móvil es peor que el selector del sistema. Se puede reconsiderar si hace falta búsqueda o selección múltiple: sería un componente distinto (`Combobox`).
- **`@react-native-picker/picker` en nativo.** Es una dependencia con código nativo que cada app tendría que instalar, y su aspecto no se puede alinear con los tokens.
- **`ActionSheetIOS` en iOS.** Solo existe en iOS y no admite listas largas ni una opción marcada.

## Consecuencias

- En web, la accesibilidad y el comportamiento en móvil son los del navegador, sin código propio.
- En web la lista abierta no sigue el tema de la librería; usa el del sistema. `color-scheme` la mantiene oscura en el tema oscuro.
- En nativo la lista sigue los tokens, y `Select` no añade dependencias.
- Cuando existan `Modal` y `Sheet` (Fase 5.4), la lista modal de `Select` puede pasar a usarlos sin cambiar su API.
- Opciones agrupadas, búsqueda y selección múltiple quedan fuera.
