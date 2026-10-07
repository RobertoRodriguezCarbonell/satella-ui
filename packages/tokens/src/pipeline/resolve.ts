/**
 * Resolución de un conjunto de ficheros DTCG con Style Dictionary v5 (ADR-006):
 * fusión de ficheros, herencia de `$type` desde los grupos y resolución de
 * referencias `{grupo.token}`. Las transformaciones a cada plataforma no se
 * delegan en Style Dictionary: las hace `values.ts` sobre el valor DTCG resuelto.
 */
import StyleDictionary from 'style-dictionary';
import type { DesignTokens } from 'style-dictionary/types';

import {
  EXTENSION_KEY,
  isSupportedType,
  type ResolvedToken,
  type TokenExtensions,
  type TokenMap,
} from './model.ts';

export interface TokenSetFiles {
  /** Ficheros base; los de `source` pueden sobrescribirlos sin aviso de colisión. */
  include?: readonly string[];
  source: readonly string[];
}

interface RawToken {
  $value?: unknown;
  $type?: unknown;
  $description?: unknown;
  $extensions?: Record<string, unknown>;
  path?: unknown;
  filePath?: unknown;
  isSource?: unknown;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function readExtensions(
  extensions: Record<string, unknown> | undefined,
): TokenExtensions | undefined {
  const own = extensions?.[EXTENSION_KEY];
  if (own === undefined) return undefined;
  if (typeof own !== 'object' || own === null) {
    throw new Error(`$extensions["${EXTENSION_KEY}"] debe ser un objeto.`);
  }
  return own;
}

export async function resolveTokenSet(files: TokenSetFiles): Promise<TokenMap> {
  // init: false + init(): así un error de Style Dictionary (colisiones, referencias rotas) se
  // propaga como rechazo en vez de quedar como rechazo no gestionado que cuelga el build.
  // verbosity "verbose" no añade ruido cuando todo va bien y detalla qué referencia falla.
  const sd = new StyleDictionary(
    {
      include: [...(files.include ?? [])],
      source: [...files.source],
      usesDtcg: true,
      hooks: {
        parsers: {
          'dtcg-json': {
            pattern: /\.tokens\.json$/,
            parser: ({ contents }) => {
              // `$schema` es metadato del fichero, no un grupo de tokens.
              const data = JSON.parse(contents) as DesignTokens;
              delete data.$schema;
              return data;
            },
          },
        },
      },
      parsers: ['dtcg-json'],
      platforms: { raw: { transforms: [] } },
      log: { verbosity: 'verbose', warnings: 'error' },
    },
    { init: false },
  );
  await sd.init();
  const dictionary = await sd.getPlatformTokens('raw');

  const tokens: TokenMap = new Map();
  for (const raw of dictionary.allTokens as unknown as RawToken[]) {
    if (!isStringArray(raw.path) || raw.path.length === 0) {
      throw new Error('Style Dictionary devolvió un token sin ruta.');
    }
    const name = raw.path.join('.');
    if (!isSupportedType(raw.$type)) {
      throw new Error(
        `${name}: tipo "${String(raw.$type)}" no soportado. Tipos válidos: color, dimension, fontFamily, fontWeight, duration, number, shadow.`,
      );
    }
    const token: ResolvedToken = {
      name,
      path: raw.path,
      type: raw.$type,
      value: raw.$value,
      isSource: raw.isSource === true,
      filePath: typeof raw.filePath === 'string' ? raw.filePath : '',
    };
    if (typeof raw.$description === 'string') token.description = raw.$description;
    const extensions = readExtensions(raw.$extensions);
    if (extensions) token.extensions = extensions;
    tokens.set(name, token);
  }
  return tokens;
}
