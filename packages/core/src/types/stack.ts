import type { BoxProps, SpaceToken } from './box';

export const stackDirections = ['column', 'row'] as const;
export type StackDirection = (typeof stackDirections)[number];

export const stackAligns = ['stretch', 'start', 'center', 'end'] as const;
export type StackAlign = (typeof stackAligns)[number];

export const stackJustifies = ['start', 'center', 'end', 'between', 'around'] as const;
export type StackJustify = (typeof stackJustifies)[number];

/** `Box` con layout flex: dirección, separación y alineación. */
export interface StackProps extends BoxProps {
  direction?: StackDirection | undefined;
  gap?: SpaceToken | undefined;
  align?: StackAlign | undefined;
  justify?: StackJustify | undefined;
  wrap?: boolean | undefined;
}
