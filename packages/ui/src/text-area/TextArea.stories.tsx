import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { FormField } from '../form-field';
import { Stack } from '../stack';
import { Text } from '../text';
import { TextArea } from './TextArea';

const meta = {
  title: 'Formularios/TextArea',
  component: TextArea,
  parameters: { maturity: 'experimental' },
  argTypes: {
    rows: { control: { type: 'number', min: 1, max: 10 } },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: {
    // Sin `FormField`, el campo necesita su propio nombre accesible.
    accessibilityLabel: 'Comentario',
    placeholder: 'Cuéntanos qué ha pasado',
    rows: 3,
    onChangeText: fn(),
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Avisa con el texto completo en cada cambio. */
export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Comentario' });
    await userEvent.type(textarea, 'No me ha llegado la entrada.');
    await expect(textarea).toHaveValue('No me ha llegado la entrada.');
    await expect(args.onChangeText).toHaveBeenLastCalledWith('No me ha llegado la entrada.');
  },
};

/** `rows` fija cuántas líneas se ven sin desplazarse. */
export const Filas: Story = {
  render: (args) => (
    <Stack gap={3}>
      {[2, 5].map((rows) => (
        <TextArea
          key={rows}
          {...args}
          rows={rows}
          accessibilityLabel={`Comentario de ${rows} líneas`}
          placeholder={`${rows} líneas`}
        />
      ))}
    </Stack>
  ),
};

/** Inválido: borde de error y `aria-invalid`. El mensaje lo pone `FormField`. */
export const Invalido: Story = {
  args: { invalid: true, defaultValue: 'Hola' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Comentario' })).toBeInvalid();
  },
};

/** Deshabilitado no se puede enfocar ni editar. */
export const Deshabilitado: Story = {
  args: { disabled: true, defaultValue: 'No me ha llegado la entrada.' },
  play: async ({ args, canvas, userEvent }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Comentario' });
    await expect(textarea).toBeDisabled();
    await userEvent.type(textarea, 'x');
    await expect(args.onChangeText).not.toHaveBeenCalled();
  },
};

/** Solo lectura: se puede enfocar y copiar, pero no editar. */
export const SoloLectura: Story = {
  args: { readOnly: true, defaultValue: 'No me ha llegado la entrada.' },
  play: async ({ args, canvas, userEvent }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Comentario' });
    await userEvent.type(textarea, 'x');
    await expect(textarea).toHaveValue('No me ha llegado la entrada.');
    await expect(args.onChangeText).not.toHaveBeenCalled();
  },
};

/** Dentro de un `FormField` toma su etiqueta, su ayuda y su error. */
export const EnFormField: Story = {
  args: { accessibilityLabel: undefined },
  render: (args) => (
    <FormField
      label="Motivo de la devolución"
      help="Cuanto más detalle, antes podremos ayudarte."
      error="Escribe al menos una frase."
    >
      <TextArea {...args} defaultValue="Hola" />
    </FormField>
  ),
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Motivo de la devolución' });
    await expect(textarea).toBeInvalid();
    await expect(textarea).toHaveAccessibleDescription(
      'Cuanto más detalle, antes podremos ayudarte. Escribe al menos una frase.',
    );
  },
};

/** Todos los estados. */
export const AllVariants: Story = {
  render: (args) => (
    <Stack gap={4}>
      {(
        [
          ['Vacío', {}],
          ['Con valor', { defaultValue: 'No me ha llegado la entrada al correo.' }],
          ['Inválido', { invalid: true, defaultValue: 'Hola' }],
          ['Solo lectura', { readOnly: true, defaultValue: 'No me ha llegado la entrada.' }],
          ['Deshabilitado', { disabled: true, defaultValue: 'No me ha llegado la entrada.' }],
        ] as const
      ).map(([name, props]) => (
        <Stack key={name} gap={1}>
          <Text variant="label" color="muted">
            {name}
          </Text>
          <TextArea {...args} {...props} rows={2} accessibilityLabel={name} />
        </Stack>
      ))}
    </Stack>
  ),
};
