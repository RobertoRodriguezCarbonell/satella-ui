# ADR-037: Formularios: estado controlado opcional y `FormField` por contexto

**Estado:** Aceptado
**Fecha:** 2026-10-08

## Contexto

La Fase 5.2 añade los controles de formulario: `Input`, `TextArea`, `Checkbox`, `Switch`, `Select` y `FormField`. Antes de escribirlos hay que fijar tres cosas que afectan a todos, porque cambiarlas después sería un breaking change en seis componentes a la vez:

- Cómo se llama el evento de cambio. Web entrega un evento del DOM (`onChange` con `event.target.value`); React Native entrega el valor (`onChangeText`, `onValueChange`). Una API única no puede exponer ninguno de los dos objetos de evento.
- Si el estado lo guarda la app o el componente.
- Cómo llega la etiqueta, la ayuda y el error de `FormField` al control que envuelve. En web se enlazan con `id`, `htmlFor` y `aria-describedby`; en nativo no existe ese mecanismo y el lector de pantalla lee `accessibilityLabel` y `accessibilityHint` del propio control.

## Decisión

**Eventos con el valor, no con el evento.** Cada control avisa con el valor nuevo y un nombre que dice qué cambia:

| Control | Valor | Evento |
|---|---|---|
| `Input`, `TextArea` | `value: string` | `onChangeText(text)` |
| `Checkbox`, `Switch` | `checked: boolean` | `onCheckedChange(checked)` |
| `Select` | `value: string` | `onValueChange(value)` |

**Controlado o no, a elección de la app.** Todos aceptan el valor (`value` o `checked`) y su versión inicial (`defaultValue` o `defaultChecked`). Con el valor, manda la app; solo con el inicial, el componente guarda el estado. La lógica vive una vez en `core`, en el hook `useControllableState`.

**`FormField` habla con su control por contexto.** `FormField` recibe `label`, `help` y `error` como texto y los publica en un contexto de `core`. `Input`, `TextArea` y `Select` lo leen con `useFormFieldControl`:

- En web el control toma el `id` que `FormField` usa en su `<label htmlFor>`, y enlaza ayuda y error con `aria-describedby`.
- En nativo el control usa la etiqueta como `accessibilityLabel` y la ayuda y el error como `accessibilityHint`.
- En los dos, un `error` marca el control como inválido y `disabled` y `required` se propagan.

Fuera de un `FormField` los controles funcionan igual, con sus propias props (`invalid`, `disabled`, `accessibilityLabel`).

`Checkbox` y `Switch` llevan su propia etiqueta como `children` y no dependen de `FormField`.

## Alternativas descartadas

- **Exponer `onChange` con el evento de cada plataforma.** Las apps tendrían que escribir el manejador dos veces, que es justo lo que la librería evita.
- **Solo controlados.** Obliga a declarar estado para cada campo aunque la app lea el formulario al enviarlo, y en web impide usar un `<form>` sin JavaScript.
- **`FormField` clonando a su hijo para inyectarle props.** Se rompe en cuanto el control va envuelto en otro elemento, y no funciona con componentes que no reenvían esas props.
- **Que cada control reciba `label`, `help` y `error`.** Repite la misma maquetación en tres componentes y obliga a tocar los tres para cambiarla.
- **`label` como contenido libre (`ReactNode`).** En nativo la etiqueta tiene que ser texto para servir de `accessibilityLabel`.

## Consecuencias

- La misma pantalla de formulario se escribe una vez para web y nativo.
- El estado no controlado funciona en un `<form>` web sin código adicional: los controles web aceptan `name`.
- `FormField` solo admite texto en la etiqueta, la ayuda y el error. Un enlace dentro de la ayuda no es posible por ahora.
- Un control nuevo que deba vivir dentro de `FormField` solo tiene que llamar a `useFormFieldControl`.
- No hay validación: la librería pinta el error que la app le da. Qué librería de formularios usar es decisión de cada app.
