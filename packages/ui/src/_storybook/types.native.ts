// Tipos de Storybook para las historias compartidas (ADR-012). Versión nativa.
// @storybook/react-native reexporta estos mismos tipos de @storybook/react; se importan
// de ahí para no arrastrar sus peers nativos como devDependency de ui.
export type { Decorator, Meta, StoryObj } from '@storybook/react';
