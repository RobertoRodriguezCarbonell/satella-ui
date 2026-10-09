/**
 * Generado por scripts/generate.ts a partir de svg/*.svg. No editar a mano.
 * Iconos de Lucide (https://lucide.dev), licencia ISC; ver NOTICE.md.
 */

export type IconElement =
  | { readonly type: 'path'; readonly d: string }
  | { readonly type: 'circle'; readonly cx: number; readonly cy: number; readonly r: number }
  | { readonly type: 'line'; readonly x1: number; readonly y1: number; readonly x2: number; readonly y2: number }
  | {
      readonly type: 'rect';
      readonly x: number;
      readonly y: number;
      readonly width: number;
      readonly height: number;
      readonly rx?: number;
    };

/** Caja de dibujo de todos los iconos (lucide): 24×24, trazo de 2 px, sin relleno. */
export const ICON_VIEWBOX = 24;
export const ICON_STROKE_WIDTH = 2;

export const iconNames = [
  "arrow-down",
  "arrow-left",
  "arrow-right",
  "arrow-up",
  "calendar",
  "check",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "chevron-up",
  "chevrons-up-down",
  "circle-alert",
  "circle-check",
  "circle-x",
  "ellipsis",
  "eye-off",
  "eye",
  "globe",
  "info",
  "loader-circle",
  "map-pin",
  "menu",
  "minus",
  "plus",
  "search",
  "settings",
  "ticket",
  "triangle-alert",
  "user",
  "x",
] as const;

export type IconName = (typeof iconNames)[number];

export const icons: Readonly<Record<IconName, readonly IconElement[]>> = {
  "arrow-down": [
    {"type":"path","d":"M12 5v14"},
    {"type":"path","d":"m19 12-7 7-7-7"},
  ],
  "arrow-left": [
    {"type":"path","d":"m12 19-7-7 7-7"},
    {"type":"path","d":"M19 12H5"},
  ],
  "arrow-right": [
    {"type":"path","d":"M5 12h14"},
    {"type":"path","d":"m12 5 7 7-7 7"},
  ],
  "arrow-up": [
    {"type":"path","d":"m5 12 7-7 7 7"},
    {"type":"path","d":"M12 19V5"},
  ],
  "calendar": [
    {"type":"path","d":"M8 2v3"},
    {"type":"path","d":"M16 2v3"},
    {"type":"rect","x":3,"y":3,"width":18,"height":18,"rx":2},
    {"type":"path","d":"M3 9h18"},
  ],
  "check": [
    {"type":"path","d":"M20 6 9 17l-5-5"},
  ],
  "chevron-down": [
    {"type":"path","d":"m6 9 6 6 6-6"},
  ],
  "chevron-left": [
    {"type":"path","d":"m15 18-6-6 6-6"},
  ],
  "chevron-right": [
    {"type":"path","d":"m9 18 6-6-6-6"},
  ],
  "chevron-up": [
    {"type":"path","d":"m18 15-6-6-6 6"},
  ],
  "chevrons-up-down": [
    {"type":"path","d":"m7 15 5 5 5-5"},
    {"type":"path","d":"m7 9 5-5 5 5"},
  ],
  "circle-alert": [
    {"type":"circle","cx":12,"cy":12,"r":10},
    {"type":"line","x1":12,"y1":8,"x2":12,"y2":12},
    {"type":"line","x1":12,"y1":16,"x2":12.01,"y2":16},
  ],
  "circle-check": [
    {"type":"circle","cx":12,"cy":12,"r":10},
    {"type":"path","d":"m16 9-5.5 5.5L8 12"},
  ],
  "circle-x": [
    {"type":"circle","cx":12,"cy":12,"r":10},
    {"type":"path","d":"m15 9-6 6"},
    {"type":"path","d":"m9 9 6 6"},
  ],
  "ellipsis": [
    {"type":"circle","cx":12,"cy":12,"r":1},
    {"type":"circle","cx":19,"cy":12,"r":1},
    {"type":"circle","cx":5,"cy":12,"r":1},
  ],
  "eye-off": [
    {"type":"path","d":"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"},
    {"type":"path","d":"M14.084 14.158a3 3 0 0 1-4.242-4.242"},
    {"type":"path","d":"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"},
    {"type":"path","d":"m2 2 20 20"},
  ],
  "eye": [
    {"type":"path","d":"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"},
    {"type":"circle","cx":12,"cy":12,"r":3},
  ],
  "globe": [
    {"type":"circle","cx":12,"cy":12,"r":10},
    {"type":"path","d":"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"},
    {"type":"path","d":"M2 12h20"},
  ],
  "info": [
    {"type":"circle","cx":12,"cy":12,"r":10},
    {"type":"path","d":"M12 16v-4"},
    {"type":"path","d":"M12 8h.01"},
  ],
  "loader-circle": [
    {"type":"path","d":"M21 12a9 9 0 1 1-6.219-8.56"},
  ],
  "map-pin": [
    {"type":"path","d":"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"},
    {"type":"circle","cx":12,"cy":10,"r":3},
  ],
  "menu": [
    {"type":"path","d":"M4 5h16"},
    {"type":"path","d":"M4 12h16"},
    {"type":"path","d":"M4 19h16"},
  ],
  "minus": [
    {"type":"path","d":"M5 12h14"},
  ],
  "plus": [
    {"type":"path","d":"M5 12h14"},
    {"type":"path","d":"M12 5v14"},
  ],
  "search": [
    {"type":"path","d":"m21 21-4.34-4.34"},
    {"type":"circle","cx":11,"cy":11,"r":8},
  ],
  "settings": [
    {"type":"path","d":"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"},
    {"type":"circle","cx":12,"cy":12,"r":3},
  ],
  "ticket": [
    {"type":"path","d":"M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"},
    {"type":"path","d":"M13 5v2"},
    {"type":"path","d":"M13 17v2"},
    {"type":"path","d":"M13 11v2"},
  ],
  "triangle-alert": [
    {"type":"path","d":"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"},
    {"type":"path","d":"M12 9v4"},
    {"type":"path","d":"M12 17h.01"},
  ],
  "user": [
    {"type":"path","d":"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"},
    {"type":"circle","cx":12,"cy":7,"r":4},
  ],
  "x": [
    {"type":"path","d":"M18 6 6 18"},
    {"type":"path","d":"m6 6 12 12"},
  ],
};
