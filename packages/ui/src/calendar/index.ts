export { Calendar } from './Calendar';
// Las props propias de la plataforma: `CalendarWebProps` en web, `CalendarNativeProps` en
// nativo. Cada vista exporta las suyas, así los tipos de una plataforma no arrastran los
// de la otra.
export type * from './Calendar';
export type {
  CalendarMode,
  CalendarProps,
  CalendarSize,
  DateRange,
  Weekday,
} from './Calendar.types';
