---
'@satellatickets/ui': minor
'@satellatickets/core': minor
---

Componente nuevo: `Calendar`, un mes en una rejilla para elegir una fecha o un periodo. Entra como `experimental` en un grupo nuevo del catálogo, **Fechas** (ADR-046).

```tsx
<Calendar
  locale="es"
  value={date}
  onValueChange={setDate}
  previousMonthLabel="Mes anterior"
  nextMonthLabel="Mes siguiente"
/>
```

- Las fechas son textos ISO (`'2026-10-09'`), sin hora ni zona horaria: lo que se guarda es el día que el usuario ha pulsado, en cualquier parte del mundo. Sin fecha, la cadena vacía.
- `mode="range"` elige un periodo `{ start, end }`: una pulsación fija el inicio y la siguiente el final, en el orden que sea. Mientras falta el final, se adelanta hasta el día sobre el que está el puntero o el foco.
- Límites con `min` y `max`, días sueltos con `isDateDisabled`, y `isDateMarked` para señalar con un punto los días que tienen algo.
- Los nombres de los meses y los días los escribe `Intl` en el idioma de `locale`, que es obligatorio. La semana empieza en lunes (`weekStartsOn`).
- El mes que se ve es controlable (`month`, `onMonthChange`), y `today` fija el día que se destaca como hoy.
- En web sigue el patrón de rejilla de fechas de ARIA: un solo día en el orden de tabulación, flechas para moverse, Inicio y Fin, RePág y AvPág para cambiar de mes y, con Mayúsculas, de año.
- Dos tamaños, `sm` y `md`.

`core` exporta el contrato (`CalendarProps`, `DateRange`), el hook `useCalendar` con toda la lógica, y las funciones de fechas sobre texto ISO: `todayISO`, `addDays`, `addMonths`, `shiftMonth`, `toISODate`, `parseISODate`, `isISODate`, `toMonth`, `getMonthWeeks`, `getNextRange`, `isDateInRange`, `createCalendarFormatter` y las demás que usan las vistas.
