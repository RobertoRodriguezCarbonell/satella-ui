---
'@satellatickets/ui': minor
'@satellatickets/core': minor
---

`FormField`, la etiqueta, la ayuda y el error de un control, enlazados con él para los lectores de pantalla. Envuelve un `Input`, un `TextArea` o un `Select`. Entra con madurez `experimental`.

- `label`, `help` y `error` son texto. Con `error`, el control se marca como inválido; `required` y `disabled` se propagan al control.
- En web usa `<label htmlFor>` y `aria-describedby`, y el error se anuncia al aparecer. En nativo el control toma la etiqueta como nombre accesible y el error y la ayuda como pista (ADR-037).
- `core` publica el contrato `FormFieldProps`, el contexto `FormFieldContext`, `createFormFieldValue`, `resolveFormFieldControl` y el hook `useFormFieldControl`, para que un control propio de una app se pueda enlazar igual.
