# Publicación en npm

Los paquetes `@satellatickets/tokens`, `@satellatickets/core` y `@satellatickets/ui` se publican desde GitHub Actions con [trusted publishing](https://docs.npmjs.com/trusted-publishers): sin tokens en el repositorio y con atestación de procedencia. Las decisiones están en ADR-021, ADR-022 y ADR-031.

## Publicar una versión

1. Cada cambio llega a `main` con su changeset (`pnpm changeset`).
2. `release.yml` crea o actualiza la PR **"Version Packages"**, que sube las versiones y escribe los `CHANGELOG.md`.
3. Al fusionar esa PR, `release.yml` compila, comprueba los paquetes (`pnpm check:packages`), los publica en npm y crea las etiquetas y las releases de GitHub.

No hay que ejecutar nada a mano.

## Arranque: la primera vez

npm solo deja configurar un trusted publisher en un paquete que ya existe, así que la primera versión de cada paquete la sube una persona. Se hace una sola vez por paquete.

Los tres paquetes actuales pasaron por aquí el 8 de octubre de 2026. La sección queda como referencia para [un paquete nuevo](#añadir-un-paquete-nuevo).

### 1. Cuenta y organización

- En [npmjs.com](https://www.npmjs.com), crea la organización **`satellatickets`**. El plan gratuito basta para paquetes públicos.
- Activa la verificación en dos pasos en tu cuenta: Account → Two-Factor Authentication → Enable 2FA. npm la exige para publicar y para gestionar trusted publishers.
- El segundo factor tiene que ser una llave de seguridad o una passkey (Touch ID, Windows Hello, una llave física). npm ya no deja dar de alta apps de códigos como Google Authenticator o Microsoft Authenticator.
- Guarda los códigos de recuperación fuera del dispositivo donde vive la llave. Son la única forma de recuperar la cuenta, y usar uno bloquea la publicación durante 72 horas.

### 2. Licencia

La librería se publica bajo licencia MIT. El fichero `LICENSE` está en la raíz y en cada paquete, y `pnpm check:packages` comprueba que viaja en los `.tgz`. Antes de publicar, revisa que el titular del copyright es el que quieres.

### 3. Versión de arranque `0.0.0`

En `main` actualizado, con la PR "Version Packages" todavía sin fusionar:

```bash
npm login
pnpm install
pnpm build
pnpm check:packages
pnpm changeset publish --no-git-tag
```

`changeset publish` sube los tres paquetes en su versión actual, `0.0.0`, porque todavía no existen en el registro. npm pide el segundo factor en cada uno: muestra una dirección, se abre en el navegador y se confirma con la llave. La casilla que lo omite durante cinco minutos evita repetirlo.

Un paquete recién creado tarda unos minutos en aparecer: hasta entonces `npm view` responde 404. npm añade por su cuenta una versión `0.0.0-stage`, un marcador temporal que no afecta a `latest`.

Después, márcalas como obsoletas para que nadie las instale:

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
| Allowed actions      | marca **`npm publish`**; deja `npm dist-tag` sin marcar |

Changesets todavía no admite la publicación por etapas (`npm stage publish`), por eso hace falta el permiso `npm publish` aunque npm lo marque como no recomendado. `npm dist-tag` no hace falta: el flujo nunca ejecuta ese comando.

Los campos no se pueden editar después de guardar. Si hay una errata, se borra la conexión y se crea de nuevo.

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

## Añadir un paquete nuevo

Un paquete publicable nuevo necesita su propio arranque antes de fusionar la PR "Version Packages" que lo incluya: publicar su primera versión a mano (paso 3) y configurar su trusted publisher (paso 4). Sin eso, `release.yml` falla al llegar a ese paquete.

Desde octubre de 2026 `npm stage publish` puede crear paquetes nuevos sin esa publicación manual, pero Changesets todavía no lo usa.

## Si la publicación falla

- **`E403` con "Two-factor authentication or granular access token with bypass 2fa enabled is required"**, al publicar a mano: la cuenta no tiene la verificación en dos pasos activada. `npm profile get` puede decir lo contrario; la señal fiable es este error. Actívala (paso 1 del arranque) y repite el comando.
- **`ENEEDAUTH`**: el nombre del workflow configurado en npm no coincide con `release.yml`, o el trusted publisher ha caducado. Bórralo y créalo de nuevo.
- **El campo `repository` no coincide**: npm exige que `repository.url` del `package.json` sea exactamente el repositorio de GitHub.
- **Falla `pnpm check:packages`**: el paquete no se publica. Reproduce el fallo en local con ese mismo comando; `KEEP=1` conserva la app de prueba para inspeccionarla.

Tras corregir el problema, vuelve a ejecutar el workflow fallido desde la pestaña Actions: publica las versiones que aún no estén en el registro.
