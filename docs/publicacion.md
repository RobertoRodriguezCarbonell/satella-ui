# Publicación en npm

Los paquetes `@satellatickets/tokens`, `@satellatickets/core` y `@satellatickets/ui` se publican desde GitHub Actions con [trusted publishing](https://docs.npmjs.com/trusted-publishers): sin tokens en el repositorio y con atestación de procedencia. Las decisiones están en ADR-021, ADR-022 y ADR-031.

## Publicar una versión

1. Cada cambio llega a `main` con su changeset (`pnpm changeset`).
2. `release.yml` crea o actualiza la PR **"Version Packages"**, que sube las versiones y escribe los `CHANGELOG.md`.
3. Al fusionar esa PR, `release.yml` compila, comprueba los paquetes (`pnpm check:packages`), los publica en npm y crea las etiquetas y las releases de GitHub.

No hay que ejecutar nada a mano.

## Arranque: la primera vez

npm solo deja configurar un trusted publisher en un paquete que ya existe, así que la primera versión de cada paquete la sube una persona. Se hace una sola vez.

### 1. Cuenta y organización

- En [npmjs.com](https://www.npmjs.com), crea la organización **`satellatickets`**. El plan gratuito basta para paquetes públicos.
- Activa la verificación en dos pasos en tu cuenta. npm la exige para publicar y para gestionar trusted publishers.

### 2. Licencia

Los `package.json` declaran `MIT`, pero el repositorio no tiene fichero `LICENSE`. Confirma la licencia y añade el fichero antes de publicar.

### 3. Versión de arranque `0.0.0`

En `main` actualizado, con la PR "Version Packages" todavía sin fusionar:

```bash
npm login
pnpm install
pnpm build
pnpm check:packages
pnpm changeset publish --no-git-tag
```

`changeset publish` sube los tres paquetes en su versión actual, `0.0.0`, porque todavía no existen en el registro. npm pedirá el segundo factor en cada uno. Después, márcalas como obsoletas para que nadie las instale:

```bash
for p in tokens core ui; do
  npm deprecate "@satellatickets/$p@0.0.0" "Versión de arranque. Usa la 0.1.0 o posterior."
done
```

### 4. Trusted publisher

En npmjs.com, para **cada uno de los tres paquetes**: Settings → Trusted Publisher → GitHub Actions.

| Campo                | Valor                       |
| -------------------- | --------------------------- |
| Organization or user | `RobertoRodriguezCarbonell` |
| Repository           | `satella-ui`                |
| Workflow filename    | `release.yml`               |
| Environment name     | vacío                       |
| Allowed actions      | marca **`npm publish`**     |

Changesets todavía no admite la publicación por etapas (`npm stage publish`), por eso hace falta el permiso `npm publish`.

Una configuración nueva caduca si no publica en **dos días**: haz este paso justo antes del siguiente.

Con npm 11.15 o posterior también se puede hacer desde la terminal:

```bash
for p in tokens core ui; do
  npm trust github "@satellatickets/$p" \
    --repo RobertoRodriguezCarbonell/satella-ui --file release.yml --allow-publish
done
```

### 5. Publicar la `0.1.0`

Fusiona la PR **"Version Packages"**. `release.yml` publica la `0.1.0` de los tres paquetes. Comprueba el resultado:

```bash
npm view @satellatickets/ui version dist-tags
```

En la página de cada paquete en npm debe aparecer la insignia de procedencia.

### 6. Cerrar la puerta a los tokens

En los ajustes de cada paquete, en "Publishing access", elige la opción que exige verificación en dos pasos y no admite tokens. A partir de ahí solo puede publicar el workflow.

## Si la publicación falla

- **`ENEEDAUTH`**: el nombre del workflow configurado en npm no coincide con `release.yml`, o el trusted publisher ha caducado. Bórralo y créalo de nuevo.
- **El campo `repository` no coincide**: npm exige que `repository.url` del `package.json` sea exactamente el repositorio de GitHub.
- **Falla `pnpm check:packages`**: el paquete no se publica. Reproduce el fallo en local con ese mismo comando; `KEEP=1` conserva la app de prueba para inspeccionarla.

Tras corregir el problema, vuelve a ejecutar el workflow fallido desde la pestaña Actions: publica las versiones que aún no estén en el registro.
