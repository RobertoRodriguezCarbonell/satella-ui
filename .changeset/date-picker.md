---
'@satellatickets/ui': minor
'@satellatickets/core': minor
---

Componente nuevo: `DatePicker`, un campo de formulario que muestra una fecha y abre un `Calendar` para elegirla. Entra como `experimental` en el grupo **Fechas** (ADR-046).

```tsx
<FormField label="Fecha del evento">
  <DatePicker
    locale="es"
    value={date}
    onValueChange={setDate}
    placeholder="Elige una fecha"
    previousMonthLabel="Mes anterior"
    nextMonthLabel="Mes siguiente"
  />
</FormField>
```

- La fecha es un texto ISO (`'2026-10-09'`); la cadena vacía es sin fecha. En el campo se escribe en el idioma de `locale` ("9 oct 2026").
- Se enlaza con `FormField` como los demás controles, y tiene los tamaños de un campo (`sm`, `md`, `lg`), `disabled`, `invalid` y `required`.
- Acepta los mismos límites y días señalados que `Calendar`: `min`, `max`, `isDateDisabled`, `isDateMarked`.
- En web, el calendario se pinta en la capa superior del navegador, bajo el campo o encima si no cabe, igual que la lista de `Select`. Al abrirse el foco pasa al día elegido; elegir un día cierra y devuelve el foco al campo, y Escape, pulsar fuera o salir con el tabulador cierran sin cambiar nada. Con `name`, la fecha viaja en un `<form>`.
- En React Native, el calendario se abre en la hoja inferior de `Sheet`.
- Elige una sola fecha. Para un periodo, `Calendar` con `mode="range"`.

`core` exporta el contrato, `DatePickerProps`.
