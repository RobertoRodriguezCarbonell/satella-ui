/**
 * Regresión visual (ADR-016, ADR-030): después de cada historia, y solo si la
 * comprobación visual está activa, se captura la historia y se compara con su
 * referencia. La accesibilidad y las funciones `play` ya han corrido antes,
 * dentro de la propia historia.
 */
import { STORY_RENDERED } from 'storybook/internal/core-events';
import { addons } from 'storybook/preview-api';
import { afterEach, expect, inject } from 'vitest';
import { page } from 'vitest/browser';

declare module 'vitest' {
  interface ProvidedContext {
    /** `true` en CI: las referencias solo valen en el entorno donde se generan. */
    visual: boolean;
    theme: string;
  }
}

interface TestedStory {
  id: string;
  parameters: Record<string, unknown>;
}

/** El mismo `data-testid` que pone el decorador de preview.tsx alrededor de cada historia. */
const STORY_ROOT_TEST_ID = 'sb-story';

const visual = inject('visual');
const theme = inject('theme');

function kebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * `storybook-addon-pseudo-states` reescribe las hojas de estilo cuando Storybook avisa de
 * que la historia se ha renderizado y pone sus clases en `#storybook-root`. Aquí las
 * historias se ejecutan como tests, sin ese aviso y sin esa raíz, así que se hacen
 * a mano los dos pasos para `parameters.pseudo = { hover: true, … }`.
 */
function forcePseudoStates(story: TestedStory, root: Element): void {
  const states = Object.entries((story.parameters.pseudo ?? {}) as Record<string, unknown>)
    .filter(([, value]) => value === true)
    .map(([state]) => state);
  if (states.length === 0) return;
  addons.getChannel().emit(STORY_RENDERED, story.id);
  for (const state of states) root.classList.add(`pseudo-${kebab(state)}-all`);
}

afterEach(async (context) => {
  if (!visual) return;
  const story = (context as { story?: TestedStory }).story;
  // Sin historia no hay nada que capturar; si el test ya ha fallado, la captura solo añade ruido.
  if (story === undefined || context.task.result?.state === 'fail') return;
  // Una historia puede excluirse con `parameters: { visual: false }` si no es determinista.
  if (story.parameters.visual === false) return;

  const root = page.getByTestId(STORY_ROOT_TEST_ID);
  forcePseudoStates(story, root.element());
  await document.fonts.ready;
  await expect.element(root).toMatchScreenshot(`${story.id}-${theme}`);
});
