export { Skeleton } from './Skeleton';
// Las props propias de la plataforma: `SkeletonWebProps` en web, `SkeletonNativeProps`
// en nativo. Cada vista exporta las suyas, así los tipos de una plataforma no arrastran
// los de la otra.
export type * from './Skeleton';
export type { SkeletonProps } from './Skeleton.types';
