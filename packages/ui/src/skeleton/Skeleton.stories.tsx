import { skeletonShapes, textVariants } from '@satellatickets/core';
import { expect } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Box } from '../box';
import { Stack } from '../stack';
import { Text } from '../text';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Feedback/Skeleton',
  component: Skeleton,
  parameters: { maturity: 'experimental' },
  argTypes: {
    shape: { control: 'radio', options: skeletonShapes },
    variant: { control: 'select', options: textVariants },
    lines: { control: { type: 'number', min: 1, max: 6 } },
    width: { control: 'text' },
    height: { control: 'number' },
  },
  args: { shape: 'text', variant: 'body', lines: 1 },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Es decorativo: los lectores de pantalla lo ignoran. Que la zona carga lo dice quien lo contiene. */
export const Default: Story = {
  args: { testID: 'skeleton' },
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('skeleton')).toHaveAttribute('aria-hidden', 'true');
  },
};

/** `text` para una línea, `rectangle` para una imagen o un control, `circle` para un avatar. */
export const Formas: Story = {
  render: () => (
    <Stack gap={4}>
      {skeletonShapes.map((shape) => (
        <Stack key={shape} gap={2}>
          <Text variant="label" color="muted">
            {shape}
          </Text>
          <Skeleton shape={shape} />
        </Stack>
      ))}
    </Stack>
  ),
};

/** Con varias líneas, la última es más corta, como el final de un párrafo. */
export const Lineas: Story = {
  args: { lines: 3 },
};

/**
 * En `text`, cada línea ocupa lo mismo que una línea de `Text` de esa variante: al
 * llegar el contenido, nada se mueve.
 */
export const VariantesDeTexto: Story = {
  render: () => (
    <Stack gap={4}>
      {(['title', 'body', 'caption'] as const).map((variant) => (
        <Stack key={variant} gap={0}>
          <Text variant={variant}>{`Texto ${variant}`}</Text>
          <Skeleton variant={variant} width="60%" />
        </Stack>
      ))}
    </Stack>
  ),
};

/** `width` admite puntos o un porcentaje del contenedor; `height`, puntos. */
export const Medidas: Story = {
  render: () => (
    <Stack gap={3}>
      <Skeleton shape="rectangle" height={120} />
      <Skeleton shape="rectangle" width="50%" height={32} />
      <Skeleton shape="circle" height={64} />
      <Skeleton width={160} />
    </Stack>
  ),
};

/** El hueco de una tarjeta de evento mientras carga: imagen, título, dos líneas y un botón. */
export const Composicion: Story = {
  render: () => (
    <Box background="surface" padding={4} radius="lg" borderColor="default">
      <Stack gap={4}>
        <Skeleton shape="rectangle" height={140} />
        <Stack direction="row" gap={3} align="center">
          <Skeleton shape="circle" />
          <Box flex={1}>
            <Skeleton variant="subheading" width="70%" />
            <Skeleton variant="caption" width="40%" />
          </Box>
        </Stack>
        <Skeleton lines={2} />
        <Skeleton shape="rectangle" width={160} />
      </Stack>
    </Box>
  ),
};

/** Todas las formas. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={5}>
      <Stack gap={2}>
        <Text variant="label" color="muted">
          text
        </Text>
        <Skeleton />
        <Skeleton lines={3} />
        <Skeleton variant="title" width="50%" />
      </Stack>
      <Stack gap={2}>
        <Text variant="label" color="muted">
          rectangle
        </Text>
        <Skeleton shape="rectangle" />
        <Skeleton shape="rectangle" height={96} />
      </Stack>
      <Stack gap={2}>
        <Text variant="label" color="muted">
          circle
        </Text>
        <Stack direction="row" gap={3} align="center">
          <Skeleton shape="circle" height={32} />
          <Skeleton shape="circle" />
          <Skeleton shape="circle" height={64} />
        </Stack>
      </Stack>
    </Stack>
  ),
};
