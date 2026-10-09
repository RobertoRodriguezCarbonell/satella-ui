import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Pagination } from './Pagination';

/**
 * Historias solo web (ADR-012): estados que dependen de pseudo-clases CSS, del teclado y
 * de las medidas del navegador. Las fuerza `storybook-addon-pseudo-states`, así quedan
 * fijas en el catálogo y en las referencias visuales.
 */
const meta = {
  title: 'Datos/Pagination/Estados web',
  component: Pagination,
  parameters: { maturity: 'experimental' },
  args: {
    pageCount: 12,
    defaultPage: 6,
    accessibilityLabel: 'Páginas de pedidos',
    previousLabel: 'Página anterior',
    nextLabel: 'Página siguiente',
    getPageLabel: (page: number) => `Página ${page}`,
    onPageChange: fn(),
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/** La página actual no reacciona al puntero: ya estás en ella. */
export const Hover: Story = {
  parameters: { pseudo: { hover: true } },
};

export const Pulsado: Story = {
  parameters: { pseudo: { active: true } },
};

export const Foco: Story = {
  parameters: { pseudo: { focusVisible: true } },
};

/** Cada botón es una parada de tabulación, en orden de lectura. Intro y Espacio lo activan. */
export const Teclado: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const page = (number: number) => canvas.getByRole('button', { name: `Página ${number}` });
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Página anterior' })).toHaveFocus();
    await userEvent.tab();
    await expect(page(1)).toHaveFocus();
    // El salto no es un control: del 1 se pasa al 5.
    await userEvent.tab();
    await expect(page(5)).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onPageChange).toHaveBeenLastCalledWith(5);
    // El foco sigue en la página elegida aunque cambien los números de alrededor.
    await expect(page(5)).toHaveFocus();
    await expect(page(5)).toHaveAttribute('aria-current', 'page');
    await userEvent.tab({ shift: true });
    await expect(page(4)).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(args.onPageChange).toHaveBeenLastCalledWith(4);
  },
};

/**
 * El número de elementos es el mismo esté donde esté la página actual, y el salto mide lo
 * que un botón: al avanzar, el botón de siguiente no se mueve de debajo del puntero.
 */
export const Estable: Story = {
  args: { defaultPage: 1 },
  play: async ({ canvas, userEvent }) => {
    const next = canvas.getByRole('button', { name: 'Página siguiente' });
    const left = next.getBoundingClientRect().left;
    for (let step = 0; step < 11; step += 1) {
      await userEvent.click(next);
      await expect(next.getBoundingClientRect().left).toBeCloseTo(left, 0);
    }
    await expect(canvas.getByRole('button', { name: 'Página 12' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};

/** Es una lista dentro de un `<nav>`: los lectores de pantalla dicen cuántos elementos tiene. */
export const Semantica: Story = {
  play: async ({ canvas }) => {
    const nav = canvas.getByRole('navigation', { name: 'Páginas de pedidos' });
    await expect(nav.tagName).toBe('NAV');
    // Anterior, siete elementos y siguiente; los dos saltos están ocultos.
    await expect(nav.querySelectorAll('li')).toHaveLength(9);
    await expect(nav.querySelectorAll('li[aria-hidden="true"]')).toHaveLength(2);
    await expect(canvas.getAllByRole('button')).toHaveLength(7);
  },
};
