export { Tabs } from './Tabs';
// Las props propias de la plataforma: `TabsWebProps` en web, `TabsNativeProps` en nativo.
// Cada vista exporta las suyas, así los tipos de una plataforma no arrastran los de la otra.
export type * from './Tabs';
export type { TabItem, TabsProps } from './Tabs.types';
