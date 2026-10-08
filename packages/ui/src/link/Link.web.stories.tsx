import { linkUnderlines, type LinkPressEvent } from '@satellatickets/core';
import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Stack } from '../stack';
import { Link } from './Link';

/**
 * Historias solo web (ADR-012): estados que dependen de pseudo-clases CSS, del
 * teclado y de atributos del `<a>`. Las fuerza `storybook-addon-pseudo-states`, así
 * quedan fijas en el catálogo y en las referencias visuales.
 */
const meta = {
  title: 'Acciones/Link/Estados web',
  component: Link,
  parameters: { maturity: 'experimental' },
  args: {
    href: 'https://satellatickets.com/eventos',
    children: 'Ver todos los eventos',
    onPress: fn((event: LinkPressEvent) => event.preventDefault()),
  },
  decorators: [
    (Story) => (
      <Stack align="start">
        <Story />
      </Stack>
    ),
  ],
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

const matrix: NonNullable<Story['render']> = (args) => (
  <Stack direction="row" gap={5} align="center" wrap>
    {linkUnderlines.map((underline) => (
      <Link key={underline} {...args} underline={underline}>
        {`Subrayado ${underline}`}
      </Link>
    ))}
  </Stack>
);

/** `always` engrosa el subrayado; `hover` lo muestra. */
export const Hover: Story = {
  parameters: { pseudo: { hover: true } },
  render: matrix,
};

/** Mientras se pulsa toma el color del texto principal. */
export const Pulsado: Story = {
  parameters: { pseudo: { active: true } },
  render: matrix,
};

/** El anillo de foco solo aparece al navegar con teclado, y siempre con subrayado. */
export const Foco: Story = {
  parameters: { pseudo: { focusVisible: true } },
  render: matrix,
};

/** Se enfoca con Tab y se activa con Intro, como cualquier `<a>`. */
export const Teclado: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const link = canvas.getByRole('link', { name: 'Ver todos los eventos' });
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onPress).toHaveBeenCalledOnce();
  },
};

/** Con `target="_blank"` añade `rel="noopener noreferrer"`: la página abierta no puede manipular esta. */
export const NuevaPestana: Story = {
  args: { target: '_blank', children: 'Condiciones del recinto' },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Condiciones del recinto' });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  },
};

/** `onPress` no se llama si el clic lleva un modificador: ahí manda el navegador. */
export const ClicConModificador: Story = {
  play: async ({ args, canvas }) => {
    const link = canvas.getByRole('link', { name: 'Ver todos los eventos' });
    // El evento se cancela aquí para que el navegador no abra una pestaña durante el test.
    link.addEventListener('click', (event) => event.preventDefault(), { once: true });
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, metaKey: true }));
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};
