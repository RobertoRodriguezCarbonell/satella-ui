# ADR-022: CI/CD con GitHub Actions, publint y trusted publishing

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Todo lo verificable debe verificarse automáticamente en cada PR, y la publicación debe ser automática y segura, sin credenciales de larga duración en el repositorio.

## Decisión

**`ci.yml`**, en cada pull request y push a `main`:

```
lint → typecheck → test:unit (core, tokens) → test:web (historias en Chromium) → test:native (Jest) → build → publint
```

- Turborepo con caché remota: solo se ejecuta lo afectado por el cambio.
- Playwright con Chromium instalado para los tests web; las referencias visuales se generan y comparan aquí (ADR-016).
- `publint` valida los `package.json` de los paquetes publicados.
- Informe de tamaño de bundle por paquete, con alerta si crece por encima de un umbral.

**`release.yml`**, en cada push a `main`: la action oficial de Changesets crea o actualiza la PR "Version Packages" y, cuando esa PR se mergea, publica los paquetes.

**Publicación segura:**

- **Trusted publishing** de npm: el workflow se autentica contra el registro mediante OIDC (`permissions: id-token: write`). No existe ningún `NPM_TOKEN` en el repositorio.
- **Provenance** activado (`--provenance`): cada paquete lleva una atestación que lo enlaza con el commit y la ejecución de CI exacta.
- Cada paquete publicado se registra en npm con el workflow `release.yml` del repositorio como único publicador de confianza.

**`storybook.yml`**, en cada push a `main`: build de `storybook-web` y despliegue como sitio estático (GitHub Pages o equivalente). Es la documentación pública.

**Local:** hook de pre-commit (lint-staged) con lint y typecheck de los ficheros cambiados.

## Alternativas descartadas

- **Token de npm como secreto de GitHub.** Credencial de larga duración que puede filtrarse; sin provenance.
- **Publicar desde local.** No reproducible, sin atestación, propenso a publicar con el árbol sucio.

## Consecuencias

- Requiere repositorio público (ADR-023) y npm ≥ 11.5 en el job de release para el handshake OIDC; como Node 22 trae un npm anterior, el job instala `npm@latest` antes de publicar.
- La primera publicación de cada paquete requiere configurar el trusted publisher en npm (ROADMAP Fase 4).
