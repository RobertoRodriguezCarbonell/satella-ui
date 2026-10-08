import {
  linkUnderlines,
  textColors,
  textVariants,
  type LinkPressEvent,
} from '@satellatickets/core';
import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Stack } from '../stack';
import { Text } from '../text';
import { Link } from './Link';

const meta = {
  title: 'Acciones/Link',
  component: Link,
  parameters: { maturity: 'experimental' },
  argTypes: {
    variant: { control: 'select', options: [undefined, ...textVariants] },
    color: { control: 'select', options: textColors },
    underline: { control: 'radio', options: linkUnderlines },
  },
  args: {
    href: 'https://satellatickets.com/eventos',
    children: 'Ver todos los eventos',
    // Las historias no navegan: cancelan la navegación por defecto, igual que una app
    // que navega con su propio router.
    onPress: fn((event: LinkPressEvent) => event.preventDefault()),
  },
  // El enlace ocupa lo que mide su texto, igual en web y en nativo.
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

/** Al pulsarlo llama a `onPress` una vez, antes de navegar. */
export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('link', { name: 'Ver todos los eventos' }));
    await expect(args.onPress).toHaveBeenCalledOnce();
  },
};

/** Dentro de un `Text` hereda su tipografía y fluye con el párrafo. */
export const EnTexto: Story = {
  render: (args) => (
    <Stack gap={3}>
      <Text>
        {'Al comprar aceptas los '}
        <Link {...args} href="https://satellatickets.com/terminos">
          términos y condiciones
        </Link>
        {' y la '}
        <Link {...args} href="https://satellatickets.com/privacidad">
          política de privacidad
        </Link>
        .
      </Text>
      <Text variant="caption" color="muted">
        {'¿Algún problema con tu entrada? '}
        <Link {...args} href="https://satellatickets.com/ayuda">
          Escríbenos
        </Link>
        .
      </Text>
    </Stack>
  ),
};

/**
 * `always` es lo correcto dentro de un párrafo: el color solo no basta para distinguir
 * un enlace. `hover` es para enlaces sueltos, donde ya se entiende que lo son.
 */
export const Subrayado: Story = {
  render: (args) => (
    <Stack gap={3} align="start">
      {linkUnderlines.map((underline) => (
        <Link key={underline} {...args} underline={underline}>
          {`Subrayado ${underline}`}
        </Link>
      ))}
    </Stack>
  ),
};

/** Fuera de un `Text` usa `body`; con `variant` toma la tipografía de esa variante. */
export const Tipografia: Story = {
  render: (args) => (
    <Stack gap={3} align="start">
      {(['subheading', 'body', 'bodySmall', 'caption', 'label'] as const).map((variant) => (
        <Link key={variant} {...args} variant={variant}>
          {`Variante ${variant}`}
        </Link>
      ))}
    </Stack>
  ),
};

/** Los colores de texto: `link` por defecto; `secondary` o `muted` para pies y menús. */
export const Colores: Story = {
  render: (args) => (
    <Stack direction="row" gap={4} align="center" wrap>
      {(['link', 'primary', 'secondary', 'muted'] as const).map((color) => (
        <Link key={color} {...args} color={color}>
          {color}
        </Link>
      ))}
    </Stack>
  ),
};

/** Los dos modos de subrayado en cada color. */
export const AllVariants: Story = {
  render: (args) => (
    <Stack gap={5}>
      {linkUnderlines.map((underline) => (
        <Stack key={underline} gap={2}>
          <Text variant="label" color="muted">
            {underline}
          </Text>
          <Stack direction="row" gap={4} align="center" wrap>
            {(['link', 'primary', 'secondary', 'muted'] as const).map((color) => (
              <Link key={color} {...args} underline={underline} color={color}>
                {color}
              </Link>
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  ),
};
